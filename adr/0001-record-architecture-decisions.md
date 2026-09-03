# 0001. Record architecture decisions

## Status

Accepted

## Context

Africa Local is designed to be a long-lived, multi-contributor, AI-agent-friendly open-source
project (see [AGENTS.md](../AGENTS.md)). Decisions that aren't written down get re-litigated or
silently reversed by well-meaning contributors (human or AI) who weren't there for the original
discussion.

## Decision

We record architecturally significant decisions as ADRs in this directory, using
[`0000-template.md`](0000-template.md), numbered sequentially. For decisions that need open
discussion before being made (breaking contract changes, new service categories, etc.), we use an
RFC first (see [`rfcs/README.md`](../rfcs/README.md)) and may record the outcome as an ADR
afterward.

## Alternatives

- **No formal record, rely on PR descriptions and commit history**: rejected - PR history doesn't
  surface a decision's rationale to someone reading the code six months later, and doesn't give AI
  agents a place to look before "fixing" something that was deliberate.
- **A wiki**: rejected - drifts out of sync with the code it describes; a file in the repo is
  versioned with the code and reviewed the same way.

## Consequences

Every non-trivial architectural decision going forward should have (or link to) an ADR. This adds
a small amount of process overhead to justify in exchange for a durable decision record.

## Compatibility impact

None - this is a process decision.

## Security impact

None.

## Operational impact

None.
