---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: cursor-cli
verified_on: 2026-08-30
---

# Read-only stances on the Cursor CLI

**Provenance caveat first**: unlike this subject's other applications, the
Cursor CLI is **not installed on the verifying machine** — every fact below
is from cursor.com's own docs, re-fetched 2026-08-30, with third-party
claims marked. There is no `verified_against` here because no binary was
run.

## Correction (2026-08-30): a real read-only mode now exists

The previous revision of this page, dated 2026-08-25, was titled "A
synthesized read-only stance" and asserted that Cursor's headless mode
"documents **no plan/read-only flag**", so an adapter had to compose one.
**That is no longer true, and had already stopped being true when the claim
was written.** The 2026-01-16 CLI release brought editor parity on agent
modes. Currently documented
(cursor.com/docs/cli/reference/parameters, /docs/cli/using,
/changelog/cli-jan-16-2026):

- **`--mode <plan|ask>`**, with **`--plan`** as shorthand for
  `--mode=plan`; the default mode is `agent`. **Ask mode is explicitly
  read-only** — "explore code without making changes… provides answers
  without editing files".
- **`--sandbox <enabled|disabled>`** — a first-class sandbox switch. What
  it enforces technically is **UNVERIFIED**: no vendor page describing the
  mechanism was reachable, so this cannot be recorded as OS-enforced. Per
  the technique's conditional-enforcement rule, an unnamed mechanism is an
  unverified class, not a kernel guarantee.
- **`--trust`** — trust the workspace without prompting, **headless only**.
  This is now load-bearing rather than optional: non-interactive runs in an
  untrusted workspace **fail** with guidance unless it is passed. A
  workspace-trust gate that fails closed is the good version of the
  silent-downgrade hazard the technique describes elsewhere — but it means
  an adapter that does not pass it gets a hard error on every fresh
  checkout.
- **`--approve-mcps`**, and `-f/--force` / `--yolo` unchanged as the
  full-bypass path a transport never reaches for.

The January release also aligned CLI permissions with the IDE's three-mode
model, added a default-deny network proxy for sandboxed commands, and made
team-admin network allowlists enforceable from the CLI.

**The lesson this page now carries** is the one the capability matrix
exists for. This document was forged five days ago against docs that
already described `--plan`, and recorded its absence — because the
`/docs/cli/headless` page it read did not mention it and no other page was
consulted. A capability recorded as *absent* is a claim like any other and
needs the same witness as a capability recorded as present; "I did not see
it on the page I read" is not verification, and it is the direction of
error that causes an adapter to build an elaborate substitute for
something the tool already does properly.

## The composed stance is now the fallback, not the plan

The permission config is unchanged and still applies:
`~/.cursor/cli-config.json` (global) or `<project>/.cursor/cli.json` (per
project), `permissions: {allow: [], deny: []}` with rule types
`Shell(cmd)`, `Read(glob)`, `Write(glob)`, `WebFetch(domain)`,
`Mcp(server:tool)`; **"Deny rules take precedence over allow rules"**
(docs/cli/reference/permissions, re-fetched 2026-08-30).

So the posture for a `readonly-scan` is now the technique's normal
three-layer one rather than a synthesis: `--mode ask` (or `--plan`) as the
session-level read-only layer, the config file's `deny` set as the
write-tool denylist, and `--sandbox enabled` where the deployment can carry
it. Record the enforcement class as **application-level policy** until the
sandbox mechanism is documented or observed — and only where `--sandbox` is
actually passed; the mode flags alone are policy.

## What else the adapter needs to know (all [DOCS], re-fetched 2026-08-30)

- **Binary identity**: docs name the binary `agent` — the install page
  verifies with `agent --version`, and every official page since the
  2025-08-07 launch uses that name. The claim that `cursor-agent` survives
  as a legacy alias to the same binary is **third-party only**, not
  vendor-documented; probe both names, prefer `agent`.
- **Envelope** (docs/cli/reference/output-format). `--output-format json`
  returns a single object: `type` (always `"result"`), `subtype` (always
  `"success"`), `is_error`, `duration_ms`, `duration_api_ms`, `result`
  (concatenated assistant text), `session_id`, `request_id` (optional).
  Close enough to the Claude Code dialect that a `.result` normalizer
  largely transfers. Note the sharp edge: **no `is_error: true` variant is
  documented**, so the failure shape is UNVERIFIED — do not assume the
  error branch of the envelope exists in the form the sibling tool uses.
  `--output-format stream-json` emits NDJSON `system` (`subtype:"init"`,
  carrying `apiKeySource`, `cwd`, `model`, `permissionMode`), `user`,
  `assistant`, `tool_call` (started/completed, with
  `readToolCall`/`writeToolCall`/`function`), `result` events. Community
  writeups report the stream shape shifting across versions — parse
  defensively (severity UNVERIFIED). Since 2026-02 headless transcripts are
  also written as "Claude Code-compatible JSONL".
- **Gaps against the contract**: **no schema-constrained output** — there
  is no `--json-schema` equivalent, and the standing feature request
  (forum.cursor.com/t/…/152876, 2026-02-25) has no staff reply. This is a
  real capability gap versus the two tools in the fleet that do offer it,
  and a feature declaring a schema requirement must degrade or hide here.
  No documented cwd flag (spawn with the working directory set); stdin
  prompts remain undocumented — third-party cheatsheets show piping
  working, so treat it as *works but unsupported* and prefer the argument
  form until a live run says otherwise.
- **Protocol mode**: `agent acp` starts an Agent Client Protocol server
  (docs/cli/acp) — the same alternative-transport lead noted on the Gemini
  page. `status`/`about` accept `--format json` since 2026-04, which is the
  nearest thing here to a machine-readable probe.
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
