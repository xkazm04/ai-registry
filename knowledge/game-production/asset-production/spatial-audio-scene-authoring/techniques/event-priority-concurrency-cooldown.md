---
layer: technique
type: technique
subject: spatial-audio-scene-authoring
technique: event-priority-concurrency-cooldown
status: forged
laws: [a-budget-shapes-the-output, unmeasured-is-not-a-pass, one-authority-per-quantity]
shared_with: []
use_when: [a busy encounter turns into mush, defining an audio event catalog, deciding which sound dies when the voice limit binds]
---

# Event priority, concurrency and cooldown

## The concern

More sounds will want to play than can be resolved. That is not a bug to be engineered
away; it is the permanent condition of a game with a world in it. The technique is to
attach the playback budget to the event class at the point the class is defined, so the
budget is an authoring decision rather than a runtime accident
([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)).

## The catalog row

Every event class carries, in one row:

| Field | Answers | Unit |
| --- | --- | --- |
| Trigger | what fires it | a named gameplay hook, not a description |
| Category | which bus and which reservation pool | a small closed set |
| Priority | who dies when the global limit binds | an ordered band with a numeric weight |
| Spatialization | positioned or positionless | see the sibling technique |
| Concurrency | how many instances of *this class* may sound at once | count |
| Cooldown | minimum gap between two starts of this class | milliseconds |

Three of these are commonly collapsed into one "importance" number, and they must not be.
They answer three different failures:

- **Concurrency** stops a swarm: eight enemies land a hit in the same frame and you hear
  one hit thickened, not eight hits smeared. Typical: 4 for a common impact, 2 for
  footsteps, 1 for anything singular like a death cue, a dodge, a door.
- **Cooldown** stops a retrigger: one rapid gameplay hook firing every few frames turns a
  clean sound into a buzz. Typical: 50 ms for fast impacts, 100-200 ms for movement,
  300-500 ms for interface alerts and interactions, 0 for anything that must never be
  suppressed.
- **Priority** decides the survivor when the *global* voice budget binds, which is a
  different event entirely and usually happens for reasons unrelated to this class.

## Priority bands

Four bands — low, normal, high, critical — with an explicit numeric weight, are enough
and are better than a wide integer range, because a wide range invites per-class
fiddling that nobody can reason about later. The weight exists so that comparison is
defined; the band exists so that authoring is legible. The same scale must be the one the
zone profiles use ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)),
or a zone's "priority 6" and an event's "high" will silently fail to compare.

Assignment rules:

- **Critical** is for classes whose loss changes the outcome or the story: a death cue, a
  boss theme, a telegraph the player must react to. Keep this list short enough to name
  from memory.
- **High** is for player-caused, player-relevant feedback: hits, ability casts, alerts.
- **Normal** is for confirmations and world interactions.
- **Low** is for texture: footsteps, ambient loops, crowd.

## Stealing, reservation and the limit itself

When the limit binds, the runtime chooses a victim. Configure the behaviour per category
rather than globally: *never steal* for critical classes, *steal quietest* for texture
(the quietest instance is the one nobody was listening to), *steal oldest* for loops and
long ambience. Reserve a small number of voices per category so an abundant class cannot
starve a rare important one — dialogue starved by footsteps is the canonical version of
this failure.

Two rules about the limit:

- **Keep it low deliberately.** Modest targets resolve on the order of a couple of dozen
  simultaneous real voices; capable targets manage several times that. If a mix needs
  more than a few dozen *audible* voices, the problem is the scene, not the limit — raising
  it converts an intelligibility problem into a performance problem and keeps the first one.
- **Virtualise rather than kill where the sound must resume.** A looping source that goes
  over budget should keep its playback position and become inaudible, so it re-enters in
  the right place; a one-shot should simply not start.

## Ducking versus priority

They overlap and must be reconciled per class, not layered by reflex. Ducking lowers a bus
to make room; priority decides who plays at all. A class protected by both takes all the
space in the moments it fires; a class protected by neither is lost exactly when it
matters. The rule: **choose one protection per class and record the choice next to the
class.** Dialogue is usually ducked-for rather than reserved; a telegraph is usually
reserved rather than ducked-for, because ducking the world to announce a telegraph is a
bigger mix event than the telegraph deserves.

## Proving it

A budget nobody exercised is a wish. The catalog is validated by playing the worst case —
the most crowded encounter the game can produce — and recording which classes were
suppressed, stolen or cooled down. A class that has never been exercised under load is
*not measured*, and must render differently from a class that was exercised and held
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). The output of that
pass is a list of classes whose concurrency was wrong, which is the only reliable way to
find them.

## When not to use this

- **For a game whose worst case is genuinely small.** If nothing ever competes, the
  catalog's budget fields are ceremony; keep the trigger and priority columns and drop the
  rest until a crowded scene exists.
- **As a substitute for mixing.** Concurrency limits stop mush caused by *count*. Mush
  caused by frequency masking — three sounds occupying the same band — is a mix problem and
  no budget will fix it.
