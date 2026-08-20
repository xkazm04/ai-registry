---
layer: technique
type: technique
subject: selection-score-calibration
technique: reliability-bins-and-proper-scoring
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, uncertainty-resolves-toward-the-candidate, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [building a reliability curve over a screening score, choosing a metric for score quality, recommending a threshold band]
---

# Reliability bins and proper scoring

Two instruments, used together, answer "is this score ordered and correctly
scaled": a **reliability curve** that shows what actually happens at each level
of the score, and a **proper scoring rule** that collapses the whole thing to one
number you cannot game. Neither substitutes for the other. The curve without the
scalar invites eyeballing; the scalar without the curve hides the shape, and the
shape is where miscalibration lives — S-curves, plateaus, and a single band that
inverts are all invisible to a summary statistic.

## The curve

Bin the scored population by score, and in each bin plot the observed rate of the
positive outcome. A well-behaved score produces a monotone climb; a well-*scaled*
one produces a climb that tracks the score's own face value.

Construction rules that decide whether the curve is honest:

- **Fixed-width bins over the score's full range**, not quantile bins, when the
  purpose is threshold selection. Quantile bins guarantee equal counts and
  therefore hide exactly the sparsity you need to see near the cutoff. Use
  quantile bins only for a summary view, and label which you used — the two
  curves look similar and mean different things.
- **A per-bin minimum.** Below roughly eight resolved outcomes a bin's rate moves
  by more than ten points when one candidate's outcome changes. Under-populated
  bins render as *gaps* — visibly absent, with their count shown — not as points
  and not as interpolated segments. An interpolated line through a hole is a
  fabricated claim.
- **Bins are populations, not predictions.** If the score is a rank percentile
  rather than a probability, the diagonal is meaningless and drawing it is a lie
  of grammar. Say what the axis is.
- **One arm per curve.** Overlaying arms is fine and informative; blending them
  into one line is not.

Read the curve for three failure shapes. **Flat** — the score does not separate
at all; every band advances at the same rate, and the number is decoration.
**Inverted in a band** — usually a data bug or a subpopulation the score
mishandles, and always worth chasing before anything else. **Cliff at the
production threshold** — the giveaway that you are looking at the threshold's
effect, not the score's signal.

## The scalar

Use a **strictly proper** scoring rule — one whose expected value is optimised
only by reporting your true belief. Mean squared error between the predicted
probability and the binary outcome is the workhorse: bounded, decomposable, and
comprehensible to non-specialists. Log loss is equally proper and punishes
confident errors harder, which is a virtue in some settings and a source of
infinite penalties on single mislabelled rows in others.

Two things the choice buys you. **Impropriety is not a stylistic complaint**: a
rule that can be improved by shading your stated probability rewards a model for
being systematically over- or under-confident, which is precisely the defect
calibration exists to detect. And a proper rule **decomposes** into a reliability
term, a resolution term, and the irreducible uncertainty of the base rate — so a
poor score can be diagnosed as "well-ordered but mis-scaled" (fixable by
recalibration) versus "carries no information" (not fixable by recalibration),
which are completely different remediations.

Expected-calibration-style aggregate gaps are a reasonable third figure but never
the headline: they depend on the binning, they are not proper, and a model can
lower them while getting worse.

## Recommending a threshold band from the curve

The curve supports a recommendation; it does not make one.

1. **Look one band-width either side of the live cutoff, not across the whole
   range.** The question is never "where is the globally optimal threshold"; it
   is "is the cutoff currently in the wrong place, and which way". A band width
   of about ten points of a hundred-point score keeps the evidence local to the
   decision being made. A cutoff already at either extreme has no band to move
   toward, and the honest output is nothing at all.
2. **Judge each band on an absolute rate, not on a delta.** Two named cuts do
   the work: if the band *below* the cutoff advanced at a high rate — around 0.6
   — the cutoff is rejecting people who work out and should come down; if the
   band *above* it advanced at a low rate — around 0.4 — the cutoff is keeping
   people who fail downstream anyway and should go up. Absolute cuts are
   auditable in a sentence a recruiter can read; a delta between two noisy rates
   is not.
3. **Enforce the per-band floor** on both sides. A separation computed from six
   people below the line is not a separation, and the band floor is what stops
   the recommendation from being a slider that follows the last few candidates.
4. **When both directions qualify, the better-supported band wins; when they tie,
   the candidate-protective direction wins.** Recommend the *lower* cutoff. This
   is not conservatism for its own sake: the two errors are not symmetric, and
   the system's default must sit on the side where the mistake is recoverable.
5. **Carry the arm, the band and the sample onto the recommendation.** A
   recommendation without its leakage level is a threshold justified by the
   previous threshold, and one without its band is unauditable.

## Measure the move, or the loop is recommend-apply-hope

A threshold change is a hypothesis about the pipeline, and almost nobody checks
it. Close the loop: for the exact band the last change targeted, split that
band's decisions at the moment of the change and compare the advance mix before
against after. Same per-band floor on the *after* side — the bar to measure a
change is the bar to recommend one — so a handful of decisions since the move
reads as "too few to judge yet" rather than as a confident small-sample
percentage. A rate rendered without its count next to it will be read alone.

## Decision rules

- **When the curve is flat, recommend nothing and say why.** "No defensible
  cutoff" is the correct output, and it is far more useful than the least-bad
  number.
- **When the whole surface is under the global outcome floor,** compute nothing.
  Render the count and the insufficient-sample verdict.
- **When the score is not a probability, do not present the scalar as if it
  were.** Either map the score to a probability through an explicit calibration
  step and validate *that*, or restrict yourself to ordering claims.
- **When the model changes, the curve resets.** A verdict is bound to what it
  judged; outcomes produced by a superseded scorer do not validate the new one.

## When not to use it

Do not run this over a population whose outcomes are dominated by one arm of
score-caused labels and then act on the shape — the shape will be excellent by
construction. Classify first, then draw.

Do not use reliability bins as a group-fairness surface. Per-group curves are
worth drawing, but the moment the question becomes "does the gate treat groups
differently", the instrument changes: selection rates, sample rules and legal
framing all belong to adverse-impact analysis, which has its own thresholds and
its own reporting duties.
