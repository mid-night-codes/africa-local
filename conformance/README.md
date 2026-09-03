# Conformance Suite

Reusable tests every current and future provider is held to (§24). Nothing here is specific to
`tz-mpesa` or `tz-airtel-money` - each test either iterates `runtime/plugin-loader/discoverProviderDirs()`
or `loadProviders()` and applies the same checks to whatever it finds, so adding a provider gets
you conformance coverage for free.

```bash
npm run test:conformance
```

| Directory | Verifies |
|---|---|
| [`provider/`](provider/) | Manifest validity, required schemas present and compiling, declared scenarios exist, capability sanity, `mappings/statuses.yaml` completeness, `mappings/errors.yaml` completeness, registry membership. |
| [`scenarios/`](scenarios/) | Every phone-mapped scenario: synchronous response conforms to `initiate-response.json`, final state conforms to `status-response.json`, delivered callbacks conform to `callback.json`, `dropCallback`/`duplicateCallback` determinism, and that malformed requests are rejected with 400. |
| [`callbacks/`](callbacks/) | Callback history recording and `/_control/callbacks/{id}/replay` actually redelivering a previously dropped callback. |
| [`api/`](api/) | Control API surface: health, provider listing, request history, 404 on unknown provider paths. |
| [`helpers/`](helpers/) | `test-server.js` boots the real runtime app on an ephemeral port; `callback-sink.js` is a disposable HTTP server used as a `callbackUrl` target. |

## Timing

Scenario delays (e.g. `delayed-success`'s 30s) are shrunk via the `timeScale` option / the
`AFRICA_LOCAL_TIME_SCALE` env var (see [`runtime/README.md`](../runtime/README.md)) so the whole
suite runs in seconds, not minutes, while the scenario files themselves keep realistic delay
values for local manual testing.

## Adding a provider? You get this for free

If `providers/<country>/<slug>/provider.yaml` validates and your scenarios/mappings/schemas follow
the template's conventions, every test in this directory runs against your provider automatically
the next time `npm run test:conformance` runs - no new test file needed.
