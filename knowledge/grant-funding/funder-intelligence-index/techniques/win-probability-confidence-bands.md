---
layer: technique
type: technique
subject: funder-intelligence-index
technique: win-probability-confidence-bands
status: forged
laws: [honest-null-over-forced-guess, small-samples-stay-silent, never-fabricate-a-figure]
shared_with: []
use_when: [showing an applicant their odds before they invest in a proposal, merging live outcome signals over a curated prior, labeling an estimate's reliability]
---

# Win probability with confidence bands

"Organizations like yours win this funder N% of the time" is the most
valuable sentence the index can say to a user *before* they spend eighty
hours — and the most dangerous, because it will be believed. The technique
is a discipline for earning that belief: the estimate is a **base-rate
lookup** into an observed cell (the funder × applicant-size-band award
rate), the estimate always travels with a **confidence band driven by the
sample behind it**, and when no cell covers the user, the answer is **no
estimate** — never a synthesized number.

## Version zero is a lookup, and that is a feature

The temptation is to launch with a model — logistic regression over
keywords, geography, relationship history. Resist it until the base-rate
version has run long enough to validate against. A lookup of the observed
cell rate is transparent (the user can be shown exactly where the number
comes from), trivially auditable, and impossible to overfit. It is also the
baseline any later model must beat *on this dataset's own outcomes* before
it ships; a model that cannot beat the cell base rate is complexity spent
making the number less explainable. The fit-calibration audit (see
fit-calibration-monotonicity) is the same philosophy applied to whatever
score eventually augments the lookup.

## Confidence follows the sample, not the styling

Every displayed probability carries an ordinal confidence — high / medium /
low — that is a pure function of the application count behind the cell.
Thresholds in the hundreds are the right order of magnitude: a rate over
~800 applications has largely stopped moving (a binomial 95% interval near
p=6% is under ±2 points), a rate over ~200 is usable with visible
uncertainty, and anything thinner is *low* however clean it looks. Two
rules keep the band honest:

- The thresholds are named constants, disclosed in the methodology, and
  never adjusted per display context. A "high confidence" that means
  different things on two pages poisons both.
- The band is computed from the same cell row as the probability — one
  lookup returns both. A UI that fetches the rate from one source and the
  confidence from another will eventually pair them wrong.

Below the publication floor there is no cell at all (per
[small-samples-stay-silent](../../_laws.md#small-samples-stay-silent)), so
"low confidence" describes thin-but-publishable cells — it is not a fig
leaf for cells that should have been suppressed.

## No cell, no number

When the lookup finds no cell for the user's (funder, band) pair, the
output is null and the UI says "not enough data" — per
[honest-null-over-forced-guess](../../_laws.md#honest-null-over-forced-guess).
The forbidden fallbacks, each observed in the wild: the funder's overall
rate presented as personal (it isn't — band variation is the whole reason
the cell exists), a sector-wide average (a fabricated figure wearing a
percent sign, per
[never-fabricate-a-figure](../../_laws.md#never-fabricate-a-figure)), and a
neutral-looking 50% (the least likely value in a domain where real rates
cluster in single digits).

## Merging live signal over the curated prior, per cell

The estimate's data layer blends two row sets: curated cells (researched
figures seeding coverage) and observed cells (pooled outcomes). The merge
is **per cell, live-wins-when-qualified**: an observed cell replaces its
curated counterpart only when its sample clears the floor; below the floor
the curated prior stands and the thin observed cell is dropped, never
surfaced raw. This wiring deserves explicit attention because its failure
mode is silent: it is entirely possible to build the outcome recording on
one end and the aggregation on the other and leave the middle unconnected —
both halves test green, and no recorded outcome ever moves a displayed
probability. The connection is a testable unit: *record outcomes for a
cell until it clears the floor, and assert the displayed estimate moved.*

## Validate at the last mile

The displayed number is the product's most decision-relevant output, so the
display path defends itself against upstream shape errors. The classic:
rate stored as a percent (6.5) in one layer and a fraction (0.065) in
another — a unit confusion that turns a 6.5% funder into a "0.1%" or
"650%" display. Clamp into the valid range, reject non-finite values to a
suppressed display, and unit-test the boundary with values in both
conventions. A malformed cell must never surface a nonsense probability
with full UI confidence; the guard costs five lines and the incident costs
the product's credibility on exactly the number it sells.

## When not to use this

Do not present a probability where the user's decision is not
probabilistic: eligibility failures are hard gates, and showing "12%,
medium confidence" for an opportunity the user *may not apply to* invites
wasted hours the gate exists to prevent — the estimate renders only after
eligibility passes. And do not extend bands to arbitrary personalization
dimensions (geography × size × program × history) without the sample to
back each cell: every added dimension is another way to fall off-cell, and
the honest-null rule means the product goes silent exactly where it
pretended to be most personal.
