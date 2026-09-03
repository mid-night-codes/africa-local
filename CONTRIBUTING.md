# Contributing

Thanks for considering a contribution to Africa Local. This document covers the general flow;
adding a new provider has its own, easier path documented in
[`providers/_template/CONTRIBUTING.md`](providers/_template/CONTRIBUTING.md). AI agents should
read [AGENTS.md](AGENTS.md) and [`.github/CONTRIBUTING_AGENT.md`](.github/CONTRIBUTING_AGENT.md)
instead of this file.

## Flow

```text
Find issue
   |
   v
Discuss scope
   |
   v
Create branch
   |
   v
Implement small change
   |
   v
Run validation
   |
   v
Open PR
   |
   v
CI
   |
   v
Review
   |
   v
Merge
```

## Setup

```bash
git clone <this-repo>
cd africa-local
make setup
make validate
make test
```

## Before opening a PR

```bash
make validate          # schema, provider manifest, and registry validation
make lint
make test              # core/runtime/cli unit tests
make test-conformance   # provider conformance suite
make check-contracts    # OpenAPI/AsyncAPI sanity checks
```

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(provider): add tz-airtel timeout scenario
fix(runtime): prevent duplicate callback scheduling
docs(provider): document mpesa status mappings
test(conformance): validate callback schemas
chore(ci): add schema validation
```

## Pull requests

Keep PRs small and reviewable - favor several small PRs over one large one (§53). Fill in
[`.github/pull_request_template.md`](.github/pull_request_template.md); it asks for the same
things reviewers will check anyway.

## Definition of done

A contribution is ready to merge when:

- Implementation is complete for the stated scope (no half-finished paths).
- Tests pass: `make test` and, for provider changes, `make test-conformance`.
- Schemas and provider manifests validate: `make validate`.
- Documentation is updated (README, provider README, ADR/RFC if applicable).
- No secrets were added (see [SECURITY.md](SECURITY.md)).
- No unrelated changes are included.
- No breaking contract change was made without a version bump and changelog entry (see
  [VERSIONING.md](VERSIONING.md)) or, for architectural changes, an accepted RFC.
- `core/registry/registry.yaml` is updated if a provider's status or existence changed.
- Security-relevant changes (callback handling, anything touching `core/callbacks/policy.js`) have
  been reviewed with `SECURITY.md` in mind.

## When you need more than a PR

- **ADR** ([`adr/`](adr/)): for a shared architectural decision worth recording, even if not
  controversial.
- **RFC** ([`rfcs/`](rfcs/)): required for breaking provider-contract changes, plugin architecture
  changes, new service categories, a new security model, a new protocol model, major runtime
  architecture changes, or versioning policy changes.

## Code review

See [`.github/CODEOWNERS`](.github/CODEOWNERS) for which directories require maintainer review.
Governance and maintainer responsibilities are documented in [GOVERNANCE.md](GOVERNANCE.md).
