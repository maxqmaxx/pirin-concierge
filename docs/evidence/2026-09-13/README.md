# Laboratory observations — 13 September 2026

This pack records local execution after a fresh locked installation. The application source and fixtures remain those of commit 91c782ca80181583a03bf8050651c25b6c031f8b; new scripts exercise the built entry points and capture evidence.

| File | Meaning |
|---|---|
| [transport-transcript.json](transport-transcript.json) | Real loopback HTTP and stdio clients, source checksums, protocol, all four tools and request-only checks |
| [lab-transcript.json](lab-transcript.json) | In-process catalogue, JSON-LD, deterministic concierge and MCP handoff observations |
| [coverage-summary.json](coverage-summary.json) | Vitest coverage output with repository-relative file keys; measurements unchanged |
| [dependency-audit.json](dependency-audit.json) | Raw JSON returned by npm audit --audit-level=high --json |
| [SHA256SUMS](SHA256SUMS) | Checksums of these four machine-readable files |

## Observed execution

- macOS, Node v25.9.0, npm 11.12.1.
- npm ci: exit 0, 97 packages installed from the lockfile.
- npm run verify: exit 0; 6 test files and 28 tests passed; formatting, lint, types, OpenAPI and build passed.
- npm run test:transports: exit 0 after permission to bind loopback; six scenario observations passed.
- npm run evidence:record: exit 0; deterministic catalogue and mock request scenario passed.
- npm audit --audit-level=high --json: exit 0; zero reported vulnerabilities.
- Unit coverage: 87.45% lines, 77.44% branches, 90.24% functions and 87.50% statements.

The local transcript has workingTreeDirty=true because it was captured before the tooling/documentation commit. Its sourceChecksums identify the tested snapshot. Runtime source, tests, catalogue, contract and lockfile are unchanged from the earlier public baseline.

For a clean checkout of a particular published revision, inspect its successful [GitHub Actions run](https://github.com/maxqmaxx/pirin-concierge/actions/workflows/ci.yml). The workflow repeats installation, verification, both scenarios and audit on Node 20, and attaches JSON outputs containing the tested commit. An uploaded artifact on a failed workflow is diagnostic output, not evidence that all checks passed.

The fixed future date is a synthetic fixture. Loopback URLs identify a temporary local server. Neither is a bookable live offer. No model provider, actual host or real personal data is involved.

See [the evidence record](../../trl4-evidence.md) for the limits of the laboratory claim. The earlier [6 September transcript](../2026-09-06/transcript.json) remains historical evidence and has not been relabelled as this new run.
