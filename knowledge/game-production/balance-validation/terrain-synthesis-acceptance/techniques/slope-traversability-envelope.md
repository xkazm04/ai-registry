---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: slope-traversability-envelope
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding whether generated ground can be walked on, setting a walkable limit per locomotion class, a generated map is beautiful and nothing on it is traversable, reporting how much of a map a player can actually stand on]
---

# Slope traversability envelope

Traversability is not a property of a heightfield; it is a relation between a heightfield's
gradient and the limits of the things that move on it. State the relation as a **two-sided
envelope per locomotion class**, measure the gradient field against it, and report a
distribution rather than a verdict-shaped single number.

The naive reading is that one maximum angle settles it. It does not, for three separate
reasons, and each has shipped a broken map: the limit is different for every class of mover,
the aggregate that matters is a distribution rather than an extremum, and the measurement
depends on the spacing it was taken at as much as on the ground.

## The envelope

Each locomotion class declares a **maximum traversable angle** and a **minimum interesting
relief**. Movement systems typically compare a surface normal against a configured limit and
refuse anything above it — walkers commonly land somewhere in the region of the mid-forties,
climbers far above that, wheeled and mounted movers well below — and navigation bakes that
voxelize a surface degrade further as the limit rises, because past roughly forty-five
degrees a steep face and a wall stop being distinguishable to a voxelizer. The exact numbers
belong to the project; what does not vary is that **the number the acceptance check uses and
the number the runtime enforces are the same number**, read from one place.

The lower bound is the half teams omit and it is a real criterion. Ground below the minimum
relief for its class is a parade ground: it drains nowhere, offers no landmark, reads as
featureless in motion, and is the signature of a generator whose amplitude was tuned for a
thumbnail. A map class declares both ends, and a region that violates the floor is a finding
in the same way one that violates the ceiling is.

## Procedure

1. **Require the basis.** Sample spacing, vertical range and any exaggeration must be
   declared before a gradient means anything. Absent, report unmeasured and stop, per
   [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass).
2. **Compute the gradient at every sample** from its neighbours, and convert to the same
   quantity the runtime compares — an angle from horizontal, or the surface normal's
   deviation from vertical. Record which, because a gradient ratio and an angle in degrees
   are different numbers that look equally reasonable in a report.
3. **Measure at the spacing the runtime consults.** Where collision or navigation uses a
   decimated representation, measure the decimated one too and report both; the authored
   field is the one artists look at and the decimated one is the one the player stands on.
4. **Bin the results into a distribution** — the fraction of ground below the ceiling, the
   fraction above, and where the mass sits — rather than reporting an extremum. A map's
   steepest sample is almost always a cliff, and a cliff is not a defect.
5. **Segment the in-envelope ground into connected components** and report their sizes. This
   is the step that turns a comfortable percentage into a useful one: traversable ground
   split into isolated pockets by impassable ridges is not the same asset as one connected
   sheet of the same total area.
6. **Report achieved beside declared, always**, and name the class each figure was computed
   for. A single global number over a map that hosts three locomotion classes is three wrong
   answers averaged.
7. **Emit findings that name places.** "The eastern third is above the walker ceiling and is
   disconnected from the start component" is actionable; "slope out of range" is not.

## Decision rules

- **When a map hosts more than one locomotion class, compute one envelope per class and keep
  the results separate.** The union is meaningless and the intersection is pessimistic;
  designers need to know which mover the region is for.
- **When the in-envelope fraction is high but fragmented, treat it as a failure rather than a
  pass.** Fragmentation is the defect that a percentage hides, and it is the one that makes a
  map unplayable while every summary statistic looks healthy.
- **When a steep region is intended as a boundary, declare it as one.** An intentional
  impassable ridge and an accidental wall through the middle of the play space are identical
  in the gradient field and opposite in the design. The declaration is what separates them,
  and it is a human's to make.
- **When the measured ceiling and the runtime's configured limit are held in two places,
  collapse them to one before trusting either.** A check that passes ground the movement
  system refuses is worse than no check, because it converts a discoverable bug into a
  confident report.
- **When slope is measured on a smoothed or decimated field only, do not claim the ground is
  traversable.** Smoothing raises the pass rate by construction. State which representation
  was measured; a claim about the authored field is not a claim about the played one.
- **When the ground is uniformly inside the envelope, check the floor before celebrating.** A
  perfect pass on the ceiling with a violated floor is a flat map, and it will be reported
  later as "the world feels boring" by someone who cannot name why.

## What it does and does not establish

Passing the envelope proves the ground's gradient admits movement of a stated class. It does
not prove the space is navigable, legible, interesting, or connected to anything in
particular — connectivity is reported here as a separate figure precisely because it is a
separate claim. Nor does it prove that a mover will actually traverse it, since step height,
ledge handling, obstacle clearance and the collision representation all intervene between a
gradient and an actual footfall. This is a rung above structural validity and below observed
movement, and a claim of traversability names the rung it was proven at, per
[structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient).

## When not to use this

- **Ground no one traverses** — backdrop relief beyond the play boundary, decorative
  displacement, terrain seen only from the air. Grading it against a walker's envelope
  generates findings nobody should act on and trains readers to ignore the report.
- **Flying, swimming or free-movement spaces,** where the gradient constrains nothing. These
  need a clearance and volume analysis instead, and the slope figure is noise.
- **As a substitute for a traversal test.** A gradient field says the slope permits movement;
  an agent that actually walks the region says movement happened. The cheap check runs
  everywhere and the expensive one runs on the regions the cheap check flags as marginal.
