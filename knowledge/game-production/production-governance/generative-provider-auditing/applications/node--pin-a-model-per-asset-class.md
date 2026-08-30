---
layer: application
type: application
subject: generative-provider-auditing
technique: pin-a-model-per-asset-class
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Pinning and custody in the PoF generation library

PoF is a Next.js/TypeScript production tool that drives hosted image, video and image-to-3D
services. Two modules carry the pin discipline: `src/lib/visual-gen/tripo-models.ts` for
meshes and `src/lib/leonardo.ts` for images and video.

## The pin module states the doctrine, not just the value

`src/lib/visual-gen/tripo-models.ts:1-10` opens with the incident that created it: the
app's generate route "used to call `startTripoJob` with no `model_version`, so every
in-app generation ran on whatever the account default happened to be." The doctrine
follows in one sentence — **"An unpinned model is an unaudited engine, and an unaudited
engine is not a trusted one."**

The pin itself is two constants (`tripo-models.ts:36,39`):

```ts
export const TRIPO_AUDITED_MODEL = 'v3.1-20260211';
export const TRIPO_AUDITED_TEXTURE_QUALITY = 'detailed' as const;
```

The pairing matters: the pin is *model version plus texture setting*, because that is the
pairing the arena graded, not the model alone. `TripoModelPin.audited` (`:41-47`) is
documented as "True only when this exact pairing has been graded by a PoF arena run" —
the flag tracks the benchmark, not the intent.

## The unknown class must not fall through

`tripoModelFor()` (`tripo-models.ts:69-83`) resolves *every* class to the audited pairing,
including an absent one, and says why in the returned rationale:

> `no asset class was supplied; pinned to v3.1-20260211 rather than falling back to the
> account default, which the character-pipeline arena graded FAIL.`

This is the re-entry point the technique warns about: a resolver returning "no opinion"
for an unrecognised class hands the request straight back to the provider's default. The
comment above the function states it directly — "'unknown class' must not degrade back
into the silent account default that this module exists to eliminate."

**Deviation, standard unchanged.** One identifier currently serves all classes, on a
benchmark run for the character pipeline's hero tier. The technique's rule is that a
class covered by another class's benchmark is *inherited, unbenchmarked* and must render
as such; PoF's `audited: true` is returned uniformly. The honest record here would flag
the non-hero classes as inheriting the pin.

## Per-modality pins with their cost basis

`src/lib/leonardo.ts:170-174` states a two-line model policy as code:

```ts
export const LEONARDO_VIDEO_MODELS = {
  hailuo23: 'hailuo-2_3',          // text-to-video
  hailuo23Fast: 'hailuo-2_3-fast', // image-to-video (start frame)
} as const;
```

The rationale is recorded where each is used: text-to-video is "~180 credits for a 6s
clip" (`:275-278`), and image-to-video is "cheaper + more controllable than text-to-video
(generate one image, then drive the motion)" (`:286-290`). That is the modality rule with
its cost basis attached — a per-clip figure that says what it is per, and a preference
justified by the inspectable intermediate rather than by price alone.

## Custody: download, then delete

`downloadThenDelete()` (`leonardo.ts:410-414`) is four lines and the order is the whole
point:

```ts
const imgRes = await fetch(imageUrl);
if (!imgRes.ok) throw new Error(`Leonardo image download failed (${imgRes.status})`);
const bytes = new Uint8Array(await imgRes.arrayBuffer());
await deleteGeneration(generationId);
```

The fetch is verified before the provider-side copy is released; a failed download throws
and the remote artifact survives. Every generation path routes through it — stills at
`:162`, video at `:257` — with `cleanup: false` as an explicit opt-out rather than a
default. Provider-hosted output is treated as a staging area with a countdown, never as
the archive.
