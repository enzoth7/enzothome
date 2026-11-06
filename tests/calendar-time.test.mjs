import test from "node:test";
import assert from "node:assert/strict";
import { clientTimeZone, localDateTime, wallTimeToInstant } from "../src/components/workspace/calendar-time.ts";

test("a Montevideo meeting shows the correct London hour across daylight saving", () => {
  const client = { country: "GB", timeZone: "" };
  assert.equal(clientTimeZone(client), "Europe/London");
  const winter = wallTimeToInstant("2026-11-06", "09:00", "America/Montevideo");
  const summer = wallTimeToInstant("2026-07-06", "09:00", "America/Montevideo");
  assert.deepEqual(localDateTime(winter, clientTimeZone(client)), { date: "2026-11-06", time: "12:00" });
  assert.deepEqual(localDateTime(summer, clientTimeZone(client)), { date: "2026-07-06", time: "13:00" });
});

test("a meeting entered in London time converts to Montevideo and rejects a missing clock hour", () => {
  const instant = wallTimeToInstant("2026-07-06", "12:00", "Europe/London");
  assert.deepEqual(localDateTime(instant, "America/Montevideo"), { date: "2026-07-06", time: "08:00" });
  assert.equal(wallTimeToInstant("2026-03-29", "01:30", "Europe/London"), null);
});
