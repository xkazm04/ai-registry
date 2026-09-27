---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: stage-pass-through-and-dwell-time
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
proof: structural-only
---

# Candidate-side transition history with explicit dwell exclusions

Career-ops declares Node `>=18` in `package.json`. This source reading is pinned
to commit `6ddfca5aaa1a488bd55b0c1eca80d6896f855062`.

Current application status cannot reconstruct the time spent between stages.
The [data contract](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/DATA_CONTRACT.md)
therefore keeps the tracker authoritative for current state and an append-only
transition ledger for observed dates. Corrections append instead of rewriting
the historical record. This buys inspectable timing provenance without treating
an imported or manually reconstructed date as an observed transition.

The [velocity calculation](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/funnel-velocity.mjs#L200)
selects the first day-math-trusted entry into a hop's starting state and the next
trusted observation of its destination. It excludes negative or invalid durations,
counts same-day exclusions, and suppresses medians below its minimum sample.
Still-waiting observations have a separate counter rather than an invented exit.

The [renderer](https://github.com/career-ops-hq/career-ops/blob/6ddfca5aaa1a488bd55b0c1eca80d6896f855062/funnel-velocity.mjs#L454)
keeps the completed sample, waiting exclusions, and same-day exclusions beside
the median and percentile. It also reports how many tracker rows have dated
transitions. An empty ledger produces an explicit unavailable measurement.

## Limits when adapting to a hiring funnel

This is a per-application milestone measure, not a general repeated-stage dwell
engine. First-entry selection does not model every return to a stage. Same-day
exclusion is an explicit source policy for catch-up observations; copying it
would remove genuine zero-day transitions in a system with reliable timestamps.
The waiting counter only increments when the starting observation is last in
the timeline. Other terminal or intervening outcomes are not thereby counted as
waiting, nor is this a survival-analysis estimate.

Keep employer-side rejection, candidate withdrawal, completed passage, and
current residence distinct when adapting the pattern. Candidate-side response
history also cannot supply the employer's internal screening timestamps.

## Verification

The parser, folding, calculation, and rendering sections were read on 2026-09-10.
`node funnel-velocity.mjs --self-test` could not start then: the clean clone lacked
`js-yaml`.

On 2026-09-28 the source's dependencies were installed and the self-test run on
Node 24.14 at the pinned commit. It passed, and it passed again at upstream
`2d0285ab` (2026-09-27), where `funnel-velocity.mjs` is unchanged since the pin
and `package.json` still declares `>=18`. A mutation control failed as expected:
with the `p75` interpolation removed, the run exited 1 on its `[3,6,20] -> 13`
fixture. The passing fixtures cover:
- same-day exclusion, which is counted;
- still-waiting censoring, which the rejection hop does not double-count;
- median suppression below three completed hops;
- the empty-ledger message.

No fixture covers a row that returns to a stage it has already left, so
first-entry selection remains a reading of the code. These are the source's own
tests. No comparison against another dwell method was run.
