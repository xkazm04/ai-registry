---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: room-type-to-acoustic-profile
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [turning a level's room graph into an audio scene, setting per-room-type audio defaults, a sound designer wants to override one room without losing regeneration]
---

# Room type to acoustic profile

## The concern

A level plan already classifies its rooms — a fight space, a boss arena, a puzzle
chamber, a corridor, a safe room, a hub. Each classification implies an acoustic
intent that a sound designer would otherwise re-derive by hand for every instance of
it. The technique is to make that implication explicit as a lookup table, so the audio
scene is a *function* of the level plan rather than a parallel document that drifts
from it.

## The profile row

One row per room type. Every row carries the same fields, and a field that is absent
is a field the derivation is silently guessing:

| Field | What it decides | Unit / range |
| --- | --- | --- |
| Reverb preset | the acoustic character of the space | a named preset, resolved by its own table |
| Occlusion default | how hard this room's walls block | one of a small ordered ladder |
| Attenuation base radius | how far this room's sounds carry | world distance units, **stated** |
| Priority band | who survives when the voice limit binds | an integer band shared with the event catalog |
| Soundscape seed | the phrase handed to whatever authors content | a short intent phrase, not a filename |

Two of those need discipline. The **base radius** is the field most often written as a
bare number and it is exactly the field where a bare number is dangerous — the
generator's world unit and the engine's world unit are a classic silent mismatch
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).
Put the unit in the field name or beside every value, both in the table and in whatever
the table generates. The **priority band** must be the same scale the event catalog
uses; two scales for the same quantity is worse than one imperfect scale
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)), because the
disagreement only becomes visible during an overrun.

## Choosing the values

Rules that transplant:

- **Radius tracks how far a sound should still matter, not room size.** A corridor
  gets the smallest radius of any room type — it exists to separate spaces, and a
  corridor whose sounds bleed into both ends defeats its own purpose. A hub gets the
  largest, because its function is that the player hears it from elsewhere.
- **Occlusion default tracks structural intent.** Corridors and boss arenas are hard-
  walled and get high occlusion; open exploration and safe rooms get low, because
  their job is to sound connected to the world.
- **Priority tracks narrative load.** Boss and cinematic rooms outrank combat, which
  outranks exploration, which outranks transition. This is the same ordering a mixer
  would apply by hand, made explicit once.
- **Reverb preset is chosen from the preset table, never inlined.** The profile row
  names a preset; the preset owns the parameters. Inlining a decay time here creates a
  second authority for it.

## Global modifiers

A single scalar per difficulty or intensity setting may scale the whole scene: a radius
multiplier, an occlusion step up or down the ladder, a volume scale. This is legitimate
and cheap — a harder mode where sounds carry further and walls block harder is a real
design lever. Two constraints: modifiers are *multiplicative on the derived value* so
the table stays the single source, and stepping the occlusion ladder is clamped at both
ends rather than wrapping.

## Emitter templates from room description

The second half of the derivation reads a room's own prose description and matches
keyword groups to emitter templates. Each template carries a name, a loop/one-shot/
ambient kind, a volume multiplier, its own attenuation radius, a cooldown, and a spawn
probability below one for anything intermittent. The spawn probability matters: a trap
warning that fires in every room that mentions a trap is a tell; the same emitter at
roughly half probability reads as a world rather than a generator.

Keyword matching is deliberately shallow, and its shallowness must be visible. A room
description that produced no emitters should render as *no emitters derived*, never as
an empty, finished-looking scene
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

## Override and regeneration

The contract that makes the table adoptable:

1. Every derived field is editable per zone.
2. An edited field is marked as overridden and is **not** recomputed on regeneration.
3. Regeneration reports what it would have changed in an overridden field, so a
   designer can see that the table has moved under them and choose.

Without rule 3, overrides rot: the table improves, the hand-tuned rooms keep the old
behaviour forever, and the two diverge invisibly.

## When not to use this

- **Open worlds without discrete rooms.** With no room graph there is no input;
  derivation there works off terrain, biome and enclosure estimates, which is a
  different technique with different inputs.
- **A small number of hero spaces.** A dozen bespoke locations are cheaper to author
  by hand than to describe as types. Use the table for the long tail and let hero
  spaces be overrides from the start.
- **When the level plan's room types are not stable.** Deriving from a taxonomy that is
  still churning means regenerating the audio scene every week. Wait for the taxonomy.
