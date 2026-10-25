import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceSeed, internalChecklistItems, isWorkspaceData, invoiceOutstandingByCurrency, invoiceStatus, projectPaymentSummary, safeUrl, today } from "../src/components/workspace/model.ts";

function createFixture() {
  const data = createWorkspaceSeed();
  data.invoices.push({ id: "invoice-test", projectId: data.projects[0].id, title: "Factura TEST-001", number: "TEST-001", amount: 500, currency: "USD", due: today(), paid: 0, paymentInfo: "", date: today(), lines: [{ id: "line-1", description: "Servicio profesional", amount: 500 }], fileId: "", fileName: "" });
  return data;
}

test("web checklist covers analytics, commerce and operational review", () => {
  const byId = new Map(internalChecklistItems.map(item => [item.id, item]));
  assert.equal(byId.get("analytics")?.label, "Google Analytics (GA4) configurado y verificado");
  assert.equal(byId.get("search-console")?.label, "Google Search Console");
  assert.equal(byId.get("merchant-center")?.optional, true);
  for (const id of ["security-review", "api-usage", "cache-pagination", "supabase-usage", "vercel-usage", "usage-alerts", "backup-recovery"]) {
    assert.ok(byId.has(id), `missing checklist item: ${id}`);
  }
});

test("web checklist starts with brand design and tracks each motion decision", () => {
  assert.deepEqual(internalChecklistItems.slice(0, 2).map(item => item.id), ["brand-book", "figma-design"]);
  const byId = new Map(internalChecklistItems.map(item => [item.id, item]));
  for (const id of ["image-formats", "motion-direction", "motion-scroll", "motion-cards", "motion-hero", "motion-transitions", "motion-frames", "motion-accessibility", "motion-performance"]) {
    assert.ok(byId.has(id), `missing checklist item: ${id}`);
  }
  for (const id of ["motion-cards", "motion-hero", "motion-frames"]) {
    assert.equal(byId.get(id)?.optional, true);
  }
  const data = createFixture();
  data.projects[0].internalChecklist = ["brand-book", "figma-design", "motion-scroll", "image-formats"];
  assert.equal(isWorkspaceData(JSON.parse(JSON.stringify(data))), true);
});

test("the demo survives a JSON backup round trip", () => {
  assert.equal(isWorkspaceData(JSON.parse(JSON.stringify(createFixture()))), true);
});

test("backup validation rejects orphaned records and duplicate IDs", () => {
  const orphan = createFixture();
  orphan.invoices[0].projectId = "missing";
  assert.equal(isWorkspaceData(orphan), false);
  const duplicate = createFixture();
  duplicate.clients.push({ ...duplicate.clients[0] });
  assert.equal(isWorkspaceData(duplicate), false);
});

test("invalid amounts and unsupported currencies cannot be restored", () => {
  for (const bad of [{ amount: NaN }, { paid: -1 }, { paid: 999999 }, { currency: "invalid" }]) {
    const data = createFixture();
    Object.assign(data.invoices[0], bad);
    assert.equal(isWorkspaceData(data), false);
  }
});

test("client outstanding balance stays separate by currency and excludes settled invoices", () => {
  const fixture = createFixture();
  fixture.invoices.push({ ...fixture.invoices[0], id: "paid", paid: 500 });
  fixture.invoices.push({ ...fixture.invoices[0], id: "partial", currency: "EUR", amount: 300, paid: 100 });
  fixture.invoices.push({ ...fixture.invoices[0], id: "pending", currency: "EUR", amount: 400, paid: 0 });
  assert.deepEqual(invoiceOutstandingByCurrency(fixture.invoices), [["EUR", 600], ["USD", 500]]);
});

