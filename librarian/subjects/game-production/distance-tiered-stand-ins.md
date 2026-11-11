---
subject: distance-tiered-stand-ins
domain: game-production
last_touched: 2026-11-11
touched_by: forge
dry_streak: 0
---

# distance-tiered-stand-ins

First touch: 2026-11-11 (shift run `forge-stand-ins-1111`), on the operator's decision of the same day to
forge from primaries rather than from the one video behind lead H7 of
[[../../sources/2026-11-10-agent-built-3d-loop]]. Spec: `librarian/specs/2026-11-11-distance-tiered-stand-ins.md`.
Placement was decided by the 11-11 librarian pass and verified against `taxonomy.json` at forge time:
`asset-production/geometry`, which now holds 5 subjects.

## State

Forged:
- a golden path;
- 6 techniques:
  - `tier-chain-from-play-distances`;
  - `visible-count-per-distance-band`;
  - `multi-angle-card-stand-in`;
  - `merged-cluster-proxy`;
  - `ground-detail-falloff`;
  - `haze-set-before-the-tiers`;
- 2 cpp applications against mage-arena `579737e`. All 22 anchors held under `check-anchors.mjs`.

The upper layers rest on three engines' own documentation and contain no figure from the source video.
The video's 60 m switch and 64 capture angles are one build's settings, and both were declined.

## Sources (primaries opened 2026-11-11)

- LOD groups, transitions, object size: https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/lod/lod-group/class-lodgroup ;
  https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/lod/lod-group/lod-transitions-lod-group
- Terrain tree billboards, mesh-tree cap, detail distance and density: https://docs.unity3d.com/2020.2/Documentation/Manual/terrain-OtherSettings.html
  (the current-version page returned 404; the 2020.2 definitions were read verbatim)
- LOD by screen size, auto-computed even split, collision bound to one LOD: https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-and-using-lods-in-unreal-engine
- Per-platform screen-size overrides: https://dev.epicgames.com/documentation/en-us/unreal-engine/optimizing-lod-screen-size-per-platform-in-unreal-engine
- Size-to-distance cull pairs: https://dev.epicgames.com/documentation/en-us/unreal-engine/cull-distance-volumes-in-unreal-engine
- Foliage instance fade, cluster culling, density scaling: https://dev.epicgames.com/documentation/en-us/unreal-engine/foliage-mode-in-unreal-engine
- Merged proxies: https://dev.epicgames.com/documentation/en-us/unreal-engine/hierarchical-level-of-detail-in-unreal-engine ;
  https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine
- Multi-angle card baking: https://dev.epicgames.com/documentation/en-us/unreal-engine/impostor-baker-plugin-in-unreal-engine
- Visibility ranges and parent proxies; automatic mesh LOD by pixel error: https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html ;
  https://docs.godotengine.org/en/stable/tutorials/3d/mesh_lod.html
- Depth fog and aerial perspective: https://docs.godotengine.org/en/stable/tutorials/3d/environment_and_post_processing.html

Declined as sources:
- forum threads on card baking, which are community voices and not vendor documentation;
- a 4.26-era page on rendering 3D imposter sprites, which returned 403 when fetched.

## Reconcile (mage-arena, read only)

- **Confirmed:**
  - the creature tier distances are set past the spawn rings and pinned by a test;
  - metres are converted to the engine's screen size in one named function;
  - the near-tier triangle sum is labelled as an estimate and pinned against tier changes.
- **Deviations:**
  - one converted threshold for two views, although the header knows the desktop switches at about
    twice the distance;
  - no drawn-tier bill, so the chain's saving is invisible to the budget instrument;
  - no distance bands;
  - no instance count returned beside the triangle sum (L12).
- **Upward lesson:** the near-tier-everywhere instrument is a legitimate stable ceiling when it is
  labelled. The technique keeps it as one of two numbers instead of condemning it.

## Boundaries recorded

- `asset-class-poly-budgeting` keeps the near tier's ceiling and unit.
- `render-submission-economy` keeps submission and culling before submission. This subject decides
  which stand-in exists and when it takes over.
- `concept-scene-parity` keeps judging impostors in the look at play-trace distances.
- `sprite-and-atlas-production` keeps atlas margins and mip bleed for captured frames.
- `tiling-texture-acceptance` keeps tiling surfaces at distance.
- `terrain-synthesis-acceptance` keeps ground acceptance. Streaming stays out of both subjects.
- The fallback to `engine-integration` did not fire. The primaries place the stand-ins and switch
  points in the asset's own record, which makes them pipeline output and not runtime policy.

## Open

- **The vista case is unapplied.** It applies when a wired project opens an open-terrain or
  long-sightline scene (the lead's return clause). The card, cluster proxy, ground falloff and haze
  techniques have no fleet seam yet.
- **mage-arena: a per-view threshold and a drawn-tier sum.** Both are small, real seams for applying
  the two reconciled techniques and measuring the result.
- **Clocks.** The engine documentation is versioned (5.9, 6000.6, 4.7 at read time). Re-open the pages
  by 2027-05-11.
