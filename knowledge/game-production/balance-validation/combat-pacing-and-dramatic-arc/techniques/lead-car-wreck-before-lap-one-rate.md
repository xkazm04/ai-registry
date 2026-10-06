---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: lead-car-wreck-before-lap-one-rate
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a combat race or arena match can end a player's session in its opening seconds, deciding whether the first act is fair before anyone plays it, naming an acceptance metric for early elimination]
---

# Lead-car wreck before lap one: the opening-fairness gate

The named concern: a single rate, published under its own name, that says how often the
player's own vehicle is eliminated before the first lap ends — measured over many seeded
events, compared with a stated target, and reported beside the evidence that it was
measured on something.

## Why the opening needs its own gate

Every other pacing check in this subject reads the *shape* of an encounter that the player
is still inside. The opening-elimination rate reads the one outcome that removes the player
from every later check: a player wrecked in the first seconds never meets the arc, the
breather, the climax or the comeback, and a session that ends there teaches nothing and
costs the longest wait in the game, because the retry starts from the beginning of a
sequence the player has now watched fail. Elimination games know this as the early-exit
problem: a player who is out before they have had a decision to make does not experience the
mode, they experience a queue. The fix there is not to forbid elimination but to make the
first stretch survivable by a person who has not yet read the situation.

The naive reading is that a duration envelope already covers this. It does not, for three
reasons. An envelope is a clock bound on one fight; here the boundary is an *event* — the end
of the first lap — and the clock at which it arrives differs per course by a factor of two.
An envelope reads the human's time-to-death in the fights where the human died; the gate
reads the *fraction of events* in which that happened at all, which is the quantity a player
experiences as "this game kills me at the start". And an envelope is usually evaluated per
encounter, where this rate is a property of a whole division of events and has to be held
across every course in it.

## The definition, with its basis

*Opening-wreck rate* is the number of simulated events in which the designated lead vehicle
is eliminated before it completes its first lap, divided by the number of events that ran to
resolution. Both counts are printed. The unit is events, not vehicles: a field in which every
rival wrecks in the first lap and the lead survives scores zero, and that is correct, because
the field wrecking early is spectacle and the lead wrecking early is a lost session.

State, beside the rate: the number of events (a rate near five percent measured over forty
events is a handful of cases and its error band spans the target; thousands of events narrow
it to a fraction of a point), the seeds' derivation, the division and course set the events
cover, and the driver policy that stood in for the human. A figure without those is a number
without its basis. The target — start with *under five percent for a reasonable driver* — is
a starting figure to be moved deliberately, with the reason written down, for a mode that
expects frequent failure; it is not law.

## Procedure

1. Designate the lead vehicle in the run's configuration, not by post-hoc selection. Choosing
   whichever car happened to be wrecked first as "the lead" guarantees a bad rate; choosing
   whichever survived guarantees a good one.
2. Run the division's full event set. Record, per event, whether the lead was eliminated
   before lap-one completion, after it, or finished. Three outcomes, not two.
3. Report the rate per division and per course, never only pooled. A pooled five percent can
   hide one course at thirty.
4. Assert the instrument's own input: every event resolved, and the terminal states differ
   between events. A harness that replays one identical race two thousand times returns a
   confident zero.
5. Report the **retained later-wreck count** beside the gate. If the lead is never eliminated
   after lap one either, the gate was met by removing danger rather than by moving it, and the
   opening is no longer a fair test, it is an empty one. A passing division still shows the
   lead being wrecked sometimes, later, in numbers a designer can read (a few percent of
   finishes is a living number; zero is a defect in the other direction).
6. Keep the diagnostic runs that failed. The first measurement before any tuning and every
   intermediate coefficient stay in the log with their rates; see the sibling technique on the
   shared damage multiplier.

## Decision rules

- When the rate exceeds the target, look at the opening's *burst*, not the average: how soon
  after the start the first elimination of any vehicle occurs, and which damage source holds
  most of them. A grid that puts every vehicle in contact range at the same instant produces
  a first wreck within a few seconds regardless of how the damage is tuned over a lap.
- When the rate is under target in simulation and a scripted run on the real device still
  ends in early elimination, the real device wins and the simulation is missing a cost
  (input path, camera, collision shape, start behaviour). Treat a handful of device races as
  a counterexample to the model, never as noise around it.
- When the divisions differ, require the gate in every one, and let the rate fall as the
  division rises only through a stated, monotonic data change. A hand-tuned exception for one
  division is how the ramp acquires a wall.
- When the gate is met, the verdict is *met for the declared driver policy*, a tier below
  *felt*. Never promote it; see the proxy declaration technique.

## What is measured, simulated, authored

The count of events and the rate are **simulated**: they hold for the modelled driver and the
shipping rules. A scripted run on the actual device is **measured on the device** but
driven by a script, so it shows the opening *can* end a session, not how often a person would
experience it. The target itself is **authored** judgment. Nothing in this technique is a
human-felt result.

## When not to use this

- **Modes where early elimination is the design**, such as a last-survivor arena scored by
  placement. Keep the rate as a description and replace the target with the intended
  distribution of elimination times.
- **When no lap, lane or stage boundary exists.** Substitute the nearest event-defined
  boundary (first checkpoint, first phase change) and say so; do not fall back to a clock,
  which is the duration envelope's job.
- **As the only fairness check.** It guards one boundary. A division can pass it and still
  hold a one-blow elimination in lap two, which the neighbouring floor checks own.
