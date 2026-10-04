---
layer: technique
type: technique
subject: generative-artifact-gating
technique: generator-failure-deterministic-gates
status: forged
laws: [no-gate-self-certifies, structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a generated image fails in a way a person spots instantly and a model grader misses, adding a cheap automatic check ahead of a model grader, a model grader returned a value outside its own schema, deciding what an automated vision grader is allowed to decide]
---

# Generator-failure deterministic gates

## The concern

Image generators fail in repeatable ways, and several of the repeatable ways are
geometric: the subject is cropped by the frame, the subject lies at a slant when the
contract says level, a tile that must read as a surface repeats one motif at a visible
interval. A person sees each in a glance. A model grader asked to score the picture
frequently does not, because it is judging the picture's content and the defect is in its
layout. Each of these failures also has a measurement that costs milliseconds and no
spend. So the order is fixed: **run the deterministic gate for every failure the generator
is known to produce, then, and only then, let a model look at what is left**, and give the
model a narrower power than the gate has.

This is the perceptual rung that sits between structural validity and a human review. It
is not a taste check; it checks named, countable defects.

## Three gates worth having

**Raw margin, measured before trimming.** A pipeline that removes background and trims to
the subject's bounds destroys the evidence of cropping: the subject touches the frame edge
in the raw image, and after the trim nothing shows it. Measure the distance from the
subject's bounding box to each frame edge on the *raw* image, as a fraction of the shorter
side, and reject below a floor. Then make the failure uncorrectable downstream: adding
transparent padding to a cropped source must not pass, because the gate reads the raw
source, not the trimmed output. A subject cut off at the frame is a missing part of the
subject, and no later stage can regrow it.

**Principal axis orientation.** When the contract says an object lies along a given axis
(a vehicle drawn side-on, a plank drawn level), compute the major axis of the foreground
pixel distribution from its covariance and measure its angle from that axis. The gate
rejects a slant beyond a tolerance. State what it does not measure: an axis has no
direction, so it cannot tell nose from tail, and it is blind to perspective, so a
three-quarter view of a long object can still score level. Those are semantic questions.
Route them to a person; do not pretend the angle answered them.

**Tile repetition by autocorrelation peak.** An edge-difference check
([wrap-around-edge-diff](../../../asset-production/surface-and-imagery/tiling-texture-acceptance/techniques/wrap-around-edge-diff.md))
proves a tile is continuous with itself; it says nothing about whether the tile, once
repeated, reads as a grid. A generator asked for a tile will often produce a seamless image
that is itself several copies of one motif. Detect it with the circular autocorrelation of
the luminance: take a reduced-size greyscale copy, subtract the mean, compute the
autocorrelation by the power spectrum, normalise by the zero-shift value, and take the
largest value at any shift outside a small neighbourhood of zero. A uniform-noise tile
peaks low everywhere; a tile made of repeats shows a strong peak at the repeat interval.
Exclude shifts near zero or the peak is always one. Keep the shift's location with the
number: a peak at half the tile size says the image is two copies of itself. Gate the
shipped pixels, and keep the number from the raw source beside it as a second reading.

## Procedure

1. **Name each known failure and its measurement** in a table the gate and the report
   share. A failure with no measurement is a person's job, not a gate's.
2. **Fix thresholds in one configuration file** with a stated rationale and a calibration
   status beside each. A threshold in code is a second authority.
3. **Replay history.** Run the gates over the generator's real past failures and require
   that each named failure is caught with the measurement recorded. A gate never shown to
   catch the defect it exists for is a hope.
4. **Emit a code per failure and the measurement behind it**, never a bare pass or fail,
   so a rejected image explains itself and a corrective prompt can cite the axis
   ([cite-evidence-not-descriptions](./cite-evidence-not-descriptions.md)).
5. **Place the gates before any model grader and before the next paid stage**
   ([gate-before-every-credit-spend](./gate-before-every-credit-spend.md)).

## What a model grader is allowed to decide

A local vision model is a useful second reader for questions no measurement answers: wrong
subject, forbidden details, baked lighting, which way the nose points. Its power is
asymmetric, and the asymmetry is the rule:

- **It may reject, or route the image to a human. It may never accept.** The best outcome
  a model path can reach is *pending human review*. Two graders agreeing is not an
  acceptance, because agreement between errors correlates.
- **Disagreement, an "uncertain" answer, low confidence, a missing or invalid response
  and a missing human calibration set all route to a human.** Never resolve a split by
  majority; keep both observations for the reader.
- **High self-reported confidence repairs nothing.** A grader's confidence describes its
  own fluency, not the defect rate, until it has been calibrated against human labels.
- **A schema violation fails closed.** Bound every field in the schema, retain the raw
  returned content, and treat any out-of-range value as ungraded. A grader that returns a
  percentage where the schema asks for a fraction has told you its output cannot be
  parsed by contract; reading "100" as "1.0" is guessing on its behalf. Then tighten the
  schema (enumerate the allowed values rather than a numeric range) and rerun.
- **Graders of the same family are one grader.** Two models that share an architecture
  lineage share blind spots; counting them as two independent readers inflates the
  evidence. Record the family and count independent families, not models.

## Measured, simulated, authored

Thresholds here are authored from a handful of inspected samples. A fitted cutoff that
separates the labelled samples it was fitted on has shown that those samples are
separable, not that the gate generalises. State the sample count and who labelled it
beside every threshold, and call it **provisional** until a held-out, human-labelled set
supplies the false-accept and false-reject rates
([seam-threshold-calibration](../../../asset-production/surface-and-imagery/tiling-texture-acceptance/techniques/seam-threshold-calibration.md)
describes the procedure). A model grader's miss and false-flag rates measured against
labels the agent itself wrote are a diagnostic, not a calibration.

## When not to use it

- **Defects with no cheap measurement.** Style, anatomy and mood stay with the rubric that
  owns them; do not invent a number to dress a judgment.
- **Intentionally repeating or mirrored surfaces.** A kerb or a stripe is meant to
  repeat; declare the exemption per class, in the configuration, rather than raising the
  global threshold.
- **As acceptance.** Passing every deterministic gate shows that the known generator
  failures are absent. It does not show the asset is good, and the verdict must say so.
