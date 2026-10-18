---
layer: technique
type: technique
subject: talking-avatar
technique: procedural-presence-motion
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [an avatar looks frozen or restless between utterances, choosing blink timing and idle amplitude for a character, a gesture should come from the text rather than the audio]
---

# Procedural presence motion

## The concern

Most of the time an avatar is not speaking. It is idle, listening, or thinking,
and for those states there is no audio to drive anything — and for a live
product there is often no time to run a motion model either. Procedural motion
is what the face does when nothing else is telling it what to do, and it is also
the fallback when anything else fails. It is generated from a seed and the text,
costs nothing, starts instantly, and is the motion the viewer sees most.

## The components

- **Breath.** A slow rise and fall of the body and a slight lift of the head,
  around a quarter of a hertz, owned by the renderer. It is the cheapest signal
  that the presence is on.
- **Drift.** Head yaw, pitch and roll as layered low-frequency noise with
  different periods per axis, not a stack of sines — sines repeat visibly within
  a minute. Use roll; heads that only yaw and pitch look mounted on a pole.
  Ease every start; a motion that begins at full velocity reads as a twitch.
- **Blinks.** Full blinks with an asymmetric shape — a fast close (around 75 ms),
  a short hold (around 35 ms), a slower open (around 170 ms) — at a believable
  rate with a minimum spacing, an occasional double, and placement biased toward
  phrase ends and gaze shifts rather than mid-word. Partial lid drops are a
  separate, smaller channel; they are not blinks and must not be counted as such.
- **Saccades.** Gaze jumps quickly and then holds; a gaze that drifts smoothly
  reads as unfocused. Hold for between half a second and a few seconds, return
  toward the viewer most of the time.
- **Gestures from the text.** The tilt and brow lift at the end of a question,
  a small nod on a stressed syllable, a settle at the end of an utterance. These
  come from the text and the timeline, not the audio; audio-only motion models do
  not produce them reliably, so they are worth layering on top of learned motion
  too. Gestures interact: a nod landing just after a question's tilt reads as
  nervous, so suppress beat nods in the last moment of a question.

## Amplitude is character

There is no correct amplitude, only one that suits the character. A calm,
watchful presence moves less and parks between gestures; stillness is part of the
performance and a constant drift reads as restless. A form whose art already
moves on its own — shimmering strands, floating parts — needs less head motion
on top, because the eye adds the two together. A stiff, solid form benefits from
more continuous drift because nothing else on it moves. Expose one global motion
scale and set it per character after watching it next to its own idle art, not
in isolation.

## Living inside a host

The procedural generator runs inside the host's motion rules, not its own. It
is a pure function of time and seed that the host's one scheduler samples; it
owns no loop and allocates nothing per frame. Under a calm or reduced-motion
preference the renderer draws one still frame and requests none after it, and on
resume physics (springs, breath phase) restart from rest rather than jumping the
elapsed interval. Timers, loops and listeners it creates are reaped with it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)), because a
presence never unmounts and a leaked loop costs forever.

## Settling at rest is a trade-off, not a free win

A host that forbids frames when nothing moves pushes the presence toward a
**settle**: after its last state change and a short linger, every motion eases to
zero, the renderer holds its rest frame, and nothing is drawn until a new signal
wakes it. That buys an idle cost of zero — no frame loop, no wakeups, no battery —
and it costs exactly what this technique warns about: a presence at rest becomes
a photograph, with no breath to say it is on. Neither answer is correct in
general. Make it a stated choice with its cost written next to it (frames per
second and power while idle with perpetual breath, against zero), decided by the
person who owns how the presence should feel, and leave it switchable rather than
buried in a constant. Settling must still be complete: a pending blink, a nod or
a fading learned track keeps the presence awake until it has played out, so the
still frame is a rest pose and not a frozen mid-gesture.

## Decision rules

- **When learned motion is available for an utterance,** use it for drift, lids
  and brows, and keep procedural saccades, text gestures and idle; blend at the
  parameter seam so the handover is invisible.
- **When learned motion is not available in time,** procedural motion plays the
  utterance; it is the live path, not a degraded one.
- **When a motion metric is reported** (blinks per minute, head speed, jerk,
  nods on stressed syllables), report it per seed and over several seeds; one
  seed's blink count is an anecdote.

## When not to use this

When the product only plays pre-rendered clips of a neural model, idle motion is
in the clips. Even then, keep a procedural still-plus-breath for the moment the
clip library does not cover.
