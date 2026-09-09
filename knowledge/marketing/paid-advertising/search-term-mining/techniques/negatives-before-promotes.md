---
layer: technique
type: technique
subject: search-term-mining
technique: negatives-before-promotes
status: forged
laws: [a-gate-before-money-and-copy]
shared_with: []
use_when: [ordering the moves a search-term recommender emits, a blast-radius cap truncates a term change-set, designing the apply loop for criterion changes]
---

# Negatives before promotes

A mining pass produces two kinds of move, and the order they are emitted, presented
and applied in is a decision with consequences at both ends of the list. The pinned
order is: **negatives first, costliest first; promotes second, highest realized value
first**; then the governance envelope's blast-radius cap truncates the list. The apply
loop walks the same order.

## Why this order

Three reasons, each sufficient.

- **The cap decides what survives, so the order decides what the cap keeps.** A
  change-set limited to a handful of moves per approval must spend those slots on the
  moves that matter most. Stopping the most expensive leak is the highest-value move a
  mining pass can make and the only one whose value is certain: saved spend is saved.
- **An operator can judge a negative from the row alone.** "This query cost X, was
  clicked N times, converted nothing" is a verdict a person approves in seconds. A
  promote asks them to believe that a query's realized value will persist under a
  different match type - a reasonable belief, but a belief. The moves that need the
  least trust go first so that a truncated set is the set most likely to be approved.
- **The account stops leaking before anything is added to it.** Applying in the same
  order means that if the apply loop fails part-way - a platform error, a rate limit,
  a revoked token - the account is in the state where waste has been removed and
  nothing new has been created, which is the safer of the two partial states.

## Mutual exclusion by construction

The two kinds are disjoint by threshold (a negative needs zero conversions, a promote
needs two or more), but the recommender does not rely on the thresholds staying that
way. Every query it speaks for is recorded by term and campaign, and it refuses to
speak for a query twice; and the promote predicate is tested before the negative
predicate on every row. A future threshold change therefore cannot produce a
change-set that blocks and promotes the same query under one approval - a state that
would be nonsensical to apply and impossible to revert cleanly.

De-duplication on term and campaign also handles the report's habit of listing one
query under several ad groups of a campaign: the first row seen decides which side the
query is on, and a campaign-level negative is emitted once.

## The value column is asymmetric by design

Inside the ordered list the two kinds carry different value semantics, and a sort that
ignores this produces a wrong order:

- A negative's **amount** is the query's own period cost - what stops being spent. Its
  **value gain** is zero, because saved cost is not conversion value.
- A promote's **amount** is also the query's own cost - what the query already costs,
  which is what makes it worth its own keyword. Its **value gain** is the realized
  conversion value, a "keep this" figure.

Negatives are sorted by amount; promotes by realized value. Neither moves budget, so a
spend simulation over the set is an identity, and the approval screen shows recovered
spend and protected value, never projected lift.

## Procedure

1. Partition eligible rows into negatives and promotes, promote-first per row,
   speaking for each term-and-campaign key once.
2. Sort negatives by cost descending.
3. Sort promotes by realized conversion value descending.
4. Concatenate negatives then promotes.
5. Apply the envelope's cap to the concatenation, not to each partition; a cap of
   three yields three negatives if three negatives exist.
6. Apply in list order; on any failure, stop, record what was created, and leave the
   remainder for the next approval rather than skipping ahead.

## Decision rules

- When a cap truncates the set, let it truncate promotes first, because a negative's
  value is certain and a promote's is a belief.
- When the apply loop fails part-way, stop rather than continue, because the
  negatives-applied-promotes-not state is safe and the reverse is not.
- When a query appears under several ad groups, speak for it once per campaign,
  because a duplicate campaign negative is an error and a duplicate promote is two
  keywords.
- When a projection is shown for a terms-sourced set, show an identity on spend and
  the two honest figures (recovered cost, protected value), because anything else is
  fabricated lift.

## When NOT to use

- The order is for **mined** moves under a cap. A person working the full report by
  hand with no cap may interleave freely; the ordering exists to make truncation and
  partial failure safe.
- Not for a set that also contains **budget shifts**; those are ranked by
  `budget-reallocation-prescription` and a term move is never interleaved with them
  by this rule - the two kinds of set are approved separately.
- Do not reorder to put a promote first because its realized value is large; the
  value is already the account's and is not at risk in the way a leak is.
