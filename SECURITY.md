# Security Policy

Africa Local is a **local emulation and developer testing platform**. It is not a real payment
switch, aggregator, financial institution, credential broker, or settlement engine, and it must
never be treated as one.

## Absolutely prohibited in this repository

The following must never appear in code, configuration, tests, fixtures, issues, or PRs:

- Real provider credentials or API keys (M-Pesa, Airtel Money, or any other provider)
- Production API keys of any kind
- Private keys (TLS, SSH, signing)
- Access tokens, refresh tokens, or session tokens tied to a real account
- Real customer data (real phone numbers beyond the documented deterministic test identities, real
  names, real transaction records)
- Real financial transactions of any kind
- Any other production secret

If you believe a secret has been committed, do not open a public issue - see
[Reporting a vulnerability](#reporting-a-vulnerability) below.

## Default development experience requires no real credentials

Every provider in this repository is a local emulator. `docker compose up` and the deterministic
test phone numbers in [`specs/service-contract.md`](specs/service-contract.md) are sufficient for
the entire default developer experience - if a contribution ever requires a real credential to
run, that is a bug in the contribution, not a missing setup step.

## Threats considered

| Threat | Mitigation |
|---|---|
| Webhook / callback spoofing | Every callback is signed (`x-africa-local-signature`, HMAC) and carries a stable `x-africa-local-event-id` for deduplication. Signatures use a fixed, published, non-secret development key - they authenticate that a payload came from *this emulator*, not a production secret. |
| Replay attacks | `x-africa-local-attempt` and `eventId` let consumers detect redelivery; `POST /_control/callbacks/{id}/replay` is an explicit, intentional replay tool for local testing, not a hidden capability. |
| Unsafe callback URLs / SSRF | See [`core/callbacks/policy.js`](core/callbacks/policy.js). Africa Local intentionally does **not** block loopback/private addresses by default - the entire purpose of the callback engine is delivering to the developer's own machine. It does reject non-`http(s)` protocols and honors an operator-configurable denylist (`AFRICA_LOCAL_CALLBACK_DENYLIST`, comma-separated hostnames) for shared/CI environments. Do not run Africa Local as an open, internet-reachable service and accept arbitrary `callbackUrl` values from untrusted callers without adding your own network-level controls. |
| Sensitive logging | [`runtime/request-history`](runtime/request-history/) redacts `authorization`, `cookie`, and `x-api-key` headers before storing them. Request/response bodies for the shipped providers never contain real secrets by construction (deterministic emulator payloads only). |
| Credential leakage | There are no credentials to leak in v0.1 - the runtime does not authenticate outbound calls to anything, and nothing it stores is meant to be secret. |
| Dependency / supply-chain attacks | Dependencies are kept minimal and pinned in `package-lock.json` (`express`, `ajv`, `ajv-formats`, `js-yaml`, `commander`). `npm audit` is expected to be run in CI (see `.github/workflows/`); a known moderate advisory in a transitive `qs`/`body-parser` dependency of `express` is tracked and has no practical exposure here because the runtime only parses JSON bodies, never the vulnerable query-string path. |
| Malicious provider plugins | Provider directories are validated against `specs/provider-manifest.schema.json` and loaded declaratively (manifest + schemas + mappings + scenarios, no arbitrary code execution in v0.1's plugin loader). A future version that allows provider `index.js` hooks (see ARCHITECTURE.md) should require maintainer review for any new provider directory - see `.github/CODEOWNERS`. |

## Reporting a vulnerability

Please do not open a public GitHub issue for a suspected security vulnerability. Instead, contact
the maintainers privately as described in [MAINTAINERS.md](MAINTAINERS.md). Include enough detail
to reproduce the issue; you will receive an acknowledgment and a plan for disclosure timing.

## Scope

This policy covers the Africa Local codebase itself. It does not cover the real provider services
it emulates (M-Pesa, Airtel Money, etc.) - Africa Local has no relationship with, and makes no
security claims about, those real-world systems.
