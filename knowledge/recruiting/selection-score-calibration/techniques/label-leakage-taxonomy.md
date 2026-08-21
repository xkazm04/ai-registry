---
layer: technique
type: technique
subject: selection-score-calibration
technique: label-leakage-taxonomy
status: forged
laws: [a-predictor-cannot-grade-its-own-labels, a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [before publishing any reliability or accuracy claim, classifying which outcomes a score contaminated]
---

# Label leakage taxonomy

Every outcome available for validating a selection score carries a defect: the
score may have helped cause it. The taxonomy is the discipline of *naming that
defect per arm of data*, attaching a ceiling to what each arm may conclude, and
carrying both onto every number drawn from it. Without it, a calibration surface
publishes one figure with four incompatible meanings behind it.

The instinct to fix leakage by filtering it away is wrong. In a live pipeline
there is no large uncontaminated pool; there are only arms of varying badness,
and the useful move is to classify rather than to discard. A contaminated arm
still tells you about internal consistency, and internal consistency is worth
knowing — as long as nobody reads it as predictive validity.

## The arms

Classify each outcome by **how the score reached it**, not by who was in the
room. Four levels, each with a code, a human-readable note, and a hard ceiling
on the verdict any number from that arm may carry:

- **Score-caused label (high).** The score directly produced the outcome: it
  fell below the gate and the candidate was rejected, or above it and the
  candidate advanced automatically. The label is a function of the prediction.
  Ceiling: this arm may never support a *trustworthy* verdict, at any sample
  size, with any curve shape. That is a structural bar, not a threshold — no
  amount of data repairs a definitional problem.
- **Reviewer-saw-score (medium).** A human made the call, having seen the number
  first. The outcome records anchoring as much as accuracy. This is genuinely
  better than the automatic arm — a human can override — and it is genuinely not
  independent. Ceiling: *suggestive*; agreement between score and reviewer is
  reported as concordance, never as validation.
- **No-automated-leakage (low).** The candidate was spared the gate by a clean
  arm and reached a human who was, in the intended design, not shown the score.
  This is the best arm available and it still is not clean in the pure sense:
  the reviewer may be score-blind by policy but not by architecture, and the
  arm by construction covers only candidates the gate would have rejected — the
  below-floor range. Ceiling: *trustworthy*, but only for the range the arm
  actually spans, and every claim from it names that range.
- **Unclassifiable.** Provenance for the decision is missing or contradictory.
  Treat as the worst arm it might be, never as the best. Uncertainty about
  contamination resolves against the claim.

The three graded levels are ordinal and the ceilings compose: a surface mixing
arms inherits the **worst** ceiling present, not an average. Averaging ceilings
is how a 5% clean arm launders a 95% contaminated one.

## Leakage is a property of the arm *and* the outcome axis

The taxonomy is two-dimensional, and collapsing it to one dimension is the
mistake that survives the first review. The same arm has a different causal
story for each outcome axis, and it deserves its own descriptor per cell rather
than inheriting one.

The instructive cell is the contaminated arm read on the hire axis. Reaching a
hire takes interviews, an offer and an acceptance — none of which the screening
score decides — so the *positive* label there genuinely was not produced by the
score. That is a real point in the axis's favour and it should be stated. It is
not a licence to downgrade the level, because the *negative* half still contains
every automatic rejection the score caused: a candidate the gate rejected counts
as "not hired". The coupling is weakened, not broken.

State the rule plainly: **a less circular arm is still a circular one.** Half a
label being clean does not make a label clean, and if the level were softened
here the structural bar would quietly stop applying to the axis most likely to be
quoted in a board deck.

## Procedure

1. **Enumerate the paths an outcome can be produced by** — automatic gate, human
   after seeing the score, human without it, imported from an external system,
   backfilled. This is a walk of the decision code, not a guess; a path nobody
   enumerated is the one that carries the leakage.
2. **Assign each path a level and a code.** The code is stable and machine-
   readable; the note is a sentence a recruiter can read, in the record's own
   words, not marketing about the pipeline.
3. **Partition outcomes by path, never mix silently.** Compute every statistic
   per arm. A single blended number is permitted only as a supplementary figure
   and only when it carries the worst level present.
4. **Render the level wherever the number renders.** Not in a footnote, not in a
   tooltip, not on a documentation page — beside the figure. A curve that has to
   be clicked to reveal it was drawn from score-caused labels will be screenshot
   without the click.
5. **Enforce the ceiling in code, not in guidance.** The verdict function takes
   the arm level as an input and cannot return a verdict above its ceiling — the
   bar sits *above* the statistical ladder, so no score however good can route a
   contaminated arm past it. A documented rule that a caller may forget is a rule
   that will be forgotten the week someone builds a second surface over the same
   data.
6. **Pin the bar with an executing test.** A guarantee asserted by reading source
   text, or living only in display copy, is machinery that is correct and
   unenforced — copy regresses, decision tables do not. Keep the verdict function
   free of presentation dependencies so it stays directly testable, and let the
   test fail if anyone reorders the bar below the ladder.

## Decision rules

- **When the only arm is score-caused, publish anyway — labelled.** Withholding
  the surface leaves the team with no signal at all and invites someone to build
  a worse one. Publish it as internal consistency with the ceiling attached, and
  make the absence of a clean arm the surface's loudest element.
- **When a clean arm exists but spans only part of the score range,** state the
  range on the claim. A validity claim about scores of 20–40 is not a validity
  claim about the cutoff at 65.
- **When provenance is ambiguous, downgrade.** Authority over an outcome may be
  moved from human to automated when the record is unclear, never the reverse.
- **When an arm's population differs systematically from the whole,** say so
  next to the level. Contamination and representativeness are separate defects
  and a low-leakage arm can still be an unrepresentative one.

## When not to use it

Do not apply the taxonomy to outcomes the score never touched at all — a
pre-deployment historical backtest over decisions made before the score existed
has no leakage to classify, and dressing it in arm labels implies a coupling
that is not there. Its own defect is different and must be named differently:
the historical decisions encode the *previous* selection policy, which is a
selective-labels problem of another kind, not a leakage one.

Do not use it as a fairness instrument. The taxonomy says nothing about whether
outcomes differ across groups; it says only whether the outcomes can validate
the score. A team that reads a clean arm as evidence of an unbiased gate has
made the substitution this whole subject exists to prevent.
