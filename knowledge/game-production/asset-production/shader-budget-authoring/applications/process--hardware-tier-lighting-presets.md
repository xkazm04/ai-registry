---
layer: application
type: application
subject: shader-budget-authoring
technique: hardware-tier-lighting-presets
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: four global-illumination presets, each carrying its own rationale into the prompt

`src/lib/visual-gen/lighting-presets.ts:39-95` in PoF (`C:\Users\kazda\kiro\pof`) is a
closed set of exactly four `LightingPreset` entries. Each declares a `targetTier`, one
`rayTracing` method, an optional `softwareMode`, a `reflectionMethod`, whether per-mesh
distance fields are required, and — the load-bearing field — a `notes` string described
in the interface as *"Best-practice rationale + the gotchas this preset answers —
injected into prompts."* The rationale is not documentation about the preset; it is
payload that travels with it into the generated guidance.

## The four

| id | tier | method | what it answers |
| --- | --- | --- | --- |
| `aaa-hwrt-balanced` | AAA | hardware-when-available, surface-cache reflections, SWRT detail fallback | the default |
| `aaa-hwrt-hero-reflections` | AAA | hardware, hit-lighting **for reflections** | water and polished floors where surface-cache reflections read black |
| `interior-detail-swrt` | mid | software, detail tracing | interiors where small-distance GI detail matters |
| `open-world-global-swrt` | wide-hardware | software, global tracing | large worlds where the low-res global field is the right trade |

## The non-shipping mode, named in the preset that is nearest to it

The hero-reflections preset's notes carry the warning exactly where someone would
otherwise make the mistake:

> Use ONLY the reflection method "Hit Lighting for Reflections" (post-process volume) —
> accurate specular at moderate cost. Do NOT use full "Hit Lighting": it casts far more
> indirect rays and is too expensive to be reliable in a shipping game.

Two adjacent settings, one shippable and one not, distinguished by a sentence attached
to the preset a person is already reading. Putting that warning in a wiki would put it
where nobody is at the moment of the decision.

## The trade stated as a trade, not a ladder

The two software presets are the same method at two detail settings, and neither is
ranked above the other. Detail tracing: *"reads per-mesh distance fields — accurate for
thin/close geometry… Costs more memory than global tracing."* Global tracing:
*"cheaper + faster, scales to big worlds, but loses small-distance/contact GI detail.
Prefer over detail tracing only when the world is large and per-mesh accuracy is not the
priority."* The selection rule is written into the entries themselves.

## The gotcha that travels with the setting

Both software-traced presets set `generateMeshDistanceFields: true`, commented at line
33 as *"Lumen SWRT needs per-mesh distance fields; almost always true"*, and the
interior preset's notes name the failure it causes: *"Thin walls/ceilings need a raised
Distance Field Resolution Scale or they leak light."* This is the concrete form of the
technique's rule that a preset transmits craft, not just a setting — a light leak in an
interior is otherwise diagnosed as a lighting bug rather than as a consequence of the
chosen trace mode.

The balanced AAA preset closes the loop back to the material layer: *"Switch reflective
hero surfaces (water) to the hit-lighting-reflections preset"* — the tier decision and
the surface decision are cross-referenced in the text an author reads.

## The headroom the preset table does not state

`getLightingPreset(id)` is the single accessor, so there is one authority. What the
table lacks is the frame budget each preset assumes. The same repo does state one for
another class — `src/lib/catalog/pipelines/vfx.ts:17-19` gives a per-class GPU budget of
0.8 ms at 60 Hz with a target peak of 0.48 ms, *"60% CONSUMED, 40% headroom"*, and line
153 records that this label was once written inverted as "60% headroom". A preset that
named its own frame cost and the share it leaves for content would let a level owner
answer, before building the scene, how much of the frame is already spent.
