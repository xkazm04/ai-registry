---
layer: application
type: application
subject: sound-effect-generation
technique: trailer-punctuation-grammar
status: forged
stack: node
verified_on: 2026-08-27
verified_against: node@24
---

# Node — the vocabulary shipped as presets, with nowhere to place it

`gravitone-gcloud` (branch `main`, 2026-08-27) carries the punctuation
vocabulary as executable data and the placement half not at all. This is worth
writing down in that shape, because a half-realization is the honest state of
most effects work: the words are cheap and the spotting is not.

## The vocabulary, as code

`SFX_PRESETS` in `app/playground/PlaygroundView.tsx` is five of the grammar's
six elements, each a text brief plus the duration its causal work implies:

| Preset | Briefed length | What the brief encodes |
|---|---|---|
| `whoosh` | 1.5s | "soft attack, strong stereo motion left to right, clean tail" — carries, and gets out |
| `hit` | 2s | sharp metallic attack, sub-heavy body, "short controlled tail" — punctuates without smearing the next beat |
| `boom` | 4s | "slow decay, felt more than heard, no transient click" — weights after the hit rather than competing with it |
| `riser` | 6s | "swelling from silence to a sharp cutoff" — the promise names its own resolution inside the brief |
| `drone` | 20s, looped | "no melody, no rhythm, steady featureless body" — holds, and is the only preset that repeats |

The lengths are the finding. Nobody wrote a duration table; each element's
seconds fall out of what it does in a cut, and they order themselves the way
the grammar does — carry shortest, hold longest. The riser is the sharpest
case: its brief ends the sound *at* the cutoff, so the element cannot be
generated without deciding where its promise lands.

**Missing: the cutoff / tape stop.** The one element whose ending *is* the
sound has no preset, which is consistent — it is the only element in the
vocabulary that is defined by the silence after it, and this tree has no cut
in which a silence could be spotted.

## Placement does not exist, and the gap is structural

Nothing in this tree attaches an effect to a beat, and the types say so:

- `TrackId` is `"video" | "vo" | "music"` (`app/_studio/projectTypes.ts`).
  There is no effects lane, and `ScoreSpotting.tsx` renders picture, voice and
  a music lane against the same ruler.
- `Cue` carries `bpm` — it is a music cue by construction, and an effect has
  no tempo to put in it.
- `/api/music/sfx` has exactly one caller in the tree: `generateSfx` in
  `lib/musicClient.ts`, called from the bench. The Score phase renders its cues
  through `/api/music/generate` and never touches the effects seam.

The structural marks the grammar would attach to are already built, one phase
upstream: `TrailerBeatKind` in `app/_phases/script/trailer/types.ts` is a
closed union of `cold-open | stakes | rung | reset | peak | title | button |
cta`, each documented against the doctrine that named it. The turn, the reveal
and the title all exist as typed beats. No code connects them to a sound.

So the density budget is unmeasurable here for the reason that makes it moot:
nothing counts effects per act because nothing places effects at all. A pass
whose failure tell is uniform density cannot fail that way when the pass does
not exist.

## What has actually been rendered (2026-08-26)

One element, once: the `hit` preset, live through the seam, 2.000s briefed and
2.038s delivered. The other four presets are written and unrendered as of this
date. The vocabulary is therefore a menu with one witnessed entry — enough to
prove the seam executes an envelope brief, not enough to claim the grammar was
exercised.

## What this realization cannot do yet

The bench is temporary by its own declaration — its commit says to remove the
page "when the Score phase has absorbed what the bench was built to learn."
Until that absorption, this application records a vocabulary held in a UI's
constant table rather than in the pipeline: no effects lane, no per-beat
attachment, no re-derivation of placements when a cut retimes, and no library
of kept elements (the bench's `url` state holds one take and the previous one
is dropped, so the "six risers of different lengths" a production would build
once cannot survive a second click).
