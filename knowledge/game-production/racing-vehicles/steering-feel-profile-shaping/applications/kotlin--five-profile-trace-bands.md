---
layer: application
type: application
subject: steering-feel-profile-shaping
technique: five-profile-trace-bands
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the profile bands pass on a handling path no catalogue car drives

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. Every figure below is a headless simulation on one Windows JVM at
the game's fixed sixty hertz. Nobody drove anything for this pass, and the experiment code was
run in a scratch worktree and not committed to the game.

## Two handling paths behind one entry point

The handling integrator forks on one field. Shaping and the slew run first, then
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:207 "if(spec.driftGeometry!=null) {"`
hands the step to the axle model and returns. Only a spec without drift geometry falls through
to the older single-body model below it. The two paths read the same profile fields (the axle
model consumes authority, yaw response and stability at
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:172 "c.feel.authority(speed)"`,
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:199 "c.feel.yawResponseScale"` and
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:203 "c.feel.stabilityScale"`), so no
field is orphaned. They turn those fields into very different vehicles.

Every catalogue car takes the axle path. The class factory builds its spec with
`deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:28 "driftGeometry=DriftGeometry.forClass(id)"`,
and `forClass` is a `getValue` over the geometry table, so a class without a row fails to load
rather than falling back. The axle path also applies a human-only steering gain,
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:172 "if(c.human && !c.labCar)p.humanSteerGain else 1.0"`,
set to two at `deathride/core/src/main/resources/data/drift.csv:38 "humanSteerGain,2,1,3,x"`.
The drift lab marks its car as a lab car, so even the lab does not see that gain.

The trace test that holds the profile bands builds its vehicle by hand. It makes a bare car and
a default spec: `deathride/core/src/test/kotlin/dev/deathride/core/FeelTest.kt:12 "val spec=CarSpec()"`.
A default spec has no drift geometry
(`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:33 "val driftGeometry: DriftGeometry? = null"`),
so all sixty traces and every band assertion run on the single-body model. The axle model
landed on 2026-10-01 (`c1923384`, "class-scaled axle drift"); the trace test was last changed on
2026-09-30. Nothing failed when the shipped vehicle changed underneath it.

## The experiment

Same method as the game's own step trace: pinned speed, full throttle, a full-lock step held
for 240 steps, slip averaged over the last sixty, then release. It was run once with the default
spec, as the game's test does, and once per catalogue class (ten classes) built through
`CarCatalog.apply` with the human flag set. That is five profiles at 8, 18 and 28 m/s, and each
row was checked against the bands declared in its own `feel.csv` row.

| Vehicle built by | Traces | Out of band |
|---|---|---|
| bare `CarSpec()` (the game's test) | 15 | 0 |
| catalogue factory (the shipped path) | 150 | 60 |

Yaw accounts for 59 of the 60 failures, and 56 of those 59 are above the band rather than
below it. With the Balanced profile at 18 m/s, mean yaw spans 0.39 to 2.76 rad/s across classes
against a declared band of 0.4 to 2.0. Eight rows fail turn-in, seven of them on yaw as well.
Recovery never failed. The game's own `FeelTest` ran in the same build and
passed.

The fixture itself also stops working on the axle model, which is the second finding. Pinning
speed after every step suits a body that cannot spin. On the axle model, a full-lock step at
pinned speed drives most classes into a slide that the pin keeps feeding:

| Step input | Default spec, median / max slip | Shipped path, median / max slip | Shipped traces over 45 degrees |
|---|---|---|---|
| full lock | 12.3 / 81.3 degrees | 38.6 / 162.8 degrees | 70 of 150 |
| half lock | 4.7 / 15.2 degrees | 18.2 / 141.7 degrees | 7 of 150 |
| quarter lock | 2.2 / 3.9 degrees | 5.4 / 32.0 degrees | 0 of 150 |

At full lock the slip column measures a spin, so a turn-in time and a radius taken from it
describe nothing a player would call a turn.

## Verdict

`better`, as an experiment. The technique's rule that a band stored beside a profile turns
drift into a failing build holds only if the trace drives the vehicle the player drives. With
the fixture built through the shipped factory, the same bands flag 60 of 150 traces that the
game's instrument passes. The experiment does not say the bands are wrong or the profiles bad.
The bands were set against the single-body model, and re-banding the axle model is a design
decision for the owner. So is choosing a sub-saturation acceptance step. Neither was made here.

Two conditions go back to the technique: build the fixture through the factory the game uses
and assert which path ran, and pick a step input below the point where the model spins at the
pinned speed. The return condition for the game is the owner re-banding the profiles on the
axle model.
