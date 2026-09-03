// Enforces Conventional Commits (§29/CONTRIBUTING.md#commit-messages), checked locally by
// .husky/commit-msg and in CI by .github/workflows/commit-messages.yml. Whether a commit also
// references a GitHub issue is checked separately by scripts/require-issue-reference.js - that's
// a project-specific rule, not something commitlint's built-in rule set models cleanly.
export default {
  extends: ["@commitlint/config-conventional"],
};
