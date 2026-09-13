// Exercise the built entry points with real loopback HTTP and child-process stdio.
// No external model, host, mail service or real personal data is used.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { writeEvidence } from "./write-evidence.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const observations = [];
const expectedTools = [
  "get_experience",
  "initiate_booking_request",
  "list_by_area",
  "search_experiences",
];
const input = {
  experienceId: "exp-bansko-loom-patterns",
  visitor: { displayName: "Synthetic Transport Visitor", email: "transport@example.com" },
  partySize: 2,
  preferredDate: "2030-04-15", // Fixed synthetic fixture, never live availability.
  synthetic: true,
};

function receiptAssertions(receipt) {
  assert.equal(receipt.status, "pending_host_confirmation");
  assert.equal(receipt.requiresHostConfirmation, true);
  assert.equal(receipt.paymentCollected, false);
  assert.equal(receipt.automaticallyConfirmed, false);
  assert.equal(receipt.synthetic, true);
  assert(!JSON.stringify(receipt).includes(input.visitor.email));
}

async function call(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, `${name} failed`);
  const text = result.content.find((item) => item.type === "text");
  assert(text, `${name} must return a text result`);
  return JSON.parse(text.text);
}

async function exerciseMcp(transport, label) {
  const client = new Client(
    { name: "pirin-transport-verification", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), expectedTools);
    const search = await call(client, "search_experiences", { query: "weaving", limit: 3 });
    assert(search.experiences.some((item) => item.id === input.experienceId));
    const detail = await call(client, "get_experience", { id: input.experienceId });
    assert.equal(detail.experience.id, input.experienceId);
    const area = await call(client, "list_by_area", { area: "Banya" });
    assert(area.experiences.length > 0);
    assert(area.experiences.every((item) => item.settlement === "Banya"));
    const receipt = await call(client, "initiate_booking_request", input);
    receiptAssertions(receipt);
    const invalid = await client.callTool({
      name: "initiate_booking_request",
      arguments: { ...input, visitor: { ...input.visitor, email: "visitor@real-domain.invalid" } },
    });
    assert.equal(invalid.isError, true);
    const missing = await client.callTool({ name: "get_experience", arguments: { id: "missing" } });
    assert.equal(missing.isError, true);
    observations.push({
      step: label,
      protocol: client.getNegotiatedProtocolVersion(),
      tools: expectedTools,
      foundIds: search.experiences.map((item) => item.id),
      receipt,
      rejectsNonSyntheticEmail: true,
      rejectsMissingExperience: true,
    });
    return receipt;
  } finally {
    await client.close();
  }
}

async function freePort() {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

const port = await freePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["dist/server.js"], {
  cwd: root,
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), ALLOWED_HOSTS: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});
const deadline = setTimeout(() => {
  child.kill("SIGKILL");
  console.error("Transport verification exceeded 45 seconds.");
  process.exit(1);
}, 45_000);

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(5000) });
}

try {
  await new Promise((resolve, reject) => {
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes(`listening on ${baseUrl}`)) resolve();
    });
    child.once("error", reject);
    child.once("exit", (code) => reject(new Error(`HTTP child exited with ${code}: ${stderr}`)));
  });
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
  assert.equal((await health.json()).dataset, "synthetic");
  observations.push({ step: "Built HTTP entry point", host: "127.0.0.1", status: 200 });

  const search = await request("/api/v1/experiences/search?q=weaving");
  assert.equal(search.status, 200);
  assert((await search.json()).experiences.some((item) => item.id === input.experienceId));
  const page = await request("/experiences/bansko-loom-patterns");
  assert.equal(page.status, 200);
  const html = await page.text();
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  assert(match, "Experience page must include JSON-LD");
  const jsonLd = JSON.parse(match[1]);
  assert.equal(jsonLd.offers.seller.name, "Synthetic Host Bansko A");
  const openapi = await request("/openapi.yaml");
  assert.equal(openapi.status, 200);
  assert((await openapi.text()).includes("openapi: 3.1.0"));
  observations.push({ step: "HTTP discovery, JSON-LD and OpenAPI", seller: jsonLd.offers.seller });

  for (const extra of [{ payment: true }, { confirmed: true }]) {
    const rejected = await request("/api/v1/booking-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...input, ...extra }),
    });
    assert.equal(rejected.status, 400);
    assert.equal((await rejected.json()).error.code, "unknown_field");
  }
  assert.equal((await (await request("/api/v1/demo/outbox")).json()).count, 0);
  observations.push({ step: "HTTP rejects payment and confirmation fields", outboxCount: 0 });

  const receipt = await exerciseMcp(
    new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)),
    "MCP over real loopback HTTP",
  );
  const outbox = await (await request("/api/v1/demo/outbox")).json();
  assert.equal(outbox.count, 1);
  assert.equal(outbox.entries[0].requestId, receipt.id);
  assert(!JSON.stringify(outbox).includes(input.visitor.email));
  observations.push({ step: "MCP request observed through HTTP outbox", outbox });

  await exerciseMcp(
    new StdioClientTransport({
      command: process.execPath,
      args: ["dist/mcp-stdio.js"],
      cwd: root,
      stderr: "pipe",
    }),
    "MCP over built stdio child process",
  );
} finally {
  if (child.exitCode === null) {
    const exited = once(child, "exit");
    const killTimer = setTimeout(() => child.kill("SIGKILL"), 3000);
    child.kill("SIGTERM");
    await exited;
    clearTimeout(killTimer);
  }
  clearTimeout(deadline);
}

const files = [
  ...["src", "tests", "scripts"].flatMap((directory) =>
    readdirSync(new URL(`../${directory}/`, import.meta.url))
      .filter((name) => /\.(ts|mjs)$/u.test(name))
      .map((name) => `${directory}/${name}`),
  ),
  "package.json",
  "package-lock.json",
  "data/demo/experiences.json",
  "openapi/openapi.yaml",
  ".github/workflows/ci.yml",
].sort();
const checksums = Object.fromEntries(
  files.map((file) => [
    file,
    createHash("sha256")
      .update(readFileSync(new URL(`../${file}`, import.meta.url)))
      .digest("hex"),
  ]),
);
writeEvidence({
  timestampUTC: new Date().toISOString(),
  node: process.version,
  gitHead: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  workingTreeDirty:
    execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() !== "",
  scope: "Built processes; loopback HTTP and stdio; synthetic catalogue; no LLM or real host",
  sourceChecksums: checksums,
  observations,
  result: "PASS",
});
