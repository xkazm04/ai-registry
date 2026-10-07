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

### 2026-10-07 - `/forge`, extension (run `forge-p9p10-1007`, branch `autopilot/technical-decision-capture-4b08c178`)

From the Death Ride P9 and P10 stick sessions (2026-10-07, all runs **profiled**), reconciled against
`firetv-deathride` at `4bbae5d2`. One technique added, `prepare-off-the-render-thread-commit-on-it` (7 techniques
now): one-off first-use work — a lazy per-course projection index, a region tile's manifest, hash, header check and
decode — prepared on one worker below the render thread for the course about to be used only, behind a synchronized
lazy, with the render thread yielding whole frames until ready and committing only the upload or the swap. Decision
rules from the source: a pick made asynchronous holds later commands (the dropped-pick regression, `59f5605e`) and
the in-flight flag is read before the result; never prepare on a receive loop (a 1–2 s bake would have held a phone's
inputs past the stale-input limit — a design decision, not an incident); checks travel with the work; preparing
ahead raises the held peak. One kotlin application, 40 anchors held. Stick figures: render-thread first projection
1,138.5–2,268.3 ms (P9 diagnostic, n = 5 first visits) → 0.034–0.389 ms (P10, n = 20 first visits), bin wait 0 in 24
of 24 bakes; `selectRegion` 61.4–117.1 → 5.8–16.5 ms; transition max 2,376.9 → 245.8–374.4 ms.

`batch-by-page-where-order-is-invisible` gained one decision rule from R8's stick A/B: an opaque layer over a layer
that must stay blended gives hidden-surface removal nothing to drop; the road/shortcut cut was desktop-proven
pixel-identical (0 of 136,857,600) and not better on the stick (worst active-window p95 21.964 → 25.398 ms, two
profiled 900 s runs, one per APK), so it was reverted (`6af138c5`); making the scenery quad eligible needs alpha 1,
which changes edge texels. The golden path gained one sentence on the opaque rule's precondition, one paragraph in the
order of moves and one failure mode. The batching and cost-per-effect applications were re-pinned to `4bbae5d2` (one
moved anchor each) and their R7/R8/S17 deviations rewritten with what P9 and P10 measured.

**Outside hardening.** Imagination (blending disables visibility hardware; overdraw matters when already
rendering-limited; blending is done in on-chip tile memory — quotes re-fetched 2026-10-07), Unity's async upload
pipeline, Unreal's PSO precaching (skip the draw until ready; 75% of hardware threads contend), Android's thread-priority
guidance, Meta's scene-loading hitch note, asset-streaming guidance, missed-frame and compositor-layer pages, and the
OpenXR Android thread-type hints. **A contradiction kept:** Meta accepts a synchronous load behind a compositor loading
layer or fade, and VRC.Quest.Performance.1 exempts loading screens, so the technique's headset section says the rule is
required for first-use work inside a live scene and optional behind such a layer.

**Open, with return conditions.**
- **R7, the render chain's stick delta.** P9 gives the post-wave level (pooled active interval p95 18.813 ms, work
  p95 17.124 ms), not a matched before. **Return:** a same-arm run of the wave's parent.
- **The unbounded bin wait and the uncancellable superseded bake** (application deviations). **Return:** a timeout
  with a named outcome in the scene path; a generation check before the bake starts.
- **Prepared-path texture equality.** Not re-checked on a desktop GL context. **Return:** a real-GL pixel compare of
  the prepared and synchronous region paths.
- **Bins retention** (~10.2 MiB for five courses, desktop estimate) against P9's unattributed +47.7 MiB PSS.
- **A second tree; no headset.** Unchanged.
