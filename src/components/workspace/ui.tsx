"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/></>,
    projects: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 12h18M10 12v3h4v-3"/></>,
    clients: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/></>,
    documents: <><path d="M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h6"/></>,
    invoices: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 15h3M14 15h3"/></>,
    banking: <><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 18h18M2 22h20M12 2 3 7h18Z"/></>,
    approvals: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 3 3 6-6"/></>,
    resources: <><path d="m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(2 -1) scale(.85)"/></>,
    messages: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    tasks: <><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><path d="M18 4h3v7h-3"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    external: <><path d="M14 3h7v7M21 3l-10 10M10 3H3v18h18v-7"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    reply: <><path d="m9 17-5-5 5-5"/><path d="M4 12h9a7 7 0 0 1 7 7v1"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.projects}</svg>;
}

export function Badge({ children }: { children: ReactNode }) {
  const value = String(children);
  const tones: Record<string, "success" | "danger" | "warning" | "neutral" | "info"> = {
    Pagada: "success", Completada: "success", Aprobada: "success", Aceptado: "success", Finalizado: "success", Enviado: "success",
    Paid: "success", Completed: "success", Approved: "success", Accepted: "success", Sent: "success",
    Vencida: "danger", Error: "danger", "Cambios solicitados": "danger", Overdue: "danger", "Changes requested": "danger",
    "En curso": "warning", "Pago parcial": "warning", "In progress": "warning", "Partially paid": "warning",
    "Por comenzar": "neutral", Pendiente: "neutral", "En pausa": "neutral", Borrador: "neutral", "Not started": "neutral", Pending: "neutral", "On hold": "neutral", Draft: "neutral",
    "En revisión": "info", Compartido: "info", "In review": "info", Shared: "info",
  };
  const tone = tones[value];
  const complete = tone === "success";
  return <div className={`ew-badge ${tone ? `ew-badge-${tone}` : ""}`}>{complete && <Icon name="check" size={12} />}{children}</div>;
}

export function Modal({ title, children, onClose, wide = false, extraWide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; extraWide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className={`ew-dialog ${wide ? "ew-dialog-wide" : ""} ${extraWide ? "ew-dialog-extra-wide" : ""}`} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const bounds = e.currentTarget.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose(); } }}>
    <header className="ew-dialog-header"><h2>{title}</h2><button type="button" className="ew-icon-button" onClick={onClose} aria-label="Cerrar ventana"><Icon name="close" /></button></header>
    {children}
  </dialog>;
}

export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ew-empty"><Icon name="documents" size={30} /><h3>{title}</h3><div>{description}</div>{action}</div>;
}
