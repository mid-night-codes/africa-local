import { test } from "node:test";
import assert from "node:assert/strict";
import { canTransition, applyTransition, isTerminal, INITIAL_STATE } from "./payment-state-machine.js";

test("initial state is CREATED", () => {
  assert.equal(INITIAL_STATE, "CREATED");
});

test("allows CREATED -> PENDING -> SUCCESS", () => {
  assert.ok(canTransition("CREATED", "PENDING"));
  assert.ok(canTransition("PENDING", "SUCCESS"));
});

test("rejects skipping PENDING", () => {
  assert.equal(canTransition("CREATED", "SUCCESS"), false);
  assert.throws(() => applyTransition("CREATED", "SUCCESS"), /Invalid payment transition/);
});

test("rejects transitions out of terminal states except reversal/refund", () => {
  assert.ok(isTerminal("SUCCESS"));
  assert.ok(canTransition("SUCCESS", "REVERSAL_PENDING"));
  assert.ok(canTransition("SUCCESS", "REFUND_PENDING"));
  assert.equal(canTransition("FAILED", "PENDING"), false);
});

test("rejects unknown status", () => {
  assert.throws(() => applyTransition("PENDING", "NOT_A_STATUS"), /Unknown canonical status/);
});
