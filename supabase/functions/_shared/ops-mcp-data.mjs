const SECTIONS = Object.freeze({
  clientes: { table: "clients", columns: "id,company,name,email,phone,country,language,notes,logo_file_name,portal_username", filters: ["id"] },
  proyectos: { table: "projects", columns: "id,client_id,title,description,status,start_date,due_date,project_value,project_currency,intake,internal_checklist", filters: ["id", "client_id"] },
  etapas: { table: "tasks", columns: "id,project_id,title,status,due_date,owner,kind,actions", filters: ["id", "project_id"] },
  documentos: { table: "documents", columns: "id,project_id,title,kind,status,document_date,content,file_name", filters: ["id", "project_id"] },
  facturas: { table: "invoices", columns: "id,project_id,title,number,amount,currency,due_date,paid,paid_at,payment_info,invoice_date,line_items,file_name,receipt_file_name", filters: ["id", "project_id"] },
  revisiones: { table: "approvals", columns: "id,project_id,title,description,status,due_date,response,responded_at", filters: ["id", "project_id"] },
  enlaces: { table: "resources", columns: "id,project_id,title,url,kind,description", filters: ["id", "project_id"] },
  comunicaciones: { table: "messages", columns: "id,client_id,title,content,kind,message_date,status,sent_at", filters: ["id", "client_id"] },
  cuentas_bancarias: { table: "bank_accounts", columns: "id,bank_name,account_holder,account_number,payment_url,currency,instructions", filters: ["id"] },
  cuentas_por_cliente: { table: "client_bank_accounts", columns: "client_id,bank_account_id", filters: ["client_id"] },
  eventos: { table: "calendar_events", columns: "id,title,event_date,start_time,end_time,notes,project_id", filters: ["id", "project_id"], order: "event_date" },
});

export const SECTION_NAMES = Object.freeze(Object.keys(SECTIONS));

function checked(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result;
}

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export async function requireAdmin(db, email) {
  const result = checked(await db.from("workspace_admins").select("email").eq("email", email).eq("active", true).maybeSingle(), "No se pudo verificar el administrador");
  if (!result.data) throw new Error("La cuenta configurada no es administradora activa de Operaciones.");
}

export async function listRecords(db, { section, id, clientId, projectId, page = 1, limit = 50 }) {
  const config = SECTIONS[section];
  if (!config) throw new Error("Sección no disponible.");
  const filters = { id, client_id: clientId, project_id: projectId };
  let query = db.from(config.table).select(config.columns, { count: "exact" });
  for (const [column, value] of Object.entries(filters)) {
    if (!value) continue;
    if (!config.filters.includes(column)) throw new Error(`El filtro ${column} no corresponde a ${section}.`);
    query = query.eq(column, value);
  }
  const offset = (page - 1) * limit;
  const result = checked(await query.order(config.order || (section === "cuentas_por_cliente" ? "client_id" : "created_at"), { ascending: true }).range(offset, offset + limit - 1), `No se pudo consultar ${section}`);
  return { section, page, limit, total: result.count ?? null, records: result.data || [] };
}

export async function financialSummary(db, { clientId } = {}) {
  const projects = [];
  for (let offset = 0; ; offset += 1000) {
    let query = db.from("projects").select("id,client_id,title,start_date,project_value,project_currency").order("created_at", { ascending: true });
    if (clientId) query = query.eq("client_id", clientId);
    const page = checked(await query.range(offset, offset + 999), "No se pudieron consultar los proyectos").data || [];
    projects.push(...page);
    if (projects.length >= 10000) throw new Error("El resumen supera 10000 proyectos; filtrá por cliente.");
    if (page.length < 1000) break;
  }
  if (!projects.length) return { projects: [], pendingByCurrency: {} };
  const invoices = [];
  for (let batch = 0; batch < projects.length; batch += 100) {
    const ids = projects.slice(batch, batch + 100).map(project => project.id);
    for (let offset = 0; ; offset += 1000) {
      const page = checked(await db.from("invoices").select("id,project_id,amount,currency,paid,paid_at").in("project_id", ids).order("created_at", { ascending: true }).range(offset, offset + 999), "No se pudieron consultar las facturas").data || [];
      invoices.push(...page);
      if (invoices.length >= 10000) throw new Error("El resumen supera 10000 facturas; filtrá por cliente.");
      if (page.length < 1000) break;
    }
  }
  const pendingByCurrency = {};
  const rows = projects.map(project => {
    const related = invoices.filter(invoice => invoice.project_id === project.id);
    const projectCurrency = project.project_currency || related[0]?.currency || "USD";
    const byCurrency = new Map();
    for (const invoice of related) {
      const currency = invoice.currency || "USD";
      const current = byCurrency.get(currency) || { invoiced: 0, paid: 0 };
      current.invoiced += Number(invoice.amount || 0);
      current.paid += Number(invoice.paid || 0);
      byCurrency.set(currency, current);
    }
    if (Number(project.project_value || 0) > 0 && !byCurrency.has(projectCurrency)) byCurrency.set(projectCurrency, { invoiced: 0, paid: 0 });
    const amounts = [...byCurrency.entries()].map(([currency, values]) => {
      const total = currency === projectCurrency && Number(project.project_value || 0) > 0 ? Number(project.project_value) : values.invoiced;
      const remaining = Math.max(0, total - values.paid);
      pendingByCurrency[currency] = (pendingByCurrency[currency] || 0) + remaining;
      return { currency, total, paid: values.paid, remaining };
    });
    return {
      projectId: project.id, clientId: project.client_id, project: project.title,
      startDate: project.start_date, amounts,
      lastPayment: related.filter(invoice => Number(invoice.paid) > 0).map(invoice => invoice.paid_at).filter(Boolean).sort().at(-1) || null,
      invoiceCount: related.length,
    };
  });
  return { projects: rows, pendingByCurrency };
}

