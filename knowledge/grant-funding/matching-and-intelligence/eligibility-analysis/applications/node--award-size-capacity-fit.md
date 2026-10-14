---
layer: application
type: application
subject: eligibility-analysis
technique: award-size-capacity-fit
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
applied: code
ab_verdict: better
---

# Node: the capacity gate and the currency fallback

The gate in a grant-matching engine's deterministic eligibility module already
followed most of the technique: a missing bound is open (`floor = published ?? 0`,
`ceiling = published ?? Infinity`), no range and no revenue return unknown (the
latter asking for the figure), only `floor > revenue` fails, the 5-40% band is
computed from revenue, and the coalition pointer rides only a sole capacity fail.

## The seam chosen to falsify

The technique says to compare on a normalized pair and fall back to native
amounts only when the currencies genuinely match. The gate read
`awardFloorUsd ?? awardFloor`. The USD pair is null when the currency has no pinned
rate (`toUsd` refuses to guess), so for such a grant the fallback read the native
amount as dollars. Pass/fail then depended on the exchange rate being ignored:
a PLN 2,000,000 floor failed a USD 620k organization as a "capacity mismatch",
and a PLN 100k-200k range passed as a sweet-spot fit.

Had the gate held, the check would have been corroborated at a seam that could
have killed it; it did not hold at this one.

## A and B

- A (as shipped): the two new tests for an unconvertible-currency grant fail
  (fail where unknown was owed; pass where unknown was owed).
- B: the native amount stands in only for a blank or USD currency; otherwise the
  gate returns unknown with a detail naming the currency. A legacy row with no
  currency still reads as dollars (test kept). Floor: 219 match-engine tests, tsc
  and eslint green.

Not measured: how many live rows carry an unrated currency. Two sibling readers
(`grant-ingest/scoring.ts`, `funder-desk/strategy.ts`) use the same fallback
pattern and were not changed.
