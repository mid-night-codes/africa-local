# node example (planned)

Not implemented yet - see [`examples/curl/`](../curl/) for a fully working walkthrough of the same
flow (initiate -> PENDING -> callback -> SUCCESS -> duplicate-callback handling) that you can adapt
directly to `fetch`/`axios` in a real Node.js client. Contributions welcome: a small Express or
plain-Node client that POSTs to `tz-mpesa`, exposes a `/callback` receiver, and demonstrates
idempotent handling of the `x-africa-local-event-id` header.
