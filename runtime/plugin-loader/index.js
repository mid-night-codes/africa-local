import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
export const PROVIDERS_DIR = path.join(REPO_ROOT, "providers");
const SPECS_DIR = path.join(REPO_ROOT, "specs");

function buildAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const capability = JSON.parse(readFileSync(path.join(SPECS_DIR, "capability.schema.json"), "utf8"));
  const manifest = JSON.parse(readFileSync(path.join(SPECS_DIR, "provider-manifest.schema.json"), "utf8"));
  const scenario = JSON.parse(readFileSync(path.join(SPECS_DIR, "scenario.schema.json"), "utf8"));
  ajv.addSchema(capability, "capability.schema.json");
  ajv.addSchema(manifest, "provider-manifest.schema.json");
  ajv.addSchema(scenario, "scenario.schema.json");
  return ajv;
}

/**
 * Finds every provider.yaml under providers/ (excluding _template), regardless of how many
 * country-folder levels of nesting exist above it (providers/tanzania/mpesa/provider.yaml).
 */
export function discoverProviderDirs(root = PROVIDERS_DIR) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === "_template") continue;
      const full = path.join(dir, entry);
      if (!statSync(full).isDirectory()) continue;
      if (existsSync(path.join(full, "provider.yaml"))) {
        found.push(full);
      } else {
        walk(full);
      }
    }
  };
  walk(root);
  return found;
}

function loadYaml(filePath) {
  return yaml.load(readFileSync(filePath, "utf8"));
}

function loadOptionalYaml(filePath) {
  return existsSync(filePath) ? loadYaml(filePath) : {};
}

function validateAgainst(ajv, schemaId, data, context) {
  const validate = ajv.getSchema(schemaId);
  if (!validate(data)) {
    const message = ajv.errorsText(validate.errors, { separator: "; " });
    throw new Error(`${context} failed validation against ${schemaId}: ${message}`);
  }
}

/**
 * Loads and validates one provider directory into a fully-resolved descriptor. Throws with a
 * descriptive message on any spec violation - this is the single reusable entry point used by
 * both the runtime (to serve traffic) and conformance/scripts (to validate providers in CI).
 */
export function loadProvider(dir, { ajv = buildAjv() } = {}) {
  const manifestPath = path.join(dir, "provider.yaml");
  const manifest = loadYaml(manifestPath);
  validateAgainst(ajv, "provider-manifest.schema.json", manifest, `${manifestPath}`);

  const schemasDir = path.join(dir, "schemas");
  const schemaFiles = existsSync(schemasDir) ? readdirSync(schemasDir).filter((f) => f.endsWith(".json")) : [];
  const requestSchemas = {};
  for (const file of schemaFiles) {
    const name = file.replace(/\.json$/, "");
    const schema = JSON.parse(readFileSync(path.join(schemasDir, file), "utf8"));
    requestSchemas[name] = schema;
  }

  for (const required of ["initiate-request", "initiate-response", "status-response", "callback"]) {
    if (!requestSchemas[required]) {
      throw new Error(`${dir}: missing required schema schemas/${required}.json`);
    }
  }

  const schemaAjv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(schemaAjv);
  const validators = {};
  for (const [name, schema] of Object.entries(requestSchemas)) {
    validators[name] = schemaAjv.compile(schema);
  }

  const mappings = {
    statuses: loadOptionalYaml(path.join(dir, "mappings", "statuses.yaml")),
    errors: loadOptionalYaml(path.join(dir, "mappings", "errors.yaml")),
  };

  const scenariosDir = path.join(dir, "scenarios");
  const scenarioFiles = existsSync(scenariosDir) ? readdirSync(scenariosDir).filter((f) => f.endsWith(".yaml")) : [];
  const scenarios = scenarioFiles.map((file) => {
    const scenario = loadYaml(path.join(scenariosDir, file));
    validateAgainst(ajv, "scenario.schema.json", scenario, `${dir}/scenarios/${file}`);
    const expectedName = file.replace(/\.yaml$/, "");
    if (scenario.name !== expectedName) {
      throw new Error(`${dir}/scenarios/${file}: scenario name "${scenario.name}" must match filename "${expectedName}"`);
    }
    return scenario;
  });

  for (const declared of manifest.scenarios) {
    if (!scenarios.some((s) => s.name === declared)) {
      throw new Error(`${dir}: manifest declares scenario "${declared}" but scenarios/${declared}.yaml does not exist`);
    }
  }

  return {
    id: manifest.id,
    dir,
    manifest,
    requestSchemas,
    validators,
    mappings,
    scenarios,
  };
}

/**
 * @param {{only?: string[]}} [options] - restrict to specific provider ids (used by
 *   `africa-local start <provider-id>` via ONLY_PROVIDERS).
 */
export function loadProviders({ only } = {}) {
  const ajv = buildAjv();
  const dirs = discoverProviderDirs();
  const providers = dirs.map((dir) => loadProvider(dir, { ajv }));

  const ids = new Set(providers.map((p) => p.id));
  if (ids.size !== providers.length) {
    throw new Error("Duplicate provider id detected across providers/ - ids must be globally unique");
  }

  if (only && only.length > 0) {
    return providers.filter((p) => only.includes(p.id));
  }
  return providers;
}
