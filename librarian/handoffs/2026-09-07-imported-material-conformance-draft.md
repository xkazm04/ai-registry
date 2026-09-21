---
layer: technique
type: technique
subject: generated-asset-world-scale
technique: surface-convention-at-the-import-edge
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [wiring an import path between an interchange format and a renderer, imported assets arrive washed out or uniformly glossy, a team is hand-correcting the look of every delivered material, an imported window came in opaque and nobody can find what removed the transparency, deciding what an import step owes beyond geometry]
---

# Surface convention at the import edge

## The concern

The subject's central move — *the information was destroyed upstream and has to be
deliberately re-established at the receiving end* — is not only true of size. Size is
merely the instance where the damage is loud. The same edge carries the asset's **surface**
across the same boundary, under the same absence of a shared convention, and there the
damage is quiet.

That difference is the whole reason this technique is needed and the unit one is not
enough. Unit and axis errors are **round**: a factor of a hundred, a ninety-degree lay-down.
A round error is absurd on sight and gets diagnosed before lunch. Not one of the surface
errors is round. The asset arrives correctly sized, correctly oriented, lit, shaded,
plausible — and slightly bad.

There are three disagreements at this edge and each has its own signature.

**1. Colour space is a per-role property, not a per-asset one.** The interchange formats in
common use declare base colour and emissive textures as sRGB and the metallic-roughness,
normal and occlusion textures as linear — a split that exists because three of those maps
carry *measurements* and two carry *appearance*. An importer that applies one colour-space
policy to every texture in a delivery is therefore wrong about three maps out of five
whichever policy it picks. Signature: albedo that reads washed out or muddy while the shape
and the shading response read correctly.

**2. The gloss axis is inverted between conventions, not scaled.** One convention names the
axis roughness, where zero is a mirror and one is fully diffuse. Another names it smoothness
with the ends swapped. Copying the number across the boundary without negating it maps the
roughest possible surface onto the glossiest possible one. **The midpoint is a fixed
point**: a material sitting at the middle of the range comes through correct under the bug,
which is exactly why a spot check clears it.

**3. A property the format defaults is not a property the asset carries.** The metallic and
roughness factors both default to fully on, so a material that simply omits them arrives
fully metallic and fully rough — and through an un-negated gloss axis, fully metallic and
mirror-glossy. Transparency and two-sidedness default to off, so a pane authored as a window
arrives as an opaque single-sided card. The author reads that as the modelling tool failing
to export something and goes looking in the wrong place, because nothing was lost: a default
was applied to a property nobody stated.

Disagreements 2 and 3 compound into the familiar imported look — everything shiny — and
because the compound is uniform across a delivery it reads as a taste problem rather than an
arithmetic one.

## An imported material is not yet an editable material

There is a second obligation at this edge with no analogue on the transform side, and it is
why per-asset polish becomes permanent. A delivery carries its materials *embedded*: they
are a property of the imported blob rather than addressable artifacts in the project, so a
correction has nothing to attach to. An artist who fixes one surface has fixed one instance,
and the next delivery of the same asset restores the defect.

So the import owes a **materialisation** step — every material the delivery references
becomes a first-class, addressable asset — and it owes it *inside* the import rather than as
a step someone remembers afterwards. A scale correction can live as one number on an import
setting; a surface correction cannot live anywhere at all until this step has run.

## Procedure

1. **Write down the surface convention of every participant.** For each interchange format
   the pipeline reads or writes and each renderer it targets: the colour space of each
   texture role, the name and sense and range of the gloss axis, which channel carries which
   quantity, and the default value of every factor. Six or seven facts each. This table sits
   beside the unit-and-axis table, is no longer, and is even rarer.
2. **Implement the conversion as one named edge per direction** — negating and re-spacing
   where the conventions differ, applying the colour-space decision per texture role rather
   than per asset. Exactly one place knows the mapping.
3. **Test the edge with a swatch, not with an asset.** Author a strip of quads at stated
   gloss values — 0, 0.25, 0.5, 0.75, 1 — with a stated base colour, a stated alpha mode and
   one map per texture role; push it through the edge and assert what comes out. **The swatch
   must carry values off the midpoint.** The midpoint is the fixed point of the inversion, so
   a swatch built around a single mid value passes under the exact bug it exists to catch:
   calibrate at both ends, or the ruler reads correct while pointing backwards. This is the
   surface twin of pushing a cube of a stated size through the transform edge.
4. **Extend the check to one real delivery.** The swatch proves the arithmetic; a real asset
   proves the exporter's own settings, which is where the drift actually lives.
5. **Materialise on import**, per the section above, so a correction has somewhere to live.
6. **Keep convention conversion and artistic correction as separate factors**, even where
   both run in one pass — one is a property of the boundary and one is a property of the
   asset. This is the same separation the transform edge keeps between unit conversion and
   size correction, and it fails the same way when merged: neither half stays diagnosable.

## Decision rules

- **When every imported asset is wrong in the same direction, do not touch the assets.** A
  uniform error across unrelated deliveries is a boundary error, and correcting it
  asset-by-asset converts a one-line fix into a permanent pipeline stage.
- **When a material reads correct at the midpoint and wrong at both ends, the gloss axis is
  inverted, not mis-scaled.** This is the cheapest diagnosis available at this edge and it
  costs one swatch.
- **When the colour reads wrong and the shading response reads right, suspect the
  colour-space policy rather than the shading model.** The split is per texture role, so the
  failure lands on some maps and not others — which is also why "half the maps look fine" is
  evidence *for* this diagnosis rather than against it.
- **When an asset arrives missing a property nobody removed, read the format's default before
  blaming the exporter.** Opaque windows and fully metallic plaster are defaults being
  applied, not information being lost.
- **When two import paths disagree about a surface, the second one is wrong, not different.**
  One authority per boundary, exactly as for the transform.
- **A hand-authored fixer that corrects the look after import is evidence the edge is
  missing, not a substitute for one.** It runs beside the import rather than inside it, so
  every new delivery re-acquires the defect, the correction is re-applied from memory, and
  the day someone imports without running it the defect ships.

## Why this error survives when the transform errors do not

A hundredfold size error is discovered in an afternoon because the asset is absurd. An
inverted gloss axis produces an asset that is entirely plausible and merely *cheap-looking* —
and cheap-looking is indistinguishable from "the generator is not very good at materials",
which is the explanation every team reaches for first because it is the one that requires no
investigation.

That is the whole decay. The convention error is classified as a quality ceiling, the quality
ceiling justifies a manual polish pass, the polish pass becomes somebody's role, and the
pipeline acquires a permanent per-asset stage whose actual job is undoing a missing negation
at a boundary. The tell that this has already happened is a project-specific script that
"makes imports look right", which everyone runs by habit: it is the edge, written in the
wrong place, at the wrong time, by someone who diagnosed the symptom correctly and the cause
not at all.
