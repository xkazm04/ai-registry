---
layer: technique
type: technique
subject: judge-contract-design
technique: gating-floors
status: forged
laws: []
shared_with: []
use_when: [a dimension must never be tradeable, a fluent candidate passes despite fatal errors, defining pass semantics for a rubric]
---

# Gating floors

The concern: a weighted mean is tradeable by construction. A candidate that
is fluent, complete and well-formatted but *wrong* can average its way past
the threshold — the exact outcome a quality gate exists to prevent. The
technique attaches an optional **floor** to a dimension: a minimum score
below which the case fails regardless of the overall.

## The semantics

Pass is a conjunction, and both halves are part of the stored contract:

    pass = (overall >= threshold) AND (no dimension scored below its floor)

A floor hit is recorded *per dimension* on the verdict — not just folded
into the boolean — so a reader can see which requirement failed the case.
"Failed: overall 0.84, floor hit on correctness (0.3 < 0.5)" is a
diagnosis; a bare `pass: false` under a high overall is a mystery that
erodes trust in the gate.

Floors apply to the dimension's *final* score. For a sampled dimension that
is the cross-sample mean; for a mechanical dimension it is the single
reproducible verdict. A mechanical floor of 1.0 is the strongest form:
"this check must pass outright," which turns a soft rubric into a hard gate
on that axis while the other dimensions still shade the overall.

## Decision rules

- **When a requirement is non-negotiable, floor it; when it is a
  preference, weight it.** The question to ask per dimension: "is there any
  score on the other dimensions that should rescue a candidate that failed
  this one?" If no, it needs a floor, because weights cannot express veto.
- **Set floors at the anchor that means 'unacceptable', not at the
  threshold.** A floor of 0.5 on a dimension anchored "0.5 = minor error"
  fails minor errors — usually too strict for a sampled opinion whose mean
  wobbles. Floor at the level whose anchor text describes the outcome you
  refuse to ship.
- **Floor sparingly.** Every floor converts a graded signal into a binary
  one; a rubric where every dimension is floored at a high value is a
  checklist wearing a rubric's clothes, and its overall stops carrying
  information. One or two floors — correctness, safety — is the common
  honest shape.
- **When a floored sampled dimension flaps near its floor, raise the
  sample count or tighten the anchors before touching the floor.** A mean
  of 0.49 vs 0.51 across runs is judge noise at the boundary; the fix is
  variance reduction, not moving the requirement to wherever the noise
  lands.

## Failure modes

- **The rescued failure** — no floors; the charming candidate passes on
  style while wrong on substance.
- **The invisible veto** — floors enforced but not reported per dimension;
  readers see high overalls failing and conclude the gate is broken.
- **The all-floor rubric** — every dimension floored high; the weighted
  overall becomes decorative and the contract is really a boolean AND that
  should have been written as mechanical checks.

## When not to use it

Do not floor a dimension whose anchors are soft ("tone", "concision") —
a veto on a subjective axis makes the gate's flakiness equal to the judge's
worst dimension. And do not use floors to express "this check must be
true mechanically"; that is a mechanical dimension kind with a floor of
1.0, which is both cheaper and exactly reproducible.
