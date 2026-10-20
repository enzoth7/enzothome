"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import Editor, { type Entity } from "./Editor";
import { portalText } from "./copy";
import { Badge, Icon, Modal } from "./ui";
import { createWorkspaceSeed, dateLabel, documentKinds, internalChecklistItems, invoiceOutstandingByCurrency, invoiceStatus, isWorkspaceData, money, projectPaymentSummary, safeUrl, today, uid, type Approval, type BankAccount, type Client, type Collection, type Document, type Invoice, type Message, type MessageAttachment, type Project, type WorkspaceData } from "./model";
import { download, exportBackup, getFile, importBackup, saveFile, STORAGE_KEY } from "./storage";
import { deleteBankAccount, deleteWorkspaceEntity, deleteWorkspaceProject, downloadAdminDocument, downloadPortalDocument, downloadPortalInvoice, getPortalFileUrl, getCurrentUser, hasSupabaseConfig, importWorkspaceData, loadAdminWorkspace, loadPortalWorkspace, publicLogoUrl, saveBankAccount, savePortalEntity, saveWorkspaceEntity, sendAdminMagicLink, sendWorkspaceEmail, signOutAdmin, uploadWorkspaceFile, type WorkspaceFileKind } from "./backend";
import "./workspace.css";

type View = "home" | Collection | "banking" | "checklist" | "settings";
type Dialog = { kind: "editor"; collection: Collection; item?: Entity } | { kind: "document"; item: Document } | { kind: "invoice"; item: Invoice } | { kind: "approval"; item: Approval } | { kind: "delete"; collection: Collection; item: Entity } | { kind: "message"; clientId?: string; item?: Message } | { kind: "bank-account"; item?: BankAccount } | { kind: "delete-bank-account"; item: BankAccount } | { kind: "payment"; item: Invoice } | { kind: "intake"; item: Project } | null;
const navLabels: Partial<Record<View, string>> = { home: "Vista general", clients: "Clientes", projects: "Proyectos", checklist: "Checklist web", documents: "Documentos", invoices: "Facturas y pagos", banking: "Cuentas bancarias", approvals: "Revisiones", resources: "Enlaces útiles", messages: "Comunicaciones", settings: "Respaldo y datos" };
const portalNavLabels: Partial<Record<View, string>> = { home: "Overview", projects: "Projects", documents: "Documents", invoices: "Invoices & payments", approvals: "Reviews", resources: "Useful links" };
const descriptions: Partial<Record<View, string>> = {
  clients: "Cada relación, con su contexto y su espacio de trabajo.", projects: "Alcance, etapa actual y fechas clave de cada trabajo.", checklist: "Control interno de salida para cada proyecto web. Esta información nunca aparece en el portal del cliente.", documents: "Contratos, alcances y propuestas, siempre a mano.", invoices: "Líneas, importes y estado de cada factura.", banking: "Tus cuentas y qué clientes pueden ver cada una.", approvals: "Lo que el cliente tiene que revisar, confirmar o dejar acordado.", resources: "Accesos directos a las herramientas y archivos del proyecto.", messages: "Prepará cada comunicación con el contexto del cliente.", settings: "Los datos de este espacio se guardan en este navegador.",
};
const portalDescriptions: Partial<Record<View, string>> = {
  projects: "Agreed scope, current stage and key dates.",
  documents: "Service agreements, project scopes and commercial proposals in one place.",
  invoices: "Amounts and payment details.",
  approvals: "Anything that needs your review or confirmation.",
  resources: "Quick access to project tools and files.",
};

