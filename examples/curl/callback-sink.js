#!/usr/bin/env node
// A tiny standalone HTTP server that prints every callback it receives. Point a payment's
// callbackUrl at it (http://localhost:4000/callback by default) to see Africa Local's callback
// delivery, including duplicate/dropped/replayed deliveries, in your terminal.
import http from "node:http";

const PORT = Number(process.env.PORT ?? 4000);

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    console.log(`[callback-sink] eventId=${req.headers["x-africa-local-event-id"]} attempt=${req.headers["x-africa-local-attempt"]}`);
    console.log(body);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  });
});

server.listen(PORT, () => {
  console.log(`callback-sink listening on http://localhost:${PORT}/callback`);
});
