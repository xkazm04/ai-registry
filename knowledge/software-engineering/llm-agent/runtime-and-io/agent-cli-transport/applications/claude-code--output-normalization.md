---
layer: application
type: application
subject: agent-cli-transport
technique: output-normalization
stack: claude-code
verified_on: 2026-08-30
verified_against: claude-code@2.1.245
---

> **Re-verification note, 2026-08-30.** All three repo citations below were
> re-read on this date and every cited symbol still resolves (`_parse_envelope`
> and `_API_KEY_ENV` in kp; `unwrapCliEnvelope` in ascent; the `rung` ladder
> and `--setting-sources` in systedo-case). The **envelope evidence itself is
> still the 2026-08-25 live smoke against 2.1.245** — hence `verified_against`
> stays there. The installed CLI is now **2.1.251**, unsmoked: per the
> capability matrix's version trigger, the envelope rows are stale-but-serving
> until someone re-runs them. See "What changed by 2.1.251" at the end.

# Normalizing the Claude Code CLI envelope — three convergent implementations

Three unrelated production repos wrap the same transport —
`claude -p --output-format json`, prompt on stdin — and their parsers
converged on the same rules independently, which is the strongest field
evidence this subject has. The envelope (smoke-tested live 2026-08-25,
v2.1.245): a **single JSON object** on stdout; answer in `.result`;
`is_error` + `subtype` for error state; `duration_ms`, `num_turns`,
`session_id`, `usage` (tokens incl. cache), `total_cost_usd` — reported
even under subscription auth, informationally.

## The convergent parse

- **kp** (`pipeline/jobfit/claude_cli.py`, `_parse_envelope`): empty stdout
  is its own failure naming the exit code; non-JSON stdout raises with a
  300-char prefix of the raw text preserved — "not JSON" outcomes include a
  `/login` prompt, rate-limit text, and install errors, each diagnosable
  only from the raw prefix. `is_error` or a non-`success` subtype raises
  with the subtype carried as a typed field on the exception.
- **ascent** (`src/lib/llm/claude-cli.ts`, `unwrapCliEnvelope`): the same
  three-way split, deliberately **shared by both callers** (the assessment
  provider and the general prompt runner) so a subscription-auth prompt or
  a rate limit surfaces the same failure text everywhere instead of two
  opaque variants. Its header comment records the transport decision
  itself: the Agent SDK only supports API-key auth, so the repo spawns the
  CLI on purpose to stay on subscription billing.
- **systedo-case** (`src/lib/llm/claude.ts`): tolerates the messier
  reality of `--dangerously-skip-permissions` + `--max-turns` runs with a
  four-rung extraction ladder — direct parse → fenced block →
  envelope-line reassembly (it folds `stream-json` lines too) → balanced
  brace scan — and **reports which rung fired** (`ExtractedJson.rung`),
  explicitly as drift telemetry: a producer that stops landing on `direct`
  is drifting weeks before `balanced` fails.

kp's model-text extraction adds the last-value rule: prefer the **last**
top-level JSON value (or the last carrying an expected key), because
few-shot prompts make the model echo the example object before the answer.

## Stream hygiene, as practiced

- **Stdin is fed and closed** in all three; ascent and systedo both attach
  an error handler to the stdin stream first, because a child that dies
  instantly (missing binary, bad flag) makes the write fail in a way that
  would otherwise crash the whole host process, not just the call.
  **Sharpened 2026-08-30** by reproduction on win32 (Node 24.14.0): the
  error observed against a truly absent binary is `write EOF`, not `EPIPE`,
  and — because the spawn goes through a shell for the `.cmd` shim —
  `child.on('error')` **never fires at all**; the shell launches fine and
  exits 1. So the stdin handler is not merely nice-to-have, it is the only
  thing standing between an uninstalled tool and a dead host. systedo's
  handler is `child.stdin.on("error", () => {})` — empty. That saves the
  host and discards the classification, so the absence then surfaces as an
  unparseable envelope and the ladder descends citing "parse failure"
  instead of "not installed". Classify in the handler; don't just absorb.
- **Stderr is captured separately and only quoted in bounded slices**
  (ascent: 16 KB cap, 200-char surfacing; kp: attached to the raised
  error). Nobody parses it.
- **Byte caps on accumulation**: ascent caps stdout at 4 MB and kills the
  child on breach — the envelope for a real run is KBs, so a runaway
  stream is treated as an attack on host memory, not as data.
- **Noise isolation**: live runs on 2026-08-25 observed a user SessionEnd
  hook printing a failure line *after* the JSON object. The current flags
  for a clean transport are `--setting-sources user` (keeps auth, drops
  project/local hooks and CLAUDE.md — systedo's choice, with the recorded
  lesson that `--bare` also drops the login and yields "Not logged in")
  or `--bare` where API-key auth is intended. systedo also clears
  `CLAUDECODE` / `CLAUDE_CODE_ENTRYPOINT` from the child env so a nested
  invocation starts as a fresh top-level session.
- **Neutral cwd for the generate seam**: ascent spawns in the OS temp dir
  so the project's CLAUDE.md and tools never load into an assessment call
  — the mode-separation rule made physical.

## Dialect notes (dated)

`--output-format` also offers `stream-json` (NDJSON events) and
`--json-schema <inline>` for schema-constrained output (flag verified in
help 2026-08-25; live-smoked in earlier sessions). Exit code and envelope
error state can disagree — systedo prefers stdout when non-empty even on
nonzero exit, because some failed exits still print a usable answer. All
of this is v2.1.245 data; re-verify the envelope fields on version change.

## What changed by 2.1.251 (help-verified 2026-08-30, envelope UNSMOKED)

The flag surface moved under this page while its envelope evidence did not.
What a re-smoke should take account of:

- **`--restricted`** is a better answer than `--setting-sources user` to the
  noise-isolation problem this page records. It removes the
  command-and-code-running tools and web fetch unless `--tools` names them,
  ignores user/project/local settings files (managed settings and
  `--settings` still apply), confines the file tools to the working
  directories, and refuses `bypassPermissions`. Unlike `--bare` it does not
  flip the auth direction, so it is the first isolation flag here that does
  not trade the login away — which was systedo's recorded reason for
  rejecting `--bare` in favour of `--setting-sources user`.
- **`--tools ""`** is documented as the way to disable all tools. Note the
  hazard: that empty argument is deleted when the spawn passes through a
  shell, taking the following flag with it — see this subject's
  `child-observed-posture` application for the reproduction.
- **`--max-budget-usd`** adds a spend ceiling to print mode; there is still
  no wall-clock flag (re-checked 2026-08-30 across all three locally
  installed agent CLIs — none has one).
- **`--include-hook-events`** now exists for `stream-json`, which would turn
  the hook noise this page observed on the data channel into typed events on
  the event stream rather than stray text — worth testing as the targeted
  fix for that specific hazard.
- Also new around the envelope: `--input-format stream-json`,
  `--replay-user-messages`, `--forward-subagent-text`,
  `--include-partial-messages`, and `--fallback-model` (print mode only).
