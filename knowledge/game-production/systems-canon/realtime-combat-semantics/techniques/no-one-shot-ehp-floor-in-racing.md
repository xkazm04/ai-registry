---
layer: technique
type: technique
subject: realtime-combat-semantics
technique: no-one-shot-ehp-floor-in-racing
status: forged
laws: [a-number-carries-its-unit-and-basis, law-and-check-share-one-source]
shared_with: []
use_when: [authoring the weapon roster of a vehicular combat game, deciding whether a heavy weapon may kill from full health, writing the rule a balance harness will later check]
---

# No weapon deletes a full-health car

## The concern

In a combat race the player is both driver and gunner, the camera is busy with the road,
and the weapons are a counter-matrix: a rapid forward gun for chasing, a slow heavy shot
that punishes a straight line, a dropped hazard that punishes a follower. A counter-matrix
works only if each weapon can be answered, and an answer takes time, and time costs
health. A weapon that removes the whole bar from full has no answer, because the answer
arrives after the verdict. This is the vehicular form of the survivability floor the
genre canon states for large single hits, written here as a design rule for the roster
rather than as a threshold in a harness.

**The rule: for every weapon, the single largest hit leaves the weakest defended car
alive.** "Weakest defended" is stated because the floor protects the car with the least
armor; a floor proven only for the typical car is silent about the one that dies. The
balance-simulation neighbour measures compliance with a floor of this kind; this
technique owns what the roster authors must do so that there is something to comply with.

## Why racing needs it said separately

Three properties of the genre make a one-shot worse than in an arena fight. The field is
crowded, so a weapon lands on a car that was not looking at the shooter. A wrecked
racer is usually out of the match rather than back at a checkpoint, so the loss is
large. And damage sources overlap: a gun burst, a collision and a hazard can land in the
same second. A floor against the single hit is therefore necessary and not sufficient,
which is why the procedure ends in an accumulation check.

## Procedure

1. **Write each weapon's largest single hit** with its unit (health points), its kind
   (stream, projectile, area, hazard, contact) and the target it was computed against. A
   figure with no target is not a figure.
2. **Take the weakest defended car and apply the roster's reduction rule** to that hit.
   Compute hits to kill from full health and state the integer.
3. **Require a stated minimum hits-to-kill for each burst weapon, and a stated minimum
   time-to-kill of continuous perfect contact for the stream weapon,** in seconds. The
   pair covers both shapes with their own arithmetic.
4. **Add an accumulation check.** Sum the plausible same-second damage from overlapping
   weapon, collision and hazard and compare it with full health. A roster that passes hit
   by hit and fails by the second is a one-shot in practice.
5. **Count observed one-shot kills in simulation.** The analytic rule says it is
   impossible; the counter says whether anything found a path the arithmetic missed. The
   counter is a first-class number on the match report, and zero is reported as zero over
   a stated number of matches, never as absence.
6. **Write the rule's number once,** where both the roster data and the checker read it,
   so the analytic check and the shipped numbers cannot drift apart.

## Decision rules

- **When a weapon is meant to feel heavy, raise its cost and its telegraph, not its hit
  size past the floor.** Heaviness is cooldown, scarcity and visible travel time. A hit
  that deletes the target is not heavy; it is a coin flip with a loud sound.
- **When two weapons can plausibly land inside one response time, treat their sum as the
  hit.** The response time is a stated allowance, and everything inside it is one event.
- **When hits-to-kill is exactly two on the weakest car,** the weapon is legal and
  fragile: any later buff makes it a one-shot. Record the margin and re-check on every
  change to damage or armor.
- **When a one-shot is wanted for a mode,** a boss or a sudden-death round, exempt the
  named weapon in that mode explicitly. Do not lower the floor for the whole roster to
  make the exception pass.
- **When a hazard arms after a delay, its lead time is a readability budget:** the delay
  must exceed a stated perception allowance plus the time to cross the blast radius at a
  declared reference speed. That budget is authored, not measured.

## An authored lead time is not a reaction result

Hazard readability is usually justified with arithmetic: the arming delay is longer than
a quarter second of perception plus the seconds to leave the blast at a reference speed.
It is good arithmetic and it is a design budget. It says that a driver who sees the cue
the instant it appears, and reacts in the stated time, has room to leave. It does not say
that real drivers see the cue, that the cue is on screen when it matters, or that the
reference speed is theirs. Label the figure an authored budget, keep the perception
allowance and the reference speed as named data, and leave the felt result as not
measured until people have driven it. It is the same distinction the golden path draws
for any fairness window the design asserts and nobody has observed.

## When not to use it

- **Do not apply the floor to scenery hits with their own rules,** such as a wall or
  barrier impact, unless they can stack with weapons inside the accumulation window.
- **Do not turn the floor into a ceiling on all damage.** Total damage over a match must
  still be able to end it; the rule is about how many answers a player gets, not how long
  the match runs. Pacing and duration targets live in the pacing neighbour.
- **Do not compute it on the average car.** The reference is the weakest defended car.
