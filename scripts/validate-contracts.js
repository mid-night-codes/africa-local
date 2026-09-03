#!/usr/bin/env node
// Checks that everything under contracts/ at least parses and has the fields a contract file
// must have. This is intentionally not a full OpenAPI/AsyncAPI validator (that's a good candidate
// for a real dependency later, see ROADMAP.md) - it exists to catch YAML syntax errors and missing
// top-level fields in CI before they reach a reviewer.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACTS_DIR = path.resolve(__dirname, "../contracts");

function findYamlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findYamlFiles(full));
    else if (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")) found.push(full);
  }
  return found;
}

let failed = false;
for (const file of findYamlFiles(CONTRACTS_DIR)) {
  try {
    const doc = yaml.load(readFileSync(file, "utf8"));
    if (!doc || typeof doc !== "object") throw new Error("empty or non-object document");
    if (file.includes(`${path.sep}openapi${path.sep}`) && !doc.openapi) {
      throw new Error('missing required top-level "openapi" field');
    }
    if (file.includes(`${path.sep}asyncapi${path.sep}`) && !doc.asyncapi) {
      throw new Error('missing required top-level "asyncapi" field');
    }
    console.log(`OK   ${path.relative(process.cwd(), file)}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${path.relative(process.cwd(), file)}: ${err.message}`);
  }
}

process.exit(failed ? 1 : 0);