test("project values and private receipt metadata survive validation", () => {
  const data = createFixture();
  data.projects[0].value = 125000;
  data.projects[0].currency = "UYU";
  data.invoices[0].receiptFileId = "invoice-test/receipt.pdf";
  data.invoices[0].receiptFileName = "recibo.pdf";
  assert.equal(isWorkspaceData(JSON.parse(JSON.stringify(data))), true);
  data.projects[0].currency = "GBP";
  assert.equal(isWorkspaceData(data), false);
  data.projects[0].currency = "USD";
  data.projects[0].value = -1;
  assert.equal(isWorkspaceData(data), false);
});

test("project payment summary uses project value and keeps currencies separate", () => {
  const data = createFixture();
  const project = { ...data.projects[0], value: 1000, currency: "USD" };
  const usdInvoice = { ...data.invoices[0], amount: 500, paid: 200, paidAt: "2026-10-02" };
  const uyuInvoice = { ...data.invoices[0], id: "invoice-uyu", number: "TEST-UYU", amount: 10000, paid: 10000, paidAt: "2026-10-05", currency: "UYU", lines: [{ id: "line-uyu", description: "Servicio", amount: 10000 }] };
  const summary = projectPaymentSummary(project, [usdInvoice, uyuInvoice]);
  assert.deepEqual(summary.amounts, [
    { currency: "USD", total: 1000, paid: 200, remaining: 800 },
    { currency: "UYU", total: 10000, paid: 10000, remaining: 0 },
  ]);
  assert.equal(summary.lastPaidAt, "2026-10-05");
});

test("invoice lines must describe and equal the invoice total", () => {
  const missingDescription = createFixture();
  missingDescription.invoices[0].lines[0].description = "";
  assert.equal(isWorkspaceData(missingDescription), false);
  missingDescription.invoices[0].lines[0].description = "Servicio profesional";
  missingDescription.invoices[0].lines[0].amount = 499;
  assert.equal(isWorkspaceData(missingDescription), false);
  missingDescription.invoices[0].lines = [];
  assert.equal(isWorkspaceData(missingDescription), false);
});

test("bank accounts can only be assigned to existing clients", () => {
  const data = createFixture();
  data.bankAccounts = [{ id: "bank-1", bankName: "Banco", accountHolder: "Enzo Thome", accountNumber: "001234", currency: "USD", instructions: "", clientIds: [data.clients[0].id] }];
  assert.equal(isWorkspaceData(data), true);
  data.bankAccounts[0].clientIds = [];
  assert.equal(isWorkspaceData(data), true);
  data.bankAccounts[0].clientIds = ["missing-client"];
  assert.equal(isWorkspaceData(data), false);
});

test("invoice states distinguish partial, settled and overdue balances", () => {
  const invoice = { ...createFixture().invoices[0], due: today(), paid: 100 };
  assert.equal(invoiceStatus(invoice), "Pago parcial");
  assert.equal(invoiceStatus({ ...invoice, paid: invoice.amount }), "Pagada");
  assert.equal(invoiceStatus({ ...invoice, due: "2020-01-01" }), "Vencida");
});

test("only web protocols can be opened as project links", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,test"), "");
  assert.equal(safeUrl("file:///C:/private"), "");
  assert.equal(safeUrl("https://example.com/project"), "https://example.com/project");
});

test("completed intake is accepted but malformed intake and dates are rejected", () => {
  const data = createFixture();
  data.projects[0].intake = { contact: "Demo", goal: "One view", success: "Visible progress", context: "", date: today() };
  assert.equal(isWorkspaceData(data), true);
  data.projects[0].intake.contact = 42;
  assert.equal(isWorkspaceData(data), false);
  delete data.projects[0].intake;
  data.invoices[0].date = "invalid";
  assert.equal(isWorkspaceData(data), false);
});

test("the private web checklist is validated per project", () => {
  const data = createFixture();
  data.projects[0].internalChecklist = ["custom-404", "analytics", "search-console", "llms-txt"];
  assert.equal(isWorkspaceData(JSON.parse(JSON.stringify(data))), true);
  data.projects[0].internalChecklist.push("unknown-check");
  assert.equal(isWorkspaceData(data), false);
});
