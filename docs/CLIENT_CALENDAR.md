# Calendario del portal

El calendario del cliente muestra fechas de proyectos, inicio y fin de etapas y reuniones vinculadas a sus proyectos. Los eventos internos no se exponen. Cada cliente tiene una zona horaria IANA guardada en su ficha; al elegir un país con varias zonas, Operaciones debe elegir la ciudad o región correcta.

## Publicación

1. Enviar el código a GitHub y seguir el despliegue habitual de Vercel. Si el código llega antes que la migración, el portal conserva la vista anterior hasta que esté disponible la nueva función de calendario.
2. Revisar el historial de migraciones del proyecto Supabase de Enzo Thome y aplicar `20261106125758_client_calendar_meetings_reminders.sql`. En la revisión del 6 de noviembre, la base ya tenía la tabla `calendar_events` y las acciones de etapas, pero esas migraciones recientes no aparecían en el historial remoto; reconciliar ese historial antes de ejecutar un envío masivo de migraciones.
3. Desplegar la Edge Function `send-calendar-reminders` con la verificación de JWT desactivada según `supabase/config.toml`. La función exige un secreto propio almacenado en Vault.
4. Confirmar que `RESEND_API_KEY` y, si corresponde, `RESEND_FROM_EMAIL` están configurados en los secretos de Edge Functions.
5. Activar el programador una sola vez con `select public.activate_calendar_reminders('<URL del proyecto Supabase>');` desde una sesión de servicio autorizada. La función guarda la URL en Vault y revisa los envíos cada minuto.

La migración genera el secreto del programador. Ninguna clave se guarda en el repositorio. El correo de un día se envía si la reunión ya existía al llegar ese momento; el de treinta minutos se procesa de forma independiente. Los reintentos usan una clave estable por reunión, versión y aviso para evitar duplicados.

Al crear una reunión nueva desde Operaciones, el navegador guarda una confirmación en Comunicaciones y la envía mediante `send-workspace-email` si el cliente tiene email y Resend está disponible. Una reunión ya existente no recibe esa confirmación de manera retroactiva. Las tres plantillas se pueden revisar en Comunicaciones con los datos de una reunión concreta; los recordatorios comparten el mismo generador de HTML que la función automática.

## Verificación

- Comprobar que `get_portal_calendar` devuelve reuniones de un cliente y no eventos internos ni reuniones de otros clientes.
- Crear una reunión futura desde Operaciones y comprobar la hora en Montevideo y en el portal del cliente, incluido un cambio de horario de verano.
- Confirmar que existe el trabajo `send-calendar-reminders` en `cron.job` y que sus ejecuciones aparecen en `cron.job_run_details`.
- Probar un recordatorio con un destinatario de prueba y verificar `calendar_reminder_deliveries.sent_at` y `resend_email_id` antes de usarlo con clientes.
