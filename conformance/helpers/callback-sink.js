import http from "node:http";

/**
 * A tiny HTTP server that records every callback POSTed to it, for use as a `callbackUrl` target
 * in conformance/integration tests. Real assertions belong to the caller - this just captures.
 */
export function startCallbackSink() {
  const received = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received.push({
        headers: req.headers,
        body: body ? JSON.parse(body) : null,
        eventId: req.headers["x-africa-local-event-id"],
        attempt: Number(req.headers["x-africa-local-attempt"]),
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}/callback`,
        received,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
