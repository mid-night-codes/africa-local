# services

Reserved for service categories beyond mobile-money: SMS, USSD, identity verification, and
banking APIs. These are **Phase 5** ([ROADMAP.md](../ROADMAP.md#phase-5---community-expansion)) -
not implemented in v0.1, and intentionally so (§47 - keep v0.1 focused on mobile money).

Each subdirectory currently holds only a README sketching what that category would emulate. When
one of these is picked up for real, it should follow the same pattern as `providers/`: a
`specs/*.schema.json`-validated manifest, declarative scenarios, and a conformance suite entry -
not a bespoke architecture per category. That's a **new service category**, which per
[`rfcs/README.md`](../rfcs/README.md#when-an-rfc-is-required) requires an RFC before
implementation, since it likely means extending `specs/provider-manifest.schema.json`'s `category`
enum and possibly the canonical concepts in `specs/service-contract.md`.

| Directory | Would emulate |
|---|---|
| [`sms/`](sms/) | SMS delivery/receipt APIs (delivery reports, inbound SMS webhooks) |
| [`ussd/`](ussd/) | USSD session APIs (menu push, session continuation/timeout) |
| [`identity/`](identity/) | KYC/identity verification APIs (document/selfie checks, verification callbacks) |
| [`banking/`](banking/) | Bank transfer/statement APIs |
