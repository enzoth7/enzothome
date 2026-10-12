import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const body = await request.json();
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const documentId = typeof body.documentId === "string" ? body.documentId : "";
    const kind = body.kind === "invoice" ? "invoice" : "document";

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accessToken) || !documentId || documentId.length > 256) {
      return response({ error: "Invalid request" }, 400);
    }

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!url || !secretKey) return response({ error: "Service unavailable" }, 503);

    const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const table = kind === "invoice" ? "invoices" : "documents";
    const { data: document } = await supabase.from(table).select("project_id, storage_path, file_name").eq("id", documentId).maybeSingle();
    if (!document?.storage_path) return response({ error: "Document not found" }, 404);

    const { data: project } = await supabase.from("projects").select("client_id").eq("id", document.project_id).maybeSingle();
    if (!project?.client_id) return response({ error: "Document not found" }, 404);

    const { data: client } = await supabase.from("clients").select("id").eq("id", project.client_id).eq("portal_token", accessToken).maybeSingle();
    if (!client) return response({ error: "Document not found" }, 404);

    const { data, error } = await supabase.storage.from("workspace-documents").createSignedUrl(document.storage_path, 60);
    if (error || !data?.signedUrl) return response({ error: "Document unavailable" }, 404);

    return response({ signedUrl: data.signedUrl, fileName: document.file_name || "document" });
  } catch {
    return response({ error: "Invalid request" }, 400);
  }
});
