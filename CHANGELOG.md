# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning rules are in [VERSIONING.md](VERSIONING.md).

## [Unreleased]

### Added

- KE M-Pesa (`ke-mpesa`, experimental), built entirely through `providers/_template/` with no
  runtime changes - a deliberate test that the plugin model generalizes to a new country. See
  `providers/kenya/mpesa/README.md`.

### Changed

- `specs/service-contract.md#deterministic-test-identities` generalized the deterministic phone
  convention to be explicit about per-country prefixes (`700000001`-`700000007` suffix block) now
  that a second country exists.

## [0.1.0] - 2026-09-03

### Added

- Initial repository structure, specs, contracts, ADR/RFC process, and AI-agent guidance
  (`AGENTS.md`, `.github/CONTRIBUTING_AGENT.md`).
- Node.js/Express runtime with plugin loader, scenario engine, callback engine, request history,
  and Control API.
- Two experimental mobile-money providers for Tanzania: `tz-mpesa` and `tz-airtel-money`.
- Provider template (`providers/_template/`) and provider registry
  (`core/registry/registry.yaml`).
- Conformance suite covering manifest validity, scenario/schema conformance, and callback
  determinism, reused automatically for any new provider.
- CLI (`africa-local`), Dockerfile, and `docker compose up` developer experience.
- Root documentation: README, ARCHITECTURE, CONTRIBUTING, SECURITY, GOVERNANCE, ROADMAP,
  VERSIONING, MAINTAINERS, SUPPORT.
