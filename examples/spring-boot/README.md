# spring-boot example (planned)

Not implemented yet - see [`examples/curl/`](../curl/) for a fully working walkthrough of the flow
a Spring Boot client would need to replicate: `RestTemplate`/`WebClient` call to initiate a
payment, a `@PostMapping("/callback")` receiver, and idempotent handling keyed on the
`x-africa-local-event-id` header. Contributions welcome - this is deliberately left for a
contributor who wants Spring Boot specifically, rather than guessed at here (§53 - transparent
approximation over invented fidelity).
