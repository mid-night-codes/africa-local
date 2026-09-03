# docs/development

## Local setup

```bash
git clone <this-repo>
cd africa-local
make setup       # npm install
make validate    # schema + provider manifest + registry validation
make test        # core/runtime/cli unit tests (node:test)
make test-conformance   # provider conformance suite
make run         # npm start - runtime on :9000
```

Or via Docker: `docker compose up` (see the root [README.md](../../README.md#quick-start)).

## Repository layout

See [ARCHITECTURE.md](../../ARCHITECTURE.md) for the full picture. In short: `specs/` and
`contracts/` are the source of truth, `core/` is framework-free domain logic, `runtime/` is the
HTTP/Express layer, `providers/` holds the actual emulated services, `conformance/` tests all of
them uniformly, and `cli/` is a thin wrapper around the runtime's Control API.

## Running a single test file

```bash
node --test core/callbacks/index.test.js
node --test conformance/scenarios/scenario-behavior.test.js
```

(See `AGENTS.md` for a Node test-runner quirk with bare directory arguments that the npm scripts
work around with explicit glob patterns.)

## Debugging a scenario

1. Start the runtime: `npm start`.
2. Force the scenario you want to inspect, regardless of phone number:
   ```bash
   curl -X POST http://localhost:9000/_control/providers/tz-mpesa/scenario \
     -H "Content-Type: application/json" -d '{"scenario": "timeout"}'
   ```
3. Send a request and inspect `GET /_control/requests` and `GET /_control/callbacks` for the full
   trace.
4. Clear the override: `-d '{"scenario": null}'`.
