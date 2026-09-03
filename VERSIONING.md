# Versioning

Africa Local versions several things independently. All of them follow
[Semantic Versioning](https://semver.org/).

| Artifact | Where | Versioned by |
|---|---|---|
| The project as a whole | `package.json#version` | Core Maintainers, at release time |
| Provider manifest schema | `specs/provider-manifest.schema.json` (not currently self-versioned; a `$id`/version bump requires an RFC, see below) | RFC |
| Scenario schema | `specs/scenario.schema.json` | RFC for breaking changes; ADR for additive/backward-compatible ones |
| A provider plugin | `providers/<country>/<slug>/provider.yaml#version` | That provider's maintainer, independent of the project version |
| Control API | `contracts/openapi/control-api.yaml#info.version` | Core Maintainers |
| Provider schemas | `providers/<country>/<slug>/schemas/*.json` | That provider's maintainer, alongside `provider.yaml#version` |

## Breaking-change rules

A change is breaking if it would require an existing, correctly-written consumer to change code to
keep working. Examples: removing or renaming a response field, changing a canonical status's
meaning, removing a scenario, changing a provider's `basePath`, tightening a request schema in a
way that rejects previously-valid requests.

- **Provider plugin**: a breaking change bumps the provider's `version` (major) in its
  `provider.yaml`, is called out in that provider's README, and is noted in the root
  [CHANGELOG.md](CHANGELOG.md).
- **Provider manifest / scenario / capability / event-envelope schema**: any breaking change
  requires an RFC (these are cross-provider contracts - see
  [`rfcs/README.md#when-an-rfc-is-required`](rfcs/README.md)).
- **Control API**: a breaking change bumps `contracts/openapi/control-api.yaml#info.version`
  (major) and is noted in [CHANGELOG.md](CHANGELOG.md). The CLI and any future desktop UI in this
  repository are updated in the same PR.
- **Project version**: follows semver against the Control API and the set of `stable` provider
  contracts. Providers still at `experimental`/`beta` status may change without a major project
  version bump - see `specs/service-contract.md#provider-maturity`.

## Pre-1.0 caveat

While the project is at `0.x`, minor version bumps may include breaking changes to
`experimental`/`beta` surfaces, per the normal semver convention for `0.x` releases. `stable`
providers, once any exist, are held to the full breaking-change rules above regardless of the
project's own `0.x` version.
