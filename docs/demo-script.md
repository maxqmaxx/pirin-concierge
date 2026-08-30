# TRL 4 laboratory demo script

## Status

This is a recording and live-demonstration plan, not evidence that the steps have passed. Record observed results only from the intended release commit, and retain failures rather than editing the narrative to imply success.

Target duration: 2–3 minutes.

## Evidence header

Complete this before recording:

| Field | Value |
|---|---|
| UTC date/time | `TODO` |
| Repository | `https://github.com/maxqmaxx/pirin-concierge` (verify after creation) |
| Commit SHA | `TODO` |
| Release | `TODO: RELEASE_URL` |
| Public demo | `TODO: DEMO_URL` or `local laboratory run` |
| Node/npm versions | `TODO` |
| MCP SDK/version | `TODO` |
| MCP client/version | `TODO` |
| MCP transport | `TODO` |
| Data version/checksum | `TODO` |

Use a clean screen and synthetic identities. Disable unrelated notifications and inspect every visible browser tab, terminal history, environment variable, account avatar, email address, and request payload before recording.

## Preflight

From a clean clone of the exact release commit:

```bash
npm ci
npm test
npm run dev
```

For a local stdio MCP demonstration:

```bash
npm run mcp:stdio
```

Capture the unedited command results or link the corresponding CI run. If a command fails, stop and record the failure in the evidence report; do not present the release as verified.

## Recording sequence

### 0:00–0:20 — Scope and provenance

Show the repository landing page, commit SHA, release tag, and status notice.

Suggested narration:

> “Pirin Concierge is an application-stage laboratory demonstrator using synthetic data. It exposes rural experience discovery through REST/OpenAPI, JSON-LD, and MCP. It creates requests only: the independent host remains the seller, confirms availability, and handles any later payment directly.”

Do not claim EU funding, SMART ERA endorsement, production readiness, or completed regional validation.

### 0:20–0:45 — Reproducible catalogue

Show:

- the synthetic-data notice;
- the test/validation summary tied to the commit;
- a catalogue page or `GET /api/v1/experiences` response;
- representative records from multiple Pirin localities.

Point out stable identifiers and `synthetic: true` where exposed. Do not show real host details or copied photographs.

### 0:45–1:10 — OpenAPI and JSON-LD

Open `openapi/openapi.yaml` or generated API documentation and execute a read-only catalogue request. Then inspect one experience page's JSON-LD.

Verify on screen that:

- the JSON-LD is parseable;
- the experience/offer refers to the same catalogue identifier;
- `Offer.seller` is the synthetic host, not Pirin Concierge;
- no payment or confirmed-booking action is advertised.

### 1:10–1:55 — Explicit MCP connection

Show the MCP Inspector or another standards-compliant client configuration so it is clear that the client is explicitly connected to Pirin Concierge. State the client, version, transport, and server commit.

Demonstrate:

1. tool discovery listing all four expected tools;
2. `search_experiences` with a rural-interest query;
3. `get_experience` for one returned stable identifier;
4. `list_by_area` for a supported locality.

Show that results cite or include catalogue record identifiers. Do not describe the behaviour as automatic discovery by ChatGPT or another general-purpose client.

### 1:55–2:30 — Request-only hand-off

Call `initiate_booking_request` with a fixed synthetic visitor identity and an experience from the preceding result. Show the mock outbox receiving it.

Keep this result visible:

```json
{
  "status": "pending_host_confirmation",
  "requiresHostConfirmation": true,
  "paymentCollected": false,
  "automaticallyConfirmed": false
}
```

State that the action is an expression of interest. The host must confirm outside the demonstrator, and no money or payment credential is processed.

### 2:30–2:55 — Evidence and limitations

Return to the evidence matrix and show the exact CI run/release links. Summarise:

- laboratory and synthetic-data boundary;
- tested interfaces;
- no payment/automatic confirmation;
- TRL 5/6 remain future controlled regional validation and demonstration work.

## Required captures

Retain alongside the release:

- H.264 video with readable text and no personal data;
- captions and plain-text transcript;
- representative screenshots;
- exact commands and outputs;
- MCP client trace with secrets removed;
- OpenAPI and schema-validation reports;
- checksums for downloadable evidence assets;
- commit SHA and immutable release URL.

## Observation log

| Step | Expected | Observed | Evidence URL/file | Result |
|---|---|---|---|---|
| Clean install | Dependencies resolve from lockfile | `TODO` | `TODO` | Not run |
| Test suite | All mandatory checks pass | `TODO` | `TODO` | Not run |
| Catalogue | Synthetic records display and validate | `TODO` | `TODO` | Not run |
| OpenAPI | Contract parses and request succeeds | `TODO` | `TODO` | Not run |
| JSON-LD | Host is `Offer.seller` | `TODO` | `TODO` | Not run |
| MCP | Handshake/list/call succeeds for four tools | `TODO` | `TODO` | Not run |
| Booking request | Mock outbox receives request-only hand-off | `TODO` | `TODO` | Not run |
| Negative check | No payment or auto-confirm route/tool | `TODO` | `TODO` | Not run |

Replace “Not run” only after executing the release commit. The completed log should be copied or linked from [`trl4-evidence.md`](trl4-evidence.md).
