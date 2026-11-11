---
status: EXECUTED (2026-11-11, forge-stand-ins-1111; operator decision of 2026-11-11 dispatched the forge from primaries; drafted by the shift seat itself, not a separate forge worker - see "Overrides")
source: librarian/sources/2026-11-10-agent-built-3d-loop.md
run_id: forge-stand-ins-1111
bundle: game-production
category: asset-production
subcategory: geometry
subject: distance-tiered-stand-ins
resolved_path: knowledge/game-production/asset-production/geometry/distance-tiered-stand-ins/
category_count: geometry holds 4 subjects before and 5 after (taxonomy.json read 2026-11-11); the cap is 10, so no subdivision. asset-production is already subdivided, so the subject sits at depth three and the laws link from the subject folder is ../../../_laws.md.
---

# Spec: distance-tiered-stand-ins

## Why this is XL

One source (an agent-built open-terrain loop, lead H7, with H9's haze caution) offered four fragments that
share one home-if-new: a class budget written as a chain of tiers by distance; a multi-angle captured card
standing in past a declared distance; ground detail falling off with distance; and the haze caution. A
fifth fragment is the source's own sentence that the visible instance count is the budget when nothing
occludes. Four mechanisms with one home is a subject, not an amendment. One video is thin evidence for a
whole subject, which is why it was banked as a lead; the operator's 2026-11-11 decision unblocked it on
condition that the subject is written from primaries (the engines' own documentation), never from the
video's figures (its 60 m and 64 angles are one build's).

## Placement (verified against the authority)

`knowledge/game-production/taxonomy.json` read 2026-11-11: `asset-production` holds four subcategories;
`geometry` holds `asset-class-poly-budgeting`, `generated-asset-world-scale`, `generated-mesh-acceptance`,
`mesh-finishing-for-engine-readiness`. Room for six. The librarian-1111 placement holds: the subject owns
what stands in for the object (assets the pipeline produces and accepts, and the budget that decides
them), not the submission. Runtime-dominance test (the recorded fallback to `engine-integration`): the
primaries put the stand-in assets (reduced meshes, captured cards, merged proxies) and the per-class
switch points into the asset's own record; streaming and frame submission stay with their owners. The
fallback does not fire.

## Primaries (the web budget, all opened 2026-11-11)

- One engine's LOD Group reference and LOD transition pages (screen-relative transition height, object
  size, cross-fade and its transition width):
  https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/lod/lod-group/class-lodgroup
  and https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/lod/lod-group/lod-transitions-lod-group
- The same engine's terrain settings (billboard start, fade length, the cap on trees drawn as meshes,
  detail distance and density): https://docs.unity3d.com/2020.2/Documentation/Manual/terrain-OtherSettings.html
- A second engine's LOD pages (switching by screen size, not distance; per-platform screen-size
  overrides; complex collision fixed to one LOD):
  https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-and-using-lods-in-unreal-engine
  and https://dev.epicgames.com/documentation/en-us/unreal-engine/optimizing-lod-screen-size-per-platform-in-unreal-engine
- Its size-to-distance cull pairs: https://dev.epicgames.com/documentation/en-us/unreal-engine/cull-distance-volumes-in-unreal-engine
- Its foliage instance fade, cluster culling and density scaling:
  https://dev.epicgames.com/documentation/en-us/unreal-engine/foliage-mode-in-unreal-engine
- Its merged-cluster proxies: https://dev.epicgames.com/documentation/en-us/unreal-engine/hierarchical-level-of-detail-in-unreal-engine
  and https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine
- Its multi-angle card baker (full sphere, upper hemisphere, fixed billboards; frame count against
  per-view resolution; captured maps; supersampled capture):
  https://dev.epicgames.com/documentation/en-us/unreal-engine/impostor-baker-plugin-in-unreal-engine
- A third engine's visibility ranges (begin and end distance, margins as hysteresis, a parent proxy
  that hides its children, fade costs) and automatic mesh LOD (a screen-space error threshold in pixels
  that already accounts for field of view and resolution):
  https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html and
  https://docs.godotengine.org/en/stable/tutorials/3d/mesh_lod.html
- Its fog (depth fog fades distant objects to a colour; aerial perspective):
  https://docs.godotengine.org/en/stable/tutorials/3d/environment_and_post_processing.html

## Techniques and the rule each must carry

