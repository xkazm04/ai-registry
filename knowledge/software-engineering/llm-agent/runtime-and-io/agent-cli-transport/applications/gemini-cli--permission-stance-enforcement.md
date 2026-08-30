---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: gemini-cli
verified_on: 2026-08-30
verified_against: gemini-cli@0.42.0
---

# Permission stances on the Gemini CLI

First coverage of this tool in the subject. `gemini` 0.42.0, installed on
the verifying machine (win32); local rows are either **[HELP]** (its own
`--help`, run 2026-08-30) or **[BUNDLE]** (read out of the installed
`@google/gemini-cli` bundle, which is stronger than vendor docs and weaker
than a live run), with **[DOCS]** for rows taken from the repo and vendor
docs on the same date. Rows needing a model call are marked **UNSMOKED** —
the local half of this page was produced without spending tokens, and says
so rather than implying more.

## Read this first: the seat this transport would run on is gone

**Google retired Gemini CLI for individual users on 2026-06-18** (announced
2026-05-19). The free tier, Google AI Pro, AI Ultra and individual Gemini
Code Assist stopped serving requests. **Enterprise** (Code Assist
Standard/Enterprise) and **paid API-key** access continue unchanged, and the
Apache-2.0 repo is still actively shipping — v0.57.0 stable on 2026-08-25.
The successor for individuals is a different, closed-source binary.
[DOCS: developers.googleblog.com "transitioning Gemini CLI to Antigravity
CLI"; google-gemini/gemini-cli discussions #27274, #28017; releases page,
all fetched 2026-08-30.]

Three consequences, and they are why this section leads:

1. **This tool inverts the subject's economics.** Its whole reason to exist
   here would be a flat-rate seat; for an individual operator there is no
   longer one. Per `subscription-auth-selection`'s "the direction inverts
   per tool", this is now a **key-injection** tool for individuals — the
   adapter's job flips from stripping credentials to ensuring one is
   present and labelling every run as real metered spend.
2. **The repo carries no deprecation notice.** Assessing this tool's status
   from its README, its release cadence, or its `--help` — which is exactly
   what the local half of this page did — returns "healthy and actively
   developed". That is true of the *code* and false of the *service*. A
   capability matrix built from the artifact cannot see a tier being
   switched off.
3. **This machine is sitting on the failure.** `~/.gemini/` holds a
   populated `oauth_creds.json` (and, tellingly, `antigravity/` and
   `antigravity-browser-profile/` directories from the migration). A probe
   that reads "credential file present" would report this tool as
   authorized today. It is the availability-probe's named fallacy — "a
   cached login artifact can be present, well-formed, and *ineligible*
   because the account tier was discontinued" — reproduced exactly, on a
   second vendor, roughly a year after the sighting that earned the rule.
   The rule was right and the recurrence rate is higher than one incident
   suggested.

The rest of this page stands as the stance reference for the paths that
still serve (enterprise, API key), and because the enforcement findings
below are the fleet's clearest. The installed 0.42.0 is also **15 minor
versions behind** 0.57.0, so treat every local row as a floor.

Headless shape [HELP]: `gemini -p "<prompt>"`, with the notable detail that
`-p` is *"Appended to input on stdin (if any)"* — stdin and the flag
combine rather than compete, so a large prompt can travel over the input
stream with a short instruction on the flag.

## Two stance axes that are orthogonal — and neither is the other's proxy

This tool is the clearest fleet example of why the technique separates
"which mode did you ask for" from "what class enforces it", because here
they are set by two different flags that do not imply each other.

**Axis 1 — approval mode [HELP], application-level policy.**
`--approval-mode <default|auto_edit|yolo|plan>`, where the tool's own help
glosses `plan` as *"read-only mode"*. Mapping to the transport contract:
`plan` → `readonly-scan`, `auto_edit` → `edit`, `yolo` (also `-y`, itself
now deprecated in favour of `--approval-mode=yolo`) is the full bypass a
transport never reaches for. This is the tool's own permission engine
refusing actions: **application-level class**, not a wall. Docs describe it
as "a strict, read-only mode for research and design"; writes are blocked
except markdown in designated plan directories, and shell execution is
blocked. [DOCS 2026-08-30.]

