# 0003. Commit message format and issue traceability

## Status

Accepted

## Context

As the contributor base grows (human and AI, see `AGENTS.md`), it becomes harder to answer "why
was this changed?" from `git log` alone, and harder to generate an accurate `CHANGELOG.md`
automatically in the future. `CONTRIBUTING.md` already documented Conventional Commits as a
convention, but nothing enforced it, and nothing tied a commit back to a tracked unit of work
(a GitHub issue).

## Decision

Two rules are now enforced, identically, in two places:

1. **Conventional Commits format** (`type(scope): subject`), enforced by
   [`commitlint`](https://commitlint.js.org/) against `@commitlint/config-conventional`.
2. **Every commit message must reference a GitHub issue** (e.g. `#123`, anywhere in the header,
   body, or a trailer like `Refs: #123`), enforced by
   [`scripts/require-issue-reference.js`](../scripts/require-issue-reference.js). Merge commits and
   empty messages are exempt. An escape hatch (`SKIP_ISSUE_CHECK=1`) exists for rare, legitimate
   exceptions, and is expected to be used sparingly enough that its use is visible in review.

Enforcement points:

- **Locally**: [`.husky/commit-msg`](../.husky/commit-msg) runs both checks before a commit is
  created. Husky is installed automatically via the `prepare` script on `npm install`/`make setup`.
- **In CI**: [`.github/workflows/commit-messages.yml`](../.github/workflows/commit-messages.yml)
  re-runs the identical two checks over every commit in a PR's range, as a safety net for commits
  made without the hook (the GitHub web UI, `--no-verify`, or a contributor who hasn't run
  `npm install` yet).

**Neither enforcement point automatically creates a GitHub issue.** If no issue exists yet, the
contributor creates one themselves (`gh issue create` or the GitHub UI) and references it.

## Alternatives

- **Auto-create a missing issue from the local git hook** (via `gh issue create`): rejected -
  requires every contributor to have `gh` installed and authenticated locally, and is prone to
  creating duplicate issues across the several small commits a branch typically accumulates before
  being amended/rebased/squashed into a PR.
- **Auto-create a missing issue from the CI workflow**: rejected for the same duplication concern
  (one issue per non-compliant commit, potentially several per PR) and because CI creating
  user-visible artifacts (issues) as a side effect of a validation step is surprising behavior for
  a check that contributors expect to be read-only.
- **No issue-reference requirement at all, format-only enforcement**: considered, but doesn't
  deliver the traceability goal - a well-formatted commit ("fix(runtime): ...") is still opaque
  about which piece of tracked work it belongs to.

## Consequences

- Every commit now requires either an existing issue number or a deliberate `SKIP_ISSUE_CHECK=1`
  override, which is a small amount of added friction for very small/obvious changes. This is
  judged worth it for the traceability gained as the project grows.
- Contributors must run `npm install` (or `make setup`) once to get the local hook - CI is the
  backstop for anyone who hasn't.
- `AGENTS.md` documents this for AI-agent contributors, including that they should reference an
  existing issue or ask a maintainer to open one, rather than attempting to script around the
  check.

## Compatibility impact

None to any provider contract or API - this only affects the commit workflow.

## Security impact

None - no new network calls or credentials are introduced; `scripts/require-issue-reference.js`
only reads local commit message text and runs `git log` against the local repository.

## Operational impact

Adds two lightweight steps to CI (`commitlint`, `require-issue-reference.js --range`) on every PR,
and a local git hook on every commit. Both are fast (no network I/O) and fail with actionable
guidance rather than a bare error.

## Related

This ADR covers per-*commit* traceability only (`Refs: #123`, which doesn't need to close
anything). A separate, complementary rule requires every *PR* to close its tracking issue with a
GitHub closing keyword (`Closes #123` / `Fixes #123` / `Resolves #123`) - see
`CONTRIBUTING.md#pull-requests`. That rule is about the review/merge workflow (PRs instead of
direct pushes to `main`) rather than commit hygiene, so it didn't warrant its own ADR, but the two
work together: every commit is traceable to an issue, and every issue is closed by the PR that
actually ships the work.
