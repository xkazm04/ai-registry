---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: cursor-cli
verified_on: 2026-08-25
---

# A synthesized read-only stance on the Cursor CLI

**Provenance caveat first**: unlike this subject's other applications, the
Cursor CLI was **not installed on the verifying machine** — every fact
below is from cursor.com's own docs fetched 2026-08-25, with third-party
claims marked. This document is itself the technique's "synthesized stance
is labeled" rule applied to knowledge: what is documented, what is
inferred, and what is unverified are kept distinguishable. There is no
`verified_against` here because no binary was run.

## No read-only flag exists — the stance is composed

Cursor's headless mode (`agent -p "<prompt>" --output-format json`)
documents **no plan/read-only flag**. What it documents instead:

- **Default print-mode behavior**: "changes are only proposed, not
  applied" — read-only-*ish* by default (docs/cli/headless).
- **`--force` / `--yolo`**: "force allow commands unless explicitly
  denied" — the `edit` mapping.
- **A permission config**, `~/.cursor/cli-config.json` (global) or
  `<project>/.cursor/cli.json` (per project):
  `permissions: {allow: [], deny: []}` with rule types `Shell(cmd)`,
  `Read(glob)`, `Write(glob)`, `WebFetch(domain)`, `Mcp(server:tool)`;
  **deny beats allow** (docs/cli/reference/permissions).

A `readonly-scan` adapter therefore *synthesizes* the stance: rely on the
default no-apply behavior, **and** write a project-level `cli.json` deny
set (`Write(**)`, unscoped `Shell` forms, `WebFetch` domains) into the
scanned checkout before the run. No OS-level sandbox is documented
anywhere in the CLI docs — the enforcement class is application-level
policy at best, and partly *default behavior*, the weakest class in the
technique's taxonomy. Surface it as such: a scan backed by this stance is
labeled "synthesized read-only" wherever the stance is displayed.

## What else the adapter needs to know (all [DOCS] 2026-08-25)

- **Binary identity drift**: current docs name the binary `agent`; the
  installer historically shipped `cursor-agent`. Probe both names —
  whether `cursor-agent` still exists is UNVERIFIED today.
- **Envelope**: `--output-format json` returns a single object with the
  answer in `.result` plus `is_error`/`subtype`/`duration_ms` — a
  deliberately Claude-Code-compatible envelope, so a normalizer for that
  dialect largely transfers. `stream-json` NDJSON exists;
  community writeups (tarq.net) report the stream shape has shifted
  across versions — parse defensively (severity UNVERIFIED).
- **Gaps against the contract**: no schema-constrained output documented;
  no documented cwd flag (spawn with the working directory set); stdin
  prompts are undocumented — third-party writeups show piping working,
  treat as unconfirmed and pass the prompt as an argument until verified.
- **Probe and auth**: `agent status` for auth, `agent --version` for
  install (both unverified locally). Login is browser OAuth
  (`NO_OPEN_BROWSER=1` for URL-only); `CURSOR_API_KEY` / `--api-key` is
  the metered path — strip the env var to stay on the operator's
  subscription (billing details for the key path were not covered by the
  docs page: UNVERIFIED).
- **No timeout flag** — host-enforced kill, as everywhere in this
  subject.

## The re-verification obligation

This page is the matrix row a first local install must re-earn: on
installing the binary, run the probe pair, smoke the envelope, test
whether the deny-rules file is honored in print mode (the single most
important unverified claim above — the synthesized stance *depends* on
it), and stamp the results with the new date before any product feature
declares a requirement against this tool.
