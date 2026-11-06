import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";
import { calendarEmail } from "../_shared/calendar-email.ts";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const replyTo = "enzothome1@gmail.com";

type Attachment = { path: string; name: string; size: number };

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function getSecretKey() {
  try {
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  } catch {
    return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  }
}

function getPublishableKey() {
  try {
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    return publishableKeys.default || Deno.env.get("SUPABASE_ANON_KEY") || "";
  } catch {
    return Deno.env.get("SUPABASE_ANON_KEY") || "";
  }
}

function bytesToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary);
}

async function deliveryKey(message: { id: string; title: string; content: string; attachments: unknown }) {
  const source = new TextEncoder().encode(`${message.id}\n${message.title}\n${message.content}\n${JSON.stringify(message.attachments)}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", source));
  return `workspace-${Array.from(digest).map(value => value.toString(16).padStart(2, "0")).join("")}`;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function validHtml(value: string) {
  if (!value || value.length > 50000) return false;
  return !/<\s*(script|iframe|object|embed|form|input|button)\b/i.test(value)
    && !/\son[a-z]+\s*=/i.test(value)
    && !/(javascript|data)\s*:/i.test(value);
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = getPublishableKey();
  const secretKey = getSecretKey();
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Enzo Thome <portal@enzothome.com>";
  const missing = [!url && "SUPABASE_URL", !publishableKey && "SUPABASE_PUBLISHABLE_KEYS", !secretKey && "SUPABASE_SECRET_KEYS", !resendKey && "RESEND_API_KEY"].filter(Boolean);
  if (missing.length) return response({ error: `Falta configurar ${missing.join(", ")} en Supabase.` }, 503);
  if (!token) return response({ error: "Unauthorized" }, 401);

  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase() || "";
  if (userError || !email) return response({ error: "Unauthorized" }, 401);

  const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: administrator } = await supabase.from("workspace_admins").select("email").eq("email", email).eq("active", true).maybeSingle();
  if (!administrator) return response({ error: "Forbidden" }, 403);

  try {
    const body = await request.json();
    const messageId = typeof body.messageId === "string" ? body.messageId : "";
    if (!messageId || messageId.length > 256) return response({ error: "Invalid request" }, 400);

    const { data: message } = await supabase.from("messages").select("id, client_id, title, content, kind, attachments").eq("id", messageId).maybeSingle();
    if (!message) return response({ error: "No se encontró el email." }, 404);

    const { data: client } = await supabase.from("clients").select("email,name,language,time_zone").eq("id", message.client_id).maybeSingle();
    if (!client || !validEmail(client.email || "")) return response({ error: "El cliente no tiene un email válido." }, 400);
    let outgoing = { ...message };
    if (message.kind === "Reunión creada") {
      const { data: meeting, error: meetingError } = await supabase.from("calendar_events").select("title,meeting_url,starts_at,project_id").eq("id", message.id).eq("kind", "meeting").maybeSingle();
      if (meetingError) return response({ error: "No se pudo comprobar la reunión." }, 500);
      if (!meeting?.starts_at) return response({ error: "La reunión ya no está disponible. No se envió el email preparado." }, 400);
      const { data: project } = await supabase.from("projects").select("client_id").eq("id", meeting.project_id).maybeSingle();
      if (project?.client_id !== message.client_id) return response({ error: "La reunión no corresponde al cliente del email." }, 400);
      const latest = calendarEmail("created", { title: meeting.title, startsAt: meeting.starts_at, meetingUrl: meeting.meeting_url, clientName: client.name, clientLanguage: client.language, clientTimeZone: client.time_zone });
      outgoing = { ...message, title: latest.subject, content: latest.html };
      const { error: refreshError } = await supabase.from("messages").update({ title: latest.subject, content: latest.html }).eq("id", message.id);
      if (refreshError) return response({ error: "No se pudo actualizar el borrador de la reunión." }, 500);
    }
    if (!outgoing.title || !validHtml(outgoing.content)) return response({ error: "El email no tiene contenido HTML válido." }, 400);

    const attachments = (Array.isArray(message.attachments) ? message.attachments : []) as Attachment[];
    if (attachments.length > 10) return response({ error: "Hay demasiados archivos adjuntos." }, 400);
    const totalSize = attachments.reduce((total, attachment) => total + Number(attachment?.size || 0), 0);
    if (totalSize > 20 * 1024 * 1024) return response({ error: "Los adjuntos superan los 20 MB." }, 400);

    const resendAttachments: { filename: string; content: string }[] = [];
    for (const attachment of attachments) {
      if (!attachment?.path?.startsWith(`${message.id}/`) || !attachment.name?.toLowerCase().endsWith(".pdf")) return response({ error: "Hay un adjunto no válido." }, 400);
      const { data: file, error } = await supabase.storage.from("workspace-documents").download(attachment.path);
      if (error || !file) return response({ error: `No se pudo leer ${attachment.name}.` }, 400);
      resendAttachments.push({ filename: attachment.name.slice(0, 180), content: bytesToBase64(await file.arrayBuffer()) });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": await deliveryKey(outgoing),
      },
      body: JSON.stringify({
        from,
        to: [client.email],
        reply_to: replyTo,
        subject: outgoing.title.slice(0, 240),
        html: outgoing.content,
        attachments: resendAttachments,
      }),
    });
    const resendResult = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok || typeof resendResult.id !== "string") {
      const providerMessage = typeof resendResult.message === "string" ? resendResult.message.slice(0, 500) : "Resend rechazó el envío.";
      await supabase.from("messages").update({ status: "Error", last_error: providerMessage }).eq("id", message.id);
      return response({ error: providerMessage }, 502);
    }

    const sentAt = new Date().toISOString();
    await supabase.from("messages").update({ status: "Enviado", sent_at: sentAt, resend_email_id: resendResult.id, last_error: "" }).eq("id", message.id);
    return response({ ok: true, sentAt, resendId: resendResult.id, title: outgoing.title, content: outgoing.content });
  } catch {
    return response({ error: "Invalid request" }, 400);
  }
});
