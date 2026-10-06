---
layer: application
type: application
subject: top-down-vehicle-handling-model
technique: slip-restoring-yaw-stability
stack: process
status: forged
verified_on: 2026-10-01
---

# One integrator holds four of the laws: yaw lag, slip restoration, load transfer, drift flag

Read against the `firetv-deathride` tree (a top-down racer for a living-room television, 60 Hz
fixed step, six cars), source root `firetv-deathride`, at the head of its
main branch on 2026-10-01 (commit not pinned; the tree carried uncommitted work). Everything
below is **simulated or authored**: the handling was checked by deterministic unit tests and
seeded rival races on a desktop JVM and installed on a stick, and no person has reported how it
feels. The wave note says it plainly at docs/concepts/deathride/W3-movement.md:34 "Optical latency, physical-phone ergonomics and owner feel not measured".

## The integrator, line by line

All of the per-step arithmetic sits in one small class, `SlipHandling.integrate`.

**Steering authority and the restoring term share one expression.**
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:186 "val desiredYaw=-car.filteredSteer*yawScale*profile.authority(speed)*spec.steeringRateRadPerSecond*(speed+spec.launchSteeringMps*throttle)/(speed+7.0)".
The four factors of the authority technique are all present: the filtered command, a per-car rate,
the saturating ramp `(speed + launch x throttle) / (speed + 7)` with 7.0 as the half-authority
speed and the launch offset at deathride/core/src/main/resources/data/physics.csv:12 "launchSteeringMps,3.0", and an
interpolated multiplier from deathride/core/src/main/kotlin/dev/deathride/core/FeelProfile.kt:28 "fun authority(speed: Double)=lowSpeedAuthority+".
The restoring term is the second addend of the same line, slip x stability x a profile multiplier x
`(1 - brake x brakeGripLoss)`, and the constant is deathride/core/src/main/resources/data/physics.csv:10 "yawStabilityPerSecond,1.4".

**The lag is the exponential form, applied after the sum.**
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:187 "car.yaw+=(desiredYaw-car.yaw)*(1-exp(-dt/(spec.yawResponseSeconds*profile.yawResponseScale)))".
The stabiliser is lagged with the steering, as the technique prescribes. The base time constant is
deathride/core/src/main/resources/data/physics.csv:9 "yawResponseSeconds,.12".

**Slip is computed once, from the pre-step state.**
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:185 "val slip=if(speed>1.0)wrapAngle(atan2(car.vy,car.vx)-car.heading) else 0.0":
zero below one metre per second, signed, wrapped.

**Load transfer is a bounded target and a lag.**
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:183 "car.loadTransfer+=((brake*Movement.brakeTransfer-throttle*Movement.throttleTransfer)-car.loadTransfer)*(1-exp(-dt/Movement.transferResponseSeconds))".
The constants: deathride/core/src/main/resources/data/movement.csv:2 "transferResponseSeconds,0.18", deathride/core/src/main/resources/data/movement.csv:3 "brakeTransfer,0.30",
deathride/core/src/main/resources/data/movement.csv:4 "throttleTransfer,0.12" and deathride/core/src/main/resources/data/movement.csv:5 "transferGripGain,0.35". The multiplier enters grip at
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:192 "car.surface.gripScale*(1+car.loadTransfer*Movement.transferGripGain)".
From the table the multiplier stays between 1 + 0.35 x 0.30 = 1.105 and 1 - 0.35 x 0.12 = 0.958;
there is no clamp in the code and none is needed. Braking also costs `(1 - 0.6)` through
deathride/core/src/main/resources/data/physics.csv:8 "brakeGripLoss,.6", so its net effect on grip is 0.4 x 1.105 = 0.442, below one:
the sign requirement of the technique holds.

**The drift flag has two thresholds, a minimum speed and a handbrake override.**
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:204 "if(car.speedMps<Movement.driftMinSpeedMps || hb==0.0 && slipNow<Movement.driftExitRadians)car.drifting=false" and
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:205 "else if(slipNow>Movement.driftEnterRadians)car.drifting=true". The values:
deathride/core/src/main/resources/data/movement.csv:10 "driftEnterRadians,0.22", deathride/core/src/main/resources/data/movement.csv:11 "driftExitRadians,0.10" and
deathride/core/src/main/resources/data/movement.csv:12 "driftMinSpeedMps,4". It is evaluated after the position update, from the post-step slip.

## What the tests prove, and what they do not

deathride/core/src/test/kotlin/dev/deathride/core/DriftTest.kt:6 "fun brakingUnloadsLateralGrip()" asserts that braking preserves more sideways
momentum than coasting. deathride/core/src/test/kotlin/dev/deathride/core/DriftTest.kt:12 "fun countersteeringCatchesTheSlide()" holds a corner into a
slide, applies an opposite command for twelve steps and asserts the slip fell, which proves the
sign of the restoring term and nothing about feel. deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:30 "assertTrue(c.drifting);assertTrue(c.loadTransfer<0)"
and deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:33 "assertFalse(c.drifting)" verify the flag on after a provoked slide and off after release,
with a positive transfer from braking in between. All of this is **simulated**.

## Deviations from the standard

- **No test lives in the hysteresis band.** The drift tests check the two ends, on and off; none
  holds slip between 0.10 and 0.22 and asserts opposite states from above and below, so a model
  with a single threshold would pass them. The standard requires the band test.
- **The drift flag feeds no force.** A search of the sources finds it read only by effects and
  telemetry, for instance deathride/game/src/main/kotlin/dev/deathride/game/TrackScene.kt:175 "if((c.drifting || c.loadTransfer>.3)", and not by the
  forces in the integrator, which read the continuous slip and the handbrake. That is the
  preferred reduction and it is correct, but the design note says
  docs/concepts/deathride/W3-movement.md:11 "The drift state enters only with speed and lateral slip" and a reader could believe the state
  changes the handling. The standard asks for the consumer list to be written down.
- **Brake loss is applied twice by design, through two factors from one row.** Both uses read
  the single row at the brake-loss line above (the stabiliser at line 186, the grip at line 192),
  which satisfies one authority; the double use is deliberate and should be a comment, not an
  inference.

## Upward lessons

- The ramp `v / (v + 7)` is not the attenuation. The falling factor is the profile's authority
  multiplier, whose endpoints live in the input-shaping table, for instance
  deathride/core/src/main/resources/data/feel.csv:6 "Stable,0.04,1.2,130,0.30,4,8,1.2,0.85" (low-speed 1.2, high-speed 0.85). A draft that located attenuation in the
  ramp would have been wrong; the technique now separates the rising and falling factors.
- A flag with no feedback is a design choice that deserves its own line; the draft had treated
  drift as a mode.
- The exit clause `hb==0.0 &&` makes a held handbrake the only way to stay in the state at a
  shallow angle. The draft lacked it.
