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


## 2026-08-31 — `/intake` icse-2026-seip: a seventh datum state

The enumeration hunt paid on an enumeration this file had **already extended
once**. The golden path's heading read "A datum has six states, not two", and
state 6 (*Refuted*) carries its own note that it "was added late because it is
invisible from inside a single number." State 7 is the same move one level out:
invisible from inside the **system**.

**`compromised`** — the instrument ran, returned a well-formed value, nothing
the system publishes refutes it, and the value is invalid anyway, because the
*subject was exposed to the instrument before it was measured*. It passes all
six prior states and every technique in the subject in turn:
`co-published-numbers-must-reconcile` clears it, the denominator is honest,
nothing was imputed, no collector errored. The corruption is in the relationship
between instrument and subject, which no internal check can reach.

Landed with one technique, **`instrument-exposure-control`**: the
deprived-input negative control (re-run with the input the task requires
removed; whatever survives is the floor of what is being measured by another
route), the matched-twin population read as a **gap** rather than a level, the
rule that a fixed harness is not a fixed instrument when the subject can learn
it, the input-leak rate published as a pair, and the drift signature that
**inverts `noise-band-and-hysteresis`** — exposure drift is monotone and
direction-consistent where the band assumes symmetric jitter, so a symmetric
band calls instrument decay an improvement and hysteresis then holds the
inflated reading in place.

Two boundaries stated rather than linked, both worth remembering:

- Against `renormalize-over-present`: same arithmetic, **inverted
  precondition**. That technique fires when part of the input is *absent*; this
  defect leaves nothing absent — the inputs are present and unusable — so the
  present-weight technique never fires on it.
- Against `lower-bound-disclosure`: its three questions cover *no record*
  (undercount) and *many records per event* (overcount). Neither is *many
  events, one published*, which is the selection bias a leaderboard's best-of-N
  submission produces. **Banked as a lead**, not landed — the source for it was
  relay-tier.

Cross-bundle note, deliberately not linked: `llm-observability`'s
`cross-provider-benchmark-operations` carries
`dataset-sampling-anonymize-freeze`, which prescribes building eval sets from
**private production traffic**. That is the correct structural defence against
everything in this state, and the technique argues it purely from privacy — the
word contamination appears nowhere in that subject. The corpus already does the
right thing for a reason it has not written down. **Return condition:** when
that subject is next swept, state the validity reason beside the privacy one.

Applied to a consumer benchmark service (`experiment`, `better`, shipped): 88
comparability claims in the tree hand-verified to 8 cross-run claims, **0** of
which condition on exposure, and zero contamination vocabulary anywhere.
