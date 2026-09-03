# Architecture Decision Records

An ADR captures a shared architectural decision and its rationale, so future contributors (human
or AI) understand *why*, not just *what*. Use [`0000-template.md`](0000-template.md) to start one.

## When to write an ADR

Any decision that affects more than one directory, or that a future contributor might reasonably
want to reverse without knowing why it was made this way. Smaller than an RFC (see
[`rfcs/README.md`](../rfcs/README.md)) - an ADR records a decision that's already been made; an RFC
is how you propose one that needs discussion first.

## Process

1. Copy `0000-template.md` to `NNNN-short-title.md`, using the next sequential number.
2. Fill it in. Status starts as `Proposed`.
3. Open a PR. A Core Maintainer reviews it (see `.github/CODEOWNERS`).
4. On merge, status becomes `Accepted`. If a later ADR reverses it, mark this one `Superseded by
   NNNN` and link both directions.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-runtime-language-and-no-build-step.md) | Runtime language: Node.js, plain ESM, no build step | Accepted |
| [0003](0003-commit-message-and-issue-traceability.md) | Commit message format and issue traceability | Accepted |