**The gotcha, and it is severe: headlessly, plan mode is a phase, not a
ceiling.** [DOCS 2026-08-30.] The policy engine **auto-approves
`enter_plan_mode` / `exit_plan_mode` in non-interactive contexts, and the
CLI switches to YOLO on exiting plan mode.** So a `-p` run started in
`plan` can leave it — approving its own exit, because there is no one to
ask — and land in the *full-bypass* mode, inside a single run the caller
believes is read-only. The project's own tracker states the principle
plainly (issue #15963): guardrails "must be enforced at the application
level… not solely via policy engine rules — because policy rules can be
overridden by YOLO's catch-all allow."

This is the technique's silent-downgrade rule in its worst form: not the
tool resetting your stance at startup where a probe could catch it, but the
stance *transitioning mid-run*, upward, by a mechanism designed for
interactive convenience. For a `readonly-scan` on this tool, `--approval-
mode plan` alone is not a stance — it must be paired with a deny rule on
the mode-exit tool, or with `--sandbox`, which is the only layer here that
a mode transition cannot revoke. That pairing is **UNSMOKED** and is the
first thing a live run should establish.

**Axis 2 — sandbox [HELP + BUNDLE], OS-level but conditional.**
`-s, --sandbox` is a *boolean*, switched on independently of the approval
mode, with `GEMINI_SANDBOX` as the environment equivalent. The backends
found in the bundle are not one mechanism but four, and their availability
differs per machine:

- **Containers** — overwhelmingly the primary path (`docker` ~544 string
  occurrences, `podman` ~27). A bundle string enumerates the choices:
  `… or specify an explicit sandbox command (e.g., "docker", "podman",
  "lxc", "windows-native")`.
- **macOS Seatbelt** — `sandbox-exec` (~78), `seatbelt` (~45),
  `SEATBELT_PROFILE` (~33); `seccomp` also appears (~12).
- **A Windows native sandbox** — a `WindowsSandboxManager` that **compiles
  a helper at runtime**, searching "known CSC path"s (the .NET C#
  compiler).

Vendor docs (`docs/cli/sandbox.md`, [DOCS 2026-08-30]) corroborate and
extend the bundle read: macOS Seatbelt with **six** `SEATBELT_PROFILE`
profiles (`permissive-open` default, `permissive-proxied`,
`restrictive-open`, `restrictive-proxied`, `strict-open`,
`strict-proxied`); Linux Docker/Podman plus **gVisor (`runsc`)** and
LXC/LXD; Windows Docker/Podman plus the native sandbox, which the docs
describe as using **`icacls` integrity levels**. Selection is
`GEMINI_SANDBOX=true|docker|podman|sandbox-exec|runsc|lxc`, with
`GEMINI_SANDBOX_IMAGE`, `BUILD_SANDBOX`, `SANDBOX_MOUNTS`, `SANDBOX_FLAGS`
beside it; the default image is `ghcr.io/google/gemini-cli:latest`. Note
the small divergence worth carrying: the docs name integrity levels, the
installed bundle shows a helper compiled on demand — most likely the helper
is what applies them, but that is inference, not verification, and it is the
mechanism whose absence the next paragraph is about.

## The finding: this sandbox can fail to exist, quietly

The Windows path is the sharpest instance in the fleet of the technique's
conditional-enforcement rule. Its failure branch in the bundle is:

```
debugLogger.log("WindowsSandboxManager: Failed to compile sandbox helper
                 from any known CSC path.");
```

A `debugLogger` line — not a thrown error, not a stderr warning a
transport's capture would even retain. The container path has the same
shape of exposure for a different reason: it needs a daemon that must be
installed *and running*. Docker is present on this machine; whether an
absent or stopped daemon aborts the run or degrades it to unsandboxed is
**UNSMOKED**, and it is the single most important thing a first live run
should settle, because the two answers are opposite stances wearing one
flag.

So for this stack the capability matrix cannot carry a row reading
"OS-enforced sandbox: yes". The honest row is *OS-enforced **where the
backend materializes on this machine**, application-level otherwise*, and
the adapter checks rather than assumes. Recording the class from the flag's
existence would assert kernel-grade enforcement on a machine where the
helper never compiled.

## The allowlist moved into a policy engine

[HELP] `--allowed-tools` is now marked **`[DEPRECATED: Use Policy Engine
instead]`**, pointing at `geminicli.com/docs/core/policy-engine`. Its
replacements are `--policy` and `--admin-policy`, each taking policy
**files or directories** (comma-separated or repeated), with the
admin variant separated out for operator-set rules. Two consequences for
the technique's three-layer read-only posture:

- Layer 2 ("a scoped tool allowlist") is no longer expressed as a flag list
  on this tool; it is a file the adapter writes and passes. That is closer
  to the synthesized-stance mechanics already described for the Cursor CLI
  than to the flag-based allowlists elsewhere in the fleet.
- The grammar is **TOML**, not the allow/deny JSON arrays the sibling tools
  use [DOCS 2026-08-30, repo `docs/reference/policy-engine.md`]: `[[rule]]`
  blocks with `toolName` (string or array, wildcards), `decision`
  (`allow` | `deny` | `ask_user`), `priority` (0–999), and matchers
  `argsPattern`, `commandPrefix`, `commandRegex`, `mcpName`, `subagent`,
  `toolAnnotations`, `denyMessage`, `modes`, `interactive`,
  `allowRedirection`.
- **Precedence is not simply deny-beats-allow.** Resolution is
  highest-priority-first, first match wins, with
  `final_priority = tier_base + (toml_priority / 1000)` over five tiers —
  Default (1), Extension (2), Workspace (3, currently disabled), User (4),
  Admin (5) — so **admin always wins** and a high-priority `allow` can
  outrank a lower-tier `deny`. An adapter porting the "deny beats allow"
  assumption from another tool in this fleet will build a denylist that
  does not hold. Files live at `~/.gemini/policies/*.toml`, admin at
  platform locations with ownership and permission checks; **supplemental
  policies passed by flag are ignored when standard-location policies
  exist**, which is a quiet way for an adapter-written policy to have no
  effect at all.
- **`ask_user` is treated as deny in non-interactive mode** — the correct
  behavior, and the single most useful fact here for a headless transport.
- Two open issues report the engine misbehaving precisely in the mode this
  subject uses: #20469 (policy rules ignored non-interactively under
  `--approval-mode auto_edit`) and #16012 (`--allowed-tools` failing under
  `-p` with "denied by policy"). Treat the policy layer on this tool as
  load-bearing but not yet dependable, and verify it per version.

