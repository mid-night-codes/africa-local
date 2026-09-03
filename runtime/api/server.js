import express from "express";
import { loadProviders } from "../plugin-loader/index.js";
import { PaymentStore } from "../../core/payments/index.js";
import { CallbackEngine } from "../../core/callbacks/index.js";
import { RequestHistoryStore, CallbackHistoryStore } from "../request-history/index.js";
import { createPipeline } from "../engine/pipeline.js";
import { createControlRouter } from "./control-routes.js";

/**
 * Builds the Africa Local runtime app: one Express instance hosting every provider under its
 * manifest-declared basePath, plus the /_control surface (§19 - one runtime, one port).
 *
 * @param {{only?: string[], timeScale?: number}} [options]
 */
export function createApp({ only, timeScale = Number(process.env.AFRICA_LOCAL_TIME_SCALE ?? 1) } = {}) {
  const providers = loadProviders({ only });
  const startedAt = Date.now();

  const paymentStore = new PaymentStore();
  const requestHistory = new RequestHistoryStore();
  const callbackHistory = new CallbackHistoryStore();
  const forcedScenarios = new Map();
  const callbackEngine = new CallbackEngine({ onAttempt: (attempt) => callbackHistory.record(attempt) });
  const pipeline = createPipeline({ paymentStore, callbackEngine, requestHistory, forcedScenarios, timeScale });

  const app = express();
  app.use(express.json());

  app.use(
    "/_control",
    createControlRouter({ providers, requestHistory, callbackHistory, callbackEngine, forcedScenarios, startedAt }),
  );

  for (const provider of providers) {
    const basePath = provider.manifest.endpoints.basePath;

    app.post(`${basePath}/payments`, (req, res) => {
      const { httpStatus, body } = pipeline.initiatePayment(provider, { headers: req.headers, body: req.body });
      res.status(httpStatus).json(body);
    });

    app.get(`${basePath}/payments/:id`, (req, res) => {
      const { httpStatus, body } = pipeline.getPaymentStatus(provider, req.headers, req.params.id);
      res.status(httpStatus).json(body);
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  return { app, providers, paymentStore, requestHistory, callbackHistory, callbackEngine };
}
