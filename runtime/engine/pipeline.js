import { randomUUID } from "node:crypto";
import { matchScenario, parseDuration } from "../../core/scenarios/index.js";
import { mapCanonicalResult } from "./response-mapping.js";

const DEFAULT_BEHAVIOR = { initialStatus: "PENDING", finalStatus: "SUCCESS" };

/**
 * The explicit request-processing pipeline described in ARCHITECTURE.md#pipeline (§20):
 *
 *   incoming request -> validate against provider schema -> determine scenario ->
 *   execute canonical scenario -> map result to provider response -> schedule callback ->
 *   record request history -> return response
 *
 * Framework-agnostic: takes plain objects in, returns a plain {httpStatus, body} out. The Express
 * wiring lives entirely in runtime/api/server.js.
 */
export function createPipeline({ paymentStore, callbackEngine, requestHistory, forcedScenarios, timeScale = 1 }) {
  function initiatePayment(provider, { headers, body }) {
    const requestId = randomUUID();
    const startedAt = Date.now();

    const validateRequest = provider.validators["initiate-request"];
    if (!validateRequest(body)) {
      const result = respond(400, {
        error: "invalid_request",
        details: validateRequest.errors.map((e) => `${e.instancePath} ${e.message}`.trim()),
      });
      recordHistory({ requestId, provider, method: "POST", path: `${provider.manifest.endpoints.basePath}/payments`, headers, body, result, startedAt });
      return result;
    }

    const canonicalRequest = { phone: body.phone, amount: body.amount };
    const forced = forcedScenarios.get(provider.id);
    const scenario = matchScenario(provider.scenarios, canonicalRequest, forced);
    const behavior = scenario?.behavior ?? DEFAULT_BEHAVIOR;

    const payment = paymentStore.create({
      providerId: provider.id,
      phone: body.phone,
      amount: body.amount,
      scenarioName: scenario?.name ?? null,
    });
    const resolvesImmediately = behavior.initialStatus === behavior.finalStatus;
    const initialReason = resolvesImmediately ? behavior.reason : undefined;
    paymentStore.transition(payment.id, behavior.initialStatus, initialReason);

    if (!resolvesImmediately) {
      const delayMs = parseDuration(behavior.callbackDelay) * timeScale;
      setTimeout(() => {
        paymentStore.transition(payment.id, behavior.finalStatus, behavior.reason);
        if (provider.manifest.capabilities.callbacks && body.callbackUrl) {
          callbackEngine.schedule({
            providerId: provider.id,
            correlationId: payment.id,
            requestId,
            callbackUrl: body.callbackUrl,
            behavior: { ...behavior, callbackDelay: undefined },
            data: { status: behavior.finalStatus, reason: behavior.reason },
            buildPayload: (event) => buildCallbackPayload(provider, payment.id, event.data.status, event.data.reason),
          });
        }
      }, delayMs);
    }

    const mapped = mapCanonicalResult(provider.mappings, behavior.initialStatus, initialReason);
    const responseBody = {
      transactionId: payment.id,
      status: behavior.initialStatus,
      ...mapped,
      ...(behavior.responsePayloadOverride ?? {}),
    };
    const result = respond(behavior.httpStatus ?? 202, responseBody);
    recordHistory({ requestId, provider, method: "POST", path: `${provider.manifest.endpoints.basePath}/payments`, headers, body, result, scenarioName: scenario?.name, startedAt });
    return result;
  }

  function getPaymentStatus(provider, headers, paymentId) {
    const startedAt = Date.now();
    const payment = paymentStore.get(paymentId);
    let result;
    if (!payment || payment.providerId !== provider.id) {
      result = respond(404, { error: "not_found" });
    } else {
      const mapped = mapCanonicalResult(provider.mappings, payment.status, payment.reason);
      result = respond(200, { transactionId: payment.id, status: payment.status, ...mapped });
    }
    recordHistory({
      requestId: randomUUID(),
      provider,
      method: "GET",
      path: `${provider.manifest.endpoints.basePath}/payments/${paymentId}`,
      headers,
      body: undefined,
      result,
      scenarioName: payment?.scenarioName,
      startedAt,
    });
    return result;
  }

  function recordHistory({ requestId, provider, method, path, headers, body, result, scenarioName, startedAt }) {
    requestHistory.record({
      id: requestId,
      providerId: provider.id,
      method,
      path,
      headers,
      requestPayload: body,
      responsePayload: result.body,
      responseCode: result.httpStatus,
      scenarioName: scenarioName ?? null,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
  }

  return { initiatePayment, getPaymentStatus };
}

function respond(httpStatus, body) {
  return { httpStatus, body };
}

function buildCallbackPayload(provider, transactionId, status, reason) {
  const mapped = mapCanonicalResult(provider.mappings, status, reason);
  return { transactionId, status, ...mapped };
}
