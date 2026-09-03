import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, "africa-local.js");

test("--help exits 0 and lists commands", async () => {
  const { stdout } = await execFileAsync(process.execPath, [CLI, "--help"]);
  assert.match(stdout, /providers/);
  assert.match(stdout, /scenario/);
  assert.match(stdout, /health/);
});

test("health command reports a clear error when no runtime is listening", async () => {
  await assert.rejects(execFileAsync(process.execPath, [CLI, "health"], { env: { ...process.env, AFRICA_LOCAL_URL: "http://127.0.0.1:1" } }));
});
