import { randomUUID } from "node:crypto";

export * from "./payment-state-machine.js";

/**
 * Builds a canonical event envelope (specs/event-envelope.schema.json).
 * @param {object} params
 * @param {string} [params.eventId] - reuse an existing id to model a redelivered/duplicate event.
 * @param {"payment.callback"|"payment.status_changed"} params.type
 * @param {string} params.providerId
 * @param {string} params.correlationId
 * @param {string} [params.requestId]
 * @param {number} [params.attempt]
 * @param {{status: string, reason?: string, [key: string]: unknown}} params.data
 */
export function createEvent({ eventId, type, providerId, correlationId, requestId, attempt = 1, data }) {
  return {
    eventId: eventId ?? randomUUID(),
    type,
    occurredAt: new Date().toISOString(),
    providerId,
    correlationId,
    requestId,
    attempt,
    data,
  };
}
