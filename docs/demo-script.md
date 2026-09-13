# Laboratory demonstration walkthrough

The reproducible observations are in the [13 September evidence pack](evidence/2026-09-13/README.md). This page is a walkthrough; it does not claim that a video or public deployment exists.

## Automated route

```bash
npm ci
npm run verify
npm run test:transports
npm run evidence:record
```

The transport scenario launches the built service on a disposable loopback port, checks discovery, JSON-LD and OpenAPI, rejects payment/confirmation fields, and calls all four tools with official MCP clients over real HTTP and stdio. It checks that a request created through MCP appears in the HTTP outbox. Processes are closed afterwards.

## Interactive route

```bash
npm run build
npm start
```

Open http://127.0.0.1:3000 and inspect a synthetic experience. The page identifies the synthetic host and contains JSON-LD. The API contract is served at /openapi.yaml.

An MCP client can connect explicitly to http://127.0.0.1:3000/mcp. For stdio, configure it to launch `node dist/mcp-stdio.js` from the repository directory.

1. List the tools: search_experiences, get_experience, list_by_area, initiate_booking_request.
2. Search for weaving and inspect exp-bansko-loom-patterns.
3. List offers in Banya.
4. Submit a synthetic request using a visitor email at example.com.
5. Verify pending_host_confirmation, requiresHostConfirmation=true, paymentCollected=false and automaticallyConfirmed=false.
6. For an HTTP MCP connection, inspect /api/v1/demo/outbox for the same request ID. Stdio runs in its own process and has a separate mock outbox.

A request represents interest only. The independent host remains the seller and must agree any transaction outside the demonstrator.

## Optional recording

A short recording can show the repository revision, successful CI run, synthetic catalogue, source-linked results and request receipt. State that retrieval is deterministic and the client is explicitly connected. Use synthetic inputs and omit unrelated account information.

No recording, hosted service, generative AI validation, EU funding, SMART ERA endorsement or TRL 6 field result is claimed by this walkthrough.