export default function Workspace({ mode }: { mode: "portal" | "ops" }) {
  const ops = mode === "ops";
  const [data, setData] = useState<WorkspaceData | null>(null);
  const dataRef = useRef<WorkspaceData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<View>("home");
  const [clientId, setClientId] = useState(ops ? "all" : "pearl");
  const [projectId, setProjectId] = useState("all");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingImport, setPendingImport] = useState<File | null>(null);
  const [authState, setAuthState] = useState<"checking" | "signed-in" | "signed-out" | "local">("checking");
  const [portalAccessToken, setPortalAccessToken] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(() => new Set());
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const backupInput = useRef<HTMLInputElement>(null);
  const backend = hasSupabaseConfig();

  const nav: View[] = ops ? ["home", "clients", "projects", "checklist", "documents", "invoices", "banking", "approvals", "resources", "messages"] : ["home", "projects", "documents", "invoices", "approvals", "resources"];
  useEffect(() => {
    let active = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    const localData = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const loaded: unknown = saved ? JSON.parse(saved) : createWorkspaceSeed();
      if (!isWorkspaceData(loaded)) throw new Error("Los datos guardados no se pueden leer. Podés recuperar un respaldo desde Operaciones.");
      const cleaned = {
        ...loaded,
        clients: loaded.clients.map(client => ({ ...client, notes: ["Cliente de demostración. Completar los datos antes de preparar comunicaciones.", "Cliente de demostración. Los proyectos, importes y fechas son ilustrativos."].includes(client.notes) ? "" : client.notes })),
        projects: loaded.projects.map(project => Object.fromEntries(Object.entries(project).filter(([key]) => key !== "nextStep")) as Project),
        documents: loaded.documents.filter(document => !["d1", "d2", "d3"].includes(document.id) && !(document.title === "Prueba de adjunto y respaldo" && document.fileName === "BRAND_BOOK.md")),
        invoices: loaded.invoices.filter(invoice => !(["i1", "i2", "i3"].includes(invoice.id) && invoice.number.startsWith("DEMO-"))),
        bankAccounts: loaded.bankAccounts || [],
      };
      if (!saved || JSON.stringify(cleaned) !== JSON.stringify(loaded)) localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    };
    const setWorkspace = (next: WorkspaceData) => { if (!active) return; dataRef.current = next; setData(next); };
    const syncLocation = () => {
        const params = new URLSearchParams(window.location.search);
        const requestedClient = params.get("client");
        const current = dataRef.current;
        if (current && requestedClient && (current.clients.some(c => c.id === requestedClient) || (ops && requestedClient === "all"))) setClientId(requestedClient);
        else if (!ops && current) setClientId(current.clients[0]?.id || "");
        const requestedView = params.get("view") as View;
        const allowed = ops ? ["home", "clients", "projects", "checklist", "documents", "invoices", "banking", "approvals", "resources", "messages", "settings"] : ["home", "projects", "documents", "invoices", "approvals", "resources"];
        setView(allowed.includes(requestedView) ? requestedView : "home");
        setProjectId("all"); setSearch(""); setFilter("Todos");
    };
    const syncStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY || !event.newValue) return;
        try { const next = JSON.parse(event.newValue); if (isWorkspaceData(next)) { dataRef.current = next; setData(next); } } catch { setNotice("No se pudo sincronizar el cambio de otra pestaña."); }
    };
    async function loadRemote() {
      if (ops) {
        const user = await getCurrentUser();
        if (!active) return;
        if (!user) { setAuthState("signed-out"); setData(null); return; }
        setAuthState("signed-in");
        let remote = await loadAdminWorkspace();
        if (!remote.clients.length) {
          await importWorkspaceData(localData());
          remote = await loadAdminWorkspace();
        }
        setWorkspace(remote);
      } else {
        const token = new URLSearchParams(window.location.search).get("access") || "";
        setPortalAccessToken(token);
        const remote = await loadPortalWorkspace(token);
        setWorkspace(remote);
        setClientId(remote.clients[0]?.id || "");
      }
      syncLocation();
    }
    async function load() {
      try {
        if (backend) {
          await loadRemote();
          if (!ops) poll = setInterval(() => { void loadRemote().catch(() => undefined); }, 15000);
        } else {
          setAuthState("local");
          setWorkspace(localData());
          syncLocation();
          window.addEventListener("storage", syncStorage);
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : "No se pudo abrir el espacio.");
      }
    }
    void load();
    window.addEventListener("popstate", syncLocation);
    const focus = () => { if (backend) void loadRemote().catch(() => undefined); };
    window.addEventListener("focus", focus);
    return () => {
      active = false;
      if (poll) clearInterval(poll);
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("focus", focus);
    };
  }, [ops, backend]);
  useEffect(() => { if (notice) { const timeout = setTimeout(() => setNotice(""), 6000); return () => clearTimeout(timeout); } }, [notice]);
  useEffect(() => {
    if (!mobileMoreOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileMoreOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mobileMoreOpen]);
  useEffect(() => {
    if (ops || !data) return;
    const previousLanguage = document.documentElement.lang;
    const language = data.clients.find(client => client.id === clientId)?.language === "Inglés" ? "en" : "es";
    document.documentElement.lang = language;
    return () => { document.documentElement.lang = previousLanguage; };
  }, [ops, data, clientId]);

  const commit = (mutate: (current: WorkspaceData) => WorkspaceData) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const latest: unknown = backend ? dataRef.current : raw ? JSON.parse(raw) : dataRef.current;
    if (!isWorkspaceData(latest)) throw new Error("No se pudo leer la última versión. Exportá tus datos antes de continuar.");
    const next = mutate(latest);
    if (!backend) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    dataRef.current = next; setData(next);
    return next;
  };
  const save = async (collection: Collection, item: Entity) => {
    const previous = dataRef.current;
    commit(current => ({ ...current, [collection]: current[collection].some(e => e.id === item.id) ? current[collection].map(e => e.id === item.id ? item : e) : [...current[collection], item] }));
    try {
      if (backend) {
        if (ops) await saveWorkspaceEntity(collection, item);
        else await savePortalEntity(portalAccessToken, collection, item);
      }
      setNotice(!ops && dataRef.current?.clients.find(client => client.id === clientId)?.language === "Inglés" ? "Changes saved." : "Cambios guardados y sincronizados.");
      return true;
    } catch (error) {
      if (previous) { dataRef.current = previous; setData(previous); }
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
      return false;
    }
  };
  const saveAccount = async (account: BankAccount) => {
    const previous = dataRef.current;
    commit(current => ({ ...current, bankAccounts: (current.bankAccounts || []).some(item => item.id === account.id) ? (current.bankAccounts || []).map(item => item.id === account.id ? account : item) : [...(current.bankAccounts || []), account] }));
    try {
      if (backend) await saveBankAccount(account);
      setNotice("Cuenta bancaria guardada y asignaciones actualizadas.");
      return true;
    } catch (error) {
      if (previous) { dataRef.current = previous; setData(previous); }
      setNotice(error instanceof Error ? error.message : "No se pudo guardar la cuenta bancaria.");
      return false;
    }
  };
  const removeAccount = async (id: string) => {
    const previous = dataRef.current;
    commit(current => ({ ...current, bankAccounts: (current.bankAccounts || []).filter(item => item.id !== id) }));
    try {
      if (backend) await deleteBankAccount(id);
      setNotice("Cuenta bancaria eliminada.");
      return true;
    } catch (error) {
      if (previous) { dataRef.current = previous; setData(previous); }
      setNotice(error instanceof Error ? error.message : "No se pudo eliminar la cuenta bancaria.");
      return false;
    }
  };
  function action(work: () => unknown | Promise<unknown>) { Promise.resolve().then(work).catch(error => setNotice(error instanceof Error ? error.message : "No se pudo guardar el cambio.")); }
  async function portalFile(itemId: string, kind: "document" | "invoice" | "receipt", mode: "view" | "download", localPath: string, fileName: string) {
    const tab = mode === "view" ? window.open("", "_blank") : null;
    if (tab) { tab.opener = null; tab.document.title = fileName; }
    try {
      let url: string;
      if (backend) url = await getPortalFileUrl(portalAccessToken, itemId, kind, mode);
      else {
        const blob = await getFile(localPath);
        if (!blob) throw new Error(t("No se encontró el archivo.", "File not found."));
        if (mode === "download") { download(blob, fileName); return; }
        url = URL.createObjectURL(blob);
        window.setTimeout(() => URL.revokeObjectURL(url), 120000);
      }
      if (mode === "view") {
        if (tab && !tab.closed) tab.location.replace(url);
        else window.location.assign(url);
      } else window.location.assign(url);
    } catch (error) {
      tab?.close();
      setNotice(error instanceof Error ? error.message : t("No se pudo abrir el archivo.", "Could not open the file."));
    }
  }
  function navigate(next: View, client = clientId) {
    setView(next); setClientId(client); setSearch(""); setFilter("Todos"); setProjectId("all"); setMobileMoreOpen(false);
    const access = !ops && portalAccessToken ? `access=${encodeURIComponent(portalAccessToken)}&` : `client=${encodeURIComponent(client)}&`;
    window.history.pushState({}, "", `/${mode}?${access}view=${next}`);
  }
  function newItem(collection: Collection) {
    if (collection !== "clients" && !data?.clients.length) { setNotice("Primero creá un cliente."); return; }
    if (!["clients", "projects", "messages"].includes(collection) && !data?.projects.some(p => clientId === "all" || p.clientId === clientId)) { setNotice("Primero creá un proyecto para este cliente."); return; }
    setDialog({ kind: "editor", collection });
  }
  async function backup() { if (!data) return; setBusy(true); try { if (backend) download(new Blob([JSON.stringify({ data, files: {} }, null, 2)], { type: "application/json" }), `enzo-workspace-${today()}.json`); else await exportBackup(data); setNotice(backend ? "Respaldo de datos descargado." : "Respaldo descargado, incluidos los archivos adjuntos."); } catch (e) { setNotice(e instanceof Error ? e.message : "No se pudo exportar."); } finally { setBusy(false); } }
  async function restore(file: File) {
    setPendingImport(null);
    setBusy(true);
    try { const next = await importBackup(file); if (backend) await importWorkspaceData(next); else localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); dataRef.current = next; setData(next); setLoadError(""); setProjectId("all"); setClientId(ops ? "all" : next.clients[0]?.id || ""); setNotice("Respaldo restaurado."); }
    catch (e) { setNotice(e instanceof Error ? e.message : "No se pudo importar el respaldo."); } finally { setBusy(false); }
  }
  if (ops && backend && authState === "signed-out") return <AdminLogin onSend={sendAdminMagicLink} />;
  if (!data) return <div className="et-workspace ew-loading"><h1>{loadError ? "No pudimos abrir el espacio" : "Preparando tu espacio…"}</h1>{loadError && <><div role="alert">{loadError}</div>{!backend && <label className="ew-button">Recuperar respaldo<input type="file" accept=".json" hidden onChange={e => { const file = e.target.files?.[0]; if (file) void restore(file); }} /></label>}</>}{notice && <div role="status">{notice}</div>}</div>;

  const client = data.clients.find(c => c.id === clientId);
  const english = !ops && client?.language === "Inglés";
  const t = (es: string, en?: string) => en ? (english ? en : es) : portalText(es, english);
  const clientProjects = data.projects.filter(p => clientId === "all" || p.clientId === clientId);
  const projects = clientProjects.filter(p => projectId === "all" || p.id === projectId);
  const checklistProject = clientProjects.find(project => project.id === projectId) || clientProjects[0];
  const ids = new Set(projects.map(p => p.id));
  const phases = data.tasks.filter(task => ids.has(task.projectId) && task.kind === "Hito");
  const completedPhases = phases.filter(task => task.status === "Completada").length;
  const matches = (entry: object) => JSON.stringify(entry).toLocaleLowerCase().includes(search.toLocaleLowerCase());
  const scoped = <T extends { projectId: string }>(entries: T[]) => entries.filter(e => ids.has(e.projectId));
  const documents = scoped(data.documents).filter(d => ops || d.status !== "Borrador");
  const invoices = scoped(data.invoices);
  const invoiceProjectSummaries = projects.map(project => projectPaymentSummary(project, data.invoices));
  const approvals = scoped(data.approvals);
  const pendingApprovals = approvals.filter(a => a.status === "Pendiente" || (ops && a.status === "Cambios solicitados"));
  const outstanding = invoices.filter(i => i.paid < i.amount);
  const resources = scoped(data.resources);
  const bankAccounts = (data.bankAccounts || []).filter(account => clientId === "all" || account.clientIds.includes(clientId));
  const projectName = (id: string) => data.projects.find(p => p.id === id)?.title || "Proyecto";
  const companyFor = (id: string) => data.clients.find(c => c.id === data.projects.find(p => p.id === id)?.clientId)?.company || "";
  const editButton = (collection: Collection, item: Entity) => {
    if (!ops) return null;
    const itemName = "title" in item ? item.title : "company" in item ? item.company : "registro";
    const editTitle = collection === "projects" ? "Editar alcance, estado y fechas" : collection === "tasks" ? "Editar fase, fecha y estado" : "Editar";
    return <div className="ew-row-actions"><button className="ew-icon-button ew-action-button" aria-label={`${editTitle}: ${itemName}`} title={editTitle} onClick={() => setDialog({ kind: "editor", collection, item })}><Icon name="edit" size={18} /></button><button className="ew-icon-button ew-delete" aria-label={`Eliminar ${itemName}`} title="Eliminar" onClick={() => setDialog({ kind: "delete", collection, item })}><Icon name="close" size={16} /></button></div>;
  };
  const portalClient = data.clients.find(item => item.id === (clientId === "all" ? data.clients[0]?.id : clientId));
  const clientPortalLink = (target?: Client) => backend && target?.portalToken ? `/portal?access=${encodeURIComponent(target.portalToken)}` : `/portal?client=${encodeURIComponent(target?.id || "")}`;
  const portalLink = clientPortalLink(portalClient);
  const addButton = (collection: Collection, label: string) => <button className="ew-button" onClick={() => newItem(collection)}><Icon name="plus" size={17} />{label}</button>;
  const emptyRow = (columns: number, title: string, description: string) => <tr><td className="ew-table-empty" colSpan={columns}><strong>{title}</strong><div>{description}</div></td></tr>;
  const projectColumns = ops ? 9 : 7;
  const projectRow = (project: Project) => {
    const milestones = data.tasks.filter(t => t.projectId === project.id && t.kind === "Hito").sort((a, b) => a.due.localeCompare(b.due));
    const done = milestones.filter(t => t.status === "Completada").length;
    const currentMilestone = milestones.find(item => ["En curso", "En revisión"].includes(item.status)) || milestones.find(item => item.status !== "Completada") || milestones.at(-1);
    const expanded = expandedProjects.has(project.id);
    const togglePath = () => setExpandedProjects(current => {
      const next = new Set(current);
      if (next.has(project.id)) next.delete(project.id); else next.add(project.id);
      return next;
    });
    return <Fragment key={project.id}>
      <tr className="ew-project-summary-row">
        {ops && <td><strong>{companyFor(project.id)}</strong></td>}
        <td><strong>{project.title}</strong><small><Badge>{t(project.status)}</Badge></small></td>
        {ops && <td className="ew-tabular"><strong>{project.value ? money(project.value, project.currency || "USD") : "—"}</strong></td>}
        <td className="ew-project-scope">{project.description || "—"}</td>
        <td className="ew-project-current">{currentMilestone ? <><strong>{currentMilestone.title}</strong><small><Badge>{t(currentMilestone.status)}</Badge></small></> : "—"}</td>
        <td className="ew-tabular">{currentMilestone ? dateLabel(currentMilestone.due, english ? "en-GB" : "es-UY") : "—"}</td>
        <td className="ew-tabular">{dateLabel(project.start, english ? "en-GB" : "es-UY")}</td>
        <td className="ew-tabular">{dateLabel(project.due, english ? "en-GB" : "es-UY")}</td>
        <td><div className="ew-table-actions">
          <button className={`ew-icon-button ew-action-button ${expanded ? "is-active" : ""}`} aria-label={expanded ? t("Ocultar camino del proyecto", "Hide project path") : t("Ver camino del proyecto", "View project path")} title={expanded ? t("Ocultar camino", "Hide project path") : t("Ver camino", "View project path")} aria-expanded={expanded} onClick={togglePath}><Icon name="eye" size={18} /></button>
          {editButton("projects", project)}
        </div></td>
      </tr>
      {expanded && <tr className="ew-project-path-row"><td colSpan={projectColumns}>
        <div className="ew-project-path-heading">
          <strong>{t("Camino general del proyecto", "Project overview")}</strong>
          <div className="ew-project-path-meta"><div>{done} / {milestones.length} {t("etapas completadas", "stages completed")}</div>{ops && <button className="ew-icon-button ew-action-button" aria-label="Agregar etapa" title="Agregar etapa" onClick={() => { setProjectId(project.id); setDialog({ kind: "editor", collection: "tasks" }); }}><Icon name="plus" size={18} /></button>}</div>
        </div>
        {milestones.length ? <div className="ew-project-path" role="list" aria-label={`${t("Camino general del proyecto", "Project overview")} · ${project.title}`}>{milestones.map((task, index) => {
          const complete = task.status === "Completada";
          const current = ["En curso", "En revisión"].includes(task.status);
          return <div className={`ew-project-stage ${complete ? "is-complete" : current ? "is-current" : ""}`} role="listitem" aria-current={current ? "step" : undefined} key={task.id}>
            <div className="ew-project-stage-marker">{complete ? <Icon name="check" size={14} /> : index + 1}</div>
            <strong>{task.title}</strong>
            <div className="ew-project-stage-detail">{t(task.status)} · {dateLabel(task.due, english ? "en-GB" : "es-UY")}</div>
            {ops && <div className="ew-table-actions ew-project-stage-actions"><button className={`ew-icon-button ew-action-button ${complete ? "is-paid" : ""}`} aria-label={complete ? `${task.title} completada` : `Marcar ${task.title} como completada`} title={complete ? "Fase completada" : "Marcar como completada"} disabled={complete} onClick={() => action(() => save("tasks", { ...task, status: "Completada" }))}><Icon name="check" size={17} /></button>{editButton("tasks", task)}</div>}
          </div>;
        })}</div> : <div className="ew-project-path-empty">{t("Las etapas generales aparecerán aquí.", "The main stages will appear here.")}</div>}
      </td></tr>}
    </Fragment>;
  };
  const portalProjectCard = (project: Project) => {
    const stages = data.tasks.filter(task => task.projectId === project.id && task.kind === "Hito").sort((a, b) => a.due.localeCompare(b.due));
    const current = stages.find(task => ["En curso", "En revisión"].includes(task.status)) || stages.find(task => task.status !== "Completada");
    return <article className="ew-mobile-card" key={project.id}>
      <div className="ew-mobile-card-head"><h3>{project.title}</h3><Badge>{t(project.status)}</Badge></div>
      {project.description && <p>{project.description}</p>}
      <dl className="ew-mobile-facts"><div><dt>{t("Inicio del proyecto", "Project start")}</dt><dd>{dateLabel(project.start, english ? "en-GB" : "es-UY")}</dd></div><div><dt>{t("Fin del proyecto", "Project end")}</dt><dd>{dateLabel(project.due, english ? "en-GB" : "es-UY")}</dd></div>{current && <div><dt>{t("Etapa actual", "Current stage")}</dt><dd>{current.title} · {dateLabel(current.due, english ? "en-GB" : "es-UY")}</dd></div>}</dl>
      <details className="ew-mobile-details"><summary>{t("Ver etapas", "View stages")} ({stages.length})</summary>{stages.length ? <ol className="ew-mobile-timeline">{stages.map(stage => <li key={stage.id} className={stage.status === "Completada" ? "is-complete" : ""}><strong>{stage.title}</strong><span>{t(stage.status)} · {dateLabel(stage.due, english ? "en-GB" : "es-UY")}</span></li>)}</ol> : <p>{t("Las etapas generales aparecerán aquí.", "The main stages will appear here.")}</p>}</details>
    </article>;
  };
  const portalApprovalCard = (item: Approval) => <article className="ew-mobile-card" key={item.id}>
    <div className="ew-mobile-card-head"><h3>{item.title}</h3><Badge>{t(item.status)}</Badge></div>
    <p className="ew-mobile-project-name">{projectName(item.projectId)}</p>
    {item.description && <p>{item.description}</p>}
    <dl className="ew-mobile-facts"><div><dt>{t("Vencimiento", "Due")}</dt><dd>{dateLabel(item.due, english ? "en-GB" : "es-UY")}</dd></div>{item.response && <div><dt>{t("Respuesta", "Response")}</dt><dd>{item.response}</dd></div>}</dl>
    <button className="ew-button ew-secondary ew-mobile-full-action" onClick={() => setDialog({ kind: "approval", item })}><Icon name={item.status === "Pendiente" ? "reply" : "eye"} size={18} />{t(item.status === "Pendiente" ? "Revisar y responder" : "Ver respuesta", item.status === "Pendiente" ? "Review and respond" : "View response")}</button>
  </article>;
  const portalDocumentCard = (item: Document) => <article className="ew-mobile-card" key={item.id}>
    <div className="ew-mobile-card-head"><h3>{item.title}</h3><Badge>{t(item.status)}</Badge></div>
    <p className="ew-mobile-project-name">{projectName(item.projectId)} · {t(item.kind)}</p>
    {item.content && <p>{item.content}</p>}
    <dl className="ew-mobile-facts"><div><dt>{t("Fecha", "Date")}</dt><dd>{dateLabel(item.date, english ? "en-GB" : "es-UY")}</dd></div></dl>
    {item.fileId ? <div className="ew-mobile-file"><strong>{item.fileName || t("Documento adjunto", "Attached document")}</strong><div className="ew-mobile-actions"><button onClick={() => void portalFile(item.id, "document", "view", item.fileId, item.fileName || item.title)}><Icon name="eye" size={18} />{t("Ver", "View")}</button><button onClick={() => void portalFile(item.id, "document", "download", item.fileId, item.fileName || item.title)}><Icon name="download" size={18} />{t("Descargar", "Download")}</button></div></div> : <p className="ew-mobile-muted">{t("Sin archivo adjunto", "No attached file")}</p>}
    {item.status !== "Aceptado" && <button className="ew-button ew-secondary ew-mobile-full-action" onClick={() => action(() => save("documents", { ...item, status: "Aceptado" }))}><Icon name="check" size={18} />{t("Aceptar documento", "Accept document")}</button>}
  </article>;
  const portalInvoiceCard = (item: Invoice) => {
    const remaining = Math.max(0, item.amount - item.paid);
    const locale = english ? "en-GB" : "es-UY";
    return <article className="ew-mobile-card ew-mobile-invoice" key={item.id}>
      <div className="ew-mobile-card-head"><div><span className="ew-mobile-eyebrow">{t("Factura", "Invoice")} {item.number}</span><h3>{projectName(item.projectId)}</h3></div><Badge>{t(invoiceStatus(item))}</Badge></div>
      <dl className="ew-mobile-facts ew-mobile-invoice-facts"><div><dt>{t("Importe", "Amount")}</dt><dd>{money(item.amount, item.currency)}</dd></div><div><dt>{t("Total pagado", "Total paid")}</dt><dd className="ew-mobile-paid">{money(item.paid, item.currency)}</dd></div><div><dt>{t("Resta", "Remaining")}</dt><dd className={remaining > 0 ? "ew-mobile-remaining" : ""}>{money(remaining, item.currency)}</dd></div>{item.paidAt && <div><dt>{t("Pagado", "Paid")}</dt><dd>{dateLabel(item.paidAt, locale)}</dd></div>}</dl>
      <button className="ew-mobile-detail-link" onClick={() => setDialog({ kind: "invoice", item })}>{t("Ver detalle de la factura", "View invoice details")}<Icon name="arrow" size={17} /></button>
      {item.fileId ? <div className="ew-mobile-file"><strong>{t("Factura PDF", "Invoice PDF")} · {item.fileName || `${item.number}.pdf`}</strong><div className="ew-mobile-actions"><button onClick={() => void portalFile(item.id, "invoice", "view", item.fileId || "", item.fileName || `${item.number}.pdf`)}><Icon name="eye" size={18} />{t("Ver", "View")}</button><button onClick={() => void portalFile(item.id, "invoice", "download", item.fileId || "", item.fileName || `${item.number}.pdf`)}><Icon name="download" size={18} />{t("Descargar", "Download")}</button></div></div> : <p className="ew-mobile-muted">{t("Factura PDF no disponible", "Invoice PDF unavailable")}</p>}
      {item.receiptFileName && <div className="ew-mobile-file"><strong>{t("Recibo", "Receipt")} · {item.receiptFileName}</strong><div className="ew-mobile-actions"><button onClick={() => void portalFile(item.id, "receipt", "view", item.receiptFileId || "", item.receiptFileName || "receipt.pdf")}><Icon name="eye" size={18} />{t("Ver", "View")}</button><button onClick={() => void portalFile(item.id, "receipt", "download", item.receiptFileId || "", item.receiptFileName || "receipt.pdf")}><Icon name="download" size={18} />{t("Descargar", "Download")}</button></div></div>}
    </article>;
  };
  const portalProjectPaymentCard = (summary: ReturnType<typeof projectPaymentSummary>) => <article className="ew-mobile-card ew-mobile-project-payment" key={summary.projectId}>
    <h3>{summary.title}</h3>
    <div className="ew-mobile-project-payment-start"><span>{t("Fecha inicio", "Start date")}</span><strong>{dateLabel(summary.start, english ? "en-GB" : "es-UY")}</strong></div>
    {summary.amounts.length ? <div className="ew-mobile-project-payment-amounts">{summary.amounts.map(amount => <div className="ew-mobile-project-payment-amount" key={amount.currency}>
      <strong className="ew-mobile-project-payment-currency">{amount.currency}</strong>
      <dl><div><dt>{t("Total", "Total")}</dt><dd>{money(amount.total, amount.currency)}</dd></div><div><dt>{t("Total pagado", "Total paid")}</dt><dd className="ew-mobile-paid">{money(amount.paid, amount.currency)}</dd></div><div><dt>{t("Resta", "Remaining")}</dt><dd className={amount.remaining > 0 ? "ew-mobile-remaining" : ""}>{money(amount.remaining, amount.currency)}</dd></div></dl>
    </div>)}</div> : <p className="ew-mobile-muted">{t("Todavía no hay un valor o facturas para este proyecto.", "No value or invoices for this project yet.")}</p>}
    <div className="ew-mobile-project-payment-date"><span>{t("Último pago", "Last payment")}</span><strong>{summary.lastPaidAt ? dateLabel(summary.lastPaidAt, english ? "en-GB" : "es-UY") : "—"}</strong></div>
  </article>;
  const portalResourceCard = (item: WorkspaceData["resources"][number]) => <article className="ew-mobile-card" key={item.id}><div className="ew-mobile-card-head"><h3>{item.title}</h3><Badge>{t(item.kind)}</Badge></div><p className="ew-mobile-project-name">{projectName(item.projectId)}</p>{item.description && <p>{item.description}</p>}<a className="ew-button ew-secondary ew-mobile-full-action" href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer"><Icon name="external" size={18} />{t("Abrir enlace", "Open link")}</a></article>;
  const mobileEmpty = (message: string) => <div className="ew-mobile-empty">{message}</div>;
  const allClientProjectIds = new Set(clientProjects.map(project => project.id));
  const outstandingByCurrency = invoiceOutstandingByCurrency(data.invoices.filter(invoice => allClientProjectIds.has(invoice.projectId)));
  return <div className={`et-workspace ${ops ? "is-ops" : "is-portal"}`}>
    <aside className="ew-sidebar">
      <Link href="/" className="ew-wordmark" aria-label="Enzo Thome, ir al sitio"><Image src="/LogoTransp.png" alt="Enzo Thome" width={1200} height={1200} priority /></Link>
      {ops && <div className="ew-client-switch"><label htmlFor="workspace-client">Ver cuenta</label><select id="workspace-client" value={clientId} onChange={e => navigate("home", e.target.value)}><option value="all">Todos los clientes</option>{data.clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></div>}
      <nav aria-label={ops ? "Operaciones" : t("Portal de clientes", "Client portal")}>{nav.map(key => <button key={key} onClick={() => navigate(key)} className={view === key ? "is-active" : ""} aria-current={view === key ? "page" : undefined}><Icon name={key} /><div>{t(navLabels[key] || "", portalNavLabels[key] || "")}</div>{!ops && key === "documents" && documents.length > 0 && <b className="ew-nav-count" aria-label={t(`${documents.length} documentos disponibles`, `${documents.length} documents available`)}>{documents.length}</b>}{key === "approvals" && pendingApprovals.length > 0 && <b className="ew-nav-count">{pendingApprovals.length}</b>}</button>)}</nav>
      <div className="ew-sidebar-bottom">{ops && <><button className={view === "settings" ? "is-active" : ""} onClick={() => navigate("settings")}><Icon name="settings" />Respaldo y datos</button><Link href={portalLink}><Icon name="external" />Ver como cliente</Link>{backend && <button onClick={() => action(async () => { await signOutAdmin(); window.location.reload(); })}><Icon name="close" />Cerrar sesión</button>}</>}</div>
    </aside>
    <div className="ew-main-wrap">
      <header className="ew-topbar"><div>{ops ? "Operaciones" : client?.company || t("Tu espacio", "Your space")}<b>/</b>{t(navLabels[view] || "", portalNavLabels[view] || "")}</div><Link className="ew-site-link" href="/">enzothome.com <Icon name="external" size={14} /></Link></header>
      <main id="main-content" className="ew-main">
        <header className="ew-page-heading"><div><h1>{view === "home" ? ops ? "Todo, en su lugar." : t(`Hola, ${client?.name || "bienvenido"}.`, `Hello, ${client?.name || "there"}.`) : t(navLabels[view] || "", portalNavLabels[view] || "")}</h1><div className="ew-intro">{view === "home" ? ops ? "Una vista clara de tus clientes, tus proyectos y lo que necesita atención." : t("Este es tu espacio. Lo que estamos construyendo y todo lo que necesitás, a mano.", "Your projects, reviews and documents are all here.") : t(descriptions[view] || "", portalDescriptions[view] || "")}</div></div><div className="ew-heading-action">{view === "home" ? ops ? addButton("projects", "Nuevo proyecto") : <button className="ew-button" onClick={() => navigate("approvals")}>{t("Ver pendientes", "View pending reviews")}<Icon name="arrow" size={17} /></button> : view === "banking" && ops ? <button className="ew-button" onClick={() => setDialog({ kind: "bank-account" })}><Icon name="plus" size={17} />Nueva cuenta</button> : ops && !["settings", "messages", "checklist"].includes(view) ? addButton(view as Collection, ({ clients: "Nuevo cliente", projects: "Nuevo proyecto", tasks: "Nueva tarea", documents: "Nuevo documento", invoices: "Nueva factura", approvals: "Pedir revisión", resources: "Agregar enlace" } as Record<string, string>)[view]) : view === "messages" ? <button className="ew-button" onClick={() => setDialog({ kind: "message" })}><Icon name="plus" size={17} />Preparar email</button> : null}</div></header>

        {view === "home" && <>
          <div className="ew-stats"><Stat label={t("Por revisar")} value={String(pendingApprovals.length).padStart(2, "0")} detail={ops ? "Esperando al cliente" : t("Tu opinión nos ayuda a avanzar")} icon="approvals" onClick={() => navigate("approvals")} /><Stat label={t("Facturas pendientes")} value={String(outstanding.length).padStart(2, "0")} detail={t(outstanding.length ? "Ver importes y pagos" : "Todo al día", outstanding.length ? "View amounts and payments" : "All up to date")} icon="invoices" onClick={() => navigate("invoices")} /><Stat label={t("Documentos disponibles")} value={String(documents.length).padStart(2, "0")} detail={t("Contratos, alcances y propuestas")} icon="documents" onClick={() => navigate("documents")} /><PhaseProgress completed={completedPhases} total={phases.length} label={t("Fases completadas", "Completed phases")} onClick={() => navigate(ops ? "tasks" : "projects")} /></div>
          <section className="ew-section"><div className="ew-section-heading"><h2>{ops ? "Proyectos en marcha" : t("En qué estamos trabajando")}</h2><button className="ew-text-button" onClick={() => navigate("projects")}>{t("Ver todos")}<Icon name="arrow" size={15} /></button></div><div className="ew-table-wrap ew-project-table-wrap"><table className="ew-table ew-data-table ew-project-table"><thead><tr>{ops && <th>{t("Cliente")}</th>}<th>{t("Proyecto")}</th>{ops && <th>{t("Valor")}</th>}<th>{t("Alcance acordado")}</th><th>{t("Etapa actual")}</th><th>{t("Fin de etapa")}</th><th>{t("Inicio del proyecto", "Project start")}</th><th>{t("Fin del proyecto")}</th><th>{t("Acciones")}</th></tr></thead><tbody>{projects.filter(p => p.status !== "Finalizado").slice(0, 4).map(projectRow)}{!projects.some(p => p.status !== "Finalizado") && emptyRow(projectColumns, t("Todo listo para empezar"), ops ? "Creá un proyecto para organizar el trabajo." : t("Los nuevos proyectos van a aparecer aquí."))}</tbody></table></div></section>
          <section className="ew-section"><div className="ew-section-heading"><h2>{ops ? "Necesita atención" : t("Revisiones pendientes", "Pending reviews")}</h2></div><div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>{t("Tipo")}</th><th>{t("Pendiente")}</th><th>{t("Fecha")}</th><th>{t("Acción")}</th></tr></thead><tbody>{pendingApprovals.slice(0, 5).map(a => <tr key={a.id}><td>{t("Revisión")}</td><td><strong>{a.title}</strong><small>{companyFor(a.projectId)}</small></td><td>{dateLabel(a.due, english ? "en-GB" : "es-UY")}</td><td><button className="ew-icon-button ew-action-button" aria-label={t("Revisar y responder")} title={t("Revisar y responder")} onClick={() => setDialog({ kind: "approval", item: a })}><Icon name={ops ? "eye" : "reply"} size={18} /></button></td></tr>)}{!pendingApprovals.length && emptyRow(4, t("Todo al día."), t("No hay revisiones pendientes por ahora.", "There are no pending reviews right now."))}</tbody></table></div></section>
        </>}

        {view === "checklist" && ops && (checklistProject ? <section className="ew-checklist-shell" aria-labelledby="internal-checklist-title">
          <div className="ew-checklist-toolbar">
            <label htmlFor="checklist-project">Proyecto</label>
            <select id="checklist-project" value={checklistProject.id} onChange={event => setProjectId(event.target.value)}>{clientProjects.map(project => <option key={project.id} value={project.id}>{companyFor(project.id)} · {project.title}</option>)}</select>
          </div>
          <div className="ew-checklist-summary">
            <div><div className="ew-checklist-eyebrow">Checklist privada</div><h2 id="internal-checklist-title">{checklistProject.title}</h2><div className="ew-muted">{companyFor(checklistProject.id)}</div></div>
            <div className="ew-checklist-progress" aria-live="polite"><strong>{checklistProject.internalChecklist?.length || 0}<span>/{internalChecklistItems.length}</span></strong><div>puntos listos</div></div>
          </div>
          <progress className="ew-checklist-progressbar" value={checklistProject.internalChecklist?.length || 0} max={internalChecklistItems.length} aria-label={`${checklistProject.internalChecklist?.length || 0} de ${internalChecklistItems.length} puntos completados`} />
          <div className="ew-checklist-grid">
            {internalChecklistItems.map((item, index) => {
              const checked = checklistProject.internalChecklist?.includes(item.id) || false;
              return <label className={`ew-checklist-item ${checked ? "is-checked" : ""}`} key={item.id}>
                <input type="checkbox" checked={checked} onChange={() => action(() => save("projects", { ...checklistProject, internalChecklist: checked ? (checklistProject.internalChecklist || []).filter(id => id !== item.id) : [...(checklistProject.internalChecklist || []), item.id] }))} />
                <span className="ew-checklist-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="ew-checklist-label">{item.label}</span>
                <span className="ew-checklist-mark" aria-hidden="true"><Icon name="check" size={16} /></span>
              </label>;
            })}
          </div>
        </section> : <div className="ew-empty"><Icon name="checklist" size={30} /><h3>No hay proyectos para revisar</h3><div>Creá un proyecto y su checklist aparecerá acá.</div></div>)}

        {!["home", "settings", "messages", "checklist"].includes(view) && <div className="ew-toolbar"><label className="ew-search"><Icon name="search" size={19} /><input type="search" aria-label={t(`Buscar en ${navLabels[view]}`, `Search ${portalNavLabels[view]}`)} placeholder={t("Buscar en esta sección…")} value={search} onChange={e => setSearch(e.target.value)} /></label>{!["clients", "projects", "banking"].includes(view) && <select aria-label={t("Filtrar por proyecto")} value={projectId} onChange={e => setProjectId(e.target.value)}><option value="all">{t("Todos los proyectos")}</option>{clientProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select>}{view === "documents" && <select aria-label={t("Tipo de documento")} value={filter} onChange={e => setFilter(e.target.value)}>{["Todos", ...documentKinds].map(v => <option key={v} value={v}>{t(v)}</option>)}</select>}{view === "invoices" && <select aria-label={t("Estado de factura")} value={filter} onChange={e => setFilter(e.target.value)}>{["Todos", "Pendiente", "Pago parcial", "Pagada", "Vencida"].map(v => <option key={v} value={v}>{t(v)}</option>)}</select>}</div>}

        {view === "projects" && <div className="ew-table-wrap ew-project-table-wrap"><table className="ew-table ew-data-table ew-project-table"><thead><tr>{ops && <th>{t("Cliente")}</th>}<th>{t("Proyecto")}</th>{ops && <th>{t("Valor")}</th>}<th>{t("Alcance acordado")}</th><th>{t("Etapa actual")}</th><th>{t("Fin de etapa")}</th><th>{t("Inicio del proyecto", "Project start")}</th><th>{t("Fin del proyecto")}</th><th>{t("Acciones")}</th></tr></thead><tbody>{projects.filter(matches).map(projectRow)}{!projects.filter(matches).length && emptyRow(projectColumns, t("No hay proyectos para mostrar"), t("Probá otra búsqueda o creá un nuevo proyecto."))}</tbody></table></div>}

        {view === "clients" && ops && <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>Empresa</th><th>Contacto</th><th>Email</th><th>Idioma</th><th>Proyectos</th><th>Notas internas</th><th>Acciones</th></tr></thead><tbody>{data.clients.filter(c => (clientId === "all" || c.id === clientId) && matches(c)).map(c => <tr key={c.id}><td><div className="ew-table-identity"><ClientLogo client={c} className="ew-company-mark" /><strong>{c.company}</strong></div></td><td>{c.name}</td><td>{c.email || "Pendiente"}</td><td><label className="ew-visually-hidden" htmlFor={`client-language-${c.id}`}>Idioma del portal de {c.company}</label><select id={`client-language-${c.id}`} value={c.language} onChange={event => action(() => save("clients", { ...c, language: event.target.value }))}><option value="Español">Español</option><option value="Inglés">Inglés</option></select></td><td>{data.projects.filter(p => p.clientId === c.id).length}</td><td>{c.notes || "—"}</td><td><div className="ew-table-actions"><Link className="ew-icon-button ew-action-button" href={clientPortalLink(c)} aria-label={`Ver portal de ${c.company}`} title="Ver portal"><Icon name="external" size={18} /></Link><button className="ew-icon-button ew-action-button" aria-label={`Ver proyectos de ${c.company}`} title="Ver proyectos" onClick={() => navigate("projects", c.id)}><Icon name="projects" size={18} /></button>{editButton("clients", c)}</div></td></tr>)}{!data.clients.filter(c => (clientId === "all" || c.id === clientId) && matches(c)).length && emptyRow(7, "No hay clientes para mostrar", "Agregá un cliente o cambiá la búsqueda.")}</tbody></table></div>}

        {view === "banking" && ops && <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>Banco o plataforma</th><th>Moneda</th><th>Titular</th><th>Cuenta / IBAN</th><th>Enlace directo</th><th>Datos adicionales</th><th>Visible para</th><th>Acciones</th></tr></thead><tbody>{bankAccounts.filter(matches).map(account => <tr key={account.id}><td><div className="ew-table-identity ew-bank-table-identity"><BankAccountIcon account={account} className="ew-bank-account-icon" /><strong>{account.bankName}</strong></div></td><td><Badge>{account.currency}</Badge></td><td>{account.accountHolder}</td><td>{account.accountNumber || "—"}</td><td>{account.paymentUrl ? <a className="ew-text-button" href={safeUrl(account.paymentUrl)} target="_blank" rel="noopener noreferrer">Abrir enlace <Icon name="external" size={14} /></a> : "—"}</td><td>{account.instructions || "—"}</td><td>{account.clientIds.length ? account.clientIds.map(id => data.clients.find(client => client.id === id)?.company).filter(Boolean).join(", ") : "Ningún cliente"}</td><td><div className="ew-table-actions"><button className="ew-icon-button ew-action-button" aria-label={`Editar ${account.bankName}`} title="Editar cuenta" onClick={() => setDialog({ kind: "bank-account", item: account })}><Icon name="edit" size={18} /></button><button className="ew-icon-button ew-delete" aria-label={`Eliminar ${account.bankName}`} title="Eliminar cuenta" onClick={() => setDialog({ kind: "delete-bank-account", item: account })}><Icon name="close" size={16} /></button></div></td></tr>)}{!bankAccounts.filter(matches).length && emptyRow(8, "No hay cuentas bancarias para mostrar", "Agregá una cuenta o cambiá la búsqueda.")}</tbody></table></div>}


        {view === "documents" && <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>{t("Documento")}</th><th>{t("Tipo")}</th><th>{t("Cliente / proyecto")}</th><th>{t("Fecha")}</th><th>{t("Estado")}</th><th>{t("Archivo")}</th><th>{t("Acciones")}</th></tr></thead><tbody>{documents.filter(d => matches(d) && (filter === "Todos" || d.kind === filter)).map(d => { const accepted = d.status === "Aceptado"; return <tr key={d.id}><td><strong>{d.title}</strong><small>{d.content}</small></td><td>{t(d.kind)}</td><td>{companyFor(d.projectId)}<small>{projectName(d.projectId)}</small></td><td>{dateLabel(d.date, english ? "en-GB" : "es-UY")}</td><td><Badge>{t(d.status)}</Badge></td><td>{d.fileName || "—"}</td><td><div className="ew-table-actions">{ops ? <button className="ew-icon-button ew-action-button" aria-label={`Abrir ${d.title}`} title="Abrir documento" onClick={() => setDialog({ kind: "document", item: d })}><Icon name="eye" size={18} /></button> : <><button className="ew-icon-button ew-action-button" disabled={!d.fileId} aria-label={t("Ver documento", "View document")} title={t("Ver documento", "View document")} onClick={() => void portalFile(d.id, "document", "view", d.fileId, d.fileName || d.title)}><Icon name="eye" size={18} /></button><button className="ew-icon-button ew-action-button" disabled={!d.fileId} aria-label={t("Descargar documento", "Download document")} title={t("Descargar documento", "Download document")} onClick={() => void portalFile(d.id, "document", "download", d.fileId, d.fileName || d.title)}><Icon name="download" size={18} /></button><button className="ew-icon-button ew-action-button is-accept" disabled={accepted} aria-label={t(accepted ? "Documento aceptado" : "Aceptar documento")} title={t(accepted ? "Documento aceptado" : "Aceptar documento")} onClick={() => action(() => save("documents", { ...d, status: "Aceptado" }))}><Icon name="check" size={18} /></button></>}{editButton("documents", d)}</div></td></tr>; })}{!documents.filter(d => matches(d) && (filter === "Todos" || d.kind === filter)).length && emptyRow(7, t("No hay documentos en esta vista"), t("Los documentos compartidos van a aparecer aquí."))}</tbody></table></div>}

        {view === "invoices" && <>
          {!ops && <BankAccountKpis accounts={bankAccounts} english={english} />}
          {ops && <section className="ew-payment-overview" aria-labelledby="payment-overview-title">
            <div className="ew-payment-overview-heading"><h2 id="payment-overview-title">Resumen por proyecto</h2></div>
            <div className="ew-table-wrap"><table className="ew-table ew-payment-summary-table"><thead><tr><th>Proyecto</th><th>Fecha inicio</th><th>Total</th><th>Total pagado</th><th>Resta</th><th>Pagado</th></tr></thead><tbody>{invoiceProjectSummaries.map(summary => <tr key={summary.projectId}><td><strong>{summary.title}</strong><small>{companyFor(summary.projectId)}</small></td><td className="ew-tabular">{dateLabel(summary.start)}</td><td>{summary.amounts.length ? summary.amounts.map(amount => <div className="ew-payment-money" key={amount.currency}><strong>{money(amount.total, amount.currency)}</strong><span>{amount.currency}</span></div>) : "—"}</td><td>{summary.amounts.length ? summary.amounts.map(amount => <div className="ew-payment-money ew-payment-money-paid" key={amount.currency}><strong>{money(amount.paid, amount.currency)}</strong><span>{amount.currency}</span></div>) : "—"}</td><td>{summary.amounts.length ? summary.amounts.map(amount => <div className="ew-payment-money ew-payment-money-remaining" key={amount.currency}><strong>{money(amount.remaining, amount.currency)}</strong><span>{amount.currency}</span></div>) : "—"}</td><td className="ew-tabular">{summary.lastPaidAt ? dateLabel(summary.lastPaidAt) : "—"}</td></tr>)}{!invoiceProjectSummaries.length && emptyRow(6, "No hay proyectos para resumir", "Creá un proyecto para ver su estado de pagos.")}</tbody></table></div>
          </section>}
          {ops && <div className="ew-payment-history-heading"><h2>Histórico de pagos, facturas y recibos</h2></div>}
          <div className="ew-table-wrap"><table className="ew-table ew-data-table">
            <thead><tr><th>{t("Factura")}</th><th>{t("Cliente / proyecto")}</th><th>{t("Emisión")}</th>{ops && <th>{t("Vencimiento")}</th>}<th>{t("Pagada el")}</th><th>{t("Importe")}</th><th>{t("Estado")}</th><th>{t("Acciones")}</th></tr></thead>
            <tbody>{invoices.filter(i => matches(i) && (filter === "Todos" || invoiceStatus(i) === filter)).map(i => {
              const paid = i.paid >= i.amount;
              const hasPayment = i.paid > 0;
              const locale = english ? "en-GB" : "es-UY";
              return <tr key={i.id}>
                <td><strong>{i.number}</strong>{i.fileName && <small>{i.fileName}</small>}{i.receiptFileName && <small>{t("Recibo", "Receipt")}: {i.receiptFileName}</small>}</td>
                <td>{companyFor(i.projectId)}<small>{projectName(i.projectId)}</small></td>
                <td>{dateLabel(i.date, locale)}</td>
                {ops && <td>{dateLabel(i.due, locale)}</td>}
                <td>{i.paidAt ? dateLabel(i.paidAt, locale) : "—"}</td>
                <td><strong>{money(i.amount, i.currency)}</strong><small>{t("Resta")} {money(i.amount - i.paid, i.currency)}</small></td>
                <td><Badge>{t(invoiceStatus(i))}</Badge></td>
                <td><div className="ew-table-actions"><button className="ew-icon-button ew-action-button" aria-label={t("Ver detalle")} title={t("Ver detalle")} onClick={() => setDialog({ kind: "invoice", item: i })}><Icon name="eye" size={18} /></button>{ops && <><button className="ew-icon-button ew-action-button" aria-label="Editar factura" title="Editar factura" onClick={() => setDialog({ kind: "editor", collection: "invoices", item: i })}><Icon name="edit" size={18} /></button><button className={`ew-icon-button ew-action-button ${paid ? "is-paid" : ""}`} aria-label={hasPayment ? "Editar pago" : "Registrar pago"} title={hasPayment ? "Editar fecha, recibo o registrar otro pago" : "Registrar pago"} onClick={() => setDialog({ kind: "payment", item: i })}><Icon name="check" size={19} /></button><button className="ew-icon-button ew-delete" aria-label={`Eliminar factura ${i.number}`} title={`Eliminar factura ${i.number}`} onClick={() => setDialog({ kind: "delete", collection: "invoices", item: i })}><Icon name="close" size={16} /></button></>}</div></td>
              </tr>;
            })}{!invoices.filter(i => matches(i) && (filter === "Todos" || invoiceStatus(i) === filter)).length && emptyRow(ops ? 8 : 7, t("Sin facturas en esta vista"), t("Las facturas y sus estados van a aparecer aquí."))}</tbody>
          </table></div>{ops && <div className="ew-inline-note">El registro controla importes, fechas de pago y recibos. Las facturas y los recibos adjuntos se pueden consultar desde el portal del cliente correspondiente.</div>}
        </>}

        {view === "approvals" && <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>{t("Revisión")}</th><th>{t("Cliente / proyecto")}</th><th>{t("Descripción")}</th><th>{t("Vencimiento")}</th><th>{t("Estado")}</th><th>{t("Respuesta")}</th><th>{t("Acciones")}</th></tr></thead><tbody>{approvals.filter(matches).map(a => <tr key={a.id}><td><strong>{a.title}</strong></td><td>{companyFor(a.projectId)}<small>{projectName(a.projectId)}</small></td><td>{a.description}</td><td>{dateLabel(a.due, english ? "en-GB" : "es-UY")}</td><td><Badge>{t(a.status)}</Badge></td><td>{a.response || "—"}{a.respondedAt && <small>{dateLabel(a.respondedAt, english ? "en-GB" : "es-UY")}</small>}</td><td><div className="ew-table-actions"><button className="ew-icon-button ew-action-button" aria-label={t(a.status === "Pendiente" ? "Revisar y responder" : "Ver respuesta")} title={t(a.status === "Pendiente" ? "Revisar y responder" : "Ver respuesta")} onClick={() => setDialog({ kind: "approval", item: a })}><Icon name={!ops && a.status === "Pendiente" ? "reply" : "eye"} size={18} /></button>{editButton("approvals", a)}</div></td></tr>)}{!approvals.filter(matches).length && emptyRow(7, t("Todo al día"), t("Cuando haya algo para revisar, lo vas a encontrar acá."))}</tbody></table></div>}

        {view === "resources" && <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>{t("Enlace")}</th><th>{t("Tipo")}</th><th>{t("Cliente / proyecto")}</th><th>{t("Descripción")}</th><th>{t("Acciones")}</th></tr></thead><tbody>{resources.filter(matches).map(r => <tr key={r.id}><td><strong>{r.title}</strong></td><td>{t(r.kind)}</td><td>{companyFor(r.projectId)}<small>{projectName(r.projectId)}</small></td><td>{r.description || "—"}</td><td><div className="ew-table-actions"><a className="ew-icon-button ew-action-button" href={safeUrl(r.url)} target="_blank" rel="noopener noreferrer" aria-label={`${t("Abrir enlace")}: ${r.title}`} title={t("Abrir enlace")}><Icon name="external" size={18} /></a>{editButton("resources", r)}</div></td></tr>)}{!resources.filter(matches).length && emptyRow(5, t("Tus accesos, en un lugar"), t("Agregá enlaces al sistema, archivos compartidos o agenda de reuniones."))}</tbody></table></div>}


        {view === "messages" && ops && <><section className="ew-section"><div className="ew-section-heading"><h2>Crear desde plantilla</h2></div><div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>Momento</th><th>Acción</th></tr></thead><tbody>{["Bienvenida", "Solicitud de accesos", "Reunión de inicio", "Factura", "Revisión", "Cierre", "Testimonio"].map(kind => <tr key={kind}><td><strong>{kind}</strong></td><td><button className="ew-icon-button ew-action-button" aria-label={`Preparar email de ${kind}`} title="Preparar email" onClick={() => { setFilter(kind); setDialog({ kind: "message" }); }}><Icon name="messages" size={18} /></button></td></tr>)}</tbody></table></div></section><section className="ew-section"><div className="ew-section-heading"><h2>Emails preparados</h2><Badge>Resend</Badge></div><div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>Fecha</th><th>Cliente</th><th>Asunto</th><th>Estado</th><th>Adjuntos</th><th>Acciones</th></tr></thead><tbody>{data.messages.filter(m => clientId === "all" || m.clientId === clientId).slice().reverse().map(m => <tr key={m.id}><td>{dateLabel(m.date)}</td><td>{data.clients.find(c => c.id === m.clientId)?.company}</td><td><strong>{m.title}</strong>{m.lastError && <small>{m.lastError}</small>}</td><td><Badge>{m.status || "Borrador"}</Badge></td><td>{m.attachments?.length || 0}</td><td><div className="ew-table-actions"><button className="ew-icon-button ew-action-button" aria-label={`Editar o enviar ${m.title}`} title="Editar o enviar" onClick={() => setDialog({ kind: "message", item: m })}><Icon name="edit" size={18} /></button><button className="ew-icon-button ew-action-button" aria-label={`Copiar código de ${m.title}`} title="Copiar código" onClick={() => { void navigator.clipboard.writeText(m.content).then(() => setNotice("Código HTML copiado.")).catch(() => setNotice("No se pudo copiar.")); }}><Icon name="copy" size={18} /></button><button className="ew-icon-button ew-delete" aria-label={`Eliminar ${m.title}`} title="Eliminar" onClick={() => setDialog({ kind: "delete", collection: "messages", item: m })}><Icon name="close" size={16} /></button></div></td></tr>)}{!data.messages.some(m => clientId === "all" || m.clientId === clientId) && emptyRow(6, "No hay emails preparados", "Elegí una plantilla para crear el primero.")}</tbody></table></div></section></>}

{view === "settings" && ops && <div className="ew-settings"><section className="ew-flat-section"><h2>Guardado y respaldo</h2><div className="ew-prose">{backend ? "Operaciones y cada portal comparten la misma base en Supabase. Los cambios quedan disponibles en todos los dispositivos." : "Operaciones y el portal comparten los datos de este navegador. Exportá un respaldo para trasladarlos."}</div><div className="ew-row-actions"><button className="ew-button" disabled={busy} onClick={() => void backup()}><Icon name="download" />{busy ? "Procesando…" : "Exportar respaldo"}</button><button className="ew-button ew-secondary" disabled={busy} onClick={() => backupInput.current?.click()}>Importar respaldo</button><input ref={backupInput} type="file" accept=".json" hidden onChange={e => { const file = e.target.files?.[0]; if (file) setPendingImport(file); e.target.value = ""; }} /></div></section><section className="ew-flat-section"><h2>Cómo funciona hoy</h2><div className="ew-prose">Las aprobaciones y los pagos se registran manualmente. Los emails se preparan, previsualizan y envían con Resend desde Operaciones. El idioma de cada cliente se configura en Clientes.</div>{backend && <div className="ew-inline-note">Los links de portal y los PDFs son privados para cada cliente. Las notas internas y las tareas internas nunca se incluyen.</div>}</section></div>}
        {!ops && <div className="ew-portal-mobile-only">
          {view === "home" && <>
            <section className="ew-mobile-section"><h2>{t("En qué estamos trabajando", "What we're working on")}</h2><div className="ew-mobile-stack">{projects.filter(project => project.status !== "Finalizado").slice(0, 4).map(portalProjectCard)}{!projects.some(project => project.status !== "Finalizado") && mobileEmpty(t("Los nuevos proyectos van a aparecer aquí.", "New projects will appear here."))}</div><button className="ew-mobile-detail-link" onClick={() => navigate("projects")}>{t("Ver todos los proyectos", "View all projects")}<Icon name="arrow" size={17} /></button></section>
            <section className="ew-mobile-section"><h2>{t("Revisiones pendientes", "Pending reviews")}</h2><div className="ew-mobile-stack">{pendingApprovals.slice(0, 5).map(portalApprovalCard)}{!pendingApprovals.length && mobileEmpty(t("No hay revisiones pendientes por ahora.", "There are no pending reviews right now."))}</div></section>
          </>}
          {view === "projects" && <div className="ew-mobile-stack">{projects.filter(matches).map(portalProjectCard)}{!projects.filter(matches).length && mobileEmpty(t("No hay proyectos para mostrar.", "No projects to show."))}</div>}
          {view === "documents" && <div className="ew-mobile-stack">{documents.filter(item => matches(item) && (filter === "Todos" || item.kind === filter)).map(portalDocumentCard)}{!documents.some(item => matches(item) && (filter === "Todos" || item.kind === filter)) && mobileEmpty(t("Los documentos compartidos van a aparecer aquí.", "Shared documents will appear here."))}</div>}
          {view === "invoices" && <>
            <section className="ew-mobile-balance" aria-labelledby="mobile-balance-title"><h2 id="mobile-balance-title">{t("Saldo pendiente total", "Total outstanding")}</h2>{outstandingByCurrency.length ? <div className="ew-mobile-balance-list">{outstandingByCurrency.map(([currency, amount]) => <div key={currency}><strong>{money(amount, currency)}</strong><span>{currency}</span></div>)}</div> : <p>{t("No tenés saldos pendientes.", "You have no outstanding balance.")}</p>}</section>
            <section className="ew-mobile-section"><h2>{t("Resumen por proyecto", "Summary by project")}</h2><div className="ew-mobile-stack">{invoiceProjectSummaries.map(portalProjectPaymentCard)}{!invoiceProjectSummaries.length && mobileEmpty(t("Los proyectos van a aparecer aquí.", "Projects will appear here."))}</div></section>
            <section className="ew-mobile-section"><h2>{t("Facturas y recibos", "Invoices and receipts")}</h2><div className="ew-mobile-stack">{invoices.filter(item => matches(item) && (filter === "Todos" || invoiceStatus(item) === filter)).map(portalInvoiceCard)}{!invoices.some(item => matches(item) && (filter === "Todos" || invoiceStatus(item) === filter)) && mobileEmpty(t("Las facturas y sus estados van a aparecer aquí.", "Invoices and their status will appear here."))}</div></section>
            {bankAccounts.length > 0 && <section className="ew-mobile-section ew-mobile-payment"><h2>{t("Cómo pagar", "How to pay")}</h2><BankAccountKpis accounts={bankAccounts} english={english} /></section>}
          </>}
          {view === "approvals" && <div className="ew-mobile-stack">{approvals.filter(matches).map(portalApprovalCard)}{!approvals.filter(matches).length && mobileEmpty(t("Cuando haya algo para revisar, lo vas a encontrar acá.", "Items needing review will appear here."))}</div>}
          {view === "resources" && <div className="ew-mobile-stack">{resources.filter(matches).map(portalResourceCard)}{!resources.filter(matches).length && mobileEmpty(t("Tus enlaces van a aparecer acá.", "Your links will appear here."))}</div>}
        </div>}
      </main>
    </div>
    {!ops && <nav className="ew-mobile-nav" aria-label={t("Navegación principal", "Main navigation")}>
      {mobileMoreOpen && <div className="ew-mobile-more" id="portal-more-menu"><div className="ew-mobile-more-title">{t("Más secciones", "More sections")}</div><button onClick={() => navigate("approvals")} aria-current={view === "approvals" ? "page" : undefined}><Icon name="approvals" size={20} />{t("Revisiones", "Reviews")}{pendingApprovals.length > 0 && <span>{pendingApprovals.length}</span>}</button><button onClick={() => navigate("resources")} aria-current={view === "resources" ? "page" : undefined}><Icon name="resources" size={20} />{t("Enlaces", "Links")}</button></div>}
      {(["home", "projects", "documents", "invoices"] as View[]).map(key => {
        const label = key === "home" ? t("Inicio", "Home") : key === "documents" ? t("Documentos", "Documents") : key === "invoices" ? t("Facturas", "Invoices") : t("Proyectos", "Projects");
        return <button key={key} onClick={() => navigate(key)} aria-label={label} title={label} aria-current={view === key ? "page" : undefined}><Icon name={key} size={25} /></button>;
      })}
      <button onClick={() => setMobileMoreOpen(open => !open)} aria-label={t("Más secciones", "More sections")} title={t("Más secciones", "More sections")} aria-expanded={mobileMoreOpen} aria-controls={mobileMoreOpen ? "portal-more-menu" : undefined} aria-current={["approvals", "resources"].includes(view) ? "page" : undefined}><Icon name="more" size={25} /></button>
    </nav>}
    {notice && <div className="ew-toast" role="status"><Icon name="messages" size={18} /><div>{notice}</div><button className="ew-icon-button" aria-label="Cerrar notificación" onClick={() => setNotice("")}><Icon name="close" size={16} /></button></div>}
    {dialog?.kind === "editor" && <Editor collection={dialog.collection} item={dialog.item} data={data} clientId={clientId} projectId={projectId} onSave={(collection, item) => { void save(collection, item); }} onClose={() => setDialog(null)} onUpload={backend && ops ? uploadWorkspaceFile : undefined} />}
    {dialog?.kind === "document" && <DocumentView item={dialog.item} company={companyFor(dialog.item.projectId)} english={english} ops={ops} backend={backend} accessToken={portalAccessToken} onClose={() => setDialog(null)} />}
    {dialog?.kind === "invoice" && <InvoiceView item={dialog.item} company={companyFor(dialog.item.projectId)} english={english} ops={ops} backend={backend} accessToken={portalAccessToken} onPortalFile={portalFile} onClose={() => setDialog(null)} />}
    {dialog?.kind === "approval" && <ApprovalView item={dialog.item} onClose={() => setDialog(null)} onSave={item => { void save("approvals", item); }} english={english} />}
    {dialog?.kind === "payment" && <PaymentView item={dialog.item} onClose={() => setDialog(null)} onSave={item => save("invoices", item)} onUpload={backend && ops ? uploadWorkspaceFile : undefined} />}
    {dialog?.kind === "message" && <MessageComposer data={data} clientId={clientId} kind={filter === "Todos" ? "Bienvenida" : filter} item={dialog.item} canSend={backend} onUpload={backend ? uploadWorkspaceFile : undefined} onSave={item => save("messages", item)} onSend={async item => {
      const saved = await save("messages", item);
      if (!saved) throw new Error("No se pudo guardar el email antes del envío.");
      const result = await sendWorkspaceEmail(item.id);
      const sent = { ...item, status: "Enviado" as const, sentAt: result.sentAt, resendId: result.resendId, lastError: "" };
      commit(current => ({ ...current, messages: current.messages.map(message => message.id === sent.id ? sent : message) }));
      setNotice(`Email enviado a ${data.clients.find(client => client.id === item.clientId)?.email || "el cliente"}.`);
    }} onClose={() => setDialog(null)} />}
    {dialog?.kind === "intake" && <IntakeView item={dialog.item} onSave={item => { void save("projects", item); }} onClose={() => setDialog(null)} english={english} />}
    {dialog?.kind === "bank-account" && <BankAccountEditor item={dialog.item} clients={data.clients} defaultClientId={clientId} onUpload={backend && ops ? uploadWorkspaceFile : undefined} onSave={saveAccount} onClose={() => setDialog(null)} />}
    {pendingImport && <Modal title="Restaurar respaldo" onClose={() => setPendingImport(null)}><div className="ew-dialog-content"><div>Vas a reemplazar los datos de este navegador por el archivo <strong>{pendingImport.name}</strong>. Exportá primero un respaldo si querés conservar la versión actual.</div><div className="ew-row-actions"><button className="ew-button ew-secondary" onClick={() => setPendingImport(null)}>Cancelar</button><button className="ew-button" onClick={() => void restore(pendingImport)}>Restaurar datos</button></div></div></Modal>}
    {dialog?.kind === "delete" && <Modal title={dialog.collection === "projects" ? "Eliminar proyecto" : "Eliminar registro"} onClose={() => setDialog(null)}><div className="ew-dialog-content"><div>¿Eliminar “{"title" in dialog.item ? dialog.item.title : "company" in dialog.item ? dialog.item.company : "registro"}”?</div>{dialog.collection === "clients" && <div className="ew-inline-note">El cliente no se puede eliminar mientras tenga proyectos o borradores asociados.</div>}{dialog.collection === "projects" && (() => { const projectId = dialog.item.id; const counts = [{ label: "etapas", count: data.tasks.filter(item => item.projectId === projectId).length }, { label: "documentos", count: data.documents.filter(item => item.projectId === projectId).length }, { label: "facturas", count: data.invoices.filter(item => item.projectId === projectId).length }, { label: "revisiones", count: data.approvals.filter(item => item.projectId === projectId).length }, { label: "enlaces", count: data.resources.filter(item => item.projectId === projectId).length }].filter(item => item.count > 0); return <div className="ew-inline-note">{counts.length ? `También se eliminarán ${counts.map(item => `${item.count} ${item.label}`).join(", ")}. ` : "Este proyecto no tiene registros asociados. "}El cliente se conservará.</div>; })()}<div className="ew-row-actions"><button className="ew-button ew-secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="ew-button" onClick={() => action(async () => {
      const { collection, item } = dialog;
      if (collection === "projects") {
        if (backend) await deleteWorkspaceProject(item.id);
        commit(current => ({
          ...current,
          projects: current.projects.filter(project => project.id !== item.id),
          tasks: current.tasks.filter(task => task.projectId !== item.id),
          documents: current.documents.filter(document => document.projectId !== item.id),
          invoices: current.invoices.filter(invoice => invoice.projectId !== item.id),
          approvals: current.approvals.filter(approval => approval.projectId !== item.id),
          resources: current.resources.filter(resource => resource.projectId !== item.id),
        }));
        setDialog(null); setNotice("Proyecto y registros asociados eliminados. El cliente se conservó.");
        return;
      }
      commit(current => {
        if (collection === "clients" && (current.projects.some(p => p.clientId === item.id) || current.messages.some(m => m.clientId === item.id))) throw new Error("Este cliente todavía tiene proyectos o borradores asociados.");
        return { ...current, [collection]: current[collection].filter(e => e.id !== item.id), bankAccounts: collection === "clients" ? (current.bankAccounts || []).map(account => ({ ...account, clientIds: account.clientIds.filter(id => id !== item.id) })) : current.bankAccounts };
      });
      if (backend) await deleteWorkspaceEntity(collection, item.id);
      setDialog(null); setNotice("Registro eliminado de los datos activos. Los respaldos exportados se conservan.");
    })}>{dialog.collection === "projects" ? "Eliminar proyecto y sus registros" : "Eliminar registro"}</button></div>{notice && <div role="status">{notice}</div>}</div></Modal>}
    {dialog?.kind === "delete-bank-account" && <Modal title="Eliminar cuenta bancaria" onClose={() => setDialog(null)}><div className="ew-dialog-content"><div>¿Eliminar “{dialog.item.bankName}”? Dejará de aparecer en todos los portales asignados.</div><div className="ew-row-actions"><button className="ew-button ew-secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="ew-button" onClick={() => action(async () => { if (await removeAccount(dialog.item.id)) setDialog(null); })}>Eliminar cuenta</button></div></div></Modal>}
  </div>;
}

