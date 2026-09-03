import { test } from "node:test";
import assert from "node:assert/strict";
import { loadProviders } from "../../runtime/plugin-loader/index.js";
import { startTestApp } from "../helpers/test-server.js";
import { startCallbackSink, sleep } from "../helpers/callback-sink.js";

const TIME_SCALE = 0.02; // shrinks a 30s callbackDelay to ~600ms for CI, see runtime/README.md
const providers = loadProviders();

for (const provider of providers) {
  const phoneScenarios = provider.scenarios.filter((s) => s.match.phone);

  for (const scenario of phoneScenarios) {
    test(`${provider.id}/${scenario.name}: synchronous response conforms to schema and settles correctly`, async () => {
      const server = await startTestApp({ only: [provider.id], timeScale: TIME_SCALE });
      const sink = await startCallbackSink();
      try {
        const initRes = await fetch(`${server.baseUrl}${provider.manifest.endpoints.basePath}/payments`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: scenario.match.phone, amount: 1000, callbackUrl: sink.url }),
        });
        const initBody = await initRes.json();
        assert.ok(provider.validators["initiate-response"](initBody), ajvErrors(provider.validators["initiate-response"]));
        assert.equal(initBody.status, scenario.behavior.initialStatus);
        if (scenario.behavior.httpStatus) assert.equal(initRes.status, scenario.behavior.httpStatus);

        const waitMs = durationToMs(scenario.behavior.callbackDelay) * TIME_SCALE + 400;
        await sleep(waitMs);

        const statusRes = await fetch(`${server.baseUrl}${provider.manifest.endpoints.basePath}/payments/${initBody.transactionId}`);
        const statusBody = await statusRes.json();
        assert.ok(provider.validators["status-response"](statusBody), ajvErrors(provider.validators["status-response"]));
        assert.equal(statusBody.status, scenario.behavior.finalStatus);

        if (provider.manifest.capabilities.callbacks && !scenario.behavior.dropCallback && scenario.behavior.initialStatus !== scenario.behavior.finalStatus) {
          assert.ok(sink.received.length >= 1, "expected at least one callback to be delivered");
          for (const delivery of sink.received) {
            assert.ok(provider.validators.callback(delivery.body), ajvErrors(provider.validators.callback));
            assert.equal(delivery.body.status, scenario.behavior.finalStatus);
          }
        }

        if (scenario.behavior.dropCallback) {
          assert.equal(sink.received.length, 0, "dropCallback scenario must never actually deliver");
        }

        if (scenario.behavior.duplicateCallback) {
          assert.ok(sink.received.length >= 2, "duplicateCallback scenario must deliver more than once");
          const eventIds = new Set(sink.received.map((d) => d.eventId));
          assert.equal(eventIds.size, 1, "duplicate deliveries must share the same eventId (determinism)");
        }
      } finally {
        await sink.close();
        await server.close();
      }
    });
  }
}

test("an invalid request (missing required field) is rejected with 400", async () => {
  const provider = providers[0];
  const server = await startTestApp({ only: [provider.id] });
  try {
    const res = await fetch(`${server.baseUrl}${provider.manifest.endpoints.basePath}/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 1000 }), // missing "phone"
    });
    assert.equal(res.status, 400);
  } finally {
    await server.close();
  }
});

function durationToMs(value) {
  if (!value) return 0;
  const match = /^(\d+)(ms|s|m)$/.exec(value);
  const n = Number(match[1]);
  if (match[2] === "ms") return n;
  if (match[2] === "s") return n * 1000;
  return n * 60 * 1000;
}

function ajvErrors(validateFn) {
  return JSON.stringify(validateFn.errors);
}
