import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuote, sharedSubscriptionShare } from "../src/components/workspace/budget-pricing.ts";

test("a project can combine services and apply the contact objective explicitly", () => {
  const lines = [{ amount: 1000, hours: null }, { amount: 420, hours: 10 }];
  const sales = calculateQuote(lines, 1, 0);
  const contacts = calculateQuote(lines, 1, -20);
  assert.equal(sales.base, 1420);
  assert.equal(sales.recommended, 1704);
  assert.equal(contacts.essential, 1136);
  assert.equal(contacts.recommended, 1363);
  assert.equal(contacts.hours, null);
});

test("an unpriced component blocks a misleading total", () => {
  const quote = calculateQuote([{ amount: 1000, hours: 20 }, { amount: null, hours: null }], 1, 0);
  assert.equal(quote.recommended, null);
  assert.equal(quote.hours, null);
});

test("the reserve is visible in the final reference before applying the goal adjustment", () => {
  const quote = calculateQuote([{ amount: 1000, hours: 5 }], 1, -20, 1.1);
  assert.equal(quote.essential, 880);
  assert.equal(quote.recommended, 1056);
});

test("monthly tools are shared only when a project count is supplied", () => {
  assert.equal(sharedSubscriptionShare(120, 0), null);
  assert.equal(sharedSubscriptionShare(120, 3), 40);
});
