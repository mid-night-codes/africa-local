# curl example

The minimal way to see Africa Local work end to end, with no client code at all.

## Prerequisites

```bash
docker compose up
# or: npm run setup && npm start
```

## 1. Health check

```bash
curl -s http://localhost:9000/_control/health
```

## 2. Initiate a payment (golden path)

```bash
curl -s -X POST http://localhost:9000/tz/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000001", "amount": 50000}'
```

You get back `PENDING` immediately - this is intentionally asynchronous, matching how a real
mobile-money STK push works.

## 3. Receive PENDING, then poll or wait for the callback

Poll:

```bash
curl -s http://localhost:9000/tz/mpesa/payments/<transactionId>
```

Or supply a `callbackUrl` up front and run [`callback-sink.js`](callback-sink.js) to actually
receive the callback:

```bash
node examples/curl/callback-sink.js &        # listens on :4000, prints every callback it receives

curl -s -X POST http://localhost:9000/tz/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000001", "amount": 50000, "callbackUrl": "http://host.docker.internal:4000/callback"}'
```

(Use `http://localhost:4000/callback` instead of `host.docker.internal` if you're running the
runtime with `npm start` rather than Docker.)

## 4. Mark payment SUCCESS

The callback sink prints the `SUCCESS` payload once the (short, scenario-defined) delay elapses.
The same result is visible via `GET /tz/mpesa/payments/<transactionId>`.

## 5. Handle a duplicate callback safely

```bash
curl -s -X POST http://localhost:9000/tz/mpesa/payments \
  -H "Content-Type: application/json" \
  -d '{"phone": "255700000006", "amount": 50000, "callbackUrl": "http://localhost:4000/callback"}'
```

The sink will print two deliveries with the **same** `x-africa-local-event-id` header - a correct
client deduplicates on that header (or on the JSON body's `transactionId` + `status` pair) rather
than assuming exactly-once delivery.

## 6. Try the other built-in scenarios

```bash
curl -s -X POST http://localhost:9000/tz/mpesa/payments -H "Content-Type: application/json" -d '{"phone":"255700000002","amount":1000}'  # insufficient-funds
curl -s -X POST http://localhost:9000/tz/mpesa/payments -H "Content-Type: application/json" -d '{"phone":"255700000003","amount":1000}'  # user-cancelled
curl -s -X POST http://localhost:9000/tz/mpesa/payments -H "Content-Type: application/json" -d '{"phone":"255700000004","amount":1000}'  # timeout
curl -s -X POST http://localhost:9000/tz/mpesa/payments -H "Content-Type: application/json" -d '{"phone":"255700000007","amount":1000}'  # provider-unavailable
```

Or force any scenario regardless of phone:

```bash
curl -X POST http://localhost:9000/_control/providers/tz-mpesa/scenario \
  -H "Content-Type: application/json" -d '{"scenario": "timeout"}'
```

## Run the whole thing as one script

```bash
bash examples/curl/curl-demo.sh
```

See [`curl-demo.sh`](curl-demo.sh) for a scripted version of steps 1-5 that starts its own
callback sink and exits non-zero if anything doesn't behave as documented.
