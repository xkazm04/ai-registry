---
layer: application
type: application
subject: tiling-texture-acceptance
technique: biome-themed-tile-prompting
stack: process
status: forged
---

# A biome vocabulary, introduced to fix a collapse regression

`src/lib/visual-gen/biome-textures.ts` (PoF) exists because of a specific defect, and the
file header names it: the autonomous texture path "stops picking industrial defaults (the
PS-2 asphalt regression)". Whatever environment was requested, the returned ground texture
came back looking like low-generation console asphalt. The fix was not a better model or a
longer prompt — it was a closed vocabulary per environment class.

## The mapping

`BIOME_TEXTURES` (`biome-textures.ts:22-60`) is a `Record<Biome, BiomeTextureSpec>` over a
closed union of six classes: `dungeon | cave | forest | desert | snow | industrial`
(`biome-textures.ts:8`). Each entry carries three things, which map one-to-one onto the
technique's three word kinds plus a fallback:

| Field | Role | Example (`forest`) |
| --- | --- | --- |
| `searchQuery` | themed library search, commented "never a bare category" | `'forest ground dirt leaves'` |
| `leonardoPrompt` | themed generation prompt | `'forest floor with dirt, moss and fallen leaves, seamless tileable PBR texture'` |
| `fallbackAssetId` | declared fallback, a known-good library asset | `'forrest_ground_01'` |

Note the shape of every `leonardoPrompt`: material noun first (`forest floor`, `desert
sand dunes`, `industrial metal floor plate`), condition second (`with dirt, moss and
fallen leaves`, `fine rippled grains`, `scuffed steel`), tiling instruction last. The
heavy word leads.

`pickBiomeTexture()` (`biome-textures.ts:73-83`) tries a text search first and falls back
to the named asset id on either an empty result or a thrown search — a declared generic,
not an empty string.

## The single-source half

`src/lib/visual-gen/style-keywords.ts:30-45` is the other side: `STYLE_RULES` maps
plain-English keywords onto physically-based properties — `roughness`, `metallic`,
`emissive`, `subsurface`, `parallax`, `opacity`, `features` and a five-colour palette. So
`['metal','steel','iron','armor','chrome','silver'] → metallic: 0.9, roughness: 0.2`, and
`['stone','rock','brick','concrete','marble'] → roughness: 0.7, metallic: 0, parallax:
0.05`.

The same table is consumed by the analyser that reads a request and by the authoring
chips that compose one, so a surface asked for as "polished metal" is interpreted as
`metallic 0.9 / roughness 0.2` by both sides. That is the `one-authority-per-quantity`
shape: one table, two consumers. A second copy is where a texture requested rough gets
interpreted glossy.

## The fixed suffix

`src/lib/visual-gen/prompt-chips.ts:36-81` gives a jargon-free chip vocabulary grouped
`material → mood → gameStyle`, with `CHIP_GROUP_ORDER` (`:36`) fixing composition order so
material words lead. `QUALITY_SUFFIX` (`prompt-chips.ts:84`) is defined once —
`'game-ready 3D asset, clean topology, PBR materials, neutral studio lighting, high
detail'` — and appended by `composeVisualPrompt()` (`:96-116`) after all fragments, so
"users never type 'game-ready PBR' etc." One definition, one append site. Generic prompt
composition beyond this belongs to the `media-generation` bundle; what is taken here is
only the material-vocabulary and single-suffix structure.

## Where it falls short of the technique

- **The fallback rate is not counted.** `pickBiomeTexture` falls through silently, so
  nobody can see a class that has stopped being covered.
- **The class that produced a texture is not recorded with the output**, so the question
  "are our desert tiles worse than our forest ones" is unanswerable.
- **`industrial` is both a class and the shape of the original regression.** A vocabulary
  whose failure mode collapses toward one of its own entries needs that entry watched
  closely.
