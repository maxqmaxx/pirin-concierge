# TRL 4 laboratory evidence record

**Updated 13 September 2026. Result: bounded laboratory integration observed.**

The existing reference core was exercised before application. The observations below support the stated laboratory scope; they are not formal certification or a claim of production maturity.

## Identity and reproducibility

| Item | Evidence |
|---|---|
| Repository | https://github.com/maxqmaxx/pirin-concierge |
| Existing application-source baseline | 91c782ca80181583a03bf8050651c25b6c031f8b |
| Earlier implementation | 9e40d04302043ba916c13918783af1bcb3dffbed |
| Local verification | 13 September 2026; macOS; Node v25.9.0, npm 11.12.1 |
| Installation | Fresh npm ci using the unchanged lockfile; 97 packages installed |
| Verification | npm run verify, exit 0; 28/28 tests, formatting, lint, types, OpenAPI and build |
| New process checks | Built HTTP server on loopback plus built MCP stdio child; both passed |
| MCP client/server | Official TypeScript SDK 2.0.0; observed protocol 2026-07-28 |
| Current evidence | [13 September pack](evidence/2026-09-13/README.md) |
| CI | [Workflow runs](https://github.com/maxqmaxx/pirin-concierge/actions/workflows/ci.yml) |
| Historical local verification | [6 September transcript](evidence/2026-09-06/transcript.json), [command output](evidence/2026-09-06/verify.log) |
| Historical public CI | [Run 33316553928](https://github.com/maxqmaxx/pirin-concierge/actions/runs/33316553928) on the earlier implementation |

The 13 September change adds verification tooling, CI evidence capture and documentation. Application source, catalogue, OpenAPI contract, tests and dependency lockfile remain unchanged from the cited baseline. The local transport transcript deliberately records the pre-commit HEAD and a dirty working tree, with checksums identifying the exact tested files. It is not presented as a clean checkout of a later commit.

CI uses a fresh checkout of the published revision. Its transport transcript records that exact HEAD and file checksums. Use the successful workflow run for a given commit to distinguish CI evidence from the dated local snapshot.

## Observed evidence

| Capability | Observation | Result |
|---|---|---|
| Locked installation | npm ci completed from no node_modules directory | PASS |
| Automated verification | 28 tests plus format, lint, type, contract, coverage and build gates | PASS |
| Built HTTP entry point | Separate process; loopback health response and headers verified | PASS |
| Catalogue and JSON-LD | REST retrieves the expected synthetic offer; page identifies its synthetic host as seller | PASS |
| OpenAPI | Lint and contract tests pass; built server serves OpenAPI 3.1.0 | PASS |
| MCP HTTP | Official client connects through a real loopback socket and calls all four tools | PASS |
| MCP stdio | Official client launches the built entry point and calls all four tools | PASS |
| Cross-interface handoff | Request initiated through MCP HTTP appears in the REST outbox with the same request ID | PASS |
| No payments or auto-confirmation | Both MCP transports return pending_host_confirmation, requiresHostConfirmation=true, paymentCollected=false, automaticallyConfirmed=false | PASS |
| Negative paths | Payment/confirmation fields rejected over HTTP without outbox changes; both MCP transports reject non-synthetic emails and missing offers | PASS |
| Contact minimisation | Receipt and HTTP outbox do not expose the submitted synthetic visitor email | PASS, scoped |
| Concierge grounding | In-process scenario produces three source-linked deterministic matches and an empty result for unsupported input | PASS, no LLM claim |
| Dependency audit | npm audit --audit-level=high --json reports zero vulnerabilities | PASS at audit time |
| Security assurance | Contract checks, security headers and dependency audit only; no independent penetration test or comprehensive security audit | Scope limitation |

Coverage is 87.45% of lines, 87.50% of statements, 77.44% of branches and 90.24% of functions. HTTP/stdio entry points are excluded from unit coverage and exercised by the separate process check.

## Reproduction

```bash
npm ci
npm run verify
npm run test:transports
npm run evidence:record
npm audit --audit-level=high
```

The two scenario commands emit JSON only after assertions pass and accept `--output FILE.json`. CI captures their output and the dependency audit plus coverage summary as an artifact named for the commit SHA. CI artifacts expire after 30 days; the checked-in local pack remains available in repository history.

The first local transport attempt was blocked by sandbox permission to bind 127.0.0.1. The same scenario subsequently passed with local socket permission. This is recorded as an environment limitation, not hidden as an application failure.

## Limits of the claim

- Synthetic catalogue, synthetic identities and fixed fixture dates; no available future slot is claimed.
- Deterministic retrieval; no generative-model answer quality, bias evaluation or prompt-injection evaluation has been demonstrated.
- Explicit MCP client configuration; no organic pickup by consumer assistants is claimed.
- Mock outbox only; no actual host delivery, payment, confirmed booking or regional adoption.
- Local maintainer/agent execution and automated CI, not an independent third-party assessment.
- Runtime safeguards tested here do not establish GDPR compliance or the future pilot's processing locations.
- TRL 5/6 still require authorised regional data, real host channels, appropriate AI integration, operational controls and field evaluation.

The applicant remains responsible for the TRL self-declaration and rights to the software. The SMART ERA FAQ dated 31 August requires an honest account of existing laboratory validation; it does not require a formal TRL certificate or external audit upload at application.
