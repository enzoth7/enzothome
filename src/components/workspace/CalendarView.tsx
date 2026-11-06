"use client";

import { useEffect, useState, type FormEvent } from "react";
import { deleteCalendarEvent, loadCalendarEvents, saveCalendarEvent } from "./backend";
import { dateLabel, safeUrl, today, uid, type CalendarEvent, type Client, type Project, type Task } from "./model";
import { ADMIN_TIME_ZONE, clientTimeZone, eventEnd, eventStart, localDateTime, timeZoneLabel, wallTimeToInstant } from "./calendar-time";
import { Icon, Modal } from "./ui";

type CalendarItem = { id: string; date: string; title: string; kind: "event" | "project" | "stage"; detail: string; projectId: string; event?: CalendarEvent };
const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarView({ projects, clients, stages, backend, localEvents, onLocalChange, onOpenSource, onMeetingCreated }: { projects: Project[]; clients: Client[]; stages: Task[]; backend: boolean; localEvents: CalendarEvent[]; onLocalChange: (events: CalendarEvent[]) => void; onOpenSource: (view: "projects" | "approvals", projectId: string) => void; onMeetingCreated?: (event: CalendarEvent) => Promise<void> }) {
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [remoteEvents, setRemoteEvents] = useState<CalendarEvent[]>([]);
  const [loadedPeriod, setLoadedPeriod] = useState({ key: "", error: "" });
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [eventKind, setEventKind] = useState<"event" | "meeting">("event");
  const [eventProjectId, setEventProjectId] = useState("");
  const [eventDate, setEventDate] = useState(selected);
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventTimeZone, setEventTimeZone] = useState(ADMIN_TIME_ZONE);
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const monthLabel = new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(first);
  const heading = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const gridStart = new Date(year, monthIndex - 1, 1 - (first.getDay() + 6) % 7);
  const gridEnd = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + 42);
  const start = iso(gridStart), end = iso(gridEnd);
  const queryStart = iso(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() - 2));
  const queryEnd = iso(new Date(gridEnd.getFullYear(), gridEnd.getMonth(), gridEnd.getDate() + 2));
  const periodKey = `${start}:${end}`;
  const loading = backend && loadedPeriod.key !== periodKey;
  const loadError = loadedPeriod.key === periodKey ? loadedPeriod.error : "";
  useEffect(() => {
    if (!backend) return;
    let active = true;
    void loadCalendarEvents(queryStart, queryEnd).then(events => {
      if (active) { setRemoteEvents(events); setLoadedPeriod({ key: periodKey, error: "" }); }
    }).catch(cause => {
      if (active) setLoadedPeriod({ key: periodKey, error: cause instanceof Error ? cause.message : "No se pudo cargar el calendario." });
    });
    return () => { active = false; };
  }, [backend, queryStart, queryEnd, periodKey]);
  const events = backend ? remoteEvents : localEvents;
  const items: CalendarItem[] = [
    ...events.filter(event => !event.projectId || projects.some(project => project.id === event.projectId)).map(event => {
      const startLocal = eventStart(event) ? localDateTime(eventStart(event)!, ADMIN_TIME_ZONE) : null;
      const endLocal = eventEnd(event) ? localDateTime(eventEnd(event)!, ADMIN_TIME_ZONE) : null;
      return { id: event.id, date: startLocal?.date || event.date, title: event.title, kind: "event" as const, detail: startLocal ? `${startLocal.time}${endLocal ? `–${endLocal.time}` : ""}` : "Todo el día", projectId: event.projectId, event };
    }),
    ...projects.flatMap(project => [{ id: `${project.id}-start`, date: project.start, title: `Inicio: ${project.title}`, kind: "project" as const, detail: "Proyecto", projectId: project.id }, { id: `${project.id}-end`, date: project.due, title: `Fin: ${project.title}`, kind: "project" as const, detail: "Proyecto", projectId: project.id }]),
    ...stages.filter(stage => stage.kind === "Hito").flatMap(stage => [
      ...(stage.start ? [{ id: `${stage.id}-start`, date: stage.start, title: `Inicio: ${stage.title}`, kind: "stage" as const, detail: "Inicio de etapa", projectId: stage.projectId }] : []),
      { id: `${stage.id}-due`, date: stage.due, title: `Fin: ${stage.title}`, kind: "stage" as const, detail: "Fin de etapa", projectId: stage.projectId },
    ]),
  ];
  const byDay = new Map<string, CalendarItem[]>();
  for (const item of items) { if (item.date >= start && item.date < end) byDay.set(item.date, [...(byDay.get(item.date) || []), item]); }
  const days = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index));
  const changeMonth = (offset: number) => { const next = new Date(year, monthIndex - 1 + offset, 1); setMonth(iso(next).slice(0, 7)); setSelected(iso(next)); };
  const openEditor = (event?: CalendarEvent) => { setEditing(event || null); setEventKind(event?.kind || "event"); setEventProjectId(event?.projectId || ""); setEventDate(event?.date || selected); setEventStartTime(event?.startTime.slice(0, 5) || ""); setEventTimeZone(event?.timeZone || ADMIN_TIME_ZONE); setError(""); setConfirmDelete(false); setEditorOpen(true); };
  const eventClient = clients.find(client => client.id === projects.find(project => project.id === eventProjectId)?.clientId);
  const previewInstant = eventKind === "meeting" && eventProjectId && eventStartTime ? wallTimeToInstant(eventDate, eventStartTime, eventTimeZone) : null;
  const clientPreview = previewInstant && eventClient ? localDateTime(previewInstant, clientTimeZone(eventClient)) : null;
  const closeEditor = () => { if (!busy) setEditorOpen(false); };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry: CalendarEvent = { id: editing?.id || uid(), title: String(form.get("title") || "").trim(), date: String(form.get("date") || ""), startTime: String(form.get("startTime") || ""), endTime: String(form.get("endTime") || ""), notes: String(form.get("notes") || "").trim(), projectId: String(form.get("projectId") || ""), kind: String(form.get("kind")) === "meeting" ? "meeting" : "event", meetingUrl: String(form.get("meetingUrl") || "").trim(), timeZone: String(form.get("timeZone") || ADMIN_TIME_ZONE) };
    if (!entry.title || !entry.date || (entry.endTime && (!entry.startTime || entry.endTime <= entry.startTime))) { setError("Revisá el título, la fecha y el horario."); return; }
    if (entry.meetingUrl && !safeUrl(entry.meetingUrl)) { setError("El enlace debe comenzar con https:// o http://."); return; }
    if (entry.kind === "meeting" && (!entry.projectId || !entry.startTime || !entry.endTime)) { setError("Elegí un proyecto y un horario de inicio y fin para la reunión."); return; }
    const zone = entry.timeZone || ADMIN_TIME_ZONE;
    if (entry.startTime && !wallTimeToInstant(entry.date, entry.startTime, zone)) { setError("Ese horario no existe en la zona horaria elegida."); return; }
    if (entry.endTime && !wallTimeToInstant(entry.date, entry.endTime, zone)) { setError("La hora de fin no existe en la zona horaria elegida."); return; }
    entry.startsAt = entry.startTime ? wallTimeToInstant(entry.date, entry.startTime, zone)?.toISOString() : "";
    entry.endsAt = entry.endTime ? wallTimeToInstant(entry.date, entry.endTime, zone)?.toISOString() : "";
    setBusy(true); setError("");
    try {
      if (backend) await saveCalendarEvent(entry);
      else onLocalChange(localEvents.some(item => item.id === entry.id) ? localEvents.map(item => item.id === entry.id ? entry : item) : [...localEvents, entry]);
      setRemoteEvents(current => current.some(item => item.id === entry.id) ? current.map(item => item.id === entry.id ? entry : item) : [...current, entry]);
      setMonth(entry.date.slice(0, 7)); setSelected(entry.date); setEditorOpen(false);
      if ((!editing || editing.kind !== "meeting") && backend && entry.kind === "meeting") void onMeetingCreated?.(entry);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el evento."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!editing) return;
    setBusy(true); setError("");
    try {
      if (backend) await deleteCalendarEvent(editing.id);
      else onLocalChange(localEvents.filter(item => item.id !== editing.id));
      setRemoteEvents(current => current.filter(item => item.id !== editing.id)); setEditorOpen(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar el evento."); }
    finally { setBusy(false); }
  }
  return <div className="ew-calendar-shell">
    <div className="ew-calendar-toolbar"><h2>{heading}</h2><div className="ew-calendar-controls"><button className="ew-button ew-secondary" onClick={() => { setMonth(today().slice(0, 7)); setSelected(today()); }}>Hoy</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(-1)} aria-label="Mes anterior">‹</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(1)} aria-label="Mes siguiente">›</button><button className="ew-button" onClick={() => openEditor()}><Icon name="plus" size={17} />Evento</button></div></div>
    {loadError && <div className="ew-error" role="alert">{loadError}</div>}{loading && <div role="status">Cargando eventos…</div>}
    <div className="ew-calendar-layout">
      <div className="ew-calendar-grid" role="grid" aria-label={`Calendario de ${heading}`}>
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => <div className="ew-calendar-weekday" key={day}>{day}</div>)}
        {days.map(day => {
          const value = iso(day);
          const dayItems = byDay.get(value) || [];
          const preview = dayItems.slice(0, 2);
          const accessibleItems = preview.map(item => item.title).join("; ");
          return <button type="button" role="gridcell" key={value} className={`ew-calendar-day ${value.slice(0, 7) !== month ? "is-outside" : ""} ${value === selected ? "is-selected" : ""} ${value === today() ? "is-today" : ""}`} aria-label={`${dateLabel(value)}${accessibleItems ? `; ${accessibleItems}` : ""}${dayItems.length > preview.length ? "; más actividades" : ""}`} aria-selected={value === selected} onClick={() => { setSelected(value); if (value.slice(0, 7) !== month) setMonth(value.slice(0, 7)); }}>
            <span className="ew-calendar-day-number">{day.getDate()}</span>
            {preview.length > 0 && <span className="ew-calendar-day-items">{preview.map(item => <span key={`${item.kind}-${item.id}`} title={item.title}>{item.title}</span>)}</span>}
          </button>;
        })}
      </div>
      <section className="ew-calendar-agenda" aria-label="Agenda del día"><h3>{dateLabel(selected)}</h3>{(byDay.get(selected) || []).sort((a, b) => a.detail.localeCompare(b.detail)).map(item => <button className="ew-calendar-agenda-item" key={`${item.kind}-${item.id}`} onClick={() => item.event ? openEditor(item.event) : onOpenSource(item.kind === "stage" ? "approvals" : "projects", item.projectId)}><span>{item.detail}</span><strong>{item.title}</strong>{item.projectId && <small>{projects.find(project => project.id === item.projectId)?.title}</small>}</button>)}{!byDay.get(selected)?.length && <p>No hay eventos para este día.</p>}</section>
    </div>
    {editorOpen && <Modal title={editing ? "Editar evento" : "Nuevo evento"} onClose={closeEditor}>
      <form className="ew-form" onSubmit={event => void save(event)}>
        <div className="ew-field ew-full"><label htmlFor="calendar-title">Título</label><input id="calendar-title" name="title" defaultValue={editing?.title || ""} required maxLength={240} /></div>
        <div className="ew-field"><label htmlFor="calendar-kind">Tipo</label><select id="calendar-kind" name="kind" value={eventKind} onChange={event => setEventKind(event.target.value as "event" | "meeting")}><option value="event">Evento interno</option><option value="meeting">Reunión con cliente</option></select></div>
        <div className="ew-field"><label htmlFor="calendar-project">Proyecto{eventKind === "meeting" ? "" : " (opcional)"}</label><select id="calendar-project" name="projectId" value={eventProjectId} onChange={event => setEventProjectId(event.target.value)} required={eventKind === "meeting"}><option value="">Sin proyecto</option>{projects.map(project => <option key={project.id} value={project.id}>{clients.find(client => client.id === project.clientId)?.company} - {project.title}</option>)}</select></div>
        <div className="ew-field"><label htmlFor="calendar-date">Fecha</label><input id="calendar-date" name="date" type="date" value={eventDate} onInput={event => setEventDate(event.currentTarget.value)} required /></div>
        <div className="ew-field"><label htmlFor="calendar-time-zone">Zona horaria de la hora ingresada</label><select id="calendar-time-zone" name="timeZone" value={eventTimeZone} onChange={event => setEventTimeZone(event.target.value)}><option value={ADMIN_TIME_ZONE}>Montevideo, Uruguay</option>{eventClient && clientTimeZone(eventClient) !== ADMIN_TIME_ZONE && <option value={clientTimeZone(eventClient)}>{timeZoneLabel(clientTimeZone(eventClient))}</option>}</select></div>
        <div className="ew-field"><label htmlFor="calendar-start">Desde{eventKind === "meeting" ? "" : " (opcional)"}</label><input id="calendar-start" name="startTime" type="time" value={eventStartTime} onInput={event => setEventStartTime(event.currentTarget.value)} required={eventKind === "meeting"} /></div>
        <div className="ew-field"><label htmlFor="calendar-end">Hasta{eventKind === "meeting" ? "" : " (opcional)"}</label><input id="calendar-end" name="endTime" type="time" defaultValue={editing?.endTime.slice(0, 5) || ""} required={eventKind === "meeting"} /></div>
        <div className="ew-field ew-full"><label htmlFor="calendar-meeting-url">Enlace (opcional)</label><input id="calendar-meeting-url" name="meetingUrl" type="url" defaultValue={editing?.meetingUrl || ""} placeholder="https://meet.google.com/..." maxLength={2048} /><div className="ew-hint">{eventKind === "meeting" ? "El cliente verá este enlace en su portal." : "Este enlace queda solo en Operaciones. Para compartirlo con el cliente, elegí Reunión con cliente y un proyecto."}</div></div>
        {eventKind === "meeting" && clientPreview && <div className="ew-form-note ew-full">{eventClient?.name || "El cliente"} verá la reunión el {dateLabel(clientPreview.date)} a las {clientPreview.time}, hora de {timeZoneLabel(clientTimeZone(eventClient))}.</div>}
        <div className="ew-field ew-full"><label htmlFor="calendar-notes">Notas</label><textarea id="calendar-notes" name="notes" rows={3} defaultValue={editing?.notes || ""} maxLength={4000} /></div>
        {error && <div className="ew-error ew-full" role="alert">{error}</div>}
        <footer className="ew-form-footer ew-full">{editing && (confirmDelete ? <><span>¿Eliminar este evento?</span><button className="ew-button ew-secondary" type="button" onClick={() => setConfirmDelete(false)}>No</button><button className="ew-button" type="button" disabled={busy} onClick={() => void remove()}>Sí, eliminar</button></> : <button className="ew-button ew-secondary" type="button" onClick={() => setConfirmDelete(true)}>Eliminar</button>)}<button className="ew-button ew-secondary" type="button" onClick={closeEditor}>Cancelar</button><button className="ew-button" disabled={busy}>{busy ? "Guardando…" : "Guardar evento"}</button></footer>
      </form>
    </Modal>}
  </div>;
}
