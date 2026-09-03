const MAX_ENTRIES = 500;
const REDACTED = "[redacted]";
const SENSITIVE_HEADERS = new Set(["authorization", "cookie", "x-api-key"]);

function redactHeaders(headers = {}) {
  const out = {};
  for (const [key, value] of Object.entries(headers)) {
    out[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? REDACTED : value;
  }
  return out;
}

/** Bounded in-memory request history (§17). Never persisted, never stores secrets. */
export class RequestHistoryStore {
  #entries = [];

  record({ id, providerId, method, path, headers, requestPayload, responsePayload, responseCode, scenarioName, timestamp, durationMs }) {
    const entry = {
      id,
      providerId,
      method,
      path,
      requestHeaders: redactHeaders(headers),
      requestPayload,
      responsePayload,
      responseCode,
      scenario: scenarioName,
      timestamp,
      durationMs,
    };
    this.#entries.push(entry);
    if (this.#entries.length > MAX_ENTRIES) this.#entries.shift();
    return entry;
  }

  get(id) {
    return this.#entries.find((e) => e.id === id) ?? null;
  }

  list() {
    return [...this.#entries].reverse();
  }
}

/** Bounded in-memory callback delivery history (§16). */
export class CallbackHistoryStore {
  #attempts = [];

  record(attempt) {
    this.#attempts.push(attempt);
    if (this.#attempts.length > MAX_ENTRIES) this.#attempts.shift();
    return attempt;
  }

  list() {
    return [...this.#attempts].reverse();
  }

  /** Latest attempt for a given eventId, used to build a replay request. */
  latestForEvent(eventId) {
    for (let i = this.#attempts.length - 1; i >= 0; i--) {
      if (this.#attempts[i].eventId === eventId) return this.#attempts[i];
    }
    return null;
  }
}
