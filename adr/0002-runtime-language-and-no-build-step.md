# 0002. Runtime language: Node.js, plain ESM, no build step

## Status

Accepted

## Context

§49 of the founding spec asks for a runtime language chosen for fast startup, cross-platform
support, strong HTTP tooling, good JSON/YAML support, easy Docker packaging, maintainability, and
contributor accessibility - while §2 requires the *architecture* to stay language-neutral: the
domain model lives in `specs/` and `contracts/`, not in language-specific types.

## Decision

The v0.1 runtime is Node.js 22, written as plain ECMAScript modules (`"type": "module"` in
`package.json`) with JSDoc type hints where useful - **no TypeScript, no build step**. Dependencies
are kept minimal: `express` (HTTP), `ajv`/`ajv-formats` (JSON Schema validation against `specs/`),
`js-yaml` (parsing provider YAML), `commander` (CLI). Tests use Node's built-in `node:test` runner
- no external test framework.

Rationale for each part:

- **Node.js**: satisfies every §49 criterion and is already the tool available in this
  environment; no reason to introduce a second language for v0.1's scope (two providers, one
  category).
- **No build step**: `docker compose up` and CI both need to go from source to running server with
  as few moving parts as possible. A `tsc`/bundler step is one more thing that can silently drift
  from source or fail in CI without failing locally. If type safety becomes a real pain point as
  the provider count grows, TypeScript can be introduced later (its own ADR) without touching
  `specs/` or `contracts/` - those stay language-neutral regardless.
- **Minimal dependencies**: fewer supply-chain surfaces (see `SECURITY.md`), faster
  `npm ci`/Docker build, easier for a first-time contributor to read the whole runtime.

## Alternatives

- **TypeScript with a build step**: rejected for v0.1 - the type safety benefit doesn't yet
  outweigh the operational cost of a build step in the critical `docker compose up` path, given
  the domain model already lives in JSON Schema (arguably a stronger, language-neutral substitute
  for types at the provider-contract boundary).
- **Go or Rust**: would satisfy fast-startup and single-binary packaging well, but raises the
  contributor-accessibility bar for a project explicitly trying to make provider contributions
  (YAML + JSON Schema, no code) the easy path, and for AI-agent contributors generally more fluent
  in JS/TS/Python.
- **Python**: viable, but Node's built-in test runner, native `fetch`, and JSON/YAML ecosystem made
  the "small maintainable runtime, minimal dependencies" goal (§53) easier to hit without a
  virtualenv/packaging story.

## Consequences

- Contributors need Node.js 22+ locally (or just Docker).
- No compile-time type checking; correctness leans more heavily on `specs/*.schema.json`
  validation (enforced at both load-time and in `conformance/`) and on tests.
- Revisiting this later (e.g. adding TypeScript, or reimplementing the runtime in another
  language) does not require touching `specs/`, `contracts/`, or any provider directory - that's
  the point of §2.

## Compatibility impact

None - this is the initial choice, not a change to an existing runtime.

## Security impact

Fewer dependencies than a typical Node web framework stack reduces supply-chain surface. See
`SECURITY.md` for the currently-tracked `qs`/`body-parser` transitive advisory via `express`.

## Operational impact

`docker compose up` builds directly from source with `npm ci --omit=dev` and no compile step - see
`deploy/docker/Dockerfile`.
