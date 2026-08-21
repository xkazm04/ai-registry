---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: real-time-timers-with-an-escapable-window
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
use_when: [authoring a duration or period on an ability, porting a turn-count effect to real time, reviewing a zone the player cannot seem to leave]
shared_with: []
---

# Real-time timers, with a window the player can leave

## The concern

Two distinct defects live under one heading, and they are worth holding together because
they are the same mistake at two scales.

**The unit defect.** A turn-based duration is structural: "3 turns" ends when the structure
says so, and the player's speed is irrelevant. A real-time duration is wall-clock seconds
against a player who is moving. Transplanting the former as a raw integer produces a number
nobody can price. Worse, real-time systems carry *two* time quantities that look identical
on an authoring form and mean opposite things:

- **A cooldown** is how often the *actor* may begin the ability. It governs an actor's
  economy.
- **A period** is how often a persistent effect *ticks* while it is active. It governs a
  target's damage intake.

Reading one as the other is the most expensive silent conversion in this area: a single hit
becomes a stream, or a stream becomes a single hit. The damage figure is unchanged and
correct in both cases; only its basis moved, and the basis was never written down. Every
duration in a real-time system therefore carries its unit (seconds), its kind (cooldown,
period, duration, lead time, window) and the thing it is measured against.

**The escapability defect.** A timer defines a window — a stretch of seconds during which
something is true of a region or a target. The window is only a rule the player can play
against if leaving it is physically possible. A zone whose radius grows faster than the
player runs is not a timer; it is a delayed guarantee wearing a timer's clothing, and it
must be designed and named as one.

Both defects survive every structural check. The effect exists, activates, ticks, expires
and cleans up correctly. Correct machinery running on the wrong basis is exactly the case
where proof of structure proves nothing.

## Procedure

1. **Type every time value at authoring time.** Each is one of: cooldown, tick period,
   total duration, wind-up, recovery, escape window. The kind travels with the number
   everywhere — through the authoring form, the generated runtime data and the review.
2. **Never let a bare duration default into a period.** If an effect is meant to resolve
   once, it declares itself instantaneous and carries no period at all. An effect with a
   period declares the total duration too, so total damage is derivable and reviewable.
3. **Derive total intake and state it.** Ticks per activation is duration divided by
   period; total is that times the per-tick figure. Publish the total, because the per-tick
   number is the one authors intuit and the total is the one that kills.
4. **For any window with a region, compute the escape distance.** Take the worst covered
   point, the nearest safe point, and the player's normal traversal speed. Escape time must
   fit inside the window with perception latency to spare — roughly a quarter second before
   the player even begins moving.
5. **If the region grows, compare growth rate to traversal speed directly.** Expansion
   slower than the player is a chase; equal is a tax; faster is a guarantee. Only the first
   is a real-time rule.
6. **Watch it.** Escapability reasoned about on paper and never observed against a moving
   target is unverified. Observation is the rung above the arithmetic, not a formality on
   top of it.

## Decision rules

- **When an effect ticks, the period is at least a tenth of a second and normally a
  quarter to a full second.** Faster than that and the ticks stop being events the player
  can perceive, the damage reads as a continuous drain, and the number of ticks becomes
  sensitive to frame timing.
- **When a persistent zone is meant to pressure rather than punish, make its window shorter
  than its cooldown.** If the zone can be re-established before the previous one expires,
  its effective duration is infinite and its authored duration is fiction.
- **When two applications of the same effect can overlap, declare which of refresh, stack
  or highest applies** — exactly one, per effect, decided once. The choice changes the
  total intake by a multiple, so a duration quoted without it is not a quantity.
- **When several timed hazards can overlap, let them overlap on purpose.** Two escapable
  windows whose safe regions intersect in a shrinking space is the good version of this
  mechanic: it forces a spatial decision under time pressure. The bad version is a single
  window with no counterplay. Overlap is how a real-time system gets difficulty without
  taking the player's turn away.
- **When a state machine advances on time — a combo step, a phase, a stance — drive it from
  the action's own completion event rather than from a parallel timer.** A timer started
  beside an animation drifts the moment anything changes the animation's rate, and the drift
  presents as inputs that are silently dropped.
- **When a window must be inescapable by design** — a grab, a scripted phase transition —
  give it a *pre*-window that is escapable instead. The player must be able to lose the
  fight for a reason they can name.
- **When porting a turn-count, convert through the encounter's rhythm, not through a
  constant.** Multiply turns by the mean seconds per meaningful exchange in the real-time
  build; a fixed seconds-per-turn constant produces durations that are absurd at both ends
  of the roster.

## When not to use this

- **Do not force an escape window onto a self-targeted effect.** A buff on the player, or a
  timer the player themself started, needs no exit; escapability is owed by effects imposed
  from outside.
- **Do not apply the escape computation to an untargeted global condition** — a rising tide,
  a storm phase, an environmental state change. Those are level-scale rules with their own
  pacing craft, and treating them as combat windows produces absurdly short phases.
- **Do not derive a period from a cooldown or vice versa, even when they look
  interchangeable.** They coincide by accident in the simplest case and diverge the moment
  the ability is upgraded, and the coincidence is what teaches the next author that they are
  the same field.
