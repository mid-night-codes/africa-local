# runtime

The single Node.js process that serves every provider on one port (§19). This is the only layer
allowed to know about HTTP, Express, and the on-disk layout of [`providers/`](../providers/) - the
CLI, tests, and any future desktop UI all talk to it over HTTP, never by importing its internals.

| Module | Responsibility |
|---|---|
| [`plugin-loader/`](plugin-loader/) | Discovers `providers/**/provider.yaml`, validates each against `specs/`, compiles request/response schema validators. |
| [`engine/`](engine/) | `pipeline.js` implements the explicit request pipeline from ARCHITECTURE.md#pipeline; `response-mapping.js` applies a provider's `mappings/*.yaml`. |
| [`request-history/`](request-history/) | Bounded in-memory stores for request history (§17) and callback delivery history (§16). |
| [`api/`](api/) | Express wiring: `server.js` assembles the app, `control-routes.js` implements `/_control/*` (§18). |

## Running

```bash
node runtime/index.js
# or: npm start
```

Environment variables:

- `PORT` (default `9000`)
- `ONLY_PROVIDERS` - comma-separated provider ids to load, e.g. `ONLY_PROVIDERS=tz-mpesa`. Used by
  `africa-local start <provider-id>` (see [../cli/README.md](../cli/README.md)) since v0.1
  intentionally runs one process for every provider rather than one process per provider (§19).
- `AFRICA_LOCAL_TIME_SCALE` - multiplies every scenario's `callbackDelay`. Defaults to `1`. Used by
  the conformance suite to run realistic delays (e.g. `delayed-success`'s 30s) in milliseconds
  during CI.
- `AFRICA_LOCAL_CALLBACK_DENYLIST` - comma-separated hostnames the callback engine will refuse to
  deliver to, see [`core/callbacks/policy.js`](../core/callbacks/policy.js) and `SECURITY.md`.

## Pipeline

```text
incoming request
      |
      v
identify provider (path prefix -> manifest.endpoints.basePath)
      |
      v
validate request against provider's initiate-request schema
      |
      v
determine scenario (core/scenarios matcher, phone/amount match, or forced via /_control)
      |
      v
execute canonical scenario (core/payments state transition)
      |
      v
map canonical result to provider response (mappings/statuses.yaml, mappings/errors.yaml)
      |
      v
schedule callback if capabilities.callbacks && callbackUrl present (core/callbacks)
      |
      v
record request history
      |
      v
return response
```