## Other rows an adapter needs (dated 2026-08-30)

- **No zero-token auth probe.** The subcommand list is `mcp`, `extensions`,
  `skills`, `hooks`, `gemma`, and the default launcher — there is **no
  `auth` / `login status` command** [HELP]. Meanwhile `~/.gemini/` holds a
  populated `oauth_creds.json`. That combination is exactly the
  availability-probe's named fallacy standing in the open: the only cheap
  evidence available is a credential file, and the technique's rule is that
  it proves nothing. Authorization for this tool is currently **unknown**
  until a labeled paid ping, and should render as unknown. Corroborated
  [DOCS 2026-08-30]: `/auth` exists only as an *interactive* slash command,
  and the docs describe non-interactive auth purely through environment
  variables (`GEMINI_API_KEY`, `GOOGLE_API_KEY`, or ADC plus
  `GOOGLE_CLOUD_PROJECT`), the CLI exiting with an error when none is
  found. Search results claiming a `gemini auth status` command trace to a
  **third-party mirror site**, not to the repo or vendor docs — a good
  reminder that a probe command is exactly the kind of convenient fact a
  low-quality source will invent. Given the tier retirement above, the
  absence of a cheap authorization proof is not a minor gap here: the one
  thing an operator most needs to know about this tool is the one thing it
  will not tell you without spending.
- **Sanitization has a name and a default** [HELP]. `--raw-output`
  *"Disable sanitization of model output (e.g. allow ANSI escape
  sequences). WARNING: This can be a security risk if the model output is
  untrusted"*, plus `--accept-raw-output-risk` to silence that warning.
  Sanitized is the default; the technique's "keep sanitization on" rule
  here means simply never passing these two.
- **Envelope** [HELP + BUNDLE, UNSMOKED]. `-o, --output-format
  <text|json|stream-json>`. The bundle constructs an object keyed
  `response:` alongside `stats:` (session/quota/confirmation stats) with a
  separate error path — i.e. the single-result-object dialect, but with the
  answer in `.response`, *not* the `.result` field two other tools in this
  fleet use. A normalizer written for the `.result` dialect will not
  transfer unchanged. Confirm the exact keys with a live smoke before
  relying on them.
- **Workspace trust exists** [HELP]: `--skip-trust` ("Trust the current
  workspace for this session"). Per the technique's pre-empt rule, pass it
  deliberately rather than discovering the trust gate per machine — and note
  that doing so is itself a stance decision, not hygiene.
- **Containment is built in** [HELP]: `-w, --worktree [name]` starts the
  session in a fresh git worktree, so the `edit` seam's blast-radius bound
  can be the tool's own rather than the host's.
- **Hooks exist** [HELP] (`gemini hooks`), so the operator-configuration
  noise hazard applies to this tool too. No `--bare`-equivalent isolation
  flag was found; `-e/--extensions` scopes extensions and
  `--allowed-mcp-server-names` scopes MCP servers, but nothing observed
  suppresses user hooks. **UNVERIFIED** whether hook output can land on the
  data channel here.
- **No timeout flag** [HELP] — host-enforced kill, consistent with every
  other tool in this subject. Re-checked across all three locally installed
  CLIs on 2026-08-30: still none.
- **A protocol mode, not just a print mode** [HELP]: `--acp` ("Starts the
  agent in ACP mode"; `--experimental-acp` deprecated in its favour). This
  is a session protocol rather than one-shot spawn-and-parse, and if it
  spreads it is an alternative to this subject's normal transport shape.
  Noted as a lead; not evaluated.
