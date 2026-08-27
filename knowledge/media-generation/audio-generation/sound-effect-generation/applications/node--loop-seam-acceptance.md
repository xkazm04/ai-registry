---
layer: application
type: application
subject: sound-effect-generation
technique: loop-seam-acceptance
status: forged
stack: node
verified_on: 2026-08-27
verified_against: node@24
---

# Node — loop intent declared at generation, and a seam test that is an instruction

`gravitone-gcloud` (branch `main`, 2026-08-27) wires loop intent end to end and
tests the seam by asking a human to listen. Both halves are worth recording:
the declaration is real code, the acceptance is real doctrine with no
instrument under it.

## Declared at generation

The flag travels the whole seam without being interpreted anywhere:
`app/playground/PlaygroundView.tsx` holds a checkbox, `lib/musicClient.ts`
posts `loop`, `app/api/music/sfx/route.ts` admits it only if
`typeof body.loop === "boolean"`, and `generateSfx` forwards it to the vendor
— omitted entirely when undefined, so a caller that says nothing gets the
vendor's own default rather than this tree's opinion of it. Loop intent is a
request property here, never a post-hoc rescue, which is the technique's first
rule realized at the cheapest possible cost.

The brief changes with the flag, too, and that is encoded rather than
remembered. `drone` is the only preset in `SFX_PRESETS` with `loop: true`, and
it is also the only one whose text forbids features: "no melody, no rhythm,
steady featureless body". Every other preset is an event with an attack. The
enemy of a loop is a feature, written into the one brief that loops.

## Tested at the seam, as an instruction

The bench plays the take back through `<audio controls src={url} loop={loop}>`
— the element repeats when the take was generated to repeat, so the joint is
audible by default rather than by setup — and prints, only in the loop case:

> "player set to loop — listen across the joint at least twice; a seam
> inaudible once is a metronome by the tenth pass"

That is the acceptance check placed where the take lands, at the moment the
listener is deciding. It is also the whole of it. Nothing reads the audio.

## What is unmeasured, and what that costs

- **No instrument at the joint.** No level check, no spectral comparison
  across the seam, no crossfade fallback — the repair the technique offers for
  a body that is otherwise right has no implementation, so the only outcomes
  in this tree are accept and re-roll.
- **No repeat-count-to-use test.** The bench has no cut, no scene duration and
  no timeline, so the drone's 20s cannot be tested at the four passes a
  90-second scene would demand. The listen is one boutique audition, which the
  technique names as the failing form.
- **Loop is wired but unwitnessed.** The single live effect on record
  (2026-08-26) is the 2s non-looping `hit`: 2.000s briefed, 2.038s delivered.
  `loop: true` has never been observed returning a joint that held, so this
  application asserts the plumbing and nothing about the vendor's seam quality.
  A version bump on `eleven_text_to_sound_v2` would be undetectable here.
- **No refusal shape for un-loopable material.** `loop` is a passthrough
  boolean: a directionally-evolving brief ("building wind") with the flag set
  is accepted by the route and the lib without complaint, and the honest
  outcomes — the static re-brief, or a linear deliverable long enough for the
  scene — have no place to be chosen, because that choice is a spotting
  decision and there is no spotting surface for effects. The taxonomy to hold
  such a refusal already exists (`MusicErrorKind`, with `refused` mapping to
  422 in `lib/music/errors.ts`); it has no member for "this material has no
  honest joint", and inventing one would be a claim the tree cannot yet check.

The gap that governs all four: the acceptance craft in this repo already knows
how to measure delivered audio — the music path's duration was verified with
`ffprobe` by hand at 10.032s against a 10.000s brief. None of that reaches the
effects path, where `SfxResult` returns `requestedSeconds` and stops.
