---
layer: application
type: application
subject: generated-asset-world-scale
technique: generator-normalization-band
stack: process
status: forged
verified_on: 2026-08-20
---

# Establishing the normalisation band from a real corpus

**Stack:** a one-off measurement pass over a project's own generated-asset library, whose
result was frozen as two constants in `src/lib/visual-gen/world-scale.ts` and independently
restated as a knowledge-base entry in `src/lib/knowledge/ue-gotchas.ts`.

## The measurement

Dated 2026-08-17, over every `.glb` under the project's `generated/` tree — 52 files,
spanning cloud and local providers (Tripo, TripoSR, Hunyuan3D) and every asset class the
pipeline had produced. The recorded observations, from the module header:

| Asset | Longest extent | What it should have been |
| --- | --- | --- |
| hero character (cloud provider) | 1.000 m | 1.8 m |
| storage crate prop | 1.000 m | crate-sized, unspecified |
| sword hilt | 1.017 m **long** | ~0.2 m |
| every local best-of result | ~1.0 m | varies |

The sword hilt is the row that makes the finding undeniable: a grip is the same length as
the character holding it.

## What was frozen

```ts
export const GENERATOR_NORMALIZED_EXTENT_M = 1.0;
const NORMALIZED_BAND: readonly [number, number] = [0.9, 1.1];
```

The point value is exported (other modules quote it in messages); the band is module-
private and consumed only through `isGeneratorNormalized(bbox)` (`world-scale.ts:79-82`),
so the detection has exactly one implementation. The ±10% width matches the technique's
rule: wide enough to hold the observed spread, narrow enough to mean something.

The detection is used as a *provenance classifier*, never as a gate — `normalized` is a
field on every `ScaleGrade`, and it only ever enriches a reason string. A normalised mesh
with no target still returns `unmeasured`, because the band never supplies a target.

## Why nothing downstream had caught it

The module header records the audit that motivated the work: the import template defaulted
`scale: 1.0`, the Tier-1 gate rejected only a *degenerate* bounding box, and `mesh-finish`
never rescaled. Three checks, all passing, none of them about size — so a hero shipped at
100 cm next to a 180 cm reference figure and a sword hilt shipped at a metre.

## The second, independent statement

`src/lib/knowledge/ue-gotchas.ts` carries entry `ai-mesh-unit-normalized` (near line 395)
with its own provenance line — `research: Souls-like in 3 days (Stefan 3D AI) — UE
reference-skeleton size check + measured generated/ library 2026-08-17`. It reaches the
same figures from a practitioner's import gotcha rather than from the corpus scan, and it
adds the distinction the golden path leans on:

> "The unit is right (metres → the importer's own m→cm conversion applies), so the
> `fbx-import-scale` rule (import_uniform_scale = 1.0, not 100) still holds — but the SIZE
> is not."

That is the two-independent-statements case in the golden path, and it is also where the
*unit vs size* separation was learned: the sibling gotcha `fbx-import-scale` (`:103-110`)
governs the boundary conversion, and this entry explicitly refuses to disturb it.

## The class-nominal table, as shipped

```ts
export const NOMINAL_EXTENT_M: Readonly<Record<string, number>> = Object.freeze({
  character: 1.8,
});
```

One row, with a comment naming the external decision it restates — the reference skeleton
every generated character is retargeted to — and an explicit note that the number is
*"deliberately absent for weapon/prop/environment/modular-part"*. `nominalExtentFor()`
returns `undefined` on a miss rather than a fallback.

**Deviation:** the 1.8 m figure is typed here rather than read from the rig preset that
owns the reference skeleton (`src/lib/visual-gen/rig-presets.ts:27-81`), so two files can
drift. The standard — one authority per quantity, derive rather than re-type — stays.
