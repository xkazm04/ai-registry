---
layer: technique
type: technique
subject: sound-effect-generation
status: forged
technique: picture-as-timing-brief
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [an effect must land in sync with picture, deciding between text-briefed generation plus manual spotting and video-conditioned generation, scoping what a synced generator can and cannot replace]
---

# Picture as timing brief

The concern: an effect that must land *on* picture — a footstep, an
impact, a door — has two jobs, timing and character, and the corpus's
text-briefed techniques carry both in words. Video-conditioned generation
splits the channels: **the picture is the timing brief** (the model
aligns generated audio to frames), and text, where given, steers only
what the sound *is*. A hard-synced effect then needs no verbal timing
description and no manual spotting pass — the sync is solved upstream,
per clip, at generation time.

## Channel discipline

- **Video owns timing; text owns semantics.** Write the text brief as
  concept naming ("heavy boots on gravel"), not as an envelope or a
  timeline — timing words in the text channel are instructions the
  mechanism does not read. Conflict behavior between the channels is
  typically unstated by these models: treat text as steering, never as
  overriding sync, and verify.
- **The envelope brief still exists** — one subject over: when there is
  no picture, or the picture does not carry the event's timing (off-screen
  sources, anticipatory sound), the text-briefed envelope techniques are
  the instrument, and this one has nothing to align to.

## Scope marks — what stays manual

- **Window limits.** Current synced generators train on short fixed
  windows (single-digit seconds); quality degrades on large deviations.
  Long material is generated per-event or per-shot, not per-scene.
- **One mixed track, no stems.** The output is a single rendered mix per
  clip; layered design — weight, definition and size assembled from
  separate elements — and the effects pass of a full cut remain manual
  crafts on top of generated elements, not inside the generator.
- **Known failure classes** for the acceptance listen: unintelligible
  speech-like vocalizations, spontaneous low-quality background music,
  and unfamiliar-concept misses where a general category renders but a
  specific variant does not. Sync being solved does not make the sound
  right — grade character with the same defect discipline as any
  generated audio.

## When not to use this

Anything whose timing the picture does not determine: music (spotting is
a creative decision), narration, off-screen ambience. And check the
license class of a research-grade model before it touches commercial
delivery — synced-generation releases commonly ship non-commercial
weights, which is a production-ops fact, not a craft one.
