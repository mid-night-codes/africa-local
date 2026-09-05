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

**Every change lands via a pull request, never a direct push to `main`** - even a single-file docs
fix. See [Pull requests](#pull-requests) below for what the PR itself must contain.

## Setup

```bash
git clone <this-repo>
cd africa-local
make setup
make validate
make test
```

`make setup` (`npm install`) also installs a local git `commit-msg` hook via
[Husky](https://typicode.github.io/husky/) that enforces the two rules in
[Commit messages](#commit-messages) below before a commit is even created. Nothing about it
touches the network or GitHub - see [`adr/0003-commit-message-and-issue-traceability.md`](adr/0003-commit-message-and-issue-traceability.md).

## Before opening a PR

```bash
make validate          # schema, provider manifest, and registry validation
make lint
make test              # core/runtime/cli unit tests
make test-conformance   # provider conformance suite
make check-contracts    # OpenAPI/AsyncAPI sanity checks
```

## Commit messages

Two rules apply to every commit, enforced locally by the Husky hook installed via `make setup` and
again in CI ([`.github/workflows/commit-messages.yml`](.github/workflows/commit-messages.yml)) as
a safety net - see [`adr/0003-commit-message-and-issue-traceability.md`](adr/0003-commit-message-and-issue-traceability.md)
for why.

1. **[Conventional Commits](https://www.conventionalcommits.org/)** format, checked by
   [commitlint](https://commitlint.js.org/):

   ```text
   feat(provider): add tz-airtel timeout scenario
   fix(runtime): prevent duplicate callback scheduling
   docs(provider): document mpesa status mappings
   test(conformance): validate callback schemas
   chore(ci): add schema validation
   ```

2. **Reference a GitHub issue** somewhere in the message (header, body, or a trailer), checked by
   [`scripts/require-issue-reference.js`](scripts/require-issue-reference.js):

   ```text
   feat(provider): add ke-mpesa timeout scenario

   Refs: #123
   ```

   If no issue exists yet for your change, create one first (`gh issue create` or the GitHub UI)
   and reference it - **neither the hook nor CI creates one for you.** Merge commits are exempt.
   For the rare, legitimate exception, `SKIP_ISSUE_CHECK=1 git commit ...` bypasses the check
   locally; use it sparingly, since it will be visible in review.

## Pull requests

Keep PRs small and reviewable - favor several small PRs over one large one (§53). Fill in
[`.github/pull_request_template.md`](.github/pull_request_template.md); it asks for the same
things reviewers will check anyway.

Every PR must reference its tracking issue using a
[GitHub closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
(`Closes #123`, `Fixes #123`, or `Resolves #123`) in the PR description, so merging the PR
automatically closes the issue. If no issue exists yet, create one first (`gh issue create` or the
GitHub UI) - same rule as [Commit messages](#commit-messages) above, just at the PR level instead
of the per-commit level. This is separate from (and in addition to) the per-commit `Refs: #123`
requirement: a commit only needs *some* reference and doesn't need a PR at all to be valid on its
own, but the PR that eventually ships that work must *close* the issue when merged.

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
