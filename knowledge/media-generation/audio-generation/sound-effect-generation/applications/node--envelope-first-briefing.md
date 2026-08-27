---
layer: application
type: application
subject: sound-effect-generation
technique: envelope-first-briefing
status: forged
stack: node
verified_on: 2026-08-27
verified_against: node@24
---

# Node — an effect seam whose three dials are the envelope doctrine, and whose default is not

`gravitone-gcloud` (branch `main`, 2026-08-27) reaches a text-to-sound-effect
vendor through `app/api/music/sfx/route.ts`, a 33-line gated seam over
`generateSfx` in `lib/music/elevenlabs.ts`. The route takes exactly three
dials beyond the text — `durationSeconds`, `promptInfluence`, `loop` — and
those three are the technique's operative surface: the explicit length, the
adherence trade, and the seam declaration. Nothing else about the sound is
parameterised, because everything else is supposed to be in the words.

## The brief, in code

- **Duration is explicit and asserted before spend** (`generateSfx`): outside
  0.5–30s the call throws `bad-request` and never reaches the vendor, the same
  refuse-before-credit posture `composeMusic` takes on its 3s–120s section
  window one function up. A picture-locked hit gets its exact length or an
  error, not a guess.
- **The four-part description ships as data.** The bench's presets
  (`SFX_PRESETS`, `app/playground/PlaygroundView.tsx`) are written in the
  technique's order — material and action, attack, body, tail, space. The hit
  reads "Massive cinematic impact hit, sharp metallic attack, sub-heavy body,
  short controlled tail, dry"; the boom names its own missing attack ("no
  transient click"); the drone names its own missing event structure ("no
  melody, no rhythm, steady featureless body"). No preset carries a mood word.
- **The adherence dial is doctrine in a comment, not a default.** The lib's
  docstring states it outright — "defaults low vendor-side — tuned for fishing
  — so spec-shaped briefs should pass an explicit high value" — but the seam
  itself omits the field entirely when the caller does not send one
  (`...(req.promptInfluence !== undefined ? { prompt_influence: … } : {})`),
  so the vendor's fishing default stands for any caller that stays quiet. The
  only place the spec posture is actually taken is one UI's initial state:
  `useState(0.7)` in `SfxBench`. A second caller would silently get variety.
- **Refusal stays a state.** A policy decline maps to `MusicError("refused")`
  and the route answers 422 via `statusFor` — the same taxonomy the music path
  uses, arriving on the effects path for free.

## What the live render measured (2026-08-26, n=1)

One effect has been rendered through this seam and recorded: **2.000s briefed,
2.038s delivered** — a 38ms overshoot, comparable to the 32ms the music path
posted on a 10s cue. That is the only witnessed number on this route; it was
read by hand during the seam's own smoke test, on the `hit` preset.

The measurement is not repeatable from inside the tree. `SfxResult` carries
`requestedSeconds` — the value that was *asked for*, echoed back — and nothing
anywhere reads the delivered file's real length. The duration promise is
therefore recorded as a request, never as an observation, which is precisely
the distinction the acceptance craft one subject over exists to enforce.

## What this realization cannot do yet

The shared production world is not restated. Music has `MUSIC_STYLE_BLOCK` in
`app/_studio/score.ts`, four style lines carried onto every cue call by
construction; effects have no equivalent, so each preset retypes its own finish
words ("dry", "cinematic") inline and nothing carries a world across a pass.
Two effects briefed a week apart would arrive from different films and no code
would notice.

Re-briefing the phase that missed is also unimplemented: the bench holds one
textarea and one take, and a wrong tail is fixed by retyping the whole event.
There is no per-phase edit, no take history, no way to hold the attack while
rerolling the body — the technique's central repair move has no surface.

And the seam is declared unportable: `lib/capabilities.ts` marks `musicSfx`
NOT PORTABLE ("no Google Cloud service generates a discrete, exact-duration,
loopable sound effect from a text description"), so in the hosted posture the
three dials do not exist at all and `ABSENCE_REASON.musicSfx` renders the
absence with its remedy instead of a button that fails after you have written
a brief.
