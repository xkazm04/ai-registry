---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: reverb-parameter-tables
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [every space in the game sounds like the same reverb at different lengths, defining a reverb preset set, tuning a room to read as a specific place]
---

# Reverb parameter tables

## The concern

A named preset — "cave", "hall", "corridor" — is a label until it resolves to numbers.
The technique is to keep one table where each preset name maps to a full parameter set,
so the name is the only thing that travels through the rest of the pipeline and the
numbers have exactly one home
([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).

## The six parameters and what each one is for

| Parameter | Perceptual role | Unit |
| --- | --- | --- |
| Decay time | apparent size and reflectivity of the space | seconds |
| Diffusion | how smeared the echoes are — surface irregularity | 0-1 |
| Density | echoes per unit time in the late field — enclosure complexity | 0-1 |
| Wet/dry mix | how deep inside the space the listener stands | 0-1 |
| Early delay | distance to the nearest reflecting surface | seconds |
| Late delay | onset of the diffuse tail — overall scale | seconds |

Each is a real number with a real unit. Decay in seconds and the two delays in seconds
must never be handed on bare, because milliseconds is the other plausible reading and a
factor of a thousand in an early delay is the difference between a room and a canyon
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).

## A preset set that covers a game

Nine presets, including an explicit null, cover most of what a level needs. Values that
work as a starting set — decay in seconds, delays in seconds, the rest normalised:

| Preset | Decay | Diffusion | Density | Wet/dry | Early | Late |
| --- | --- | --- | --- | --- | --- | --- |
| none | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| small room | 0.8 | 0.7 | 0.8 | 0.30 | 0.005 | 0.012 |
| large hall | 2.5 | 0.9 | 0.6 | 0.50 | 0.020 | 0.040 |
| cave | 3.5 | 0.5 | 0.9 | 0.60 | 0.030 | 0.060 |
| outdoor | 0.3 | 1.0 | 0.2 | 0.15 | 0.001 | 0.005 |
| underwater | 4.0 | 0.3 | 1.0 | 0.80 | 0.040 | 0.080 |
| metal corridor | 1.8 | 0.4 | 0.7 | 0.45 | 0.008 | 0.020 |
| stone chamber | 2.2 | 0.6 | 0.85 | 0.50 | 0.015 | 0.035 |
| forest | 0.6 | 0.95 | 0.3 | 0.20 | 0.002 | 0.008 |

Read the table as arguments, not as data. Cave and hall differ mostly in *diffusion*:
the cave's rock gives discrete, identifiable slapback (low diffusion, high density); the
hall's treated surfaces give a smooth tail (high diffusion, lower density). The metal
corridor is the low-diffusion extreme with a short-to-medium decay — that is what makes
it read as narrow and hard rather than as a small hall. Outdoor and forest are the
important pair: both are *not dry*. Outdoor has a very short decay, maximum diffusion,
minimal density and a low wet mix — the sound of energy leaving and never coming back.
Model outdoors as reverb-off and the world sounds like a recording booth.

## Decision rules

- **Decay sets size. Diffusion sets material. Density sets complexity.** If two presets
  differ only in decay, one of them is not a place.
- **Early delay is the strongest near-surface cue.** Raise it and the nearest wall moves
  away, independent of decay. This is the parameter to reach for when a space is the
  right size but feels claustrophobic.
- **Wet/dry belongs to the zone as much as to the preset.** A preset's wet mix is the
  value for a listener well inside the space; blend it down toward dry near a zone's
  boundary rather than switching at it.
- **Keep an explicit `none`, all zeros.** A zone with no reverb must be a stated choice
  in the same vocabulary, so "no reverb here" and "reverb never got assigned here" are
  different values.
- **A `custom` row exists and is mid-scale on everything.** It is the escape hatch for a
  hand-tuned space, and its neutral defaults are deliberate: a custom preset nobody
  finished tuning should sound unremarkable, not broken.

## Extending the set

Add a preset when a space is genuinely a new *material or topology* — a wooden interior,
a glass atrium, a tunnel with running water. Do not add one because an existing preset
needs a slightly different length; that is a per-zone decay override. Ten to fifteen
presets is a healthy ceiling for a single game: beyond that, designers stop being able to
hold the set in their heads and start picking by name similarity.

## When not to use this

- **When the runtime does geometric or convolution-based acoustics.** If the engine
  derives an impulse response from the actual room mesh, a preset table is a fallback
  layer for spaces the solver does not cover, not the primary source.
- **For a game with a handful of spaces.** Below roughly a dozen distinct acoustic
  environments, hand-tuning each is cheaper and better than maintaining a taxonomy.
- **For music and interface buses.** Those are positionless and must not receive world
  reverb; the preset table applies to world zones only.
