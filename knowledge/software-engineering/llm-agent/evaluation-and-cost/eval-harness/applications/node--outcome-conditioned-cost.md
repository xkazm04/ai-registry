---
layer: application
type: application
subject: eval-harness
technique: outcome-conditioned-cost
stack: node
verified_on: 2026-09-04
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# Two witnesses: a published paired report that conditions, and a lab grid that did not

This document carries two trees, because the technique's source and its apply
target share a stack. The first is a published agent benchmark that
implements the rule; the second is a desktop lab whose aggregation had the
defect the rule describes, where the change was made and measured.

## Witness one: the report that conditions

A local-first code-search tool publishes a paired report over 300 trials (100
cases, three trials each) comparing an agent with and without its retrieval
tool. Its primary table averages every completed trial. Beneath it sits a
second table over the 294 trials where **both** arms answered correctly, with
the reason stated in the document: resource use "may reflect an unsuccessful
trajectory — for example, premature stopping or prolonged, unfocused
searching when the model cannot resolve the task — rather than retrieval
efficiency."

The two views do not agree, and the disagreement is the technique's point.
Unconditioned, input tokens fall 37.56%; conditioned on both arms succeeding,
they fall 39.50%. Tool calls move −43.52% to −44.64%, agent time −38.58% to
−37.89%. The gaps are small here because accuracy was near-saturated (98.67%
baseline, 99.00% treatment) so the two populations barely differ — which is
itself the reading the pair licenses, and which a single table could not have
supported either way. The subset size travels with the figures: `294` against
a completed `300`.

The version witnessed is the repository at commit `7d73ca1`, whose
`package.json` pins `node >= 22`.

## Witness two: the grid that mixed denominators

A desktop agent lab aggregates eval samples into a version leaderboard
(`src/features/agents/sub_lab/libs/evalAggregation.ts`). Its three quality
metrics each carry their own scored-sample counter and its own comment says
so — *"Null scores (unscored / failed executions) are excluded from
averages."* In the same accumulation, `totalCost`, `totalTokens` and
`totalDuration` were summed over **every** sample, and `avgDuration` divided
by the unconditioned `count`.

So one leaderboard row mixed two denominators, and disclosed neither. A
variant whose samples crashed early contributed near-zero cost to its total
and nothing to its averages, and appeared beside a variant that finished its
work as the cheaper of the two. The record type carried `status` and
`errorMessage` fields that the aggregation never read.

This was not an oversight the tree had failed to think about: an existing
test pinned the behaviour by name — *"counts duration and cost across all
results regardless of null scores"* — which is the correct primary and the
technique agrees with it. What was missing was the conditioned counterpart
beside it.

## What A and B were

Arm A is the aggregation as it stood. Arm B adds, per version and per grid
cell, the denominator the quality metrics already used (`scoredCount`), the
samples that never completed (`incompleteCount`, in neither view), and the
conditioned `scoredCost` / `scoredTokens` / `avgScoredDuration`. The
unconditioned totals are unchanged, so the primary and its pinning test
survive intact.

The measurable is whether the sign of a cost comparison survives
conditioning. The fixture: two variants, two samples each; one variant
finishes both at 0.20 each, the other spends 0.29 on the sample it completes
and 0.01 on the one that fails.

| Reading | Variant A | Variant B | Verdict |
| --- | ---: | ---: | --- |
| `totalCost` (arm A) | 0.40 | 0.30 | B is cheaper |
| `scoredCost / scoredCount` (arm B) | 0.20 | 0.29 | **A is cheaper** |

The comparison inverts. Under arm A the reader concludes the second variant
is 25% cheaper; under arm B they see it is 45% dearer per completed sample
and that it completed half as many. Cost figures whose denominator is
disclosed went from 0 of 3 to 3 of 3.

Instruments: the file's own vitest suite (7 passing before, 9 after — the two
added cases are the table above and the incomplete-sample split) and a
project-wide `tsc --noEmit`, clean.

## What this realization cannot do

The scored/unscored split here is derived from whether a sample produced any
of the three metric scores, which is the best verdict this schema offers and
is not the same thing as a task-level success predicate. A sample that was
scored badly is scored, and enters the conditioned denominator. The technique
asks for conditioning on a *verdict*; this tree conditions on the presence of
one, and the gap should close if a pass predicate is ever added to the
record.

The grid also has no display for the new fields yet — they are computed and
exported, not yet rendered — so the defect is fixed at the aggregation
boundary and still visible to a reader of the current UI.
