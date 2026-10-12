import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspaceSeed, isWorkspaceData, invoiceStatus, safeUrl, today } from "../src/components/workspace/model.ts";

function createFixture() {
  const data = createWorkspaceSeed();
  data.invoices.push({ id: "invoice-test", projectId: data.projects[0].id, title: "Factura TEST-001", number: "TEST-001", amount: 500, currency: "USD", due: today(), paid: 0, paymentInfo: "", date: today(), lines: [{ id: "line-1", description: "Servicio profesional", amount: 500 }], fileId: "", fileName: "" });
  return data;
}

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
