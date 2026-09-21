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

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all six techniques and both applications at their reverted bytes, then
opened the PoF checkout at `C:/Users/kazda/kiro/pof` (HEAD `d823bffe`) to check the `node`
application's citations. Reading source, not executing it: no generator run, no mesh export,
no engine import.

The techniques hold up under scrutiny. Requiring the basis before any gradient means
anything, the two-sided envelope with a relief floor, drainage as an explicitly-bounded
plausibility rung, non-emptiness asserted before mask consistency, and the three-clause
definition of playable ground with connectivity as the clause everybody omits, are each
specific and each name what they do not prove. The handoff technique's ownership rule - the
ground owns walkability, the graph owns structure, and the ground wins on disagreement - is
the sharpest boundary statement in my group.

The one finding I can defend is in the golden path, and it is the sentence the whole opening
rests on: "a heightfield cannot be malformed. It is a rectangular array of numbers. Every
value in it is a valid number, every neighbour relation is defined, the array parses, loads,
tessellates and renders. There is no structural defect available for a structural check to
find". That is overstated in a way that undercuts its own argument. NaN and infinity are
representable in every float format a generator will use and propagate through every
downstream gradient; a grid whose dimensions do not match its declared extent, or a mask
stack whose layers do not share the height field's dimensions, are structural defects too.
The subject's own `node` application describes a test suite whose first two cases are
dimensions and value bounds - structural checks that can fail on this exact artifact. The
defensible claim is narrower and still does all the work: *a well-formed heightfield is
always well-formed ground*, so structural proof cannot separate playable terrain from
unplayable terrain. Stating it as "there is no structural defect available" invites a reader
to skip the cheap NaN and dimension assertions that the pipeline still needs.

I looked for, and did not find, defects in the drainage technique. D8 flow direction with a
recorded tie-break, depression resolution by spill-point filling with the fill count, volume
and deepest single fill reported, and flow accumulation above a declared area threshold, are
the standard formulation and the reporting rules are the part most implementations skip.

On the `node` application: PoF has since implemented the fix it recommends, and it is worth
recording because the application's closing section reads as owed work. `terrain.ts` now
carries `TERRAIN_UNIT = 'm'`, a `TerrainConfig` documenting `size` as a SAMPLE COUNT that is
explicitly "NOT a resolution and NOT an extent", a `resolveTerrainBasis` supplying
`cellSizeM` / `verticalRangeM` beside the normalised samples, and a `UINT16_LEVELS = 65535`
constant for the quantization step. The file's header paragraph paraphrases this technique's
opening. The hand-typed `heightScale: 10` at the store call site is gone, replaced by a
comment recording that it used to be a second undeclared copy. The application is honestly
pinned to commit `9aa31407`, so it is not wrong; it is a description of a state that no
longer exists, and its "What to change first" section names three changes that landed.