- `tier-chain-from-play-distances`: the class budget is a chain (near mesh, reduced meshes, a card or
  proxy, culled), each tier with its triangle share, its shadow and collision policy, and its switch
  point. The switch points are decided in distance at the play view and converted to the engine's
  screen-relative unit per target view, because every engine switches on projected size and the same
  threshold lands at different distances under a different field of view or resolution. Record both.
  Hysteresis or a fade band at every switch.
- `visible-count-per-distance-band`: when nothing occludes, the budget is the sum over distance bands of
  the instances visible in that band times the cost of the tier that draws them. Count from the play
  view, per band; cap the near tier by count, not only by distance; an instrument that counts the near
  tier for every visible instance reports the chain-less ceiling and must say so.
- `multi-angle-card-stand-in`: past a declared distance a repeated object is replaced by a card captured
  from many angles. Capture layout follows the view (full sphere, upper hemisphere, fixed billboards);
  frame count trades against per-view resolution; capture colour, normal and depth at a supersampled
  resolution; a single-angle card only where the view direction is bounded. Accept the card at its
  switch distance against the mesh tier it replaces.
- `merged-cluster-proxy`: where many distinct objects stand together far away, the per-object chain
  still pays one draw per object; one merged and simplified proxy with a baked material stands in for
  the cluster, and hides its members only once it is fully shown. Static members only; merged distance
  closes openings.
- `ground-detail-falloff`: small repeated ground detail thins with distance across a fade band, never
  ends at a hard line; a density lever serves quality tiers, and detail that gameplay reads is exempt
  from it; the ground under the detail must carry the read where the detail stops.
- `haze-set-before-the-tiers`: haze fades distant objects toward one colour and so hides switches and
  lowers what the far tiers carry; it is a look decision first. Fix it before tuning the tier distances;
  a haze change re-opens every tier distance tuned under the old haze and breaks comparability of look
  rounds. Never add haze to hide a missing tier the look did not ask for.

## Must not absorb

- What the render thread is handed each frame (`render-submission-economy`, `cull-before-submission`):
  this subject decides which stand-in exists and when it takes over; submission owns how it is submitted.
- Judging impostors in the look at play distance (`concept-scene-parity`,
  `frame-the-judged-shot-from-a-play-trace`).
- Atlas packing margins and mip bleed of the captured frames (`sprite-and-atlas-production`,
  `atlas-packing-and-bleed-margins`).
- Tiling texture acceptance at distance (`tiling-texture-acceptance`).
- Terrain acceptance (`terrain-synthesis-acceptance` disowns density and streaming; this subject takes
  density only as falloff with distance, never streaming).
- Per-class near-tier triangle ceilings (`asset-class-poly-budgeting`): this subject extends the class
  budget across distance; the near tier's ceiling stays there.

## Open questions the drafter decides

1. Is the subject runtime-dominant (fallback to `engine-integration`)? Decided: no, see Placement.
2. Does a merged cluster proxy belong here or in submission? Decided: here. It is an asset the pipeline
   bakes and accepts, with its own acceptance (openings closed, materials merged).
3. Is the haze caution a technique or a golden-path paragraph? Decided: a technique, because it carries a
   procedure (order of tuning) and a decision rule a reader can be sent to.
4. A fleet seam? mage-arena (public) generates two creature LODs at distances taken from its spawn rings
   and converts them to the engine's screen size per headset projection, and counts visible near-tier
   triangles as a stated estimate. That is a real seam for two techniques; it is a closed arena, not an
   open-terrain scene, so the H7 return clause stays the first place to apply the vista case.

## Overrides

- **The spec lives in `librarian/specs/`, not only in the run folder.** The dispatch said the run folder;
  `.ai/shift/` is gitignored, and the intake skill requires the spec to be linked from the source note, so
  a run-folder-only spec would be a dangling link. A pointer copy sits in the run folder.
- **Primaries are cited by URL here and in the subject note, not in the golden path.** No section of
  the RKB profile requires sources in the upper layers, and engine names are on the bundle's purity
  denylist; the upper layers say "an engine's documentation" and the URLs live downstairs.
- **Drafted by the seat, not a separate forge worker.** The seat is itself the dispatched forge; the
  self-review weakness is compensated by the gate and by running every application anchor through
  `check-anchors.mjs` against the mage-arena checkout.
