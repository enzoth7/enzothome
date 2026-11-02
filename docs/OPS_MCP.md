# MCP de Operaciones

Este servidor local permite consultar los datos de Operaciones desde un asistente compatible con MCP. La única herramienta que cambia la base es `crear_evento`: inserta eventos nuevos en el calendario. No hay herramientas para editar, borrar, enviar comunicaciones ni registrar pagos.

## Configuración local

1. Instalá las dependencias con `npm install`.
2. Completá `.env.mcp.local` en la raíz del proyecto (ya está creado y Git lo ignora):

   ```dotenv
   OPS_MCP_SUPABASE_URL=https://zyyidwudjybsdqodosup.supabase.co
   OPS_MCP_SUPABASE_SECRET_KEY=TU_CLAVE_SECRETA_DE_SERVIDOR
   OPS_MCP_ADMIN_EMAIL=enzothome1@gmail.com
   ```

   Usá la URL y la clave secreta del **mismo** proyecto Supabase de Operaciones. El correo debe figurar activo en `workspace_admins`. Nunca agregues esta clave al navegador, a una variable `NEXT_PUBLIC_`, a GitHub ni a Vercel. Este MCP se ejecuta solo en tu computadora.

3. En la configuración de MCP del cliente (por ejemplo, Codex), registrá el servidor:

   ```toml
   [mcp_servers.enzothome_ops]
   command = "node"
   args = ["C:/Orchestrator/Projects/3. PROYECTOS TÉCNICOS/enzothome/scripts/ops-mcp/server.mjs"]
   ```

4. Reiniciá el cliente MCP. Probá `consultar_registros` con `seccion: "proyectos"`. Luego podés pedir, por ejemplo: «Mostrame las etapas de este proyecto» o «Agregá un evento el 2026-11-05 a las 15:00».

## ChatGPT con la computadora encendida

La misma versión local puede conectarse a ChatGPT mediante [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels), sin publicar la base ni un servidor en Internet. El `tunnel-client` ejecuta este servidor por stdio; debe permanecer encendido en tu computadora para que ChatGPT pueda consultar datos. Necesitás un túnel en OpenAI Platform, una clave de ejecución para ese túnel y permiso para agregar MCP personalizados en ChatGPT. En ChatGPT Plugins, elegí **Add custom MCP server → Tunnel** y seleccioná ese túnel. El servidor debe estar configurado con la clave secreta local de Supabase antes de probarlo.

## ChatGPT siempre disponible

La función `supabase/functions/ops-mcp` ofrece el mismo MCP por HTTPS en `https://zyyidwudjybsdqodosup.supabase.co/functions/v1/ops-mcp`. Usa Supabase Auth OAuth 2.1 para iniciar sesión con el usuario administrador y aplicar las políticas RLS existentes. **No usa clave secreta de Supabase.** La pantalla de autorización está en `/oauth/consent` del sitio.

Para activarla, en este orden:

1. Publicá la ruta `/oauth/consent` del sitio y comprobá que `https://www.enzothome.com/oauth/consent` abra. El dominio sin `www` redirige al que sí lo tiene. La pantalla usa el correo administrador y un enlace de acceso para autorizar ChatGPT.
2. En Supabase, comprobá que Auth use una clave de firma asimétrica (ES256 o RS256) y que `workspace_admins` incluya tu correo activo. La base de Enzo Thome ya tenía una clave ES256 al preparar este cambio.
3. En **Authentication → OAuth Server**, activá OAuth 2.1, habilitá el registro dinámico de clientes y poné `/oauth/consent` como ruta de autorización. Verificá que el **Site URL** del proyecto sea `https://www.enzothome.com` y que la URL de retorno `/auth/callback` esté permitida. Esos ajustes del dashboard todavía no están confirmados. No hagas `supabase config push` desde el `config.toml` local sin revisar: su Site URL de desarrollo es `http://127.0.0.1:3000`.
4. Desplegá la función `ops-mcp` con `verify_jwt = false`. Esto permite que ChatGPT descubra OAuth; la función verifica el token de usuario en cada llamada antes de abrir las herramientas.
5. En [ChatGPT Plugins](https://chatgpt.com/plugins), agregá un MCP personalizado con esa URL y autenticación OAuth. Iniciá sesión con el correo administrador y aprobá los permisos. Probá una consulta de proyectos; después creá un evento real cuando lo necesites.

Hasta que OAuth esté activado, el documento de descubrimiento de esta base responde 404 y ChatGPT no puede conectarse. El servidor local, la función remota y la pantalla están preparados en el repositorio; publicar y activar estas piezas son pasos separados.

El calendario requiere la migración `supabase/migrations/20261101215000_calendar_events.sql` aplicada en esa base. La columna `project_id` es de tipo **text**, igual que `projects.id`.

## Herramientas

| Herramienta | Alcance |
| --- | --- |
| `consultar_registros` | Clientes, proyectos, etapas y sus acciones, documentos, facturas, revisiones históricas, enlaces, comunicaciones, cuentas bancarias, asignaciones y eventos. Tiene filtros y paginación. |
| `resumen_financiero` | Valor, pagado, saldo y último pago por proyecto; saldos agregados por moneda. |
| `consultar_calendario` | Eventos y fechas de proyectos y etapas en un intervalo de hasta 93 días. |
| `abrir_archivo` | URL temporal de 2 minutos para un documento, factura o recibo. |
| `crear_evento` | **Única escritura:** inserta un evento nuevo. |

Las consultas omiten contraseñas, tokens del portal y rutas privadas de Storage. `abrir_archivo` devuelve una URL temporal para acceder al archivo. El servidor verifica que el correo configurado sea administrador activo antes de cada consulta u operación. La clave secreta tiene privilegios amplios en Supabase: protegé `.env.mcp.local` y no expongas este servidor directamente a Internet.

El presupuestador es una calculadora local y no guarda presupuestos en Supabase; por eso no aparece como colección consultable.
