import { serve } from "@hono/node-server";
import { app } from "./app.js";

function readPort(value: string | undefined): number {
  const port = Number(value ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return port;
}

const port = readPort(process.env.PORT);
const hostname = process.env.HOST ?? "127.0.0.1";

const server = serve(
  {
    fetch: app.fetch,
    hostname,
    port,
  },
  ({ address, port: listeningPort }) => {
    console.log(`Pirin Concierge listening on http://${address}:${listeningPort}`);
  },
);

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error("Failed to stop HTTP server:", error.message);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
