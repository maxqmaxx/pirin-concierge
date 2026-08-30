# Open-source scope

## Purpose

This repository publishes a small reference implementation that can be inspected, run, and tested independently. It does not place the complete Calivina product or its operational environment under an open-source licence.

## Included scope

Subject to per-file notices, the public reference scope includes:

| Material | Intended location | Licence |
|---|---|---|
| Reference service source code | `src/` | Apache-2.0 |
| REST/OpenAPI description | `openapi/` | Apache-2.0 |
| JSON Schemas and interoperability mappings | `schemas/`, relevant source | Apache-2.0 |
| MCP server and four reference tools | relevant source | Apache-2.0 |
| Catalogue-grounded concierge reference logic | relevant source | Apache-2.0 |
| Request-only booking handler and mock outbox | relevant source | Apache-2.0 |
| Automated tests and CI/deployment examples | `tests/`, `.github/`, configuration | Apache-2.0 |
| Original project documentation | `README.md`, `docs/` | CC BY 4.0 |
| Original synthetic demo catalogue | `data/demo/` | CC BY 4.0 |

The checked-in files and [`NOTICE.md`](../NOTICE.md) control if this table and a file-specific notice differ.

## Excluded scope

The following are not included, disclosed, or licensed by this repository:

- the full pre-existing Calivina codebase, production service, or infrastructure;
- production administration, tenant management, billing, checkout, payment, settlement, CRM, outreach, and analytics functions;
- private prompts, production ranking or recommendation logic, internal evaluation data, trade secrets, or operational runbooks;
- credentials, tokens, certificates, provider configuration, domains, customer accounts, and monitoring data;
- real host, traveller, booking, survey, application, partner, or employee information;
- third-party PDFs, publications, photographs, recordings, logos, maps, descriptions, or datasets without compatible redistribution rights;
- grant drafts, declarations, budgets, partner correspondence, and legal-entity records.

Absence from the repository is intentional and does not prevent an independent clean-room implementation of interoperable components under applicable law and specifications.

## Calivina boundary

Pirin Concierge may use architectural experience gained while developing Calivina, but this repository grants rights only to the material actually committed here by authorised contributors. It grants no implicit licence to Calivina source code, branding, hosted services, datasets, or commercial features.

Contributors must not paste or mechanically extract proprietary code unless its rights holder has explicitly approved relicensing under Apache-2.0 and the provenance is documented. When uncertain, implement the small public contract independently.

## Data boundary

The public baseline is synthetic by design. “Representative” does not mean copied from a real business. Synthetic records should avoid identifiable combinations, personal contact details, private addresses, copyrighted marketing text, or unsupported claims about existing hosts.

Moving to real pilot data requires:

- documented authority from each data provider;
- provenance and reuse terms at record/asset level;
- privacy notices and data-governance decisions;
- a separate environment that does not silently replace the public synthetic dataset;
- an explicit decision on which aggregated or anonymised evidence may be published.

## Dependency and specification rights

Dependencies retain their own licences. A lockfile is not a licence grant. Release review should produce an inventory/SBOM, inspect notices, and resolve incompatible or missing terms.

MCP, OpenAPI, JSON Schema, Schema.org, product names, and third-party marks are referenced for interoperability. Such references do not imply sponsorship or transfer of trademark rights.

## Contribution rule

Every contribution must have clear provenance. Contributors affirm they have the authority to license it under the applicable repository licence. Suspected copied, personal, secret, or unlicensed content should be removed from the public release and reported privately if disclosure would create risk.

## No endorsement

Publication may support a SMART ERA application, but it does not mean that SMART ERA, the European Union, or a consortium partner funded, approved, certified, or endorsed this work.
