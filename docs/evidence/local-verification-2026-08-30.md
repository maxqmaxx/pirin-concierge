# Local pre-publication verification — 2026-08-30

This record captures a local verification of the uncommitted initial repository worktree. It is useful
pre-publication evidence, but it is not a substitute for a green CI run tied to the published commit,
an independent reproduction, a public deployment, or a TRL assessment.

## Environment

| Field | Observed value |
|---|---|
| Verification time | `2026-08-30T12:32:10Z` |
| Operating system | macOS 14.7.4, Apple Silicon |
| Node.js | `v25.9.0` |
| npm | `11.12.1` |
| Repository state | Fresh Git repository before its first commit |

The CI workflow separately targets Node.js 20, which is the minimum supported major version.

## Results

| Check | Result | Observation |
|---|---|---|
| Clean locked install | PASS | `npm ci` completed without source changes |
| Formatting | PASS | 23 files checked |
| Static lint | PASS | 15 TypeScript source/test files checked |
| Type checking | PASS | TypeScript completed with no errors |
| OpenAPI 3.1 lint | PASS | Redocly reported a valid API description |
| Automated tests | PASS | 28 of 28 tests passed |
| Coverage | PASS | 87.50% statements, 77.44% branches, 90.24% functions, 87.45% lines |
| Build | PASS | TypeScript build completed |
| Dependency audit | PASS | `npm audit --audit-level=high` reported 0 vulnerabilities |
| Secret scan | PASS | Gitleaks v8.29.1 scanned the staged publication set (approximately 294 KB); no leaks found |
| HTTP smoke test | PASS | `/health`, catalogue search, and an experience page with JSON-LD responded locally |
| MCP contract | PASS | Official MCP client tests covered all four tools and modern Streamable HTTP negotiation |
| Container build | NOT RUN | Docker was not installed in the verification environment |
| CI/public deployment/video | PENDING | These require the published repository and release commit |

## Request-only invariants covered by tests

- every booking request remains `pending_host_confirmation`;
- `requiresHostConfirmation` is `true`;
- `paymentCollected` and `automaticallyConfirmed` are `false`;
- real email domains and unexpected payment/confirmation fields are rejected;
- the mock outbox stores no visitor name, email, or free-text message;
- no payment, checkout, charge, or booking-confirmation endpoint is published;
- the synthetic host is the Schema.org `Offer.seller`.

## Artefact checksums

```text
ecc119c2197998e1fc9968f0b41b1692ec23dbb94c6a786fd9421cc9462a78c2  data/demo/experiences.json
57f079e52de07f0007909950bb69df8847514dcba15133bc0de8828843f420e8  openapi/openapi.yaml
ab7db8b57f8cf62fcb8ff39424bda3e31b78e1c35a65b3b26300596f32b39cd9  package-lock.json
```

Re-run `npm ci && npm run verify && npm audit --audit-level=high` on the published commit and replace
the pending CI/release fields in the main evidence record before citing the repository as final TRL 4
evidence.
