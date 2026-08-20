---
layer: technique
type: technique
subject: public-money-attribution
technique: entity-level-deduplication
status: forged
laws: [deterministic-code-owns-numbers, one-definition-one-import]
shared_with: []
use_when:
  - summing money across a set of official-entity ties
  - one entity appears under multiple ties or multiple officials
---

# Entity-level deduplication

Money reaches the public through an *entity's* contracts, not through a
relationship record. The tie table is many-to-many: one entity can be tied to
several officials, one official can hold several roles at one entity, and the
same tie can be re-ingested under successive vintages. Any sum taken over ties
counts the same public spending once per relationship — and the inflation
concentrates exactly where scrutiny is highest, because well-connected
entities are the ones carrying multiple ties. A per-tie sum is therefore not
"approximately right"; it is biased upward in proportion to how interesting
the row is.

## The procedure

1. **Collapse to one row per entity first.** Before any bucketing, splitting,
   thresholding or ranking, fold the tie set into a map keyed by entity
   identity. All money figures (contract totals, subsidy totals, donation
   totals, contract counts) are per-entity facts and are taken once.
2. **Decide the entity's class from ALL of its ties, by stated precedence.**
   When ties disagree — one says steward, another says owner — the entity
   counts as attributable if *any* tie is an ownership or management tie. The
   rationale: an official who both owns a stake and sits on the board is an
   owner; the supervisory seat does not launder the ownership. The
   anti-pattern this replaces is "whichever tie the scan returned first
   decides" — insertion order is not a rule, and it makes the figure depend on
   query plan.
3. **Only then aggregate into buckets.** Sums, counts, and coverage statistics
   run over the deduplicated entity rows, so every downstream consumer can
   assume one-row-per-entity as an invariant.

The collapse must be deterministic and reviewable code — the counting rule
*is* the number ([deterministic-code-owns-numbers](../../../_laws.md#deterministic-code-owns-numbers)),
and it must exist exactly once, imported by the population ledger, the
per-person view, and the review queue alike
([one-definition-one-import](../../../_laws.md#one-definition-one-import)). The
observed decay mode is three surfaces each re-implementing the fold with a
different dedup rule and calling the results by the same name.

## Decision rules

- **When two officials share one entity**, the entity's money appears in each
  official's *own* case file (each relationship is real), but any figure over
  a *population* of officials deduplicates the entity — the state did not
  spend the money twice. Say which scope a figure has; "sum of the per-person
  columns" and "population total" are different numbers and both are honest
  only when labeled.
- **When a single row's value is rendered** (a per-tie cell in a ledger),
  route it through the same shared function as every total by treating the
  row as a one-tie population — never re-add the components at the cell. An
  inline re-addition is a fourth definition of the metric waiting to drift.
- **When entity identity itself is uncertain** (registry id collisions,
  renamed or re-registered entities), resolve identity *before* this fold —
  deduplication keyed on a broken identifier merges distinct entities or
  splits one, and both corrupt the figure. Identity resolution is its own
  subject; this technique assumes its output.

## When not to use it

Do not deduplicate when the unit of analysis genuinely is the tie: a review
queue clears ties one by one, and a reviewer's workload metric counts ties,
not entities. And do not let dedup absorb temporal reasoning — a tie that
ended a decade ago and a current one at the same entity are both "the same
entity", but whether historical ties belong in the figure at all is a
disclosure decision made upstream, not something the fold should silently
decide by merging them.
