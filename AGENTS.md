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

## Project-specific things worth knowing

- The runtime is plain ESM JavaScript on Node.js - no build step, no TypeScript. See
  `adr/0002-runtime-language-and-no-build-step.md` for why, so you don't "fix" this by adding one.
- Provider behavior belongs in YAML (`provider.yaml`, `scenarios/*.yaml`, `mappings/*.yaml`), not
  in JavaScript. If you find yourself writing a `class MpesaProvider`, stop - that's exactly the
  language/provider coupling `ARCHITECTURE.md` forbids.
- Deterministic phone numbers (e.g. `255700000001` -> success) live in `scenarios/*.yaml`
  `match.phone` fields, never hardcoded in `runtime/` or in provider JavaScript.
- `npm --test` directory args have a discovery quirk on this Node version when a directory
  contains nested subdirectories - the npm scripts use explicit glob patterns
  (`core/**/*.test.js`) via `bash -c '...'` to work around it. Don't "simplify" this back to a bare
  directory argument without checking `npm test` still passes.

## Self-review checklist before opening a PR

See [`.github/CONTRIBUTING_AGENT.md`](.github/CONTRIBUTING_AGENT.md) for the full agent workflow
and checklist.
