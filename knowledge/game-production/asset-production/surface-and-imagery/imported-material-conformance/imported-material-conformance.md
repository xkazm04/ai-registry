---
layer: golden-path
type: golden-path
subject: imported-material-conformance
status: forged
use_when: [wiring an import path between an interchange format and a renderer, delivered assets arrive uniformly shiny or washed out, an imported window came in opaque and nobody can find what removed the transparency, a team is hand-correcting the look of every delivered material, deciding what an import step owes beyond geometry]
techniques:
  - colour-space-is-per-texture-role
  - gloss-axis-inversion-and-the-midpoint
  - format-defaults-are-not-asset-properties
  - materialise-on-import
  - surface-conformance-swatch
  - a-fixer-script-is-the-edge-in-the-wrong-place
---

# Imported material conformance

A surface authored in one place and rendered in another crosses a boundary that neither
side owns. The geometry survives that crossing more or less intact — a triangle is a
triangle everywhere — and the **material does not**, because a material is not a thing but
a set of numbers whose meaning is fixed by a convention, and the two sides of the boundary
hold different conventions and neither declares which one it is using.

This subject is the discipline of receiving a material correctly: what has to be converted
at the edge, what has to be re-stated because it was never carried, what has to be made
addressable before anything can be corrected at all, and how to prove all three with an
artifact that costs an afternoon to build.

## Why these errors survive and the geometric ones do not

The sibling half of this edge — unit, axis, handedness, world scale — fails **roundly**. A
factor of a hundred, a ninety-degree lay-down. Those errors are absurd on sight, someone
notices them before lunch, and the diagnosis is nearly free because the number itself names
the bug.

Not one of the surface errors is round. The asset arrives correctly sized, correctly
oriented, lit, shaded, entirely plausible — and slightly bad. It looks like a lesser asset
rather than a mis-read one. That single fact drives every decay in this subject, because
*cheap-looking* is indistinguishable from *the upstream tool is not very good at
materials*, and the second explanation is the one every team reaches for first: it requires
no investigation, it blames nobody present, and it has an obvious remedy, which is that
somebody should go and polish the imports.

The remedy is the disease. A convention error misclassified as a quality ceiling becomes a
manual polish pass, the polish pass becomes somebody's role, and the pipeline acquires a
permanent per-asset stage whose actual job is undoing a missing negation at a boundary.

## Three shapes of failure, and they need different fixes

Everything in this subject is one of three things, and the most common mistake is treating
all three as "the import is wrong".

| Shape | What actually happened | Where the fix lives |
| --- | --- | --- |
| **Misread** | The number crossed intact and was interpreted under the wrong convention | A conversion at the edge |
| **Never stated** | The property was not in the delivery at all; the format supplied a default | A stated policy about defaults, upstream or at the edge |
| **Unaddressable** | The correct value is known and has nowhere to live | A materialisation step inside the import |

They are not variants. A misread is arithmetic and has one right answer. A never-stated
property has no right answer available at the edge — the edge can only choose between a
default it did not author and a refusal. And an unaddressable material cannot be fixed by
any amount of correct arithmetic, because there is no artifact to write the result onto.
A pipeline with only the first of the three implemented looks finished and re-acquires its
defects on the next delivery.

## Misreading, one: colour space is a per-role property

The interchange formats in common use do not declare one colour space for a delivery. They
declare it per **texture role**: base colour and emissive carry a display transfer curve,
while the metallic-roughness, normal and occlusion textures are linear. That split is not
an accident of history. Three of those five maps carry *measurements* — quantities a
shading model will do arithmetic on — and two carry *appearance*, which is a thing a
display has to reproduce.

So an importer holding a single colour-space policy is wrong about three maps out of five
whichever policy it picks, and the failure is silent in both directions: a measurement map
decoded through a display curve returns values that are subtly and uniformly wrong, and an
appearance map read as linear returns a picture that is washed out or muddy. The signature
is diagnostic and is the reason "half the maps look fine" is evidence *for* this diagnosis
rather than against it — see
[colour-space-is-per-texture-role](./techniques/colour-space-is-per-texture-role.md).

## Misreading, two: the gloss axis is inverted, not scaled

One convention names the gloss axis roughness, where zero is a mirror and one is fully
diffuse. Another names it smoothness, with the ends swapped. These are the same axis read
backwards, and copying the number across the boundary without negating it maps the roughest
possible surface onto the glossiest possible one.

Two properties of that inversion decide how it is found. First, **the midpoint is a fixed
point**: a material sitting in the middle of the range comes through correct under the bug,
which is precisely why the spot check everyone performs clears it. Second, the receiving
side often keeps the quantity in a *different channel of a different texture* as well as
under a different name, so the conversion is a relocation and a negation at once, and a
pipeline that does one and not the other produces a surface driven by whatever unrelated
quantity happened to occupy the destination channel. The method, and the calibration rule
that follows from the fixed point, are
[gloss-axis-inversion-and-the-midpoint](./techniques/gloss-axis-inversion-and-the-midpoint.md).

## Never stated: a default is not a property the asset carries

The third disagreement is the one that sends teams to debug the wrong tool for a day,
because it presents as data loss and is not.

The interchange formats state a default for every material property, and the defaults were
chosen so that a minimal material renders as *something*, not so that an omission is
visible. The two gloss factors default to fully on, so a material that simply omits them
arrives fully metallic and fully rough — and through an un-negated gloss axis, fully
metallic and mirror-bright. Transparency defaults to opaque and two-sidedness to off, so a
pane authored as a window arrives as an opaque single-sided card.

