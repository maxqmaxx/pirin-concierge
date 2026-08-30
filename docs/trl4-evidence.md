# TRL 4 evidence record

## Purpose and claim discipline

This document is the auditable record for an **application-stage TRL 4 laboratory demonstrator**. It starts as a template. A design, source file, planned test, screenshot, or `TODO` is not by itself evidence that the integrated technology has been validated in a laboratory setting.

A [local pre-publication verification](evidence/local-verification-2026-08-30.md) records passing
installation, contract, MCP, API, coverage, build, dependency and secret checks. CI, release, public
deployment and independent reproduction remain pending until they can be tied to a published commit.

Do not mark the record “verified”, create a `v0.1.0-trl4` release, or cite the repository as completed TRL 4 evidence until all mandatory gates have an observed result tied to the same immutable commit.

Publication of this repository does not establish TRL 5, TRL 6, production readiness, market adoption, or SMART ERA/EU endorsement.

## Release identity

| Field | Evidence value |
|---|---|
| Repository | `https://github.com/maxqmaxx/pirin-concierge` (verify after creation) |
| Commit SHA | `TODO` |
| Tag/release | `TODO: RELEASE_URL` |
| Verification date/time (UTC) | `TODO` |
| Verifier(s) | `TODO` |
| Laboratory environment | `TODO: OS, architecture, Node/npm, container/runtime` |
| MCP server SDK/version | `TODO` |
| MCP client/version/transport | `TODO` |
| Demo-data version/checksum | `TODO` |
| CI run | `TODO: CI_RUN_URL` |
| Deployment | `TODO: DEMO_URL` or `not used; local laboratory evidence only` |
| Video/transcript | `TODO: VIDEO_URL / TRANSCRIPT_URL` |

Current status: **NOT YET VERIFIED — evidence placeholders remain.**

## Claim under evaluation

The release integrates, in a controlled laboratory environment:

- a validated synthetic catalogue of representative Pirin-area experiences;
- read-only catalogue discovery through REST/OpenAPI and four MCP tools;
- machine-readable Schema.org/JSON-LD with the host represented as seller;
- catalogue-grounded concierge output with inspectable source-record identifiers;
- initiation of a synthetic booking request into a mock outbox;
- explicit safeguards preventing payment collection and automatic confirmation.

This paragraph defines the claim to test. It must not be read as an observed result until the gates below pass.

## Mandatory evidence matrix

Use durable links or release-contained files. “Implemented” is not an acceptable observed result; record the command, output, and evaluator-visible artefact.

| ID | Capability / criterion | Repository basis | Required observation | Status | Evidence |
|---|---|---|---|---|---|
| E01 | Clean, reproducible installation | Lockfile and quick start | Fresh environment completes `npm ci` without manual source changes | Not run | `TODO` |
| E02 | Automated verification | Tests and CI workflow | Required tests pass on the release SHA | Not run | `TODO` |
| E03 | Build/start smoke test | Service entry point | Service starts and health endpoint responds | Not run | `TODO` |
| E04 | Synthetic catalogue validity | `data/demo/`, JSON Schema | Every included record validates; identifiers are unique/references resolve | Not run | `TODO` |
| E05 | Privacy/provenance boundary | Data notice and repository scan | No secrets, real personal data, private application material, or unlicensed assets identified | Not run | `TODO` |
| E06 | OpenAPI contract | `openapi/openapi.yaml` | OpenAPI 3.1 document validates and runtime samples conform | Not run | `TODO` |
| E07 | JSON-LD interoperability | Experience presentation | Every tested record emits parseable JSON-LD; host is `Offer.seller` | Not run | `TODO` |
| E08 | Standard MCP connection | MCP server | Named standards-compliant client completes handshake and lists four tools | Not run | `TODO` |
| E09 | MCP search | `search_experiences` | Tool returns catalogue-grounded, inspectable record identifiers | Not run | `TODO` |
| E10 | MCP retrieval | `get_experience` | Tool returns the selected validated record consistently | Not run | `TODO` |
| E11 | MCP area listing | `list_by_area` | Tool returns records for a supported locality | Not run | `TODO` |
| E12 | Request hand-off | `initiate_booking_request` | Synthetic request reaches only the mock outbox | Not run | `TODO` |
| E13 | Host confirmation invariant | API/MCP contract and tests | Response requires host confirmation and remains pending | Not run | `TODO` |
| E14 | No payment | Architecture/contracts/tests | No payment credential, checkout, PSP, escrow, or `paymentCollected=true` path exists | Not run | `TODO` |
| E15 | No automatic confirmation | Architecture/contracts/tests | No API/tool/state transition auto-confirms a booking | Not run | `TODO` |
| E16 | Grounded concierge | Concierge tests/demo | At least three suggestions link back to existing catalogue records; unsupported claims are rejected/qualified | Not run | `TODO` |
| E17 | Security baseline | Threat model and automated scans | No unresolved high/critical source, dependency, or secret-scan finding | Not run | `TODO` |
| E18 | Evaluator reproduction | README and demo script | Independent clean-clone run completes the documented core scenario | Not run | `TODO` |