function Stat({ label, value, onClick }: { label: string; value: string; detail: string; icon: string; onClick: () => void }) {
  return <button className="ew-stat" onClick={onClick} aria-label={`${label}: ${value}`}><strong>{value}</strong><div className="ew-stat-label">{label}</div></button>;
}

function PhaseProgress({ completed, total, label, onClick }: { completed: number; total: number; label: string; onClick: () => void }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = total ? (completed / total) * circumference : 0;
  return <button className="ew-phase-progress" onClick={onClick} aria-label={`${label}: ${percentage}%`}>
    <span className="ew-phase-donut" aria-hidden="true">
      <svg viewBox="0 0 88 88">
        <circle className="ew-phase-donut-track" cx="44" cy="44" r={radius} />
        <circle className="ew-phase-donut-value" cx="44" cy="44" r={radius} strokeDasharray={`${progress} ${circumference}`} />
      </svg>
      <strong>{percentage}%</strong>
    </span>
    <span className="ew-phase-progress-copy"><span className="ew-stat-label">{label}</span></span>
  </button>;
}

function ClientLogo({ client, className }: { client?: Client; className: string }) {
  const [src, setSrc] = useState("");
  const remoteSrc = client?.logoFileId && hasSupabaseConfig() ? publicLogoUrl(client.logoFileId) : "";
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (!client?.logoFileId || remoteSrc) return;
    void getFile(client.logoFileId).then(blob => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }).catch(() => { if (active) setSrc(""); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [client?.logoFileId, remoteSrc]);
  const imageSrc = remoteSrc || src;
  if (imageSrc && client?.logoFileId) return <div className={`${className} ew-client-logo`}><Image src={imageSrc} alt={`Logo de ${client?.company || "cliente"}`} width={160} height={80} unoptimized /></div>;
  return <div className={className} aria-label={client?.company || "Cliente"}>{client?.company.slice(0, 2).toUpperCase() || "—"}</div>;
}

