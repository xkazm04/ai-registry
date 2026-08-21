---
layer: golden-path
type: golden-path
subject: spatial-audio-scene-authoring
status: forged
use_when: [deriving an audio scene from a level's room layout, a busy fight turns to mush and nothing is intelligible, setting reverb and occlusion defaults per room type, budgeting simultaneous playback by priority]
techniques:
  - room-type-to-acoustic-profile
  - reverb-parameter-tables
  - occlusion-to-volume-and-filter
  - attenuation-falloff-and-distance-filtering
  - event-priority-concurrency-cooldown
  - two-d-vs-three-d-spatialization-choice
---

# Spatial audio scene authoring

Audio is the discipline where "place it by hand" scales worst. The number of emitters
a level wants grows with the level's volume — every torch, every dripping ceiling,
every crowd, every door — while the number of sounds a listener can actually resolve
at once does not grow at all. It is fixed by human hearing and by a playback budget
that was decided on the cheapest target hardware. So the two halves of this craft pull
against each other by construction: derive an audio scene large enough to cover the
world, then ration playback hard enough that a busy moment stays intelligible.

Both halves have the same answer, and it is not "author more carefully". It is to
derive the scene from the structure the level already has — its rooms, their types,
their connections — and to attach a playback budget to every event class at the point
where the class is defined, rather than discovering the budget the first time forty
things fire in one frame.

## The derivation, and why it must be legible

A level is already a graph before anyone opens an audio tool: rooms with a type, a
size, connections between them, and a pacing intent per room. That graph is the input.
The output is a set of acoustic zones and emitters. The mapping between them is a
table — room type to reverb preset, to an occlusion default, to an attenuation base
radius in a stated unit, to a priority band — and keyword rules that turn a room's own
description into emitters carrying a radius, a volume and a cooldown
(room-type-to-acoustic-profile).

The word doing the work is *table*. A derivation that lives in a table is one a sound
designer can read, disagree with, and override for a single room; a derivation that
lives in generation logic is one they can only fight. This is the whole difference
between a generator that a discipline adopts and one it routes around. Two rules
follow, and they are not optional:

- **The derived scene is a starting position, not a verdict.** Every derived value is
  overridable per zone, and an override survives regeneration. A generator that
  silently reclaims a hand-tuned room has taught the department never to tune one.
- **A derived value that stands in for a missing input announces itself.** When the
  derivation produces a reference to an asset that does not exist yet, the artifact
  says so in the artifact — a placeholder that reads as a real path is worse than an
  empty field, because the empty field gets filled and the plausible one ships.

Producing the room graph, linting its pacing and validating its progression is a
separate concern owned upstream; this subject consumes that graph and does not attempt
to shape it. Where a generative service supplies the actual sound content, the general
practice of auditing what a provider can honestly serve is also a neighbouring concern —
the audio-specific part is only this: a generator declares the kinds of audio it truly
serves, with a stated reason for each kind it refuses, *before* anything is billed, so a
request for one kind can never come back as a different kind under the wrong label.

## What makes a reverb read as a place

The naive reading of environmental audio is that reverb is a size control: bigger room,
longer tail. Decay time alone gets you "generic large space", which is the sound of a
level that has not been treated. A room reads as a *specific place* through the
relationship between four things: how long the tail runs, how quickly the individual
echoes smear into a wash, how many of them there are per unit time, and how much of the
signal is reflected at all (reverb-parameter-tables).

The distinctions worth internalising:

- **Decay is size; diffusion is surface irregularity; density is the enclosure's
  complexity.** A cave and a hall can share a decay time and sound nothing alike — the
  cave has low diffusion, so you hear discrete slapback off rock; the hall has high
  diffusion, so the tail is smooth. Get these backwards and every space sounds like the
  same reverb at different lengths.
- **Early reflections carry geometry; the late tail carries size.** The first echoes
  back — the ones off one or two surfaces — are what tell a listener a wall is close on
  the left. The gap before them is the strongest single cue for how far the nearest
  surface is. Outdoors this gap is near zero and there is almost no tail: outdoor is not
  "reverb off", it is very short decay, very high diffusion, very low density, low wet
  mix. Modelling outdoors as dry is the second most common way a scene sounds fake.
- **Wet/dry mix is how deep into the space the listener stands**, not a strength knob.
  A listener at the mouth of a chamber hears mostly dry; the same chamber from inside is
  mostly wet. If your zones do not blend across their boundary, every doorway will click
  between two mixes and the player will hear the seam rather than the room.

## Occlusion is not obstruction, and neither is a volume knob

An occluding wall does two things to a sound: it makes it quieter, and it makes it
*duller*, because low frequencies pass through and around mass far better than high ones
do. Model only the volume drop and the result is instantly wrong — a muffled shout
through a door does not sound like the same shout further away, and a listener can tell
which of the two they are hearing. Every occlusion level therefore moves a volume
multiplier and a low-pass cutoff together, as one row of one table
(occlusion-to-volume-and-filter).

Obstruction is the other case and deserves its own handling: the direct path is blocked
but an indirect one is open — a voice around a corner, a machine behind a pillar in the
same room. There the direct signal is filtered and attenuated while the reflected signal
is not, because the reflections are still arriving. Collapse obstruction into occlusion
and every corner sounds like a sealed door, which removes the player's ability to tell
"someone is close, around that corner" from "someone is behind a wall". That distinction
is a gameplay signal in any game where you listen for an opponent.

Two engineering rules attach. First, occlusion state must interpolate, not switch —
stepping a cutoff across a threshold produces an audible zip on every doorway transit,
and the fix is a short glide plus hysteresis on the threshold itself so a player standing
in a doorway does not oscillate. Second, occlusion is a per-frame cost that scales with
active emitters, so it is budgeted like anything else: the nearest and highest-priority
emitters get real tests, the rest get the zone default.

## Distance must be legible, not merely quieter

Attenuation is the other half of spatial legibility, and it has the same shape as
occlusion: volume *and* filter. Air absorbs high frequencies over distance, so a distant
sound is both quieter and darker; a sound that only gets quieter reads as a small sound
nearby rather than a large one far away. The transplantable rule is that a zone's inner
radius — the distance inside which the sound is at full level — is derived as a fraction
of the zone's own radius rather than typed as a constant, with a floor so that tiny zones
still have an audible core, and the distance filter sweeps across exactly the band
between inner radius and falloff distance (attenuation-falloff-and-distance-filtering).
Every one of those numbers carries its unit and the axis it is measured on
([a-number-carries-its-unit-and-basis](../../_laws.md#a-number-carries-its-unit-and-basis)):
a radius without its world unit and a cutoff without its frequency scale are not
information, and a scene handed between a generator and an engine that disagree about
either will be wrong quietly.

## The budget is the design, not the safety net

A playback budget is not a cap you hit when things go badly; it is the instruction that
shapes what the scene tries to be
([a-budget-shapes-the-output](../../_laws.md#a-budget-shapes-the-output)). Modest hardware
resolves far fewer simultaneous real voices than a desktop target, and a mix that
subjectively works usually needs far fewer than the platform allows — if a busy moment
wants more than a few dozen audible voices, the answer is almost never a higher limit.

So the budget is attached where the event class is defined, not centrally: each class in
the event catalog carries its trigger, a priority band, a positioned-or-positionless
choice, a concurrency limit, and a cooldown in milliseconds
(event-priority-concurrency-cooldown). Concurrency answers "how many of *this* may sound
at once", cooldown answers "how close together may two of them start", and priority
answers "when the global limit binds, which one dies". They are three different failures
— a swarm of the same impact, a machine-gun retrigger of one impact, and an overrun —
and one number cannot cover all three.

Priority also has to be reconciled with ducking rather than layered on top of it. Ducking
lowers a bus to make room; priority decides who gets played at all. If dialogue is
protected by both, it is protected twice and the mix loses its rest of the world; if by
neither, it is the first thing lost in the exact moments it matters. The rule: protect a
class either by reservation *or* by a duck, decide which per class, and write the decision
down next to the class.

Finally, positioning is a decision with a rule, not a default
(two-d-vs-three-d-spatialization-choice). Interface feedback, narration and music are
positionless — they have no location in the world and giving them one makes the world's
geometry filter the player's own feedback. World events are positioned. A short list of
classes is genuinely ambiguous and must be decided deliberately per game: the player's own
footsteps, a first-person weapon, an equipped item's handling sound.

## Absolute level, and what "done" means

Two things make an audio scene finishable rather than endlessly tweakable. The first is a
loudness target measured over representative play rather than a peak meter: the published
recommendations for interactive content sit around **-24 LKFS integrated for home
consoles** and about **-18 LKFS for handheld and mobile** — the quieter target for the
loud living room, the louder one for the noisy commute — with true peak held below
roughly -1 dBTP. Mixing to a target rather than to taste is what stops the slow ratchet
where every department makes its own layer a little louder.

The second is that unmeasured must not read as passed
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)). A zone nobody has
listened to, an emitter whose asset does not exist, a class whose concurrency was never
exercised in a real fight — each is *not measured*, a distinct state from *checked and
fine*, and it must render as such in whatever view a producer reads. The sibling craft of
budgeting a runtime resource in another medium makes the same argument about instruction
and sampler counts; audio's version is louder only because the failure is audible to
players rather than visible to profilers.

## The failure modes, named

- **Reverb as a size knob.** Every space is the same wash at a different length; no room
  is identifiable by ear.
- **Occlusion as a volume fade.** Walls sound like distance, and players lose the ability
  to localise anything through geometry.
- **Hard occlusion switching.** An audible zip at every doorway, worst exactly where the
  player spends the most attention.
- **The unbudgeted event class.** A class ships with no concurrency and no cooldown; the
  first crowded encounter is a wall of one sound.
- **The raised limit.** An overrun is answered by allowing more voices, which converts an
  intelligibility problem into a performance problem and keeps the intelligibility
  problem.
- **The positionless world sound.** An interface convention leaks onto a world event, or
  a world convention onto narration, and the mix stops making sense at exactly one class.
- **The silent placeholder.** A generated scene references sounds that do not exist, in
  paths shaped like real ones, and the gap is found by a player.
