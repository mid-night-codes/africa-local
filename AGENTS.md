# AGENTS.md

Africa Local treats AI coding agents as first-class contributors. If you are an AI agent working
in this repository, read this file in full before touching any code.

## Context hierarchy

Read in this order, and no further than you need to for the task at hand:

```text
AGENTS.md
     |
     v
directory README (the README.md in the directory you're changing)
     |
     v
specification (specs/service-contract.md, the relevant specs/*.schema.json)
     |
     v
provider manifest (provider.yaml, if the task touches a provider)
     |
     v
schemas (schemas/*.json)
     |
     v
mappings (mappings/*.yaml)
     |
     v
tests (conformance/ and any *.test.js colocated with the code)
     |
     v
implementation
```

Do not read the whole repository before starting. Context lives close to where it applies -
`core/README.md`, `runtime/README.md`, `providers/README.md`, `providers/_template/README.md`,
and each provider's own `README.md` each cover only their own directory.

## Required workflow

1. Read this file first (you're doing that now).
2. Read the README of the directory you're about to change.
3. Read the relevant specification in `specs/` - do not guess at a schema's shape when it's
   written down.
4. If the task touches a provider, read that provider's `provider.yaml` manifest.
5. Read any existing tests for the code you're changing (`*.test.js` colocated with modules under
   `core/`, `runtime/`, `cli/`; provider behavior is tested centrally in `conformance/`).
6. Make the smallest possible change that satisfies the task.
7. Avoid unrelated refactors, even ones you believe are improvements. Propose them separately.
8. Do not invent provider behavior. If a real provider's exact response code or field name is
   unknown, say so explicitly in `provider.yaml#approximations` rather than presenting a guess as
   fact (§53 - transparent approximation over false fidelity).
9. Mark assumptions explicitly, in code comments only where the *why* is non-obvious, and in your
   PR description otherwise.
10. Add or update tests for whatever you changed. A provider change should make
    `npm run test:conformance` pass without a new test file (see `conformance/README.md`); a
    core/runtime change needs a colocated `*.test.js`.
11. Run validation before considering the task done:
    ```bash
    npm run validate
    npm test
    npm run test:conformance
    ```
12. Inspect the final diff (`git diff`) before proposing it. Confirm it contains only the files
    your task required.
13. Never commit credentials, API keys, tokens, or anything resembling real provider secrets -
    see [SECURITY.md](SECURITY.md). There is no legitimate reason for a real secret to exist
    anywhere in this repository.
14. Never hand-edit a generated or derived file if one exists (currently none are generated in
    v0.1, but if that changes, check `ARCHITECTURE.md` first).
15. If your change is a breaking provider-contract change, a plugin-architecture change, a new
    service category, or another item listed in `rfcs/README.md#when-an-rfc-is-required`, open an
    RFC instead of a PR. If it's a smaller but still architecturally significant decision, record
    it as an ADR (`adr/0000-template.md`).
16. If you create a commit, it must follow Conventional Commits and reference a GitHub issue
    (e.g. a `Refs: #123` trailer) - see `CONTRIBUTING.md#commit-messages` and
    `adr/0003-commit-message-and-issue-traceability.md`. This is enforced by a local git hook and
    again in CI. If no relevant issue exists, reference an existing related one if there
    genuinely is a fit, or ask a maintainer/the user to open one - do not fabricate an issue number
    and do not attempt to script around the check (e.g. `SKIP_ISSUE_CHECK=1`) to make a commit
    succeed; that flag is for a human maintainer's deliberate, visible exception, not a way to
    satisfy a check you'd rather not deal with.
17. Every change lands via a pull request - never push directly to `main`, not even for a
    single-file fix. The PR description must reference its tracking issue with a closing keyword
    (`Closes #123` / `Fixes #123` / `Resolves #123`) so merging the PR closes the issue - see
    `CONTRIBUTING.md#pull-requests`. Open the PR and leave it for review/merge; do not merge your
    own PR unless the user or a maintainer explicitly asks you to.

## Project-specific things worth knowing

- The runtime is plain ESM JavaScript on Node.js - no build step, no TypeScript. See
  `adr/0002-runtime-language-and-no-build-step.md` for why, so you don't "fix" this by adding one.
- Provider behavior belongs in YAML (`provider.yaml`, `scenarios/*.yaml`, `mappings/*.yaml`), not
  in JavaScript. If you find yourself writing a `class MpesaProvider`, stop - that's exactly the
  language/provider coupling `ARCHITECTURE.md` forbids.
- Deterministic phone numbers (e.g. `255700000001` -> success) live in `scenarios/*.yaml`
  `match.phone` fields, never hardcoded in `runtime/` or in provider JavaScript.
- `node --test <dir>` has a discovery quirk on this Node version: passing a bare directory that
  itself contains nested subdirectories (e.g. `node --test core`) fails outright, while a leaf
  directory or explicit file list works fine. The npm scripts avoid the whole problem by using
  `find` + command substitution (`node --test $(find core runtime cli scripts -name '*.test.js')`)
  to pass explicit file paths - this also avoids relying on bash's `globstar` glob option, which
  **macOS's shipped `/bin/bash` (3.2) does not support at all**, silently degrading a
  `shopt -s globstar` + `**` pattern to a non-recursive, 2-levels-deep-only match. That exact
  silent failure happened once already in this repo (a test file placed directly in `scripts/`
  wasn't being run, with no error - `npm test` just quietly reported fewer passing tests). Don't
  reintroduce a `bash -c '...glob...'`-style test script without verifying it actually finds every
  `*.test.js` file, at every depth, on macOS's real `/bin/bash`.

## Self-review checklist before opening a PR

See [`.github/CONTRIBUTING_AGENT.md`](.github/CONTRIBUTING_AGENT.md) for the full agent workflow
and checklist.