function BankAccountIcon({ account, className = "ew-bank-account-icon" }: { account: BankAccount; className?: string }) {
  const [src, setSrc] = useState("");
  const remoteSrc = account.iconFileId && hasSupabaseConfig() ? publicLogoUrl(account.iconFileId) : "";
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (!account.iconFileId || remoteSrc) return;
    void getFile(account.iconFileId).then(blob => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }).catch(() => { if (active) setSrc(""); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [account.iconFileId, remoteSrc]);
  const imageSrc = remoteSrc || src;
  return <div className={className}>{imageSrc ? <Image src={imageSrc} alt={`Ícono de ${account.bankName}`} width={80} height={80} unoptimized /> : <Icon name="banking" size={24} />}</div>;
}

function BankAccountKpis({ accounts, english }: { accounts: BankAccount[]; english: boolean }) {
  const [copiedId, setCopiedId] = useState("");
  if (!accounts.length) return null;
  async function copyAccount(account: BankAccount) {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopiedId(account.id);
      window.setTimeout(() => setCopiedId(current => current === account.id ? "" : current), 2200);
    } catch { setCopiedId(""); }
  }
  return <section className="ew-bank-kpis" aria-label={english ? "Available bank accounts" : "Cuentas bancarias disponibles"}>{accounts.map(account => <article className="ew-bank-kpi" key={account.id}><div className="ew-bank-kpi-top"><BankAccountIcon account={account} /><div className="ew-bank-kpi-heading"><strong>{account.bankName}</strong><Badge>{account.currency}</Badge></div></div><div className="ew-bank-kpi-main"><dl><div><dt>{english ? "Account holder" : "Titular"}</dt><dd>{account.accountHolder}</dd></div>{account.accountNumber && <div><dt>{english ? "Account / IBAN" : "Cuenta / IBAN"}</dt><dd className="ew-bank-value"><strong>{account.accountNumber}</strong><button type="button" className="ew-bank-copy" onClick={() => void copyAccount(account)} aria-label={english ? `Copy ${account.bankName} account number` : `Copiar número de cuenta de ${account.bankName}`} title={copiedId === account.id ? english ? "Copied" : "Copiado" : english ? "Copy account number" : "Copiar número de cuenta"}><Icon name={copiedId === account.id ? "check" : "copy"} size={15} /></button></dd></div>}{account.paymentUrl && <div><dt>{english ? "Direct payment link" : "Enlace directo"}</dt><dd><a className="ew-bank-direct-link" href={safeUrl(account.paymentUrl)} target="_blank" rel="noopener noreferrer" aria-label={english ? `Go to ${account.bankName}` : `Ir a ${account.bankName}`}><Icon name="external" size={15} /></a></dd></div>}{account.instructions && <div><dt>{english ? "Additional details" : "Datos adicionales"}</dt><dd>{account.instructions}</dd></div>}</dl></div></article>)}</section>;
}

