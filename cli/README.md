# cli

A thin wrapper around the runtime's [Control API](../runtime/api/control-routes.js) (§21). It has
no logic of its own beyond formatting requests/responses as JSON - every decision (which scenario
applies, what a provider's manifest says) is made by the runtime, never by the CLI.

## Install / run

```bash
node cli/bin/africa-local.js --help
# or, once installed as a dependency: africa-local --help
```

## Commands

```bash
africa-local start                  # start the runtime (all registered providers)
africa-local start tz-mpesa         # start the runtime with only tz-mpesa loaded
africa-local providers              # list loaded providers
africa-local providers list         # same as above
africa-local scenario tz-mpesa timeout   # force tz-mpesa's next request(s) into the timeout scenario
africa-local requests               # show recent request history
africa-local health                 # check the runtime's health endpoint
```

`AFRICA_LOCAL_URL` overrides the control API base URL (default `http://localhost:9000`).

## Note on `start <provider-id>`

Africa Local intentionally runs one process on one port for every provider (§19) rather than a
process per provider. `start <provider-id>` does not spin up a second process - it starts the same
single runtime with `ONLY_PROVIDERS` set so only that provider's routes are mounted.
