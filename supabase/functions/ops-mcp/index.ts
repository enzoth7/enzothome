import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createMcpHandler, McpServer } from "npm:@modelcontextprotocol/server@2.4.0";
import { pipeline } from "npm:@supabase/middleware@1";
import { withOAuthProtectedResource, withSupabase } from "npm:@supabase/server@1";
import { z } from "npm:zod@4.6.7";
import { registerOpsTools } from "../_shared/ops-mcp-registry.mjs";

// The middleware validates the OAuth token and gives each request an RLS-scoped client.
// No service-role key is available to this function.
Deno.serve(pipeline(
  [withOAuthProtectedResource(), withSupabase({ auth: "user" })],
  async (request, { supabase }) => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email) return new Response("Unauthorized", { status: 401 });
    const adminEmail = user.email.toLowerCase();
    const handler = createMcpHandler(() => {
      const server = new McpServer({ name: "enzothome-operaciones", version: "1.0.0" }, { capabilities: { tools: {} } });
      return registerOpsTools(server, supabase, adminEmail, z);
    });
    return handler.fetch(request);
  },
));
