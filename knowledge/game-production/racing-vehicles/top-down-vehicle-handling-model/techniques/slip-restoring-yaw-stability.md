---
layer: technique
type: technique
subject: top-down-vehicle-handling-model
technique: slip-restoring-yaw-stability
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [the car never straightens after a corner, the car feels on rails, tuning how forgiving a slide is, adding a lag between steering and rotation]
---

# Slip-restoring yaw stability

The named concern: what pulls the nose back toward the direction of travel, and how quickly
the car's actual rotation follows what the model wants it to do. Two separate things live
here and both are first-order: a **restoring term** proportional to slip angle, and a
**yaw lag** that low-pass-filters the result.

## The two pieces

**Restoring term.** The slip angle is the signed angle from the heading to the velocity
direction, defined as zero when the body is nearly stationary (below a speed of a metre or so
per second, the direction of a tiny velocity is noise). The desired yaw rate gets an additive
term of `slip x stability`, signed so that a positive slip, with the velocity to the left of
the nose, turns the nose left. That is the entire mechanism: the more the car is sliding, the
harder it is pulled straight. It is a spring on the angle, and it is why a released stick
brings the car back into line and why a counter-steer works.

**Yaw lag.** The actual yaw rate approaches the desired one exponentially, with a time
constant in seconds: `yaw += (desired - yaw) x (1 - exp(-dt / tau))`. The exponential form,
rather than a plain `dt / tau`, makes the filter independent of the step length, so a change
of step rate does not change the car. `tau` is the heaviness of the car in one number. A small
value is a go-kart; a large one is a barge.

## Why both, and why the order

The restoring term alone, without lag, produces a car that snaps back the step the input
changes, which reads as a vibration at high stability and as nothing at low. The lag alone,
without the restoring term, produces a car that rotates smoothly and never recovers, because
nothing opposes the accumulated slip. Together they make a damped second-order response: the
nose overshoots slightly, settles, and the amount of overshoot is the character of the car.

The restoring term is added *before* the lag, so the lag shapes the stabiliser as well as the
steering. That is deliberate. If the stabiliser bypassed the lag, a slide would be corrected
instantly while a steering input took a fraction of a second, which feels like the car fighting
the driver.

## The stability constant is the most consequential number in the model

It sets how long a slide lasts. Too low and a nudge becomes a spin. Too high and the car cannot
be provoked at all, every other law in the model becomes invisible, and the player concludes
that the car is dull. It deserves three properties.

- **It is per car, in a table, with a unit.** Per second, because it multiplies an angle to
  produce a rate.
- **It has a multiplier per feel profile.** A profile can make the same car looser or stabler
  without a second copy of the law, and the multiplier is a table value too.
- **It is reduced by braking.** Hard braking unloads the rear and the car should be easier to
  rotate; the stabiliser is scaled by `1 - brake x loss`. The same loss factor appears in the
  lateral-grip law, and it must come from the same table row, once.

## Procedure

1. **Compute slip once per step, from the pre-integration velocity and the pre-integration
   heading,** and use that value for the stabiliser. A second computation after the heading
   has moved is a different number, and two slips in one step is a quiet inconsistency.
2. **Add the stabiliser to the steering term, then lag the sum.**
3. **Integrate heading with the lagged yaw rate,** wrap it into a fixed range, and only then
   rotate the velocity into the body frame for the grip law.
4. **Tune stability against a slide that is entered on purpose.** Provoke the car with a
   handbrake or a hard throttle application, release the stick, and measure the slip against
   time. The slide should decay monotonically; if it oscillates the stability is too high for
   the lag.
5. **Write a counter-steer test.** Hold a corner into a slide, apply an opposite command for a
   short stated duration, and assert that slip has fallen. This is a regression guard and
   proves the sign of the term; it proves nothing about how a catch feels.

## Decision rules

- **When a car feels on rails, lower stability before touching grip.** Rails are an excess of
  restoration, not a deficit of slip.
- **When a car spins from small inputs, raise stability or reduce the steering rate.** Never
  fix a spin by clamping yaw directly; the clamp removes the very response that makes the
  catch possible.
- **When changing the step length, leave the time constants alone.** The exponential filter is
  the reason they survive.
- **When two car classes differ in heaviness, vary the lag, not the stability.** Heaviness is
  slowness of rotation, and stability is eagerness to align; conflating them produces classes
  that differ in two ways at once.

## Measured, simulated, authored

A deterministic test can show that the stabiliser has the right sign and that a counter-steer
reduces slip over a stated number of steps. Seeded rival races show that no car is so unstable
that it cannot finish. Whether the recovery feels *catchable* is a human claim and nobody has
made it; the constants are authored.

## When not to use this

- **On a car whose heading is slaved to its velocity.** There is no slip to restore.
- **When a real tyre model exists.** A slip-dependent lateral force already pulls the nose
  round, and adding this term double-counts it; remove one.
- **As a stand-in for traction control.** A stabiliser tied to throttle or to a driver-assist
  switch is a different feature and belongs in its own law with its own switch.
