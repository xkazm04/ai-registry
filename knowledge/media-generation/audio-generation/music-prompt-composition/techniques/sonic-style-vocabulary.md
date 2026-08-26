---
layer: technique
type: technique
subject: music-prompt-composition
technique: sonic-style-vocabulary
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [a style directive keeps producing generic results, describing a musical identity in words a generator can act on, an underscore brief returned a singer, keeping one musical identity stable across many cues]
---

# Sonic style vocabulary

A model can only follow style words that name something its training
distribution distinguishes. "Cinematic", "epic", and "emotional" are real
words that distinguish almost nothing — they are the modal request, and they
return the modal answer. A style directive that works is **layered**: it
names the style along several independent axes at once, each axis in
concrete vocabulary, and it states the fence on both sides — what to
include, and what to exclude.

## The axes

| Axis | What it names | Concrete examples of the register |
|---|---|---|
| Genre and era | the tradition the piece sits in | "1980s synth-pop", "delta blues", "baroque chamber" |
| Mood and energy | the emotional temperature and its wattage | "brooding", "triumphant", "coiled", "weightless" |
| Instrumentation | what is actually playing | "solo cello over tape hiss", "driving drum machine, analog bass" |
| Production character | how it is recorded and finished | "lo-fi", "polished studio", "live room", "crushed drums" |
| Motion | tempo feel and rhythmic posture | "half-time", "four-on-the-floor", "rubato", "relentless eighth-notes" |

One directive per axis beats five synonyms on one axis. "Epic epic epic" is
one layer shouted; "slow-building orchestral, low brass and taiko,
restrained until the final third, modern trailer production" is four layers
stated once each — and each layer independently narrows the space.

## The exclude list is the fence you cannot see past

Generation drifts toward the center of the distribution, and the center is
full of things the brief never asked for: vocals appearing in underscore,
a backbeat appearing under chamber strings, a fade-out appearing where the
picture needs a hard end. The include list steers; the **exclude list
fences** — and it is the only control on the side of the space you did not
think to describe. Standing excludes worth writing by default:

- vocals, for any underscore brief (and say "instrumental" positively too —
  redundancy is cheap, a singer is not);
- fade-out endings, for anything that must cut to picture;
- the genre's own clichés when they would collide with the picture (the
  four-chord loop, the drop, the gospel choir on the final chorus).

## Identity is restated, not remembered

Across many cues in one production, the musical identity is a **style
block** — the layered vocabulary above, written once, kept as an artifact,
and restated in full in every cue's brief. This is the bundle's restatement
law in its audio form, and the image discipline transfers whole: there is
no short form, no call may opt out, and per-cue direction (this cue lifts,
this one thins to a pulse) rides *beside* the block, never replaces it. A
production whose cues were each described fresh has as many musical
identities as cues.

## Decision rules

- When a result is generic, add axes before adding adjectives — the miss
  usually means an axis was left to the model, not that an axis was
  understated.
- When a result contains something never asked for, extend the exclude
  list and keep the include list unchanged, because the include side was
  not what failed.
- When two cues in one production must sound related, diff their briefs:
  everything outside the shared style block should be the only difference.

## When not to use this

Style vocabulary steers identity; it cannot carry structure ("builds for
exactly forty seconds" is a plan property, not a style) and it cannot carry
pitch-level intent (a specific melody, a specific chord change — those are
reference or notation territory, and words will not land them).
