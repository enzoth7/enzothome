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
    const kind = body.kind;
    const mode = body.mode;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(accessToken) || !documentId || documentId.length > 256 || !["document", "invoice", "receipt"].includes(kind) || !["view", "download"].includes(mode)) {
      return response({ error: "Invalid request" }, 400);
    }

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!url || !secretKey) return response({ error: "Service unavailable" }, 503);

    const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const table = kind === "document" ? "documents" : "invoices";
    const columns = kind === "receipt" ? "project_id, receipt_storage_path, receipt_file_name" : "project_id, storage_path, file_name";
    const { data: document, error: lookupError } = await supabase.from(table).select(columns).eq("id", documentId).maybeSingle();
    if (lookupError || !document) return response({ error: "Document not found" }, 404);
    const file = document as unknown as Record<string, string | null>;
    const path = kind === "receipt" ? file.receipt_storage_path : file.storage_path;
    const name = kind === "receipt" ? file.receipt_file_name : file.file_name;
    if (!path) return response({ error: "Document not found" }, 404);

    const { data: project } = await supabase.from("projects").select("client_id").eq("id", document.project_id).maybeSingle();
    if (!project?.client_id) return response({ error: "Document not found" }, 404);

    const { data: client } = await supabase.from("clients").select("id").eq("id", project.client_id).eq("portal_token", accessToken).maybeSingle();
    if (!client) return response({ error: "Document not found" }, 404);

    const fileName = (name || "document").split(/[\\/]/).at(-1)?.replace(/[\r\n]/g, "") || "document";
    const { data, error } = await supabase.storage.from("workspace-documents").createSignedUrl(path, 60, mode === "download" ? { download: fileName } : undefined);
    if (error || !data?.signedUrl) return response({ error: "Document unavailable" }, 404);

    return response({ signedUrl: data.signedUrl, fileName });
  } catch {
    return response({ error: "Invalid request" }, 400);
  }
});
