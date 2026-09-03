# Contributing as an AI Agent

Read [AGENTS.md](../AGENTS.md) first - it defines the context hierarchy and the required
workflow. This file adds the PR-specific checklist referenced from there.

## Workflow

```text
Understand issue
      |
      v
Locate affected provider/service
      |
      v
Read specification (specs/service-contract.md, the relevant specs/*.schema.json)
      |
      v
Read schemas/mappings (provider's schemas/*.json, mappings/*.yaml)
      |
      v
Check conformance tests (conformance/README.md)
      |
      v
Identify smallest change
      |
      v
Implement
      |
      v
Validate (npm run validate && npm test && npm run test:conformance)
      |
      v
Inspect diff (git diff)
      |
      v
Update documentation
      |
      v
Prepare PR summary
```

## Self-review checklist

Before proposing a PR, confirm all of the following:

- [ ] I read the README of every directory I changed.
- [ ] I read the relevant `specs/*.schema.json` or `specs/service-contract.md` section before
      writing provider-facing code or YAML.
- [ ] If I touched a provider, I read its `provider.yaml` and did not add a capability it doesn't
      declare, or declare a capability it doesn't implement.
- [ ] I did not invent a real provider's response code/field/behavior without an authoritative
      source. Where I approximated, I documented it in `provider.yaml#approximations`.
- [ ] I did not put provider-specific logic in JavaScript where a declarative
      `scenarios/*.yaml`/`mappings/*.yaml` entry would do (§53).
- [ ] I ran `npm run validate`, `npm test`, and (if applicable) `npm run test:conformance`, and
      they pass.
- [ ] `git diff` contains only files relevant to this task - no incidental reformatting, no
      unrelated file touches.
- [ ] No credentials, tokens, or real customer data were added (`SECURITY.md`).
- [ ] No generated/derived file was hand-edited directly (see `ARCHITECTURE.md` for what, if
      anything, is generated).
- [ ] Documentation (README, provider README, or an ADR/RFC) reflects the change.
- [ ] If this is a breaking provider-contract change, a plugin-architecture change, a new service
      category, or another item in `rfcs/README.md#when-an-rfc-is-required`, I opened an RFC
      instead of (or before) a PR.

## PR summary format

Structure your PR description as:

1. **What** changed, in one or two sentences.
2. **Why**, linking the issue if one exists.
3. **Approximations or assumptions**, explicitly, or "None."
4. **Validation performed** - which of the commands above you ran and that they passed.
