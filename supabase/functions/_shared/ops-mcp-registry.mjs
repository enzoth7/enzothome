import { SECTION_NAMES, calendarItems, createEvent, fileLink, financialSummary, listRecords, requireAdmin } from "./ops-mcp-data.mjs";

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function register(server, db, adminEmail, name, config, operation) {
  server.registerTool(name, config, async input => {
    try {
      await requireAdmin(db, adminEmail);
      return result(await operation(input));
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Ocurrió un error al consultar Operaciones." }] };
    }
  });
}

export function registerOpsTools(server, db, adminEmail, z) {
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Usá AAAA-MM-DD.");
  const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usá HH:MM (24 horas).");
  const id = z.string().trim().min(1).max(200);

  register(server, db, adminEmail, "consultar_registros", {
    description: "Consulta datos de Operaciones. Secciones: clientes, proyectos, etapas (incluye acciones), documentos, facturas, revisiones históricas, enlaces, comunicaciones, cuentas bancarias, asignaciones de cuentas y eventos. No devuelve contraseñas, tokens ni rutas de archivos.",
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: z.object({
      seccion: z.enum(SECTION_NAMES),
      id: id.optional(),
      cliente_id: id.optional(),
      proyecto_id: id.optional(),
      pagina: z.number().int().min(1).max(10000).default(1),
      limite: z.number().int().min(1).max(100).default(50),
    }),
  }, input => listRecords(db, {
    section: input.seccion, id: input.id, clientId: input.cliente_id,
    projectId: input.proyecto_id, page: input.pagina, limit: input.limite,
  }));

  register(server, db, adminEmail, "resumen_financiero", {
    description: "Resume por proyecto el valor acordado, total pagado, saldo, último pago y saldo pendiente separado por moneda. Admite filtrar por cliente.",
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: z.object({ cliente_id: id.optional() }),
  }, input => financialSummary(db, { clientId: input.cliente_id }));

  register(server, db, adminEmail, "consultar_calendario", {
    description: "Consulta eventos y fechas de inicio/fin de proyectos y etapas en un período de hasta 93 días. Puede filtrarse por proyecto.",
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: z.object({ desde: date, hasta: date, proyecto_id: id.optional() }),
  }, input => calendarItems(db, { from: input.desde, to: input.hasta, projectId: input.proyecto_id }));

  register(server, db, adminEmail, "abrir_archivo", {
    description: "Obtiene una URL temporal (2 minutos) para ver un PDF/documento privado de Operaciones. El identificador corresponde al documento o factura.",
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    inputSchema: z.object({ tipo: z.enum(["documento", "factura", "recibo"]), id }),
  }, input => fileLink(db, { kind: { documento: "document", factura: "invoice", recibo: "receipt" }[input.tipo], id: input.id }));

  register(server, db, adminEmail, "crear_evento", {
    description: "Crea un evento nuevo en el calendario de Operaciones. Esta es la única herramienta del MCP que escribe datos; no puede editar ni borrar eventos.",
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    inputSchema: z.object({
      titulo: z.string().trim().min(1).max(240),
      fecha: date,
      hora_inicio: time.optional(),
      hora_fin: time.optional(),
      notas: z.string().max(10000).optional(),
      proyecto_id: id.optional(),
    }),
  }, input => createEvent(db, {
    title: input.titulo, date: input.fecha, startTime: input.hora_inicio,
    endTime: input.hora_fin, notes: input.notas, projectId: input.proyecto_id,
  }));

  return server;
}
