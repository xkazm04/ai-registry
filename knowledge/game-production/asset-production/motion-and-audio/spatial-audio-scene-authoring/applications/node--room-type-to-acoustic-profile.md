---
layer: application
type: application
subject: spatial-audio-scene-authoring
technique: room-type-to-acoustic-profile
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Deriving an audio scene from a room graph in a TypeScript generator

PoF derives an entire `AudioScene` — zones plus emitters — from the level-design room
graph, then emits Unreal C++ for it. The derivation spine is
`generateSpatialAudio` (`src/lib/spatial-audio-generator.ts:318-465`); the numbers it names
are resolved in `src/lib/audio-codegen.ts`.

**Since first documented (2026-08-30):** the anchor above was `spatial-audio-generator.ts:19-99`.
The file has grown a good deal of data (a new room type, more emitter templates) ahead of the
function body, so the same `generateSpatialAudio` export now starts at line 318 rather than 19;
the function itself is otherwise unchanged.

## The profile table

`ROOM_ACOUSTICS: Record<RoomType, AcousticProfile>` (`spatial-audio-generator.ts:19-84`)
is one row per room type, each carrying `reverb`, `occlusionMode`, `attenuationBase`,
`priority`, plus a UI `color` and a `soundscapePrefix` used as the intent phrase for
content authoring. The rows read as the technique's decision rules made literal:

| Room type | Reverb | Occlusion | Base radius | Priority |
| --- | --- | --- | --- | --- |
| `transition` | `metal-corridor` | `high` | 800 | 2 |
| `safe` | `small-room` | `low` | 1200 | 3 |
| `exploration` | `large-hall` | `low` | 2500 | 4 |
| `combat` | `metal-corridor` | `medium` | 2000 | 6 |
| `cutscene` | `large-hall` | `medium` | 2000 | 7 |
| `boss` | `stone-chamber` | `high` | 3000 | 8 |
| `hub` | `large-hall` | `low` | 3500 | 5 |

Corridor smallest, hub largest; corridor and boss hard-walled, safe and exploration open;
priority ordered by narrative load. Nothing in the file argues for these values — the
argument lives in the technique, and the table is the transplantable half.

**Since first documented (2026-08-30):** `ROOM_ACOUSTICS` now carries an eighth row,
`puzzle` (`small-room`, `medium` occlusion, base radius 1500, priority 5). All seven rows
above are unchanged in value; the table above is simply no longer exhaustive.

**Deviation, standard not lowered:** `attenuationBase: 2000` is a bare number in the
profile row. The unit only appears downstream, in the generated comment at
`audio-codegen.ts:361` (`radius: ${zone.attenuationRadius}uu`). The technique requires the
unit at every site the number is written, including the authoring table — the field should
be `attenuationBaseUu` or carry the unit in its type. The generated comment is the right
instinct applied one layer too late.

## Preset and occlusion resolution

`REVERB_PARAMS` (`audio-codegen.ts:117-128`) is the single authority for the nine presets;
`OCCLUSION_VALUES` (`audio-codegen.ts:132-138`) maps the five-level ladder onto `{ volume,
lpf }` pairs. Both tables are reproduced verbatim in the techniques because the numbers are
the payload. The occlusion table is the cleanest confirmation of the two-parameter rule in
the repo: `high` is `{ volume: 0.35, lpf: 2000 }` — a wall is 9 dB down *and* dark, and
`none` is written as an explicit `20000` rather than a bypass flag.

## Attenuation recipe

`generateAttenuationCpp` (`audio-codegen.ts:357-403`) emits per-zone attenuation with
`const inner = Math.max(zone.attenuationRadius * 0.3, 50)` (line 360) — the
inner-radius-as-a-fraction rule with its floor, exactly as the technique states it — then a
spherical shape, `ENaturalSoundFalloffMode::Logarithmic`, and `LPFFrequencyAtMin = 20000`
sweeping to `LPFFrequencyAtMax = 2000` between `LPFRadiusMin = InnerRadius` and
`LPFRadiusMax = FalloffDistance`. Confirmed on every point.

**Since first documented (2026-08-30):** the emitting function was `generateAttenuationSource`
at `audio-codegen.ts:355-403`; it has since split into a header half,
`generateAttenuationHeader` (`:331-354`), and the C++ half quoted above,
`generateAttenuationCpp` (`:357-403`), with no change to the recipe itself.

## Two upward lessons

**Global modifiers as multipliers.** `getDifficultyModifiers` (`spatial-audio-generator.ts`)
returns `{ attenuationScale, occlusionBump, volumeScale }` per difficulty 1-5 — 0.8/1.0/1.3
on radius, a one-step occlusion bump at difficulty 4+, clamped against `OCCLUSION_LEVELS`.
The draft had no notion of a scene-wide intensity lever; the repo's version keeps the table
as the single source and layers a scalar on top, which is the right shape.

**Placeholders that refuse to look real.** `resolveEmitterCue` (`audio-codegen.ts:83-111`)
will not silently emit a plausible asset path. When nothing is bound it emits the derived
path *with* a `// PLACEHOLDER — …` comment naming which of three states applies ("this
emitter is bound to audio set X, which no longer exists", "audio set X is bound to this
emitter but has NO recorded UE import", "nothing is bound to this emitter and no path was
typed") and the instruction to import before shipping. That is `unmeasured-is-not-a-pass`
applied to generated code, and it is the lesson that promoted "the silent placeholder" to a
named failure mode in the golden path.

**Since first documented (2026-08-30):** the function was `resolveCuePath`
(`audio-codegen.ts:~100-113`) with two named placeholder reasons; it has been renamed to
`resolveEmitterCue` and gained a distinct middle tier. Provenance is now a three-way
`CueProvenance` (`'imported' | 'manual' | 'placeholder'`), and the function's own docstring
states why: codegen used to emit `em.soundCueRef || '/Game/Audio/SC_<PascalCase(name)>'`,
so a hand-typed override and a real UE import were indistinguishable in the generated
comment. The order is now the set's real imported path (`'imported'`, comment: *"Cue path
from the recorded UE import of audio set …"*) → the hand-typed override (`'manual'`,
comment: *"Cue path typed by hand in the property panel — NOT verified against a UE
import."*) → the labelled placeholder quoted above. The placeholder-refuses-to-look-real
lesson itself is unchanged and, if anything, sharpened — hand-typed paths are now also
flagged as unverified rather than presented with the same confidence as a real import.

## The capability seam

`src/lib/audio-gen/types.ts:33-53` documents the audio-specific half of provider honesty:
`capabilities` is "the kinds `generate` REALLY serves … not a wish list", `unsupported`
carries a per-kind refusal reason surfaced verbatim, and refusal happens before any billed
call. `providers/elevenlabs.ts:17-46` records why: `tts` and `music` were once claimed,
both were POSTed to `/v1/sound-generation`, and both came back as SFX clips filed under the
wrong label. Provider auditing as a general practice belongs to a neighbouring subject; the
part that belongs here is that a scene must never be populated with a clip of a different
kind than the one it asked for.
