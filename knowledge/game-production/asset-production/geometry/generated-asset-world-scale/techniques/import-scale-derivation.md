---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: import-scale-derivation
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [computing the uniform scale for an import, someone is hand-tuning a scale value, deciding what a scale grade should report, a correction seems to have been applied twice]
---

# Import scale derivation

## The concern

The uniform scale that makes a delivery the right size is a **derived quantity**: target
extent divided by measured extent. It is never a setting, never a preference, and never a
value anyone types. The moment it is typed, the pipeline has two authorities for one
quantity — the design's stated target and the number in the field — and they will diverge
silently, because nothing compares them.

The technique is to compute the factor from two measurements, report it always, and make
the two inputs' absence visible rather than substitutable.

## Procedure

1. **Measure the delivered longest bounding-box extent** from the actual geometry, in the
   interchange format's declared unit. Not from metadata, not from the generator's report:
   a producer's claim about its own output is an input to a verdict, never the verdict.
2. **Obtain the target extent** from the class nominal or from the author (see
   nominal-extent-only-where-honest). Both sides of the division must be present and
   positive.
3. **Divide: scale = target ÷ measured.** Keep it a single uniform factor. Non-uniform
   per-axis correction is not scale fixing — it is deforming the asset to hide a
   proportion defect, and it breaks every normal map and every rigid attachment.
4. **Compute the ratio too** — measured ÷ target — and grade against it. The ratio is the
   diagnostic ("this came back 1.8× too small"); the scale is the fix. They are reciprocals
   and reporting both saves every reader a mental inversion at the exact moment they are
   confused.
5. **Report the factor even when the delivery passes.** A caller that always receives a
   factor can always apply it; a caller that receives one only on failure has to branch,
   and one of those branches will be wrong.
6. **Apply it in exactly one place**, at the import edge, and record that it was applied.
   A correction that can be applied by a modelling rescale *or* by an importer setting must
   be assigned to one of them by policy.

## Decision rules

- **When either input is missing, the result is not a scale of 1.** It is *not derivable*,
  with a reason naming which side is missing. A neutral-looking 1.0 is the single most
  effective way to ship a mis-sized asset, because it is indistinguishable from a correct
  derivation.
- **When the ratio is within the class tolerance, still derive and report the factor.**
  "Matches" is a verdict about acceptability, not a claim that the factor is exactly one.
- **When someone wants to nudge the factor, change the target instead.** The target is the
  design statement; if the asset should be bigger, the design changed. Tuning the derived
  value destroys the record of what was asked for.
- **When the same correction could be applied at two stages, forbid one of them in
  writing.** Double correction produces an error that is the square of the intended factor
  and looks like a wildly broken asset, which at least fails loudly — but the near-miss
  case, where a partial rescale happened upstream, produces a plausible wrong size.
- **When the factor is very close to a round number like a hundred, suspect a unit error,
  not a size error.** Those are different defects with different fixes (see
  unit-convention-at-the-engine-edge).

## What "measured" must mean

The measurement has to come from the geometry as it will be consumed, after any finishing
stage that could change the bounds — a decimation that removes an outlying speck moves the
bounding box, and a bounding box computed before it is a measurement of a different
object. Where the extent is measured, and on which version of the asset, belongs in the
report next to the number. A factor derived from a stale measurement is worse than no
factor, because it is confidently wrong.

Bounds also include things a human would not count: a stray floater fifty centimetres from
the body inflates the longest extent and shrinks the derived factor accordingly. Structural
cleanup therefore precedes measurement, and a delivery with known floaters produces a
measurement flagged as provisional rather than a silently deflated scale.

## When not to use it

- **On assets whose size is set by the level rather than by the asset** — a stretched
  backdrop, a decal plane — where per-instance transform is the design, not a defect.
- **On non-uniform intent.** If an asset genuinely needs different factors per axis, the
  request is a modelling change, not an import setting; route it back to authoring.
- **When the target is expressed as something other than a longest extent** — a height for
  a tall thin object, a width for a wall segment. Then derive against that named dimension
  and say which one; a longest-extent factor applied to a height target is a unit error in
  disguise.
