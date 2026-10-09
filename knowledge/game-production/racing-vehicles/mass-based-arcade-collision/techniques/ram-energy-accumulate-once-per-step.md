---
layer: technique
type: technique
subject: mass-based-arcade-collision
technique: ram-energy-accumulate-once-per-step
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [car-to-car contact must produce damage, the same collision is charged more than once, ordinary bumping must stay free]
---

# Record the ram once per pair per step, consume it after the solver

## The concern

The contact solver visits a pair many times in a step: several circle pairs per car pair and
several passes over the whole field. Each visit that finds the cars closing could emit a
damage figure, and a system that does so charges one meeting between cars two, three or nine
times, depending on the iteration count and on which circles touched. The same hit then does
different damage on different shapes and when the pass count is changed for stability, and a
tester describes it as randomness.

The fix is the same shape as giving a swing an identity: the thing being counted is the pair
of cars in one step. The solver writes into a per-pair accumulator and never into the damage
system; the accumulator is cleared at the start of the step and holds the largest closing
speed seen above a threshold; the damage system reads it once after contact resolution is
complete.

Two guards share the work, and it matters which does what. The closing test (record only
while the pair is still approaching) is what stops an isolated meeting from being charged
twice. After the first impulse the pair is separating, and every later visit records
nothing, whether the slot sums or takes the maximum. In a 2026-10-09 simulation of this
technique, an isolated pair gave the same figure at one to eight passes under both rules.
The maximum earns its place where a pair closes again inside the step, as in a chain where
a heavy car shunts one car into another. There the sum rose by 16% over the maximum.
Recording a contact before the closing test, or from overlap depth, removes the first guard
and makes the repetition real.

Status: that the figure is a per-pair maximum, cleared each step and read after the solver,
is checkable by test. The threshold, the damage rate and the cooldown are authored. No claim
is made that the damage feels fair.

## Procedure

1. **Index the accumulator by the unordered pair.** Use the smaller id times the car count
   plus the larger id, so the pair (A, B) and the pair (B, A) share one slot. The array is
   sized once from the car count and never grows.
2. **Clear it at the very start of the step,** before any contact is resolved. A value
   from the previous step that survives is a bug that charges a meeting twice.
3. **In the solver, take the maximum, never the sum.** For each closing contact set the
   slot to the larger of its current value and the closing speed minus the threshold,
   floored at zero. The threshold subtraction makes everything below it free.
4. **Run all solver passes first.** The accumulator is complete only after the last pass
   and the last boundary correction.
5. **In the damage step, read each pair once.** If the slot is positive and the pair's
   cooldown has expired, convert closing speed to a raw figure at a fixed rate per unit of
   speed, cap it, and split it between the cars. Start the cooldown so a car held against
   another is charged at a bounded rate.
6. **Split by mass, inversely.** A car's share is the other car's mass over the total, so
   the heavier car takes less. This ties the damage to the same weight the impulse used.
7. **Keep one writer, and read only after the last pass.** The solver is the only writer.
   A system that wants what damage decided, such as a health bar, reads the damage event.
   A system that needs a different gate may read the slot after the solver. A sound must
   play during the damage cooldown, and an ability may only ask "did this pair ram this
   step". Every such reader inherits the slot's basis (closing speed above the threshold)
   and must convert it or say so. A second reader is the usual way a bare number crosses a
   boundary. One combat racer's audio added such a reader, and it fed car and wall impacts
   on different bases into one loudness formula.

## Decision rules

- **When damage differs between cars of the same mass for the same closing speed,** look
  for a sum where there should be a maximum, or an accumulator that is not cleared.
- **When ordinary nudges are being charged,** raise the threshold, not the damage rate. The
  threshold is the line between driving and ramming.
- **When changing the solver pass count changes the damage of a meeting,** the accumulator
  is being written wrongly. Compare per meeting, not per step. In a chain, a single pass
  can move the second pair's figure to the next step without changing it. Use an isolated
  pair and a three-car chain behind a heavy car as the acceptance cases. The isolated pair
  catches a missing closing test, and the chain catches a sum.
- **When a car pinned against another is charged every step,** that is the cooldown's job.
  Choose it from how often a player should be punished for staying locked, in seconds.
- **When several systems depend on the figure,** name the accumulator's unit and basis at
  the point it is written: a speed in metres per second, above the threshold, for the
  step. A bare number crossing that boundary is the failure the units law forbids.

## When not to use this

- **Do not use it for a sustained push that should deal continuous damage,** such as a
  grinder. That is a rate over contact time and wants its own tick period.
- **Do not use a maximum where a pile-up should hurt more than a single hit.** If a
  three-car crush must cost more than a pair, add an explicit multiplier on the number of
  distinct pairs; do not recover it from the solver's repetition.
- **Do not let the solver call the damage system directly to save the accumulator.** The
  accumulator is what separates when contact happens from when damage is decided, and
  collapsing them brings the repeated-visit problem straight back.