export async function calendarItems(db, { from, to, projectId }) {
  if (!validDate(from) || !validDate(to) || from > to) throw new Error("Ingresá fechas válidas en orden ascendente.");
  const days = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
  if (days > 92) throw new Error("Consultá un período de hasta 93 días.");
  let eventsQuery = db.from("calendar_events").select("id,title,event_date,start_time,end_time,notes,project_id").gte("event_date", from).lte("event_date", to).order("event_date").limit(1000);
  let stagesQuery = db.from("tasks").select("id,project_id,title,status,due_date").gte("due_date", from).lte("due_date", to).order("due_date").limit(1000);
  if (projectId) {
    eventsQuery = eventsQuery.eq("project_id", projectId);
    stagesQuery = stagesQuery.eq("project_id", projectId);
  }
  const [eventResult, stageResult, startResult, endResult] = await Promise.all([
    eventsQuery, stagesQuery,
    db.from("projects").select("id,title,start_date").gte("start_date", from).lte("start_date", to).limit(1000),
    db.from("projects").select("id,title,due_date").gte("due_date", from).lte("due_date", to).limit(1000),
  ]);
  const events = checked(eventResult, "No se pudieron consultar los eventos").data || [];
  const stages = checked(stageResult, "No se pudieron consultar las etapas").data || [];
  const starts = checked(startResult, "No se pudieron consultar los inicios de proyecto").data || [];
  const ends = checked(endResult, "No se pudieron consultar los fines de proyecto").data || [];
  if ([events, stages, starts, ends].some(items => items.length === 1000)) throw new Error("Demasiados resultados para este período; acortá las fechas.");
  return [
    ...events.map(event => ({ type: "event", date: event.event_date, ...event })),
    ...stages.map(stage => ({ type: "stage", date: stage.due_date, ...stage })),
    ...starts.filter(project => !projectId || project.id === projectId).map(project => ({ type: "project_start", date: project.start_date, projectId: project.id, title: project.title })),
    ...ends.filter(project => !projectId || project.id === projectId).map(project => ({ type: "project_end", date: project.due_date, projectId: project.id, title: project.title })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export async function fileLink(db, { kind, id }) {
  const invoice = kind !== "document";
  const table = invoice ? "invoices" : "documents";
  const pathField = kind === "receipt" ? "receipt_storage_path" : "storage_path";
  const nameField = kind === "receipt" ? "receipt_file_name" : "file_name";
  const result = checked(await db.from(table).select(`id,${pathField},${nameField}`).eq("id", id).maybeSingle(), "No se pudo consultar el archivo");
  if (!result.data) throw new Error("No se encontró el registro.");
  const path = result.data[pathField];
  if (!path) throw new Error("Este registro no tiene archivo adjunto.");
  const signed = checked(await db.storage.from("workspace-documents").createSignedUrl(path, 120), "No se pudo abrir el archivo");
  return { kind, id, fileName: result.data[nameField] || null, url: signed.data.signedUrl, expiresInSeconds: 120 };
}

export async function createEvent(db, { title, date, startTime, endTime, notes = "", projectId }) {
  if (!validDate(date)) throw new Error("La fecha no es válida.");
  if (endTime && (!startTime || endTime <= startTime)) throw new Error("La hora de fin debe ser posterior a la de inicio.");
  if (projectId) {
    const project = checked(await db.from("projects").select("id").eq("id", projectId).maybeSingle(), "No se pudo verificar el proyecto");
    if (!project.data) throw new Error("El proyecto indicado no existe.");
  }
  const row = {
    title: title.trim(), event_date: date, start_time: startTime || null,
    end_time: endTime || null, notes: notes.trim(), project_id: projectId || null,
  };
  const result = checked(await db.from("calendar_events").insert(row).select("id,title,event_date,start_time,end_time,notes,project_id").single(), "No se pudo crear el evento");
  return result.data;
}
