# Service Contract

This document defines the vocabulary and contracts that every Africa Local provider, service and
runtime component is built against. It is the spec-level layer described in
[ARCHITECTURE.md](../ARCHITECTURE.md): language-neutral, versioned independently of any
implementation.

## Canonical concepts

The runtime reasons about these concepts regardless of provider:

| Concept | Meaning |
|---|---|
| Provider | A single emulated service, identified by a manifest (`specs/provider-manifest.schema.json`). |
| Capability | A named feature a provider declares support for (`specs/capability.schema.json`). |
| Request | An inbound call to a provider endpoint. |
| Response | The synchronous reply to a request. |
| Payment / Transaction | The canonical unit of work created by a payment-initiation request. |
| Scenario | A named, declarative behavior a request can be routed into (`specs/scenario.schema.json`). |
| Callback | An asynchronous, provider-initiated HTTP delivery describing a state change. |
| Event | The canonical envelope wrapping a callback or internal state change (`specs/event-envelope.schema.json`). |
| Delay | Artificial latency applied to a response or callback. |
| Failure / Timeout / Duplicate | Scenario behaviors that simulate real-world provider unreliability. |
| Reversal / Refund | Post-completion state transitions, modeled in the state machine, optional to implement end-to-end in v0.1. |
| Status | The canonical payment status, see `state-machines/payment-lifecycle.md`. |
| Correlation ID | Id of the canonical payment a request/event/callback relates to. |
| Request ID | Id of a single HTTP request/response pair, used for request history lookups. |

## Provider maturity

| Status | Meaning |
|---|---|
| `planned` | Listed in the registry, no implementation yet. |
| `experimental` | Implemented, may not match every real-world edge case, breaking changes possible without notice. |
| `beta` | Implemented and conformance-tested, minor breaking changes possible with a changelog entry. |
| `stable` | Conformance-tested, followed [VERSIONING.md](../VERSIONING.md) breaking-change rules. |
| `deprecated` | Scheduled for removal, kept for compatibility only. |

## Provider mapping layer

Every provider plugin is responsible for mapping in both directions:

```text
provider request  -> canonical request  -> scenario behavior -> canonical result -> provider response
```

- **provider request -> canonical request**: v0.1 keeps this mapping intentionally thin. Provider
  request schemas are expected to expose a `phone` (MSISDN) and `amount` field directly, since
  every initial provider is mobile-money. This is a deliberate, documented approximation (see
  `providers/*/provider.yaml#approximations`) rather than a generic field-mapping DSL, which would
  be premature for two providers.
- **canonical result -> provider response**: driven by `mappings/statuses.yaml` and
  `mappings/errors.yaml` inside each provider directory, which translate canonical statuses and
  reason codes into that provider's response codes/messages.

## Deterministic test identities

Providers should express deterministic behavior through `match.phone` in scenario files rather
than hardcoding phone numbers in runtime or provider code. The convention is the country's real
MSISDN prefix followed by the same `700000001`-`700000007` suffix block, so the *last digit*
carries the meaning consistently across every country's providers:

| Suffix | Scenario | TZ (255) | KE (254) |
|---|---|---|---|
| `700000001` | success | 255700000001 | 254700000001 |
| `700000002` | insufficient-funds | 255700000002 | 254700000002 |
| `700000003` | user-cancelled | 255700000003 | 254700000003 |
| `700000004` | timeout | 255700000004 | 254700000004 |
| `700000005` | delayed-success | 255700000005 | 254700000005 |
| `700000006` | duplicate-callback | 255700000006 | 254700000006 |
| `700000007` | provider-unavailable | 255700000007 | 254700000007 |

Any other phone number falls back to the `success` scenario so the golden path always works. A new
provider should reuse this suffix convention with its own country's prefix rather than inventing a
new numbering scheme - see `providers/_template/scenarios/` for the ready-to-copy files.

## Conformance requirements

See [conformance/README.md](../conformance/README.md) for the enforced rules. At minimum, a
provider must have a valid manifest, valid schemas, valid mappings, scenarios that reference real
status/reason codes, and deterministic callback behavior under duplicate delivery.
