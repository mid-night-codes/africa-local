# M-Pesa Tanzania (`tz-mpesa`)

Status: **experimental**. Category: mobile-money. See [provider.yaml](provider.yaml) for the full
manifest and [`approximations`](provider.yaml) for known fidelity gaps.

Not affiliated with or endorsed by Vodacom or M-Pesa. This is a local emulator for developer
testing - it never touches a real account, real money, or real credentials.

## Endpoints

```text
POST /tz/mpesa/payments
GET  /tz/mpesa/payments/{id}
```

## Try it

```bash
curl -s -X POST http://localhost:9000/tz/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000001", "amount": 50000}'
```

See [`examples/curl/`](../../../examples/curl/) for the full walkthrough including callbacks.

## Deterministic scenarios

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

[missing-callback](scenarios/missing-callback.yaml) has no default phone binding; force it with:

```bash
curl -X POST http://localhost:9000/_control/providers/tz-mpesa/scenario \
  -H "Content-Type: application/json" -d '{"scenario": "missing-callback"}'
```

## Directory layout

Follows the provider template exactly - see [`providers/_template/README.md`](../../_template/README.md)
for what each file must contain and why.

## Tests

Validated by the shared conformance suite in [`conformance/`](../../../conformance/), not by
provider-local test files - see `conformance/README.md`. `tests/` is kept as an extension point for
provider-specific fixtures if this provider ever needs one.
