# contracts/json-schema

The authoritative JSON Schemas live in [`specs/`](../../specs/) (provider-manifest, scenario,
event-envelope, capability) and in each provider's own `schemas/` directory - they are not
duplicated here. This directory is reserved for any JSON Schema that is a genuine *contract*
between systems rather than an internal spec (for example, a future public schema for the request
history export format). Empty in v0.1.
