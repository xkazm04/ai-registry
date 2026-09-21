---
layer: technique
type: technique
subject: agent-memory
technique: cross-context-promotion
status: forged
laws: [count-carries-predicate, deletion-is-not-repair, limits-are-derived, gate-sees-target]
shared_with: []
use_when: [one operator or team runs many per-context memory stores that never see each other, deciding whether a remembered item should be shared beyond the context that learned it, sizing a shared tier beside a local one, a first-sight store has grown past the point where its index is still cheap, auditing whether a personalized store is earning the context it costs]
applied: experiment
ab_verdict: better
---

# Cross-context promotion

[procedure-promotion](./procedure-promotion.md) sets the recurrence bar and,
for a host with no episodic layer, relocates the count to the write door on the
second sighting. Both are counts *inside one store*. This technique owns the
axis that appears the moment there is more than one store: **a second sighting
in a different context is a different fact from a second sighting in the same
one, and it is the one that decides what may be shared.**

The situation is ordinary and easy to miss, because nothing about it looks
broken. One first-sight store per context — per repository, per workspace, per
tenant — is the cheapest correct design: each store is small, every item in it
is local and relevant, and the always-loaded index stays affordable. Such a
system scales by *multiplying* rather than by deepening. It has no door through
which a context can learn from another, so the same lesson is paid for once per
context, and the price is a real incident each time.

## The count must name its predicate, and "contexts" is the predicate

"Seen twice" is not a promotion signal until it says twice *where*
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
Two sightings in one context mean the local store missed its own item — a
retrieval or dedupe defect. Two sightings in two contexts mean something else
entirely: the item is not about the context that learned it. Only the second
kind earns a shared tier, and a system that records a bare count cannot tell
them apart afterwards.

So the write door's outcome table gains a column. Same trigger, same context:
update the existing item, bump its version. Same trigger, **different**
context: this is the cross-context second sighting, and it is an admission
event for the shared tier — the local item stays where it is, and a shared item
is minted that names both contexts.

## Two axes, and they pull against each other

A store serving one context is scored on two things at once, and every naive
move trades one away:

- **coverage** — when a context meets a situation for the first time, does the
  store hold an item that answers it, learned elsewhere?
- **locality** — when the store answers, is what it returns about *this*
  context?

Measured on 32 real per-context stores holding 830 first-sight items
(2026-09-17, see the application), against 12 hand-confirmed events in which
one context demonstrably re-derived a lesson another already held, retrieved
through an unmodified keyword ranker at three slots:

| store the context sees | items | coverage | locality |
| --- | --- | --- | --- |
| its own, only | 12–112 | 1 of 12 | 11 of 12 |
| one other context's, size-matched | 12–147 | 2 of 12 | 0 of 12 |
| one other context's, the densest available | 147 | 5 of 12 | 0 of 12 |
| all 32 pooled | 830 | 6 of 12 | 8 of 12 |
| pooled, gated on cross-context recurrence | 123 | 9 of 12 | 3 of 12 |
| its own **plus** the gated shared tier | 128–227 | 9 of 12 | 9 of 12 |

Four readings, in order of how much they change practice:

1. **A personalized store's value is not coverage, and whose it is barely
   matters.** The local store answered 1 of its own 12 first encounters; a
   size-matched store belonging to a *different* context answered 2. That is
   not a paradox: a local store is mostly singletons, and a singleton by
   construction cannot answer a first occurrence. Personalization buys
   locality, which is worth buying — it does not buy the thing it is usually
   defended as buying.
2. **What looks like a provenance effect is often a size effect.** Drop the
   size match and the comparison inverts: the single densest store in the
   fleet, 147 items belonging to another context entirely, answered 5 of 12 —
   nearly matching all 32 contexts pooled. Coverage tracked *how much of a
   store was transferable*, not whose it was. Any comparison of a personal
   store against a borrowed one that does not hold item count fixed is
   measuring the count.
3. **Pool size is not the win; recurrence is.** Gating the pool to the 123
   items that had recurred across contexts — 15% of it — raised coverage from
   6 of 12 to 9 of 12. The 707 singletons were not neutral ballast: they were
   competitors for three slots, and they displaced the right answer. Coverage
   then ordered by the *breadth* of recurrence rather than by store size: items
   that had recurred in five contexts were reached on 100% of trigger probes by
   the gated tier and 88% by the ungated pool, against 40% and 10% at three
   contexts and 42% and 26% at two. The rise is not monotone — the
   three-context cell is three tasks and sits below the two-context one — so
   read this as breadth beating size, not as a curve.
4. **Neither single tier passes both axes.** The gated pool wins coverage and
   loses locality (3 of 12); the local store wins locality and loses coverage.
   Only the two-tier store passes both, at 15–27% of the pooled store's size.
   A gate that scores one axis is passed by pooling everything and equally by
   pooling nothing ([gate-sees-target](../../../../_laws.md#gate-sees-target));
   score both on the same arm or the measurement cannot see the trade it just
   made.

## The bar admits; it never evicts

The obvious next move is the wrong one. If 85% of a store never recurs, delete
it — and the 85% is exactly the part nothing else can supply. Probed for eight
singletons drawn from the eight largest stores, the gated shared tier retained
**none of them**; the local store retained all eight. Removing the items that
exposed nothing is not a repair, it is the removal of the only copy
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

State the rule in the form that survives being applied literally: **recurrence
across contexts is an admission bar for the shared tier and never a retention
bar for the local one.** An item that fails it is not waste; it is the
correct contents of a local store, and it stays there under the ordinary
[decay](./decay-and-forgetting.md) rules like anything else.

## The shared tier's size is derived, not chosen

There is no budget to pick. The shared tier is exactly what the count admits,
so its size is a *measurement* of how much of the corpus was never about its
own context ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
Write the derivation beside the number. Two consequences follow, and both are
read the wrong way when the number is treated as a budget:

- A shared tier that grows faster than the local stores is not accretion, it
  is a fleet discovering it has one problem in many places.
- A shared tier stuck near zero while the local stores grow is the
  **detector** failing, not the population being local. Check the door before
  concluding the contexts are unalike.

## What the door misses, and why the count is a floor

The admission door is a trigger search across contexts — by the error string,
the symptom and the context markers, not by resemblance, for the reason
[procedure-promotion](./procedure-promotion.md) already gives and
[scope-before-similarity](./scope-before-similarity.md) reinforces. Its
cross-context miss mode is specific and was measured: **3 of the 12 confirmed
families were unreachable from every two-term probe derived from the later
item's own name, in every store**, because the two contexts had named one
failure in disjoint vocabulary — a type-check that skips test files in one, a
unit runner that strips types in the other. Same defect, no shared trigger
token.

So the cross-context count is a **floor on recurrence, never a census**, and it
must travel as one. Two operational consequences:

- A shared tier built only from trigger collisions is systematically smaller
  than the truth, which is the safe direction: it under-promotes rather than
  minting a shared item from two unrelated failures.
- A periodic pass that re-examines the *local* stores in aggregate is the only
  thing that finds the vocabulary-divergent pairs, and its output is a
  candidate list for a human, not an admission. Similarity is the right
  instrument here and the wrong one at the door; a similarity pass over the
  same corpus returned one component of 30 items spanning 11 contexts that was
  a topic, not a lesson, and reading it was the only thing that caught that.
