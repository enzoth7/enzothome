"use client";

import { useEffect, useState } from "react";
import { loadPortalAccessLogs, type PortalAccessLog } from "./backend";
import type { Client } from "./model";

const sectionLabels: Record<string, string> = {
  home: "Vista general", calendar: "Calendario", projects: "Proyectos",
  documents: "Documentos", invoices: "Facturas y pagos",
  approvals: "Etapas", resources: "Enlaces útiles",
};

const dateFormat = new Intl.DateTimeFormat("es-UY", {
  timeZone: "America/Montevideo", dateStyle: "medium", timeStyle: "short",
});

export default function PortalLogsView({ clients, clientId, backend }: {
  clients: Client[]; clientId: string; backend: boolean;
}) {
  const [logs, setLogs] = useState<PortalAccessLog[]>([]);
  const [loading, setLoading] = useState(backend);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!backend) return;
    let active = true;
    const refresh = () => {
      if (document.hidden) return;
      void loadPortalAccessLogs(clientId).then(rows => {
        if (active) { setLogs(rows); setError(""); setLoading(false); }
      }).catch(() => {
        if (active) { setError("Los registros todavía no están disponibles."); setLoading(false); }
      });
    };
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; window.clearInterval(interval); document.removeEventListener("visibilitychange", refresh); };
  }, [backend, clientId]);

  return <section className="ew-section" aria-label="Accesos al portal">
    {error && <div className="ew-error" role="alert">{error}</div>}
    <div className="ew-table-wrap"><table className="ew-table ew-data-table"><thead><tr><th>Fecha y hora</th><th>Cliente</th><th>Usuario</th><th>Actividad</th></tr></thead><tbody>
      {logs.map(log => <tr key={log.id}><td>{dateFormat.format(new Date(log.createdAt))}</td><td>{clients.find(client => client.id === log.clientId)?.company || log.clientId}</td><td>{log.actorLabel}</td><td>{log.eventType === "login" ? "Inicio de sesión" : `Abrió ${sectionLabels[log.viewName] || log.viewName}`}</td></tr>)}
      {!loading && !error && !logs.length && <tr><td colSpan={4}><strong>Todavía no hay accesos registrados.</strong><small>Los próximos inicios de sesión y visitas aparecerán acá.</small></td></tr>}
      {loading && <tr><td colSpan={4}>Cargando accesos...</td></tr>}
    </tbody></table></div>
  </section>;
}
