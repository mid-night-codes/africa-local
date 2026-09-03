## What does this PR do?

<!-- One or two sentences. -->

## Why?

<!-- Link the issue this PR is for (every commit should already reference it, see
     CONTRIBUTING.md#commit-messages - if none exists yet, open one before this PR). -->

## Type of change

- [ ] `feat` - new capability
- [ ] `fix` - bug fix
- [ ] `docs` - documentation only
- [ ] `test` - tests only
- [ ] `chore` - tooling/CI/dependencies
- [ ] Provider addition or change
- [ ] Breaking change (requires an accepted RFC - link it here)

## Checklist (see CONTRIBUTING.md#definition-of-done)

- [ ] `make validate` passes
- [ ] `make test` passes
- [ ] `make test-conformance` passes (if this touches a provider or the runtime)
- [ ] Documentation updated (README / provider README / ADR / RFC as applicable)
- [ ] `core/registry/registry.yaml` updated (if a provider's status or existence changed)
- [ ] No secrets, real credentials, or real customer data added
- [ ] No unrelated changes included
- [ ] Every commit follows Conventional Commits and references a GitHub issue (checked by CI, see
      `.github/workflows/commit-messages.yml`)

## Approximations or assumptions made

<!-- If you touched provider behavior without an authoritative source, say so explicitly here,
     per AGENTS.md item 8/9 and specs/service-contract.md. Write "None." if not applicable. -->
