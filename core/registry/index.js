import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REGISTRY_PATH = path.resolve(__dirname, "registry.yaml");

export function loadRegistry(registryPath = REGISTRY_PATH) {
  const raw = readFileSync(registryPath, "utf8");
  const doc = yaml.load(raw);
  if (!doc || !Array.isArray(doc.providers)) {
    throw new Error(`Invalid registry at ${registryPath}: expected a top-level "providers" array`);
  }
  return doc;
}

export function findEntry(registry, providerId) {
  return registry.providers.find((p) => p.id === providerId) ?? null;
}

export const VALID_STATUSES = ["planned", "experimental", "beta", "stable", "deprecated"];
