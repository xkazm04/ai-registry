---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: speed-attenuated-steering-authority
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [the car spins in place at low speed or washes off the road at high speed, adding a per-car steering rate to a table, deciding what the steering input multiplies]
---

# Speed-attenuated steering authority

The named concern: how much yaw rate a unit of steering command produces, as a function of
how fast the car is moving. A constant answer is wrong at both ends. At standstill a real car
cannot rotate; at the top of its speed range the same wheel angle that parks it would roll it.
An arcade model has no wheel angle, so the speed dependence has to be written in directly, and
it has to be written as a *shape with stated endpoints*, not as a feel adjustment applied after
the fact.

## The shape

The commanded yaw rate is a product of four factors, and the technique is knowing which factor
does which job.

1. **The command.** The filtered steering value in the range minus one to one. It is the
   output of input shaping and arrives here already smoothed; this technique does not shape it.
2. **A per-car rate.** The turn rate in radians per second the car reaches at full command in
   the middle of its speed range. This is the stat that differs between a nimble car and a
   heavy one, and it is a table value with a unit.
3. **A low-speed ramp.** A saturating factor of speed, of the form `v / (v + k)`, that is near
   zero at rest and approaches one at speed. `k` is the speed in metres per second at which
   half of the authority has arrived. This is what stops a stationary car from pivoting, and it
   is deliberately *not* attenuation: it rises with speed.
4. **A high-speed multiplier.** A bounded interpolation between a low-speed value and a
   high-speed value over a stated blend speed. The high-speed value is smaller than the low-speed
   one. This is the attenuation proper, and it is the factor a designer turns to make a car
   calmer at the top end.

The product of a rising ramp and a falling multiplier is a command-to-yaw gain that rises,
flattens and then eases. That is the intended shape and it should be plotted, not inferred. A
common error is to read the ramp as the attenuation, implement only the ramp, and discover that
the car is twitchy at maximum speed because nothing falls.

## A small launch term keeps the car steerable from rest

A purely speed-proportional ramp leaves a car on the start line unable to turn at all, which
players read as a broken stick. The remedy is to add a small, throttle-proportional offset to
the speed inside the ramp: while the player is on the throttle the ramp sees a slightly higher
effective speed, so the car can begin to rotate as it pulls away. The offset must be small
compared with the half-authority speed, zero when the throttle is off, and stated in speed
units; otherwise it becomes a second steering rate hiding inside the first.

## Procedure

1. **Write the four factors as four named table entries**, with units: a rate in radians per
   second, a half-authority speed, two multipliers and a blend speed in metres per second.
2. **Compute authority from speed alone.** It does not read the throttle, the brake, the
   surface or the slip; those act through their own laws, and an authority that reads them
   becomes a second place where they are tuned.
3. **Clamp the interpolation parameter, not the output.** The blend runs from zero to one over
   the blend speed and stops there, so the multiplier is bounded by its two endpoints by
   construction.
4. **Plot command-to-yaw gain against speed for each car class** before any play. The curve is
   the specification; a human sitting with the stick is the confirmation, and until that happens
   the curve is authored and nothing more.
5. **Test the endpoints and the ordering in a deterministic run.** Zero speed with zero throttle
   yields no rotation; full command at top speed yields less yaw rate per unit of command than at
   mid speed when the high-speed multiplier is below the low-speed one; a heavier car's rate is
   lower than a lighter one's.

## Decision rules

- **When a car feels twitchy at the top end, lower the high-speed multiplier.** Do not lower the
  per-car rate: that makes it sluggish in the corner where it matters.
- **When a car cannot turn at the start line, raise the launch offset.** Do not raise the
  low-speed multiplier; that makes the whole low-speed range loose.
- **When two car classes need different feel, change their rates and endpoints.** One law, many
  rows. A class that needs a different *formula* has stopped being a class.
- **When the stick is a thumbstick or a touch surface, the multiplier endpoints may be set per
  feel profile; the formula still lives here.** The profile selects numbers; it does not carry
  its own copy of the law.

## Measured, simulated, authored

The shape of the gain and the ordering of the endpoints are checkable arithmetic. What a
deterministic simulation can add is that a counter-steer applied at speed reduces slip within a
stated number of steps. What it cannot say is whether the endpoints feel right: nobody has held
the stick. State each endpoint as authored until a person has driven it.

## When not to use this

- **On a vehicle that is meant to rotate in place.** A tracked machine, a hovering craft, a
  skater. The ramp's whole purpose is to forbid that.
- **On a game with a fixed-radius steering model.** If the car follows a spline and only the
  speed varies, there is no yaw law to attenuate.
- **As a substitute for lateral grip.** At high speed a car that is hard to steer *and* grips
  hard is merely heavy; the attenuation is about how fast the nose can swing, and the grip law
  decides whether the car follows.
