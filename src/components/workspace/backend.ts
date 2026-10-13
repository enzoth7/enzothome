import type { SupabaseClient } from "@supabase/supabase-js";
import { isWorkspaceData, type BankAccount, type Collection, type Collections, type InvoiceLine, type MessageAttachment, type WorkspaceData } from "./model";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/src/lib/supabase/client";

type Row = Record<string, unknown>;
export type WorkspaceFileKind = "logo" | "bank-icon" | "document" | "invoice" | "email";

const collections: Collection[] = ["clients", "projects", "tasks", "documents", "invoices", "approvals", "resources", "messages"];

function client(): SupabaseClient {
  const instance = getSupabaseBrowserClient();
  if (!instance) throw new Error("Supabase todavía no está configurado.");
  return instance;
}

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function number(value: unknown) { return typeof value === "number" ? value : Number(value || 0); }
function invoiceLines(value: unknown): InvoiceLine[] {
  if (!Array.isArray(value)) return [];
  return value.filter(line => line && typeof line === "object").map(line => {
    const record = line as Row;
    return { id: text(record.id), description: text(record.description), amount: number(record.amount) };
  });
}

function fromRow(collection: Collection, row: Row): Collections[Collection] {
  switch (collection) {
    case "clients": return {
      id: text(row.id), company: text(row.company), name: text(row.name), email: text(row.email), language: text(row.language), notes: text(row.notes),
      logoFileId: text(row.logo_path), logoFileName: text(row.logo_file_name), portalToken: text(row.portal_token),
    };
    case "projects": return {
      id: text(row.id), clientId: text(row.client_id), title: text(row.title), description: text(row.description), status: text(row.status),
      start: text(row.start_date), due: text(row.due_date),
      ...(row.intake && typeof row.intake === "object" ? { intake: row.intake as Collections["projects"]["intake"] } : {}),
      internalChecklist: Array.isArray(row.internal_checklist) ? row.internal_checklist.filter(item => typeof item === "string") as string[] : [],
    };
    case "tasks": return { id: text(row.id), projectId: text(row.project_id), title: text(row.title), status: text(row.status), due: text(row.due_date), owner: text(row.owner), kind: text(row.kind) };
    case "documents": return { id: text(row.id), projectId: text(row.project_id), title: text(row.title), kind: text(row.kind), status: text(row.status), date: text(row.document_date), content: text(row.content), fileId: text(row.storage_path), fileName: text(row.file_name) };
    case "invoices": return { id: text(row.id), projectId: text(row.project_id), title: text(row.title), number: text(row.number), amount: number(row.amount), currency: text(row.currency), due: text(row.due_date), paid: number(row.paid), paidAt: text(row.paid_at), paymentInfo: text(row.payment_info), date: text(row.invoice_date), lines: invoiceLines(row.line_items), fileId: text(row.storage_path), fileName: text(row.file_name) };
    case "approvals": return { id: text(row.id), projectId: text(row.project_id), title: text(row.title), description: text(row.description), status: text(row.status), due: text(row.due_date), response: text(row.response), respondedAt: text(row.responded_at) };
    case "resources": return { id: text(row.id), projectId: text(row.project_id), title: text(row.title), url: text(row.url), kind: text(row.kind), description: text(row.description) };
    case "messages": return {
      id: text(row.id), clientId: text(row.client_id), title: text(row.title), content: text(row.content), kind: text(row.kind), date: text(row.message_date),
      attachments: Array.isArray(row.attachments) ? row.attachments as MessageAttachment[] : [], status: (text(row.status) || "Borrador") as Collections["messages"]["status"],
      sentAt: text(row.sent_at), resendId: text(row.resend_email_id), lastError: text(row.last_error),
    };
  }
}

