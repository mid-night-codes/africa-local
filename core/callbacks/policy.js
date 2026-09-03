/**
 * Callback destination policy. Africa Local is a local development tool - the whole point of
 * "callbacks" is that they land on the developer's own machine (localhost, a Docker service
 * name, a tunnel like ngrok), so we do NOT block private/loopback addresses by default the way a
 * production webhook sender would. We do apply the minimum SSRF-relevant guardrails documented in
 * SECURITY.md:
 *
 *  - only http/https are deliverable protocols (no file:, gopher:, etc.)
 *  - an operator-supplied denylist (AFRICA_LOCAL_CALLBACK_DENYLIST, comma-separated hostnames)
 *    is always honored, for CI/shared environments that want to lock this down
 */
export function isAllowedCallbackUrl(rawUrl, { denylist = readDenylistFromEnv() } = {}) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "not a valid absolute URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { allowed: false, reason: `protocol ${url.protocol} is not deliverable` };
  }

  if (denylist.includes(url.hostname)) {
    return { allowed: false, reason: `host ${url.hostname} is denylisted` };
  }

  return { allowed: true };
}

function readDenylistFromEnv() {
  const raw = process.env.AFRICA_LOCAL_CALLBACK_DENYLIST;
  if (!raw) return [];
  return raw.split(",").map((h) => h.trim()).filter(Boolean);
}
