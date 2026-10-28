---
layer: application
type: application
subject: claimed-improvement-remeasurement
technique: three-way-verdict-over-raw-samples
stack: node
status: forged
verified_on: 2026-10-27
---

# The re-measure judge and the claim it never reads (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). A server that lets a development agent report "my
change will move this CI stage down", then credits the claim only from its own re-measure of
the project's pipeline runs. Two files carry the verdict, a third keeps the claimant out of it,
and a model-free proof checker supplies the tolerance constants and the ceiling rule.

## The claim is parsed strictly and its figure only displayed

`src/server/vitals/report/claim.ts:3` states the channel split: "the agent's own figure is kept
as `agentValue` and is only ever displayed: the verdict is Afterlife's re-measure". The parser
refuses unknown keys (`src/server/vitals/report/claim.ts:81`) and refuses a claimant-supplied id or timestamp outright
— `src/server/vitals/report/claim.ts:79` "leave them out" — so a claim cannot be
backdated into a window that suits it. A search of the server tree finds `agentValue` and
`expectedPct` read only by the parser and by two display components; neither reaches the judge.
That is claimant-figure-never-decides, confirmed.

One field does cross: `direction` (`src/server/vitals/report/claim.ts:86` "direction must be down or up") is passed
straight into the verdict at `src/server/vitals/measure/passive.ts:75` "direction:
claim.direction". For a duration target the better direction is a property of the metric, so a
claim stating `up` on a CI stage would be credited for slowing it. **Deviation**: direction
should be fixed per target kind and the claim's stated direction checked against it.

## The verdict, in the order the header promises

`src/server/vitals/measure/judge.ts:1-7` is the whole technique as a comment: medians of two raw
sample sets, "The claim's own figure never reaches this file", then the four exits in order —
too few samples, noisy, credited, not-earned. The code follows it:

- the floor is per side and depends on the metric's nature — `src/server/vitals/measure/judge.ts:58` "o.wall === false ? 1
  : MIN_WALL_SAMPLES", with `MIN_WALL_SAMPLES = 3` at `src/server/vitals/measure/judge.ts:12` — so a wall time needs three
  runs a side and a deterministic local metric one;
- the noise exit is a multiple of the tolerance — `src/server/vitals/measure/judge.ts:60` "const noisy = 2 * tolerance;"
  and `src/server/vitals/measure/judge.ts:61` checks both sides' spread against it;
- the zero base is its own inconclusive exit — `src/server/vitals/measure/judge.ts:64` "the base median is 0: no change
  can be measured against it";
- within-tolerance and worse are both not-earned with different reasons (`src/server/vitals/measure/judge.ts:68-69`).

Spread is the range over the median — `src/server/vitals/measure/judge.ts:30` "spread ((max - min) / median" — which is
what three to five samples support; at larger counts the technique prefers an interquartile or
median-absolute-deviation spread, which this judge does not yet use. Samples come only from
successful runs and stages: `src/server/vitals/measure/samples.ts:16` returns a run's minutes
only when "run.result === 'succeeded'", so a failed run's duration never enters a median.

## The tolerance ceiling comes from the evidence checker's reasoning

The judge's clamp is `src/server/vitals/measure/judge.ts:40-43`: a missing or non-fraction tolerance takes the default,
and any other is "never above the ceiling" via `Math.min(t, DEFAULT_MAX_TOLERANCE)`. The
constants live in `engine/proofs/checkers/benchDelta.ts:22-23` (0.05 and 0.1), and that file's
header states why a ceiling exists at all — `engine/proofs/checkers/benchDelta.ts:8` "that job runs in the pipeline the
change can edit, so it may not exceed the policy's ceiling". That sentence is the **upward
lesson** folded into the technique: a tolerance an evidence job states is the judged party's
margin. The checker is stricter than the judge — a wider tolerance *fails* the check and names
both numbers (`engine/proofs/checkers/benchDelta.ts:74`) where the judge clamps silently. The checker also adds the
comparability exit the technique now carries: `engine/proofs/checkers/benchDelta.ts:101` "runner tags differ ... the
benchmarks are not comparable" yields an inconclusive check, never a delta. And it shows the
zero-base asymmetry: for a regression check, `engine/proofs/checkers/benchDelta.ts:111` treats any worse move from zero
as beyond every fraction, while the judge, crediting a gain, calls a zero base unmeasurable.

## Waiting is not a verdict

The passive path never writes an inconclusive verdict for a shortfall time will cure:
`src/server/vitals/measure/passive.ts:4-5` "Both sides need MIN_WALL_SAMPLES before a Measurement is appended; until then
the answer is "waiting: k of N after"", implemented at `src/server/vitals/measure/passive.ts:90-91`. Only a completed
queued batch with too few usable runs reaches the judge's too-few exit — the **upward lesson**
that split waiting from inconclusive in the technique.
