---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: seam-threshold-calibration
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, law-and-check-share-one-source]
shared_with: []
use_when: [choosing the cutoff for an automated seam check, an automated check is rejecting good textures, defending a threshold someone wants to relax, re-tuning a check after the generator changed]
---

# Seam threshold calibration

## The concern

An edge-difference score is a continuous number and a verdict is binary, so a cutoff must
exist. Where the cutoff is placed decides everything about whether the check is worth
running, and it is almost always picked as a round number that felt about right. A round
number is an assertion. A calibrated one is a measurement, and it comes with two rates
that can be quoted when someone asks to loosen it.

## Procedure

1. **Build a labelled corpus.** Take a few dozen real outputs from the actual generator,
   in the actual sizes and styles the pipeline produces. Tile each one in a grid — two by
   two is enough — and have a human mark *seam visible* or *clean*. The human is the
   ground truth; the number exists to approximate the eye, not to replace its authority.
2. **Score every item** with the wrap-around edge measure, unchanged from the one that
   will run in production.
3. **Plot the two distributions.** Clean tiles cluster low; seamed tiles cluster high;
   they overlap. The overlap is real and is not a defect in the method — it is where a
   faint tonal drift lives, which some reviewers call a seam and some do not.
4. **Choose the cutoff inside the overlap, biased toward catching seams**, and record
   the two rates it produces on the corpus: what fraction of true seams it catches, and
   what fraction of clean tiles it falsely flags. Those two numbers, not the threshold,
   are what the check is worth.
5. **Record the base rate alongside them.** How often the generator produces a seam at
   all decides whether the check pays for itself. Measured on current general image
   models asked for tiling output, roughly one in four comes back seamed — a rate at
   which an automated check is unambiguously worth its cost.
6. **Write the threshold, its unit, its basis and its date in one place** that both the
   running check and the prose documentation read. A cutoff described in a document and
   typed separately into an implementation will diverge, and neither side can see it.
7. **Re-calibrate when the generator changes.** The threshold is a fact about a corpus
   from a moment; a new model or a new size regime invalidates it. A stale threshold that
   nobody re-measured is an unmeasured threshold wearing a number.

## The consequence asymmetry — this is what sets the bias

The two error types do not cost the same, and the difference is roughly two orders of
magnitude:

- **A missed seam ships.** It passes review, is imported, is applied, is built, and is
  found by a player or by a lead in a late playthrough. The fix is a full round trip and
  it happens at the worst point in a schedule.
- **A false flag costs one re-roll.** Seconds of generation time, no human involved, and
  the pipeline continues.

Therefore the cutoff sits low — deliberately toward over-flagging. A check tuned for
elegant balance between the two rates is mistuned for this problem. State the asymmetry
explicitly next to the threshold, because the first person who finds the check annoying
will propose raising it, and the argument against that has to be written down.

## Decision rules

- **When a threshold is defended by "it looked right", it is not calibrated.** Treat it
  as provisional and flag it as such until a corpus exists.
- **When someone asks to raise the cutoff because of false flags, quote the two rates**
  and the cost asymmetry, then ask for the corpus item that was wrongly flagged. If they
  supply one, add it to the corpus and re-derive; if they cannot, the request is friction,
  not evidence.
- **When the score is expressed as a normalised fraction, keep a human-readable form
  next to it** — the same cutoff in the raw units a person can picture. A working
  conservative cutoff for a mean absolute per-channel edge difference sits near eight
  percent of full range, which is about twenty levels out of two hundred and fifty-five;
  the second phrasing is the one an artist can reason about. A number handed over without
  its unit and its basis is not information.
- **When two channels or two axes are checked, they may share one cutoff** only if their
  score distributions were shown to be comparable. Assume they are not until measured.
- **Never let the threshold be a per-call parameter a caller can pass.** Then every caller
  has its own cutoff, the quantity has as many authorities as there are call sites, and
  the calibration means nothing.

## When NOT to use it

- **Before there is a corpus.** With ten items you are fitting noise. Ship a deliberately
  conservative provisional cutoff, label it provisional, and collect.
- **For a perceptual quality score.** This procedure calibrates a threshold on a physical
  discontinuity with an unambiguous ground truth. "Does this tile read as repetitive" has
  no such ground truth, and a two-rate calibration over a subjective label produces a very
  confident-looking number about nothing.
- **When the check is advisory rather than gating.** If nothing is blocked, there is no
  cost asymmetry to balance and the effort belongs elsewhere — though an advisory seam
  check is usually a symptom that someone did not believe the base rate.
