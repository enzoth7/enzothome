"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "./ui";
import { documentKinds, money, projectStatuses, safeUrl, taskStatuses, today, uid, type Collection, type Collections, type Invoice, type InvoiceLine, type WorkspaceData } from "./model";
import { saveFile } from "./storage";
import type { WorkspaceFileKind } from "./backend";
import { Icon } from "./ui";

export type Entity = Collections[Collection];
export const singular: Record<Collection, string> = { clients: "cliente", projects: "proyecto", tasks: "fase", documents: "documento", invoices: "factura", approvals: "revisión", resources: "enlace", messages: "borrador" };
type Field = { name: string; label: string; type?: string; options?: { value: string; label: string }[]; required?: boolean; hint?: string; wide?: boolean; value?: string | number };
const options = (values: string[]) => values.map(value => ({ value, label: value }));

export default function Editor({ collection, item, data, clientId, projectId, onSave, onClose, onUpload }: { collection: Collection; item?: Entity; data: WorkspaceData; clientId: string; projectId: string; onSave: (collection: Collection, item: Entity) => void; onClose: () => void; onUpload?: (kind: WorkspaceFileKind, ownerId: string, file: File) => Promise<{ fileId: string; fileName: string }> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (collection === "invoices") return <InvoiceEditor item={item as Invoice | undefined} data={data} clientId={clientId} projectId={projectId} onSave={invoice => onSave("invoices", invoice)} onClose={onClose} onUpload={onUpload} />;
  const projectOptions = data.projects.filter(p => clientId === "all" || p.clientId === clientId).map(p => ({ value: p.id, label: `${data.clients.find(c => c.id === p.clientId)?.company} · ${p.title}` }));
  const project: Field = { name: "projectId", label: "Proyecto", options: projectOptions, value: projectId !== "all" ? projectId : projectOptions[0]?.value, wide: true };
  const title: Field = { name: "title", label: "Título", wide: true };
  const fields: Record<Collection, Field[]> = {
    clients: [ { name: "company", label: "Empresa" }, { name: "name", label: "Persona de contacto" }, { name: "email", label: "Email", type: "email", required: false }, { name: "language", label: "Idioma del portal y las comunicaciones", options: options(["Español", "Inglés"]), hint: "La interfaz se adapta automáticamente. Redactá los contenidos del proyecto en este idioma.", wide: true }, { name: "logo", label: "Logo de la empresa", type: "file", required: false, wide: true, hint: "PNG, JPG, WebP o SVG. Hasta 5 MB. Se conserva para la ubicación que definamos después." }, { name: "notes", label: "Notas internas", type: "textarea", required: false, wide: true, hint: "Solo se muestran en Operaciones." } ],
    projects: [ { name: "clientId", label: "Cliente", options: data.clients.map(c => ({ value: c.id, label: c.company })), value: clientId !== "all" ? clientId : data.clients[0]?.id, wide: true }, title, { name: "description", label: "Alcance acordado", type: "textarea", wide: true, hint: "Resumí qué incluye el trabajo y cuál es el resultado acordado." }, { name: "status", label: "Estado general del proyecto", options: options(projectStatuses) }, { name: "start", label: "Fecha de inicio", type: "date", value: today() }, { name: "due", label: "Fin estimado del proyecto", type: "date", value: today() } ],
    tasks: [project, { ...title, label: "Nombre de la fase" }, { name: "owner", label: "Responsable", options: options(["Enzo", "Cliente"]) }, { name: "status", label: "Estado de la fase", options: options(taskStatuses) }, { name: "due", label: "Fin estimado de la fase", type: "date", value: today() } ],
    documents: [project, title, { name: "kind", label: "Tipo", options: options(documentKinds) }, { name: "status", label: "Visibilidad", options: options(["Borrador", "Compartido", "Aceptado"]), hint: "Los borradores solo se ven en Operaciones. Aceptado registra una confirmación; no es una firma digital." }, { name: "date", label: "Fecha", type: "date", value: today() }, { name: "content", label: "Contenido o descripción", type: "textarea", required: false, wide: true }, { name: "file", label: "Archivo adjunto", type: "file", required: false, wide: true, hint: "Hasta 20 MB. El archivo queda guardado de forma privada en Supabase." } ],
    invoices: [],
    approvals: [project, title, { name: "description", label: "Qué debe revisar o confirmar el cliente", type: "textarea", wide: true }, { name: "due", label: "Responder antes de", type: "date", value: today() } ],
    resources: [project, title, { name: "kind", label: "Tipo", options: options(["Sistema", "Archivos", "Reunión", "Sitio web", "Otro"]) }, { name: "url", label: "Enlace", type: "url", wide: true }, { name: "description", label: "Descripción", type: "textarea", required: false, wide: true } ],
    messages: [],
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const values: Record<string, string | number> = {};
      fields[collection].filter(f => f.type !== "file").forEach(f => { values[f.name] = f.type === "number" ? Number(form.get(f.name)) : String(form.get(f.name) || "").trim(); });
      if (fields[collection].some(f => f.required !== false && f.type !== "file" && !String(values[f.name] ?? "").trim())) throw new Error("Completá los campos obligatorios.");
      if (collection === "projects" && values.due < values.start) throw new Error("La entrega debe ser posterior al inicio.");
      if (collection === "resources" && !safeUrl(String(values.url))) throw new Error("Usá un enlace válido que empiece con https:// o http://.");
      const result = { ...item, ...values, id: item?.id || uid() } as unknown as Entity;
      if (collection === "tasks" && !(result as Collections["tasks"]).kind) Object.assign(result, { kind: "Hito" });
      if (collection === "clients") {
        const logo = form.get("logo");
        if (logo instanceof File && logo.size > 0) {
          if (logo.size > 5 * 1024 * 1024) throw new Error("El logo supera los 5 MB.");
          if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(logo.type)) throw new Error("Usá un logo PNG, JPG, WebP o SVG.");
          if (onUpload) {
            const uploaded = await onUpload("logo", result.id, logo);
            Object.assign(result, { logoFileId: uploaded.fileId, logoFileName: uploaded.fileName });
          } else {
            const logoFileId = uid(); await saveFile(logoFileId, logo); Object.assign(result, { logoFileId, logoFileName: logo.name });
          }
        }
      }
      if (collection === "approvals") Object.assign(result, { status: "Pendiente", response: "", respondedAt: "" });
      if (collection === "documents") {
        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          if (file.size > 20 * 1024 * 1024) throw new Error("El archivo supera los 20 MB.");
          if (onUpload) {
            const uploaded = await onUpload("document", result.id, file);
            Object.assign(result, { fileId: uploaded.fileId, fileName: uploaded.fileName });
          } else {
            const fileId = uid(); await saveFile(fileId, file); Object.assign(result, { fileId, fileName: file.name });
          }
        } else if (!item) Object.assign(result, { fileId: "", fileName: "" });
        if (!values.content && !(result as Collections["documents"]).fileId) throw new Error("Agregá contenido o un archivo adjunto.");
      }
      onSave(collection, result); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar. Intentá de nuevo."); }
    finally { setBusy(false); }
  }
  return <Modal title={`${item ? "Editar" : "Nuevo"} ${singular[collection]}`} onClose={onClose}>
    <form onSubmit={submit} className="ew-form">
      {collection === "approvals" && item && <div className="ew-form-note ew-full">Guardar una nueva versión vuelve a pedir aprobación y limpia la respuesta anterior.</div>}
      {fields[collection].map(field => {
        const id = `field-${field.name}`;
        const value = (item as unknown as Record<string, string | number>)?.[field.name] ?? field.value ?? "";
        return <div key={field.name} className={field.wide ? "ew-field ew-full" : "ew-field"}>
          <label htmlFor={id}>{field.label}{field.required === false ? " (opcional)" : ""}</label>
          {field.options ? <select id={id} name={field.name} defaultValue={value || field.options[0]?.value} required>{field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : field.type === "textarea" ? <textarea id={id} name={field.name} defaultValue={value} rows={5} required={field.required !== false} maxLength={30000} /> : <input id={id} name={field.name} type={field.type || "text"} accept={field.name === "logo" ? "image/png,image/jpeg,image/webp,image/svg+xml" : undefined} defaultValue={field.type === "file" ? undefined : value} required={field.required !== false} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? "0.01" : undefined} maxLength={field.type === "text" || !field.type ? 240 : undefined} />}
          {field.hint && <div className="ew-hint">{field.hint}</div>}
          {field.name === "file" && item && "fileName" in item && item.fileName && <div className="ew-hint">Adjunto actual: {item.fileName}. Si elegís otro, se reemplaza.</div>}
          {field.name === "logo" && item && (item as Collections["clients"]).logoFileName && <div className="ew-hint">Logo actual: {(item as Collections["clients"]).logoFileName}. Si elegís otro, se reemplaza.</div>}
        </div>;
      })}
      {error && <div className="ew-error ew-full" role="alert">{error}</div>}
      <footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="ew-button" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button></footer>
    </form>
  </Modal>;
}

