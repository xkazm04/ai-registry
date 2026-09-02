---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: heightfield-resolution-and-vertical-basis
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [receiving a generated heightfield with no stated units, deciding the sample spacing and vertical range for a map class, a generated world feels uniformly too dramatic or too flat, reconciling an exporter's vertical scale with an importer's]
---

# Heightfield resolution and vertical basis

A heightfield is two grids of information wearing one array: a horizontal one, defined by
how far apart the samples sit, and a vertical one, defined by what the sample values mean.
Neither is recoverable from the numbers. A field of values between zero and one covering a
thousand samples is equally a mountain range across forty kilometres and a gravel pile
across four metres, and the generator that produced it does not know which it made.

The naive reading is that this is a units nuisance to be settled at import time. It is not;
it is the precondition for every other measurement in terrain acceptance. Slope is a ratio
of vertical to horizontal, so a field with no basis has no slope, and a traversability
verdict computed over it is a confident number about an assumption. Establish the basis
first, once, and carry it.

## The three declared quantities

**Sample spacing** — the horizontal distance between adjacent samples, in a stated unit.
This is the resolution that matters; the sample count is not resolution, because two grids
of the same count over different extents describe entirely different landscapes. Where a
tool states extent and count instead, the spacing is a division and the division is
performed once and recorded, not re-performed by every consumer.

**Vertical range** — the real-world distance the full numeric span of the samples covers,
in the same unit. Together with the quantization of the stored values this fixes the
smallest elevation step the field can express. The step is worth computing and stating:
coarse quantization over a large vertical range produces visible stepping on gentle ground,
which reads as terracing and gets misdiagnosed as a filtering problem for a week.

**Exaggeration** — any multiplier applied to the vertical after generation and before
measurement. Usually authored to make a preview read well. It is part of the basis, it is
declared as a number, and it is applied before any gradient is computed.

State all three beside the field, per
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
A field that travels without them is a picture, and the honest verdict on it is *not
gradeable*.

## Procedure

1. **Resolve the basis before anything else runs.** If sample spacing, vertical range or
   unit is absent, stop and report unmeasurable. Do not adopt a default: a class-wide
   default spacing invents a landscape the author did not ask for, and it propagates
   silently into slope, drainage, area and every mask threshold keyed on elevation.
2. **Fold exaggeration into the vertical range at the moment it is applied,** so that
   exactly one number describes the vertical afterwards. Two numbers that must be
   multiplied by every consumer is the same defect as two authorities.
3. **Record the quantization step** as vertical range divided by the number of representable
   levels, and compare it to the smallest relief the map class needs to express.
4. **Name one owner for the vertical.** Where an exporter writes a scale and an importer
   also holds one, one of them is derived from the other and the derivation is visible.
   Duplicated vertical scale is the condition
   [one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity) exists to
   forbid, and its signature is a world that is subtly and uniformly wrong in one axis.
5. **Re-derive the basis on every resample.** A field decimated for collision, for a distant
   tile, or for a navigation bake has a new spacing; carry the new one with the new field
   rather than letting the original travel with a grid it no longer describes.
6. **Publish the basis with the field to every downstream consumer,** because slope, area,
   drainage and mask elevation thresholds all read it and none of them can reconstruct it.

## Decision rules

- **When the vertical range is unstated but the horizontal is known, do not infer it from
  the terrain's appearance.** Inference here always produces a plausible number, which is
  worse than an absent one: an absent number blocks the pipeline, and a plausible number
  ships.
- **When a preview and a playable build disagree about how dramatic the terrain looks,
  suspect exaggeration before suspecting the generator.** An undeclared preview multiplier
  is the single most common cause, and it is a bookkeeping bug that presents as an art
  problem.
- **When choosing sample spacing, choose it from the smallest feature that must survive,
  not from a memory budget.** A feature narrower than two samples does not exist in the
  field regardless of how carefully it was generated; a ledge, a ramp or a defile that the
  design depends on sets the floor, and the budget then decides how large the map can be.
- **When spacing is coarse relative to the character, expect slope to be under-reported.**
  Coarsening averages gradient away, so a coarse field reads as gentler than the ground the
  runtime presents. Measure at the runtime's spacing and say so.
- **When a map is assembled from tiles generated separately, require one basis across all of
  them** and check it rather than assuming it. A seam between two vertical scales is a step
  in the ground that no generator intended and no structural check reports.
- **When a stored field must stay in a normalized numeric space, keep the basis as
  metadata beside it rather than baking real units into the samples.** Baking makes the
  field non-portable and, worse, makes a second baking undetectable.

## When not to use this

- **Fields that are never traversed** — a distant silhouette, a skybox relief, a decorative
  displacement on a surface nobody stands on. These need enough basis to be placed
  correctly and none of the traversal-facing discipline, and demanding the full declaration
  for them is bureaucracy that teaches people to route around the check.
- **Authored terrain sculpted directly in world space,** where the basis is the world's own
  and there is no import edge for it to be lost across. The discipline applies to the
  *transfer* of a field between a producer and a consumer; where no transfer happens there
  is nothing to declare.
- **As a quality judgment.** A field with a perfectly declared basis can still be ugly,
  unplayable and hydrologically absurd. This technique makes the other measurements
  possible; it is not one of them.