`process--terrain-to-room-graph-handoff` is a methodology document with no runtime to drift
against. Its ground card, regeneration request and single-sourced envelope register are
consistent with the technique they realise, and it states its own limit honestly - a team
that adopts the cards has eliminated one class of composition failure and improved no map.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/terrain-synthesis-acceptance",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:172b6c4cc91ee150",
  "disposition": "clarify",
  "coverage": "Golden path, six techniques and two applications read in full at reverted bytes. The node application's citations were re-checked by reading the live PoF checkout (HEAD d823bffe). Not evaluated: any terrain generation, mesh export, engine import or drainage computation executed; the process application's cards, which have no runtime to check; whether the stated locomotion-class angle bands match any specific engine's navigation voxelizer.",
  "counterexamples": [
    "A heightfield can be malformed: NaN or infinity samples are representable and propagate through every gradient, and a grid whose dimensions disagree with its declared extent or with its mask stack is a structural defect. The subject's own application describes a test suite whose first cases are dimensions and value bounds.",
    "The playable-fraction technique refuses to grade without a declared play boundary, and the handoff technique refuses to plan without a traversable mask. A generated map delivered with neither is therefore not gradeable at all, and no document names what the pipeline should do with it besides stopping.",
    "Drainage coherence is declared inapplicable to overhangs and caves, but a heightfield with a declared water level and a separately generated cave volume beneath it is a common shipping shape, and nothing says which parts of the field remain checkable."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/lib/visual-gen/generators/terrain.ts", "result": "Establishes that TERRAIN_UNIT, cellSizeM/verticalRangeM, resolveTerrainBasis and UINT16_LEVELS now exist, so the three changes the node application lists as owed have landed since commit 9aa31407. Does not establish that any downstream consumer reads the basis; that was not traced."},
    {"path": "C:/Users/kazda/kiro/pof/src/components/modules/visual-gen/procedural-engine/useProceduralStore.ts", "result": "Confirms the hand-typed heightScale: 10 is gone and the site records why. Does not establish what replaced it end to end."}
  ],
  "documents": {
    "terrain-synthesis-acceptance.md": {"disposition": "clarify", "reason": "The opening claim that a heightfield cannot be malformed and offers no structural defect to find is overstated: NaN and infinity samples, and dimension disagreement between the grid, its declared extent and its mask stack, are structural defects on this exact artifact. Narrow it to the claim that actually carries the argument - a well-formed heightfield is always well-formed, so structural proof cannot separate playable ground from unplayable ground. Everything downstream of that sentence is sound."},
    "techniques/biome-mask-cross-consistency.md": {"disposition": "keep", "reason": "The three contradiction families are each detectable before placement, the authority rule (field wins, finding is against the mask) is stated with the reason the tempting fix is wrong, and asserting non-emptiness before evaluating any rule is the step that stops the cheapest false pass in terrain production."},
    "techniques/drainage-coherence-as-plausibility-gate.md": {"disposition": "keep", "reason": "Standard D8 direction, spill-point depression resolution and flow accumulation, with the reporting rules most implementations omit: the recorded tie-break, the fill count and deepest fill as a noise signature, and an empty network reported as a failure of the check rather than a pass. It states precisely what it proves and refuses to be read as an endorsement."},
    "techniques/heightfield-resolution-and-vertical-basis.md": {"disposition": "keep", "reason": "Three quantities, the refusal to adopt a default spacing, folding exaggeration into the vertical at the moment it is applied so only one number describes the vertical afterwards, and re-deriving the basis on every resample. The one-authority argument about an exporter scale and an importer scale is correct and its symptom is named."},
    "techniques/playable-area-versus-backdrop-ratio.md": {"disposition": "keep", "reason": "The three-clause definition of playable, with connectivity to the entry region as the clause that makes the number honest, is the whole technique and it is right. Attributing shortfall to slope, boundary or disconnection separately is what makes the finding actionable, and refusing to grade an undeclared map class is consistent with the rest of the subject."},
    "techniques/slope-traversability-envelope.md": {"disposition": "keep", "reason": "Per-class envelopes, distribution rather than extremum, connected components of the in-envelope ground, and measurement at the spacing the runtime consults are each argued from a named failure. The claim that a passing envelope does not imply an agent will traverse - step height, ledge handling, collision representation intervene - is the correct boundary."},
    "techniques/terrain-to-room-graph-handoff.md": {"disposition": "keep", "reason": "The payload is small and every item is load-bearing, the ownership rule is stated as consequences rather than sentiment, and the regeneration request with a stated constraint is the right artifact for an unmet need. The snap-versus-reject rule for points against footprints, including the requirement that a snap records which reason moved it, is a genuinely non-obvious refinement."},
    "applications/node--heightfield-resolution-and-vertical-basis.md": {"disposition": "reverify", "reason": "PoF has implemented all three changes the document's closing section lists as owed: TERRAIN_UNIT, cellSizeM/verticalRangeM via resolveTerrainBasis, and the removal of the hand-typed heightScale at the store call site. The document is honestly pinned to commit 9aa31407 but reads as a description of the present tree, and its natural-experiment framing (the one medium where the convention was never applied) is no longer true. Re-anchor it."},
    "applications/process--terrain-to-room-graph-handoff.md": {"disposition": "keep", "reason": "A methodology realization with no runtime to drift against. The ground card's field list matches the technique's payload item for item, the reachable-from-entry field sits directly under the raw in-envelope percentage for the stated reason, and the document states its own limit - it eliminates a class of composition failure and improves no map."}
  }
}
```
