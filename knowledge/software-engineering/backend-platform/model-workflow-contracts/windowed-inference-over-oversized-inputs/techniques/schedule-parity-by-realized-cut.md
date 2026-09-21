---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: schedule-parity-by-realized-cut
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
applied: code
ab_verdict: better
use_when: [the window schedule is computed in one place for training or baking and in another for serving, a fixed-input-size model performs worse at the end of a sequence than in the middle, two paths hold the same window size and hop and still produce different cuts, naming or caching a windowed result so a later run can tell whether it is stale, writing the conformance test that proves two segmentation paths agree]
---

# Schedule parity by realized cut

Two paths cut the same input into windows, and one of them has already run.
The training run that fixed the model's distribution, the bake that produced
the artifact, the indexer that filled the store: that path is finished, and the
only thing left of it is what it produced. The other path runs per request. Both
compute the same derived value — where the seams are — and the standard
prescription for a derived value computed twice is that it has one authority and
both paths derive from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

The prescription is right and, stated at the wrong altitude, does not hold.
What two paths can easily share is the **policy**: the window size, the hop or
overlap, the character or frame budget, the name of the algorithm. What decides
the output is the **realized cut**: the list of boundaries this particular input
actually got. They are not the same value. Two paths that agree on the policy
letter for letter still produce different cuts whenever the input's length is
not an exact multiple of the step — which is every input except the ones a
fixture happens to choose.

## The remainder is where the two paths disagree

The offline path usually holds the input already encoded and takes the windows
that fit, dropping the ragged tail: it rounds the window count **down**. The
online path holds a short piece, encodes it, and must return something for it:
it rounds **up**. Same window size, same hop, same declared policy, and the
final window differs — one unit longer than any window the model was trained on,
and with no lookahead, because there is nothing after it to look at. So the
prediction is off-distribution exactly where the sequence ends, which is where a
caller reads the answer and where a summary or a decision is usually taken.

Neither rounding rule is wrong on its own. Down is right when the tail is
already-encoded material you can afford to drop; up is right when refusing to
answer for the last second of input is not an option. The defect is the pair,
and the pair has **no observable**. There is one output at request time, no
second number to set beside it, and nothing raises. The loss is confined to the
subpopulation whose length carries a remainder, so it reads as a quality
property of the model rather than as a contract violation between two pieces of
code.

## A shared policy is neither sufficient nor necessary

The obvious repair is to make the second path import the first path's policy, so
that the two cannot drift. Measured against a real seam, that repair fails in
both directions at once.

**The policy is coarser than the cut.** Two configurations with byte-identical
policy strings produce different cuts, because the remainder is decided by the
input's length and not by the policy. A shared policy therefore certifies a
parity that does not hold, and it certifies it in the one place a reviewer will
look for reassurance.

**The policy is also finer than the cut.** Change one policy input and the
string changes for every input, including the ones whose cut did not move — a
body short enough to be a single window under any budget lands identical bytes,
and its name has changed anyway. Anything keyed on that name now re-renders,
re-indexes, or reports drift for results that are provably unchanged. The cost
lands on exactly the cheap, common inputs.

The two directions are the same mistake seen from two sides: the policy is an
input to the derivation, and a stored derived value names its own recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
not the recipe's parameters.

## The rule

**The identity of a windowed result is the algorithm's name plus the boundaries
the input actually got.** Everything else follows from that sentence.

- **The finished path records its realized cut**, and where the result is a
  trained model rather than a stored artifact, it records the **tail policy**
  that produced every cut it ever made: whether a remainder shorter than one
  window is dropped, padded, or pulled back flush with the end; and how much
  context the final window had after its own content. That is a small enumerated
  value, it is the part of the schedule the live path cannot re-derive, and it
  is the part that decides the last window.
- **The live path derives the tail from that record rather than restating it.**
  The window size and the hop are ordinary declared parameters and can be read
  from anywhere; the tail disposition is a decision the finished path already
  made and the live path may only obey.
- **Where the two paths start from different representations of the input** —
  one from encoded features, one from raw material it must encode first — the
  shared authority cannot be a shared function, because the two computations do
  not have the same domain. It has to be the realized boundaries, expressed in a
  unit both representations can count.

## Conformance needs a ragged fixture

A conformance test that feeds both paths an input whose length divides evenly by
the step cannot fail for this reason, and that is the fixture anybody writes
first. Every case carries a remainder, and at least one carries the shortest
possible tail — a remainder of one unit, where rounding down and rounding up
differ by a whole window rather than by a fraction of one.

Assert equality of the **boundary list**, not of the window count. Two cuts of
one input can have the same number of windows and place them differently, and a
count that matches is the most convincing wrong answer this seam produces
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
governs the vocabulary; the boundaries are the value).

## Decision rules

- **When only one path computes the cut**, there is nothing to reconcile and a
  recorded cut is indirection. Record it at the moment a second path appears,
  and record it by reading the existing path's output rather than by writing a
  fresh derivation beside it.
- **When the finished path is gone** — no record, no code, nothing but the
  artifact — the live path's obligation is to reproduce the tail disposition it
  can infer, and to say in prose that it inferred it. An inferred tail policy
  that is written down can be corrected; one that lives in a rounding operator
  cannot be found.
- **When the realized cut is expensive to carry**, carry a digest of the
  boundary list rather than the list. Computing the cut in order to name it is
  one linear pass over a schedule that has at most a few hundred entries, and it
  is the same pass the run is about to make anyway.
- **When a downstream stage reports the cut back** — a per-window score, a seam
  count, a segment report — that number is derived from the realized cut and is
  handed down from whoever computed it, never recomputed at the reporting site.

## When not to use it

A derived value with no remainder needs none of this: a cut into a fixed number
of equal parts, or over an input whose length the entry contract already
constrains to a multiple of the step, cannot diverge at the tail, and the
integrality contract that refuses a bad input is the cheaper instrument.

Do not apply it to a path that is definitionally advisory. A progress estimate,
a preview at reduced fidelity, or a size hint computed before the input is
loaded is allowed to hold its own arithmetic, because nothing downstream is
named after it. The moment something is named after it — a cache entry, a
lockfile row, a staleness verdict — it has stopped being advisory and the rule
applies.

[self-describing-model-packages](../../self-describing-model-packages/self-describing-model-packages.md)
owns the **form** of the record — a machine-testable statement rather than a
prose sentence, with a solver that proves the statement against the network —
and that subject's own boundary says it answers what an artifact takes, returns
and needs. This technique says **which value** the answer has to contain. A
package that declares its window size and its divisibility rule and says nothing
about its tail has answered the question a consumer asks first and left the one
that decides the end of every sequence.
