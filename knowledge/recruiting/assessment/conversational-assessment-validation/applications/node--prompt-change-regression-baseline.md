---
layer: application
type: application
subject: conversational-assessment-validation
technique: prompt-change-regression-baseline
stack: node
status: forged
verified_on: 2026-09-27
verified_against: node@24
applied: code
ab_verdict: better
---

# A cell-by-cell brief diff with seven classes, and the pin it was missing

Read on 2026-09-27 at the tree's main, `71f94335b`. The instrument is the
TypeScript interview simulator's diff, `app/_lib/interview-sim/baseline-diff.ts`.
The verdict CLI (`scripts/interview-sim-verdict.ts`) runs it as
`--baseline <earlier verdict dir>`, optionally with `--targets <ids>`, and
refuses `--targets` alone: *"a target only means something in a comparison"*.

## The question it answers

The header states the technique's question in the technique's words: *"The
question a validation run answers after a brief or director edit is not 'did the
new version pass' but 'did anything that used to pass now fail'"*. A cell is one
situation × one invariant. Each side of it is a rate, k failures over n
evaluable samples of that situation, not a single pass or fail.

Every cell lands in exactly one of seven classes (`DIFF_CLASSES`):
- `nonlocal_regression`, blocking on the reliability axis;
- `targeted_regression`, a fix that made its own target worse, also blocking;
- `intended_improvement`;
- `nonlocal_improvement`, *"reported with suspicion: it is often the instrument
  turning more conservative, which fails elsewhere"*;
- `noise`;
- `unchanged`;
- `not_comparable`, which carries its reason.

A regression is a result, not a crash: *"the CLI still exits 0; `blocking` is
the verdict a release reads."*

## Noise from the baseline's own spread

A flip is `noise` when the baseline cell itself flipped across its own samples
and the candidate's result is not improbable at that rate: a one-sided binomial
tail at `NOISE_ALPHA = 0.05` (`withinSpread`). A baseline cell that never
flipped, or ran once, has no spread, so every flip against it is real. That is
the technique's "establish the spread first" rule made into arithmetic. When
both sides ran the same instrument, the whole diff is declared a spread
measurement and no cell may be an improvement or a regression.

## What pins a comparison

`not_comparable` is where the pins live. A cell is not comparable when:
- the cast changed, or is unknown (`situationSha`, never assumed equal);
- one side could not evaluate it (`not_provoked` or `not_evaluable`);
- the judge rubric version changed, for judged cells;
- the situation ran on one side only.

The instrument side was `{ briefSha, directorVersion }`.

## Applied: the engine is part of the instrument

That key left out the engine. Every conversation's verdicts already recorded
`providers.interviewer`, the model that played the interviewer, but the diff's
`instrumentKey` read only the brief and the director. A candidate run of the
unchanged brief on another model therefore counted as "same instrument on both
sides". Every flipped cell was classed `noise`, and a reliability regression
caused by the model swap could not block.

Arm A, the shipped key, on a new test case: the same brief with the interviewer
engine changed and one reliability cell going from pass to fail gives
`instrumentChanged: false`, the cell classed `noise`, `blocking: false`. Arm B,
the key extended with `providers.interviewer`, gives an instrument change, the
cell classed `nonlocal_regression`, `blocking: true`. A side that never recorded
its engine is not assumed to match one that did, which is the same rule the diff
already applied to the cast.

Committed as `f39924f81` (case 6b in `baseline-diff.test.ts`). The simulator's
diff, verdict-run and end-to-end suites pass 17 of 17, and `tsc --noEmit` is
clean. Not pushed, because the tree's main has diverged from its origin with
other sessions' commits.

## Deviations

- **No committed baseline, and no spread yet.** No verdict run is stored
  in-tree. The noise rule can only use a spread that a repeated baseline run
  measured, and none has been recorded, so today every flip against a
  single-sample baseline is treated as real.
- **The Python harness's baseline** (`write_baseline` / `diff_baseline` in
  `interview_eval.py`) stores one cell per scenario, holding `reliable` and
  `quality`, with no invariant axis, no cast, engine or rubric pin, and no
  spread. Its quality regression is a fixed drop of two points on the 1-5 judge
  scale, not a measured spread.
- **The Python optimiser's accept rule** (`interview_optimize.py`, `_accept` and
  `split_scenarios`) differs from the technique's. It fits on an interleaved
  train fold and accepts only when held-out reliability strictly improves and
  no previously reliable validation scenario fails. That meets the
  zero-regression half and holds out data. It does not re-run a fresh sample of
  passing cases each round, and the design doc (§4.4) still describes the older
  rule.
