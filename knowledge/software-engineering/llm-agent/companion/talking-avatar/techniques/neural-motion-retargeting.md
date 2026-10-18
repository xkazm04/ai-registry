---
layer: technique
type: technique
subject: talking-avatar
technique: neural-motion-retargeting
status: forged
laws: [derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [driving a rig with motion predicted by an audio-to-motion model, a model's motion output has no named channels, learned head motion looks busy or blinks too often]
---

# Neural motion retargeting

## The concern

Audio-to-motion models predict motion in their own space — often implicit
keypoint offsets or a latent with no semantic names — tuned for their own
renderer. A rig speaks a different language: degrees, lid closure, brow raise.
Retargeting is the translation, plus the filtering and character-specific
scaling that turn what the model predicts into what a viewer believes. It is
also where the model's offline nature gets dealt with honestly.

## Decoding an unnamed motion space

When the model's output has no names, do not reverse-engineer them by eye. Fit a
decoder once:

1. **Render the model's motion onto a carrier face** through the model's own
   renderer, expression only. Leave head pose out of this render: pose confounds
   expression measurements, and pose is usually available as named angles anyway.
2. **Measure the rendered video with a face tracker** that outputs the channels
   the rig needs (blink, brow, jaw, gaze).
3. **Fit a linear map** from the motion coefficients to each channel, and validate
   it **leave-one-clip-out**, never in-sample.

After that, decoding is a matrix multiply that needs no accelerator and no
render. The decoder, its training clips and its fitting command are kept
together so it can be refitted when the model changes
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

Two traps: **a renderer that applies motion relative to the clip's first frame**
gives every clip its own offset — in-sample fit looks fine and held-out fit goes
negative; prepend a fixed anchor frame (a dataset-mean pose) to every
calibration render. And **a channel whose held-out fit is weak** (gaze is the
usual one) is reported weak and filled from procedural motion rather than played.

## Filtering and scaling

- **Low-pass head pose around 2 Hz, zero-phase.** Raw predicted pose bobs at
  syllable rate, and a head that moves with every syllable reads as busy.
  Resample to the render rate after filtering.
- **Centre each channel** on the clip's median so a model's resting bias does not
  become a permanent tilt.
- **Map signs and axes to the rig's convention** explicitly, measured, not assumed.
- **Do not map predicted lid events one-to-one onto blinks.** Learned lid signals
  are often partial drops at about one per second; played as blinks they produce
  rates far beyond human. Keep the continuous partial curve, capped, and place
  crisp full blinks only on the strongest peaks with a minimum spacing. Take the
  blink's *timing* from the model and re-synthesise its *shape* at the render
  rate: a closure of about a hundred milliseconds does not survive a motion rate
  of twenty-five frames a second.
- **Ease in over the first half second** — sequence models often start with a
  transient.
- **Keep a retarget profile per character**: head scale, lid cap, gesture scale.
  A stylised form whose eyes switch crisply between lit and dark needs a much
  lower partial-lid cap than a soft eye, or every partial drop crosses the switch
  and reads as a blink.

## What the model does not give you

Take mouth shape from the speech timeline, not from the motion model; take
text-level gestures (the question tilt) from the text. Audio-only motion models
rarely produce gestures that depend on meaning, and their coupling to the
loudness envelope is often no better than procedural motion's — what they buy is
natural, non-repeating drift with beat-like nods, and that is what they should be
used for. The model's jaw is still worth something, as **emphasis rather than
opening**: normalise it to a mean of one over the speech span and let it scale the
timeline's opening part-way, so the timeline keeps the average opening and the
network only redistributes it toward stressed syllables.

## Latency is a property of the model, not the pipeline

A model that analyses fixed audio windows cannot emit motion before a window has
been heard: its window length is a latency floor. When that floor is seconds,
the model is an offline source — run it per utterance ahead of playback where
speech is synthesised before it is spoken, and let procedural motion play
everything else. State this in the route verdict; a hybrid whose playback is
light but whose motion needs an accelerator and seconds per window is not yet a
live, accelerator-free path, and saying otherwise is reporting the cheap half as
the whole ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## When not to use this

When the rig's procedural motion already satisfies the person judging it on the
real art, the decoder, the model and its runtime are cost without return. Run
the blinded comparison before building the retargeting pipeline into a product.
