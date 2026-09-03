# Adding a New Provider

This is one of the easiest contribution paths in the project (§30). Follow it in order:

1. **Open or find an issue** for the provider you want to add, so scope and country/provider
   choice are agreed before you write code.
2. **Copy this template**:
   ```bash
   cp -r providers/_template providers/<country>/<provider-slug>
   ```
3. **Fill in `provider.yaml`** - id, name, country, category, capabilities, `endpoints.basePath`,
   the scenario list, and honest `approximations`.
4. **Fill in `schemas/`** - the four required JSON Schemas for your provider's actual request and
   response shape.
5. **Fill in `mappings/statuses.yaml` and `mappings/errors.yaml`** - every canonical status needs
   an entry; every `reason` your scenarios use needs an entry.
6. **Fill in `scenarios/`** - at minimum the built-in set (see this directory's README).
7. **Run the conformance suite**:
   ```bash
   npm run test:conformance
   ```
8. **Register the provider** in [`core/registry/registry.yaml`](../../core/registry/registry.yaml)
   with `status: experimental`.
9. **Write a provider README** replacing the template one, modeled on
   [`providers/tanzania/mpesa/README.md`](../tanzania/mpesa/README.md).
10. **Open a PR** - see the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for commit message and
    review conventions. A maintainer reviews the manifest, schemas, and mappings before merge (see
    [`.github/CODEOWNERS`](../../.github/CODEOWNERS) - `providers/_template/` itself requires
    maintainer review, individual provider directories generally do not once the pattern is
    established).

```text
Provider requested
       |
       v
Issue created
       |
       v
Copy providers/_template
       |
       v
Add provider manifest
       |
       v
Add schemas
       |
       v
Add mappings
       |
       v
Add scenarios
       |
       v
Run conformance suite
       |
       v
Maintainer review
       |
       v
Add provider to registry
```

Delete `tests/.gitkeep` once you add real fixtures, or leave it if you rely entirely on the shared
conformance suite (most providers should - see `conformance/README.md`).
