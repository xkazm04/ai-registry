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

Source tree: `firetv-deathride` on branch `deathride/main`, first read at `86cb512d` and re-resolved at
`4bbae5d2` on 2026-10-07; paths are relative to its root. Kotlin 2.0.21 on libGDX 1.13.5, whose
`SpriteBatch` flushes one draw call each time the texture changes. The change is `f3adc005` (finding R1
of the 2026-10-06 optimize wave). The batching figures are draw and bind counts from the desktop host;
they describe the requests the game makes and transfer to the Fire TV stick as counts. The opaque-layer
section below is the one stick measurement attached to this technique: a profiled A/B from the P9
session of 2026-10-07.

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
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:910 "carSprites batched="`. Over a
desktop soak of 3,585 warm frames the batched paths ran on 2,843 and the interleave on 742 — the grid
and contact packs, which are the frames that prove the fallback runs. The geometry has its own test,
`deathride/game/src/test/kotlin/dev/deathride/game/RenderCullingTest.kt:34 "tyreDiscsFollowTheCarAndBoundTheOverlay"`,
which asserts that each disc bounds the overlay it stands for.

Result, desktop host, `--hidden --soak --audit --profile`, warm frames after the first 300, 2026-10-06:
draws 26.5 → 20.3 and texture binds 20.5 → 14.3 per frame. A smoke screenshot was checked; pixels are
identical by construction on every path.

## The opaque layer, measured on the stick and reverted

The technique's opaque rule was tried as finding R8 in P9: draw the ground layers with blending off so the
stick's PowerVR processor can reject hidden fragments. An alpha audit came first and found the obstacle:
`docs/concepts/deathride/P9-stick-validation.md:82 "The 2048x2048 baked scenery target holds 5,871-10,430 texels below alpha 255"`
from sprite edges baked into it, so the full-screen scenery quad had to stay blended and only the road and
shortcut tiles were cut (`4b2f23b9`). The picture was proven on the desktop before the device was asked:
`docs/concepts/deathride/P9-stick-validation.md:94 "**0 of 136,857,600 pixels differ.** This is desktop GL, not proof that the"`
stick's half-float path produces identical bytes (66 views over six courses, 1920x1080).

Two profiled 900 s soaks on the stick, one per APK, same arm:
`docs/concepts/deathride/P9-stick-validation.md:103 "| Worst active-window p95 | 21.964 | 25.398 | +3.433 ms |"`;
the scenery phase itself moved by hundredths,
`docs/concepts/deathride/P9-stick-validation.md:107 "| 0.853 / 1.976 / 1.033 | 0.897 / 1.972 / 1.075 | +0.044 / -0.004 / +0.042 |"`
(p50 / p95 / mean ms over 48,960 and 48,821 frames).
`docs/concepts/deathride/P9-stick-validation.md:114 "**Verdict: not better. Reverted** (6af138c5)."`
The source reads the gap honestly in both directions — phases the change did not touch moved further than
the scenery phase, so it is
`docs/concepts/deathride/P9-stick-validation.md:116 "scenery phase did, so the gap reads as run-to-run variation rather than a cost of"`
the cut — and gives the structural reason no gain was available:
`docs/concepts/deathride/P9-stick-validation.md:121 "Removing blending from the road alone gives the tiler nothing to drop."`
Making the scenery quad eligible would need it baked fully opaque, which changes edge pixels and was out of
bounds. The card is closed as declined:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:8 "Result: not-better - reverted in 6af138c5"`.

This is the upward lesson the technique's new decision rule carries: an opaque layer over a layer that must
stay blended has nothing hidden beneath it to reject, and a desktop-proven identical picture is the
precondition for keeping a change, not evidence that it pays. The P9 frames were also not fill-bound — the
worst active frames had wall time above thread CPU time with the scenery draw at 0.6–3.6 ms — so a fill
saving had little to act on even where it applied.

## Deviations

- **One run per APK.** `docs/concepts/deathride/P9-stick-validation.md:125 "These are single runs per APK, one after the other, with no repeated-measures"`
  variance; a 3.4 ms move in a worst-window p95 is not resolvable from two runs, in either direction.
- **The helper texture is still there.** The cheapest move in the technique — a small white region on
  each car page so the tyres draw from the page already bound — was left as R10 in the backlog, so 21% of
  frames still take the interleave.
- **One counter for two batched paths.** `groupedFrames` counts both the fully grouped path and the
  middle path, so the log cannot say how often the page grouping itself held.
- **The stick's draw cost for this change has no matched before.** The P5 stick arm (2026-10-03) recorded a
  mean of 16.5 draws per frame with cached road marks on the old courses; P9's profiled baseline after
  `f3adc005` recorded a mean of 18.4 draws per frame (p50 17, 48,960 frames) on the new region courses,
  `deathride/evidence/perf/p9/comparison.json:109 "18.416,"` (the baseline arm's draw-call mean). The
  arms differ in courses, code age and profiling, so no delta is claimed.

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

The opaque-layer result is consistent with the vendor's own qualifiers rather than against them. Imagination
states the rule — "If alpha blending is enabled, then the hardware used to determine a fragment's visibility
cannot be used" — and the condition under which it matters: "Overdraw can negatively impact the
application's performance, particularly if the application is already limited by rendering"
(https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/rules/do-not-use-alpha-blend-unnecessarily.html).
On its architecture "all blending is done using on-chip tile memory avoiding off-chip read/modify/write"
(https://blog.imaginationtech.com/does-tile-based-deferred-rendering-have-a-place-in-desktop), so blending a
layer that is opaque costs little by itself; the saving comes only from fragments that hidden-surface removal
can drop, and here there were none beneath the road and the frame was not fill-bound. Whether a headset's
processor would behave differently was not examined; a driver developer describes that processor family's
early rejection as a depth test (https://blogs.igalia.com/dpiliaiev/adreno-lrz/), and this renderer's
scenery target has no depth buffer (I2's budget table).
