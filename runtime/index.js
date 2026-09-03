import { createApp } from "./api/server.js";

const PORT = Number(process.env.PORT ?? 9000);
const only = process.env.ONLY_PROVIDERS ? process.env.ONLY_PROVIDERS.split(",").map((s) => s.trim()) : undefined;

const { app, providers, callbackEngine } = createApp({ only });

const server = app.listen(PORT, () => {
  console.log(`Africa Local runtime listening on http://localhost:${PORT}`);
  console.log(`Providers loaded: ${providers.map((p) => p.id).join(", ") || "(none)"}`);
});

function shutdown() {
  console.log("Shutting down Africa Local runtime...");
  callbackEngine.stopAll();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
