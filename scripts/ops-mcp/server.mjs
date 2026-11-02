import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod/v4";
import { registerOpsTools } from "../../supabase/functions/_shared/ops-mcp-registry.mjs";

export function createOpsServer(db, adminEmail) {
  const server = new McpServer({ name: "enzothome-operaciones", version: "1.0.0" }, { capabilities: { tools: {} } });
  return registerOpsTools(server, db, adminEmail, z);
}

function start() {
  const envPath = resolve(fileURLToPath(new URL("../../.env.mcp.local", import.meta.url)));
  if (existsSync(envPath)) process.loadEnvFile(envPath);
  const url = process.env.OPS_MCP_SUPABASE_URL;
  const secret = process.env.OPS_MCP_SUPABASE_SECRET_KEY;
  const adminEmail = process.env.OPS_MCP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!url || !secret || !adminEmail) {
    throw new Error("Configurá OPS_MCP_SUPABASE_URL, OPS_MCP_SUPABASE_SECRET_KEY y OPS_MCP_ADMIN_EMAIL en .env.mcp.local.");
  }
  if (secret === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || secret.startsWith("sb_publishable_")) {
    throw new Error("El MCP necesita una clave secreta de servidor; la clave pública no tiene acceso de administrador.");
  }
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  serveStdio(() => createOpsServer(db, adminEmail), { onerror: error => console.error(error.message) });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { start(); } catch (error) {
    console.error(error instanceof Error ? error.message : "No se pudo iniciar el MCP.");
    process.exitCode = 1;
  }
}
