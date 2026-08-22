---
layer: technique
type: technique
subject: regeneration-vs-repair-economics
technique: score-basis-must-be-stated
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
use_when: [ranking generated attempts by a score, blending several quality measures into one number, a structurally perfect output keeps scoring mid-range]
---

# Score basis must be stated

## The concern

Every branch of this subject ranks candidates on a number. A number produced by blending
several measurements is only comparable to another number produced by blending **the same
measurements**. The basis is therefore part of the value, and a score handed across a
boundary without it is not information.

## The failure, concretely

A combined score is defined as an even blend of structural health and a fidelity measure.
One generator reports a fidelity measure; another does not report one at all. The blend
reads the absent component as zero. Every output from the second generator is therefore
halved: a structurally perfect result scores fifty, looks mediocre, and loses every ranking
to a mediocre result from the generator that happens to report the second component. The
cap is invisible in the number — nothing in "50" says *half of me was never measured*.

This is not a defaulting bug to be fixed with a better default. Substituting any constant
for an unmeasured component is a claim about a measurement that does not exist, and every
possible constant is wrong: zero condemns, the midpoint launders, the maximum flatters.

## Procedure

1. **Enumerate the components** the score can be made of, each with its own scale and
   meaning.
2. **At scoring time, include only components that were actually measured.** A component
   whose source is absent, whose grader failed, or whose value is not finite is dropped —
   not defaulted.
3. **Emit a basis label naming exactly what went in**, as a small closed set of values, not
   free text: both components, structural only, ungraded.
4. **Emit a human-readable line beside the number** that says the same thing in words, so a
   bare number never travels alone through a report, a log line or a dashboard cell.
5. **When nothing was measured, do not emit a score at all** — or emit it pinned to zero
   with the basis *ungraded* and a reason distinguishing "the critic could not run" from
   "no critique was attempted". Those are different operational facts.
6. **Compare only within a basis.** Ranking mixes bases only when the ranking explicitly
   accepts that it is ordering unlike things, and says so.

## Decision rules

- **A missing component is dropped, never averaged in.** Averaging an unmeasured component
  is a lie about precision.
- **The basis is a value, not a comment.** A comment is not readable by the consumer that
  has to decide whether two scores are comparable.
- **Two artifacts with different bases are not ranked against each other silently.** If the
  pipeline must pick one anyway, it picks and records that the comparison crossed bases.
- **Version the basis with the grader.** Change a threshold or a weight and every stored
  score becomes a statement about a bar that no longer exists; the basis label is where
  that is recorded, so historical scores stay interpretable instead of quietly wrong.
- **Do not weight the components to compensate for a missing one.** Re-weighting to "make
  it fair" invents a rescaling that has no measurement behind it. Drop, state, move on.

## What the aggregate may and may not mean

Derive the aggregate from the findings rather than the reverse: a fixed large deduction per
failing finding, a smaller one per warning, floored at zero. The number then honestly means
*how many things are wrong, how badly* — which is all a scalar over heterogeneous defects
can mean. It is legitimate for sorting a queue and for a dashboard trend. It is not
legitimate as a quality claim, because the defects it collapses have different remedies and
different costs, and the scalar erases which one you have.

## When not to use this

- **When there is exactly one component and it is always present.** The basis is constant
  and stating it every time is noise. State it once at the boundary.
- **When the score is internal to one loop and never crosses a boundary.** Bases matter at
  boundaries. Inside a single comparison over identically-graded candidates, the label is
  redundant — but the moment a candidate is persisted or reported, the boundary exists.
- **When the consumer is a human reading a full card.** They can see which components ran.
  The label is for machines and for the number that gets copied out of the card without it.
