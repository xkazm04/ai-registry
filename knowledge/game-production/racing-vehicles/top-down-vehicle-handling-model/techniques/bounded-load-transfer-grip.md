---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: bounded-load-transfer-grip
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [adding trail-braking or power-oversteer to a point-mass car, a grip multiplier needs a slowly-following input, deciding whether weight transfer earns a suspension model]
---

# Bounded load transfer grip

The named concern: how braking and acceleration change how hard the tyres grip, in a model
that has no suspension, no axles and no wheels. A real car moves weight forward when it
brakes and rearward when it accelerates; the front tyres then bite harder and the rears let
go, which is why a car rotates when the driver lifts or brakes into a corner, and why a
powerful car steps out on exit. The arcade reduction is one scalar, a low-pass filter and a
gain.

## The scalar

Keep one number per car, the **load transfer**, positive when weight is forward. Its target
each step is a linear function of the two pedals: brake contributes a positive amount,
throttle a smaller negative amount. The scalar chases the target with an exponential lag whose
time constant is in the low tenths of a second, using the same step-independent form as the
yaw filter: `transfer += (target - transfer) x (1 - exp(-dt / tau))`.

The scalar then enters the grip law as a multiplier, `1 + transfer x gain`, composed with the
other grip factors (brake loss, surface, handbrake). A positive transfer raises the multiplier
slightly; a negative one lowers it. That is all of the physics: the sign tells you which way
the weight is going, and the lag tells you it takes a moment to get there.

## Boundedness is a property of the target

The transfer cannot leave `[-throttle_max, +brake_max]` because the target cannot, and a
first-order lag toward a bounded target never overshoots it. No clamp is needed and none
should be added; a clamp would hide a mistake in the target and would make a table
change that widens the range appear to do nothing. The effect on grip is therefore also
bounded and can be computed from the table: with a brake term of 0.3 and a gain of 0.35, the
multiplier never exceeds 1.105; with a throttle term of 0.12 it never falls below 0.958. State
that interval next to the constants. A designer who can read "grip moves by at most about ten
per cent from load" in the table understands the lever; one who finds it by experiment
usually turns it up until something breaks.

The deliberate asymmetry, brake larger than throttle, is how a model without a rear axle
still has trail-braking stronger than power-oversteer: braking is a bigger load event than
accelerating in a road car, and the table should say so.

## A single scalar cannot say which tyre

The honest limit of this reduction is that one multiplier cannot unload the rear while loading
the front. The scalar raises grip overall when braking, which is the opposite of what the rear
tyres do. The model therefore needs a separate term for what braking does to the *rear*: a
brake-grip-loss factor that reduces lateral grip and the stabiliser in proportion to the brake.
The net effect of brake on lateral grip is the product of the two: the small gain from load
and the larger loss from the brake term. Choose the constants so that the product is below
one, because otherwise braking improves cornering grip, which is physically backwards and, to
a player, reads as a bug.

## Procedure

1. **Define the target as a linear combination of two pedal values in `[0, 1]`,** with a table
   coefficient for each, so the range of the target is read straight off the table.
2. **Filter with the exponential form, with the time constant in seconds.** The value
   `transfer = 0` is the rest state; reset it on respawn, restart and wreck, or a car carries a
   stale transfer into the next life.
3. **Feed the scalar only into the grip multiplier,** and into presentation (tyre marks,
   smoke). Do not feed it into the stabiliser; the brake term already reaches the stabiliser
   directly, and a second route counts the same event twice.
4. **Compute the grip multiplier once per step and pass the number to every consumer.** The
   lateral force, the lateral force cap and any opponent that estimates corner speed read the
   same composed value.
5. **Assert the sign and the interval in tests.** Hard brake from speed drives the scalar
   positive; a held throttle drives it negative; the composed multiplier stays inside the
   interval derived from the table. These pass in a simulation and prove the arithmetic only.

## Decision rules

- **When trail-braking needs to be more pronounced, raise the brake term or the gain,** and
  recheck that the product with brake loss is still below one.
- **When the car feels like it floats after the pedals change, shorten the time constant.**
  A long lag reads as a delay in the car, not as weight.
- **When the model is used for a vehicle with a very different mass distribution,** add a
  per-car pair of transfer terms rather than a second formula.
- **When an opponent driver plans corner speeds,** it reads the settled grip, not the
  instantaneous transfer: planning on a transient makes the driver lift for every pedal
  change.

## Measured, simulated, authored

A deterministic test of sign and ordering is available and is the extent of what has been
verified in the simulation this technique was drawn from. The interval is arithmetic from
the table. Whether the car "rotates when you brake" the way a driver expects was never
reported by a human.

## When not to use this

- **When the vehicle has a real suspension or per-wheel load.** The scalar then duplicates
  the physics; delete it.
- **When there is no brake or throttle distinction in the input** (an auto-throttle racer).
  The target is constant and the technique degenerates to a constant multiplier.
- **When a car is meant to feel indifferent to pedal use.** A kart on rails does not need the
  extra state, and every state costs a reset obligation.