function toRow(collection: Collection, item: Collections[Collection]): Row {
  const base = { id: item.id, updated_at: new Date().toISOString() };
  switch (collection) {
    case "clients": {
      const value = item as Collections["clients"];
      return { ...base, company: value.company, name: value.name, email: value.email, language: value.language, notes: value.notes, logo_path: value.logoFileId || null, logo_file_name: value.logoFileName || null };
    }
    case "projects": {
      const value = item as Collections["projects"];
      return { ...base, client_id: value.clientId, title: value.title, description: value.description, status: value.status, start_date: value.start, due_date: value.due, intake: value.intake || null, internal_checklist: value.internalChecklist || [] };
    }
    case "tasks": {
      const value = item as Collections["tasks"];
      return { ...base, project_id: value.projectId, title: value.title, status: value.status, due_date: value.due, owner: value.owner, kind: value.kind };
    }
    case "documents": {
      const value = item as Collections["documents"];
      return { ...base, project_id: value.projectId, title: value.title, kind: value.kind, status: value.status, document_date: value.date, content: value.content, storage_path: value.fileId || null, file_name: value.fileName || null };
    }
    case "invoices": {
      const value = item as Collections["invoices"];
      return { ...base, project_id: value.projectId, title: value.title || `Factura ${value.number}`, number: value.number, amount: value.amount, currency: value.currency, due_date: value.due, paid: value.paid, paid_at: value.paidAt || null, payment_info: "", invoice_date: value.date, line_items: value.lines || [], storage_path: value.fileId || null, file_name: value.fileName || null };
    }
    case "approvals": {
      const value = item as Collections["approvals"];
      return { ...base, project_id: value.projectId, title: value.title, description: value.description, status: value.status, due_date: value.due, response: value.response, responded_at: value.respondedAt || null };
    }
    case "resources": {
      const value = item as Collections["resources"];
      return { ...base, project_id: value.projectId, title: value.title, url: value.url, kind: value.kind, description: value.description };
    }
    case "messages": {
      const value = item as Collections["messages"];
      return { ...base, client_id: value.clientId, title: value.title, content: value.content, kind: value.kind, message_date: value.date, attachments: value.attachments || [], status: value.status || "Borrador", sent_at: value.sentAt || null, resend_email_id: value.resendId || null, last_error: value.lastError || null };
    }
  }
}

function errorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message ? `${fallback}: ${error.message}` : fallback;
}

export { hasSupabaseConfig };

export async function getCurrentUser() {
  const instance = client();
  const { data, error } = await instance.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw new Error(errorMessage(error, "No se pudo verificar la sesión"));
  return data.user;
}

