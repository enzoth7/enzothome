import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { calendarEmail } from "../_shared/calendar-email.ts";

type DueReminder = {
  event_id: string;
  reminder_minutes: -1 | 0 | 30 | 1440;
  revision: string;
  title: string;
  meeting_url: string;
  starts_at: string;
  client_name: string;
  client_email: string;
  client_language: string;
  client_time_zone: string;
};

function secretKey() {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  } catch { return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""; }
}

async function idempotencyKey(reminder: DueReminder) {
  const source = new TextEncoder().encode(`${reminder.event_id}:${reminder.reminder_minutes}:${reminder.revision}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", source));
  return `calendar-${Array.from(digest).map(value => value.toString(16).padStart(2, "0")).join("")}`;
}

Deno.serve(async request => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = secretKey();
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  if (!url || !key || !resendKey) return new Response(JSON.stringify({ error: "Missing Supabase or Resend configuration" }), { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: cronSecret, error: secretError } = await supabase.rpc("get_calendar_reminder_secret");
  if (secretError || !cronSecret || request.headers.get("x-cron-secret") !== cronSecret) return new Response("Unauthorized", { status: 401 });
  const { data, error } = await supabase.rpc("claim_due_calendar_reminders");
  if (error) return new Response(JSON.stringify({ error: "Could not claim reminders" }), { status: 500 });
  let sent = 0, failed = 0, skipped = 0;
  for (const reminder of (data || []) as DueReminder[]) {
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reminder.client_email)) throw new Error("Invalid client email");
      const { data: current, error: currentError } = await supabase.from("calendar_events").select("updated_at,starts_at").eq("id", reminder.event_id).maybeSingle();
      if (currentError) throw currentError;
      if (!current || Date.parse(current.updated_at) !== Date.parse(reminder.revision) || Date.parse(current.starts_at) !== Date.parse(reminder.starts_at)) { skipped++; continue; }
      const kind = reminder.reminder_minutes === -1 ? "created" : reminder.reminder_minutes === 0 ? "rescheduled" : reminder.reminder_minutes === 1440 ? "day" : "halfHour";
      const { subject, html } = calendarEmail(kind, {
        title: reminder.title,
        startsAt: reminder.starts_at,
        meetingUrl: reminder.meeting_url,
        clientName: reminder.client_name,
        clientLanguage: reminder.client_language,
        clientTimeZone: reminder.client_time_zone,
      });
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": await idempotencyKey(reminder) },
        body: JSON.stringify({ from: Deno.env.get("RESEND_FROM_EMAIL") || "Enzo Thome <portal@enzothome.com>", to: [reminder.client_email], bcc: reminder.reminder_minutes <= 0 && reminder.client_email.toLowerCase() !== "enzothome1@gmail.com" ? ["enzothome1@gmail.com"] : undefined, reply_to: "enzothome1@gmail.com", subject: subject.slice(0, 240), html }),
      });
      const response = await result.json().catch(() => ({}));
      if (!result.ok || typeof response.id !== "string") throw new Error(typeof response.message === "string" ? response.message.slice(0, 500) : "Resend rejected the email");
      const { error: updateError } = await supabase.from("calendar_reminder_deliveries").update({ sent_at: new Date().toISOString(), resend_email_id: response.id, last_error: "" }).eq("event_id", reminder.event_id).eq("reminder_minutes", reminder.reminder_minutes).eq("revision", reminder.revision);
      if (updateError) throw updateError;
      sent++;
    } catch (cause) {
      failed++;
      const message = cause instanceof Error ? cause.message.slice(0, 500) : "Delivery failed";
      await supabase.from("calendar_reminder_deliveries").update({ last_error: message }).eq("event_id", reminder.event_id).eq("reminder_minutes", reminder.reminder_minutes).eq("revision", reminder.revision);
    }
  }
  return new Response(JSON.stringify({ claimed: (data || []).length, sent, failed, skipped }), { headers: { "Content-Type": "application/json" }, status: failed ? 207 : 200 });
});
