---
layer: technique
type: technique
subject: standalone-headset-frame-budgets
technique: overdraw-and-transparency-ceiling
status: draft
laws: [a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [particles or translucent effects fill the view, a scene is fill-rate bound on a tile-based GPU, an effect that was cheap on a desktop drops frames on the headset, choosing between an additive, an alpha-blended and an alpha-tested effect]
---

# Overdraw and transparency ceiling

The named concern: on a tile-based GPU opaque geometry that writes depth is mostly culled on
chip before it is shaded, and blended geometry is not. Every translucent layer is shaded for
every pixel it covers, for each eye, and the cost scales with how much of the view it fills,
not with how many objects make it. A headset puts effects close to the eye, where one
particle can cover much of the display.

## When particles or translucent effects fill the view, cap the blended layers per pixel over the region that matters, because fill cost is coverage times layers, not object count

Write the ceiling as a count of blended layers per pixel, as a mean over the view and as a
peak over the region the player looks at. Each effect class gets a share of that ceiling
from its [per-content-class frame budget](./per-content-class-frame-budget.md). An effect that
is mostly empty texture still costs its full quad; trim the geometry to the visible shape.

## When a scene is fill-rate bound on a tile-based GPU, remove blending from what is opaque first, because blended and alpha-tested surfaces defeat the hidden-surface removal the tiler relies on

Opaque materials with blending enabled, and cut-outs that discard pixels in the shader, both
stop the GPU from rejecting hidden fragments early. Make what is opaque truly opaque, draw it
before what is blended, and keep alpha-tested foliage and fences to the classes that need
them. Prefer a cut-out shaped by geometry over one shaped by discard.

## When an effect that was cheap on a desktop drops frames on the headset, cost it on the device at the largest screen coverage it can reach, because a desk GPU hides fill that a tiler pays for

A desk capture measures a different bill. The device reading is taken with the effect at its
nearest legal distance, on the device with the larger per-eye display when more than one must
hold, and under the measurement rules of
[fresh state per check](../../../couch-and-tv/on-device-verification-harness/techniques/fresh-state-per-check.md).
Until that reading exists the effect's cost is unmeasured, not small.

## When choosing between an additive, an alpha-blended and an alpha-tested effect, pick by what the tiler pays, because the cheapest-looking option is not the cheapest one

Additive blending needs no ordering and is usually the cheapest blend. Alpha blending needs
back-to-front order and reads the destination. Alpha testing writes depth but breaks early
rejection for what lies behind it. The choice is an authoring decision, made against the
ceiling before the effect is built.

## Decision rules

- **When an effect would exceed the ceiling, lower its coverage before its count.**
- **When an effect sits close to the eye, cost it at that distance**, not at the distance it
  was authored at.
- **When the interface is drawn as world-space panels, count it in the ceiling** like any
  other blended layer.
- **When a comfort overlay covers the view, count it in the ceiling at its own coverage.** A
  vignette or a fade drawn over most of the display is a blended layer over most of the
  pixels. A budget that files it inside a particle row has costed it at that row's coverage,
  and on one measured tree the closed overlay outweighed every particle in the scene three
  times over.

## When not to use it

For a scene with no blended content at all, the ceiling is trivially met. It binds the moment
an effect, a panel or a fade draws over something else.
