---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: occlusion-to-volume-and-filter
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [a wall between listener and source must be audible, walls currently sound like distance, choosing occlusion levels for room types]
---

# Occlusion to volume and filter

## The concern

A barrier between a source and a listener changes the sound in two ways at once, and
modelling only one of them is instantly identifiable as wrong. Mass attenuates, and it
attenuates *unevenly*: low frequencies pass through and diffract around a wall far more
readily than high ones. So an occluded sound is quieter **and** duller. Move only the
volume and the ear hears a smaller sound nearby; move only the filter and the ear hears
a large sound that refuses to get quieter. Every occlusion level is therefore one row
carrying both numbers, resolved from one table.

## The ladder

Five ordered levels are enough, and an ordered ladder is better than a continuous 0-1
value at authoring time because designers can reason about "one step more occluded".
A working set — volume as a linear multiplier, cutoff as the corner frequency of a
low-pass filter in hertz:

| Level | Volume multiplier | Low-pass cutoff |
| --- | --- | --- |
| none | 1.00 | 20 000 Hz |
| low | 0.85 | 12 000 Hz |
| medium | 0.60 | 5 000 Hz |
| high | 0.35 | 2 000 Hz |
| full | 0.10 | 500 Hz |

Note the shape: volume falls roughly linearly across the ladder while cutoff falls by
something closer to a constant ratio per step, because frequency is perceived
logarithmically. A cutoff ladder that stepped linearly in hertz would sound like nothing
happening for three steps and then everything happening at once.

Note also that `none` is 20 kHz rather than "filter bypassed". Writing the neutral case
as an explicit value in the same units keeps one authority for the quantity
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)) and means
interpolation between `none` and `low` is arithmetic rather than a special case. Both
columns carry their basis — a multiplier against unattenuated level, a corner frequency
in hertz — because "0.35" and "2000" handed on bare are a decibel value and a millisecond
value to somebody
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Occlusion versus obstruction

They are different phenomena and want different treatment:

- **Occlusion**: the direct path *and* the reflected paths are blocked. Sound reaches the
  listener only through the barrier. Attenuate and filter everything — direct and wet.
- **Obstruction**: the direct path is blocked but the space is shared, so reflections
  still arrive freely. A voice around a corner, a machine behind a pillar. Attenuate and
  filter the **direct** signal only, and leave the reverb send alone.

The difference is audible and it is a gameplay signal. An obstructed sound stays present
and locatable-ish — the player knows something is close, just not in line of sight. An
occluded sound is elsewhere. Collapse the two and you have removed a player's ability to
distinguish "around this corner" from "behind that wall", which in any game with audible
opponents is a mechanic, not a nicety.

## Rules for applying it

- **Interpolate, never switch.** Glide both parameters over a short window — of the order
  of a tenth of a second — when the occlusion state changes. A stepped cutoff produces an
  audible zip on every doorway transit.
- **Add hysteresis at the threshold.** A listener standing in a doorway must not
  oscillate between two states. Require the raycast result to hold for a few frames, or
  use different thresholds for entering and leaving a state.
- **Budget the tests.** Occlusion checking costs per active emitter per update. Give the
  nearest and highest-priority emitters real geometry tests; give the rest their zone's
  default level, unchanged. Nobody has ever noticed a distant ambient loop's occlusion
  being approximate.
- **Do not let occlusion silence a critical sound.** A class marked critical — a boss
  telegraph, a death cue — floors its occlusion at a level that still reads. If the design
  needs the cue heard through a wall, the cue is not subject to the wall.
- **Occlusion multiplies with distance attenuation; it does not replace it.** Two separate
  systems, two separate values, composed. A source that is both far and occluded is
  legitimately near-inaudible, and that is correct.

## When not to use this

- **When the runtime does path-based acoustics.** If the engine traces actual sound paths
  through portals, a per-zone level is a coarse fallback for far emitters, not the model.
- **For positionless classes.** Interface, narration and music have no geometry between
  them and the listener; occlusion must not apply to them at all.
- **For sub-bass-dominant sources**, where the barrier's real behaviour is that almost
  everything passes through. A distant explosion behind a wall loses its crack and keeps
  its thump; a flat volume multiplier on the ladder gets this wrong, and the fix is a
  per-class exemption rather than a finer ladder.
