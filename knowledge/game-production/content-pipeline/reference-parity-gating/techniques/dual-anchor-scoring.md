---
layer: technique
type: technique
subject: reference-parity-gating
technique: dual-anchor-scoring
status: forged
laws: [one-authority-per-quantity, no-gate-self-certifies]
shared_with: []
use_when: [designing a parity gate against a reference that may itself be defective, a producer is matching the reference's flaws and scoring well, deciding how many anchors a comparison needs, a parity score is high and the artifact is visibly wrong]
---

# Two anchors that cannot both be satisfied by a wrong artifact

A parity gate compares a candidate against a reference. If that is all it does, the gate's
ceiling is the reference's correctness, and references are stylised, mis-scaled, fused and
posed for purposes other than yours. Worse, the failure is silent in the direction that
matters: a candidate that faithfully reproduces a defective reference scores *higher* than
one that corrects the defect.

The fix is not a better reference. It is a second anchor that measures a different
quantity, drawn from a different authority, such that satisfying both requires being
right.

## The pairing

| Anchor | Authority | Owns the quantity |
| --- | --- | --- |
| Profile | the reference artifact, traced through the measurement pipeline | shape — how the outline runs, position by position |
| Specification | published figures the real subject is known to satisfy | scale — the object's governing dimensions |

The conjunction is the mechanism. A candidate matching a defective reference — a body sunk
into its base, an assembly fused and riding high — reproduces the reference's *shape* and
therefore fails the specification rows, because the defect moved a governing dimension. A
candidate built to the published figures without tracking the reference passes scale and
fails profile. **Neither anchor alone is hard to satisfy incorrectly; together they are
hard to satisfy at all without being right.**

## This is not two authorities for one quantity

The obvious objection is [one authority per
quantity](../../../_laws.md#one-authority-per-quantity), and answering it correctly is
what keeps the technique from degrading. Two systems answering the *same* question with
two models is the failure that law names: the disagreement hides until it is load-bearing,
and nobody knows which to believe.

Here each quantity keeps exactly one owner. Profile is owned by the reference and by
nothing else. Scale is owned by the published specification and by nothing else. They
never adjudicate the same claim, so there is no disagreement to resolve — only a
conjunction to satisfy. The test to apply when adding any anchor: **if the new anchor and
an existing one could ever return conflicting answers about the same property, you have
built the thing the law forbids.** If they can only ever constrain different properties,
you have built this.

## Procedure

1. **Name the quantity each anchor owns**, in one phrase each, and check that no two
   overlap. An anchor whose quantity is already owned is not a second anchor; it is a
   second opinion.
2. **Give the specification anchor a grace band and a steep slope past it.** Published
   figures carry rounding and measurement convention, so a small percentage of grace is
   honest; beyond it the penalty should be severe enough that no other row can pay for it.
   A worked default: one percent free per dimension, then eight points per further percent.
3. **Measure the specification anchor from the candidate's own traced output**, not from
   its declared parameters. A dimension read off the artifact's authored configuration is
   the producer reporting its own score.
4. **Exclude the parts that are under test from the rows that define the frame.** A
   governing length measured from a span that includes the component whose length is in
   dispute is circular.
5. **Resolve each dimension at the resolution the measurement can actually support**, and
   say which. A traced polyline quantises coarsely when a long component pins the frame;
   a direct pixel extent resolves an order of magnitude finer. Use the finer instrument for
   the row that needs it and record which one produced the number, per
   [a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
6. **State the conjunction in the gate's own output**, so a downstream reader cannot quote
   one anchor alone as the verdict.

## Decision rules

- **When the reference and the specification disagree, the specification wins and the
  disagreement is recorded.** That gap is the strongest single signal the gate produces: it
  is how a defective reference announces itself, and it should route to a reference audit
  rather than to a producer work order.
- **When someone proposes a third anchor, check its correlation before its cost.** A third
  measurement derived from the same masks as the first is not a third anchor — it is the
  first anchor's noise, and adding it dilutes the conjunction while looking like rigour.
- **When a candidate passes both anchors and still looks wrong, do not adjust an anchor.**
  Both anchors are silhouette-and-scale claims; "looks wrong" is a rung above them, and the
  remedy is a perceptual witness, not a re-weighting.
- **Never let a reference waiver touch the specification anchor.** A defect in the reference
  is a reason to distrust the profile rows; it is never a reason to accept a wrong size.
- **When the two anchors are satisfied by construction from the same input, you have one
  anchor.** If the candidate is generated *from* the published figures and compared *to* a
  reference normalised *to* those same figures, scale is no longer independently tested.
  Keep at least one anchor downstream of nothing the producer controls.

## The amendment: a different parser is not a different authority

The technique's third decision rule says to check a new anchor's correlation before its
cost. That rule is easy to agree with and easy to violate, because the violating case does
not look like a correlated measurement — it looks like a stricter one.

Tested against a live specification gate that checked only whether a declared output
section was *present*, a second anchor was added to check whether that section
**enumerated** its outputs. It was a different rule, a different threshold, and a
different code path. It flagged two of four artifacts that the first anchor passed.

Both flags were false. The artifacts enumerated their outputs correctly, inside a fenced
template whose lines the second anchor's pattern did not recognise. The anchor had not
measured a property of the artifact; it had measured its own parser against the same text
the first anchor read.

**Two anchors over one representation are one anchor with two thresholds.** Independence is
a property of the *authority*, not of the rule — a second regex over the same document, a
second static pass over the same tree, a second metric over the same masks all inherit
every blindness of the first while producing a number that looks corroborating. The
distinguishing question is not "does this rule differ?" but **"could this anchor be
satisfied and the other violated, for a reason that is about the artifact rather than about
the parsers?"**

The corrective in that case was already written down by the team that owned the gate: the
genuine second anchor is behavioural — run the artifact and compare its real output against
the contract it declares — which reads a different representation produced by a different
process. That anchor costs materially more than a regex, and the cheap substitute did not
approximate it. **When the honest second anchor is expensive, a cheap one in the same
representation is not a down payment on it.**

## When not to use this

- **When no independent specification exists.** For a wholly invented subject there is no
  second authority, and the honest gate is a single-anchor gate that says so — plus a
  heavier perceptual tier, because it has lost the property that made the score
  trustworthy. Inventing a specification from the reference to have two numbers is the
  worst available option: it manufactures the appearance of independence.
- **When the reference is authoritative by definition** — an approved master frame, a
  signed-off performance capture. There the reference *is* the specification, one anchor is
  correct, and the second would be noise.
- **As a substitute for the perceptual tier.** The conjunction proves the candidate is the
  right size and the right outline. It says nothing about whether it reads correctly, and a
  gate that markets it as a quality score has re-created the problem it solved.
