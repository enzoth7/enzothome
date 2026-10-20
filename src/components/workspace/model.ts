export type Client = { id: string; company: string; name: string; email: string; language: string; notes: string; logoFileId?: string; logoFileName?: string; portalToken?: string };
export type Intake = { contact: string; goal: string; success: string; context: string; date: string };
export type Project = { id: string; clientId: string; title: string; description: string; status: string; start: string; due: string; value?: number; currency?: string; intake?: Intake; internalChecklist?: string[] };
export type Task = { id: string; projectId: string; title: string; status: string; due: string; owner: string; kind: string };
export type Document = { id: string; projectId: string; title: string; kind: string; status: string; date: string; content: string; fileId: string; fileName: string };
export type InvoiceLine = { id: string; description: string; amount: number };
export type Invoice = { id: string; projectId: string; title: string; number: string; amount: number; currency: string; due: string; paid: number; paidAt?: string; paymentInfo: string; date: string; lines?: InvoiceLine[]; fileId?: string; fileName?: string; receiptFileId?: string; receiptFileName?: string };
export type ProjectPaymentAmount = { currency: string; total: number; paid: number; remaining: number };
export type ProjectPaymentSummary = { projectId: string; title: string; start: string; amounts: ProjectPaymentAmount[]; lastPaidAt: string };
export type Approval = { id: string; projectId: string; title: string; description: string; status: string; due: string; response: string; respondedAt: string };
export type Resource = { id: string; projectId: string; title: string; url: string; kind: string; description: string };
export type MessageAttachment = { path: string; name: string; size: number };
export type Message = { id: string; clientId: string; title: string; content: string; kind: string; date: string; attachments?: MessageAttachment[]; status?: "Borrador" | "Enviado" | "Error"; sentAt?: string; resendId?: string; lastError?: string };
export type BankAccount = { id: string; bankName: string; accountHolder: string; accountNumber: string; paymentUrl?: string; currency: string; instructions: string; clientIds: string[]; iconFileId?: string; iconFileName?: string };
export type Collections = { clients: Client; projects: Project; tasks: Task; documents: Document; invoices: Invoice; approvals: Approval; resources: Resource; messages: Message };
export type Collection = keyof Collections;
export type WorkspaceData = { version: 1; bankAccounts?: BankAccount[] } & { [K in Collection]: Collections[K][] };
export const projectStatuses = ["Por comenzar", "En curso", "En revisión", "En pausa", "Finalizado"];
export const taskStatuses = ["Pendiente", "En curso", "En revisión", "Completada"];
export const documentKinds = ["Contrato de servicios", "Alcance del Proyecto", "Propuesta Comercial", "Otro"];
export const internalChecklistItems = [
  { id: "custom-404", label: "Página 404 personalizada" },
  { id: "cta-above-fold", label: "CTA visible antes de hacer scroll" },
  { id: "meta-title", label: "Título meta por página" },
  { id: "meta-description", label: "Descripción meta por página" },
  { id: "open-graph", label: "Imagen Open Graph" },
  { id: "favicon", label: "Set de favicon" },
  { id: "robots", label: "robots.txt" },
  { id: "sitemap", label: "sitemap.xml" },
  { id: "alt-text", label: "Texto alternativo en cada imagen" },
  { id: "mobile-breakpoints", label: "Breakpoints móviles" },
  { id: "sticky-mobile-cta", label: "CTA fijo en mobile" },
  { id: "loading-states", label: "Estados de carga" },
  { id: "form-errors", label: "Estados de error en formularios" },
  { id: "thank-you", label: "Página de agradecimiento" },
  { id: "privacy", label: "Página de política de privacidad" },
  { id: "terms", label: "Página de términos y condiciones" },
  { id: "cookies", label: "Banner de cookies" },
  { id: "analytics", label: "Analítica instalada" },
  { id: "contact-address", label: "Dirección de contacto real" },
  { id: "domain-https-redirects", label: "Dominio, HTTPS y redirecciones" },
  { id: "canonical-urls", label: "URLs canónicas" },
  { id: "search-console", label: "Google Search Console" },
  { id: "structured-data-geo", label: "Datos estructurados y GEO básico" },
  { id: "llms-txt", label: "llms.txt" },
  { id: "performance-accessibility", label: "Rendimiento y accesibilidad" },
  { id: "forms-integrations", label: "Formularios e integraciones probadas" },
] as const;
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });
export const uid = () => crypto.randomUUID();
export function dateLabel(value: string, locale = "es-UY") {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value.slice(0, 10) + "T12:00:00Z"));
}
export const money = (amount: number, currency = "USD") => new Intl.NumberFormat("es-UY", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
export const invoiceStatus = (invoice: Invoice) => invoice.paid >= invoice.amount ? "Pagada" : invoice.due < today() ? "Vencida" : invoice.paid > 0 ? "Pago parcial" : "Pendiente";
export function invoiceOutstandingByCurrency(invoices: Invoice[]): [string, number][] {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    const currency = invoice.currency || "USD";
    totals.set(currency, (totals.get(currency) || 0) + Math.max(0, invoice.amount - invoice.paid));
  }
  return [...totals.entries()].filter(([, amount]) => amount > 0).sort(([a], [b]) => a.localeCompare(b));
}
export function projectPaymentSummary(project: Project, invoices: Invoice[]): ProjectPaymentSummary {
  const projectInvoices = invoices.filter(invoice => invoice.projectId === project.id);
  const currencyTotals = new Map<string, { invoiced: number; paid: number }>();
  for (const invoice of projectInvoices) {
    const current = currencyTotals.get(invoice.currency) || { invoiced: 0, paid: 0 };
    current.invoiced += invoice.amount;
    current.paid += invoice.paid;
    currencyTotals.set(invoice.currency, current);
  }
  const projectCurrency = project.currency || projectInvoices[0]?.currency || "USD";
  if ((project.value || 0) > 0) {
    const current = currencyTotals.get(projectCurrency) || { invoiced: 0, paid: 0 };
    currencyTotals.set(projectCurrency, current);
  }
  const amounts = [...currencyTotals.entries()].map(([currency, values]) => {
    const configuredTotal = projectCurrency === currency && (project.value || 0) > 0 ? project.value || 0 : values.invoiced;
    return { currency, total: configuredTotal, paid: values.paid, remaining: Math.max(configuredTotal - values.paid, 0) };
  }).sort((a, b) => a.currency.localeCompare(b.currency));
  const lastPaidAt = projectInvoices.filter(invoice => invoice.paid > 0 && invoice.paidAt).map(invoice => invoice.paidAt || "").sort().at(-1) || "";
  return { projectId: project.id, title: project.title, start: project.start, amounts, lastPaidAt };
}
export function safeUrl(value: string) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
}

