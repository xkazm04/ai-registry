---
layer: technique
type: technique
subject: peer-benchmarking
technique: population-vs-scalar-ranking
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [computing a percentile for an aggregate value, a benchmark shows everyone near the middle, choosing what one row of the corpus represents]
---

# Population vs scalar ranking

Every ranking has two sides: **one value** and **a set of values it is placed
among**. This technique is one rule — *both sides must be the same kind of
thing* — and the several ways that rule is broken by code that type-checks
perfectly.

## The canonical defect

A tenant's mean score is ranked against the distribution of **individual item
scores pooled across all tenants**. Both sides are numbers in the same range;
both are called "score"; the query is short and reads fine. It is wrong, and
wrong in a specific, directional way.

Averaging shrinks. A mean of twenty items sits closer to the centre of the
underlying distribution than a randomly drawn item does — that is what the
central limit theorem says, and the shrinkage grows with the number of items
averaged. So a mean placed inside a population of raw items lands nearer the
middle than the organization's true standing among *organizations*. Strong
performers are systematically understated; weak performers are
systematically flattered. Every tenant is biased toward 50th, nobody appears
as an outlier, and the surface therefore looks calm and plausible — which is
why this defect survives review for a long time. There is no error bar that
reveals it, because it is not noise; it is a mis-specified comparison.

Note the second-order unfairness: shrinkage scales with volume. The
organization with 400 measurements is pulled harder toward the centre than
the one with 12. The benchmark quietly penalizes the most-measured tenants
for being well measured.

## The rule and its procedure

**Aggregate first, then rank — and aggregate both sides to the same unit.**

1. **Decide what one row of the corpus represents.** One organization? One
   project? One item? That decision *is* the claim: "top 10% of
   organizations" and "top 10% of projects" are different sentences with
   different audiences.
2. **Reduce each corpus member to one value at that unit,** using the same
   reduction used for the subject. If the subject is shown a mean, peers
   contribute means; if a median, medians. Mixing reductions across the
   comparison is the same defect in a smaller costume.
3. **Reduce the subject identically,** from its own rows, over the same
   window and under the same
   [comparability-filters](./comparability-filters.md).
4. **Rank the subject's value within that set,** and state the unit in the
   output.

The cost is real and worth naming: aggregating the corpus per member before
ranking is a heavier computation than pooling rows, and the temptation to
pool is usually a performance temptation wearing a correctness mask. If the
aggregate-then-rank query is too slow, precompute the per-member aggregates —
the mechanics of stored folds belong to the rollups subject — but do not
change the question to fit the query plan.

## The choices the rule leaves open

- **Which reduction.** Means are volume-blind and outlier-sensitive; medians
  are robust and can be coarse in small item sets. Pick per metric, state
  which, keep it stable — a reduction that changes silently makes every
  historical position incomparable.
- **Members with thin evidence.** A peer with two measurements has a noisy
  mean that will sit at an extreme by chance and distort the tails of the
  corpus. Two honest options: a per-member minimum item count for corpus
  entry, or shrinking thin members toward the corpus mean. Either is
  defensible; both must be disclosed as part of the basis
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **Ties.** With coarse or banded scores, ties are common and the choice
  between "fraction strictly below" and "fraction below or equal" moves the
  headline by whole points. Pick the conservative form for the subject —
  strictly below, so a tie does not manufacture superiority — and apply it
  uniformly.
- **Inclusive or exclusive of self.** "Ahead of 40 of the other 47" and "40th
  of 48" are different denominators. Choose once, per surface, and say which.

## Multi-metric positions do not average either

A composite peer position is not the average of per-metric positions. Ranks
are ordinal; averaging them discards distributional shape and produces a
number with no interpretation — the "average percentile" of an organization
that is 99th on one metric and 1st on another is not a middling
organization. If a single overall position is required, rank on a composite
*score* computed by the scoring rubric, and rank that once. Composite
construction — weights, normalization, banding — belongs to the
[scoring rubrics](../../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md) subject; this
technique only insists that the ranking happens after composition, not
before it.

## When not to use this

- **When the honest claim really is item-level.** "This artifact scores
  higher than 80% of all artifacts measured" is a legitimate sentence, and
  then the item pool is the correct population — for an item, not for the
  organization that owns it. Label it as an item claim so nobody promotes it.
- **Fixed reference bands.** Comparing against published thresholds ("above
  the recommended level") is not a ranking and has no population to match.
- **Cohorts of one aggregate each by construction** — for example, one
  submission per organization — where item and member units coincide.
  Verify that they still coincide after the corpus grows; this equivalence
  is the kind that silently expires.

## Smells

- A ranking query where the corpus side selects raw rows while the subject
  side selects an aggregate.
- A benchmark where almost every tenant lands between the 30th and 70th
  position, forever.
- Position magnitude correlating negatively with a tenant's measurement
  volume.
- An "overall percentile" computed as the mean of other percentiles.
- Output that says "top 12%" without saying top 12% *of what*.
