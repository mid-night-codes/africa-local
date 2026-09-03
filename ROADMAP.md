# Roadmap

## Phase 0 - Foundation (done for v0.1)

- Repository structure
- Contracts and specifications (`specs/`, `contracts/`)
- Contributor workflow (`CONTRIBUTING.md`, `providers/_template/`)
- AI-agent guidance (`AGENTS.md`, `.github/CONTRIBUTING_AGENT.md`)
- CI (`.github/workflows/`)
- Provider template
- Provider registry

## Phase 1 - Runtime (done for v0.1)

- HTTP runtime (`runtime/`)
- Provider loader (`runtime/plugin-loader/`)
- Scenario engine (`core/scenarios/`)
- Callback engine (`core/callbacks/`)
- Request history (`runtime/request-history/`)
- Control API (`runtime/api/`)

## Phase 2 - Tanzania providers (done for v0.1)

- TZ M-Pesa (`tz-mpesa`, experimental)
- TZ Airtel Money (`tz-airtel-money`, experimental)
- Conformance suite (`conformance/`)
- curl example (`examples/curl/`)

## Phase 3 - Developer tooling (in progress)

- CLI (`cli/`) - done: `providers`, `scenario`, `requests`, `health`, `start`
- Docker image and Compose (done)
- Scenario management via CLI/Control API (done)
- Request inspection via CLI/Control API (done)
- Deferred: Node.js and Python examples beyond curl, a real OpenAPI/AsyncAPI validator dependency
  (`make check-contracts` is currently a lightweight structural check)

## Phase 4 - Desktop

Not started. `ui/desktop/` documents the intended architecture (Control-API-only, no duplicated
runtime logic). Planned screens:

- Provider list and status
- Active scenario view
- Request history and request inspector
- Callback history and replay controls
- Scenario controls
- Runtime health

## Phase 5 - Community expansion

- More countries: Kenya, Uganda, Ghana, Nigeria, Rwanda
- More mobile-money providers within already-supported countries
- New service categories: SMS, USSD, identity, banking (see `services/` for placeholders)

## Non-goals for v0.1

Deliberately out of scope right now (revisit only via RFC, see `rfcs/README.md`):

- Real payment processing or real provider authentication
- Production credential storage
- Settlement
- Multi-tenant SaaS or cloud accounts
- Kubernetes operators
- A database or other persistence layer
- A microservice architecture (v0.1 is intentionally one process)
- A full desktop UI (scaffolding only)
- Advanced analytics
- A plugin marketplace
