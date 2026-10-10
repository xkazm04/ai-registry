---
layer: application
type: application
subject: top-down-vehicle-handling-model
technique: bounded-load-transfer-grip
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: not-better
---

# Death Ride: load transfer moves capacity between axles, and it is a small lever

Read against the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10.
Anchors are relative to that tree; the version witness is
deathride/gradle/libs.versions.toml:3 "2.0.21". Every shipped car runs the two-axle solver; see
`kotlin--slip-restoring-yaw-stability` for the routing.

## The axle form, as shipped

The target is derived from the previous step's measured acceleration, and the bound is a
clamp on that target:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:162 "val transferTarget=(-c.longitudinalAcceleration*g.cgHeightM/(p.gravityMps2*g.wheelbaseM)).coerceIn(-p.maxTransferFraction,p.maxTransferFraction)",
with the bound in the table at deathride/core/src/main/resources/data/drift.csv:13 "maxTransferFraction,0.24".
The lag is the same exponential form, sharing its time constant with the old path:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:163 "c.loadTransfer+=(transferTarget-c.loadTransfer)*(1-exp(-dt/Movement.transferResponseSeconds))"
and deathride/core/src/main/resources/data/movement.csv:2 "transferResponseSeconds,0.18".
The acceleration it reads is measured after drag and the speed cap:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:230 "c.longitudinalAcceleration=(c.vx*cx+c.vy*cy-forward)/dt".

The scalar is now the front axle's share, kept off zero at both ends:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:164 "val frontShare=(g.frontLoadFraction+c.loadTransfer).coerceIn(p.minimumAxleLoad,1-p.minimumAxleLoad)"
with deathride/core/src/main/resources/data/drift.csv:12 "minimumAxleLoad,0.16". Capacity splits by that share at
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:167 "val capF=capacity*frontShare;val capR=capacity*(1-frontShare)".
Brake force is split by a table fraction, deathride/core/src/main/resources/data/drift.csv:16 "brakeFrontFraction,0.58", and the
handbrake works on the rear alone:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:187 "var fyR=-remainingR*curve(c.rearSlipRadians,p)*(1-hb*(1-p.handbrakeRearGrip))".
The old brake-grip-loss factor has no counterpart on this path, as the technique now says.

Each axle also shares one budget between drive or brake and cornering:
deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:182 "Reserve no fictitious lateral grip: longitudinal force consumes the same circle."
and deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:184 "val remainingF=sqrt(max(0.0,capF*capF-fxF*fxF))".
deathride/core/src/test/kotlin/dev/deathride/core/DriftModelTest.kt:41 "assertTrue(c.frontForceX*c.frontForceX+c.frontForceY*c.frontForceY<=c.frontCapacity*c.frontCapacity+1e-6)"
holds that for every class under brake and handbrake.

## The experiment

The technique's promise is trail-braking, and the golden path once promised power-oversteer
too, from this one filter. Ablation in a detached scratch worktree; nothing was committed to
the game. Each of the ten classes on the default profile, flagged as a lab car, with no
human gain. Hold half steer at 0.3 throttle from 22 m/s for one second. Then for 0.6 s
apply one of: 70% brake, full throttle, or full handbrake. Then return to 0.3 throttle for one
second. The measure is peak absolute body slip over the event and the second after it.
Three arms: shipped, transfer target forced to zero, friction circle removed (lateral
capacity not reduced by longitudinal force).

| Event | Before (mean) | Shipped | No transfer | No circle |
|---|---:|---:|---:|---:|
| Brake | 2.6 deg | 12.7 deg | 11.9 (lower in 9/10) | 12.0 (lower in 10/10) |
| Full throttle | 2.6 deg | 2.7 deg | 2.7 | 2.8 (higher in 8/10) |
| Handbrake | 2.6 deg | 8.7 deg | 8.6 (lower in 8/10) | 8.6 (lower in 5/10) |

No arm spun. **Simulated, n = 10 per cell.**

Verdict: **not-better** for the claim as the subject stated it. Load transfer adds under a
degree to a ten-degree rise under braking. No arm produces power-oversteer at this corner,
because the drive is split 42/58 front to rear and acceleration moves load onto the driven
rear. Removing the friction circle gives the same small effect in the same direction. Most of
the braking slip comes from terms neither ablation touched. Condition gained: measure the lever
with an ablation before a table promises it. Falsified by an ablation that removes most of the
brake-in-corner rise; neither did.

The circle earns its place elsewhere. The implementation note reports that an AI driver on ice
docs/concepts/deathride/D2-drift-model.md:32 "could request full engine/brake and full cornering simultaneously" and the circle refused
it. That is a correctness bound on what any driver may ask for. It is not a source of rotation,
which is why this run did not promote it to a technique.

## Deviations from the standard

- **The old table rows still exist, and only the default spec reads them.**
  deathride/core/src/main/resources/data/movement.csv:3 "brakeTransfer,0.30", deathride/core/src/main/resources/data/movement.csv:4 "throttleTransfer,0.12" and
  deathride/core/src/main/resources/data/movement.csv:5 "transferGripGain,0.35" feed only
  deathride/core/src/main/kotlin/dev/deathride/core/World.kt:213 "if(advanced)car.loadTransfer+=((brake*Movement.brakeTransfer-throttle*Movement.throttleTransfer)-car.loadTransfer)".
  That branch is guarded by having a car class. The catalogue gives every class geometry, so
  no shipped car reaches the branch; only the drift lab's legacy comparator, which strips the
  geometry on purpose, does. The rows look live to a designer editing the table. Either delete them
  or mark them as legacy in the table.
- **The braking witness is on the dead path.**
  deathride/core/src/test/kotlin/dev/deathride/core/DriftTest.kt:25 "val model=SlipHandling(); val spec=CarSpec(); model.integrate(a,InputFrame(),spec,1.0/60)"
  asserts that braking preserves lateral momentum on a bare spec. Nothing asserts the axle
  form's sign, which is a positive transfer under braking on a roster car.
