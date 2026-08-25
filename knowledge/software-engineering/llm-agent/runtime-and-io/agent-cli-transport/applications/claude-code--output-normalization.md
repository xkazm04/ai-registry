---
layer: application
type: application
subject: agent-cli-transport
technique: output-normalization
stack: claude-code
verified_on: 2026-08-25
verified_against: claude-code@2.1.245
---

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
  instantly (missing binary, bad flag) makes the write an EPIPE that would
  otherwise crash the whole host process, not just the call.
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
