import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { CallbackEngine } from "./index.js";

function startSink() {
  const received = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push({ headers: req.headers, body: JSON.parse(body || "{}") });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, received, url: `http://127.0.0.1:${port}/callback` });
    });
  });
}

test("delivers a single immediate callback and records it", async () => {
  const { server, received, url } = await startSink();
  const attempts = [];
  const engine = new CallbackEngine({ onAttempt: (a) => attempts.push(a) });

  engine.schedule({
    providerId: "tz-mpesa",
    correlationId: "pay-1",
    requestId: "req-1",
    callbackUrl: url,
    behavior: {},
    data: { status: "SUCCESS" },
    buildPayload: (event) => ({ transactionId: event.correlationId, status: event.data.status }),
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  server.close();

  assert.equal(received.length, 1);
  assert.equal(received[0].body.status, "SUCCESS");
  assert.ok(received[0].headers["x-africa-local-signature"]);
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].result, "delivered");
});

test("dropCallback records an attempt but never sends it", async () => {
  const { server, received, url } = await startSink();
  const attempts = [];
  const engine = new CallbackEngine({ onAttempt: (a) => attempts.push(a) });

  engine.schedule({
    providerId: "tz-mpesa",
    correlationId: "pay-2",
    requestId: "req-2",
    callbackUrl: url,
    behavior: { dropCallback: true },
    data: { status: "SUCCESS" },
    buildPayload: (event) => ({ transactionId: event.correlationId, status: event.data.status }),
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  server.close();

  assert.equal(received.length, 0);
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].result, "dropped");
});

test("duplicateCallback delivers the same eventId twice", async () => {
  const { server, received, url } = await startSink();
  const attempts = [];
  const engine = new CallbackEngine({ onAttempt: (a) => attempts.push(a) });

  engine.schedule({
    providerId: "tz-mpesa",
    correlationId: "pay-3",
    requestId: "req-3",
    callbackUrl: url,
    behavior: { duplicateCallback: true, callbackCount: 2 },
    data: { status: "SUCCESS" },
    buildPayload: (event) => ({ transactionId: event.correlationId, status: event.data.status }),
  });

  await new Promise((resolve) => setTimeout(resolve, 200));
  server.close();

  assert.equal(received.length, 2);
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].eventId, attempts[1].eventId);
});

test("replay resends a recorded payload verbatim with an incremented attempt", async () => {
  const { server, received, url } = await startSink();
  const attempts = [];
  const engine = new CallbackEngine({ onAttempt: (a) => attempts.push(a) });

  const record = await engine.replay({
    eventId: "evt-fixed",
    providerId: "tz-mpesa",
    correlationId: "pay-4",
    requestId: "req-4",
    attempt: 1,
    targetUrl: url,
    payload: { transactionId: "pay-4", status: "SUCCESS" },
    data: { status: "SUCCESS" },
  });

  await new Promise((resolve) => setTimeout(resolve, 50));
  server.close();

  assert.equal(received.length, 1);
  assert.equal(record.attempt, 2);
  assert.equal(record.eventId, "evt-fixed");
});
