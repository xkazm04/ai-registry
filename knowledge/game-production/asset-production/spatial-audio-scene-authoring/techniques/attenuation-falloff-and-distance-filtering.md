---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: attenuation-falloff-and-distance-filtering
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [distance does not read in the mix, authoring an attenuation curve per zone, a small zone has no audible core]
---

# Attenuation, falloff and distance filtering

## The concern

Distance has to be *legible*: a player should be able to tell a large sound far away
from a small sound nearby without looking. Volume alone cannot do that, because the two
cases produce the same level at the ear. What separates them is spectrum — air absorbs
high frequencies over distance — and the shape of the falloff. This technique is the
recipe for both, derived per zone rather than typed per emitter.

## The recipe

Four decisions, in order:

1. **Shape.** A sphere unless the source genuinely has an axis. Cones and boxes exist and
   are right for a loudspeaker or a corridor draught, but a sphere is the default because
   it is the only shape whose behaviour a designer can predict from one number.
2. **Inner radius** — the distance inside which the source plays at full level, with no
   attenuation and no distance filtering. **Derive it as a fraction of the zone radius**,
   not as a constant: an inner radius at roughly 30% of the falloff distance keeps the
   relationship between core and tail stable as zones change size. Apply a floor — a few
   tens of world units — so that a very small zone still has an audible core rather than
   an instantaneous falloff at its centre.
3. **Falloff curve.** Logarithmic. Linear falloff sounds wrong at both ends: it is too
   loud through the middle distance and then dies abruptly. Logarithmic approximates the
   inverse-distance behaviour of real radiation closely enough that the ear stops
   objecting.
4. **Distance filter.** A low-pass whose cutoff sweeps across exactly the band between
   inner radius and falloff distance: full bandwidth at the inner radius, roughly 2 kHz at
   the outer edge. The endpoints are the transplantable part — start at the top of the
   audible band so the filter is inaudible at close range, and land low enough that the
   far edge is clearly darker.

## Why the inner-radius fraction is the rule

A constant inner radius interacts badly with a derived scene, because zone radii are
themselves derived from room type and scaled by global modifiers. Hold the inner radius
constant while the outer radius moves and the ratio of "full-level core" to "falloff
tail" changes silently per room — big rooms get a pinprick of full level, small rooms are
full level everywhere. Expressing it as a fraction makes one authority
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)) — the zone
radius — govern both ends, so a designer who doubles a zone gets a proportionally scaled
attenuation without touching a second field.

The floor exists for the degenerate case only. Without it, a zone smaller than roughly
three times the floor produces a sound that is never at full level anywhere, which reads
as a broken emitter rather than as a small one.

## Units, always

Radii are world distance units and the unit must appear next to the value everywhere it
is written — in the profile table, in the generated artifact, in the comment above it.
Cutoffs are hertz. This is not pedantry: a generator authored in one world scale feeding
an engine configured in another produces a scene where everything is audible from ten
times too far away, and nothing in the data says which side is wrong
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
The cheapest possible guard is emitting the unit as part of the generated comment beside
every radius.

## Decision rules

- **Set falloff distance from gameplay reach, not from room size.** The question is "from
  how far should this still matter", which for a warning cue is further than the room and
  for a footstep is much less.
- **Give looping ambience a longer, gentler tail than one-shots.** A loop that vanishes at
  a hard edge announces the zone boundary; a one-shot that lingers wastes a voice.
- **Cull below audibility, and cull on the same number the mix uses.** An emitter whose
  attenuated level is below the effective noise floor is a wasted voice; compute the cull
  distance from the falloff curve rather than picking a second constant.
- **Do not compensate for a bad falloff with a volume multiplier.** Raising an emitter's
  base volume to make it audible at distance makes it painful up close. Fix the falloff
  distance instead.

## When not to use this

- **Positionless classes.** Interface, narration and music have no distance; they get no
  attenuation and no distance filter.
- **When the engine's own spatialiser owns the curve.** If a platform-level spatial audio
  path derives attenuation from a room model, this recipe is the authoring default it
  starts from, not a competing curve to apply on top.
- **For sources with strong directivity that gameplay depends on** — a horn, a public
  address speaker. Those want a cone with its own inner and outer angles, and the sphere
  recipe will make them omnidirectional in a way players notice.
