---
layer: application
type: application
subject: judge-calibration-and-drift
technique: fit-and-report-on-disjoint-labels
stack: rust
status: forged
verified_on: 2026-09-15
verified_against: rust@1.96.1
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# One golden set doing three jobs, in LightTrack's calibration (Rust)

The witness for `rust@1.96.1` is `rust-toolchain.toml`. The tree was read at
`d6c0324`.

## The structural fact

LightTrack keeps exactly one human-labeled set per rubric, which lives in the
database since its M11 milestone (`docs/CALIBRATION.md`). That set does three
jobs:

- it produces the trust record gates consult (`GET /v1/judges/trust`)
- it drives the drift sentinel
- it hosts judge and method comparisons

The calibration record is keyed by project, rubric and judge. Nothing in the
record, the dataset or the CLI distinguishes items used to *choose* from items
used to *certify*. No code path names a split. That absence is the finding:
the tree can measure agreement well (kappa, bias, power caveats, per-item
tables), but it cannot express "this judge was fitted here and certified
there".

## Three cases, under A (one set) and B (disjoint fit and report sets)

**1. The default judge.** The runner's `--model` help text records why the
default judge is the strongest tier: on a 12-item golden set the cheaper
candidate separated good from bad by 0.45, and the chosen one by 0.63
(`crates/runner/src/cli.rs:16`).

- *Under A:* 0.63 is the chosen judge's evidence, and a trust record
  computed on the same items inherits the selection.
- *Under B:* the choice is made on those 12 items, and the winner is re-run
  once on items the bake-off never saw. That re-run's figure becomes the
  quoted one.
- *Prediction:* the winner's spread on unseen items is below 0.63, and the
  0.18 gap narrows, because two noisy estimates on twelve items were
  compared and the larger was kept.
- *Falsifier:* the re-run holds at or above 0.63 with its interval clear of
  0.45.

**2. Batch-method adoption.** `calibrate --compare-batch N` is documented
to reuse "a set you already calibrated", which is correct for a paired
method delta.

- *Under A:* when the comparison shows few pass/fail flips, batching is
  adopted and the same set's kappa stands as the batched judge's trust,
  although the batch size was picked to look good on that set.
- *Under B:* the batch size is chosen on the fit set, and trust is
  recalibrated for the batched method on the report set.
- *Prediction:* flips on the report set are at least as many as on the fit
  set.
- *Falsifier:* consistently fewer.

**3. Rubric revision from graded events.** A graded production event can
be promoted into the golden set with its human grade copied onto it. A
rubric edit mints a new version, which starts `unknown`.

- *Under A:* the events whose disagreements motivated the edit are also the
  items the new version is calibrated on, so the version is certified on
  its own training examples.
- *Under B:* those events are tagged as fitting material for that version
  and excluded from its trust calibration.
- *Prediction:* the new version's kappa on untagged items is lower than on
  all items.
- *Falsifier:* no difference beyond the interval.

## Why unmeasurable, and what would measure it

The instrument that would decide all three is a second, disjoint labeled
round for one rubric: a report split the bake-off, the batch choice and the
rubric edit never read. The 12-item set named in the help text is not in the
repository, and no second labeled round exists, so no arm is runnable in this
tree today. The return condition is the first rubric that gains a second
labeling round.

## What this realization cannot do

- It has no notion of a fitting step, so it cannot warn that a trust record
  rests on items that shaped the judge.
- Its per-item comparison tables and low-power caveats are the right
  instruments for a method delta. They are silent on selection bias, which
  is a property of what happened *after* the comparison.
