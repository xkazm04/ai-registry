---
layer: application
type: application
subject: agent-memory
technique: observation-clock
stack: rust
status: forged
verified_on: 2026-09-17
verified_against: rust@1.80
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# The consolidation prompt that prints every instant and never says now (personas)

The stack version is the minimum the crates declare (`rust-version = "1.80.0"` in
`src-tauri/Cargo.toml`). The seam is the companion's consolidation pass, which distils
recent episodes into semantic facts in one model call. This document also covers the
memory-year harness that measures that pass, because the harness is why the verdict is
`unmeasurable`.

## The seam

`src-tauri/src/companion/brain/consolidation.rs:1166 "fn build_consolidation_prompt("`
builds the whole prompt by hand. It gets one half of the technique right. Each episode
reaches the model under a header carrying its own instant
(`src-tauri/src/companion/brain/consolidation.rs:1253 "created = ep.created_at,"`),
so the observation clock is present, per episode, which is the input the vendor library
above cannot supply.

It misses the other half. The prompt never states *now*, and never asks for relative
references to be resolved against the episode's instant. Its own rules use the word it
never defines:
`src-tauri/src/companion/brain/consolidation.rs:1191 "is an episode, not a fact"` closes
a sentence that begins "User asked X today". The model has every instant it needs and no
instruction to use them, so the technique's second consequence applies: a pass that shows
instants and does not require grounding leaves the choice to the model.

## Why no arm could be run

The obvious measurement is the memory-year ladder, and it cannot see this decision:

- Of the 3,571 events in the replayed simulated year, **12** carry a relative time
  reference. All 12 use one template, "X is Y from today, not Z". No probe asks for a date
  that a relative phrase supplied. Every arm on the ladder scores the same on this axis,
  whichever clock it grounds against.
- The year run consolidates at 23:00 of each simulated day
  (`evals/memory-year/memory_year/run.py:104 "backend.consolidate(Clock(day_seen, 23 * 60))"`),
  so a phrase is distilled within hours of being said. Grounding against the writer's
  clock lands on the right date by accident.
- Until this run, the harness's clock-purity check masked every date before comparing
  replays, so it could not have caught a rendered wall-clock date either. That is fixed on
  a branch (see the eval-harness application for rebase-the-varied-input).

## Simulation (three cases from this tree)

1. **The scenario's own template.** "the hosting is a Hetzner box from today, not Fly.io",
   consolidated the same night. A (today): the fact keeps "from today" or grounds it
   correctly. B (now stated, grounding required): grounded. Predicted outcome: the same on
   the ladder, because the gap is under a day. Falsifier: a ladder difference between A and
   B on this scenario, which would mean some other axis moved.
2. **A deferred pass.** The pass stalls and the next cycle runs three days later (the
   harness has recorded a 300-second cycle timeout on day 326). A: "next Tuesday" is kept
   verbatim or grounded from an unstated now. B: grounded to the episode's week. Falsifier:
   under A, stored fact values with no relative phrase and correct dates across a
   multi-day gap.
3. **A reinstall that re-imports history.** Episodes keep their original timestamps. A:
   the model sees correct instants but may still ground "last month" against its own sense
   of now. B: grounded per episode. Falsifier: as in case 2.

## What this realization cannot do

It cannot prove the defect costs anything, and that is the finding. The instrument built
to price memory designs does not exercise this decision.

Return condition: extend the memory-year scenario so events carry relative references with
an absolute ground-truth date, add a probe class that asks for that date, and allow a
consolidation lag of several days (or a backfill). Then run the current prompt against one
that states now and requires grounding, as a paired arm.
