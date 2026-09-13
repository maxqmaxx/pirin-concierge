// Reproduce the bounded laboratory scenario after npm ci && npm run build.
// Writes observations to stdout only. Uses synthetic data and in-process transports.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { app } from "../dist/app.js";
import { getDemoOutbox, resetDemoState } from "../dist/booking.js";
import { createPirinMcpServer } from "../dist/mcp.js";
import { writeEvidence } from "./write-evidence.mjs";

const observations = [];
async function request(path, value) {
  const response = await app.request(`http://localhost${path}`, {
    headers: { host: "localhost", ...(value ? { "content-type": "application/json" } : {}) },
    ...(value ? { method: "POST", body: JSON.stringify(value) } : {}),
  });
  assert.equal(response.status, 200);
  return response;
}
resetDemoState();
const health = await (await request("/health")).json();
observations.push({ step: "Health", status: 200, result: health });
const found = await (await request("/api/v1/experiences/search?q=weaving")).json();
assert(found.experiences.some((item) => item.id === "exp-bansko-loom-patterns"));
observations.push({ step: "REST discovery", ids: found.experiences.map((item) => item.id) });
const page = await (await request("/experiences/bansko-loom-patterns")).text();
const ld = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(ld.offers.seller.name, "Synthetic Host Bansko A");
observations.push({
  step: "JSON-LD",
  seller: ld.offers.seller,
  reservation: ld.offers.potentialAction.result,
});
const concierge = await (
  await request("/api/v1/concierge/search", { query: "craft", limit: 3 })
).json();
assert.equal(concierge.matches.length, 3);
assert(
  concierge.sources.every((source) =>
    concierge.matches.some((item) => item.experience.id === source.experienceId),
  ),
);
observations.push({
  step: "Deterministic concierge",
  answer: concierge.answer,
  sources: concierge.sources,
});
const missing = await (
  await request("/api/v1/concierge/search", { query: "zzunsupportedzz", limit: 3 })
).json();
assert.equal(missing.matches.length, 0);
observations.push({ step: "Unsupported query", answer: missing.answer, matches: 0 });

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const server = createPirinMcpServer();
const client = new Client({ name: "pirin-lab-evidence", version: "1.0.0" });
await server.connect(serverTransport);
await client.connect(clientTransport);
try {
  const listed = await client.listTools();
  assert.equal(listed.tools.length, 4);
  observations.push({
    step: "MCP handshake / list",
    transport: "InMemoryTransport",
    tools: listed.tools.map((tool) => tool.name),
  });
  for (const [name, args] of [
    ["search_experiences", { query: "weaving", limit: 3 }],
    ["get_experience", { id: "exp-bansko-loom-patterns" }],
    ["list_by_area", { area: "Banya" }],
  ]) {
    const result = await client.callTool({ name, arguments: args });
    assert(!result.isError);
    observations.push({ step: `MCP ${name}`, arguments: args, content: result.content });
  }
  const result = await client.callTool({
    name: "initiate_booking_request",
    arguments: {
      experienceId: "exp-bansko-loom-patterns",
      visitor: { displayName: "Synthetic Evidence Visitor", email: "evidence@example.com" },
      partySize: 2,
      preferredDate: "2026-09-12",
      synthetic: true,
    },
  });
  assert(!result.isError);
  const receipt = JSON.parse(result.content.find((item) => item.type === "text").text);
  assert.equal(receipt.status, "pending_host_confirmation");
  assert.equal(receipt.requiresHostConfirmation, true);
  assert.equal(receipt.paymentCollected, false);
  assert.equal(receipt.automaticallyConfirmed, false);
  assert.equal(getDemoOutbox().length, 1);
  observations.push({ step: "MCP request handoff", receipt, outbox: getDemoOutbox() });
} finally {
  await client.close();
  await server.close();
}
const checksum = (name) =>
  createHash("sha256")
    .update(readFileSync(new URL(`../${name}`, import.meta.url)))
    .digest("hex");
writeEvidence({
  timestampUTC: new Date().toISOString(),
  node: process.version,
  client: "@modelcontextprotocol/client 2.0.0",
  server: "@modelcontextprotocol/server 2.0.0",
  scope:
    "Synthetic lab; in-process HTTP and explicit MCP client; no generative model or real notification",
  sourceChecksums: Object.fromEntries(
    ["data/demo/experiences.json", "openapi/openapi.yaml", "package-lock.json"].map((name) => [
      name,
      checksum(name),
    ]),
  ),
  observations,
  result: "PASS",
});
