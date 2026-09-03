#!/usr/bin/env node
// Requires every commit message to reference a GitHub issue (e.g. "#123"), so project history
// and changelogs stay traceable to a tracked unit of work - see
// adr/0003-commit-message-and-issue-traceability.md. Enforced twice, deliberately with the same
// logic both times: locally by .husky/commit-msg (per commit, before it's even made) and in CI by
// .github/workflows/commit-messages.yml (per commit in a PR's range, as a safety net for commits
// made without the hook installed, e.g. via the GitHub web UI, or with --no-verify).
//
// This script only checks for a reference - it never creates an issue. If none exists yet,
// create one yourself (`gh issue create` or the GitHub UI) and reference it, or set
// SKIP_ISSUE_CHECK=1 for the rare legitimate exception (documented in CONTRIBUTING.md).
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ISSUE_REFERENCE = /#\d+/;
const MERGE_COMMIT = /^Merge /;

export function stripCommentLines(message) {
  return message
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");
}

/** Pure check, unit-tested in require-issue-reference.test.js. */
export function checkMessage(rawMessage) {
  const message = stripCommentLines(rawMessage).trim();
  if (message === "") return true; // nothing to check - git itself will refuse an empty message
  if (MERGE_COMMIT.test(message)) return true;
  return ISSUE_REFERENCE.test(message);
}

const GUIDANCE = `
Every commit must reference the GitHub issue it's part of (e.g. "#123"), so history and
changelogs stay traceable - see CONTRIBUTING.md#commit-messages.

If no issue exists yet, create one first:

  gh issue create --title "..." --body "..."
  # or open one at https://github.com/<owner>/<repo>/issues/new

then reference it in your commit message, e.g. as a trailer:

  feat(provider): add ke-mpesa timeout scenario

  Refs: #123

To bypass in a rare, legitimate case (e.g. a merge commit git generated unusually, or an initial
scaffolding commit with no tracked issue yet): SKIP_ISSUE_CHECK=1 git commit ...
`;

function checkRange(base, head) {
  const shas = execFileSync("git", ["log", "--format=%H", `${base}..${head}`], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

  let failed = false;
  for (const sha of shas) {
    const message = execFileSync("git", ["log", "-1", "--format=%B", sha], { encoding: "utf8" });
    if (!checkMessage(message)) {
      failed = true;
      console.error(`FAIL ${sha.slice(0, 7)}: ${message.split("\n")[0]}`);
    }
  }

  if (failed) {
    console.error(GUIDANCE);
    return 1;
  }
  console.log(`OK   every commit in ${base}..${head} references an issue`);
  return 0;
}

function checkFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  if (!checkMessage(raw)) {
    console.error(GUIDANCE);
    return 1;
  }
  return 0;
}

function main() {
  if (process.env.SKIP_ISSUE_CHECK === "1") {
    console.warn("SKIP_ISSUE_CHECK=1 set - skipping the issue-reference check.");
    return 0;
  }

  const args = process.argv.slice(2);
  if (args[0] === "--range") {
    const [, base, head] = args;
    if (!base || !head) {
      console.error("Usage: require-issue-reference.js --range <base-sha> <head-sha>");
      return 2;
    }
    return checkRange(base, head);
  }

  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: require-issue-reference.js <commit-message-file> | --range <base> <head>");
    return 2;
  }
  return checkFile(filePath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