Mandatory gate: E01–E18 must pass, or an evaluator-visible exception must narrowly redefine the release claim before it is labelled `trl4`.

## Command and environment record

Record exact commands rather than paraphrasing them. Add project-specific lint, type-check, schema, OpenAPI, security, and build commands from `package.json`/CI.

| Sequence | Command | Exit code | Start/end UTC | Output artefact/checksum |
|---:|---|---:|---|---|
| 1 | `npm ci` | `TODO` | `TODO` | `TODO` |
| 2 | `npm test` | `TODO` | `TODO` | `TODO` |
| 3 | `npm run dev` plus health smoke check | `TODO` | `TODO` | `TODO` |
| 4 | `npm run mcp:stdio` plus client test | `TODO` | `TODO` | `TODO` |
| 5 | `TODO: project-specific verification command` | `TODO` | `TODO` | `TODO` |

Clean-clone test location and initial state: `TODO`.

## Request-only invariant record

Attach representative API and MCP outputs, with synthetic identifiers only, and confirm:

| Assertion | Expected | Observed | Test/evidence |
|---|---|---|---|
| Status after request initiation | `pending_host_confirmation` | `TODO` | `TODO` |
| Host confirmation required | `true` | `TODO` | `TODO` |
| Payment collected | `false` | `TODO` | `TODO` |
| Seller | Independent synthetic host | `TODO` | `TODO` |
| Request destination | Mock outbox only | `TODO` | `TODO` |
| Payment endpoints/tools | Absent | `TODO` | `TODO` |
| Automatic-confirmation transition | Absent | `TODO` | `TODO` |

Any contradictory observation blocks the release claim.

## Security and publication review

| Review | Tool/method and version | Scope | Result | Evidence |
|---|---|---|---|---|
| Secret scan, including history | `TODO` | Fresh public repository and release history | Not run | `TODO` |
| Personal-data/content allowlist review | `TODO` | All tracked files and release assets | Not run | `TODO` |
| Dependency/SBOM review | `TODO` | Runtime/development dependencies | Not run | `TODO` |
| Static analysis | `TODO` | Source and workflows | Not run | `TODO` |
| Licence/provenance review | `TODO` | Source, docs, data, media, dependencies | Not run | `TODO` |
| Threat-model control check | `TODO` | Release/deployment | Not run | `TODO` |

Before making the repository public, also verify branch/ruleset protection, restricted Actions permissions, Dependabot, secret scanning/push protection where available, CodeQL/static analysis, and private vulnerability reporting. Record repository-setting screenshots or URLs without exposing administrative secrets.

## Evidence asset manifest

Release assets should include, where applicable:

| Artefact | Filename/URL | SHA-256 | Status |
|---|---|---|---|
| Source archive | `TODO` | `TODO` | Pending |
| Test report | `TODO` | `TODO` | Pending |
| OpenAPI document | `TODO` | `TODO` | Pending |
| Schema-validation report | `TODO` | `TODO` | Pending |
| MCP trace with secrets removed | `TODO` | `TODO` | Pending |
| SBOM | `TODO` | `TODO` | Pending |
| Demo video | `TODO` | `TODO` | Pending |
| Transcript/captions | `TODO` | `TODO` | Pending |
| Evidence screenshots | `TODO` | `TODO` | Pending |
| `SHA256SUMS` | `TODO` | `TODO` | Pending |

## Limitations observed

Record limitations from the actual run, including failed, flaky, skipped, manual, environment-dependent, inaccessible, or unsupported behaviour:

`TODO: No verification run has yet been recorded.`

At minimum retain these scope limitations unless later maturity work changes them:

- synthetic data and laboratory conditions;
- no live inventory guarantee;
- request, not confirmed booking;
- no payment processing;
- no evidence of production availability or regional adoption;
- MCP client explicitly configured, not organically discovered;
- TRL 5/6 not established by this release.

## Sign-off

| Role | Name | Date (UTC) | Decision | Reference |
|---|---|---|---|---|
| Technical verifier | `TODO` | `TODO` | Pending | `TODO` |
| Privacy/security reviewer | `TODO` | `TODO` | Pending | `TODO` |
| Release owner | `TODO` | `TODO` | Pending | `TODO` |

Final evidence decision: **PENDING**.

When completed, change this only to a narrowly worded result such as “The named commit passed the documented application-stage TRL 4 laboratory evidence gates on DATE.” Do not generalise it to production readiness, another deployment, or a later TRL.
