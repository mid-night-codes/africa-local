import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRegistry, findEntry, VALID_STATUSES } from "./index.js";

test("loads the registry and finds known entries", () => {
  const registry = loadRegistry();
  const entry = findEntry(registry, "tz-mpesa");
  assert.ok(entry);
  assert.equal(entry.country, "TZ");
  assert.ok(VALID_STATUSES.includes(entry.status));
});

test("returns null for unknown provider ids", () => {
  const registry = loadRegistry();
  assert.equal(findEntry(registry, "does-not-exist"), null);
});
