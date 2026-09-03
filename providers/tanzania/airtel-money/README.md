# Airtel Money Tanzania (`tz-airtel-money`)

Status: **experimental**. Category: mobile-money. See [provider.yaml](provider.yaml) for the full
manifest and [`approximations`](provider.yaml) for known fidelity gaps.

Not affiliated with or endorsed by Airtel. This is a local emulator for developer testing - it
never touches a real account, real money, or real credentials.

## Endpoints

```text
POST /tz/airtel-money/payments
GET  /tz/airtel-money/payments/{id}
```

## Try it

```bash
curl -s -X POST http://localhost:9000/tz/airtel-money/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000001", "amount": 50000}'
```

## Deterministic scenarios

Same phone-number convention as [`tz-mpesa`](../mpesa/README.md) (specs/service-contract.md), but
mapped to Airtel-specific response codes in [`mappings/`](mappings/):

| Phone | Scenario |
|---|---|
| 255700000001 | [success](scenarios/success.yaml) |
| 255700000002 | [insufficient-funds](scenarios/insufficient-funds.yaml) |
| 255700000003 | [user-cancelled](scenarios/user-cancelled.yaml) |
| 255700000004 | [timeout](scenarios/timeout.yaml) |
| 255700000005 | [delayed-success](scenarios/delayed-success.yaml) |
| 255700000006 | [duplicate-callback](scenarios/duplicate-callback.yaml) |
| 255700000007 | [provider-unavailable](scenarios/provider-unavailable.yaml) |
| any other number | falls back to `success` |

## Why this provider looks so similar to tz-mpesa

That's deliberate, not an oversight: this provider is the proof that Africa Local's plugin model
is genuinely declarative (§53 - favor declarative configuration over provider-specific code).
`tz-airtel-money` ships with **zero JavaScript** of its own; only its `provider.yaml`, `schemas/`,
`mappings/`, and `scenarios/` differ from `tz-mpesa`. See
[`specs/service-contract.md#provider-mapping-layer`](../../../specs/service-contract.md#provider-mapping-layer).

## Tests

Validated by the shared conformance suite in [`conformance/`](../../../conformance/) - see
`conformance/README.md`.