The defaults are not even consistent in direction, which is what makes memorising them
useless and reading them mandatory. Each texture is multiplied by its matching factor, and
the two appearance roles default oppositely: the base colour factor defaults to white, so
omitting it is a no-op, while the emissive factor defaults to zero, so a delivery carrying
a perfectly good emissive texture and no factor arrives with that texture multiplied by
nothing at all. One omission is invisible; the identically-shaped omission beside it
deletes a feature. Nobody deduces that; it is read, once, and written down — the discipline
is [format-defaults-are-not-asset-properties](./techniques/format-defaults-are-not-asset-properties.md).

## Unaddressable: an imported material is not yet an editable material

There is an obligation at this edge with no analogue on the transform side, and it is why
per-asset polish becomes permanent rather than merely wasteful.

A delivery carries its materials **embedded**. They are a property of the imported blob,
not artifacts the project can address, so a correction has nothing to attach to. An artist
who fixes one surface has fixed one instance; the next delivery of the same asset restores
the defect, and the fix cannot be reviewed, diffed, reused or inherited because it is not a
thing that exists anywhere. A scale correction can live as one number on an import setting.
A surface correction cannot live anywhere at all until every material the delivery
references has become a first-class addressable asset — and that step belongs *inside* the
import rather than beside it, which is the argument of
[materialise-on-import](./techniques/materialise-on-import.md).

## The edge is proven by a known object, not by an asset

Every claim above is checkable in an afternoon, once, with an artifact that is not an
asset: a strip of quads at stated gloss values with a stated base colour, a stated
transparency mode, and one map per texture role. Push it through the edge and assert what
comes out. This is the surface twin of pushing a cube of a stated size through the
transform edge, and it is the cheapest test in the pipeline.

It has one rule that is not obvious and that a swatch built by intuition always violates:
**it must straddle the midpoint.** A swatch authored around a single mid-grey value passes
under the exact bug it exists to catch, because the midpoint is the fixed point of the
inversion. Calibrate at both ends or the ruler reads correct while pointing backwards. The
construction and the assertions are
[surface-conformance-swatch](./techniques/surface-conformance-swatch.md).

The swatch proves the arithmetic. A real delivery, run afterwards, proves the exporting
side's own settings, which is where the drift actually lives — the two are not substitutes
for each other and the order matters, because a swatch failure and a delivery failure have
different owners.

## The tell that a team has already misdiagnosed this

A project-local corrector that "makes imports look right", run by habit after every
delivery, is this subject's characteristic artifact. It is the conversion edge, written
after the import instead of inside it, by someone who read the symptom correctly and the
cause not at all. Every new delivery re-acquires the defect, the correction is re-applied
from memory, and the day someone imports without running it the defect ships — quietly,
because the asset still looks plausible.

Such a corrector is not a shameful thing to have; it is usually the accumulated diagnosis
of everything wrong with the edge, held in the only place its author could write it. It is
therefore the best available input to building the edge properly, and the migration is a
procedure rather than a deletion:
[a-fixer-script-is-the-edge-in-the-wrong-place](./techniques/a-fixer-script-is-the-edge-in-the-wrong-place.md).

## One edge, two halves, two subjects

The boundary this subject guards is the same boundary that carries unit, axis, handedness
and world scale, and those belong to a separate subject named for size. That split is a
historical fact about how the corpus grew rather than a claim that the two halves are
unrelated: they share a participant table, they are tested by the same class of known
object, and they fail together whenever an import path is written twice.

Say it plainly so a later reader can find both halves: **the import edge has a transform
half and a surface half, and they are documented in two places.** Keep their conversions as
separate named factors even where one function applies both, exactly as unit conversion and
size correction are kept separate — one is a property of the boundary and one is a property
of the asset, and a merged factor makes neither diagnosable.

## Failure modes of the naive reading

- **Correcting the assets when every asset is wrong the same way.** A uniform error across
  unrelated deliveries is a boundary error by definition. Correcting it asset-by-asset
  converts a one-line fix into a permanent pipeline stage and destroys the evidence that
  would have identified it.
- **Treating a spot check as a test.** One material, judged by eye, at whatever value it
  happened to have, is the check that clears the inversion, the colour-space split and the
  defaults simultaneously — because all three are subtle in the middle of their ranges.
- **Reading a missing property as a lost property.** Nothing removed the transparency from
  the window. The delivery never stated it and the format supplied a default. Time spent in
  the exporting tool is time spent in the wrong building.
- **Letting two import paths hold two theories of the boundary.** The second path is wrong,
  not different. A disagreement between import paths is invisible until one asset crosses
  both, and by then both have downstream assets depending on them.
- **Assuming the delivery is at fault because it is upstream.** A delivery that states its
  conventions correctly and is read incorrectly is a correct delivery. The first question is
  always which side of the edge the mismatch lives on, and the answer is available before
  anyone opens the asset.

## What this subject does not own

Unit, axis, handedness and world scale are the transform half of this edge and have their
own authority; nothing here restates them. Whether a tiling image reads correctly — its
seams, its texel density, whether a channel could honestly be derived from a colour source
at all — is settled before a material is assembled and belongs to tiling acceptance. What a
material may cost once it is inside the renderer, which shading model it selects, its
sampler ceiling and **what to pack into which channel when authoring** belong to shader
budget authoring; the overlap on packing is real and the boundary is sharp — that subject
decides what to pack when authoring, this one reads what a format already packed when
receiving. Retopology, unwrap, bake and bind belong to the finishing bench, structural
acceptance of the mesh to generated-mesh grading, and the question of whether the asset
should have been commissioned at all to input gating.

This subject owns exactly one thing: whether the surface that arrives is the surface that
was sent.
