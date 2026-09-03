#!/usr/bin/env node
// Cross-checks core/registry/registry.yaml against what's actually on disk under providers/:
// every "implemented" entry (non-null path) must point to a real, loadable provider, and every
// discovered provider must be listed in the registry.
import path from "node:path";
import { loadRegistry, VALID_STATUSES } from "../core/registry/index.js";
import { discoverProviderDirs, loadProvider } from "../runtime/plugin-loader/index.js";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);

let failed = false;
const fail = (message) => {
  failed = true;
  console.error(`FAIL ${message}`);
};

const registry = loadRegistry();
const seenIds = new Set();

for (const entry of registry.providers) {
  if (seenIds.has(entry.id)) fail(`duplicate registry entry for "${entry.id}"`);
  seenIds.add(entry.id);

  if (!VALID_STATUSES.includes(entry.status)) {
    fail(`"${entry.id}" has invalid status "${entry.status}"`);
  }

  if (entry.status === "planned") {
    if (entry.path) fail(`"${entry.id}" is "planned" but declares a path (${entry.path}) - clear it or promote the status`);
    continue;
  }

  if (!entry.path) {
    fail(`"${entry.id}" has status "${entry.status}" but no path`);
    continue;
  }

  const absolutePath = path.join(REPO_ROOT, entry.path);
  try {
    const provider = loadProvider(absolutePath);
    if (provider.id !== entry.id) {
      fail(`registry entry "${entry.id}" points at ${entry.path}, whose manifest declares id "${provider.id}"`);
    }
    console.log(`OK   ${entry.id} -> ${entry.path}`);
  } catch (err) {
    fail(`"${entry.id}" (${entry.path}) failed to load: ${err.message}`);
  }
}

const discovered = discoverProviderDirs().map((dir) => loadProvider(dir).id);
for (const id of discovered) {
  if (!seenIds.has(id)) fail(`provider "${id}" exists on disk but is not listed in core/registry/registry.yaml`);
}

process.exit(failed ? 1 : 0);
