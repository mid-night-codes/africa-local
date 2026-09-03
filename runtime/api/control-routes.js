import { Router } from "express";

/**
 * Control API (§18) - kept under /_control and strictly separate from provider endpoints. Every
 * interface (CLI, future desktop UI, CI, tests) talks to this same surface; no business logic
 * lives in any of those callers.
 */
export function createControlRouter({ providers, requestHistory, callbackHistory, callbackEngine, forcedScenarios, startedAt }) {
  const router = Router();
  const byId = new Map(providers.map((p) => [p.id, p]));

  router.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptimeMs: Date.now() - startedAt,
      providerCount: providers.length,
      providers: providers.map((p) => p.id),
    });
  });

  router.get("/providers", (req, res) => {
    res.json(
      providers.map((p) => ({
        id: p.id,
        name: p.manifest.name,
        country: p.manifest.country,
        category: p.manifest.category,
        status: p.manifest.status,
        version: p.manifest.version,
        basePath: p.manifest.endpoints.basePath,
        capabilities: p.manifest.capabilities,
        scenarios: p.manifest.scenarios,
      })),
    );
  });

  router.get("/providers/:id", (req, res) => {
    const provider = byId.get(req.params.id);
    if (!provider) return res.status(404).json({ error: "not_found" });
    res.json({ manifest: provider.manifest, activeScenario: forcedScenarios.get(provider.id) ?? null });
  });

  router.post("/providers/:id/scenario", (req, res) => {
    const provider = byId.get(req.params.id);
    if (!provider) return res.status(404).json({ error: "not_found" });
    const { scenario } = req.body ?? {};
    if (scenario === null || scenario === undefined) {
      forcedScenarios.delete(provider.id);
      return res.json({ providerId: provider.id, activeScenario: null });
    }
    if (!provider.manifest.scenarios.includes(scenario)) {
      return res.status(400).json({ error: "unknown_scenario", knownScenarios: provider.manifest.scenarios });
    }
    forcedScenarios.set(provider.id, scenario);
    res.json({ providerId: provider.id, activeScenario: scenario });
  });

  router.get("/scenarios", (req, res) => {
    const providerId = req.query.provider;
    const list = providerId ? providers.filter((p) => p.id === providerId) : providers;
    res.json(
      Object.fromEntries(list.map((p) => [p.id, p.scenarios.map((s) => ({ name: s.name, description: s.description ?? null }))])),
    );
  });

  router.get("/requests", (req, res) => {
    res.json(requestHistory.list());
  });

  router.get("/requests/:id", (req, res) => {
    const entry = requestHistory.get(req.params.id);
    if (!entry) return res.status(404).json({ error: "not_found" });
    res.json(entry);
  });

  router.get("/callbacks", (req, res) => {
    res.json(callbackHistory.list());
  });

  router.post("/callbacks/:eventId/replay", async (req, res) => {
    const record = callbackHistory.latestForEvent(req.params.eventId);
    if (!record) return res.status(404).json({ error: "not_found" });
    const replayed = await callbackEngine.replay(record);
    res.json(replayed);
  });

  return router;
}
