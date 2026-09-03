#!/usr/bin/env node
// Minimal, dependency-free repo lint: every root doc §41/§42 requires must exist, and no tracked
// text file contains an obvious hardcoded secret pattern. A real markdownlint/eslint pass is a
// deferred decision - see README.md#deferred-decisions - this exists so `make lint` has teeth from
// day one without pulling in a heavy toolchain.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_ROOT_DOCS = [
  "README.md", "ARCHITECTURE.md", "AGENTS.md", "CONTRIBUTING.md", "SECURITY.md",
  "GOVERNANCE.md", "MAINTAINERS.md", "SUPPORT.md", "ROADMAP.md", "VERSIONING.md",
  "CHANGELOG.md", "LICENSE",
];

const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build"]);
const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/, /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/];

let failed = false;

for (const doc of REQUIRED_ROOT_DOCS) {
  if (!existsSync(path.join(ROOT, doc))) {
    failed = true;
    console.error(`FAIL missing required root document: ${doc}`);
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(md|js|json|ya?ml|env)$/.test(entry.name)) continue;
    const content = readFileSync(full, "utf8");
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        failed = true;
        console.error(`FAIL possible secret matching ${pattern} in ${path.relative(ROOT, full)}`);
      }
    }
  }
}

walk(ROOT);

if (!failed) console.log("OK   required root docs present, no obvious secret patterns found");
process.exit(failed ? 1 : 0);
