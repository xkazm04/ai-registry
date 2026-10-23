---
layer: application
type: application
subject: state-budget-analysis
technique: median-over-mean-for-peers
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The floor held because of the data, so it now holds by construction

The politicas budget mirror (`/rozpocty`) at commit `1e02bab` (2026-10-22; the
version witness is the CI workflow's `node-version: 24`) computes its peer
benchmark in `features/budget/peerGroups.ts`. The sibling application
(peer-group construction) already records that `median` returns null on an
empty sample, that a peer without a value drops out of that metric's median,
and that `sampleSize` reports only the debt sample. Since then the repo added a
pin test asserting that, over the real batch, the capex and saldo samples equal
the debt sample, so the one printed count is true for all three medians. Rules
1 to 3 were already held.

## The seam, chosen to falsify decision rule 1

The rule still open was the first decision rule: apply the published minimum to
each metric's **valid reporting peers after widening**, and below it withhold
the normative verdict. In the tree the minimum (`MIN_PEERS = 5`) gates only
widening: `peerGroupFor` widens a regional group nationally when the region
holds fewer than five covered towns. Nothing then checks the widened group or
the year's actual reporters against the floor. `compareToPeer` turned any
non-null median into `better` / `worse`, and `MetricDuo` painted `worse` in
signal red.

A caught outcome would have been towns judged red against a median of two or
three peers, which would show that widening is not a floor. That would move the
rule from group construction to the verdict, where the technique already places
it.

## What was read

The arms ran over the batch the page ships: 132 towns with series for
2021-2025, each grouped by the page's own call and medians taken at the town's
own latest year index.

- Headline sample per town: the smallest is **exactly 5** (18 towns), then 6
  (7), 7 (8), 9 (10), 11 (12), 14 (15), 45 (31) and 67 (31). Eighty towns have
  nationally widened groups.
- Debt-trend points (132 x 5 = 660): none falls below 5 reporters and none is
  empty.

So the finding held, but only because of the data: no band in today's batch
has fewer than five reporters after widening. A thinner batch, or a narrower
year, would have produced red verdicts against sub-floor medians with nothing
to stop them.

## The change and its proof (`ab-paired`)

`compareToPeer` takes the median's sample size and returns `incomparable` below
`MIN_PEERS`. `MetricDuo` passes `medians.sampleSize`. The median and its count
still print as a description, which the technique allows. Only the verdict is
withheld.

- **Target**: normative verdicts issued on a sub-floor sample. Arm A ignores the
  sample, so a new fixture test (sample 4, town worse) fails with `worse`. Arm B
  returns `incomparable`, and the same test passes.
- **Floor**: no verdict on the real batch moves. A second new test compares
  every town's three verdicts with and without the sample size, and finds no
  difference on either arm. The budget suite ran 100 tests green, and the
  pre-push gate ran 4,219 tests green, plus tsc, eslint and doc-sync. The
  pre-push copy check printed its own "not installed - SKIPPED".

Shipped as politicas `0f1f84f` plus the applied row `1e02bab`, pushed to
`master`.

## What this realization cannot do

- The debt-trend line still draws a median at any sample size. Today every
  point has five or more reporters, but the chart has no per-point count and no
  gap rule below the floor. The technique's per-point rule is met by the data,
  not by the code.
- The peer table sorts the town among its peers by debt without a sample check.
  It prints no rank, so the "3rd of 7 wearing a bigger denominator" rule has
  nothing to bite on yet. A printed rank would owe the same guard.
- The pin fails the moment a sub-floor band appears. That is deliberate: the
  surface already withholds the verdict, and the test asks a human to rewrite
  the pin, not the guard.
