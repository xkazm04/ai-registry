---
domain: game-production
subject: render-submission-economy
last_touched: 2026-10-07
touched_by: forge
dry_streak: 0
depth: L1
---

# render-submission-economy

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-07 - `/forge`, founding (run `forge-dro-1007`, branch `autopilot/technical-decision-capture-6e0ab333`)

Forged from the Death Ride optimize wave of 2026-10-06 (render context R, ten built findings) plus the I2
texture-budget design (2026-10-01) and the P5 and P8 stick waves (2026-10-03), in the forge's order:
expert draft, outside hardening, then reconciliation against `firetv-deathride` at `86cb512d`. Placed in
`engine-integration` (8 → 9 subjects) through `taxonomy.json`; `apply-taxonomy.mjs` dry run reported zero
moves. The bundle stays at ten categories.

**Depth L1.** Six techniques, three kotlin applications, one source tree, one device (a Fire TV stick).
Almost every 10-06 figure is a desktop count; the stick figures are P0/P5 profiles from before the wave,
the I2 residency run, the P5 retained-marks A/B, and one post-wave probe whose own device field is blank.

**Upward lessons from the source.** The batching pass tests two reorders separately and so has three paths,
not two; a text-layout cache skipped 93% of glyph layout and did not reduce allocation; a retained mesh can
add draws while saving vertices (+2 on the desktop for the minimap, +0.9 mean on the stick for road marks).

**Outside hardening (fetched 2026-10-07; quotes checked verbatim by the research worker).** State change
rather than draw count as the overhead, atlasing, and the fixed-refresh half-rate rule:
https://developers.meta.com/horizon/blog/down-the-rabbit-hole-w-oculus-quest-developer-best-practices-the-store/,
https://developers.meta.com/horizon/documentation/unity/po-draw-call-analysis/,
https://developers.meta.com/horizon/documentation/unity/os-missed-frames/. Early culling and blend order:
https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/mali-performance-5-an-application-s-performance-responsibilities.
Discard and draw order on PowerVR:
https://docs.imgtec.com/starter-guides/powervr-architecture/html/topics/rules/do-not-use-discard.html.
Overlap-gated reordering in a production 2D renderer:
https://skia.googlesource.com/skia/+/2e551697dc56/src/gpu/ganesh/ops/OpsTask.cpp. Bounds before decode:
https://developer.android.com/topic/performance/graphics/load-bitmap. Unified memory on Quest:
https://developers.meta.com/vr/blog/getting-a-handle-on-meta-quest-memory-usage/. Spreading periodic work:
https://unity.com/how-to/advanced-programming-and-code-architecture. Qualifications kept: the cost is
sharpest on GL-class APIs; blending is not an equal offender to discard on PowerVR; Meta's draw-call budgets
disagree across its own pages (indicative only). Arm's best-practices PDF and Qualcomm's Adreno guide did not
load; nothing from them is cited.

**Open, with return conditions.**
- **A stick A/B of the 10-06 render chain** (finding R7). **Return:** one 360 s arm before and after on the
  same scenario, frame p95 and `workMs`.
- **Opaque layers drawn with blending off** (R8). **Return:** the stick A/B; the technique states the rule
  from vendor guidance only.
- **A second tree.** Every application is Death Ride; no headset was measured, and the headset transfer rests
  on platform guidance.
- **Re-run `check-anchors` at merge time:** the source tree moves daily.

**Boundary kept with the neighbours.** `shader-budget-authoring` owns per-material shading cost;
`sprite-and-atlas-production` owns page packing; `perf-regression-gating` owns how the figures are judged;
`gameplay-runtime-patterns` already owns lookup and allocation discipline, which the render-side lookups
(R5, R6, R13, R14) apply rather than extend.
