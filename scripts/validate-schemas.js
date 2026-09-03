#!/usr/bin/env node
// Validates every specs/*.schema.json file is a well-formed JSON Schema (draft 2020-12) and that
// any $ref between them (e.g. provider-manifest.schema.json -> capability.schema.json) resolves.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = path.resolve(__dirname, "../specs");

function findSchemas(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findSchemas(full));
    else if (entry.name.endsWith(".schema.json")) found.push(full);
  }
  return found;
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const files = findSchemas(SPECS_DIR);
if (files.length === 0) {
  console.error("No *.schema.json files found under specs/");
  process.exit(1);
}

const schemas = files.map((file) => ({ file, key: path.basename(file), schema: JSON.parse(readFileSync(file, "utf8")) }));
for (const { key, schema } of schemas) {
  ajv.addSchema(schema, key);
}

let failed = false;
for (const { file, key } of schemas) {
  try {
    const validate = ajv.getSchema(key);
    if (!validate) throw new Error("schema not registered");
    validate({}); // forces $ref resolution/compilation; throws if a referenced schema is missing
    console.log(`OK   ${path.relative(process.cwd(), file)}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${path.relative(process.cwd(), file)}: ${err.message}`);
  }
}

process.exit(failed ? 1 : 0);
