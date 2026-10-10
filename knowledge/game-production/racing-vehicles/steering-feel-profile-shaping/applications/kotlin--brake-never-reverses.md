---
layer: application
type: application
subject: steering-feel-profile-shaping
technique: brake-never-reverses
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: unapplied
---

# Death Ride: two brake floors, and why the axle model drops the plain one

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. This is a source reading. Nothing new was run against the brake for
this pass.

## The override is shared, the floor is not

Brake beats throttle once, ahead of the handling fork, so every vehicle gets it:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:205 "val throttle=if(input.brake>0.0)0.0 else car.filteredThrottle"`.
The decision is made on the raw brake input. That matches the technique.

The floor exists twice, once per handling path. The older single-body model clamps the forward
component exactly as the technique states:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:226 "forward=(forward+(throttle*spec.accelerationMps2*car.engineScale-brake*spec.brakeMps2)*dt).coerceAtLeast(0.0)"`.
The axle model, which every catalogue car drives (see the sibling trace-bands application),
does something else:
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:221 "A brake may stop existing reverse travel, never create it. Rotation can create negative forward velocity."`
and, on the next line, `deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:222 "if(drive==0.0 && nextForward*forward<0.0)nextForward=0.0"`.

The axle model clamps only when the step would carry the forward component across zero. A car
that is already travelling backward relative to its own nose keeps that motion, and the brake
then works against it. A plain floor at zero would delete that motion in one step.

## Why the difference matters

A model that can spin produces backward body-frame velocity with no reverse gear involved. A
car that has rotated half a turn while sliding at speed has a large negative forward component.
Clamping it to zero in one step deletes momentum the collision and drift code were built to
preserve, and the car stops dead mid-spin. The plain floor is right for a body that cannot
rotate past its own velocity. The sign-crossing clamp is right for a model with real slip. Both keep the rule
the technique is about: braking never *creates* reverse travel.

The clamp is gated on `drive==0.0`. While the brake is down the override has already zeroed
propulsion, so the gate is always open when braking. It is open while coasting too, which the
comment does not say.

## Status

`unapplied`. The technique gained the condition that tells the two floors apart, and the game
already has the right floor on each path. There was nothing to change. The game also tests both
halves of the condition on a catalogue car, in
`deathride/core/src/test/kotlin/dev/deathride/core/DriftModelTest.kt:87 "fun reverseMomentumIsNotDeletedAndBrakingDoesNotCreateReverse()"`.
A car sliding backward at 18 m/s must keep more than 17 m/s after a step
(`deathride/core/src/test/kotlin/dev/deathride/core/DriftModelTest.kt:90 "A spin's reverse momentum must survive"`).
A car creeping forward at 0.01 m/s with the brake held for 180 steps must end with no backward
travel. The brake-with-throttle case is covered by the override line, not by a test on this path.
The return condition is a project that has the plain floor under a model that can spin.
