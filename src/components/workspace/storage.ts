import { isWorkspaceData, type WorkspaceData } from "./model";

export const STORAGE_KEY = "enzothome-workspace-v1";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("enzothome-workspace-files", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("No se pudo abrir el almacenamiento de archivos."));
  });
}
export async function saveFile(id: string, file: Blob) {
  const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("No se pudo guardar el archivo. Revisá el espacio del navegador."));
    tx.onabort = () => reject(new Error("Se interrumpió el guardado del archivo."));
  }); } finally { db.close(); }
}
export async function getFile(id: string): Promise<Blob | undefined> {
  const db = await database();
  try { return await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("No se pudo leer el archivo."));
  }); } finally { db.close(); }
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
}
export async function exportBackup(data: WorkspaceData) {
  const files: Record<string, string> = {};
  for (const client of data.clients) {
    if (!client.logoFileId) continue;
    const blob = await getFile(client.logoFileId);
    if (!blob) throw new Error(`Falta el logo de «${client.company}». No se exportó un respaldo incompleto.`);
    files[client.logoFileId] = await dataUrl(blob);
  }
  for (const account of data.bankAccounts || []) {
    if (!account.iconFileId) continue;
    const blob = await getFile(account.iconFileId);
    if (!blob) throw new Error(`Falta el ícono de «${account.bankName}». No se exportó un respaldo incompleto.`);
    files[account.iconFileId] = await dataUrl(blob);
  }
  for (const doc of data.documents) {
    if (!doc.fileId) continue;
    const blob = await getFile(doc.fileId);
    if (!blob) throw new Error(`Falta el archivo adjunto de «${doc.title}». No se exportó un respaldo incompleto.`);
    files[doc.fileId] = await dataUrl(blob);
  }
  download(new Blob([JSON.stringify({ data, files }, null, 2)], { type: "application/json" }), `enzo-workspace-${new Date().toISOString().slice(0, 10)}.json`);
}
export async function importBackup(file: File): Promise<WorkspaceData> {
  if (file.size > 100 * 1024 * 1024) throw new Error("El respaldo supera el límite de 100 MB.");
  const parsed = JSON.parse(await file.text());
  if (!isWorkspaceData(parsed.data) || !parsed.files || typeof parsed.files !== "object") throw new Error("El archivo no es un respaldo válido de este espacio.");
  const data: WorkspaceData = parsed.data;
  const attachments: { id: string; blob: Blob }[] = [];
  const restoreFile = (encoded: unknown) => {
    if (typeof encoded !== "string" || !/^data:[^,]*;base64,/.test(encoded)) throw new Error("El respaldo tiene un archivo incompleto.");
    const [header, body] = encoded.split(",");
    const decoded = atob(body);
    return new Blob([Uint8Array.from(decoded, c => c.charCodeAt(0))], { type: header.slice(5).split(";")[0] });
  };
  for (const client of data.clients) {
    if (!client.logoFileId) continue;
    const blob = restoreFile(parsed.files[client.logoFileId]);
    client.logoFileId = crypto.randomUUID();
    attachments.push({ id: client.logoFileId, blob });
  }
  for (const account of data.bankAccounts || []) {
    if (!account.iconFileId) continue;
    const blob = restoreFile(parsed.files[account.iconFileId]);
    account.iconFileId = crypto.randomUUID();
    attachments.push({ id: account.iconFileId, blob });
  }
  for (const doc of data.documents) {
    if (!doc.fileId) continue;
    const blob = restoreFile(parsed.files[doc.fileId]);
    // New keys preserve existing attachments if the import is interrupted.
    doc.fileId = crypto.randomUUID();
    attachments.push({ id: doc.fileId, blob });
  }
  for (const attachment of attachments) await saveFile(attachment.id, attachment.blob);
  return data;
}
