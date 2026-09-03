# Provider Template

Copy this directory to add a new provider - see [CONTRIBUTING.md](CONTRIBUTING.md) for the
step-by-step flow. This README documents what every file must contain; delete this paragraph in
your copy and replace it with a real provider README modeled on
[`providers/tanzania/mpesa/README.md`](../tanzania/mpesa/README.md).

## Required fields (provider.yaml)

See [`specs/provider-manifest.schema.json`](../../specs/provider-manifest.schema.json) for the
authoritative schema. In short:

| Field | Required | Notes |
|---|---|---|
| `id` | yes | `<country-code>-<slug>`, globally unique, lowercase |
| `name` | yes | Human-readable |
| `country` | yes | ISO 3166-1 alpha-2 |
| `category` | yes | `mobile-money` for v0.1; other categories reserved |
| `version` | yes | Semver, independent of the runtime version |
| `status` | yes | `planned` until conformance passes |
| `capabilities` | yes | Only set `true` for what you actually implement |
| `runtime.protocol` | yes | `http` |
| `endpoints.basePath` | yes | Must not collide with any other registered provider |
| `scenarios` | yes | Must match one `scenarios/<name>.yaml` file each |
| `approximations` | recommended | Be explicit about fidelity gaps (§53) |

## Supported capabilities

- `paymentInitiation` - accepts `POST {basePath}/payments`
- `statusQuery` - accepts `GET {basePath}/payments/{id}`
- `callbacks` - delivers an HTTP callback to the caller-supplied `callbackUrl`
- `reversal` / `refund` - optional in v0.1; the canonical state machine models both, but you are
  not required to wire up endpoints for them yet

## Schema expectations (schemas/)

Four schemas are required, one JSON Schema file each: `initiate-request.json`,
`initiate-response.json`, `status-response.json`, `callback.json`. Keep them self-contained (no
external `$ref`s) - the plugin loader compiles each independently.

## Status and error mappings (mappings/)

- `statuses.yaml` must have an entry for **all 10** canonical statuses in
  `specs/state-machines/payment-lifecycle.json`, even ones your scenarios don't hit yet.
- `errors.yaml` needs one entry per canonical `reason` code any of your scenarios set via
  `behavior.reason`. A matching `errors.yaml` entry always overrides the generic `statuses.yaml`
  entry for that result.

## Scenario expectations (scenarios/)

Ship at least the built-in set described in
[`specs/service-contract.md#conformance-requirements`](../../specs/service-contract.md#conformance-requirements):
`success`, `insufficient-funds`, `timeout`, `user-cancelled`, `provider-unavailable`,
`delayed-success`, `duplicate-callback`, `missing-callback`. Reuse the deterministic phone-number
convention (`2550000000X`-style within your own country prefix) so behavior is predictable across
providers.

## Callback behavior

Never implement your own delay/retry/duplicate logic in provider code - express it declaratively
via `behavior.callbackDelay`, `callbackCount`, `dropCallback`, `duplicateCallback`,
`invalidSignature`, `outOfOrderDelivery` in a scenario file. See
[`core/callbacks/README.md`](../../core/callbacks/README.md).

## Conformance requirements

Your provider must pass `npm run test:conformance` before it can move from `experimental` to
`beta`. See [`conformance/README.md`](../../conformance/README.md).

## Documentation expectations

Replace this file with a provider README covering: what real service this emulates, the endpoint
paths, a working curl example, the phone-number-to-scenario table, and known approximations.