export async function sendAdminMagicLink(email: string) {
  const instance = client();
  const { error } = await instance.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/ops` } });
  if (error) throw new Error(errorMessage(error, "No se pudo enviar el enlace"));
}

export async function signOutAdmin() {
  const { error } = await client().auth.signOut();
  if (error) throw new Error(errorMessage(error, "No se pudo cerrar la sesión"));
}

export async function loadAdminWorkspace(): Promise<WorkspaceData> {
  const instance = client();
  const [results, accountsResult, assignmentsResult] = await Promise.all([Promise.all(collections.map(async collection => {
    const { data, error } = await instance.from(collection).select("*").order("created_at", { ascending: true });
    if (error) throw new Error(errorMessage(error, `No se pudo cargar ${collection}`));
    return [collection, (data || []).map(row => fromRow(collection, row as Row))] as const;
  })), instance.from("bank_accounts").select("*").order("created_at", { ascending: true }), instance.from("client_bank_accounts").select("client_id, bank_account_id")]);
  if (accountsResult.error) throw new Error(errorMessage(accountsResult.error, "No se pudieron cargar las cuentas bancarias"));
  if (assignmentsResult.error) throw new Error(errorMessage(assignmentsResult.error, "No se pudieron cargar las asignaciones bancarias"));
  const assignments = (assignmentsResult.data || []) as Row[];
  const bankAccounts: BankAccount[] = ((accountsResult.data || []) as Row[]).map(row => ({
    id: text(row.id), bankName: text(row.bank_name), accountHolder: text(row.account_holder), accountNumber: text(row.account_number), paymentUrl: text(row.payment_url), currency: text(row.currency), instructions: text(row.instructions),
    iconFileId: text(row.icon_path), iconFileName: text(row.icon_file_name),
    clientIds: assignments.filter(item => text(item.bank_account_id) === text(row.id)).map(item => text(item.client_id)),
  }));
  return { ...(Object.fromEntries([["version", 1], ...results]) as WorkspaceData), bankAccounts };
}

export async function loadPortalWorkspace(accessToken: string): Promise<WorkspaceData> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accessToken)) throw new Error("El enlace del portal no es válido.");
  const { data, error } = await client().rpc("get_portal_workspace", { p_access_token: accessToken });
  if (error) throw new Error(errorMessage(error, "No se pudo abrir el portal"));
  if (!isWorkspaceData(data)) throw new Error("Este enlace no corresponde a un portal activo.");
  return data;
}

export async function saveWorkspaceEntity<K extends Collection>(collection: K, item: Collections[K]) {
  const { error } = await client().from(collection).upsert(toRow(collection, item));
  if (error) throw new Error(errorMessage(error, "No se pudo guardar el cambio"));
}

export async function deleteWorkspaceEntity(collection: Collection, id: string) {
  const { error } = await client().from(collection).delete().eq("id", id);
  if (error) throw new Error(errorMessage(error, "No se pudo eliminar el registro"));
}

type ProjectDeletionResult = {
  tasks: number;
  documents: number;
  invoices: number;
  approvals: number;
  resources: number;
  storagePaths: string[];
};

export async function deleteWorkspaceProject(id: string) {
  const instance = client();
  const { data, error } = await instance.rpc("delete_workspace_project", { p_project_id: id });
  if (error) throw new Error(errorMessage(error, "No se pudo eliminar el proyecto"));

  const result = (data || {}) as Partial<ProjectDeletionResult>;
  const storagePaths = Array.isArray(result.storagePaths) ? result.storagePaths.filter((path): path is string => typeof path === "string" && Boolean(path)) : [];
  if (storagePaths.length) {
    const { error: storageError } = await instance.storage.from("workspace-documents").remove(storagePaths);
    if (storageError) console.error("No se pudieron limpiar todos los archivos del proyecto eliminado.", storageError);
  }

  return result;
}

export async function importWorkspaceData(data: WorkspaceData) {
  const instance = client();
  for (const collection of collections) {
    const rows = data[collection].map(item => toRow(collection, item));
    if (!rows.length) continue;
    const { error } = await instance.from(collection).upsert(rows);
    if (error) throw new Error(errorMessage(error, `No se pudo migrar ${collection}`));
  }
  for (const account of data.bankAccounts || []) await saveBankAccount(account);
}

export async function saveBankAccount(account: BankAccount) {
  const instance = client();
  const { error } = await instance.from("bank_accounts").upsert({ id: account.id, bank_name: account.bankName, account_holder: account.accountHolder, account_number: account.accountNumber, payment_url: account.paymentUrl || "", currency: account.currency, instructions: account.instructions, icon_path: account.iconFileId || null, icon_file_name: account.iconFileName || null, updated_at: new Date().toISOString() });
  if (error) throw new Error(errorMessage(error, "No se pudo guardar la cuenta bancaria"));
  const { error: deleteError } = await instance.from("client_bank_accounts").delete().eq("bank_account_id", account.id);
  if (deleteError) throw new Error(errorMessage(deleteError, "No se pudieron actualizar los clientes de la cuenta"));
  if (account.clientIds.length) {
    const { error: assignmentError } = await instance.from("client_bank_accounts").insert(account.clientIds.map(clientId => ({ client_id: clientId, bank_account_id: account.id })));
    if (assignmentError) throw new Error(errorMessage(assignmentError, "No se pudieron asignar los clientes"));
  }
}

export async function deleteBankAccount(id: string) {
  const { error } = await client().from("bank_accounts").delete().eq("id", id);
  if (error) throw new Error(errorMessage(error, "No se pudo eliminar la cuenta bancaria"));
}

export async function savePortalEntity(accessToken: string, collection: Collection, item: Collections[Collection]) {
  const instance = client();
  if (collection === "approvals") {
    const approval = item as Collections["approvals"];
    const { data, error } = await instance.rpc("portal_respond_to_approval", { p_access_token: accessToken, p_approval_id: approval.id, p_status: approval.status, p_response: approval.response });
    if (error || !data) throw new Error(errorMessage(error, "No se pudo registrar la respuesta"));
    return;
  }
  if (collection === "projects") {
    const project = item as Collections["projects"];
    const { data, error } = await instance.rpc("portal_save_intake", { p_access_token: accessToken, p_project_id: project.id, p_intake: project.intake });
    if (error || !data) throw new Error(errorMessage(error, "No se pudo guardar la ficha"));
    return;
  }
  if (collection === "tasks") {
    const task = item as Collections["tasks"];
    const { data, error } = await instance.rpc("portal_complete_task", { p_access_token: accessToken, p_task_id: task.id });
    if (error || !data) throw new Error(errorMessage(error, "No se pudo completar la tarea"));
    return;
  }
  if (collection === "documents") {
    const document = item as Collections["documents"];
    if (document.status !== "Aceptado") throw new Error("El documento solo puede marcarse como aceptado desde el portal.");
    const { data, error } = await instance.rpc("portal_accept_document", { p_access_token: accessToken, p_document_id: document.id });
    if (error || !data) throw new Error(errorMessage(error, "No se pudo aceptar el documento"));
    return;
  }
  throw new Error("Este cambio no está permitido desde el portal.");
}

function cleanFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(-120) || "archivo";
}

export async function uploadWorkspaceFile(kind: WorkspaceFileKind, ownerId: string, file: File) {
  const bucket = kind === "logo" || kind === "bank-icon" ? "client-logos" : "workspace-documents";
  const path = `${ownerId}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
  const { error } = await client().storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(errorMessage(error, "No se pudo subir el archivo"));
  return { fileId: path, fileName: file.name };
}

