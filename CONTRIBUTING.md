# Contributing to Pirin Concierge

Contributions that improve the small, reproducible reference demonstrator are welcome. This repository is intentionally narrower than a production marketplace.

## Before contributing

1. Read [`docs/open-source-scope.md`](docs/open-source-scope.md) and [`PRIVACY.md`](PRIVACY.md).
2. Open an issue before making a large architectural or scope change.
3. Never copy proprietary Calivina code, production configuration, credentials, customer information, grant-application material, raw surveys, or media without documented redistribution rights.
4. Use only synthetic people, businesses, contact details, availability, and booking requests.

## Local checks

Use Node.js 20 or newer.

```bash
npm ci
npm test
npm run dev
```

To exercise the stdio MCP transport:

```bash
npm run mcp:stdio
```

Run every additional lint, type-check, schema, OpenAPI, security, and build command defined by the current `package.json` and CI workflow. A contribution should not weaken request-only booking tests or introduce payment and automatic-confirmation capabilities.

## Pull requests

Keep changes focused and describe:

- the problem and proposed behaviour;
- the safety/privacy impact;
- tests added or changed;
- OpenAPI, JSON Schema, MCP schema, JSON-LD, or documentation changes;
- whether generated or third-party material is included and under what licence.

Do not claim a capability, deployment result, KPI, or TRL level without reproducible evidence tied to a commit. Use `TODO` for evidence that has not yet been captured.

## Data contributions

Synthetic catalogue additions must be representative without impersonating a real host. Avoid real names, precise private addresses, personal contact data, copied descriptions, unlicensed photographs, and claims about identifiable businesses. Each record must validate against the repository schema and identify itself as synthetic where the model permits.

## Licensing

By contributing, you agree that:

- software, schemas, specifications, tests, and tooling contributions are provided under Apache-2.0;
- documentation and synthetic data contributions are provided under CC BY 4.0;
- you have the right to submit the contribution and disclose any third-party material.

See [`NOTICE.md`](NOTICE.md) for the licence map. Contributions do not grant rights to proprietary Calivina assets or project trademarks.

## Conduct and security

Be respectful and constructive. Report vulnerabilities privately according to [`SECURITY.md`](SECURITY.md); do not demonstrate exploits or expose sensitive information in an issue or pull request.
