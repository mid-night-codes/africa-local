# core

Pure, provider-agnostic logic with no HTTP, no filesystem watching, and no framework dependency
beyond `js-yaml`/`ajv` for parsing and validating the specs in [`specs/`](../specs/). Everything
here operates on canonical concepts (see `specs/service-contract.md`) and is unit-tested in place
(`*.test.js` next to the module it tests).

| Module | Responsibility |
|---|---|
| [`registry/`](registry/) | Loads and validates the provider registry (`registry/registry.yaml`). |
| [`scenarios/`](scenarios/) | Matches a canonical request to a scenario definition. |
| [`events/`](events/) | The canonical payment state machine and event envelope construction. |
| [`callbacks/`](callbacks/) | Schedules and records callback delivery (delay, drop, duplicate, replay). |
| [`payments/`](payments/) | In-memory canonical payment store. |

`runtime/` is the only consumer of `core/` that is allowed to know about HTTP, Express, or the
filesystem layout of `providers/`.
