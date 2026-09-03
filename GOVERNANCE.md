# Governance

Africa Local uses lightweight, informal governance appropriate to an early-stage project. This
will evolve as the contributor base grows - see [ROADMAP.md](ROADMAP.md).

## Roles

### Contributor

Anyone who opens an issue, PR, or discussion. No special access required.

### Maintainer

A contributor trusted with merge rights to a specific area (e.g. a country's provider
directories once that pattern is well-established). Nominated by a Core Maintainer based on a
track record of quality, reviewed contributions.

### Core Maintainer

A maintainer with merge rights across the whole repository, listed in
[`.github/CODEOWNERS`](.github/CODEOWNERS) for the sensitive directories (`specs/`, `contracts/`,
`runtime/`, `.github/`, `adr/`, `rfcs/`, `providers/_template/`). See [MAINTAINERS.md](MAINTAINERS.md)
for the current list.

## Responsibilities

| Responsibility | Who |
|---|---|
| Review a routine PR (e.g. a new provider scenario) | Any maintainer for that area |
| Review a PR touching `specs/`, `contracts/`, `runtime/`, `.github/`, `adr/`, `rfcs/`, or `providers/_template/` | A Core Maintainer (enforced by CODEOWNERS) |
| Merge rights | Maintainers for their area; Core Maintainers everywhere |
| Cut a release | Core Maintainers |
| Approve or reject an RFC | Core Maintainers, after the discussion period in `rfcs/README.md` |
| Promote a provider's maturity status (e.g. experimental -> beta) | The area maintainer, once `npm run test:conformance` passes and the provider has real-world usage feedback |
| Respond to a security report | Core Maintainers, per [SECURITY.md](SECURITY.md) |
| Nominate a new maintainer | Any Core Maintainer, based on sustained, reviewed contribution quality |

## Decision-making

Day-to-day decisions (accepting a PR, fixing a bug, adding a scenario) are made by the reviewing
maintainer. Architecturally significant decisions go through an ADR
([`adr/`](adr/)) for a record, or an RFC ([`rfcs/`](rfcs/)) for anything in the list in
`rfcs/README.md#when-an-rfc-is-required`, which requires Core Maintainer sign-off after open
discussion.

## Changing this document

Governance changes themselves are exactly the kind of shared architectural decision that should go
through an RFC.
