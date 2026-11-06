"use client";

import { useEffect, useState } from "react";
import { calendarEmail, type CalendarEmailKind } from "../../../supabase/functions/_shared/calendar-email";
import { loadAllCalendarEvents } from "./backend";
import { clientTimeZone, eventStart } from "./calendar-time";
import { dateLabel, type CalendarEvent, type WorkspaceData } from "./model";
import { Modal } from "./ui";

export const meetingEmailLabels: Record<CalendarEmailKind, string> = {
  created: "Reunión creada",
  rescheduled: "Reunión reprogramada",
  day: "Recordatorio 24 horas antes",
  halfHour: "Recordatorio 30 minutos antes",
};

export default function MeetingEmailPreview({ data, backend, clientId, kind, onClose }: {
  data: WorkspaceData;
  backend: boolean;
  clientId: string;
  kind: CalendarEmailKind;
  onClose: () => void;
}) {
  const [events, setEvents] = useState<CalendarEvent[]>(backend ? [] : data.calendarEvents || []);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [openedAt] = useState(() => Date.now());
  useEffect(() => {
    if (!backend) return;
    let active = true;
    void loadAllCalendarEvents().then(value => { if (active) setEvents(value); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las reuniones."); });
    return () => { active = false; };
  }, [backend]);

  const meetings = events.filter(event => event.kind === "meeting" && eventStart(event) && data.projects.some(project => project.id === event.projectId && (clientId === "all" || project.clientId === clientId)))
    .sort((a, b) => (eventStart(a)?.getTime() || 0) - (eventStart(b)?.getTime() || 0));
  const selected = meetings.find(event => event.id === selectedId) || meetings.find(event => (eventStart(event)?.getTime() || 0) > openedAt) || meetings[0];
  const client = data.clients.find(entry => entry.id === data.projects.find(project => project.id === selected?.projectId)?.clientId);
  const startsAt = selected ? eventStart(selected)?.toISOString() : "";
  const email = selected && client && startsAt ? calendarEmail(kind, {
    title: selected.title,
    startsAt,
    meetingUrl: selected.meetingUrl || "",
    clientName: client.name,
    clientLanguage: client.language,
    clientTimeZone: clientTimeZone(client),
  }) : null;

  return <Modal title={meetingEmailLabels[kind]} onClose={onClose} extraWide>
    <div className="ew-dialog-content ew-meeting-email-preview">
      <p>{kind === "created" ? "La confirmación se envía al crear una reunión nueva. Las reuniones ya existentes se muestran para revisar el formato y no se reenvían desde aquí." : kind === "rescheduled" ? "Se envía cuando el cliente cambia la fecha o la hora de una reunión. Esta vista previa muestra los datos actuales." : "Vista previa con los datos de la reunión seleccionada. Los recordatorios usan este mismo contenido cuando está activado su envío automático."}</p>
      <div className="ew-field"><label htmlFor="meeting-email-event">Reunión</label><select id="meeting-email-event" value={selected?.id || ""} onChange={event => setSelectedId(event.target.value)} disabled={!meetings.length}>
        {!meetings.length && <option value="">{backend && !error ? "Cargando reuniones..." : "No hay reuniones disponibles"}</option>}
        {meetings.map(meeting => {
          const meetingClient = data.clients.find(entry => entry.id === data.projects.find(project => project.id === meeting.projectId)?.clientId);
          return <option key={meeting.id} value={meeting.id}>{dateLabel(meeting.date)}: {meeting.title} ({meetingClient?.company || "Cliente"})</option>;
        })}
      </select></div>
      {error && <div className="ew-error" role="alert">{error}</div>}
      {email && <>
        <div className="ew-meeting-email-meta"><div><strong>Para</strong><span>{client?.name} {client?.email && `(${client.email})`}</span></div><div><strong>Asunto</strong><span>{email.subject}</span></div></div>
        <div className="ew-preview-pane"><div className="ew-preview-label">Vista previa del email</div><iframe title={`Vista previa: ${meetingEmailLabels[kind]}`} sandbox="" srcDoc={email.html} /></div>
      </>}
    </div>
  </Modal>;
}
