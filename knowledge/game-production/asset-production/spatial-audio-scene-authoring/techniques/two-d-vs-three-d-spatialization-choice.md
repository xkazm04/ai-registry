---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: two-d-vs-three-d-spatialization-choice
status: forged
laws: [one-authority-per-quantity]
shared_with: []
use_when: [deciding whether an event class gets a world position, a first-person weapon or the player's own footsteps feel wrong, interface sound is being filtered by level geometry]
---

# Two-dimensional versus three-dimensional spatialization

## The concern

Every event class is either *positionless* — it plays at the listener, at a fixed stereo
or surround image — or *positioned*, emitted from a point in the world and subject to
panning, distance attenuation, distance filtering, occlusion and reverb send. This is a
one-bit decision per class, it is made once, and getting it wrong is one of the few audio
errors that a non-specialist can hear immediately without being able to name.

The bit matters because it decides **which authority owns the sound's location**
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). A positioned
sound's location is owned by the emitting object in the world; a positionless sound has no
location and must not acquire one. When a class is marked positioned and has no meaningful
emitter, some fallback supplies a position anyway — the camera, the origin, the last known
actor — and the sound acquires a second, accidental owner whose behaviour nobody designed.

## The rule

- **Positionless**: interface feedback (button, menu, notification), narration and
  dialogue delivered as commentary rather than from a mouth in the scene, and music
  including all adaptive layers and stingers.
- **Positioned**: everything that happens in the world — impacts, abilities, doors,
  footsteps of others, traps, environmental loops, creature sounds.

That is nearly the whole taxonomy, and the rule is worth stating in exactly that shape
because the failure modes are symmetric. A positioned interface sound gets filtered by the
wall the player is standing next to, which makes the game feel broken rather than
atmospheric. A positionless world event has no direction, so the player cannot turn toward
the thing that just made a noise, which removes the primary reason the sound exists.

## The deliberately ambiguous classes

A short list is genuinely undecidable from first principles and must be decided per game,
written down, and applied consistently:

- **The player's own footsteps.** Positioned is physically honest but produces panning
  from a source a few units below the listener, which is distracting and interacts badly
  with fast camera movement. Positionless is stable and mixes cleanly but loses the
  surface-dependent spatial cue in enclosed spaces. Common resolution: positionless with a
  reverb send driven by the current zone, so the room is heard without the panning.
- **A first-person weapon or held item.** The source is attached to the camera, so
  positioning it buys nothing but costs a spatialiser and a distance curve that will never
  be exercised. Common resolution: positionless, with a separate positioned layer for the
  tail or impact so distance still reads at the far end.
- **A third-person player character's own ability effects.** Positioned is correct in
  principle, but the emitter is always at roughly the same offset from the listener, so the
  positional information is constant and only the reverb send is doing work. Decide by
  whether the camera can be far enough from the character for distance to matter.
- **Diegetic music** — an instrument being played by something in the world. It is a world
  event that happens to be music, and it goes on the world path, not the music bus, or it
  will refuse to occlude when the player walks out of the room.

## Consequences of the bit

Setting it does more than choose a panner. A positionless class is exempt from attenuation,
distance filtering, occlusion and world reverb, and typically routes to a bus with its own
loudness treatment. Encode that as a consequence of the flag rather than as four more
fields per class — otherwise a class will end up positionless with occlusion still enabled,
and the interface will duck behind a wall.

A positionless class is also cheaper: no spatialisation, no per-frame distance and occlusion
work. This is a reason to be honest about the ambiguous cases, not a reason to make world
events positionless.

## When not to use this

- **When the platform supplies object-based audio end to end.** Where a spatial renderer
  wants every object as an object, the distinction becomes "world object" versus "head-
  locked bed", which is the same decision with different vocabulary but a different
  implementation path.
- **In a strictly two-dimensional game**, where positioning is a pan-by-screen-x convention
  rather than a spatialiser; the class list still splits the same way but the mechanics
  below it do not apply.
