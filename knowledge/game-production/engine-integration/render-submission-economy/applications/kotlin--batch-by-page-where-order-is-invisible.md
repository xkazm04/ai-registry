---
layer: application
type: application
subject: render-submission-economy
technique: batch-by-page-where-order-is-invisible
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# Six cars, two atlas pages and a one-texel tyre texture

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths are
relative to its root. Kotlin 2.0.21 on libGDX 1.13.5, whose `SpriteBatch` flushes one draw call each
time the texture changes. The change is `f3adc005` (finding R1 of the 2026-10-06 optimize wave). All
figures are draw and bind counts from the desktop host; they describe the requests the game makes and
transfer to the Fire TV stick as counts, while the stick's cost for them was not measured in this wave.

## Why the loop flushed

`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:12 "The overlay has its own 1x1 texture, so the old body/tyre interleave switched textures twice per car"`,
and the ten car classes are split over two atlas pages, so a race frame drew each car's body from one
of two pages and then its steered front tyres from a third texture. The finding counted 10–13 of about
24 draws per race frame coming from that loop, on a device whose own profile put `Mesh.render` at 26%
of render-thread time.

## Two tests, three paths

The pass states the technique's rule in its header and then implements it as two separate tests:
`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:14 "if no tyre disc touches a later car's visible body box, every tyre overlay follows all bodies in one batch"`
and
`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:15 "if no two bodies that sit on different pages touch, the bodies are also grouped by page"`.
The shapes are oriented boxes from the atlas's `body_bounds_px` metadata, padded by
`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:89 "const val MARGIN_M=.4f"`, and tyre
discs from the wheel rig. The tyre test runs only against cars drawn later (`j` from `i+1`), which is
exactly the set an overlay moved to the end could newly cover.

This is the upward lesson the source gave the draft: the draft had one test and two outcomes. The code
has three — fully grouped, bodies in their original order with all tyres after them, and the original
per-car interleave — and the middle one is what a pack of cars touching only within one page takes.

## The fallback is the unknown bound

`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:66 "tyresLast=false;grouped=false;break"`
fires when any car's body bounds cannot be read, which is the case for the procedural fallback art. The
frame then draws in the original order. An unknown shape is treated as one that may overlap, as the
technique requires.

## Counting the paths

`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:78 "interleavedFrames++"` and
`deathride/game/src/main/kotlin/dev/deathride/game/CarSprites.kt:82 "groupedFrames++"` are written to
the log at dispose,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:889 "carSprites batched="`. Over a
desktop soak of 3,585 warm frames the batched paths ran on 2,843 and the interleave on 742 — the grid
and contact packs, which are the frames that prove the fallback runs. The geometry has its own test,
`deathride/game/src/test/kotlin/dev/deathride/game/RenderCullingTest.kt:34 "tyreDiscsFollowTheCarAndBoundTheOverlay"`,
which asserts that each disc bounds the overlay it stands for.

Result, desktop host, `--hidden --soak --audit --profile`, warm frames after the first 300, 2026-10-06:
draws 26.5 → 20.3 and texture binds 20.5 → 14.3 per frame. A smoke screenshot was checked; pixels are
identical by construction on every path.

## Deviations

- **The helper texture is still there.** The cheapest move in the technique — a small white region on
  each car page so the tyres draw from the page already bound — was left as R10 in the backlog, so 21% of
  frames still take the interleave.
- **One counter for two batched paths.** `groupedFrames` counts both the fully grouped path and the
  middle path, so the log cannot say how often the page grouping itself held.
- **The opaque ground is still blended.** R8 (scenery and road drawn with blending off) is backlog; its
  saving on the stick's PowerVR processor is unmeasured.
- **The stick's draw cost is unmeasured for this change.** The P5 stick arm (2026-10-03) recorded a mean
  of 16.5 draws per frame with cached road marks; no stick arm was run after `f3adc005`.

## Outside corroboration

The overlap rule is how general-purpose 2D renderers merge draws: Skia's Ganesh reorders an op only past
ops whose bounds do not overlap (`can_reorder` in
https://skia.googlesource.com/skia/+/2e551697dc56/src/gpu/ganesh/ops/OpsTask.cpp). Arm states the
blending constraint ("blended triangles need to be rendered back-to-front",
https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/mali-performance-5-an-application-s-performance-responsibilities),
Imagination recommends sorting by render state except where blending requires order
(https://docs.imgtec.com/performance-guides/graphics-recommendations/html/topics/sorting-geometry-effectively-on-powervr.html),
and Meta's draw-call analysis for Quest says changes of material, mesh or texture between calls raise
draw time and recommends atlases (https://developers.meta.com/horizon/documentation/unity/po-draw-call-analysis/).
That page's measurements are on a standalone headset with the same class of tile-based processor; it is
the evidence that the technique transfers to headsets, and no Death Ride run supports that transfer.
