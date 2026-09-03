/**
 * Pure scenario matching. Takes the list of scenario definitions a provider declares
 * (already loaded + schema-validated by runtime/plugin-loader) and a canonical request,
 * and returns the scenario that applies - or null if none match, in which case the
 * caller should fall back to a default success behavior (see specs/service-contract.md).
 *
 * Deliberately data-driven: no phone number or scenario name is hardcoded here or in
 * runtime/ - everything comes from each provider's scenarios/*.yaml `match` block.
 */

/**
 * @param {Array<import('./types').Scenario>} scenarios
 * @param {{phone?: string, amount?: number}} canonicalRequest
 * @param {string} [forcedScenarioName] - set via POST /_control/providers/{id}/scenario
 */
export function matchScenario(scenarios, canonicalRequest, forcedScenarioName) {
  if (forcedScenarioName) {
    const forced = scenarios.find((s) => s.name === forcedScenarioName);
    if (forced) return forced;
  }

  for (const scenario of scenarios) {
    if (matches(scenario.match, canonicalRequest)) {
      return scenario;
    }
  }

  return null;
}

function matches(match, request) {
  if (match.phone !== undefined && match.phone !== request.phone) return false;
  if (match.phonePattern !== undefined) {
    const re = new RegExp(match.phonePattern);
    if (!request.phone || !re.test(request.phone)) return false;
  }
  if (match.amountAbove !== undefined && !(request.amount > match.amountAbove)) return false;
  if (match.amountBelow !== undefined && !(request.amount < match.amountBelow)) return false;
  return true;
}

/** Parses a duration string like "30s", "2m", "500ms" into milliseconds. */
export function parseDuration(value) {
  if (value === undefined || value === null) return 0;
  const match = /^(\d+)(ms|s|m)$/.exec(value);
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const [, amount, unit] = match;
  const n = Number(amount);
  if (unit === "ms") return n;
  if (unit === "s") return n * 1000;
  return n * 60 * 1000;
}
