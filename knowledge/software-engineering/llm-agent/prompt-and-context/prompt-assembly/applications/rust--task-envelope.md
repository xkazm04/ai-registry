---
layer: application
type: application
subject: prompt-assembly
technique: task-envelope
stack: rust
verified_on: 2026-08-25
verified_against: rust@1.96
---

# Task envelopes for dispatched coding terminals (companion orchestrator, Rust)

A desktop companion that dispatches unattended coding sessions — a dev-mode
change in an isolated worktree, an overnight fleet worker, a one-shot review
resolution — and builds every task prompt Rust-side so the paths come from
the project's context map, never from the model's memory of the tree.
Four prompts were read on 2026-08-25; they are a near-complete instance of
the technique, with one gap the tree had not noticed and this run closed.

## Locate, done, check — as the tree already had them

`src-tauri/src/companion/dev_mode.rs` `build_task_prompt` (`:983`) opens with
one sentence of identity and spends the rest on the envelope:

- **Locate** is a whole section — `## Where (from the project context map —
  start here, verify by reading)` — listing the resolved context's files,
  capped at 40 with an explicit "…and N more". The doc comment states why
  the paths are assembled Rust-side: determinism over recall. This is the
  locate pointer in its strongest form: derived from an authority, and
  telling the model to verify by reading rather than trust the list.
- **Done** is the `## Discipline` block: atomic commits, a 2–4 sentence
  summary naming files, then `/exit`. The `/exit` line carries its own
  provenance — "Live finding 2026-07-04: the first dispatched session sat
  open 10+ minutes after committing" — which is the technique's claim that
  an unattended session without a done criterion runs until its own sense
  of completeness fires, observed in production before the rule was
  written.
- **Check** was absent. The prompt told the worker what to produce and
  when to stop; nothing told it to compare the result to the request
  before reporting. Added this run (see below).

`src-tauri/src/companion/night_shift/planner.rs` `worker_prompt` (`:170`)
has the same shape: objective, hard rules restated in full, stop
conditions, "summarize and end". It had a *gate* ("run the repo's own
checks/tests before finishing") but no check against the objective — a
gate proves the tree compiles, not that the objective was met.

`src-tauri/src/companion/session/build_turn.rs` `build_system_prompt`
(`:72`) is the interesting counter-case: its web-build doctrine carries an
explicit **"Self-critique before done"** section that *does* use role
words — "as a senior engineer AND a demanding design lead" — but the
sentence that follows is a concrete checklist (click every nav item,
check alignment at three widths, run the typecheck). The role words are
decoration on a check the model can actually perform; the checklist is
what does the work. Consistent with the technique: priming is harmless
where a real check sits beside it, and it is the check that earns the
line.

## The identity lines that stay

Every one of these prompts opens with "You are …", and none of them is
competence priming. `dev_mode`: "dispatched by Athena … at the user's
approval" — the worker's authority and its reviewer. `planner`: "an
unattended night-shift worker … supervised by Athena" — autonomy level
and escalation path, followed by the MCP tools that path uses.
`athena_reaction.rs` `build_review_resolution_prompt` (`:971`): "the
autonomous orchestrator … running unattended; the human is away … the
resolution authority of last resort" — every clause changes what the
model is *allowed* to decide. These pass the technique's test (removing
the line changes permissions, not mood) and are the clearest live
illustration of it: the tree spends identity words on the relationship,
and the relationship is unreachable — nothing in the repository tells a
fresh session who dispatched it or what it may approve.

The companion's own chat identity lives elsewhere
(`src-tauri/src/companion/templates/constitution.md`, "You are a deep
generalist …") and is a product decision under
[layered-composition](../techniques/layered-composition.md) — the
identity layer the technique explicitly leaves alone. The tree already
separates the two uses of "you are" by file, which is more than most.

## What changed this run

Two lines, one per dispatched-worker prompt, with test assertions:

- `dev_mode.rs` — before the summary, "verify against the request — from
  the files, not from memory: re-read each file you changed, confirm the
  change does what `## The change` asks and nothing it did not ask, and
  confirm every touched file is in a commit. Name anything you could not
  verify."
- `planner.rs` — before ending, "check the OBJECTIVE against what actually
  landed on the branch (the log and diff, not your memory of the work) …
  A stop condition that fired is reported as a stop, never as completion."

Both are written as reads of the artifact, not as "verify your work",
because the technique's [gate-sees-target](../../../../_laws.md#gate-sees-target)
clause is the whole point: the first version of any self-check line is a
gate that inspects the model's memory of the work.

## What this realization cannot show

No A/B exists for the envelope: the 1,026-turn bench this repository runs
(`docs/plans/athena-model-bench-report.md`) measures model and effort
routing on the companion's *chat* turns, not dispatched-worker prompts.
Whether the added check line changes the rate of "committed but wrong"
dispatches is unmeasured until the dev-op ledger (`companion_dev_op`,
`user_verdict`) is read across enough runs with and without it. The tree
proves the *shape* the technique asks for; it does not yet prove the
effect.
