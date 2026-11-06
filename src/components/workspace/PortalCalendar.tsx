"use client";

import { useState, type FormEvent } from "react";
import { clientTimeZone, eventEnd, eventStart, localDateTime, timeZoneLabel, wallTimeToInstant } from "./calendar-time";
import { dateLabel, safeUrl, type CalendarEvent, type Client, type Project, type Task } from "./model";
import { Icon, Modal } from "./ui";

type AgendaItem = { id: string; date: string; title: string; detail: string; projectId: string; meeting?: CalendarEvent };

function dateKey(date: Date, zone: string) { return localDateTime(date, zone).date; }

export function portalAgendaItems(client: Client, projects: Project[], stages: Task[], events: CalendarEvent[], english = false): AgendaItem[] {
  const projectIds = new Set(projects.map(project => project.id));
  const zone = clientTimeZone(client);
  return [
    ...projects.flatMap(project => [
      { id: `${project.id}-start`, date: project.start, title: `${english ? "Start" : "Inicio"}: ${project.title}`, detail: english ? "Project start" : "Inicio de proyecto", projectId: project.id },
      { id: `${project.id}-end`, date: project.due, title: `${english ? "Delivery" : "Entrega"}: ${project.title}`, detail: english ? "Project completion" : "Fin de proyecto", projectId: project.id },
    ]),
    ...stages.filter(stage => projectIds.has(stage.projectId) && stage.kind === "Hito").flatMap(stage => [
      ...(stage.start ? [{ id: `${stage.id}-start`, date: stage.start, title: `${english ? "Start" : "Inicio"}: ${stage.title}`, detail: english ? "Stage start" : "Inicio de etapa", projectId: stage.projectId }] : []),
      { id: `${stage.id}-end`, date: stage.due, title: `${english ? "Due" : "Fin"}: ${stage.title}`, detail: english ? "Stage due" : "Fin de etapa", projectId: stage.projectId },
    ]),
    ...events.filter(event => event.kind === "meeting" && projectIds.has(event.projectId) && eventStart(event)).map(event => {
      const local = localDateTime(eventStart(event)!, zone);
      return { id: event.id, date: local.date, title: event.title, detail: local.time, projectId: event.projectId, meeting: event };
    }),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.detail.localeCompare(b.detail));
}

export function nextPortalMeeting(events: CalendarEvent[], projectIds: Set<string>): CalendarEvent | undefined {
  const now = Date.now();
  return events.filter(event => event.kind === "meeting" && projectIds.has(event.projectId) && (eventEnd(event)?.getTime() || 0) >= now)
    .sort((a, b) => (eventStart(a)?.getTime() || 0) - (eventStart(b)?.getTime() || 0))[0];
}

export function PortalMeetingNotice({ client, meeting, english, onCalendar }: { client: Client; meeting: CalendarEvent; english: boolean; onCalendar: () => void }) {
  const starts = eventStart(meeting);
  if (!starts) return null;
  const zone = clientTimeZone(client);
  const local = localDateTime(starts, zone);
  const url = safeUrl(meeting.meetingUrl || "");
  return <section className="ew-meeting-notice" aria-label={english ? "Next meeting" : "Próxima reunión"}>
    <div><h2>{meeting.title}</h2><p>{dateLabel(local.date, english ? "en-GB" : "es-UY")} {english ? "at" : "a las"} {local.time} <small>({timeZoneLabel(zone)})</small></p></div>
    <div className="ew-meeting-actions">{url && <a className="ew-button" href={url} target="_blank" rel="noopener noreferrer"><Icon name="external" size={17} />{english ? "Join meeting" : "Entrar a la reunión"}</a>}<button className="ew-button ew-secondary" onClick={onCalendar}>{english ? "View calendar" : "Ver calendario"}</button></div>
  </section>;
}

