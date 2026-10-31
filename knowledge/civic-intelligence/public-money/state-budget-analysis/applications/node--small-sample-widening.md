---
layer: application
type: application
subject: state-budget-analysis
technique: small-sample-widening
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The floor applies to each metric's sample, not the debt metric's

The politicas budget mirror (`/rozpocty`) at commit `28c7865` (2026-10-31; the
version witness is the Dockerfile's `node:24-alpine` build stages) derives peer
groups in `features/budget/peerGroups.ts`. The sibling application on peer-group
construction records the ladder: `MIN_PEERS = 5` as a named constant with its
rationale beside it, widening from region to the national band and never across
bands, and the rung carried as data (`scope: "kraj" | "celostátní"`) and printed
with the peer count. The median-over-mean application records the verdict
guard: `compareToPeer` returns `incomparable` below `MIN_PEERS` reporting peers.
Procedure steps 1 to 4 were already held. A run on 2026-10-22 probed the
supplier-trail card for this technique and filed it as covered.

## The seam, chosen to falsify decision rule 4

Decision rule 4: when a sub-comparison over the same peers is reported by fewer
of them, *the floor applies again to the effective sample, not the nominal
group*. `peerMedians` already computed each metric's median from that metric's
own reporters: a peer that did not report capex dropped out of the capex median.
But it returned one count, `sampleSize`, which is the **debt** sample, and the
page passed that one count to all three `MetricDuo` verdicts. A capex median
over four towns would still have painted a town red as long as five towns
reported debt.

A caught outcome would have been verdicts in the shipped batch that stood on a
capex or saldo sample below five. That would show that a guard on the headline
sample is not a guard on the metric.

## What was read

The probe ran the page's own calls (`peerGroupFor`, then `peerMedians` at the
town's latest year index) over the batch the page ships: 132 towns, 2021-2025,
80 of them in nationally widened groups.

- Towns where a capex or saldo sample differs from the debt sample: **0 of 132**.
  The smallest debt, capex and saldo samples are all exactly 5.
- Verdicts that would change if each metric used its own sample: **0 of 264**
  (capex and saldo).

So the rule held because of the data, not because of the code. The tree knew
this: a test asserted the three samples are equal over the real batch, and its
comment named the fix ("either print the count per metric, or split
`sampleSize` into three"). That made the rule a tripwire. The first batch
refresh that thinned one metric would have turned the gate red and blocked the
data refresh until somebody wrote the fix under pressure. It would not have
rendered correctly on its own.

## The change and its proof (`ab-paired`)

- `PeerMedians.samples` carries `{ debt, capex, saldo }`. `sampleSize` stays as
  the debt count that the `peerRule` sentence prints.
- Each `MetricDuo` passes its own sample to `compareToPeer`, and prints the
  existing `peerTownCount` string beside the median whenever that sample differs
  from the sentence's count. No new copy is needed.
- The equality test becomes an informational pin. When it fails, that only marks
  the first batch where the per-metric path is actually used.

Target: verdicts issued on a metric whose own sample is below `MIN_PEERS` while
the debt sample clears it. The fixture has five peers reporting debt and saldo
and four reporting capex. Arm A issues `worse` and the new test is red (1 of 20
in the file). Arm B returns `incomparable` for capex and keeps the saldo verdict.
Floor: no verdict and no printed string moves over the real batch (the probe
above). The pre-push gate passed typecheck and 4,221 tests. The copy gate
self-skipped in the worktree because the checker was not installed.

## What the tree shape says

The ladder (steps 1 to 3) was built by construction from the start. The
effective-sample rule was not, and two earlier fixes moved its guard one level
at a time. The first guarded the verdict on an empty median, the second guarded
it below the floor on the headline sample, and this one guards it on each
metric. Each fix took the previous count to be "the sample". The pattern
supports the technique's wording: a count that does not name the population it
counts gets reused for a population it does not describe.

## What this realization cannot do

The debt-trend chart still has no per-point guard below the floor. It plots a
median for every year that has at least one reporter, and no point in today's
batch falls below 5. The peer table does not rank, so the guard against a
sub-floor rank has nothing to apply to yet. Both are owed when a point falls
below 5 or the page prints a rank.
