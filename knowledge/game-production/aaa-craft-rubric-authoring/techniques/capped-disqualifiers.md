---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: capped-disqualifiers
status: forged
laws: [grade-against-what-ships-not-on-a-curve, unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [a strong artifact passed with a fatal defect, writing the hard-fail list of a craft rubric, weighted scores are washing out breakages]
---

# Capped disqualifiers

A disqualifier is an error that forces the grade below the passing band no matter how
good the rest of the artifact is. It is not a heavily-weighted criterion; it is a
different mechanism, and conflating the two is what lets a broken piece average its
way through. Craft is not additive. A piece with one fatal defect is not the mean of
its strengths and its defect — it is a piece a lead rejects on sight, and the rubric
has to be able to say that in one move.

## Choosing what qualifies

A defect belongs on the capped list when all three hold:

1. **It is fatal alone.** A reviewer seeing only this, and nothing else about the
   piece, would send it back. Not "would note it" — would send it back.
2. **It is objectively determinable from the stored artifact.** Two examiners looking
   at the same artifact reach the same answer. If the presence of the defect is itself
   a judgment call, it is a criterion, not a cap.
3. **It cannot be compensated.** No strength elsewhere in the piece makes it
   acceptable. This is the test that removes most candidates: many serious defects are
   genuinely tradeable against exceptional work, and those belong in the weighted
   criteria where the trade can happen.

Three to six per lens. A long disqualifier list is a symptom, not thoroughness: it
means criteria that should be graded are being gated, and the instrument has lost its
ability to distinguish good from adequate because nearly everything hard-fails.

## What they actually look like

The strongest disqualifiers are the ones that read as boring technical facts, because
those are the ones two examiners always agree on:

- **A measured value outside a published limit** — a peak level above the delivery
  specification's ceiling, a primitive count above the class budget, a texture
  resolution above the platform's sampler allowance.
- **A required measurement absent entirely.** If the class's standard demands a
  measured figure and the artifact carries none, that is a hard fail, not a deduction.
  An unmeasured artifact is not a passing artifact; treating a missing number as
  neutral is how a class of content ships unverified.
- **A structural break that no viewing angle forgives** — a motion missing its ground
  contact, a limb sliding against the surface it is planted on, a source pose bleeding
  through into a delivered take, a telegraph whose timing and extent do not match the
  volume it is warning about, an effect with no declared upper bound on what it can
  spawn.
- **A declared budget with nothing behind it.** A stated allowance that the artifact
  never measures itself against is a wish, and shipping wishes is the failure this
  catches.
- **A value that contradicts the same entity's sibling artifacts.** When one quantity
  appears in two places produced by the same pipeline and the two disagree, the piece
  is not merely imperfect — it is unusable, and no downstream consumer can tell which
  number is real. This one is easy to overlook because each artifact is individually
  defensible; the defect exists only in the pair. A craft lens that judges pieces one
  at a time still catches it whenever the sibling value is stored with the artifact,
  which is a reason to store it.
- **Text inside a visual artifact that is not real, correctly-spelled words.** A
  generated surface carrying garbled lettering is not a stylistic choice, and a
  rubric that only forbids text outright will miss it the moment a sub-class is
  allowed to carry text legitimately.

Notice how many of these are absences. A rubric that only catches wrong values will
pass every artifact that omits the value entirely, which is the easier failure for a
generator to produce.

## The cap, mechanically

State the cap as a level, not as a subtraction. "Caps the grade at the second level"
is unambiguous; "minus forty points" interacts with weights, with other deductions,
and with the scale's floor in ways nobody can predict from reading the document. A
capped grade also carries the disqualifier that caused it, because the number without
the reason sends the producer hunting through every criterion for a defect the rubric
already knows the name of.

Multiple disqualifiers do not stack into a lower cap. The lowest applicable cap wins,
and all triggered disqualifiers are reported. Stacking implies a piece can be
progressively more disqualified, which is not a real distinction and turns the cap
back into arithmetic.

## Decision rules

- **When a defect is arguable, it is a criterion.** Push anything requiring
  interpretation into the weighted set. The cap's authority comes from being
  uncontestable; one contested cap costs the whole mechanism its standing.
- **When the same disqualifier fires on most artifacts of a class, it is a pipeline
  bug, not a quality bar.** Fix the producer. A cap that fires constantly stops being
  read.
- **A disqualifier never has an exception clause.** The moment a lens says "unless",
  producers optimise for the unless. If a case genuinely needs different treatment, it
  is a different deliverable class with its own lens.
- **Report the cap as a distinct outcome, not as a low score.** "Failed on a
  disqualifier" and "scored poorly across criteria" call for completely different
  fixes; a system that renders both as the same low number destroys that information.

## When not to use it

- **Where the defect is a matter of degree.** Slightly off, mostly off, and entirely
  off are three states; a cap sees two. Degree belongs to criteria.
- **Early in a class's life.** Before you have piloted a lens against known-good and
  known-bad artifacts, a disqualifier list is guesswork, and a wrong cap rejects good
  work with total confidence. Start with criteria, promote to caps the defects that
  the pilot shows are actually fatal and actually unambiguous.
- **For process failures.** That an artifact skipped a review stage or was produced
  out of order is a governance concern about the pipeline, not a craft judgment about
  the artifact. Keeping process failures out of the craft cap is what keeps the craft
  grade meaningful when the process is imperfect.

## The failure this prevents

Weighted rubrics wash out breakages. Ten criteria, one of them catastrophically
failed, nine of them strong: the composite lands comfortably in the passing band and
the pipeline ships a piece with an unforgivable defect, with a number attached
certifying that it was reviewed. The cap exists so that the instrument can produce the
one output a lead's eye produces instantly and arithmetic never will: *no, not this
one, regardless.*
