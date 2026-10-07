---
layer: application
type: application
subject: render-submission-economy
technique: cost-per-effect-before-effect-count
stack: kotlin
status: forged
verified_on: 2026-10-07
verified_against: kotlin@2.0.21
---

# Death Ride: ten render changes under a ruling that no effect may go

Source tree: `firetv-deathride` on branch `deathride/main` at `86cb512d`, read 2026-10-07; paths
below are relative to its root. The game is Kotlin 2.0.21 on libGDX 1.13.5, rendering through
OpenGL ES on a Fire TV stick (model AFTKM, 32-bit userland) whose profile shows the PowerVR driver.
The wave is the render context R of `/scan-sweep --optimize` on 2026-10-06, with its findings in
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl`. Three kinds of figure
appear here and are never mixed: **counts** from the desktop host (draws, binds, sprites, bytes,
quads), which transfer to the stick as counts; **desktop milliseconds**, which describe the desktop;
and **stick** figures, each named as such with its date and run.

## The constraint the wave was planned under

`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/BRIEF.md:4 "do NOT cut effects or lower render scale; optimise cost per effect"`
is owner ruling N3. It reversed the instinct of the earlier I2 wave (2026-10-01), whose plan said
`docs/concepts/deathride/I2-stick-budget.md:25 "cut decorative effects or residency"` when a frame
limit failed, and which then did two different things under one heading. One was legitimate under
this technique: `docs/concepts/deathride/I2-stick-budget.md:35 "Suppress the redundant 720-slot procedural skid history when atlas skid art is available"`,
keeping each procedural effect as the fallback where its atlas art is missing — duplicate work, not an
effect. The other was a true cut taken by the frame owner: the same line reduces the cosmetic pool
from 96 to 64 slots and skid emission per drifting car. N3 is the rule that would have sent that cut to
the owner with its figure.

## The binding bill, from the stick

The stick's own profile named submission as the bill before any change was made:
`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:1 "Mesh.render at 26% and glBufferData at 13% of render-thread time"`
(the P0 simpleperf profile, render thread). The P5 baseline arm on the stick (360 s, 2026-10-03)
recorded `workMs` mean 8.51 and p95 12.77 ms, mean draw calls 16.5 and `telemetryMs` p95 2.13 ms
(`.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:7 "P5 profile: workMs mean 8.51 p95 12.77"`).

## The order the wave took

All counts below are from the desktop host, `--hidden --soak --audit --profile`, warm active frames
with the first 300 skipped, 50–60 s per arm, 2026-10-06.

1. **Cull** (`2a080426`, R2): sprites submitted 45.6 → 27.4 per frame, draw calls 20.7 → 16.7, indices
   20,403 → 16,051. `deathride/game/src/main/kotlin/dev/deathride/game/ViewBounds.kt:3 "Painters skip what cannot reach it"`.
   Its `ALL` bound keeps audits whole, as the cull technique requires.
2. **Batch** (`f3adc005`, R1): draws 26.5 → 20.3 and binds 20.5 → 14.3 per frame; the batched path ran
   on 2,843 of 3,585 frames. Its realization is the batching application in this subject.
3. **Retain** (`8577c93f`, R4): the minimap road line moved from about 2,200 immediate-mode vertices
   per frame to one static mesh, 14.98 → 9.87 µs per frame for that call over three pairs of 30 s soaks
   on the desktop — and draws rose 24.3 → 26.5, because the mesh splits the shape pass. The same
   technique has a stick witness from P5: cached road marks against immediate ones, two 360 s arms on
   one frozen package, `docs/concepts/deathride/P5-static-road-marks.md:28 "Immediate versus cached marks: render CPU mean"`
   8.772 → 7.437 ms, with mean draws 15.57 → 16.47. The trade is the same on both hosts.
4. **Stop rebuilding text** (`a7b22eb9`, R16): glyph quads laid out over a 50 s soak fell 108,929 →
   7,976; an in-process check re-laid every skipped call and found 0 mismatches over 92,293 quads.
   Allocation did not improve (4,786 → 4,792 B per frame), because the label strings are still built
   before they reach the layer — the commit says so, which is the report the retain technique asks for.
5. **Spread the burst** (`63f2d090`, R3): the 10 Hz refresh now runs as three stages on consecutive
   frames; telemetry allocation mean 8,213 → 4,786 B per frame and worst 54,904 → 21,104 B, desktop
   CPU p95 0.300 → 0.147 ms. On the stick the burst had been visible only in a percentile: P5's
   `telemetryMs` p50 0.006 ms against p95 2.13 ms.
6. **Move reader-only work off the render thread** (`d47205a0`, R9): five stats strings became
   suppliers evaluated by `/stats`; render-thread allocation 5,766 → 3,055 B per frame mean over 45 s.
   `deathride/link/src/main/kotlin/dev/deathride/link/RaceServer.kt:93 "never per frame on the render thread"`.
7. **Lookups and hidden allocation** (`ae8b4b87`, `36250bff`, `49a6fd68`, `81a2f692`; R5, R6, R14,
   R13): a shape cache, an atlas-key cache, memoised atlas resolution (hash lookups 194 → 90 per frame)
   and precomputed unit rings (about 174 trig calls per frame removed, raw-bit identical). These are the
   gameplay-patterns subject's allocation-discipline rules applied to the render thread; R6's own
   measurement of the whole render chain's allocation audit reads 9,484 → 4,971 B per frame.

No step removed or shortened an effect, lowered the render scale or touched a threshold.

## What the stick says afterwards, and what it cannot say

A 90 s probe committed with the wave records `deathride/evidence/probe.json` since-start frame time
p50 16.6 ms, p95 18.3 ms, maximum 1,145 ms over 5,917 frames. Finding S17 attributes it to the stick;
the probe file's own `device` field reads "Unspecified host", so the attribution rests on the finding,
not on the file. It is not an A/B against P5 — P5's since-start p95 was 18.7 ms over 21,700 frames in a
360 s arm with a different scenario mix — so no device delta for the wave is claimed here. The finding
that would have measured one, R7, stayed pending: `.claude/scan-sweep/runs/optimize-2026-10-06-deathride/findings-R.jsonl:7 "unmeasured (no Stick access in this round)"`.

## Deviations

- **The wave's device cost is unmeasured.** Every render change is evidenced by host counts; the
  stick's frame percentile after the wave has no matched before.
- **A device figure without its device.** The probe file does not record what it ran on.
- **The opaque layers are still blended.** R8 (draw the scenery and road with blending off, for the
  PowerVR's hidden-surface removal) stayed in the backlog, so the fill-side saving is unmeasured.
- **The 1.1 s race-start frame** (S17) is unchanged by the wave and undiagnosed; it is a transition
  cost, not a submission cost, and belongs to the startup and transition work, not to this order.

## Outside corroboration

The order of moves matches the published guidance for this hardware class. Meta's Quest developer
guidance names state changes between draws as the overhead and recommends atlasing
(https://developers.meta.com/horizon/blog/down-the-rabbit-hole-w-oculus-quest-developer-best-practices-the-store/);
Arm ranks early culling first among what an application controls
(https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/mali-performance-5-an-application-s-performance-responsibilities);
Android's engine guidance says OpenGL ES draw calls can make a game CPU bound in the driver
(https://developer.android.com/games/develop/vulkan/native-engine-support); and Unity's guidance states
the spread-the-burst rule as doing 1/n of the work every frame
(https://unity.com/how-to/advanced-programming-and-code-architecture). The transfer to standalone
headsets (fixed 72/90/120 Hz, a missed frame halving the rate:
https://developers.meta.com/horizon/documentation/unity/os-missed-frames/) is supported by that
guidance and not by any Death Ride measurement; no headset was run.
