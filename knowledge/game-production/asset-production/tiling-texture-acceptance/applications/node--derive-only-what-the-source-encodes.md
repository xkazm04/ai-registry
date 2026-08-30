---
layer: application
type: application
subject: tiling-texture-acceptance
technique: derive-only-what-the-source-encodes
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The three-way split in an albedo-to-material derivation

`src/lib/texture-maps.ts` (PoF) turns one generated albedo into a first-pass material set,
and its file header states the bucketing before any code runs — which is the point:

> "Derives a tangent-space normal map from an albedo by treating luminance as a height
> field and running a wrap-around Sobel filter. Wrap-around sampling keeps a tileable
> albedo's normal map tileable too. The same luminance heightfield is exportable as a
> height map (landscape displacement), and a documented-heuristic roughness map (inverted
> luminance — crevices read rougher) completes the derivable set. Metalness is
> deliberately NOT derived: albedo carries no metalness signal, and emitting one would be
> invented data."

## Bucket 1 — derived faithfully

`deriveNormalFromAlbedo()` (`texture-maps.ts:19-65`). Greyscale to a raw buffer, then a
3×3 Sobel over the luminance height field. The wrap-around requirement lives in one
helper (`texture-maps.ts:33-38`):

```ts
const at = (x: number, y: number): number => {
  const xx = ((x % w) + w) % w;
  const yy = ((y % h) + h) % h;
  return data[(yy * w + xx) * ch] / 255;
};
```

The double modulo is what handles `x = -1` on the left edge; a plain `%` would go
negative and index out of the buffer. Every Sobel tap goes through `at()`, so no edge is
clamped and no flat one-pixel border is created. `strength` defaults to `2`
(`texture-maps.ts:16`, `:23`). The vector is `(-dx·s, -dy·s, 1)`, normalised with
`Math.hypot`, then encoded `n·0.5 + 0.5` into 8-bit RGB.

## Bucket 1b — the intermediate, shipped

`deriveHeightFromAlbedo()` (`texture-maps.ts:72-75`) emits the same luminance field as a
greyscale image for displacement use. Two lines, and it is per-pixel, so — as the comment
notes — "a tileable albedo stays tileable" with no wrap-around question to answer. The
intermediate of a derivation is itself a channel worth exporting.

## Bucket 2 — declared heuristic, with its inversion exposed

`deriveRoughnessFromAlbedo()` (`texture-maps.ts:86-101`) inverts luminance. The docstring
names it a "documented HEURISTIC (albedo has no true roughness signal) — good enough as a
first-pass PBR set for generated tiles; author real roughness downstream when a material
needs it." The `invert` option (`texture-maps.ts:77-84`) is the escape hatch the rule
implies once written down: `false` "tracks luminance directly for materials where bright
means rough (e.g. chalky surfaces)."

## Bucket 3 — refused

There is no `deriveMetalnessFromAlbedo`. The absence is the design, and the header says
why: emitting one "would be invented data". Metalness is binary, physical, changes the
entire light response, and is not predicted by brightness. A plausible mid-grey map would
have cost someone a lighting investigation.

## Where it falls short of the technique

- **The labels live in code comments, not in the artifacts.** A consumer receiving four
  images cannot tell the Sobel-derived normal from the convention-derived roughness. The
  technique requires a machine-readable provenance label travelling with each output.
- **The `invert` choice is not recorded with the result** — the same argument.
- **The refusal is silent.** No named absence with a reason reaches the consumer; the
  metalness channel simply does not exist. A stated refusal is louder than a missing file.
