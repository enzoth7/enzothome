import test from "node:test";
import assert from "node:assert/strict";
import { calendarEmail } from "../supabase/functions/_shared/calendar-email.ts";

const meeting = {
  title: "Revisión & próximos pasos",
  startsAt: "2026-11-07T12:00:00.000Z",
  meetingUrl: "https://meet.google.com/example",
  clientName: "Joel Samuel",
  clientLanguage: "Inglés",
  clientTimeZone: "Europe/London",
};

test("meeting emails use the client's time and link", () => {
  for (const kind of ["created", "rescheduled", "day", "halfHour"]) {
    const email = calendarEmail(kind, meeting);
    assert.match(email.html, /07 November 2026|7 November 2026/i);
    assert.match(email.html, /12:00/);
    assert.match(email.html, /https:\/\/meet\.google\.com\/example/);
    assert.match(email.subject, /Revisión & próximos pasos/);
  }
  assert.match(calendarEmail("day", meeting).subject, /tomorrow/);
  assert.match(calendarEmail("halfHour", meeting).subject, /30 minutes/);
  assert.match(calendarEmail("rescheduled", meeting).subject, /rescheduled/);
});

test("meeting details cannot inject HTML or an unsafe link", () => {
  const email = calendarEmail("created", { ...meeting, title: "<script>alert(1)</script>", meetingUrl: "javascript:alert(1)" });
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.doesNotMatch(email.html, /javascript:/);
});
