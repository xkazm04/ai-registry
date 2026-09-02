---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: deliberately-overlapping-criteria
status: forged
laws: [one-authority-per-quantity, grade-against-what-ships-not-on-a-curve, an-instrument-proves-it-had-input]
shared_with: []
use_when: [criteria are being pruned for redundancy, a defect keeps escaping a complete-looking rubric, composing a weighted total from overlapping findings]
---

# Criteria that deliberately overlap

The instinct when authoring a criterion set is to make it orthogonal: each criterion
measures one thing, no two measure the same thing, and the set partitions the craft
cleanly. That instinct is borrowed from measurement, where it is correct, and it is wrong
here. A defect that hides from one framing is usually visible from another, and a set
engineered so that no two criteria can see the same defect has thrown away the second
look. Overlap is not sloppiness to be cleaned up. It is the mechanism.

## Why redundant framings catch what a partition misses

A criterion does not detect a defect; a *framing* does. Asking whether the composition
guides the eye and asking whether the piece reads at thumbnail size are two framings that
both touch the same focal weakness, and an artifact routinely satisfies one without
satisfying the other — not because the author cheated, but because the two questions make
different things salient to whoever answers them. Comparative studies of expert review
find the same thing whenever two different principle sets are turned on one artifact: the
defect sets overlap substantially but nowhere near completely, and the shared portion is a
minority of the union. Every finding outside the shared portion is a defect one framing
saw and the other did not. A partition keeps one framing per region of the craft and
discards the rest of the union by construction.

This matters most for exactly the artifacts a craft rubric exists to catch: work that is
correct, complete, generic and dead. Generic work satisfies whichever framing it was
produced against. It is the second, differently-angled question — the one nobody optimised
for — that finds the absence, because the absence is real and only the coverage of one
framing was ever arranged.

## The cost, stated honestly

Overlap breaks arithmetic. A defect visible from three criteria drags three scores down
and a strength visible from three lifts three, so a weighted total becomes partly a
function of how many criteria happen to look at the same place. Two artifacts with one
defect each can differ by a wide margin in the composite purely because one defect fell
where the criteria cluster and the other did not. The total then reports the rubric's
redundancy structure rather than the artifact's quality, and it does so invisibly, because
nothing in the number says which of its components were about the same thing.

The instinct that follows is to delete the redundant criterion. That trades a bookkeeping
problem for a blind spot, and the blind spot is silent while the bookkeeping problem is at
least visible in the numbers. Do not take that trade.

## The rule that resolves it

**Overlap in the interrogation, deduplicate in the arithmetic.** The criteria stay
redundant and all of them are asked. What composes into a grade is not the criteria but
the *findings*, and a finding names the defect and its location in the artifact, never the
criterion that surfaced it. The procedure has three steps and no discretion in any of
them.

1. **Ask every criterion independently**, each recording its findings as a defect plus the
   place in the artifact where it sits. A criterion that returns "nothing found" records
   that too.
2. **Merge findings by identity before scoring.** Two findings are one when they name the
   same defect at the same location, whatever the two criteria called it. The merged
   finding takes the severity of its worst framing and keeps the list of criteria that saw
   it as provenance.
3. **Compose the grade over merged findings.** Each defect counts once. Provenance is for
   auditing which framings are earning their place; it is never a multiplier.

One quantity, one owner: the severity of a defect belongs to the defect, not to each
criterion that noticed it. Where the arithmetic cannot be made deduplicating — a scoring
surface that only accepts per-criterion numbers, for instance — do not weight at all.
Report the merged finding set and derive the level from it. An honest list beats a
composite that is quietly counting one defect three times.

Before building any of that, look at the shape of the composition, because much of the cost
this technique warns about is not a property of overlap at all — it is a property of the
weighted mean. Under a weakest-dominates rule, where the lowest few criteria set the grade
and one broken criterion caps the artifact, a defect seen by three framings moves the total
exactly as far as a defect seen by one. Overlap becomes arithmetically free, and the
deduplication that remains is a reporting concern rather than a scoring one. A team that chose
a mean by default and then found it could not tolerate redundancy has diagnosed the wrong half
of the problem.

The strongest available deduplication is more brutal and worth knowing about: give one
framing no arithmetic to be in. A second instrument that interrogates the same artifact and
is barred from contributing to the grade cannot double-count by construction — and the bar
holds only if it is structural rather than conventional, checked by something that fails when
the two are wired together. Any such check needs its own guard against passing vacuously,
because a scan that inspects nothing reports the same clean result as a scan that inspects
everything. The trade is real and must be stated when you take it: a framing outside the
arithmetic also has no path to a verdict on the days it is the only framing that saw the
defect.

## Designing the overlap rather than accumulating it

Overlap is not a licence to grow the criterion set. It is achieved *within* a working
number of criteria by choosing framings that cross the same ground from different
directions — a structural framing and a perceptual one over the same feature, a
whole-artifact framing and a component framing over the same relationship — not by adding
a criterion for every dimension twice. A set that grew because nobody would delete
anything is not overlapping by design; it is an examiner-fatigue problem that will resolve
itself into averaging.

The empirical test that separates designed overlap from accidental duplication comes out of
the pilot. Run both criteria over the known-good and known-bad artifacts and read where
they disagree. **Two criteria that produce identical findings on every piloted artifact are
one criterion under two names** — merge them, because a framing that never sees anything
its twin missed is not a second look. **Two criteria that agree often and diverge sometimes
are the intended pattern**, and the divergences are the reason the pair exists.

## Decision rules

- **When a criterion is proposed for deletion as redundant, show the artifact where it
  found something alone.** No such artifact in the pilot set means the redundancy is real
  and the merge is right. One such artifact means the deletion would have opened a blind
  spot, and the criterion stays.
- **When a defect is caught by both a criterion and a disqualifier, the cap wins and the
  criterion records the same finding as provenance without a second penalty.** A capped
  piece is not additionally deducted for the reason it was capped; that is double counting
  across mechanisms, and it makes the cap look like a heavy weight, which is the confusion
  the cap exists to avoid.
- **Never overlap a measured quantity.** Two criteria computing the same figure by two
  methods is not a second framing, it is two authorities for one number, and the day they
  disagree nobody can say which is real. Measurements have exactly one owner; only
  judgments overlap.
- **Findings carry locations or the merge is guesswork.** If the instrument cannot record
  where in the artifact a defect sits, deduplication degenerates into matching the wording
  of two descriptions, which merges distinct defects and splits identical ones.
- **Report the provenance to the rubric author, not to the producer.** Which framings found
  a defect is a fact about the instrument and is read when auditing it; a producer needs
  the defect and its location, and giving them the criterion list invites them to argue the
  count.

## When not to use it

- **In a conformance gate.** A pass/fail check against a specification has one framing by
  construction, and a second one only creates a disagreement the gate has no way to
  resolve.
- **Where findings cannot be located.** Without location, keep the criterion set nearly
  orthogonal and accept the blind spots, because the alternative is a total nobody can
  interpret.
- **As a repair for a criterion that does not discriminate.** A criterion that never fails
  is not fixed by adding another that looks at the same ground from a different angle. Fix
  or remove the criterion first; overlap multiplies working framings, not broken ones.
- **When the real problem is scope.** Criteria that keep colliding across what feel like two
  different crafts are reporting that the deliverable class holds two kinds of artifact. Split
  the class: overlap within one craft is a design choice, overlap across two is a symptom.