export function publicLogoUrl(path: string) {
  if (!path || !hasSupabaseConfig()) return "";
  return client().storage.from("client-logos").getPublicUrl(path).data.publicUrl;
}

export async function downloadAdminDocument(path: string) {
  const { data, error } = await client().storage.from("workspace-documents").download(path);
  if (error) throw new Error(errorMessage(error, "No se pudo descargar el archivo"));
  return data;
}

export async function downloadPortalDocument(accessToken: string, documentId: string) {
  const { data, error } = await client().functions.invoke("portal-document", { body: { accessToken, documentId, kind: "document" } });
  if (error || !data?.signedUrl) throw new Error(errorMessage(error, "No se pudo autorizar la descarga"));
  const response = await fetch(data.signedUrl);
  if (!response.ok) throw new Error("No se pudo descargar el archivo.");
  return response.blob();
}

export async function downloadPortalInvoice(accessToken: string, invoiceId: string) {
  const { data, error } = await client().functions.invoke("portal-document", { body: { accessToken, documentId: invoiceId, kind: "invoice" } });
  if (error || !data?.signedUrl) throw new Error(errorMessage(error, "No se pudo autorizar la descarga"));
  const response = await fetch(data.signedUrl);
  if (!response.ok) throw new Error("No se pudo descargar el PDF.");
  return response.blob();
}

export async function sendWorkspaceEmail(messageId: string) {
  const { data, error } = await client().functions.invoke("send-workspace-email", { body: { messageId } });
  if (error) {
    const context = "context" in error ? (error as { context?: Response }).context : undefined;
    const details = context ? await context.clone().json().catch(() => null) as { error?: unknown } | null : null;
    if (typeof details?.error === "string") throw new Error(details.error);
    throw new Error(errorMessage(error, "No se pudo enviar el email"));
  }
  if (!data?.ok) throw new Error(typeof data?.error === "string" ? data.error : "No se pudo enviar el email.");
  return data as { ok: true; sentAt: string; resendId: string };
}
