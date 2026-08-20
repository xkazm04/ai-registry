---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: generator-normalization-band
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
use_when: [deciding whether a delivered mesh still carries generator-default size, establishing the constant a pipeline detects against, a provider changed and sizes look different]
---

# Generator normalization band

## The concern

Text-to-3D and image-to-3D services fit their output into a fixed box: the longest
bounding-box extent of every result comes back at approximately one unit, whatever the
asset is. The behaviour is near-universal across providers because it falls out of how
the models are trained — the training geometry was itself normalised, and nothing in a
picture or a sentence carries a scale.

A receiving pipeline needs to distinguish two states that look identical in a file: *this
mesh still carries the generator's default size* and *this mesh has been given a real
size*. Guessing that a mesh near one unit is raw output is usually right and occasionally
badly wrong — a real one-metre crate exists. The technique turns the guess into a measured
detection with a stated basis.

## Procedure

1. **Assemble a corpus of real deliveries.** Every mesh the pipeline has actually
   received, not a sample chosen to prove the point, spanning every provider in use and
   every asset class — hero characters, props, weapons, environment pieces. Dozens is
   enough; the effect is large and the variance is small.
2. **Record the longest extent of each**, in the interchange format's own unit, together
   with the provider and the class. Store the raw table, not just the summary — the next
   person needs to re-run the summary against new rows.
3. **Derive the band, not the point.** Take the observed spread and widen it to a round
   interval that comfortably contains it. A band of roughly ±10% around the unit figure
   is what real corpora produce; a tighter band starts rejecting legitimate raw output.
4. **Publish the band as a named constant** alongside the nominal value it brackets, and
   attach the date and corpus size to it in the same place the value lives.
5. **Expose the detection as a boolean with a reason**, not as a silent branch. Callers
   that say "this delivery is generator-normalised, so its real-world size is unknown
   until a target is set" produce a message a human can act on.

## Decision rules

- **When the longest extent falls inside the band, treat the real-world size as
  unknown, not as one unit.** The detection says *the generator chose this number*, which
  is an absence of information, not information.
- **When it falls outside the band, do not conclude the asset was authored at world
  scale.** It may equally have been corrected once already, or scaled by hand. Outside the
  band means *not raw*, nothing more; the provenance question is separate.
- **When a new provider joins, re-measure before trusting the band on its output.** A
  provider that normalises to a different figure, or that respects a size hint, is exactly
  the case the constant was never measured against.
- **Never use the band as a pass/fail gate.** It is a *classifier of provenance*, and a
  mesh inside the band with no stated target renders as not-gradeable — the band never
  supplies the missing target.
- **Report the band's basis wherever the detection is reported.** A boolean that says
  "normalised" without the interval and the unit it was computed in is the same kind of
  bare number this whole subject exists to eliminate.

## Why a band and not an equality test

Normalisation is applied to a bounding box computed after the mesh is generated, so the
result carries small numerical drift, and some providers normalise a slightly different
quantity — the diagonal rather than the longest axis, or the box after a decimation pass
that shaved a stray vertex. Observed extents cluster tightly but not identically; an
equality test with an epsilon small enough to feel rigorous will miss real raw output and
send it downstream unflagged, which is the expensive direction of the error.

## When not to use it

- **When the provider accepts and honours a real-world size parameter.** Then the output
  is not normalised, the band is meaningless, and the size arrives with provenance — grade
  it against the request directly.
- **On assets that never left an authored pipeline.** Hand-modelled geometry near one unit
  is common and legitimate; running the detection on it produces a confusing flag.
- **As a substitute for measuring the delivery.** The band tells you which regime the
  number is in. The number still has to be measured, and a mesh that was never measured is
  not inside or outside the band — it is unmeasured.
- **On non-uniformly scaled assets.** A mesh with a longest extent inside the band but
  wildly different proportions than expected is a different defect, and the band will
  happily call it normalised while the real problem is shape.
