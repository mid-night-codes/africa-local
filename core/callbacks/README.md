# Callback Engine

Implements §16 of the product spec: callbacks are first-class, not an afterthought bolted onto
payment initiation.

- **Scheduling** (`schedule()`) reads `scenario.behavior` and turns it into zero or more delayed
  `fetch` calls: `callbackDelay`, `callbackCount`, `dropCallback`, `duplicateCallback`,
  `invalidSignature` and `outOfOrderDelivery` are all handled here, generically, for every
  provider - a provider never implements its own delay/retry logic.
- **Delivery** signs the payload with an HMAC (`x-africa-local-signature`) and always attaches
  `x-africa-local-event-id` / `x-africa-local-attempt` headers so consumers can deduplicate.
- **Recording** every attempt (delivered, rejected, failed, dropped, blocked) is pushed through the
  `onAttempt` callback into `runtime/request-history`, satisfying §16's audit trail.
- **Replay** (`replay()`) re-sends a previously recorded payload verbatim via
  `POST /_control/callbacks/{eventId}/replay`.
- **Destination policy** (`policy.js`) is the SSRF guardrail called out in `SECURITY.md`: only
  `http`/`https` are deliverable, and an operator denylist
  (`AFRICA_LOCAL_CALLBACK_DENYLIST`) is always honored. Loopback/private addresses are allowed by
  default because the entire point of this engine is delivering to the developer's own machine.
