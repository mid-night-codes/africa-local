import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestApp } from "../helpers/test-server.js";

test("GET /_control/health reports ok and lists loaded providers", async () => {
  const server = await startTestApp();
  try {
    const res = await fetch(`${server.baseUrl}/_control/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, "ok");
    assert.ok(body.providers.includes("tz-mpesa"));
    assert.ok(body.providers.includes("tz-airtel-money"));
  } finally {
    await server.close();
  }
});

test("GET /_control/providers lists manifests with basePath and capabilities", async () => {
  const server = await startTestApp();
  try {
    const body = await (await fetch(`${server.baseUrl}/_control/providers`)).json();
    const mpesa = body.find((p) => p.id === "tz-mpesa");
    assert.ok(mpesa);
    assert.equal(mpesa.basePath, "/tz/mpesa");
    assert.equal(mpesa.capabilities.callbacks, true);
  } finally {
    await server.close();
  }
});

test("GET /_control/requests records prior traffic", async () => {
  const server = await startTestApp({ only: ["tz-mpesa"] });
  try {
    await fetch(`${server.baseUrl}/tz/mpesa/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "255700000001", amount: 500 }),
    });
    const history = await (await fetch(`${server.baseUrl}/_control/requests`)).json();
    assert.ok(history.length >= 1);
    assert.equal(history[0].providerId, "tz-mpesa");
    assert.equal(history[0].method, "POST");
  } finally {
    await server.close();
  }
});

test("unknown provider path returns 404", async () => {
  const server = await startTestApp();
  try {
    const res = await fetch(`${server.baseUrl}/xx/does-not-exist/payments`, { method: "POST" });
    assert.equal(res.status, 404);
  } finally {
    await server.close();
  }
});