export function createWorkspaceSeed(): WorkspaceData {
  const date = today();
  const offset = (days: number) => { const d = new Date(date + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
  return {
    version: 1,
    clients: [
      { id: "pearl", company: "Pearl Connexions", name: "Joel", email: "", language: "Inglés", notes: "" },
      { id: "matearte", company: "MateArte", name: "Richard", email: "", language: "Español", notes: "" },
    ],
    projects: [
      { id: "pearl-operations", clientId: "pearl", title: "Una operación más conectada", description: "Centralizar la información del equipo y simplificar el seguimiento diario de la operación.", status: "En curso", start: offset(-21), due: offset(18), value: 0, currency: "USD" },
      { id: "matearte-orders", clientId: "matearte", title: "Pedidos, de principio a fin", description: "Un espacio compartido para seguir los pedidos, la producción y las entregas de MateArte.", status: "En revisión", start: offset(-28), due: offset(9), value: 0, currency: "USD" },
    ],
    tasks: [
      { id: "t1", projectId: "pearl-operations", title: "Objetivos y alcance acordados", status: "Completada", due: offset(-21), owner: "Enzo", kind: "Hito" },
      { id: "t2", projectId: "pearl-operations", title: "Confirmar referente y objetivo principal", status: "Completada", due: offset(-19), owner: "Cliente", kind: "Inicio" },
      { id: "t3", projectId: "pearl-operations", title: "Compartir un archivo de ejemplo", status: "Pendiente", due: offset(2), owner: "Cliente", kind: "Acceso" },
      { id: "t4", projectId: "pearl-operations", title: "Primera versión del panel", status: "En curso", due: offset(5), owner: "Enzo", kind: "Hito" },
      { id: "t5", projectId: "pearl-operations", title: "Validación con el equipo", status: "Pendiente", due: offset(11), owner: "Cliente", kind: "Hito" },
      { id: "t6", projectId: "pearl-operations", title: "Entrega y recorrido final", status: "Pendiente", due: offset(18), owner: "Enzo", kind: "Hito" },
      { id: "t7", projectId: "matearte-orders", title: "Mapa del proceso de pedidos", status: "Completada", due: offset(-20), owner: "Enzo", kind: "Hito" },
      { id: "t8", projectId: "matearte-orders", title: "Panel de producción", status: "Completada", due: offset(-4), owner: "Enzo", kind: "Hito" },
      { id: "t9", projectId: "matearte-orders", title: "Prueba del recorrido de un pedido", status: "En revisión", due: offset(3), owner: "Cliente", kind: "Hito" },
      { id: "t10", projectId: "matearte-orders", title: "Entrega y capacitación", status: "Pendiente", due: offset(9), owner: "Enzo", kind: "Hito" },
    ],
    documents: [],
    invoices: [],
    approvals: [
      { id: "a1", projectId: "pearl-operations", title: "Estructura del panel operativo", description: "La primera vista reúne operaciones abiertas, responsables y fechas de seguimiento. ¿Esta organización responde a lo que necesita el equipo?", status: "Pendiente", due: offset(3), response: "", respondedAt: "" },
      { id: "a2", projectId: "matearte-orders", title: "Recorrido de producción", description: "Revisá la guía en Entregables y confirmá si los estados propuestos reflejan el trabajo diario. Podés aprobar o pedir un ajuste con un comentario.", status: "Pendiente", due: offset(3), response: "", respondedAt: "" },
    ],
    resources: [
      { id: "r1", projectId: "pearl-operations", title: "Web de Pearl Connexions", url: "https://www.pearlconnexions.com", kind: "Sitio web", description: "Sitio público de la empresa." },
      { id: "r2", projectId: "matearte-orders", title: "MateArte en Instagram", url: "https://www.instagram.com/matearteuruguay/", kind: "Sitio web", description: "Perfil público de la marca." },
    ],
    messages: [],
    bankAccounts: [],
  };
}

// Validate complete backups before replacing any browser data.
const shapes: Record<Collection, Record<string, "string" | "number">> = {
  clients: { id: "string", company: "string", name: "string", email: "string", language: "string", notes: "string" },
  projects: { id: "string", clientId: "string", title: "string", description: "string", status: "string", start: "string", due: "string" },
  tasks: { id: "string", projectId: "string", title: "string", status: "string", due: "string", owner: "string", kind: "string" },
  documents: { id: "string", projectId: "string", title: "string", kind: "string", status: "string", date: "string", content: "string", fileId: "string", fileName: "string" },
  invoices: { id: "string", projectId: "string", title: "string", number: "string", amount: "number", currency: "string", due: "string", paid: "number", paymentInfo: "string", date: "string" },
  approvals: { id: "string", projectId: "string", title: "string", description: "string", status: "string", due: "string", response: "string", respondedAt: "string" },
  resources: { id: "string", projectId: "string", title: "string", url: "string", kind: "string", description: "string" },
  messages: { id: "string", clientId: "string", title: "string", content: "string", kind: "string", date: "string" },
};
export function isWorkspaceData(value: unknown): value is WorkspaceData {
  if (!value || typeof value !== "object") return false;
  const data = value as WorkspaceData;
  if (data.version !== 1) return false;
  for (const key of Object.keys(shapes) as Collection[]) {
    const entries = data[key];
    if (!Array.isArray(entries) || entries.length > 10000) return false;
    if (!entries.every(entry => entry && Object.entries(shapes[key]).every(([field, type]) => typeof (entry as Record<string, unknown>)[field] === type))) return false;
    if (new Set(entries.map(e => e.id)).size !== entries.length || entries.some(e => !e.id)) return false;
  }
  if (data.clients.some(client => (client.logoFileId !== undefined && typeof client.logoFileId !== "string") || (client.logoFileName !== undefined && typeof client.logoFileName !== "string") || (client.portalToken !== undefined && typeof client.portalToken !== "string"))) return false;
  if (data.projects.some(project => (project.value !== undefined && (typeof project.value !== "number" || !Number.isFinite(project.value) || project.value < 0)) || (project.currency !== undefined && !["USD", "UYU", "EUR"].includes(project.currency)))) return false;
  if (data.invoices.some(invoice => (invoice.fileId !== undefined && typeof invoice.fileId !== "string") || (invoice.fileName !== undefined && typeof invoice.fileName !== "string") || (invoice.receiptFileId !== undefined && typeof invoice.receiptFileId !== "string") || (invoice.receiptFileName !== undefined && typeof invoice.receiptFileName !== "string"))) return false;
  if (data.invoices.some(invoice => invoice.paidAt !== undefined && typeof invoice.paidAt !== "string")) return false;
  if (data.invoices.some(invoice => invoice.lines !== undefined && (!Array.isArray(invoice.lines) || !invoice.lines.length || invoice.lines.some(line => !line || typeof line.id !== "string" || typeof line.description !== "string" || !line.description.trim() || typeof line.amount !== "number" || !Number.isFinite(line.amount) || line.amount <= 0)))) return false;
  if (data.messages.some(message => {
    if (message.attachments !== undefined && (!Array.isArray(message.attachments) || message.attachments.some(attachment => !attachment || typeof attachment.path !== "string" || typeof attachment.name !== "string" || typeof attachment.size !== "number"))) return true;
    if (message.status !== undefined && !["Borrador", "Enviado", "Error"].includes(message.status)) return true;
    return [message.sentAt, message.resendId, message.lastError].some(value => value !== undefined && typeof value !== "string");
  })) return false;
  if (data.bankAccounts !== undefined && (!Array.isArray(data.bankAccounts) || data.bankAccounts.some(account => !account || typeof account.id !== "string" || typeof account.bankName !== "string" || !account.bankName.trim() || typeof account.accountHolder !== "string" || !account.accountHolder.trim() || typeof account.accountNumber !== "string" || (!account.accountNumber.trim() && !account.paymentUrl?.trim()) || (account.paymentUrl !== undefined && (typeof account.paymentUrl !== "string" || (!!account.paymentUrl && !safeUrl(account.paymentUrl)))) || typeof account.currency !== "string" || !["USD", "UYU", "EUR", "GBP"].includes(account.currency) || typeof account.instructions !== "string" || !Array.isArray(account.clientIds) || account.clientIds.some(id => typeof id !== "string" || !data.clients.some(client => client.id === id)) || (account.iconFileId !== undefined && typeof account.iconFileId !== "string") || (account.iconFileName !== undefined && typeof account.iconFileName !== "string")))) return false;
  if (data.projects.some(p => !data.clients.some(c => c.id === p.clientId))) return false;
  const checklistIds = new Set(internalChecklistItems.map(item => item.id));
  if (data.projects.some(project => project.internalChecklist !== undefined && (!Array.isArray(project.internalChecklist) || new Set(project.internalChecklist).size !== project.internalChecklist.length || project.internalChecklist.some(item => typeof item !== "string" || !checklistIds.has(item as (typeof internalChecklistItems)[number]["id"]))))) return false;
  for (const key of ["tasks", "documents", "invoices", "approvals", "resources"] as const) {
    if (data[key].some(e => !data.projects.some(p => p.id === e.projectId))) return false;
  }
  if (data.messages.some(m => !data.clients.some(c => c.id === m.clientId))) return false;
  const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s));
  if (data.projects.some(p => !validDate(p.start) || !validDate(p.due) || !projectStatuses.includes(p.status))) return false;
  if (data.projects.some(p => p.intake && (!["contact", "goal", "success", "context", "date"].every(k => typeof (p.intake as unknown as Record<string, unknown>)[k] === "string") || !validDate(p.intake.date)))) return false;
  if (data.tasks.some(t => !validDate(t.due) || !taskStatuses.includes(t.status))) return false;
  for (const key of ["documents", "invoices", "messages"] as const) if (data[key].some(e => !validDate(e.date))) return false;
  if (data.approvals.some(a => !validDate(a.due))) return false;
  if (data.invoices.some(i => !validDate(i.due) || (i.paidAt && !validDate(i.paidAt)) || !["USD", "UYU", "EUR", "GBP"].includes(i.currency) || !Number.isFinite(i.amount) || !Number.isFinite(i.paid) || i.amount <= 0 || i.paid < 0 || i.paid > i.amount)) return false;
  if (data.invoices.some(invoice => invoice.lines?.length && Math.abs(invoice.lines.reduce((total, line) => total + line.amount, 0) - invoice.amount) > 0.009)) return false;
  return true;
}
