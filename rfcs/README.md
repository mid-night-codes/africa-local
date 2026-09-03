# RFCs

An RFC proposes a significant change and opens it for discussion *before* it's decided, unlike an
[ADR](../adr/README.md), which records a decision already made. Use
[`0000-template.md`](0000-template.md) to start one.

## When an RFC is required

- Breaking provider-contract changes (anything in `specs/provider-manifest.schema.json`,
  `specs/scenario.schema.json`, `specs/event-envelope.schema.json`, `specs/capability.schema.json`,
  or a provider schema, that would break an existing correctly-written consumer - see
  [VERSIONING.md](../VERSIONING.md))
- Plugin architecture changes (how `runtime/plugin-loader` discovers/validates/loads providers)
- New service categories beyond mobile-money (SMS, USSD, identity, banking - see
  [ROADMAP.md](../ROADMAP.md#phase-5---community-expansion))
- A new security model (anything changing the threats/mitigations in
  [SECURITY.md](../SECURITY.md))
- A new protocol model (e.g. adding a non-HTTP `runtime.protocol`)
- Major runtime architecture changes (e.g. splitting the single process into multiple services)
- Versioning policy changes ([VERSIONING.md](../VERSIONING.md))

Smaller architectural decisions that don't need up-front discussion go straight to an
[ADR](../adr/README.md) instead.

## Statuses

```text
Draft -> Discussion -> Accepted -> Implemented
                     -> Rejected
Draft -> Withdrawn
```

## Process

1. Copy `0000-template.md` to `NNNN-short-title.md`.
2. Open a PR with status `Draft`, then move it to `Discussion` once you want feedback.
3. Core Maintainers approve (`Accepted`) or reject (`Rejected`) after the discussion period.
4. Once implemented, update the status to `Implemented` and link the PR(s) that did it. Consider
   also recording the final shape as an ADR for quick future reference.
