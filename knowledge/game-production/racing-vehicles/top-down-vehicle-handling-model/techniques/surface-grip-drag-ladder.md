---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: surface-grip-drag-ladder
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [adding a surface to a driving model, leaving the road must always cost time, an opponent driver must not be slowed twice by the same surface, ordering surfaces by how bad they feel]
---

# Surface grip and drag ladder

The named concern: the table that says what the ground does to a car, and the discipline that
keeps that table a *ladder* — an ordered, legible set of penalties — rather than a bag of
unrelated multipliers. Each surface carries exactly two numbers, both read by the same
per-step code that handles every other surface.

## Two columns, because one cannot order the surfaces

**Grip scale** is a multiplier on lateral grip and on the lateral force cap, one for tarmac and
less for everything else. It decides whether the car follows its heading or slides.
**Drag per second** is an extra exponential loss on forward speed, zero for tarmac. It decides
whether the car slows.

Either column alone misorders the surfaces. Grip alone ranks a rough verge above a patch of oil,
so a player would prefer the verge's grip; but the verge's heavy drag makes it by far the worse
place to be for lap time. Drag alone ranks ice as harmless. Two columns let a surface be
*slippery and fast* (ice, oil) or *grippy and slow* (grass, deep verge) or both worse than road
by degrees, which are the three distinct experiences players recognise. A single "difficulty"
scalar would collapse them and the ordering would stop matching what the car does.

## The ladder is ordered, and the order is a requirement

Write the intended order down as a rule before writing numbers: tarmac best; a kerb costs a
little; loose surface costs more; the verge costs the most in time; low-friction hazards cost
the most in control. Then assert it in a test over the table: grip on tarmac is greater than on
every other surface; drag on tarmac is lower than on every other; a lateral-velocity probe on
a slippery surface retains more sideways speed after one step than on tarmac. These are table
checks and cost nothing.

A time ordering, from a seeded race of computer-driven cars on each surface in turn, is the
second rung and is worth having. The values obtained in the simulation this technique was
drawn from, over only three races per surface, ran from roughly 70 seconds on tarmac, through
the kerb, loose surface and oil, to over two minutes on ice and about two and a half on the
verge. The notable outcome is that the *time* ranking is not the *grip* ranking: the verge,
with moderately lower grip than oil, was far slower because of drag. That is the argument for
two columns, stated by a measurement, and a tuning that read only the grip column would have
predicted the opposite.

## One source, read once

A surface's grip number is consumed in more than one place: the lateral force, the force cap,
and any opponent that plans corner speed from the lateral acceleration the car can bear. The
rule is **apply the surface once**. An opponent that lowered its corner speed from the grip
number and then multiplied its speed again by a surface factor was slowed twice; on the
slipperiest surface it could not finish a three-lap race inside the time limit. The repair was
to delete the second reduction, and the opponent then finished without being given any extra
power. That is the single most useful incident in this subject: a duplicate of a loss does not
look wrong in any one line and shows up only as a surface on which the rivals cannot complete.
Make the composed grip a single value, computed once per step, and let every reader take it.

A small margin that stops an opponent being *too* gentle on a low-grip surface is acceptable
only when it is a stated minimum on a straight, where the grip estimate is not already
applied. It is a floor on the speed target, not a second grip.

## Procedure

1. **Define the surface set in a table with an identifier, a grip scale and a drag rate per
   second,** each with its unit. Tarmac is the reference row with grip one and drag zero.
2. **Resolve the surface once per step, from the car's position,** and store it on the car.
   Every law reads that stored value, so a car cannot be on two surfaces within a step.
3. **Compose the grip multiplier in one expression** with the brake loss, the load term and the
   handbrake, and use the composed value for the force and the cap alike.
4. **Add the drag to the forward law as an additive rate** beside rolling drag and handbrake
   drag, inside the same exponential. Three drags in one exponential sum cleanly and do not
   depend on the order they are listed.
5. **Test the ordering and a completion run on every surface,** and keep the generated report
   with the run's seed and size, so a later change can be compared like for like.
6. **Give a designer-selectable subset for practice** if the game exposes surfaces to the
   player; keep kerb and verge out of that subset, because they are bands, not tracks (see the
   margin technique).

## Decision rules

- **When a new surface is requested, add a row.** It needs only grip and drag. A surface that
  needs a third parameter has become a different mechanism and should be argued for.
- **When a surface is too punishing, lower its drag before raising its grip.** Drag changes
  lap time without changing how the car is controlled; grip changes the feel.
- **When a hazard should be recoverable, keep its grip above the point where counter-steer
  still catches the car.** A surface that makes a catch impossible is a trap, not a hazard.
- **When a surface is a narrow band beside the road, keep the bands' own widths in a separate
  table** so that surface values and geometry do not drift together.

## Measured, simulated, authored

Table ordering is verified in a deterministic test. Race completion on each surface and the
time ranges above are *simulated*, with computer-driven opponents only, at three seeds per
surface; they say that the ladder is completable and ordered in time, and nothing about whether
a human finds ice fair. The constants themselves are authored.

## When not to use this

- **For a model whose ground is decorative.** A top-down game with no surface effect needs no
  ladder.
- **When surfaces need to change handling in a non-multiplicative way** — a surface that
  reverses steering, a magnetic strip — which is a different law and a separate technique.
- **As a substitute for per-car tyre choices.** A tyre compound that changes the grip on all
  surfaces is a multiplier on the car, not a row in the ground table; mixing the two puts two
  authorities on one quantity.
