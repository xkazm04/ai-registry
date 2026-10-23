---
layer: technique
type: technique
subject: talking-avatar
technique: neural-motion-retargeting
status: forged
laws: [derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [driving a rig with motion predicted by an audio-to-motion model, a model's motion output has no named channels, learned head motion looks busy or blinks too often, speeding up or distilling a sampling motion model]
---

# Neural motion retargeting

## The concern

Audio-to-motion models predict motion in their own space — often implicit
keypoint offsets or a latent with no semantic names — tuned for their own
renderer. A rig speaks a different language: degrees, lid closure, brow raise.
Retargeting is the translation, plus the filtering and character-specific
scaling that turn what the model predicts into what a viewer believes. It is
also where the model's analysis window gets placed honestly: against the
synthesizer's unit of output, not against the clock of a conversation.

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

- **Low-pass head pose around 2 Hz, zero-phase.** Raw predicted pose bobs with
  the rhythm of the speech, and a head that moves on every beat reads as busy.
  The cut is a design choice, not nature's limit: natural head motion in
  conversation runs up to several hertz, and 2 Hz keeps only its slow band, so
  let the quick nods it removes come from text-driven gestures rather than
  from the model. Resample to the render rate after filtering.
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

## The window bounds latency only where audio is streamed

A model that analyses fixed audio windows cannot emit motion before a window has
been heard, and it is tempting to read that window length as a latency floor
under any live use. It is a floor only when the audio reaches the model as it
is produced. Many synthesizers render a whole sentence before any of it plays,
and a voice pipeline worth having renders sentence n+1 while sentence n plays.
Then the model never waits for audio: the whole sentence exists when its motion
is asked for, and the time that matters is **compute per sentence against the
playback time of the sentence before it**.

- **When the synthesizer renders whole sentences before playback,** compute
  motion per finished sentence while the previous one plays, and send it to the
  face as soon as it is ready, timed in the audio's own clock. The first
  sentence of a line is the only one with nothing playing in front of it; let
  it start on procedural motion and cross-fade the learned track in when it
  lands, rather than delay the first audio for motion. Never hold the audio for
  motion; the mouth timeline, which is cheap, is the only face artifact worth a
  short, bounded wait before a sentence plays.
- **When the audio is streamed** (the synthesizer emits samples before the
  sentence is complete), the window is a real floor: motion for any instant
  arrives at least one window after it is heard. Then the model can drive only
  speech rendered ahead of playback, and procedural motion plays the rest.
- **Report the three numbers that decide it:** motion compute per sentence
  against the sentence's own length, the delay the face adds to the first audio,
  and how many sentences' motion arrived while that sentence was still being
  heard. A track that lands after its sentence ended is not late, it is lost;
  count it as such.

In both cases name the accelerator the motion model needs and whether it runs
anywhere without one. A hybrid whose playback is light but whose motion needs an
accelerator is not yet an accelerator-free path, and saying otherwise is
reporting the cheap half as the whole
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Making the motion source cheaper

The motion model is usually the one part of a hybrid that needs an accelerator,
and the cheapest way to widen where it runs is to make it cheaper, not to find a
bigger machine. Two families of change, one yardstick.

**The yardstick is the model against itself.** A sampling model (diffusion,
anything seeded) does not have one right answer: two seeds of the unchanged model
disagree by a measurable amount on the same audio. Measure that gap first — head
error in degrees, per-channel correlation, amplitude ratio, blink onsets matched
within a short tolerance — on held-out sentences, after the retarget, because the
retarget is what the viewer sees. A faster variant or a distilled student is
judged by how far it sits beyond that gap, with a no-motion reference beside it
for scale. A variant at the gap is another sample of the teacher; a variant near
no-motion is not motion. Report amplitude separately: a variant can track the
teacher's timing and still damp it, and a damped channel can be restored with a
gain in the retarget, which a wrong-timed one cannot.

**Cheap changes inside the model come first.** Profile the stages: in a diffusion
motion model the denoising loop is typically most of the CPU time and the audio
encoder a tenth. A model trained to predict the clean sample can be sampled with
a few deterministic steps instead of its full schedule without retraining;
fewer steps cost amplitude before they cost timing, so pick the count by the
yardstick, not by speed. Do not load the parts of a release the motion path
never calls (a bundled renderer is the usual one). Export the networks to a graph
runtime and check it against the original on identical inputs before trusting
its speed. Reduced-precision modes are measured, not assumed: on a CPU they can
be slower.

**Distilling the model, when the cheap changes are not enough.** A small causal
sequence model trained on the teacher's outputs can replace the expensive loop.
Three choices decide whether it learns anything:

- **Keep an audio encoder of the teacher's kind** and train on its features
  (the teacher's own, or a permissively licensed one of the same family when the
  teacher's carries a licence or data risk — the student keeps whatever encoder
  it is trained on). A student fed
  generic spectral features has to rediscover what the encoder already knew and
  tends to regress to the mean — near-zero correlation and a tenth of the
  amplitude, no better than no motion.
- **Train on whole sequences from their start**, not on random crops. A model
  that generates fixed windows produces a track that depends on where each window
  starts; a crop teaches the student a different problem from the one it will be
  asked.
- **Target only the channels the retarget reads** — the pose and the few decoded
  projections — and rebuild anything else from them (a decoder matrix's
  pseudo-inverse rebuilds a full expression vector from its projections), so the
  shipped retarget runs unchanged and the evaluation is the product's own output.

Changing those three turned a student whose head correlation with the teacher
was 0.1-0.3 into one at 0.75-0.87, with blink timing matching the teacher as well
as two teacher seeds match each other — with the teacher's own encoder; a
swapped encoder is a new student and is judged afresh by the same yardstick. A student that overfits quickly is short
of teacher data, which a teacher can generate for the cost of running it. The
student is not finished until a person has compared it with the teacher on the
product's real art; the numbers bound it, the eye accepts it.

## When not to use this

When the rig's procedural motion already satisfies the person judging it on the
real art, the decoder, the model and its runtime are cost without return. Run
the blinded comparison before building the retargeting pipeline into a product.
