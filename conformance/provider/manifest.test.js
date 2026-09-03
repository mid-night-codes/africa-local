import { test } from "node:test";
import assert from "node:assert/strict";
import { discoverProviderDirs, loadProvider } from "../../runtime/plugin-loader/index.js";
import { loadRegistry, findEntry } from "../../core/registry/index.js";
import { VALID_STATUSES } from "../../core/registry/index.js";

const CANONICAL_STATUSES = [
  "CREATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED",
  "REVERSAL_PENDING", "REVERSED", "REFUND_PENDING", "REFUNDED",
];
const REQUIRED_SCHEMAS = ["initiate-request", "initiate-response", "status-response", "callback"];

const dirs = discoverProviderDirs();

test("at least one provider directory exists", () => {
  assert.ok(dirs.length > 0, "expected providers/ to contain at least one provider directory");
});

for (const dir of dirs) {
  test(`${dir}: manifest is valid and self-consistent`, () => {
    const provider = loadProvider(dir);
    assert.ok(provider.manifest.id);
  });

  test(`${dir}: all required schemas exist and compile`, () => {
    const provider = loadProvider(dir);
    for (const name of REQUIRED_SCHEMAS) {
      assert.ok(provider.requestSchemas[name], `missing schemas/${name}.json`);
      assert.equal(typeof provider.validators[name], "function", `schemas/${name}.json did not compile`);
    }
  });

  test(`${dir}: declared scenarios all exist`, () => {
    const provider = loadProvider(dir);
    for (const declared of provider.manifest.scenarios) {
      assert.ok(provider.scenarios.some((s) => s.name === declared), `scenario "${declared}" not found`);
    }
  });

  test(`${dir}: declared capabilities are internally consistent`, () => {
    const provider = loadProvider(dir);
    const caps = provider.manifest.capabilities;
    if (!caps.paymentInitiation) {
      assert.fail("every mobile-money provider must support paymentInitiation in v0.1");
    }
  });

  test(`${dir}: mappings/statuses.yaml covers every canonical status`, () => {
    const provider = loadProvider(dir);
    for (const status of CANONICAL_STATUSES) {
      assert.ok(provider.mappings.statuses[status], `mappings/statuses.yaml is missing an entry for ${status}`);
    }
  });

  test(`${dir}: mappings/errors.yaml covers every reason referenced by a scenario`, () => {
    const provider = loadProvider(dir);
    const reasons = provider.scenarios.map((s) => s.behavior.reason).filter(Boolean);
    for (const reason of reasons) {
      assert.ok(provider.mappings.errors[reason], `mappings/errors.yaml is missing an entry for reason "${reason}"`);
    }
  });

  test(`${dir}: is registered in core/registry/registry.yaml with a matching status`, () => {
    const provider = loadProvider(dir);
    const registry = loadRegistry();
    const entry = findEntry(registry, provider.id);
    assert.ok(entry, `${provider.id} is not listed in core/registry/registry.yaml`);
    assert.equal(entry.country, provider.manifest.country);
    assert.ok(VALID_STATUSES.includes(entry.status));
  });
}
