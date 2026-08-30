# Security policy

Pirin Concierge is an application-stage laboratory demonstrator, not a production booking or payment service. Its public-demo boundary permits synthetic data and request-only booking flows.

## Supported versions

Security fixes are applied on a best-effort basis to the default branch and, once published, the latest prerelease. No long-term support commitment exists at this stage.

| Version | Supported |
|---|---|
| Default branch | Yes, best effort |
| Latest `v0.x` prerelease | Yes, best effort |
| Older commits/releases | No |

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or include personal data, credentials, or exploit details in public channels.

Preferred channel: GitHub private vulnerability reporting at:

`https://github.com/maxqmaxx/pirin-concierge/security/advisories/new`

This route is intended for the repository after creation and must be tested before publication.

If private reporting is not available, email `office@galactiv.eu` with the subject
`Pirin Concierge security report`. Do not send exploit code, credentials, or personal data until a
private exchange has been established.

Include the affected commit or release, reproduction steps, expected impact, and any suggested mitigation. We will acknowledge reports and coordinate disclosure on a best-effort basis; no guaranteed response or remediation SLA is currently offered.

## Security boundary

The demonstrator must:

- contain no production credentials or personal data;
- accept no payment credentials and expose no payment flow;
- avoid automatic booking confirmation;
- treat all external input as untrusted;
- validate catalogue, API, and MCP inputs against checked-in schemas;
- keep the host as seller and require explicit host confirmation;
- use synthetic identities in public demonstrations;
- prevent catalogue content from becoming executable instructions for the concierge;
- avoid logging request bodies or secrets by default.

The detailed assumptions and planned controls are in [`docs/threat-model.md`](docs/threat-model.md). A documented control is not evidence that a deployment implements it; release-specific verification belongs in [`docs/trl4-evidence.md`](docs/trl4-evidence.md).

## Out of scope

The following are intentionally absent and must not be tested against unrelated services:

- production Calivina systems or accounts;
- third-party hosts, tourism businesses, SMART ERA partners, and EU systems;
- denial-of-service testing against any public deployment without written authorisation;
- social engineering, physical attacks, and collection of real user data.

Good-faith research confined to this repository and an explicitly designated test deployment is welcome. Stop testing and report immediately if real personal data or credentials are encountered.
