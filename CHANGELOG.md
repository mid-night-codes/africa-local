# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning rules are in [VERSIONING.md](VERSIONING.md).

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
