import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createEvent, financialSummary, listRecords, requireAdmin, validDate } from "../supabase/functions/_shared/ops-mcp-data.mjs";

function fakeDb(rows = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const state = { table, filters: [] };
      const builder = {
        select(columns) { state.columns = columns; calls.push({ type: "select", table, columns }); return builder; },
        eq(column, value) { state.filters.push([column, value]); return builder; },
        in(column, values) { state.filters.push([column, values]); return builder; },
        order() { return builder; },
        limit() { return builder; },
        then(resolve, reject) { return Promise.resolve({ data: rows[table] || [], error: null }).then(resolve, reject); },
        range(start, end) { return Promise.resolve({ data: (rows[table] || []).slice(start, end + 1), count: (rows[table] || []).length, error: null }); },
        maybeSingle() { return Promise.resolve({ data: (rows[table] || []).find(row => state.filters.every(([key, value]) => row[key] === value)) || null, error: null }); },
        insert(value) { calls.push({ type: "insert", table, value }); return builder; },
        single() { return Promise.resolve({ data: { id: "new-event", ...calls.findLast(call => call.type === "insert")?.value }, error: null }); },
      };
      return builder;
    },
  };
}

test("las consultas proyectan solo campos permitidos y no escriben", async () => {
  const db = fakeDb({ clients: [{ id: "c1", company: "Cliente" }] });
  const value = await listRecords(db, { section: "clientes", page: 1, limit: 50 });
  assert.equal(value.records.length, 1);
  const fields = db.calls[0].columns;
  assert.ok(!fields.includes("portal_token"));
  assert.ok(!fields.includes("portal_auth_user_id"));
  assert.ok(db.calls.every(call => call.type === "select"));
  await assert.rejects(() => listRecords(db, { section: "clientes", projectId: "p1" }), /filtro project_id/);
});

test("una cuenta no administradora queda excluida", async () => {
  const db = fakeDb({ workspace_admins: [{ email: "admin@example.com", active: true }] });
  await requireAdmin(db, "admin@example.com");
  await assert.rejects(() => requireAdmin(db, "cliente@example.com"), /no es administradora activa/);
});

test("crear_evento valida la fecha y solo inserta en calendar_events", async () => {
  assert.equal(validDate("2026-02-30"), false);
  const db = fakeDb({ projects: [{ id: "p1" }] });
  await assert.rejects(() => createEvent(db, { title: "Prueba", date: "2026-02-30" }), /fecha no es válida/);
  await assert.rejects(() => createEvent(db, { title: "Prueba", date: "2026-11-05", startTime: "16:00", endTime: "15:00" }), /hora de fin/);
  await assert.rejects(() => createEvent(db, { title: "Prueba", date: "2026-11-05", projectId: "otro" }), /proyecto indicado no existe/);
  const event = await createEvent(db, { title: "Reunión", date: "2026-11-05", startTime: "15:00", endTime: "16:00", projectId: "p1" });
  assert.equal(event.id, "new-event");
  assert.deepEqual(db.calls.filter(call => call.type === "insert").map(call => call.table), ["calendar_events"]);
});

test("el resumen separa importes por moneda como el portal", async () => {
  const db = fakeDb({
    projects: [{ id: "p1", client_id: "c1", title: "Proyecto", start_date: "2026-11-01", project_value: 1000, project_currency: "EUR" }],
    invoices: [{ id: "i1", project_id: "p1", amount: 300, paid: 200, currency: "EUR", paid_at: "2026-11-02" }],
  });
  const result = await financialSummary(db, { clientId: "c1" });
  assert.deepEqual(result.projects[0].amounts, [{ currency: "EUR", total: 1000, paid: 200, remaining: 800 }]);
  assert.deepEqual(result.pendingByCurrency, { EUR: 800 });
});

test("el manifiesto MCP contiene una sola herramienta de escritura", async () => {
  const script = fileURLToPath(new URL("../scripts/ops-mcp/server.mjs", import.meta.url));
  const child = spawn(process.execPath, [script], {
    env: { ...process.env, OPS_MCP_SUPABASE_URL: "https://example.supabase.co", OPS_MCP_SUPABASE_SECRET_KEY: "test-secret", OPS_MCP_ADMIN_EMAIL: "admin@example.com" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const messages = [];
  let buffer = "";
  let errorOutput = "";
  let listedRequestSent = false;
  let exited = false;
  child.once("exit", () => { exited = true; });
  child.stderr.on("data", chunk => { errorOutput += chunk.toString(); });
  child.stdout.on("data", chunk => {
    buffer += chunk.toString();
    for (;;) {
      const position = buffer.indexOf("\n");
      if (position < 0) break;
      const line = buffer.slice(0, position).trim();
      buffer = buffer.slice(position + 1);
      if (line) messages.push(JSON.parse(line));
      if (messages.some(message => message.id === 1) && !listedRequestSent) {
        listedRequestSent = true;
        child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
        child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
      }
    }
  });
  const timeout = setTimeout(() => child.kill(), 5000);
  try {
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } })}\n`);
    while (!messages.some(message => message.id === 2) && !exited) await new Promise(resolve => setTimeout(resolve, 20));
    const listed = messages.find(message => message.id === 2);
    assert.ok(listed?.result?.tools, errorOutput || JSON.stringify(messages));
    const tools = listed.result.tools;
    assert.deepEqual(tools.filter(tool => tool.annotations?.readOnlyHint === false).map(tool => tool.name), ["crear_evento"]);
    assert.equal(tools.length, 5);
  } finally {
    clearTimeout(timeout);
    child.kill();
    if (!exited) await once(child, "exit");
  }
});