function DocumentView({ item, company, english, ops, backend, accessToken, onClose }: { item: Document; company: string; english: boolean; ops: boolean; backend: boolean; accessToken: string; onClose: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function getAttachment() { setBusy(true); try { const blob = backend ? (ops ? await downloadAdminDocument(item.fileId) : await downloadPortalDocument(accessToken, item.id)) : await getFile(item.fileId); if (!blob) throw new Error("No se encontró el archivo adjunto."); download(blob, item.fileName); } catch (e) { setError(e instanceof Error ? e.message : portalText("No se pudo descargar.", english)); } finally { setBusy(false); } }
  return <Modal title={item.title} onClose={onClose} wide><div className="ew-dialog-content ew-printable"><div className="ew-print-brand">enzo thome</div><div className="ew-document-meta">{company} · {portalText(item.kind, english)} · {dateLabel(item.date, english ? "en-GB" : "es-UY")}</div><Badge>{portalText(item.status, english)}</Badge><div className="ew-prose ew-document-content">{item.content || portalText("El contenido se encuentra en el archivo adjunto.", english)}</div>{error && <div role="alert">{error}</div>}<div className="ew-row-actions ew-no-print">{item.fileId && <button className="ew-button" disabled={busy} onClick={() => void getAttachment()}><Icon name="download" size={17} />{busy ? portalText("Descargando…", english) : `${english ? "Download" : "Descargar"} ${item.fileName}`}</button>}<button className="ew-button ew-secondary" onClick={() => window.print()}>{portalText("Imprimir / guardar PDF", english)}</button></div></div></Modal>;
}

function AdminLogin({ onSend }: { onSend: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState("enzothome1@gmail.com");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await onSend(email); setMessage("Te envié un enlace seguro. Abrilo desde este dispositivo para entrar a Operaciones."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo enviar el acceso."); }
    finally { setBusy(false); }
  }
  return <main className="et-workspace ew-loading"><section className="ew-flat-section"><h1>Acceso a Operaciones</h1><div className="ew-prose">Ingresá con un enlace por email. No necesitás contraseña.</div><form className="ew-form" onSubmit={submit}><div className="ew-field ew-full"><label htmlFor="admin-email">Email autorizado</label><input id="admin-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></div><footer className="ew-form-footer ew-full"><button className="ew-button" disabled={busy}>{busy ? "Enviando…" : "Enviar enlace de acceso"}</button></footer>{message && <div className="ew-full" role="status">{message}</div>}</form></section></main>;
}

function InvoiceView({ item, company, english, ops, backend, accessToken, onPortalFile, onClose }: { item: Invoice; company: string; english: boolean; ops: boolean; backend: boolean; accessToken: string; onPortalFile: (id: string, kind: "document" | "invoice" | "receipt", mode: "view" | "download", localPath: string, fileName: string) => Promise<void>; onClose: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function getAttachment() {
    if (!item.fileId) return;
    setBusy(true); setError("");
    try {
      const blob = backend ? (ops ? await downloadAdminDocument(item.fileId) : await downloadPortalInvoice(accessToken, item.id)) : await getFile(item.fileId);
      if (!blob) throw new Error("No se encontró el PDF.");
      download(blob, item.fileName || `${item.number}.pdf`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : portalText("No se pudo descargar el PDF.", english)); }
    finally { setBusy(false); }
  }
  async function getReceipt() {
    if (!item.receiptFileId || !ops) return;
    setBusy(true); setError("");
    try {
      const blob = backend ? await downloadAdminDocument(item.receiptFileId) : await getFile(item.receiptFileId);
      if (!blob) throw new Error("No se encontró el recibo.");
      download(blob, item.receiptFileName || `recibo-${item.number}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo descargar el recibo."); }
    finally { setBusy(false); }
  }
  const lines = item.lines?.length ? item.lines : [{ id: `${item.id}-legacy`, description: item.title, amount: item.amount }];
  return <Modal title={item.number} onClose={onClose} wide><div className="ew-dialog-content ew-printable">
    <div className="ew-invoice-header"><div><div className="ew-print-brand">enzo thome</div><div>{company}</div></div><Badge>{portalText(invoiceStatus(item), english)}</Badge></div>
    <div className="ew-invoice-dates"><div>{english ? "Issued" : "Emisión"}<strong>{dateLabel(item.date, english ? "en-GB" : "es-UY")}</strong></div>{ops && <div>{english ? "Due" : "Vencimiento"}<strong>{dateLabel(item.due, english ? "en-GB" : "es-UY")}</strong></div>}<div>{english ? "Paid" : "Pagado"}<strong>{item.paidAt ? dateLabel(item.paidAt, english ? "en-GB" : "es-UY") : "—"}</strong></div></div>
    <div className="ew-invoice-lines-table" role="table" aria-label={english ? "Invoice lines" : "Líneas de la factura"}><div className="ew-invoice-lines-head" role="row"><strong role="columnheader">{english ? "Description" : "Descripción"}</strong><strong role="columnheader">{english ? "Amount" : "Importe"}</strong></div>{lines.map(line => <div className="ew-invoice-lines-row" role="row" key={line.id}><div role="cell">{line.description}</div><strong role="cell">{money(line.amount, item.currency)}</strong></div>)}<div className="ew-invoice-lines-total"><strong>Total</strong><strong>{money(item.amount, item.currency)}</strong></div></div>
    {ops && <div className="ew-inline-note">Este registro no sustituye una factura fiscal ni realiza un cobro.</div>}{error && <div className="ew-error" role="alert">{error}</div>}
    <div className="ew-row-actions ew-no-print">{item.fileId && (ops ? <button className="ew-button" disabled={busy} onClick={() => void getAttachment()}><Icon name="download" size={17} />{busy ? "Descargando…" : "Descargar factura PDF"}</button> : <><button className="ew-button" onClick={() => void onPortalFile(item.id, "invoice", "view", item.fileId || "", item.fileName || `${item.number}.pdf`)}><Icon name="eye" size={17} />{english ? "View invoice" : "Ver factura"}</button><button className="ew-button ew-secondary" onClick={() => void onPortalFile(item.id, "invoice", "download", item.fileId || "", item.fileName || `${item.number}.pdf`)}><Icon name="download" size={17} />{english ? "Download invoice" : "Descargar factura"}</button></>)}
      {ops && item.receiptFileId && <button className="ew-button ew-secondary" disabled={busy} onClick={() => void getReceipt()}><Icon name="download" size={17} />{busy ? "Descargando…" : "Descargar recibo"}</button>}
      {!ops && item.receiptFileName && <><button className="ew-button ew-secondary" onClick={() => void onPortalFile(item.id, "receipt", "view", item.receiptFileId || "", item.receiptFileName || "receipt.pdf")}><Icon name="eye" size={17} />{english ? "View receipt" : "Ver recibo"}</button><button className="ew-button ew-secondary" onClick={() => void onPortalFile(item.id, "receipt", "download", item.receiptFileId || "", item.receiptFileName || "receipt.pdf")}><Icon name="download" size={17} />{english ? "Download receipt" : "Descargar recibo"}</button></>}
      <button className="ew-button ew-secondary" onClick={() => window.print()}>{portalText("Imprimir / guardar PDF", english)}</button></div>
  </div></Modal>;
}

function BankAccountEditor({ item, clients, defaultClientId, onUpload, onSave, onClose }: { item?: BankAccount; clients: Client[]; defaultClientId: string; onUpload?: (kind: WorkspaceFileKind, ownerId: string, file: File) => Promise<{ fileId: string; fileName: string }>; onSave: (account: BankAccount) => Promise<boolean>; onClose: () => void }) {
  const [selectedClients, setSelectedClients] = useState<string[]>(item?.clientIds || (defaultClientId !== "all" ? [defaultClientId] : []));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function toggleClient(id: string) { setSelectedClients(current => current.includes(id) ? current.filter(clientId => clientId !== id) : [...current, id]); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const account: BankAccount = { id: item?.id || uid(), bankName: String(form.get("bankName") || "").trim(), accountHolder: String(form.get("accountHolder") || "").trim(), accountNumber: String(form.get("accountNumber") || "").trim(), paymentUrl: String(form.get("paymentUrl") || "").trim(), currency: String(form.get("currency") || "USD"), instructions: String(form.get("instructions") || "").trim(), clientIds: selectedClients, iconFileId: item?.iconFileId || "", iconFileName: item?.iconFileName || "" };
      if (!account.bankName || !account.accountHolder) throw new Error("Completá el banco o plataforma y el titular.");
      if (!account.accountNumber && !account.paymentUrl) throw new Error("Ingresá un número de cuenta o un enlace directo.");
      if (account.paymentUrl && !safeUrl(account.paymentUrl)) throw new Error("El enlace directo debe comenzar con https:// o http://.");
      const icon = form.get("icon");
      if (icon instanceof File && icon.size > 0) {
        if (icon.size > 5 * 1024 * 1024) throw new Error("El ícono supera los 5 MB.");
        if (!icon.type.startsWith("image/")) throw new Error("El ícono debe ser una imagen PNG, JPG, WebP o SVG.");
        if (onUpload) {
          const uploaded = await onUpload("bank-icon", account.id, icon);
          account.iconFileId = uploaded.fileId; account.iconFileName = uploaded.fileName;
        } else {
          const fileId = uid(); await saveFile(fileId, icon); account.iconFileId = fileId; account.iconFileName = icon.name;
        }
      }
      if (await onSave(account)) onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la cuenta bancaria."); }
    finally { setBusy(false); }
  }
  return <Modal title={item ? "Editar cuenta bancaria" : "Nueva cuenta bancaria"} onClose={onClose} wide><form className="ew-form" onSubmit={submit}><div className="ew-field"><label htmlFor="bank-name">Banco o plataforma</label><input id="bank-name" name="bankName" defaultValue={item?.bankName || ""} required maxLength={160} /></div><div className="ew-field"><label htmlFor="bank-holder">Titular</label><input id="bank-holder" name="accountHolder" defaultValue={item?.accountHolder || ""} required maxLength={200} /></div><div className="ew-field"><label htmlFor="bank-currency">Moneda</label><select id="bank-currency" name="currency" defaultValue={item?.currency || "USD"}>{["USD", "UYU", "EUR", "GBP"].map(currency => <option key={currency}>{currency}</option>)}</select></div><div className="ew-choice-group ew-full"><div className="ew-field"><label htmlFor="bank-number">Número de cuenta, IBAN o identificador</label><input id="bank-number" name="accountNumber" defaultValue={item?.accountNumber || ""} maxLength={240} /><div className="ew-hint">Completá este campo o el enlace directo.</div></div><div className="ew-choice-divider" aria-hidden="true">O</div><div className="ew-field"><label htmlFor="bank-payment-url">Enlace directo</label><input id="bank-payment-url" name="paymentUrl" type="url" inputMode="url" placeholder="https://" defaultValue={item?.paymentUrl || ""} maxLength={2000} /><div className="ew-hint">Por ejemplo, PayPal o Mercado Pago.</div></div></div><div className="ew-field ew-full"><label htmlFor="bank-icon">Ícono de la cuenta (opcional)</label><input id="bank-icon" name="icon" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" /><div className="ew-hint">PNG, JPG, WebP o SVG de hasta 5 MB. Se mostrará en el portal del cliente.</div>{item?.iconFileName && <div className="ew-hint">Ícono actual: {item.iconFileName}. Si elegís otro, se reemplaza.</div>}</div><div className="ew-field ew-full"><label htmlFor="bank-instructions">Datos adicionales (opcional)</label><textarea id="bank-instructions" name="instructions" rows={4} defaultValue={item?.instructions || ""} maxLength={2000} /><div className="ew-hint">Podés agregar SWIFT, sucursal, banco intermediario o una referencia para la transferencia.</div></div><fieldset className="ew-client-checks ew-full"><legend>Mostrar esta cuenta a</legend>{clients.map(client => <label className="ew-client-check" key={client.id}><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => toggleClient(client.id)} /><div><strong>{client.company}</strong><div>{client.name}</div></div></label>)}</fieldset>{error && <div className="ew-error ew-full" role="alert">{error}</div>}<footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="ew-button" disabled={busy}>{busy ? "Guardando…" : "Guardar cuenta"}</button></footer></form></Modal>;
}

function ApprovalView({ item, onSave, onClose, english }: { item: Approval; onSave: (item: Approval) => void; onClose: () => void; english: boolean }) {
  const [response, setResponse] = useState(""); const [error, setError] = useState("");
  function respond(status: string) {
    if (status === "Cambios solicitados" && !response.trim()) { setError(portalText("Contanos qué necesitás ajustar antes de enviar.", english)); return; }
    try { onSave({ ...item, status, response: response.trim(), respondedAt: today() }); onClose(); } catch { setError(portalText("No se pudo guardar la respuesta.", english)); }
  }
  return <Modal title={item.title} onClose={onClose}><div className="ew-dialog-content"><Badge>{portalText(item.status, english)}</Badge><div className="ew-prose">{item.description}</div><div className="ew-muted">{portalText("Revisar antes del", english)} {dateLabel(item.due, english ? "en-GB" : "es-UY")}</div>{item.status === "Pendiente" ? <><div className="ew-field"><label htmlFor="review-comment">{portalText("Comentarios", english)}</label><textarea id="review-comment" rows={5} value={response} onChange={e => setResponse(e.target.value)} maxLength={10000} placeholder={portalText("¿Hay algo que te gustaría ajustar?", english)} /></div>{error && <div className="ew-error" role="alert">{error}</div>}<div className="ew-row-actions"><button className="ew-button" onClick={() => respond("Aprobada")}><Icon name="check" size={17} />{portalText("Aprobar", english)}</button><button className="ew-button ew-secondary" onClick={() => respond("Cambios solicitados")}>{portalText("Pedir ajustes", english)}</button></div></> : <div className="ew-response"><strong>{portalText("Respuesta registrada el", english)} {dateLabel(item.respondedAt, english ? "en-GB" : "es-UY")}</strong><div>{item.response || portalText("Aprobado sin comentarios.", english)}</div></div>}</div></Modal>;
}

function PaymentView({ item, onSave, onClose, onUpload }: { item: Invoice; onSave: (item: Invoice) => Promise<boolean>; onClose: () => void; onUpload?: (kind: WorkspaceFileKind, ownerId: string, file: File) => Promise<{ fileId: string; fileName: string }> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const settled = item.paid >= item.amount;
  const hasPayment = item.paid > 0;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const amount = settled ? 0 : Number(form.get("payment") || 0);
      const paidAt = String(form.get("paidAt") || "");
      if (!settled && (!Number.isFinite(amount) || amount < 0 || amount > item.amount - item.paid || (!hasPayment && amount === 0))) throw new Error("El pago debe ser mayor a cero y no puede superar el saldo pendiente.");
      if (!paidAt) throw new Error("Elegí la fecha en que recibiste el pago.");
      const next: Invoice = { ...item, paid: settled ? item.paid : Math.round((item.paid + amount) * 100) / 100, paidAt };
      const receipt = form.get("receipt");
      if (receipt instanceof File && receipt.size > 0) {
        if (receipt.size > 20 * 1024 * 1024) throw new Error("El recibo supera los 20 MB.");
        const validType = ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(receipt.type) || /\.(pdf|jpe?g|png|webp)$/i.test(receipt.name);
        if (!validType) throw new Error("El recibo debe ser PDF, JPG, PNG o WebP.");
        if (onUpload) {
          const uploaded = await onUpload("receipt", item.id, receipt);
          next.receiptFileId = uploaded.fileId; next.receiptFileName = uploaded.fileName;
        } else {
          const fileId = uid(); await saveFile(fileId, receipt); next.receiptFileId = fileId; next.receiptFileName = receipt.name;
        }
      }
      if (await onSave(next)) onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el pago."); }
    finally { setBusy(false); }
  }
  return <Modal title={`${hasPayment ? "Editar pago" : "Registrar pago"} · ${item.number}`} onClose={onClose}><form className="ew-form" onSubmit={submit}>{settled ? <div className="ew-form-note ew-full">Pago total registrado: <strong>{money(item.paid, item.currency)}</strong>. Podés corregir la fecha o adjuntar el recibo.</div> : <><div className="ew-form-note ew-full">{hasPayment ? <>Pagado hasta ahora: <strong>{money(item.paid, item.currency)}</strong>. Saldo: <strong>{money(item.amount - item.paid, item.currency)}</strong>.</> : <>Saldo pendiente: <strong>{money(item.amount - item.paid, item.currency)}</strong>.</>}</div><div className="ew-field ew-full"><label htmlFor="payment">{hasPayment ? `Pago adicional en ${item.currency} (opcional)` : `Importe recibido en ${item.currency}`}</label><input id="payment" name="payment" type="number" step="0.01" min="0.01" max={item.amount - item.paid} defaultValue={hasPayment ? undefined : item.amount - item.paid} required={!hasPayment} /></div></>}<div className="ew-field"><label htmlFor="payment-date">Fecha de pago</label><input id="payment-date" name="paidAt" type="date" max={today()} defaultValue={item.paidAt || today()} required /></div><div className="ew-field ew-full"><label htmlFor="payment-receipt">Recibo (opcional)</label><input id="payment-receipt" name="receipt" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp" /><div className="ew-hint">PDF, JPG, PNG o WebP de hasta 20 MB. Queda privado en Operaciones.</div>{item.receiptFileName && <div className="ew-hint">Recibo actual: {item.receiptFileName}. Si elegís otro, se reemplaza.</div>}</div><div className="ew-hint ew-full">Este registro no realiza ningún cobro.</div>{error && <div className="ew-error ew-full" role="alert">{error}</div>}<footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="ew-button" disabled={busy}>{busy ? "Guardando…" : hasPayment ? "Guardar cambios" : "Guardar pago"}</button></footer></form></Modal>;
}

function IntakeView({ item, onSave, onClose, english }: { item: Project; onSave: (item: Project) => void; onClose: () => void; english: boolean }) {
  const [error, setError] = useState("");
  const fields = [{ name: "contact", label: "¿Quién será el referente del proyecto?", hint: "Nombre y canal de contacto preferido." }, { name: "goal", label: "¿Qué necesitás resolver primero?", hint: "El problema más importante para vos y tu equipo." }, { name: "success", label: "¿Cómo sabremos que el proyecto funcionó?", hint: "Un resultado concreto que te gustaría conseguir." }, { name: "context", label: "¿Qué más deberíamos saber?", hint: "Herramientas actuales, fechas importantes o enlaces de referencia. No incluyas contraseñas." }] as const;
  return <Modal title={portalText("Ficha de inicio", english)} onClose={onClose}><form className="ew-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); try { const intake = { contact: String(form.get("contact")).trim(), goal: String(form.get("goal")).trim(), success: String(form.get("success")).trim(), context: String(form.get("context") || "").trim(), date: today() }; if (!intake.contact || !intake.goal || !intake.success) { setError(portalText("Completá el referente, el objetivo y el resultado esperado.", english)); return; } onSave({ ...item, intake }); onClose(); } catch { setError(portalText("No se pudo guardar la ficha.", english)); } }}><div className="ew-muted ew-full">{portalText("Cuatro preguntas para empezar con el mismo objetivo. Podés volver a esta ficha cuando lo necesites.", english)}</div>{fields.map(field => <div className="ew-field ew-full" key={field.name}><label htmlFor={`intake-${field.name}`}>{portalText(field.label, english)}</label><textarea id={`intake-${field.name}`} name={field.name} rows={field.name === "contact" ? 2 : 3} required={field.name !== "context"} defaultValue={item.intake?.[field.name] || ""} maxLength={4000} /><div className="ew-hint">{portalText(field.hint, english)}</div></div>)}{item.intake && <div className="ew-hint ew-full">{portalText("Última actualización", english)}: {dateLabel(item.intake.date, english ? "en-GB" : "es-UY")}</div>}{error && <div className="ew-error ew-full" role="alert">{error}</div>}<footer className="ew-form-footer ew-full"><button className="ew-button">{portalText("Guardar ficha", english)}</button></footer></form></Modal>;
}

const messageKinds = ["Bienvenida", "Solicitud de accesos", "Reunión de inicio", "Factura", "Actualización", "Cierre", "Testimonio"];
function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function messageTemplate(client: Client | undefined, kind: string, portalUrl: string): { title: string; content: string } {
  const english = client?.language === "Inglés";
  const templates: Record<string, [string, string, string, string]> = {
    "Bienvenida": ["Bienvenido a tu espacio de trabajo", "Ya tenemos un lugar para seguir el proyecto. Ahí vas a encontrar el estado del trabajo, las revisiones, los documentos y los entregables.\n\nTe voy a avisar cuando haya algo que necesite tu atención.", "Welcome to your project space", "We now have a central place to follow our work together. You’ll find the project status, reviews, documents and deliverables there.\n\nI’ll let you know whenever something needs your attention."],
    "Solicitud de accesos": ["Lo que necesitamos para comenzar", "Dejé en tu espacio los accesos y materiales que necesitamos para avanzar. Podés revisar cada pendiente y marcarlo como completado.\n\nPara los accesos, enviame una invitación con los permisos necesarios; no compartas contraseñas por email.", "What we need to get started", "I’ve listed the access and materials we need in your project space. Please review each item and mark it complete when ready.\n\nFor access, please send an invitation with the necessary permissions rather than sharing passwords by email."],
    "Reunión de inicio": ["Coordinemos el inicio del proyecto", "Me gustaría coordinar una reunión breve para repasar el objetivo, los hitos y las primeras decisiones.\n\nDecime qué horarios te vienen bien y lo organizamos.", "Let’s arrange our project kickoff", "I’d like to arrange a short meeting to review the objective, milestones and first decisions.\n\nLet me know which times work for you and we’ll get it scheduled."],
    "Factura": ["Documentación y datos de pago disponibles", "La documentación y los datos de pago están disponibles en tu espacio, en Facturas y pagos. Ahí podés revisar el importe y las instrucciones.\n\nCualquier consulta, respondeme este email.", "Invoice and payment details available", "Your invoice details are available in the Invoices and payments section of your project space. You can review the amount and payment instructions there.\n\nIf you have any questions, just reply to this email."],
    "Revisión": ["Hay algo para revisar en tu portal", "Dejé en tu portal un punto que necesito que revises o confirmes. Ahí vas a encontrar el contexto y podés dejar tu respuesta, así mantenemos esta decisión ordenada sin sumar más mensajes.\n\nAvisame si preferís conversarlo.", "There’s something to review in your portal", "I’ve added an item to your portal that needs your review or confirmation. You’ll find the context there and can leave your response, so we can keep this decision organized without another email thread.\n\nLet me know if you’d rather discuss it."],
    "Cierre": ["Entrega y cierre del proyecto", "Dejé los entregables y la documentación del proyecto organizados en tu espacio.\n\nGracias por la confianza durante este trabajo. Revisemos juntos cualquier pendiente y acordemos cómo continuar con el soporte.", "Project handover and close", "The project deliverables and documentation are organized in your project space.\n\nThank you for your trust throughout this work. Let’s review any outstanding items together and agree on ongoing support."],
    "Testimonio": ["¿Cómo fue trabajar juntos?", "Me gustaría conocer cómo fue tu experiencia y qué cambió en tu trabajo a partir del proyecto.\n\nSi tenés unos minutos, podés responder este email con unas líneas. Antes de publicar cualquier testimonio te pediré tu autorización.", "How was your experience working together?", "I’d love to hear about your experience and what changed in your work as a result of the project.\n\nIf you have a few minutes, feel free to reply with a few lines. I’ll ask for your permission before publishing any testimonial."],
  };
  const template = templates[kind] || templates.Bienvenida;
  const greeting = `${english ? "Hi" : "Hola"} ${client?.name || ""},`;
  const paragraphs = template[english ? 3 : 1].split("\n\n");
  const portalLabel = english ? "Open your client portal" : "Abrir tu portal de cliente";
  const body = paragraphs.map(paragraph => `<div style="margin:0 0 18px;line-height:1.65;">${escapeHtml(paragraph)}</div>`).join("");
  return {
    title: template[english ? 2 : 0],
    content: `<!doctype html>
<html lang="${english ? "en" : "es"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FAF9F6;color:#0F172A;font-family:'IBM Plex Sans',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF9F6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FAF9F6;border:1px solid rgba(15,23,42,.14);">
        <tr><td align="center" style="background:#0F172A;padding:10px 30px;"><img src="https://www.enzothome.com/LogoTransp.png" width="96" alt="Enzo Thome" style="display:block;width:96px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"></td></tr>
        <tr><td style="padding:34px 30px 18px;font-size:16px;">
          <div style="margin:0 0 18px;line-height:1.65;">${escapeHtml(greeting)}</div>
          ${body}
          ${portalUrl ? `<div style="margin:28px 0;"><a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#0F172A;color:#FAF9F6;text-decoration:none;padding:13px 18px;font-weight:700;">${portalLabel}</a></div>` : ""}
          <div style="margin:26px 0 0;line-height:1.65;">${english ? "Thanks" : "Saludos"},<br>Enzo</div>
        </td></tr>
        <tr><td align="center" style="padding:18px 30px;border-top:1px solid rgba(15,23,42,.14);font-size:12px;"><a href="https://www.enzothome.com" style="color:#0F172A;text-decoration:none;">www.enzothome.com</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

function MessageComposer({ data, clientId, kind: initialKind, item, canSend, onUpload, onSave, onSend, onClose }: { data: WorkspaceData; clientId: string; kind: string; item?: Message; canSend: boolean; onUpload?: (kind: WorkspaceFileKind, ownerId: string, file: File) => Promise<{ fileId: string; fileName: string }>; onSave: (item: Message) => Promise<boolean>; onSend: (item: Message) => Promise<void>; onClose: () => void }) {
  const initialClient = item?.clientId || (clientId === "all" ? data.clients[0]?.id || "" : clientId);
  const messageId = useRef(item?.id || uid()).current;
  const portalUrl = (client?: Client) => client?.portalToken ? `${window.location.origin}/portal?access=${encodeURIComponent(client.portalToken)}` : "";
  const [selectedClient, setSelectedClient] = useState(initialClient);
  const [kind, setKind] = useState(item?.kind || initialKind);
  const [draft, setDraft] = useState(() => item ? { title: item.title, content: item.content } : messageTemplate(data.clients.find(c => c.id === initialClient), initialKind, portalUrl(data.clients.find(c => c.id === initialClient))));
  const [attachments, setAttachments] = useState<MessageAttachment[]>(item?.attachments || []);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const client = data.clients.find(c => c.id === selectedClient);
  function regenerate(id: string, nextKind: string) {
    const nextClient = data.clients.find(c => c.id === id);
    setSelectedClient(id); setKind(nextKind); setDraft(messageTemplate(nextClient, nextKind, portalUrl(nextClient)));
  }
  function chooseFiles(files: FileList | null) {
    const next = Array.from(files || []);
    if (next.some(file => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) { setError("Todos los adjuntos deben ser PDF."); return; }
    if (next.some(file => file.size > 20 * 1024 * 1024)) { setError("Cada PDF debe pesar menos de 20 MB."); return; }
    if ([...attachments.map(file => file.size), ...queuedFiles.map(file => file.size), ...next.map(file => file.size)].reduce((total, size) => total + size, 0) > 20 * 1024 * 1024) { setError("Los adjuntos juntos no pueden superar los 20 MB."); return; }
    setQueuedFiles(current => [...current, ...next]); setError("");
  }
  async function prepareMessage() {
    if (!client || !draft.title.trim() || !draft.content.trim()) throw new Error("Completá el cliente, el asunto y el código del email.");
    let uploaded = attachments;
    if (queuedFiles.length) {
      if (!onUpload) throw new Error("Conectá Supabase para guardar los PDFs.");
      const additions: MessageAttachment[] = [];
      for (const file of queuedFiles) {
        const result = await onUpload("email", messageId, file);
        additions.push({ path: result.fileId, name: result.fileName, size: file.size });
      }
      uploaded = [...attachments, ...additions];
      setAttachments(uploaded); setQueuedFiles([]);
    }
    return { id: messageId, clientId: selectedClient, title: draft.title.trim(), content: draft.content.trim(), kind, date: item?.date || today(), attachments: uploaded, status: item?.status || "Borrador", sentAt: item?.sentAt || "", resendId: item?.resendId || "", lastError: "" } satisfies Message;
  }
  async function submit(send: boolean) {
    setBusy(true); setError("");
    try {
      if (send && !client?.email) throw new Error("Completá el email del cliente antes de enviar.");
      const message = await prepareMessage();
      if (send) await onSend(message); else if (!await onSave({ ...message, status: "Borrador" })) throw new Error("No se pudo guardar el borrador.");
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo procesar el email."); }
    finally { setBusy(false); }
  }
  return <Modal title={item ? "Editar email" : "Preparar email"} onClose={onClose} extraWide><form className="ew-form ew-email-form" onSubmit={event => { event.preventDefault(); void submit(false); }}><div className="ew-field"><label htmlFor="message-client">Cliente</label><select id="message-client" value={selectedClient} onChange={event => regenerate(event.target.value, kind)} required>{data.clients.map(entry => <option key={entry.id} value={entry.id}>{entry.company}</option>)}</select></div><div className="ew-field"><label htmlFor="message-kind">Momento</label><select id="message-kind" value={kind} onChange={event => regenerate(selectedClient, event.target.value)}>{messageKinds.map(entry => <option key={entry}>{entry}</option>)}</select></div><div className="ew-hint ew-full">Cambiar el cliente o el momento vuelve a cargar la plantilla en el idioma configurado para ese cliente.</div><div className="ew-field ew-full"><label htmlFor="message-title">Asunto</label><input id="message-title" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} required maxLength={240} /></div><div className="ew-email-split ew-full"><div className="ew-field ew-code-pane"><label htmlFor="message-content">Código HTML</label><textarea id="message-content" spellCheck={false} value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} required maxLength={50000} /></div><div className="ew-preview-pane"><div className="ew-preview-label">Vista previa</div><iframe title="Vista previa del email" sandbox="" srcDoc={draft.content} /></div></div><div className="ew-field ew-full"><label htmlFor="message-files">Adjuntar PDFs</label><input id="message-files" type="file" accept="application/pdf,.pdf" multiple onChange={event => { chooseFiles(event.target.files); event.target.value = ""; }} /><div className="ew-hint">Se guardan de forma privada y Resend los adjunta al envío. Máximo 20 MB en total.</div></div>{attachments.length > 0 && <div className="ew-attachment-list ew-full">{attachments.map(file => <div key={file.path}><strong>{file.name}</strong><button type="button" className="ew-text-button" onClick={() => setAttachments(current => current.filter(entry => entry.path !== file.path))}>Quitar</button></div>)}</div>}{queuedFiles.length > 0 && <div className="ew-attachment-list ew-full">{queuedFiles.map((file, index) => <div key={`${file.name}-${index}`}><strong>{file.name}</strong><div>Pendiente de subir</div><button type="button" className="ew-text-button" onClick={() => setQueuedFiles(current => current.filter((_, currentIndex) => currentIndex !== index))}>Quitar</button></div>)}</div>}{error && <div className="ew-error ew-full" role="alert">{error}</div>}<footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" disabled={busy} onClick={() => { void navigator.clipboard.writeText(draft.content).then(() => setError("Código HTML copiado.")).catch(() => setError("No se pudo copiar el código.")); }}>Copiar código</button><button className="ew-button ew-secondary" disabled={busy}>{busy ? "Procesando…" : "Guardar borrador"}</button><button type="button" className="ew-button" disabled={busy || !canSend || !client?.email} onClick={() => void submit(true)}>{busy ? "Procesando…" : "Enviar con Resend"}</button></footer></form></Modal>;
}
