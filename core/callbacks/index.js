import { createHmac, randomUUID } from "node:crypto";
import { createEvent } from "../events/index.js";
import { parseDuration } from "../scenarios/index.js";
import { isAllowedCallbackUrl } from "./policy.js";

const DEV_SIGNING_SECRET = "africa-local-dev-secret-not-for-production";

/**
 * Schedules and delivers callbacks according to a scenario's behavior block, and records every
 * attempt (§16). Delivery itself is decoupled from any HTTP framework - the runtime wires this to
 * request-history and to global fetch.
 */
export class CallbackEngine {
  #onAttempt;
  #timers = new Set();

  /** @param {{onAttempt: (attempt: object) => void}} deps */
  constructor({ onAttempt }) {
    this.#onAttempt = onAttempt;
  }

  /**
   * @param {object} params
   * @param {string} params.providerId
   * @param {string} params.correlationId
   * @param {string} params.requestId
   * @param {string} params.callbackUrl
   * @param {object} params.behavior - scenario.behavior
   * @param {{status: string, reason?: string}} params.data - canonical event data
   * @param {(event: object) => object} params.buildPayload - maps the canonical event to the provider's callback shape
   */
  schedule({ providerId, correlationId, requestId, callbackUrl, behavior, data, buildPayload }) {
    if (!callbackUrl) return;

    const count = behavior.callbackCount ?? 1;
    if (count === 0) return;

    const delayMs = parseDuration(behavior.callbackDelay);
    const baseEvent = createEvent({ type: "payment.callback", providerId, correlationId, requestId, data });
    const attemptOrder = behavior.outOfOrderDelivery && count > 1
      ? [...Array(count).keys()].reverse()
      : [...Array(count).keys()];

    for (const i of attemptOrder) {
      const attemptNumber = i + 1;
      const perAttemptDelay = delayMs + i * 50; // keep ordering observable even with 0 base delay
      const timer = setTimeout(() => {
        this.#timers.delete(timer);
        const event = behavior.duplicateCallback
          ? { ...baseEvent, attempt: attemptNumber }
          : { ...createEvent({ type: "payment.callback", providerId, correlationId, requestId, data }), attempt: attemptNumber };
        const payload = { ...buildPayload(event), ...(behavior.callbackPayloadOverride ?? {}) };
        this.#send({ callbackUrl, event, payload, dropped: !!behavior.dropCallback, invalidSignature: !!behavior.invalidSignature });
      }, perAttemptDelay);
      this.#timers.add(timer);
    }
  }

  /** Re-sends a previously recorded callback payload verbatim. Used by POST /_control/callbacks/{id}/replay. */
  replay(record) {
    const event = createEvent({
      eventId: record.eventId,
      type: "payment.callback",
      providerId: record.providerId,
      correlationId: record.correlationId,
      requestId: record.requestId,
      attempt: (record.attempt ?? 1) + 1,
      data: record.data,
    });
    return this.#send({ callbackUrl: record.targetUrl, event, payload: record.payload, dropped: false, invalidSignature: false, replay: true });
  }

  async #send({ callbackUrl, event, payload, dropped, invalidSignature, replay = false }) {
    const check = isAllowedCallbackUrl(callbackUrl);
    if (!check.allowed) {
      return this.#record({ event, callbackUrl, payload, result: "blocked", note: check.reason, replay });
    }

    if (dropped) {
      return this.#record({ event, callbackUrl, payload, result: "dropped", note: "scenario.behavior.dropCallback=true", replay });
    }

    const signature = invalidSignature ? "invalid-signature" : sign(payload);
    const startedAt = Date.now();

    try {
      const response = await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-africa-local-signature": signature,
          "x-africa-local-event-id": event.eventId,
          "x-africa-local-attempt": String(event.attempt),
        },
        body: JSON.stringify(payload),
      });
      return this.#record({
        event,
        callbackUrl,
        payload,
        responseCode: response.status,
        latencyMs: Date.now() - startedAt,
        result: response.ok ? "delivered" : "rejected",
        replay,
      });
    } catch (err) {
      return this.#record({
        event,
        callbackUrl,
        payload,
        latencyMs: Date.now() - startedAt,
        result: "failed",
        note: err.message,
        replay,
      });
    }
  }

  #record({ event, callbackUrl, payload, replay, ...rest }) {
    const record = {
      timestamp: new Date().toISOString(),
      eventId: event.eventId,
      providerId: event.providerId,
      correlationId: event.correlationId,
      requestId: event.requestId,
      targetUrl: callbackUrl,
      attempt: event.attempt,
      data: event.data,
      payload,
      replay,
      ...rest,
    };
    this.#onAttempt(record);
    return record;
  }

  /** Cancels any pending scheduled callbacks. Used by tests and graceful shutdown. */
  stopAll() {
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers.clear();
  }
}

function sign(payload) {
  return createHmac("sha256", DEV_SIGNING_SECRET).update(JSON.stringify(payload)).digest("hex");
}
