---
layer: application
type: application
subject: shader-budget-authoring
technique: surface-to-shading-model-map
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: a surface vocabulary shared by the keyword analyser, the prompt builder and the estimator

PoF holds the surface-to-shading-model mapping in three places that are deliberately
one closed vocabulary, and it is worth reading as an example of a table that stayed
single-sourced across an analyser, a prompt pipeline and a cost gate.

## The vocabulary

`SurfaceType` and `RenderFeature` are declared once on the authoring component
(`src/components/modules/content/materials/MaterialParameterConfigurator.tsx`) and
imported by everything else — including the pure estimator
(`src/lib/material-cost-estimator.ts:17`) and the prompt builder
(`src/lib/prompts/material-configurator.ts:5`). Eight surfaces: `metal`, `cloth`,
`skin`, `glass`, `water`, `emissive`, `foliage`, `stone`. Six features: `subsurface`,
`parallax`, `emissive`, `refraction`, `tessellation`, `worldPositionOffset`.

Because the vocabulary is shared, the cost of a brief is knowable before a material is
opened, and the guidance an assistant writes cannot name a surface the gate does not
cost.

## Plain English to physically-based properties

`src/lib/visual-gen/style-keywords.ts:30-45` is the analyser half — a `STYLE_RULES`
table mapping description keywords to a surface type, property values, *and the features
those words imply*:

```ts
{ keywords: ['metal', 'steel', 'iron', 'armor', 'chrome', 'silver'],
  surfaceType: 'metal', metallic: 0.9, roughness: 0.2, … },
{ keywords: ['stone', 'rock', 'brick', 'concrete', 'marble'],
  surfaceType: 'stone', roughness: 0.7, metallic: 0, features: ['parallax'], parallax: 0.05, … },
{ keywords: ['skin', 'flesh', 'face', 'character', 'body'],
  surfaceType: 'skin', subsurface: 0.8, roughness: 0.6, features: ['subsurface'], … },
```

The `features:` field is the part that matters most for budget. "Stone" does not only
mean rough and non-metallic — it pulls in `parallax`, which the estimator prices at 250
instructions. A word in a brief has a cost, and this table is where the word acquires
it. Feature-signal rows (`'parallax', 'depth', 'heightmap', 'displacement'`) let an
author request the feature directly, so the same table serves both the inferred and the
explicit path.

## Forced paths, recorded as forced

`shadingModelFor` in the estimator (lines 98–106) is the resolution order, and the first
two entries are forced by surface, not chosen by feature:

```ts
if (input.surfaceType === 'foliage') return 'TwoSidedFoliage';
if (input.surfaceType === 'skin') return 'SubsurfaceProfile';
if (input.features.includes('subsurface')) return 'Subsurface';
if (input.features.includes('refraction') && input.surfaceType !== 'glass') return 'ThinTranslucent';
if (input.surfaceType === 'glass' || input.surfaceType === 'water') return 'ThinTranslucent';
return 'DefaultLit';
```

Say "skin" and you have bought a subsurface profile whether or not you asked. The
estimator then treats that forced path as a costed item with its own substitute (lines
153–160): *"Subsurface shading model is roughly 30–60% more expensive than DefaultLit
per-pixel"*, suggestion *"PreintegratedSkin works for many cases without a full
subsurface pass."* This is the technique's rule that a forced path still gets a cheaper
alternative named beside it.

## The guidance derives from versioned renderer facts

`src/lib/prompts/material-configurator.ts:19-35` is the transplantable idea. The
shading-model guidance is a *function of* the engine facts, not a literal table:

```ts
/**
 * Shading-model guidance per surface. The Substrate half of each line comes from
 * the project's engine facts (`engine-facts.ts`) — never a hard-coded "5.7+".
 */
function surfaceShadingModel(f: EngineFacts): Record<SurfaceType, string> {
  const slab = f.substrateSlabHint;
  return { metal: `Default Lit (${slab})`, skin: `Subsurface Profile (${slab}, with subsurface)`, … };
}
```

`featureDetails(f)` (lines 37–47) does the same for implementation advice, and
`tessellation` is not a literal at all — it is `f.naniteDisplacement`, the version's own
statement about displaced surfaces. `getEngineFacts(ctx.ueVersion)`
(`src/lib/engine-facts.ts`) resolves per project: on 5.8 `substrateSlabHint` reads
*"Substrate is production-ready on UE 5.8"*, on 5.0–5.6 it reads *"legacy shading model
— Substrate is not production-ready before 5.7"*. One engine upgrade changes one fact
table and every generated instruction follows.

## What is missing

The unmatched case. `STYLE_RULES` falls through to defaults when no keyword hits, and
nothing records that no rule matched — so a brief the vocabulary does not cover is
indistinguishable from one it deliberately mapped to the opaque default. The technique's
rule stands: an unmatched brief is a gap in the table and should be visible as one.
