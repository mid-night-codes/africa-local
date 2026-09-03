# Africa Local

**A local-first emulator platform for African digital services.** Run deterministic,
production-like emulators for mobile money, SMS, USSD, identity, and banking APIs on your own
machine - no real provider sandboxes, no real credentials, no real money.

> **Status: early-stage (v0.1).** One category (mobile money) and two providers (both Tanzania)
> are implemented. Read [Known Limitations](#known-limitations) before relying on this for
> anything beyond local development and CI.

## What Africa Local is

- A single local runtime that emulates real-world African provider APIs (starting with mobile
  money) behind deterministic, scriptable scenarios: success, insufficient funds, timeout,
  cancellation, delayed success, duplicate callbacks, missing callbacks, provider unavailability.
- Plugin-based: a provider is a manifest + JSON Schemas + mapping tables + scenario files, not a
  block of provider-specific code (see [ARCHITECTURE.md](ARCHITECTURE.md)).
- Spec-first: the source of truth is [`specs/`](specs/) (JSON Schema, state machines,
  Markdown contracts) and [`contracts/`](contracts/) (OpenAPI/AsyncAPI) - not any one programming
  language.

## What Africa Local is not

- Not a real payment switch, aggregator, financial institution, credential broker, settlement
  engine, or PCI card platform.
- Not connected to any real provider, real account, or real money, ever.
- Not (yet) a multi-tenant SaaS, a Kubernetes operator, or anything with a database - v0.1 is a
  single local process with in-memory state, by design (see [ROADMAP.md](ROADMAP.md)).

## Quick start

```bash
git clone <this-repo>
cd africa-local
make setup
make validate
make test
docker compose up
```

Then:

```bash
curl http://localhost:9000/_control/health
```

If port 9000 is already taken on your machine (e.g. by MinIO, which defaults to the same port),
override it: `AFRICA_LOCAL_PORT=9001 docker compose up`.

Without Docker:

```bash
npm run setup
npm start
```

## Supported providers

| Provider | Country | Category | Status |
|---|---|---|---|
| [M-Pesa](providers/tanzania/mpesa/) (`tz-mpesa`) | TZ | mobile-money | experimental |
| [Airtel Money](providers/tanzania/airtel-money/) (`tz-airtel-money`) | TZ | mobile-money | experimental |
| M-Pesa (`ke-mpesa`) | KE | mobile-money | planned |
| MTN MoMo (`ug-mtn-momo`) | UG | mobile-money | planned |

See [`core/registry/registry.yaml`](core/registry/registry.yaml) for the machine-readable list.

## Example request

```bash
curl -s -X POST http://localhost:9000/tz/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000001", "amount": 50000}'
# {"transactionId":"...","status":"PENDING","responseCode":"0","responseMessage":"Request accepted for processing"}

curl -s http://localhost:9000/tz/mpesa/payments/<transactionId>
# {"transactionId":"...","status":"SUCCESS","responseCode":"0","responseMessage":"Success. Transaction completed."}
```

See [`examples/curl/`](examples/curl/) for the full walkthrough including callbacks.

## Scenario simulation

Every provider ships deterministic test phone numbers - see
[`specs/service-contract.md`](specs/service-contract.md#deterministic-test-identities):

| Phone | Scenario |
|---|---|
| 255700000001 | success |
| 255700000002 | insufficient-funds |
| 255700000003 | user-cancelled |
| 255700000004 | timeout |
| 255700000005 | delayed-success |
| 255700000006 | duplicate-callback |
| 255700000007 | provider-unavailable |

Or force any scenario regardless of phone number:

```bash
curl -X POST http://localhost:9000/_control/providers/tz-mpesa/scenario \
  -H "Content-Type: application/json" -d '{"scenario": "timeout"}'
```

## Architecture overview

```text
Specifications (specs/) -> Contracts (contracts/) -> Provider manifests (providers/) ->
Conformance rules (conformance/) -> Runtime (runtime/, core/) -> CLI / Desktop / CI
```

One Node.js process serves every provider on one port, path-routed by each provider's manifest.
Full detail, diagrams, and rationale: [ARCHITECTURE.md](ARCHITECTURE.md).

## Provider contribution model

Adding a provider is meant to be one of the easiest contributions in the project: copy
[`providers/_template/`](providers/_template/), fill in the manifest/schemas/mappings/scenarios,
run `npm run test:conformance`, register it, open a PR. See
[`providers/_template/CONTRIBUTING.md`](providers/_template/CONTRIBUTING.md).

## Roadmap

Mobile money in Tanzania first, then more Tanzania providers, then more countries and service
categories (SMS, USSD, identity, banking). Full detail: [ROADMAP.md](ROADMAP.md).

## Contributing

Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md). AI coding agents: read
[AGENTS.md](AGENTS.md) first, then [`.github/CONTRIBUTING_AGENT.md`](.github/CONTRIBUTING_AGENT.md).

## Known limitations

- Two providers, one country, one service category. Everything else in
  [`services/`](services/) is a placeholder for Phase 5 (see [ROADMAP.md](ROADMAP.md)).
- State is entirely in-memory and is lost on restart - there is no database and none is planned
  for v0.1.
- Provider response codes/messages are documented, honest approximations (see each provider's
  `provider.yaml#approximations`), not verified against a real integration guide.
- No desktop UI yet - [`ui/desktop/`](ui/desktop/) is scaffolding and documentation only.

## Security

Africa Local must never be given real provider credentials or real customer data - there is no
legitimate use case for that in a local emulator. See [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE).
