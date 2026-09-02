---
layer: application
type: application
subject: terrain-synthesis-acceptance
technique: heightfield-resolution-and-vertical-basis
stack: node
status: forged
verified_on: 2026-09-02
---

# A heightfield with no basis, in a codebase that otherwise has one

Read against a UE5 game-production toolkit — a Next.js application driving generation
pipelines, catalog steps and headless engine work — at commit `9aa31407`. Every line below
was re-opened on 2026-09-02. The manifest declares no `engines` field, so no version witness
for the runtime is recorded here.

The interesting thing about this tree is not that its terrain path lacks units. It is that
**everything around the terrain path has rigorous unit discipline**, and the heightfield is
the one artifact that escaped it. That makes it a clean natural experiment in what the
technique is actually for: the same team, the same conventions, one medium where the
convention was never applied.

## The generator produces a unitless field

`src/lib/visual-gen/generators/terrain.ts` (125 lines) is the only heightfield generator in
the tree. Its configuration type, lines 17–27, declares four numbers and a unit for none of
them:

```ts
export interface TerrainConfig {
  /** Size of the heightmap (must be power of 2 + 1, e.g., 129, 257, 513) */
  size: number;
  /** Roughness factor (0-1). Higher = more rough terrain */
  roughness: number;
  /** Minimum height value */
  minHeight: number;
  /** Maximum height value */
  maxHeight: number;
```

`size` is a **sample count**, not a resolution — it fixes the grid and says nothing about the
extent it covers, so the horizontal spacing the technique requires does not exist anywhere in
the type. `minHeight` and `maxHeight` are documented as "height value", and the defaults at
lines 30–35 are `size: 129, minHeight: 0, maxHeight: 1`. Line 106 normalizes the generated
grid into that range:

```ts
      grid[y][x] = minHeight + ((grid[y][x] - min) / range) * (maxHeight - minHeight);
```

So the delivered artifact is a 129×129 grid of values in `[0, 1]`, and by the technique's
first rule it is a picture rather than terrain: it is equally a mountain range and a gravel
pile, and nothing downstream can tell.

The only export path off it is `heightmapToUint16` at lines 114–125, which scales the samples
by `65535` and is documented "Convert a heightmap to a flat Uint16Array for PNG export". The
16-bit choice is the right one — it is the quantization the technique's third quantity asks
for — but with no vertical range attached, the quantization step it implies cannot be
computed, and no code in the tree writes the PNG or imports it as a landscape.

## The basis is invented at the consumer, twice

The single consumer is `src/lib/blender-mcp/scripts/terrain-to-mesh.ts`, which emits a mesh
script. Lines 17–18 are where the two missing quantities get fabricated:

```
height_scale = ${params.heightScale}
spacing = grid_size / max(rows, cols)
```

and line 29 applies the vertical:

```
        h = heights[r * cols + c] * height_scale
```

Neither `height_scale` nor `spacing` names a unit; they inherit whatever the receiving
modelling package assumes. And the sole call site,
`src/components/modules/visual-gen/procedural-engine/useProceduralStore.ts` lines 115–118,
supplies both by hand:

```ts
    const code = terrainToMeshScript({
      heightmap: terrainHeightmap,
      gridSize: terrainConfig.size,
      heightScale: 10,
    });
```

Two defects in three lines, and both are the ones the technique names. `heightScale: 10` is a
**hand-typed vertical multiplier** — the exaggeration factor, undeclared, applied at the far
end of the pipeline where nothing that reasons about the terrain will ever see it. And
`gridSize` is passed the heightmap's *sample count*, so `spacing` evaluates to
`129 / 129 = 1` — the horizontal basis is accidentally unity, which is the most dangerous
possible value because it makes the missing division invisible. Change the grid to 257 and
the spacing stays 1; the world silently doubles in extent while every slope halves.

## The rest of the codebase does this correctly

The deviation is specific, not cultural. Elsewhere in the same tree:

- `src/lib/catalog/pipelines/combat-map.ts` lines 91–92 states the arena footprint in
  centimetres with the metre reading in the comment: `// 20 m square arena: the proven
  build_arena.py footprint.` / `extentCm: 1000,` — the unit is in the identifier itself.
- `src/lib/visual-gen/generators/linear-prop.ts` line 31 documents an anchor as
  `/** Anchor the prop starts at, in metres (glTF axes, +Y up). */` — unit and axis
  convention together.
- `src/lib/visual-gen/texel-density.ts` line 33 goes further and makes the unit a named
  constant: `export const TEXEL_DENSITY_UNIT = 'px/m' as const;`, with the budget at line 40.

Three media, three explicit unit conventions. The heightfield is the exception, and the reason
is structural rather than careless: a prop or a texture crosses a documented import edge where
somebody had to decide, while a heightfield stays inside one process as an array of numbers,
which is exactly the condition under which a basis is never written down.

## The promise, the test, and the gap between them

`src/lib/module-registry.ts` line 1177 carries the checklist prompt that commissioned this
work, and it promises considerably more than exists:

```
prompt: 'Build a terrain heightmap generator. Implement Diamond-Square algorithm with configurable: size (power of 2 + 1, e.g., 257, 513, 1025), roughness factor (0-1), height range, seed for reproducibility. Also implement Perlin noise with octaves, lacunarity, persistence. Output as 2D float array. Render preview as grayscale canvas. Export as 16-bit PNG for UE5 Landscape.'
```

The generator's own header, `terrain.ts` line 3, repeats half of it —
`* Implements Diamond-Square and Perlin noise algorithms.` — and line 3 is the only occurrence
of the word in the file. There is no coherent-noise function, no lacunarity, no persistence,
no PNG encoder and no landscape import. Note that none of the missing pieces is a basis
either: even the aspirational statement specifies a *sample count* and a bit depth and never a
metre.

The test suite, `src/__tests__/lib/generators/terrain.test.ts`, has seven cases: dimensions,
value bounds, a custom range, determinism per seed, variance across seeds, at least a hundred
distinct values, and the `Uint16` scaling. Every one is a numeric-shape assertion over an
array. This is precisely the situation the golden path describes — a heightfield cannot be
malformed, so a suite that only proves well-formedness passes forever on ground nobody could
walk. There is no slope computation anywhere in the tree to fail, and no unit for one to be
expressed in.

The project's own audit is candid about the consequence. `src/lib/status/step-facts.json`
records for both the arena-terrain and the zone-biome catalog steps, at lines 761 and 3451,
the same parenthetical: `(3D terrain build deferred — no terrain mesh engine)`. The honesty is
worth more than the capability: an absent engine that is recorded as absent is a gap, and a
gap is survivable.

## What to change first

The cheapest correct fix is not a slope checker; it is three fields. Add sample spacing and
vertical range with a stated unit to `TerrainConfig`, fold `heightScale: 10` into the vertical
range at the point it is chosen rather than at the point it is applied, and make
`terrainToMeshScript` take the spacing rather than deriving it from a sample count it was
handed under a different name. That is a small change, and every measurement in this subject
becomes possible immediately afterwards — none of them is possible before it.
