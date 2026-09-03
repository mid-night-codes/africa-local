#!/usr/bin/env bash
# Scripted version of README.md's steps 1-5. Assumes the runtime is already running at
# ${AFRICA_LOCAL_URL:-http://localhost:9000}. Starts its own callback sink on ${SINK_PORT:-4100}.
set -euo pipefail

BASE_URL="${AFRICA_LOCAL_URL:-http://localhost:9000}"
SINK_PORT="${SINK_PORT:-4100}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== 1. health =="
curl -sf "$BASE_URL/_control/health"
echo

echo "== starting callback sink on :$SINK_PORT =="
PORT="$SINK_PORT" node "$SCRIPT_DIR/callback-sink.js" > /tmp/africa-local-demo-sink.log 2>&1 &
SINK_PID=$!
trap 'kill "$SINK_PID" 2>/dev/null || true' EXIT
sleep 0.5

echo "== 2/3. initiate golden-path payment with a callback =="
RESP=$(curl -sf -X POST "$BASE_URL/tz/mpesa/payments" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"255700000001\", \"amount\": 50000, \"callbackUrl\": \"http://localhost:$SINK_PORT/callback\"}")
echo "$RESP"
TX_ID=$(node -e "console.log(JSON.parse(process.argv[1]).transactionId)" "$RESP")
[ "$(node -e "console.log(JSON.parse(process.argv[1]).status)" "$RESP")" = "PENDING" ] || { echo "expected PENDING"; exit 1; }

echo "== waiting for settlement + callback =="
sleep 2

echo "== 4. status query shows SUCCESS =="
STATUS_RESP=$(curl -sf "$BASE_URL/tz/mpesa/payments/$TX_ID")
echo "$STATUS_RESP"
[ "$(node -e "console.log(JSON.parse(process.argv[1]).status)" "$STATUS_RESP")" = "SUCCESS" ] || { echo "expected SUCCESS"; exit 1; }
grep -q "SUCCESS" /tmp/africa-local-demo-sink.log || { echo "expected a callback to have been received"; exit 1; }
echo "callback received:"
cat /tmp/africa-local-demo-sink.log

echo "== 5. duplicate-callback scenario delivers twice with the same eventId =="
: > /tmp/africa-local-demo-sink.log
curl -sf -X POST "$BASE_URL/tz/mpesa/payments" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"255700000006\", \"amount\": 50000, \"callbackUrl\": \"http://localhost:$SINK_PORT/callback\"}" > /dev/null
sleep 2
COUNT=$(grep -c "eventId=" /tmp/africa-local-demo-sink.log)
[ "$COUNT" -ge 2 ] || { echo "expected at least 2 deliveries, got $COUNT"; cat /tmp/africa-local-demo-sink.log; exit 1; }
EVENT_IDS=$(grep -o "eventId=[a-f0-9-]*" /tmp/africa-local-demo-sink.log | sort -u | wc -l | tr -d ' ')
[ "$EVENT_IDS" -eq 1 ] || { echo "expected a single distinct eventId across duplicate deliveries, got $EVENT_IDS"; exit 1; }

echo
echo "All good."
