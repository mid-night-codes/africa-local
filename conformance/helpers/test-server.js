import { createApp } from "../../runtime/api/server.js";

/** Boots the runtime app on an ephemeral port for conformance/integration tests. */
export function startTestApp(options = {}) {
  const built = createApp(options);
  return new Promise((resolve) => {
    const server = built.app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        ...built,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () =>
          new Promise((r) => {
            built.callbackEngine.stopAll();
            server.close(r);
          }),
      });
    });
  });
}
