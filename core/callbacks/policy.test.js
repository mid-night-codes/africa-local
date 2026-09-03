import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedCallbackUrl } from "./policy.js";

test("allows a plain http localhost URL", () => {
  assert.equal(isAllowedCallbackUrl("http://localhost:4000/callback").allowed, true);
});

test("rejects non-http protocols", () => {
  const result = isAllowedCallbackUrl("file:///etc/passwd");
  assert.equal(result.allowed, false);
  assert.match(result.reason, /not deliverable/);
});

test("rejects invalid URLs", () => {
  assert.equal(isAllowedCallbackUrl("not-a-url").allowed, false);
});

test("honors an explicit denylist", () => {
  const result = isAllowedCallbackUrl("http://blocked.example/callback", { denylist: ["blocked.example"] });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /denylisted/);
});
