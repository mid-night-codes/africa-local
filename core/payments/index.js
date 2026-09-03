import { randomUUID } from "node:crypto";
import { INITIAL_STATE, applyTransition } from "../events/payment-state-machine.js";

/**
 * In-memory canonical payment store, keyed by payment id. Intentionally not persisted -
 * v0.1 is a local, ephemeral emulator (see ARCHITECTURE.md#request-history).
 */
export class PaymentStore {
  #payments = new Map();

  create({ providerId, phone, amount, scenarioName }) {
    const id = randomUUID();
    const payment = {
      id,
      providerId,
      phone,
      amount,
      scenarioName: scenarioName ?? null,
      status: INITIAL_STATE,
      reason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.#payments.set(id, payment);
    return payment;
  }

  get(id) {
    return this.#payments.get(id) ?? null;
  }

  transition(id, toStatus, reason) {
    const payment = this.#payments.get(id);
    if (!payment) throw new Error(`Unknown payment: ${id}`);
    payment.status = applyTransition(payment.status, toStatus);
    payment.reason = reason ?? payment.reason;
    payment.updatedAt = new Date().toISOString();
    return payment;
  }

  list() {
    return [...this.#payments.values()];
  }
}
