import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, "../../specs/state-machines/payment-lifecycle.json");

const spec = JSON.parse(readFileSync(specPath, "utf8"));

const transitionIndex = new Set(spec.transitions.map((t) => `${t.from}->${t.to}`));

export const STATES = spec.states;
export const TERMINAL_STATES = new Set(spec.terminal);
export const INITIAL_STATE = spec.initial;

export function isTerminal(status) {
  return TERMINAL_STATES.has(status);
}

export function canTransition(from, to) {
  return transitionIndex.has(`${from}->${to}`);
}

/**
 * Applies a transition, throwing if it is not allowed by specs/state-machines/payment-lifecycle.json.
 * Never silently clamps an invalid transition - that would hide scenario-engine bugs.
 */
export function applyTransition(from, to) {
  if (!STATES.includes(to)) {
    throw new Error(`Unknown canonical status: ${to}`);
  }
  if (!canTransition(from, to)) {
    throw new Error(`Invalid payment transition: ${from} -> ${to}`);
  }
  return to;
}
