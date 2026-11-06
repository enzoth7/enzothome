import { getTimezonesForCountry } from "countries-and-timezones";
import type { CalendarEvent, Client } from "./model";

export const ADMIN_TIME_ZONE = "America/Montevideo";

export function countryTimeZones(country: string): string[] {
  return (getTimezonesForCountry(country) || []).map(zone => zone.name);
}

export function clientTimeZone(client?: Client): string {
  if (client?.timeZone) return client.timeZone;
  const zones = countryTimeZones(client?.country || "");
  return zones.length === 1 ? zones[0] : ADMIN_TIME_ZONE;
}

export function timeZoneLabel(zone: string): string {
  return zone.replaceAll("_", " ").replaceAll("/", " / ");
}

export function localDateTime(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(instant);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${value.year}-${value.month}-${value.day}`, time: `${value.hour}:${value.minute}` };
}

export function wallTimeToInstant(date: string, time: string, timeZone: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const target = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(target)) return null;
  let instant = target;
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const actual = localDateTime(new Date(instant), timeZone);
      const difference = target - Date.parse(`${actual.date}T${actual.time}:00Z`);
      if (difference === 0) return new Date(instant);
      instant += difference;
    }
    const actual = localDateTime(new Date(instant), timeZone);
    return actual.date === date && actual.time === time ? new Date(instant) : null;
  } catch { return null; }
}

export function eventStart(event: CalendarEvent): Date | null {
  if (event.startsAt) {
    const instant = new Date(event.startsAt);
    if (Number.isFinite(instant.getTime())) return instant;
  }
  return event.startTime ? wallTimeToInstant(event.date, event.startTime.slice(0, 5), event.timeZone || ADMIN_TIME_ZONE) : null;
}

export function eventEnd(event: CalendarEvent): Date | null {
  if (event.endsAt) {
    const instant = new Date(event.endsAt);
    if (Number.isFinite(instant.getTime())) return instant;
  }
  return event.endTime ? wallTimeToInstant(event.date, event.endTime.slice(0, 5), event.timeZone || ADMIN_TIME_ZONE) : null;
}
