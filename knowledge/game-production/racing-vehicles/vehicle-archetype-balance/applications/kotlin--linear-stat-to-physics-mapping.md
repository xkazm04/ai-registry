---
layer: application
type: application
subject: vehicle-archetype-balance
technique: linear-stat-to-physics-mapping
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: code
ab_verdict: unmeasurable
---

# Death Ride: every row is read, and the axle solver multiplies them by shape

Read against the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10.
Anchors are relative to that tree. The version witness is
deathride/gradle/libs.versions.toml:3 "2.0.21". The forge read this table at content commit
`e1640f0`, before the two-axle solver (D2, `c1923384`). The table is unchanged since then. What
consumes it is not.

## The table and its readers

Eleven rows, eight stats, one base and one per-point increment each, for example
deathride/core/src/main/resources/data/stat-mapping.csv:5 "maxLateralAccelerationMps2,grip,10,2"
and deathride/core/src/main/resources/data/stat-mapping.csv:9 "yawResponseSeconds,handling,0.2,-0.012".
Every roster class takes the axle path
(deathride/core/src/main/kotlin/dev/deathride/core/World.kt:208 "DriftDynamics.integrate(car,input,spec,throttle,brake,dt,driftParameters)").
Every movement row is read there: maximum speed caps velocity, acceleration drives, the lateral
limit and mass set axle capacity, steering rate sets the commanded yaw, and yaw response sets
the follow time. Armour and slots are read only by combat. No row is declared and unread, so
the technique's first audit holds.

## Where "one stat per parameter" stops holding

The table still gives each parameter one stat. The step does not use them alone.
- The grip limit is scaled by a power of mass:
  deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:146 "power(p.referenceMassKg*spec.widthM/(p.referenceWidthM*spec.massKg),p.loadSensitivity)".
  The effective lateral limit hangs from two stats, grip and mass, plus the class's width.
  Before the solver the design said mass did not touch handling
  (docs/concepts/deathride/D1-drift-research.md:23 "Mass affects contact impulses, **not handling**").
- Steering and yaw response are multiplied by per-class geometry:
  deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:148 "p.referenceWheelbaseM/it.wheelbaseM".
  Wheelbase, track, centre-of-gravity height, front load and inertia come from per-class shape
  data (`drift-geometry.csv`, `car-shapes.csv`) that no stat drives.
- The grip row changed meaning. On the axle path it feeds only a steady-yaw reference
  (deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:208 "val referenceGrip=max(1e-6,spec.lateralGripPerSecond)").
  It has no row in the rating's weights, so the rating prices grip only through the lateral
  limit.

The rating reads stats through the table and never sees the shape data. Two classes with equal
stats and different wheelbases get the same rating and turn differently.

## Verdict

**Unmeasurable.** The condition the technique gains (audit the effective quantity, and drive the
shape data from a stat or list it as unpriced) has no arm here. No ablation removed the
geometry, or folded it into a stat, and compared residuals. The physics change as a whole
moved the residuals of eight unchanged classes (see `kotlin--weights-fit-to-sim-with-published-residuals`).
How much of that is shape data the rating cannot see is not separated.
Instrument: rerun the residual table with every class on one reference geometry.

## Reconciliation

Confirmed: one table, every row consumed, one derive call. Deviation: per-class shape data is a
hidden per-vehicle input since D2, and mass now enters the grip limit. Upward lesson: a geometry
step makes "no parameter hangs from two" a property to check in the step, not in the table.
