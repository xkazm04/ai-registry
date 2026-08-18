# Security policy: <repo name>

> Starter. Replace every `<...>` and `TODO:` with this repo's specifics, then delete this block.

The shift-left guardrail against the vulnerable or secret-leaking code an AI can produce
confidently and at speed.

## Reporting a vulnerability

TODO: how to report privately (a security advisory, a monitored address, or a form) and the
response time you commit to. Do not ask people to open a public issue for a vulnerability.

- Report to: `<private channel>`
- We acknowledge within: `<n business days>`
- We aim to fix or mitigate within: `<n days, by severity>`
- Please include: affected version, reproduction steps, and impact.

## Supported versions

| Version | Supported |
| --- | --- |
| `<x.y>` and later | yes |
| earlier than `<x.y>` | no |

## Automated guardrails we run

- **SAST** on every pull request - `<tool>`, blocking at `<severity>` and above.
- **Dependency scanning** on every pull request and weekly - `<tool>`, blocking at `<severity>`.
- **Secret scanning** in a pre-commit hook and in CI, including history - `<tool>`. A hard fail.
- **Container image scanning** - `<tool>`, or: not applicable, this repo ships no images.
- **SBOM and signed artifacts** on release - `<tool>`, or: not applicable, nothing is published.

TODO: delete the lines that do not apply and say so explicitly rather than leaving them blank.
An explicit out-of-scope is information; a blank line is a gap nobody can see.

## Where secrets come from

Secrets are read from `<vault, secret manager, or CI secret store>` at runtime. They are never
committed, never pasted into an issue or a PR description, and never included in a prompt or a
log line.

If a secret does reach the remote: **rotate it first**, then clean the history. Deleting the file
is not a fix - the value is in the history and in every clone.

## Enforcement

The checks above are required for merge into `<default branch>`. Configure them in
`.github/workflows/supply-chain.yml` (see `starter/.github/workflows/supply-chain.yml`) and in
the branch protection rules.

TODO: name the owner or team accountable for triaging findings.
