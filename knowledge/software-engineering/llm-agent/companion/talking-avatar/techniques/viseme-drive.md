---
layer: technique
type: technique
subject: talking-avatar
technique: viseme-drive
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [making a mouth or speaking element follow synthesized speech, lip-sync reads as dubbed or as flapping, the speaking element is not a mouth]
---

# Viseme drive

## The concern

A speaking face has to agree with the voice on three things at once: **when**
each sound happens, **what shape** the mouth takes for it, and **how hard** it is
said. Loudness alone gives the third and fakes the first; it flaps on every
syllable and never closes on a /p/. A shape library alone gives the second and
looks dubbed if the timing is off. The drive takes timing from the synthesizer's
per-sound timeline, shape from a mapping of sounds to visible mouth shapes, and
emphasis from the loudness envelope, in that order of authority.

Where the timeline comes from — the engine's own durations, the correction of
its lead, the per-sentence event in sample offsets — is the voice side's
[speech-timing timeline](../../../runtime-and-io/voice-io/techniques/speech-timing-timeline.md). This technique starts where that timeline arrives.

## Sounds to shapes

Use a closed set of about fifteen visible shapes — silence, lip closure (p b m),
lip-to-teeth (f v), tongue-between-teeth, tongue-tip, back-of-tongue, the
post-alveolar group, sibilants, nasal and lateral, the r-colour, and five vowel
families from open to rounded. The mapping rules that make it read:

- **Diphthongs are two shapes**, split roughly sixty-forty, not one.
- **An aspirate takes the next sound's shape**: the mouth is already forming the
  vowel while the breath is heard.
- **A short silence right before a closure joins the closure**, because the lips
  are closing during a stop's silent hold and an /f/'s quiet hiss.
- **A voiced word boundary inside connected speech is split between its
  neighbours**, not turned into silence — there is no mouth closure between
  words in running speech.
- **Merge segments shorter than a frame or two into a neighbour — except
  closures.** Lip closures and lip-to-teeth contacts last 25-50 ms and are the
  one shape the eye checks against the audio. They are never merged away; they
  grow to the minimum by borrowing time from neighbours that can spare it.
- **Unknown sounds fall back to a neutral mid vowel and are counted**, not
  silently dropped ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Shapes to motion

Shapes are targets, not frames. Blend toward each target with a short attack and
let the previous shape decay into it (coarticulation): the rounding of an
upcoming /u/ starts before it. Scale each syllable's opening by the loudness
envelope, normalised to a high percentile of the line, so stressed syllables open
wider and quiet ones barely part.

**Lead, never lag.** Viewers tolerate sound arriving late far more than sound
arriving early, because in nature sound never precedes its source; broadcast
detectability is around 45 ms of audio lead against about 125 ms of audio lag. So
a renderer looks up the shape at the playback position plus the device's output
latency, and may lead by about one frame. The producer reports true times; the
renderer owns the lead.

## The mouth itself

**Build it parametrically from the image's own pixels.** Split the lips at the
parting line into two layers, drop the lower lip and jaw by a field, and draw a
procedural interior between them — throat, tongue, teeth sized from the opening.
Scale the maximum opening per art style: a drawn mouth reads right at a far
larger opening (a third of the mouth's width) than a painted one (a fifth), and
one value is cartoonish on one or invisible on the other. Inset the interior a
little and taper its centre band so its corners never poke past the lips.

Generated mouth frames are the tempting alternative and a poor one: an inpainting
model's prior restores the resting mouth, redraws the lips per frame, and leaves
seams at the mask edge, and even good frames can only be cross-faded.

## Speaking elements that are not mouths

A non-human form speaks through whatever the design gave it — a seam of light,
an aperture, a hinge, a core. Drive it from the same three inputs: opening from
the timeline, closures as visible dips, emphasis from loudness. Brightness for a
seam, angle for a hinge with light in the slit, radius for a core. A ripple that
travels outward from the speaking element at a fixed wave speed lets loudness
history, not just the current level, show on the rest of the form. A speaking
element without dips on closures reads as a level meter, not as speech.

## When not to use this

When the voice backend produces no timeline, do not invent one from text; fall
back to a loudness-driven opening and say so in the state, and keep the closures
honest by not drawing shapes you cannot time. A level-following glow is a fine
presence; a mouth with guessed shapes is worse than none.
