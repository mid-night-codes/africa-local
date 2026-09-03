import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestApp } from "../helpers/test-server.js";
import { startCallbackSink, sleep } from "../helpers/callback-sink.js";

test("missing-callback: state settles but callback is never delivered, then can be forced via a manual scenario override + replay", async () => {
  const server = await startTestApp({ only: ["tz-mpesa"], timeScale: 0.02 });
  const sink = await startCallbackSink();
  try {
    const forceRes = await fetch(`${server.baseUrl}/_control/providers/tz-mpesa/scenario`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenario: "missing-callback" }),
    });
    assert.equal(forceRes.status, 200);

    const initRes = await fetch(`${server.baseUrl}/tz/mpesa/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "255799999999", amount: 1000, callbackUrl: sink.url }),
    });
    const initBody = await initRes.json();

    await sleep(200);
    assert.equal(sink.received.length, 0, "missing-callback must never deliver");

    const statusRes = await fetch(`${server.baseUrl}/tz/mpesa/payments/${initBody.transactionId}`);
    const statusBody = await statusRes.json();
    assert.equal(statusBody.status, "SUCCESS", "state must still settle even though the callback was dropped");

    const attempts = await (await fetch(`${server.baseUrl}/_control/callbacks`)).json();
    const dropped = attempts.find((a) => a.correlationId === initBody.transactionId);
    assert.ok(dropped, "the dropped attempt must be recorded in callback history");
    assert.equal(dropped.result, "dropped");

    const replayRes = await fetch(`${server.baseUrl}/_control/callbacks/${dropped.eventId}/replay`, { method: "POST" });
    assert.equal(replayRes.status, 200);
    await sleep(50);
    assert.equal(sink.received.length, 1, "replay should actually deliver the previously-dropped callback");
  } finally {
    await fetch(`${server.baseUrl}/_control/providers/tz-mpesa/scenario`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenario: null }),
    });
    await sink.close();
    await server.close();
  }
});
