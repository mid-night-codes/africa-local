#!/usr/bin/env node
// Validates every provider directory under providers/ using the same plugin-loader the runtime
// itself uses - so "passes this script" and "the runtime can actually load it" are the same fact.
import { discoverProviderDirs, loadProvider } from "../runtime/plugin-loader/index.js";
import path from "node:path";

const dirs = discoverProviderDirs();
if (dirs.length === 0) {
  console.error("No provider directories found under providers/ (excluding _template)");
  process.exit(1);
}

let failed = false;
for (const dir of dirs) {
  try {
    const provider = loadProvider(dir);
    console.log(`OK   ${path.relative(process.cwd(), dir)} (${provider.id})`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${path.relative(process.cwd(), dir)}: ${err.message}`);
  }
}

process.exit(failed ? 1 : 0);
