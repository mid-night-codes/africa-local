import { test } from "node:test";
import assert from "node:assert/strict";
import { matchScenario, parseDuration } from "./index.js";

const scenarios = [
  { name: "success", match: { phone: "255700000001" }, behavior: { initialStatus: "PENDING", finalStatus: "SUCCESS" } },
  { name: "insufficient-funds", match: { phone: "255700000002" }, behavior: { initialStatus: "PENDING", finalStatus: "FAILED", reason: "INSUFFICIENT_FUNDS" } },
];

test("matches by exact phone", () => {
  const s = matchScenario(scenarios, { phone: "255700000002", amount: 100 });
  assert.equal(s.name, "insufficient-funds");
});

test("returns null when nothing matches", () => {
  const s = matchScenario(scenarios, { phone: "255799999999", amount: 100 });
  assert.equal(s, null);
});

test("forced scenario takes priority over phone match", () => {
  const s = matchScenario(scenarios, { phone: "255700000001", amount: 100 }, "insufficient-funds");
  assert.equal(s.name, "insufficient-funds");
});

test("parseDuration handles ms/s/m", () => {
  assert.equal(parseDuration("500ms"), 500);
  assert.equal(parseDuration("30s"), 30000);
  assert.equal(parseDuration("2m"), 120000);
  assert.equal(parseDuration(undefined), 0);
});

test("parseDuration rejects malformed input", () => {
  assert.throws(() => parseDuration("30"), /Invalid duration/);
});
