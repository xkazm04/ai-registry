---
layer: application
type: application
subject: politician-performance-scoring
technique: participatory-reweighting
stack: react
status: forged
verified_on: 2026-08-30
verified_against: react@19
---

# React — a reader lens over a published contribution index

The same accountability product publishes a six-component contribution index
(weights 25/20/20/15/10/10, `CONTRIBUTION_WEIGHTS` in
`lib/analysis/contribution.ts:25-32`) and lets readers re-weight it. The lens
is pure derivation modules consumed by the pages; no fetch, no state, fixture
tests alongside.

## The lens module and the boundary

`features/civicscore/lens.ts` implements the reader recomputation. Its header
comment (`lens.ts:6-25`) is the disclosed rule, verbatim in product language:

- Each component's **published fulfillment** is taken as published points
  divided by published weight — points are published to one decimal, so the
  lens computes "from what the reader actually sees on the page" and carries
  exactly that precision, no more (`lens.ts:7-10`).
- Reader slider values (0–100 per component) normalize to **effective
  weights** summing to 100, rounded to a decimal — so two lenses differing
  only in scale are the same lens (`lens.ts:11-13`).
- The custom index is Σ(fulfillment × effective weight), one decimal, ranked
  by competition ranking (1, 2, 2, 4) — the same rule as the official
  leaderboard, with the name-collation tie-break explicitly labeled
  meaningless on the surface (`lens.ts:14-17`).
- The critical boundary (`lens.ts:19-25`, in capitals in the source): the
  custom index is **never mixed** with the authoritative stored score. At
  default weights the lens does not run at all and the page shows the graph's
  numbers; the moment weights differ, *everything* — score, order, histogram,
  head-to-head — comes from the recomputation and is labeled "your index".
  Even the rounding caveat is disclosed: summed rounded component points can
  differ from the rounded composite by ~0.3, the same class of note the
  official breakdown admits.

The module imports `CONTRIBUTION_WEIGHTS` from the formula module
(`lens.ts:27`) rather than restating the published weights — the methodology
page's header comment records why this matters: an earlier surface had written
the weights as the string "25-20-20-15-10-10", which nothing connected to the
constants, so a weight change would have silently let it lie
(`features/civicscore/MetodikaPage.tsx:8-11`).

## Aggregating submitted lenses

`features/landing/referendum/aggregate.ts` aggregates reader-submitted weight
vectors into a "how readers would weigh it" surface. Its rules
(`aggregate.ts:13-25`):

- The lens codec is imported from `lens.ts` and never reimplemented
  (`aggregate.ts:5-9`); the only addition is a storage serialization, because
  the share-link codec deliberately encodes the published-default lens as null
  (a clean address) while the ballot store must record "I agree with the
  published methodology" as an explicit vote.
- Every vector is normalized to effective weights before aggregation, so scale
  duplicates collapse to one voice; a zero-sum vector carries no lens and is
  excluded (`aggregate.ts:14-17`).
- Medians are per-component over effective weights, and the surface admits
  they generally do not sum to 100 — nothing is renormalized into a lens
  nobody submitted (`aggregate.ts:18-20`).
- **K-anonymity**: the median exists only from `K_ANONYMITY_FLOOR` valid
  ballots; below the floor the aggregate returns null and the UI shows only
  the count — never a "median of few" that would effectively publish
  individual ballots (`aggregate.ts:21-23`).
- The aggregate is disclosed as reader **self-selection**, not a
  representative poll, on every surface that shows it (`aggregate.ts:24-25`).

## Comparison discipline inside the lens

Head-to-head views under the lens reuse the same pure comparison rules as the
official surfaces: `duelOutcome` (`features/civicscore/duel.ts:23-27`) treats
a gap that rounds to zero at published precision as a tie with no leader, and
`componentWinner` (`duel.ts:34-37`) compares the printed one-decimal values —
both added after the live surface was measured declaring a winner in 36
exactly-tied pairs and painting a winner onto 672 component cells that
displayed identical numbers on both sides.
