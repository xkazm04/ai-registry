---
subject: measurement-honesty
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# measurement-honesty

First touch: 2026-08-31, an `/intake` run on a cross-sectional paper about
agent-harness architecture. The subject was not the source's topic and was not
on the worklist; it was reached because the source's *defect* — not its
content — mapped here.

## State

6 -> 7 techniques, 3 -> 4 applications (the new one `react`). Stack spread
improved: the subject had been `node`-only across all three prior applications.

Landed:

- `co-published-numbers-must-reconcile` (new technique) — the arithmetic
  constraints that a set of numbers published together creates, and the
  discipline of asserting them beside the emitter. Rests on the identity that a
  joint frequency cannot exceed either of its marginals, carries a second
  section on metrics evidenced by an object they are not defined over, and
  insists that a failed reconciliation is a finding about the **pair**, because
  you do not know which member is wrong. Cites `count-carries-predicate` and
  `derivation-names-recomputation`.
- Golden-path amendment: **a datum has six states, not five.** The heading was
  an enumeration and the enumeration was short by one. The sixth is *refuted* —
  instrument ran, value is well-formed and in range, and another co-published
  number proves it cannot be true.

## Why the home was this subject and not `peer-benchmarking`

Both were read before choosing. `peer-benchmarking` owns a *manufactured
position* — "you are here, relative to them" — and its whole discipline is
about the corpus a rank was constructed against. The finding is not about
comparison at all; it is about two numbers from one publisher constraining each
other. It belongs where the epistemics of a single number live.

## The shape of the gap, for future sweeps

Worth recording because it is likely to recur across this bundle: the subject
was **complete on the producer side and empty on the consumer side.** All six
prior techniques govern a system computing and reporting its own numbers, and
the golden path's central thesis is that a dishonest number is *unfalsifiable*.
The gap sat exactly at the inversion — numbers that **are** falsifiable, by the
numbers printed beside them — and nothing owned it. A subject that is thorough
in one direction is where the missing direction hides; the same read that found
this would be worth running against `metric-forecasting` and
`analytics-time-windows`, which are the two siblings in this category most
likely to share the asymmetry.

## Applied

One application, `goat`, mode `code`, verdict `better`, **shipped**. A
collection panel publishes a completion percentage whose numerator is counted
over one population and whose denominator over another, and clamps the result —
while the store that owns the data computes the same quantity correctly and
needs no clamp. Over 120 enumerated states: 66 percentages and 21 completion
flags disagreed with the application's own ground truth, against 0 after.

The run reported `ship 0, blocker class confirmation` first, and the operator
lifted it in one sentence. Worth recording as a method observation rather than a
subject fact: naming the blocker by class is what made the ship a one-word
request instead of a re-derivation.

The structural fact is the durable half: the consumer already held the object
carrying the correct denominator and reached past it. That is the general shape
— a duplicate implementation of a published quantity usually means the consumer
lacked the denominator, and a clamp is where it shows.

## Leads

- The sibling asymmetry above: check `metric-forecasting` and
  `analytics-time-windows` for the same producer-only completeness. **Return
  condition:** next librarian sweep of `engineering-assessment`, or any run
  that lands in this category.
- `derivation-names-recomputation` was cited but only half-exercised. The
  applied tree holds a case where the recomputation path *exists* and is never
  called to arbitrate an incrementally-patched value. If a second sighting turns
  up, "the arbiter exists and nothing calls it" is a technique of its own rather
  than a paragraph in an application. **Return condition:** a second
  independent sighting.
