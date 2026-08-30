# Privacy notice for the reference demonstrator

## Scope

This notice covers the source repository and any demonstration deployment that explicitly links to it. It does not cover Calivina production services, independent hosts, GitHub, MCP clients, hosting providers, or other third parties, which act under their own notices and responsibilities.

## Data principle

The repository contains a synthetic experience catalogue and is designed to be evaluated using synthetic visitor and host identities. It must not contain real names, contact details, booking records, survey responses, application records, or unpublished partner material.

The public demonstrator is not intended to collect real personal data. Do not submit real names, email addresses, telephone numbers, accessibility information, payment information, or free-text content identifying a person.

## Booking requests

A demonstration booking request is an expression of interest only. It does not form a confirmed booking and does not collect payment. The host remains the seller and any later communication or transaction occurs outside this reference demonstrator.

The target demonstration uses fixed or clearly synthetic requester details and routes the request to a mock outbox. Before any public deployment is cited, the operator must verify and document:

- whether request bodies are persisted;
- log fields and redaction behaviour;
- retention and deletion periods;
- hosting location and subprocessors;
- access controls and incident contact;
- the lawful basis and participant notices for any later real-world pilot.

Release-specific answers are currently `TODO` and must be recorded in [`docs/trl4-evidence.md`](docs/trl4-evidence.md). This document does not claim that an unverified deployment has a particular retention period or hosting location.

## Local use

Running the project locally may create ordinary development artefacts such as process logs or test output. Contributors must use synthetic data, avoid committing logs, and inspect their own development environment and MCP client configuration.

## Repository and third-party processing

GitHub may process account, contribution, and access information under its own terms. An MCP client, browser, hosting platform, or optional model provider may process requests independently. Operators are responsible for configuring those services and providing any legally required notices. Real personal data must not be sent to a model provider as part of this demonstrator.

## Real-world pilot requirement

Moving from TRL 4 to TRL 5 or TRL 6 requires a separate data-protection assessment. At minimum it must establish roles, purpose limitation, data minimisation, lawful basis, transparent notices, retention, data-subject request procedures, processor terms, international-transfer safeguards where relevant, access control, and breach handling.

## Contact

Repository privacy contact: `office@galactiv.eu`. Do not submit personal data through a public issue.