export default function PortalCalendar({ client, projects, stages, events, english, onCreateMeeting, onRescheduleMeeting }: { client: Client; projects: Project[]; stages: Task[]; events: CalendarEvent[]; english: boolean; onCreateMeeting: (meeting: Pick<CalendarEvent, "projectId" | "title" | "date" | "startTime" | "endTime" | "meetingUrl">) => Promise<void>; onRescheduleMeeting: (meeting: CalendarEvent, date: string, startTime: string, endTime: string) => Promise<void> }) {
  const zone = clientTimeZone(client);
  const now = dateKey(new Date(), zone);
  const [month, setMonth] = useState(now.slice(0, 7));
  const [selected, setSelected] = useState(now);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [eventDate, setEventDate] = useState(now);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const items = portalAgendaItems(client, projects, stages, events, english);
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const monthLabel = new Intl.DateTimeFormat(english ? "en-GB" : "es-UY", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const gridStart = new Date(Date.UTC(year, monthIndex - 1, 1 - (first.getUTCDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getTime() + index * 86400000));
  const key = (date: Date) => date.toISOString().slice(0, 10);
  const changeMonth = (offset: number) => { const next = new Date(Date.UTC(year, monthIndex - 1 + offset, 1)); const value = key(next); setMonth(value.slice(0, 7)); setSelected(value); };
  const selectedItems = items.filter(item => item.date === selected);
  const openEditor = (meeting?: CalendarEvent) => {
    const local = meeting && eventStart(meeting) ? localDateTime(eventStart(meeting)!, zone) : null;
    const localEnd = meeting && eventEnd(meeting) ? localDateTime(eventEnd(meeting)!, zone) : null;
    setEditing(meeting || null); setEventDate(local?.date || selected); setStartTime(local?.time || ""); setEndTime(localEnd?.time || "");
    setTitle(meeting?.title || ""); setProjectId(meeting?.projectId || projects[0]?.id || ""); setMeetingUrl(meeting?.meetingUrl || ""); setError(""); setEditorOpen(true);
  };
  async function saveMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const start = wallTimeToInstant(eventDate, startTime, zone);
    const end = wallTimeToInstant(eventDate, endTime, zone);
    if (!start || !end || end <= start || start.getTime() <= Date.now()) { setError(english ? "Choose a future date and a valid start and end time." : "Elegí una fecha futura y un horario de inicio y fin válido."); return; }
    if (!editing && (!title.trim() || !projectId || (meetingUrl && !safeUrl(meetingUrl)))) { setError(english ? "Add a title and project, and check the meeting link." : "Completá el título y el proyecto, y revisá el enlace de la reunión."); return; }
    setBusy(true); setError("");
    try {
      if (editing) await onRescheduleMeeting(editing, eventDate, startTime, endTime);
      else await onCreateMeeting({ projectId, title: title.trim(), date: eventDate, startTime, endTime, meetingUrl: meetingUrl.trim() });
      setMonth(eventDate.slice(0, 7)); setSelected(eventDate); setEditorOpen(false);
    } catch (cause) { setError(english ? "Could not save the meeting. Refresh the calendar and try again." : cause instanceof Error ? cause.message : "No se pudo guardar la reunión."); }
    finally { setBusy(false); }
  }
  return <div className="ew-calendar-shell ew-portal-calendar">
    <div className="ew-calendar-toolbar"><div><h2>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</h2><p>{english ? "Times shown in" : "Horarios en"} {timeZoneLabel(zone)}</p></div><div className="ew-calendar-controls"><button className="ew-button ew-secondary" onClick={() => { setMonth(now.slice(0, 7)); setSelected(now); }}>{english ? "Today" : "Hoy"}</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(-1)} aria-label={english ? "Previous month" : "Mes anterior"}>‹</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(1)} aria-label={english ? "Next month" : "Mes siguiente"}>›</button><button className="ew-button" disabled={!projects.length} onClick={() => openEditor()}><Icon name="plus" size={16} />{english ? "New meeting" : "Nueva reunión"}</button></div></div>
    <div className="ew-calendar-layout"><div className="ew-calendar-grid" role="grid" aria-label={`${english ? "Calendar for" : "Calendario de"} ${monthLabel}`}>
      {(english ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]).map(day => <div className="ew-calendar-weekday" key={day}>{day}</div>)}
      {days.map(day => { const value = key(day); const dayItems = items.filter(item => item.date === value); return <button type="button" role="gridcell" key={value} className={`ew-calendar-day ${value.slice(0, 7) !== month ? "is-outside" : ""} ${value === selected ? "is-selected" : ""} ${value === now ? "is-today" : ""}`} aria-label={`${dateLabel(value, english ? "en-GB" : "es-UY")}, ${dayItems.length} ${english ? "items" : "actividades"}`} aria-selected={value === selected} onClick={() => { setSelected(value); if (value.slice(0, 7) !== month) setMonth(value.slice(0, 7)); }}><span className="ew-calendar-day-number">{day.getUTCDate()}</span>{dayItems.length > 0 && <span className="ew-calendar-day-items">{dayItems.slice(0, 2).map(item => <span key={item.id} title={item.title}>{item.meeting ? `${item.detail} ` : ""}{item.title}</span>)}</span>}</button>; })}
    </div><section className="ew-calendar-agenda" aria-label={english ? "Daily agenda" : "Agenda del día"}><h3>{dateLabel(selected, english ? "en-GB" : "es-UY")}</h3>{selectedItems.map(item => <article className="ew-portal-agenda-item" key={item.id}><span>{item.meeting ? (english ? "Meeting" : "Reunión") : item.detail}{item.meeting ? `, ${item.detail}` : ""}</span><strong>{item.title}</strong><small>{projects.find(project => project.id === item.projectId)?.title}</small>{item.meeting && <div className="ew-portal-meeting-actions">{item.meeting.meetingUrl && safeUrl(item.meeting.meetingUrl) && <a className="ew-button" href={safeUrl(item.meeting.meetingUrl)} target="_blank" rel="noopener noreferrer"><Icon name="external" size={16} />{english ? "Join meeting" : "Entrar a la reunión"}</a>}{(eventEnd(item.meeting)?.getTime() || 0) > Date.now() && <button type="button" className="ew-button ew-secondary" onClick={() => openEditor(item.meeting)}>{english ? "Change date or time" : "Cambiar fecha u hora"}</button>}</div>}</article>)}{!selectedItems.length && <p>{english ? "Nothing scheduled for this day." : "No hay actividades para este día."}</p>}</section></div>
    {editorOpen && <Modal title={editing ? (english ? "Change meeting time" : "Cambiar horario de la reunión") : (english ? "New meeting" : "Nueva reunión")} onClose={() => { if (!busy) setEditorOpen(false); }}>
      <form className="ew-form" onSubmit={event => void saveMeeting(event)}>
        {editing ? <div className="ew-form-note ew-full"><strong>{editing.title}</strong><br />{projects.find(project => project.id === editing.projectId)?.title}</div> : <>
          <div className="ew-field ew-full"><label htmlFor="portal-meeting-title">{english ? "Title" : "Título"}</label><input id="portal-meeting-title" value={title} onChange={event => setTitle(event.target.value)} required maxLength={240} /></div>
          <div className="ew-field ew-full"><label htmlFor="portal-meeting-project">{english ? "Project" : "Proyecto"}</label><select id="portal-meeting-project" value={projectId} onChange={event => setProjectId(event.target.value)} required>{projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div>
        </>}
        <div className="ew-field ew-full"><label htmlFor="portal-meeting-date">{english ? "Date" : "Fecha"}</label><input id="portal-meeting-date" type="date" min={now} value={eventDate} onChange={event => setEventDate(event.target.value)} required /></div>
        <div className="ew-field"><label htmlFor="portal-meeting-start">{english ? "Start" : "Desde"}</label><input id="portal-meeting-start" type="time" value={startTime} onChange={event => setStartTime(event.target.value)} required /></div>
        <div className="ew-field"><label htmlFor="portal-meeting-end">{english ? "End" : "Hasta"}</label><input id="portal-meeting-end" type="time" value={endTime} onChange={event => setEndTime(event.target.value)} required /></div>
        <div className="ew-hint ew-full">{english ? "Times are in" : "Los horarios están en"} {timeZoneLabel(zone)}.</div>
        {!editing && <div className="ew-field ew-full"><label htmlFor="portal-meeting-url">{english ? "Meeting link (optional)" : "Enlace de reunión (opcional)"}</label><input id="portal-meeting-url" type="url" value={meetingUrl} onChange={event => setMeetingUrl(event.target.value)} placeholder="https://meet.google.com/..." maxLength={2048} /></div>}
        {error && <div className="ew-error ew-full" role="alert">{error}</div>}
        <footer className="ew-form-footer ew-full"><button type="button" className="ew-button ew-secondary" disabled={busy} onClick={() => setEditorOpen(false)}>{english ? "Cancel" : "Cancelar"}</button><button className="ew-button" disabled={busy}>{busy ? (english ? "Saving..." : "Guardando...") : (english ? "Save meeting" : "Guardar reunión")}</button></footer>
      </form>
    </Modal>}
  </div>;
}
