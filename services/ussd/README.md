# services/ussd (planned - Phase 5)

Not implemented. Would emulate USSD gateway session APIs: menu push/response cycles, session
continuation, and session timeout - conceptually similar to the payment lifecycle's `PENDING` ->
`EXPIRED` transition but modeled as a menu session rather than a payment. See
[`services/README.md`](../README.md).
