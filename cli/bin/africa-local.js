#!/usr/bin/env node
import { Command } from "commander";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_ENTRY = path.resolve(__dirname, "../../runtime/index.js");
const BASE_URL = process.env.AFRICA_LOCAL_URL ?? "http://localhost:9000";

const program = new Command();
program.name("africa-local").description("Local emulator platform for African digital services");

program
  .command("start [providerId]")
  .description("Start the runtime. With a provider id, only that provider is loaded (§19: still one process, one port).")
  .action((providerId) => {
    const env = { ...process.env };
    if (providerId) env.ONLY_PROVIDERS = providerId;
    const child = spawn(process.execPath, [RUNTIME_ENTRY], { stdio: "inherit", env });
    child.on("exit", (code) => process.exit(code ?? 0));
  });

program
  .command("providers [subcommand]")
  .description("List every provider the running runtime has loaded (`providers` and `providers list` are equivalent)")
  .action(async (subcommand) => {
    if (subcommand && subcommand !== "list") {
      console.error(`Unknown "providers ${subcommand}" - did you mean "providers list"?`);
      process.exitCode = 1;
      return;
    }
    printJson(await getJson("/_control/providers"));
  });

program
  .command("health")
  .description("Check the runtime's health endpoint")
  .action(async () => {
    printJson(await getJson("/_control/health"));
  });

program
  .command("requests")
  .description("Show recent request history")
  .action(async () => {
    printJson(await getJson("/_control/requests"));
  });

program
  .command("scenario <providerId> <scenarioName>")
  .description("Force a provider to use a specific scenario for its next request(s), regardless of phone number")
  .action(async (providerId, scenarioName) => {
    printJson(await postJson(`/_control/providers/${providerId}/scenario`, { scenario: scenarioName }));
  });

program.parseAsync(process.argv);

async function getJson(pathName) {
  const res = await fetch(`${BASE_URL}${pathName}`);
  return res.json();
}

async function postJson(pathName, body) {
  const res = await fetch(`${BASE_URL}${pathName}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}
