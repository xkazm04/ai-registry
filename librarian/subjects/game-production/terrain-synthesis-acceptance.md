---
domain: game-production
subject: terrain-synthesis-acceptance
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# terrain-synthesis-acceptance

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/terrain-synthesis-acceptance",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b5392253f857169f",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two endpoint-inclusive samples spanning 10 metres have one interval, so spacing is 10 metres, not 5.",
    "Mapping integer codes 0 through 65535 to both endpoints of a 100-metre span gives a step of 100/65535 metres.",
    "A downhill graph computed from a field cannot reveal that a separate river spline climbs uphill unless that spline is compared against the field.",
    "A valid all-zero snow mask over a tropical map examines every sample while intentionally selecting none."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/balance-validation/terrain-synthesis-acceptance",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://doc.arcgis.com/en/arcgis-online/analyze/how-flow-direction-works.htm",
      "scope": "Official search excerpt advises sink filling before flow direction and distinguishes edge/NoData cases; no terrain tool run."
    },
    {
      "url": "https://doc.arcgis.com/en/arcgis-online/analyze/flow-direction-mv-ra.htm",
      "scope": "Official search excerpt defines D8 descent using distance-normalized elevation differences and separate routing across flats."
    }
  ],
  "documents": {
    "terrain-synthesis-acceptance.md": {
      "disposition": "reverify",
      "reason": "Heightfields can be malformed: ragged dimensions, truncated data, nonfinite samples, invalid ranges and mismatched masks are structural defects. Gradient is only one traversal constraint; flat arenas can be intentional. Empty optional masks and closed basins need declared semantics. Source-generated downhill paths do not independently validate authored rivers, and terrain-first is not the only valid planning order."
    },
    "techniques/biome-mask-cross-consistency.md": {
      "disposition": "reverify",
      "reason": "Check dimensions, registration, finite values and declared layer semantics before counts. A present all-zero optional snow mask is valid on a tropical map; missing input is different. Priority or normalization can be an explicit blend contract, backdrop vegetation is legitimate, and hand-painted data can contain mistakes. Diagnose whether terrain, mask or basis is wrong rather than always changing the mask."
    },
    "techniques/drainage-coherence-as-plausibility-gate.md": {
      "disposition": "clarify",
      "reason": "Repaired self-validating downhill-network claim, flow-before-fill ordering and automatic source mutation. Separates original-field checks, conditioning diagnostics, authored water validation, flat routing and no-channel outcomes."
    },
    "techniques/heightfield-resolution-and-vertical-basis.md": {
      "disposition": "clarify",
      "reason": "Repaired sample-versus-cell spacing and endpoint quantization arithmetic. Adds offset/datum, axis order, anisotropic spacing, finite/range validation and explicit transforms; declared class defaults can be valid and resampling does not universally lower measured slope."
    },
    "techniques/playable-area-versus-backdrop-ratio.md": {
      "disposition": "reverify",
      "reason": "Slope-connected area is a proxy unless obstacles, clearance, step limits and off-mesh links are modeled. State projected versus surface-area denominator and nonoverlapping loss attribution; teleporters or multiple entries may make disconnected slope components playable. Bounded arenas are not necessarily fully occupiable; a missing boundary is not proof of no backdrop."
    },
    "techniques/slope-traversability-envelope.md": {
      "disposition": "reverify",
      "reason": "Keep relief goals separate from maximum movement slope: flat ground can be playable and intentional. Reverify the unsourced 45-degree voxelizer claim; smoothing does not monotonically increase pass fraction. Directed slopes, diagonal connectivity, steps, clearance and actual collision matter; unions/intersections can answer explicitly scoped multi-agent questions."
    },
    "techniques/terrain-to-room-graph-handoff.md": {
      "disposition": "reverify",
      "reason": "Measurement models can be wrong, so disagreement does not automatically make terrain the authority. Room footprints need clearance and elevation variation as well as area; bridges, jumps and teleporters can connect components without terrain modification. Point snapping can change a gate or spawn's meaning. Versioned iterative co-design and validated plan migration are legitimate."
    },
    "applications/node--heightfield-resolution-and-vertical-basis.md": {
      "disposition": "reverify",
      "reason": "Historical PoF commit/locations and verification date were not rerun. Numeric-shape tests can catch real malformed fields. Passing size as extent establishes spacing 1 and a count-minus-one span; changed sample count does not prove every slope halves without a fixed continuous-field correspondence. Uint16 export needs range and encoding semantics; declared consumer scale is not intrinsically fabricated."
    },
    "applications/process--terrain-to-room-graph-handoff.md": {
      "disposition": "reverify",
      "reason": "The process explicitly has no runtime or repository witness; its historical verification date was not refreshed. Separate relief from locomotion limits and permit explicit not-applicable fields. All-zero optional masks, off-mesh links and plan migration require scoped validation; forms alone do not eliminate composition failures or prove empirical frequency claims."
    }
  }
}
```
