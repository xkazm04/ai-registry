---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: start-protection-window
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a vehicular or arena match starts with every combatant in weapon range of another, first-minute deaths dominate playtest or simulation notes, deciding whether a spawn grace period should also freeze ammunition]
---

# A protected opening, in which nothing is spent

## The concern

Some real-time matches begin with every combatant packed into a small space, facing the
same direction, armed, and with no information about where anyone will go. A vehicular
combat race is the archetype: a grid of cars a few metres apart, a forward weapon each,
and a first corner that funnels them together. Nobody has had a chance to read the
field, nobody has had a chance to leave anything, and the weapons do not know that. The
result is a burst of damage in the first seconds that is decided by grid position, not
by anything the player did. The first wreck arrives before the player has made a
decision, and the match has taught them that the opening is a lottery.

This is the escapability defect of the timers technique applied to the whole match
rather than to one effect: a window the player was never free in. The usual first
reaction is to lower damage, and it is the wrong first lever, for the reason the golden
path already gives about unreadable attacks: lower numbers make the opening boring
without making it fair. The opening is not too strong; it is too early.

**The protection is a state of the whole match, owned by one authority.** It is the
interval from the start of the match clock during which the damage entry point refuses
to apply damage and the weapon entry point refuses to start an attack. Both refusals
matter, and the second is the one that is forgotten.

## Why ammunition must not be spent

A grace period implemented only on the receiving side (damage ignored) leaves the firing
side live. Every combatant then empties magazines into targets that cannot be hurt, the
scarce weapons are gone before the protection ends, and the first real exchange starts
from a drained economy. A player who held fire politely is punished against one who
mashed the button, and the artificial-intelligence layer, which never holds fire
politely, drains first.

So the protection is a gate on **starting** an action, evaluated before any resource is
debited: no round leaves, no charge is consumed, no cooldown starts, no pooled
projectile or hazard slot is taken. The refusal returns the same "cannot fire" answer an
empty magazine returns, so the input layer and the artificial-intelligence layer already
know how to cope with it. A suppressed shot is not a shot that happened harmlessly; it
is a shot that did not happen.

## Procedure

1. **Define the protection as a duration on the match clock,** in seconds, in data, with
   its unit and basis written beside it: seconds from the start of the match clock, not
   from the moment a car crossed a line and not per combatant. A per-combatant timer
   hands the faster starter a window the slower one does not have.
2. **Derive the remaining protection from the clock; never store a second countdown.**
   Remaining time is the duration minus elapsed match time, floored at zero. A stored
   countdown is a second authority for the same quantity and drifts on pause, restart
   and replay.
3. **Gate both entry points with the same derived value.** The damage entry point
   returns before it touches health; the attack entry point returns before it touches
   ammunition, cooldown or pooled objects. A hazard's own arming delay is a different
   quantity and must not borrow the protection's value or its name.
4. **Make the window visible.** A protection the player cannot see reads as a broken
   weapon, because their button does nothing. Show a countdown or a shield state on the
   combatant and in the weapon readout for the whole window.
5. **Measure the opening as its own number.** Record the time of first damage and of
   first wreck per match and report their distribution, not their mean. The protection
   is justified by the first-wreck minimum, because the minimum is the worst opening a
   player gets.
6. **Re-run the opening after any damage, weapon or grid change.** The window was sized
   against one set of numbers; a buffed weapon silently shortens the real opening.

## Decision rules

- **When the first-wreck minimum in a sample of simulated matches is only a few seconds,
  the opening is a lottery; add or lengthen the protection before touching damage.**
  A few seconds is the right order: long enough to clear the first corner, short enough
  that a player does not feel they are waiting.
- **When the protection ends, weapons are live on that clock edge, not after another
  delay.** A second gap after the visible end is a window nobody announced.
- **When protection and damage were both reduced in one change, record which of them
  moved the first-wreck distribution.** They are different levers with different feels,
  and the next author needs to know which is carrying the result.
- **When a combatant is wrecked, finished or absent, the protection is irrelevant to
  it;** the gate sits beside the state gate, never instead of it.
- **When a match restarts, the protection restarts with the clock,** because it is
  derived from it. If it does not, the restart path owns a second timer.

## What is measured and what is not

A protection window is easy to justify in simulation and hard to justify to a person.
In seeded simulated matches the effect is directly measurable: the distribution of time
to first wreck and the number of wrecks per match move, and the move is attributable.
That is evidence about the simulated field. It does not say whether a real player
experiences the opening as fair, whether the length reads as patient or as a stall, or
whether the cue is noticed. Report those as not measured until someone has played it. A
simulated opponent that fires with perfect timing on the first frame is probably a
harsher opening than a person's, so the simulated number is likely conservative;
"likely" is not a measurement.

## When not to use it

- **Do not protect a match whose opening is staggered or separated by design,** such as
  a time trial or a ghost run; the window would hold a pause with nothing in it.
- **Do not lengthen the window to cover a lethal weapon rather than fix the weapon.** If
  more than a few seconds of protection is needed to keep the match alive, the damage
  budget is wrong; see the full-health floor and the reduction-only armor rules.
- **Do not reuse it as a respawn shield.** Respawn protection needs an escape condition
  (it ends when the owner attacks) and has its own abuse cases; this window has none,
  because nobody has done anything yet.