function InvoiceEditor({ item, data, clientId, projectId, onSave, onClose, onUpload }: { item?: Invoice; data: WorkspaceData; clientId: string; projectId: string; onSave: (invoice: Invoice) => void; onClose: () => void; onUpload?: (kind: WorkspaceFileKind, ownerId: string, file: File) => Promise<{ fileId: string; fileName: string }> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [currency, setCurrency] = useState(item?.currency || "USD");
  const [lines, setLines] = useState<InvoiceLine[]>(item?.lines?.length ? item.lines : [{ id: uid(), description: "", amount: 0 }]);
  const projectOptions = data.projects.filter(project => clientId === "all" || project.clientId === clientId).map(project => ({ value: project.id, label: `${data.clients.find(client => client.id === project.clientId)?.company} · ${project.title}` }));
  const total = Math.round(lines.reduce((sum, line) => sum + (Number.isFinite(line.amount) ? line.amount : 0), 0) * 100) / 100;
  function updateLine(id: string, changes: Partial<InvoiceLine>) { setLines(current => current.map(line => line.id === id ? { ...line, ...changes } : line)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const number = String(form.get("number") || "").trim();
      const project = String(form.get("projectId") || "").trim();
      const currency = String(form.get("currency") || "USD");
      const date = String(form.get("date") || "");
      const due = String(form.get("due") || "");
      const cleanLines = lines.map(line => ({ ...line, description: line.description.trim(), amount: Math.round(Number(line.amount) * 100) / 100 }));
      if (!number || !project || !date || !due) throw new Error("Completá los campos obligatorios.");
      if (data.invoices.some(invoice => invoice.number.toLowerCase() === number.toLowerCase() && invoice.id !== item?.id)) throw new Error("Ya existe una factura con esa referencia.");
      if (cleanLines.some(line => !line.description || !Number.isFinite(line.amount) || line.amount <= 0)) throw new Error("Cada línea necesita una descripción y un importe mayor a cero.");
      const amount = Math.round(cleanLines.reduce((sum, line) => sum + line.amount, 0) * 100) / 100;
      if (amount <= 0) throw new Error("Agregá al menos una línea con importe.");
      const result: Invoice = { id: item?.id || uid(), projectId: project, number, title: `Factura ${number}`, amount, currency, date, due, paid: item?.paid || 0, paidAt: item?.paidAt || "", paymentInfo: "", lines: cleanLines, fileId: item?.fileId || "", fileName: item?.fileName || "" };
      if (result.paid > result.amount) throw new Error("El nuevo total no puede ser menor que los pagos ya registrados.");
      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > 20 * 1024 * 1024) throw new Error("El PDF supera los 20 MB.");
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("La factura debe ser un archivo PDF.");
        if (onUpload) {
          const uploaded = await onUpload("invoice", result.id, file);
          result.fileId = uploaded.fileId; result.fileName = uploaded.fileName;
        } else {
          const fileId = uid(); await saveFile(fileId, file); result.fileId = fileId; result.fileName = file.name;
        }
      }
      onSave(result); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la factura."); }
    finally { setBusy(false); }
  }
  return <Modal title={item ? "Editar factura" : "Nueva factura"} onClose={onClose} wide><form className="ew-form" onSubmit={submit}><div className="ew-field ew-full"><label htmlFor="invoice-project">Proyecto</label><select id="invoice-project" name="projectId" defaultValue={item?.projectId || (projectId !== "all" ? projectId : projectOptions[0]?.value)} required>{projectOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div className="ew-field"><label htmlFor="invoice-number">Número de referencia</label><input id="invoice-number" name="number" defaultValue={item?.number || ""} required maxLength={120} /></div><div className="ew-field"><label htmlFor="invoice-currency">Moneda</label><select id="invoice-currency" name="currency" value={currency} onChange={event => setCurrency(event.target.value)}>{["USD", "UYU", "EUR", "GBP"].map(option => <option key={option}>{option}</option>)}</select></div><div className="ew-field"><label htmlFor="invoice-date">Fecha de emisión</label><input id="invoice-date" name="date" type="date" defaultValue={item?.date || today()} required /></div><div className="ew-field"><label htmlFor="invoice-due">Vencimiento</label><input id="invoice-due" name="due" type="date" defaultValue={item?.due || today()} required /></div><section className="ew-invoice-lines ew-full" aria-labelledby="invoice-lines-title"><div className="ew-section-heading"><h3 id="invoice-lines-title">Líneas de la factura</h3><button type="button" className="ew-button ew-secondary" onClick={() => setLines(current => [...current, { id: uid(), description: "", amount: 0 }])}><Icon name="plus" size={16} />Agregar línea</button></div>{lines.map((line, index) => <div className="ew-invoice-line" key={line.id}><div className="ew-field"><label htmlFor={`invoice-line-description-${line.id}`}>Descripción {index + 1}</label><input id={`invoice-line-description-${line.id}`} value={line.description} onChange={event => updateLine(line.id, { description: event.target.value })} required maxLength={500} /></div><div className="ew-field"><label htmlFor={`invoice-line-amount-${line.id}`}>Importe</label><input id={`invoice-line-amount-${line.id}`} type="number" min="0.01" step="0.01" value={line.amount || ""} onChange={event => updateLine(line.id, { amount: Number(event.target.value) })} required /></div><button type="button" className="ew-icon-button ew-delete" aria-label={`Eliminar línea ${index + 1}`} disabled={lines.length === 1} onClick={() => setLines(current => current.filter(entry => entry.id !== line.id))}><Icon name="close" size={17} /></button></div>)}<div className="ew-invoice-total"><div>Total</div><output>{money(total, currency)}</output></div></section><div className="ew-field ew-full"><label htmlFor="invoice-file">Factura en PDF (opcional)</label><input id="invoice-file" name="file" type="file" accept="application/pdf,.pdf" /><div className="ew-hint">PDF de hasta 20 MB. El cliente podrá descargarlo desde su portal.</div>{item?.fileName && <div className="ew-hint">Adjunto actual: {item.fileName}. Si elegís otro, se reemplaza.</div>}</div>{error && <div className="ew-error ew-full" role="alert">{error}</div>}<footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="ew-button" disabled={busy}>{busy ? "Guardando…" : "Guardar factura"}</button></footer></form></Modal>;
}
