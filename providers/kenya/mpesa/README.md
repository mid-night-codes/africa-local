# M-Pesa Kenya (`ke-mpesa`)

Status: **experimental**. Category: mobile-money. See [provider.yaml](provider.yaml) for the full
manifest and [`approximations`](provider.yaml) for known fidelity gaps.

Not affiliated with or endorsed by Safaricom or M-Pesa. This is a local emulator for developer
testing - it never touches a real account, real money, or real credentials.

## Endpoints

```text
POST /ke/mpesa/payments
GET  /ke/mpesa/payments/{id}
```

## Try it

```bash
curl -s -X POST http://localhost:9000/ke/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "254700000001", "amount": 5000}'
```

## Deterministic scenarios

Same suffix convention as every other provider (specs/service-contract.md#deterministic-test-identities),
with Kenya's `254` MSISDN prefix:

| Phone | Scenario |
|---|---|
| 254700000001 | [success](scenarios/success.yaml) |
| 254700000002 | [insufficient-funds](scenarios/insufficient-funds.yaml) |
| 254700000003 | [user-cancelled](scenarios/user-cancelled.yaml) |
| 254700000004 | [timeout](scenarios/timeout.yaml) |
| 254700000005 | [delayed-success](scenarios/delayed-success.yaml) |
| 254700000006 | [duplicate-callback](scenarios/duplicate-callback.yaml) |
| 254700000007 | [provider-unavailable](scenarios/provider-unavailable.yaml) |
| any other number | falls back to `success` |

[missing-callback](scenarios/missing-callback.yaml) has no default phone binding; force it with:

```bash
curl -X POST http://localhost:9000/_control/providers/ke-mpesa/scenario \
  -H "Content-Type: application/json" -d '{"scenario": "missing-callback"}'
```

## Why this looks like tz-mpesa

Built entirely from [`providers/_template/`](../../_template/) plus a copy of
[`tz-mpesa`](../../tanzania/mpesa/)'s files - **zero JavaScript, zero runtime changes** were needed
to add this country. That's the point: the plugin model is meant to generalize to a new
country/provider through configuration alone. See
[`ARCHITECTURE.md#provider-plugin-model`](../../../ARCHITECTURE.md#provider-plugin-model).

## Tests

Validated by the shared conformance suite in [`conformance/`](../../../conformance/) - see
`conformance/README.md`.
