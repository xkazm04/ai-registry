---
layer: application
type: application
subject: unattended-build-loop
technique: no-gate-self-certifies
stack: process
status: forged
---

# PoF's autonomous-builder doctrine: who is allowed to say "pass"

`docs/features/harness-llm-unreal/autonomous-builder.md` is the doctrine file for
PoF's long-running harness — an orchestrator that plans module areas, spawns
Claude Code CLI sessions to implement them, verifies with gates, self-heals, and
checkpoints green states. Its "Safety rails" section (around line 60) is the
clearest statement of this technique in the repo.

## The role split, stated as a division of labor

`tools/pof-mcp/README.md:20` puts it in one sentence:

> `pof_get_step` returns a **recipe** (canon-prefixed prompt + acceptance
> contract + UE asset targets), Claude does the actual generation/UE edits itself
> (using mcp-unreal), then `pof_submit_artifact` records the work and the
> **server** derives the pass/pending/fail/deferred verdict — Claude never
> self-grades.

The producer submits an artifact; it has no field in which to write a status.
The verdict is derived server-side from stored state. That is the technique's
step 2 with no hedging.

## The commandless-gate bug, and its uniform fix

The doctrine records the incident directly:

> **No gate self-certifies** — a gate with NO command runs nothing, so it reports
> `unverifiable` (never `passed:true`), uniformly for every gate type. `runGate`
> used to answer "No command specified — skipped" with `passed:true`, so any
> required custom/build/test/lint/typecheck gate configured without a command
> silently green-lit the area — only `ue-compile` had the honest treatment.

The asymmetric-hardening shape exactly: one gate type had been fixed where
someone hit the bug, and every other type kept the optimistic skip. The
correction gives a commandless gate the same consequences `ue-compile` already
had — it counts toward `requiredFailures`, is excluded from self-heal, and
records `verification:'unverifiable'`.

## Judging each gate by the signal that is reliable for it

`src/lib/harness/ue-gates.ts:1` documents why the compile gate is a from-source
UnrealBuildTool invocation judged by exit code, while the automation-test gate
runs the editor and is judged by **abslog content, never exit code**: the editor
"can crash on headless shutdown even after a clean run (per project convention we
never trust the editor's exit code)". Independence is not enough — an independent
observer reading an unreliable signal is independently wrong.

## The three-state ladder, per gate

`src/lib/harness/ue-visual-gate.ts:1` enumerates the outcomes for the only gate
that observes the built game actually boot and render:

- no UE env → `unverifiable` (mirrors `ue-compile`)
- env present but no frame captured (boot failed / timed out) → `unverifiable`,
  because "an environmental capture failure is not a code failure"
- frame captured but black / near-empty → **fail** — a real observed failure
- frame captured and non-empty → pass; an optional VLM judge may override the
  floor to fail, but a judge *outage* never downgrades a captured frame

## Self-heal is bounded by the same rule

The doctrine: self-heal "only claims `healed` when a real verify command re-ran
clean; with no verify command it returns `healed:false` with a reason (never
optimistically advances), and it is skipped entirely for `unverifiable` gates (a
missing UE env is not a code error to fix)."

## Where the advisory exception is taken

The game-runs gate is opt-in and `required:false` — a headless boot costs
minutes, so it is de-duped per `(statePath, iteration)`: the game boots once per
iteration and every concurrent area shares that frame. This is the technique's
"when NOT to use this" clause applied deliberately rather than by omission — the
gate stays independent, it simply does not block.
