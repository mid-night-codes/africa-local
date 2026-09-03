import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMessage, stripCommentLines } from "./require-issue-reference.js";

test("passes when the subject line references an issue", () => {
  assert.equal(checkMessage("fix(runtime): prevent duplicate callback scheduling (#42)"), true);
});

test("passes when a footer trailer references an issue", () => {
  assert.equal(checkMessage("feat(provider): add ke-mpesa timeout scenario\n\nRefs: #123"), true);
});

test("passes for Closes/Fixes-style trailers", () => {
  assert.equal(checkMessage("fix(core): correct state transition\n\nFixes #7"), true);
});

test("fails when there is no issue reference anywhere", () => {
  assert.equal(checkMessage("fix(runtime): prevent duplicate callback scheduling"), false);
});

test("does not count a stray '#' with no digits as a reference", () => {
  assert.equal(checkMessage("docs: explain the # symbol in scenario matchers"), false);
});

test("always passes for merge commits", () => {
  assert.equal(checkMessage("Merge branch 'feature/x' into main"), true);
});

test("passes for an empty message (git itself rejects empty messages separately)", () => {
  assert.equal(checkMessage(""), true);
});

test("ignores git-generated comment lines when checking", () => {
  const withComments = [
    "fix(core): correct state transition",
    "",
    "Refs: #99",
    "# Please enter the commit message for your changes.",
    "# On branch main",
    "# Changes to be committed:",
    "#\tmodified:   core/events/payment-state-machine.js",
  ].join("\n");
  assert.equal(checkMessage(withComments), true);
});

test("a reference only inside a comment line does not count", () => {
  const commentOnly = ["fix(core): correct state transition", "", "# see issue #99 for context"].join("\n");
  assert.equal(checkMessage(commentOnly), false);
});

test("stripCommentLines removes only lines starting with #", () => {
  assert.equal(stripCommentLines("keep this\n# drop this\nkeep #123 too"), "keep this\nkeep #123 too");
});
