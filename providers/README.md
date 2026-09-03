# providers

Every emulated service is a directory here: manifest + schemas + mappings + scenarios, discovered
and validated at runtime by [`runtime/plugin-loader`](../runtime/plugin-loader/). See
[`specs/service-contract.md`](../specs/service-contract.md) for the vocabulary and
[`_template/`](_template/) for how to add one.

```text
providers/
├── _template/              copy this to start a new provider
└── tanzania/
    ├── mpesa/               tz-mpesa - experimental
    └── airtel-money/        tz-airtel-money - experimental
```

The central list of every provider and its maturity lives in
[`core/registry/registry.yaml`](../core/registry/registry.yaml), not here - a provider directory
existing on disk does not by itself mean it's registered or discoverable in a given deployment.

## Adding a provider

See [`_template/CONTRIBUTING.md`](_template/CONTRIBUTING.md) - copy the template, fill in the
manifest/schemas/mappings/scenarios, run `npm run test:conformance`, register it, done.
