"use client";

import { useState } from "react";
import { clientTimeZone, eventEnd, eventStart, localDateTime, timeZoneLabel } from "./calendar-time";
import { dateLabel, safeUrl, type CalendarEvent, type Client, type Project, type Task } from "./model";
import { Icon } from "./ui";

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

export default function PortalCalendar({ client, projects, stages, events, english }: { client: Client; projects: Project[]; stages: Task[]; events: CalendarEvent[]; english: boolean }) {
  const zone = clientTimeZone(client);
  const now = dateKey(new Date(), zone);
  const [month, setMonth] = useState(now.slice(0, 7));
  const [selected, setSelected] = useState(now);
  const items = portalAgendaItems(client, projects, stages, events, english);
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const monthLabel = new Intl.DateTimeFormat(english ? "en-GB" : "es-UY", { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const gridStart = new Date(Date.UTC(year, monthIndex - 1, 1 - (first.getUTCDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getTime() + index * 86400000));
  const key = (date: Date) => date.toISOString().slice(0, 10);
  const changeMonth = (offset: number) => { const next = new Date(Date.UTC(year, monthIndex - 1 + offset, 1)); const value = key(next); setMonth(value.slice(0, 7)); setSelected(value); };
  const selectedItems = items.filter(item => item.date === selected);
  return <div className="ew-calendar-shell ew-portal-calendar">
    <div className="ew-calendar-toolbar"><div><h2>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</h2><p>{english ? "Times shown in" : "Horarios en"} {timeZoneLabel(zone)}</p></div><div className="ew-calendar-controls"><button className="ew-button ew-secondary" onClick={() => { setMonth(now.slice(0, 7)); setSelected(now); }}>{english ? "Today" : "Hoy"}</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(-1)} aria-label={english ? "Previous month" : "Mes anterior"}>‹</button><button className="ew-icon-button ew-action-button" onClick={() => changeMonth(1)} aria-label={english ? "Next month" : "Mes siguiente"}>›</button></div></div>
    <div className="ew-calendar-layout"><div className="ew-calendar-grid" role="grid" aria-label={`${english ? "Calendar for" : "Calendario de"} ${monthLabel}`}>
      {(english ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]).map(day => <div className="ew-calendar-weekday" key={day}>{day}</div>)}
      {days.map(day => { const value = key(day); const dayItems = items.filter(item => item.date === value); return <button type="button" role="gridcell" key={value} className={`ew-calendar-day ${value.slice(0, 7) !== month ? "is-outside" : ""} ${value === selected ? "is-selected" : ""} ${value === now ? "is-today" : ""}`} aria-label={`${dateLabel(value, english ? "en-GB" : "es-UY")}, ${dayItems.length} ${english ? "items" : "actividades"}`} aria-selected={value === selected} onClick={() => { setSelected(value); if (value.slice(0, 7) !== month) setMonth(value.slice(0, 7)); }}><span className="ew-calendar-day-number">{day.getUTCDate()}</span>{dayItems.length > 0 && <span className="ew-calendar-day-items">{dayItems.slice(0, 2).map(item => <span key={item.id} title={item.title}>{item.meeting ? `${item.detail} ` : ""}{item.title}</span>)}</span>}</button>; })}
    </div><section className="ew-calendar-agenda" aria-label={english ? "Daily agenda" : "Agenda del día"}><h3>{dateLabel(selected, english ? "en-GB" : "es-UY")}</h3>{selectedItems.map(item => <article className="ew-portal-agenda-item" key={item.id}><span>{item.meeting ? (english ? "Meeting" : "Reunión") : item.detail}{item.meeting ? `, ${item.detail}` : ""}</span><strong>{item.title}</strong><small>{projects.find(project => project.id === item.projectId)?.title}</small>{item.meeting?.meetingUrl && safeUrl(item.meeting.meetingUrl) && <a className="ew-button" href={safeUrl(item.meeting.meetingUrl)} target="_blank" rel="noopener noreferrer"><Icon name="external" size={16} />{english ? "Join meeting" : "Entrar a la reunión"}</a>}</article>)}{!selectedItems.length && <p>{english ? "Nothing scheduled for this day." : "No hay actividades para este día."}</p>}</section></div>
  </div>;
}
