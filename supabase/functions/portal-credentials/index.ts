import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const headers = { ...corsHeaders, "Content-Type": "application/json" };
const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers });

function secretKey() {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  } catch {
    return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  }
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = secretKey();
  if (!token) return reply({ error: "Unauthorized" }, 401);
  if (!url || !key) return reply({ error: "Service unavailable" }, 503);

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identity, error: identityError } = await admin.auth.getUser(token);
  if (identityError || !identity.user) return reply({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: "Invalid request" }, 400); }

  if (body.mode === "resolve") {
    const { data: client } = await admin.from("clients").select("portal_token").eq("portal_auth_user_id", identity.user.id).maybeSingle();
    return client?.portal_token ? reply({ accessToken: client.portal_token }) : reply({ error: "Forbidden" }, 403);
  }
  if (body.mode !== "set") return reply({ error: "Invalid request" }, 400);

  const email = identity.user.email?.toLowerCase() || "";
  const { data: administrator } = await admin.from("workspace_admins").select("email").eq("email", email).eq("active", true).maybeSingle();
  if (!administrator) return reply({ error: "Forbidden" }, 403);

  const clientId = typeof body.clientId === "string" ? body.clientId : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!clientId || clientId.length > 120 || !/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username) || password.length < 8 || password.length > 128) {
    return reply({ error: "Usuario inválido o contraseña de menos de 8 caracteres." }, 400);
  }

  const { data: target, error: targetError } = await admin.from("clients").select("id, portal_auth_user_id").eq("id", clientId).maybeSingle();
  if (targetError || !target) return reply({ error: "Client not found" }, 404);
  const { data: taken } = await admin.from("clients").select("id").eq("portal_username", username).neq("id", clientId).maybeSingle();
  if (taken) return reply({ error: "Ese usuario ya está asignado." }, 409);

  const authEmail = `${username}@portal.enzothome.com`;
  const previousUserId = target.portal_auth_user_id as string | null;
  let previousEmail = "";
  if (previousUserId) {
    const { data: previous } = await admin.auth.admin.getUserById(previousUserId);
    previousEmail = previous.user?.email || "";
    if (!previousEmail) return reply({ error: "No se pudo actualizar el acceso anterior." }, 500);
    const retiredEmail = `retired-${crypto.randomUUID()}@portal.enzothome.com`;
    const { error: retireError } = await admin.auth.admin.updateUserById(previousUserId, { email: retiredEmail, email_confirm: true });
    if (retireError) return reply({ error: "No se pudo actualizar el acceso anterior." }, 500);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({ email: authEmail, password, email_confirm: true });
  if (createError || !created.user) {
    if (previousUserId) await admin.auth.admin.updateUserById(previousUserId, { email: previousEmail, email_confirm: true });
    return reply({ error: "No se pudo crear el acceso. Verificá que el usuario no exista." }, 400);
  }
  const authUserId = created.user.id;

  const portalToken = crypto.randomUUID();
  const { error: saveError } = await admin.from("clients").update({ portal_username: username, portal_auth_user_id: authUserId, portal_token: portalToken }).eq("id", clientId);
  if (saveError) {
    await admin.auth.admin.deleteUser(authUserId);
    if (previousUserId) await admin.auth.admin.updateUserById(previousUserId, { email: previousEmail, email_confirm: true });
    return reply({ error: "No se pudo vincular el acceso al cliente." }, 500);
  }
  if (previousUserId) await admin.auth.admin.deleteUser(previousUserId);
  return reply({ username, portalToken });
});
