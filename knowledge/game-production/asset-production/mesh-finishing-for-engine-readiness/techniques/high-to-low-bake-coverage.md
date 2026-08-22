---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: high-to-low-bake-coverage
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [planning which texture channels a bake will produce, a material set is missing a channel, deciding whether a value may be derived or must be authored]
---

# High-to-low bake coverage

A high-to-low bake casts rays from a cheap mesh out to a dense one and writes what it hits
into texture space. That mechanism decides, exactly and without negotiation, which channels
a bake may produce: **a channel the source geometry encodes is derivable; a channel that
was an authoring decision is not.** The technique is the discipline of declaring that
split up front and refusing by name everything on the wrong side of it.

## The two sides of the line

**Derivable from the dense surface.** Surface direction, recorded in tangent space so the
asset can rotate and deform — this is the channel the whole stage exists for, and it is
what puts the detail lost to reduction back onto the cheap mesh. Ambient occlusion, a
measurement of how enclosed each point is. Curvature, the second derivative of the same
surface. Thickness, cast inward instead of outward. Position and object-space direction as
utility masks. Each of these is a function of shape alone, so a bake computes it rather
than guessing it.

**Not derivable.** Metalness is the clean case: it says what a surface *is made of*, and
no geometric measurement distinguishes painted steel from bare steel. Roughness is the
messy case — partially correlated with curvature, genuinely an authoring decision, and the
place where pipelines most often fake a plausible map and call the set complete. Base
colour sits outside the line entirely: it can be transferred from a source that already
carries it, which is a copy rather than a derivation, and it is worthless when the source
has none.

## Procedure

1. **Declare the bakeable set explicitly**, as a list the plan is checked against, not as
   an implicit consequence of what the tool happens to expose.
2. **Plan the bake before spawning anything.** Partition the requested channels into
   *will run* and *will not run, with a reason per channel*. Deduplicate the request while
   you are there.
3. **Emit refusals as data, not as log lines.** A skipped channel carries its name and its
   reason in the result structure. A caller that asked for four channels and received
   three must be able to see, programmatically, which one is missing and why.
4. **Choose the resolution as a texel density, not as a number.** A map size is meaningless
   without the surface area it covers and the packing efficiency of the layout. State the
   target as texels per unit of world surface for the asset class and derive the map size
   from the unwrapped area; a fixed default is a starting point for a single-object asset,
   not a specification.
5. **Verify coverage before trusting the maps.** The cheap mesh must fully envelop the
   dense one along every ray, or the baked detail sinks below the surface in exactly those
   places. Where the projection distance is authored as an inflated proxy surface, it wants
   to be just large enough to clear the highest points of the dense mesh and no larger —
   too small starts rays inside the source, too large lets rays catch neighbouring
   geometry, and both produce the same class of dark smears that get mistaken for a
   lighting bug three stages later.
6. **Align the two meshes in the same space and pose.** A bake between differently posed
   versions of the same character is not a degraded bake; it is garbage that renders.

## Decision rules

- **A channel that cannot be derived is named as absent, never faked and never omitted.**
  A constant standing in for an unmeasured value is the exact failure the law forbids: it
  makes "nobody computed this" indistinguishable from "this is the value".
- **A partial set is never reported as a full one.** The result says how many channels were
  requested and how many were produced, and the two numbers being different is a visible
  fact rather than an inference.
- **Do not add a channel to the bakeable set on the strength of documentation.** If
  producing it requires rewiring every source material through a different shader path so
  the value can ride out on a channel that does bake, that is graph surgery whose behaviour
  differs for a constant input, a texture input and a blended input. Until it has been run
  live on real assets of each shape, it stays refused.
- **Mirrored coordinates are fine for surface direction and a trap for occlusion.**
  Occlusion is a property of the local neighbourhood, so a mirrored island bakes the
  occlusion of the side it was mirrored *from*. Acceptable on a symmetric asset; on one
  whose two sides differ, use a second coordinate set or combine two passes.
- **Deriving property channels from a colour image is a different technique with different
  epistemics.** That path estimates; this one measures. Do not let an estimated channel
  enter a set that is labelled as baked — if both feed the same material, label each
  channel with how it was obtained.

## When not to use this

- **When there is no dense source.** A bake needs something to bake *from*. An asset
  generated directly at low density has no recoverable detail, and running the stage
  produces flat maps that consume memory and add nothing.
- **When the asset is a stylised or flat-shaded piece that never wanted surface detail.**
  The maps cost texture memory and a sampler slot each, and a shader has a hard ceiling on
  those — the budget for which is its own concern.
- **When the material will be authored procedurally on top of a transferred colour map.**
  Layered material authoring produces property channels far above what any derivation
  achieves; bake the geometric channels only and let the material system own the rest.
