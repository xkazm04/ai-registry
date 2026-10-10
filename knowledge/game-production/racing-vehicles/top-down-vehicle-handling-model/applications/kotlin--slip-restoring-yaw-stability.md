---
layer: application
type: application
subject: top-down-vehicle-handling-model
technique: slip-restoring-yaw-stability
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the restoring term moved onto two axles and stopped aiming at zero

Read against the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10.
Anchors are relative to that tree. The version witness is
deathride/gradle/libs.versions.toml:3 "2.0.21". The sibling `process--slip-restoring-yaw-stability` application
read the single-body integrator on 2026-10-01. Since then every shipped car has moved to another
path, and that changes what this law means.

## Which path ships

Roster cars carry axle geometry:
deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:28 "driftGeometry=DriftGeometry.forClass(id))", and the integrator hands
any such car to the axle solver before its own laws run:
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:207 "if(spec.driftGeometry!=null) {" then
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:208 "DriftDynamics.integrate(car,input,spec,throttle,brake,dt,driftParameters)".
The solver describes itself at
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:139 "Two-axle arcade model; no drift flag selects physics.".
The single-body laws now run only for a spec with no geometry, which in this tree means a bare
default spec built by a test.

## The restoring term, as shipped

Body slip is computed once, from the pre-step state, with a regularisation speed instead of
one metre per second:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:158 "val beta=if(speed>p.lowSpeedMps)wrapAngle(atan2(c.vy,c.vx)-c.heading) else 0.0".

The steering target is the point model's steady yaw, not the raw command:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:209 "val referenceYaw=steerYaw/(1+stability/referenceGrip*gripWeight)".
The restoring term pulls toward a computed neutral angle, bounded by the drift entry threshold:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:214 "val neutralBeta=(atan2(g.rearArmM*referenceYaw,max(speed,p.lowSpeedMps))+neutralRearSlip)" and
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:215 "val stableYaw=referenceYaw+(beta-neutralBeta*gripWeight)*stability*assist".
The source states why, at
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:202 "neutral body-slip angle, so restoring raw beta would amplify grip turns.".

The lag is still the exponential form, but now it is a servo whose torque is capped by what
the axles can deliver, and it is blended with the axle torque as slip grows:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:217 "val servo=((stableYaw-c.yaw)*(1-exp(-dt/response))/dt).coerceIn(-torqueLimit,torqueLimit)" and
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:218 "c.yaw+=(servo*(1-physicalBlend)+physicalYaw*physicalBlend)*dt".
The handover runs between deathride/core/src/main/resources/data/drift.csv:22 "physicalBlendStartRadians,0.18" and
deathride/core/src/main/resources/data/drift.csv:23 "physicalBlendEndRadians,0.70", with a handbrake floor at
deathride/core/src/main/resources/data/drift.csv:24 "handbrakePhysicalBlend,0.65".

The assist fades before a spin:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:170 "val assist=1-blend(abs(beta),p.assistFadeStartRadians,p.spinSlipRadians)", between
deathride/core/src/main/resources/data/drift.csv:28 "assistFadeStartRadians,0.72" and deathride/core/src/main/resources/data/drift.csv:29 "spinSlipRadians,1.18".

## The experiment

The project's own calibration note reports the defect this replaced:
docs/concepts/deathride/D3-drift-lab.md:23 "the first axle model increased quarter-input steady yaw by". It does not
say how much of the fix belongs to each part, so this run separated them. In a detached
scratch worktree two switches were added to the solver. Nothing was committed to the game. Same
fixture as the project's grip comparison: every class and every feel profile, a quarter
steer with 0.3 throttle, speed pinned at 18 m/s, mean absolute yaw over the last of three
seconds. One difference from the project's fixture: the car is flagged as a lab car, so the
human-only steering gain is off in every arm. Four arms per pair, n = 50 pairs:

| Arm | Mean change vs the point model | Worst pair |
|---|---:|---:|
| Shipped (reference yaw + neutral target) | 13.6% | -26.0% |
| Reference yaw, restore toward zero | 14.8% | +37.5% (Stable) |
| Neither part (raw command, restore toward zero) | 26.3% | +60.7% (Stable) |

Shipped is closer to the point model than the raw arm in 36 of 50 pairs, and closer than the
zero-target arm in 29 of 50. The raw arm reproduces the note's band on the default profile,
up to +48.8% (Line +37.6%). Steady body slip under the shipped arm was -0.8 to -4.1 degrees
across all pairs. The point model gave +1.1 to +5.0, so the two models settle on opposite
sides of the velocity. No arm spun. **Simulated; nobody has felt any of the arms.**

Verdict: **better**, with a condition. The reference yaw carries most of the correction. The
neutral target is worth having and grows with the stability multiplier. Falsified by the
zero-target arm being closer to the point model in most pairs; it was closer in 21.

## Deviations from the standard

- **The law's tests drive the path nobody ships.**
  deathride/core/src/test/kotlin/dev/deathride/core/DriftTest.kt:30 "val model=SlipHandling(); val spec=CarSpec(); val a=Car(0,Track()); a.vx=28.0"
  is the counter-steer witness, and a bare spec takes the single-body path. The axle path has
  its own witnesses in `DriftModelTest`, but the sign of *this* restoring term on a roster car
  has no test. The standard asks for fixtures built through the shipped factory, with the path
  asserted.
- **The project's grip comparison no longer measures what its note reports.** The fixture
  sets deathride/core/src/test/kotlin/dev/deathride/core/DriftLabTest.kt:101 "c.human=true;c.feel=profile;c.vx=18.0" without the lab
  flag, and since 2026-10-06 human cars get a doubled steering gain:
  deathride/core/src/main/resources/data/drift.csv:38 "humanSteerGain,2,1,3,x", applied at
  deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:172 "(if(c.human && !c.labCar)p.humanSteerGain else 1.0)". So the D3 arm of
  that CSV now carries the gain and the W3 arm does not. The table in the note was measured
  before the gain existed.
- **A human branch in a force law.** The design brief said
  docs/concepts/deathride/D1-drift-research.md:50 "No branch on `human` in force laws". The gain above is one.
  It is a deliberate feel choice, made after the brief, and it should be written down as an
  exception to the brief, not left for a reader to infer.

## Upward lessons

- Restore toward zero is a point-mass rule. The technique now carries the two-part fix, with
  the measured split between its parts.
- Keeping a low-slip servo beside a tyre model is not double counting when one blend owns the
  handover. The technique's "remove one" was an absolute, and this tree refutes it.
