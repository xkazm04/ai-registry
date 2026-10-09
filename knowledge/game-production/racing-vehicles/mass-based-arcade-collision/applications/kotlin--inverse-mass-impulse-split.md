---
layer: application
type: application
subject: mass-based-arcade-collision
technique: inverse-mass-impulse-split
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: not-better
---

# A pure-Kotlin three-circle contact solver for a combat racer

Read against the Death Ride tree (`firetv-deathride`, `deathride/` module, branch
`deathride/main` at `d9990777`, re-resolved 2026-10-09). It is a libGDX-targeted racer whose
core is plain Kotlin 2.0.21 (`gradle/libs.versions.toml:3 "kotlin ="`) and no physics
engine. The forge filed this under `process` because the
bundle had no Kotlin stack then. Everything below is simulated and authored: the tests are
arithmetic and simulation checks, and nobody has driven these collisions by hand.

## The split, in one function

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:532 "val invA=1/sa.massKg; val invB=1/sb.massKg; val invSum=invA+invB"`
computes the inverse masses once per car pair. The position repair is the technique's step
three, with a small constant margin:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:542 "val push=limit-d+.002"`, then
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:543 "a.x-=nx*push*invA/invSum"` and
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:544 "b.x+=nx*push*invB/invSum"`.
The impulse follows behind the closing test,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:546 "if(relative<0) {"`, and its
scalar now lives in one helper that the obstacle contact shares:
`deathride/core/src/main/kotlin/dev/deathride/core/Obstacles.kt:101 "=-(1+restitution)*relative/(inverseA+inverseB)"`.
A fixed obstacle passes an inverse of zero for its own side
(`deathride/core/src/main/kotlin/dev/deathride/core/Obstacles.kt:169 "ContactImpulse.magnitude(relative,c.spec.restitution,inverse,0.0)"`),
which is the technique's "immovable is an inverse of zero" rule in code.

## The acceptance test is the ratio

`deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:9 "@Test fun massContactsConserveLinearMomentumAndFavorHeavyCar() {"`
sets masses of 600 and 1800 with a zero circle offset, collides once, then asserts momentum
before and after at `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:15 "assertEquals(before,a.spec.massKg*a.vx+b.spec.massKg*b.vx,1e-8)"`
and the three-to-one change ratio at `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:16 "assertEquals(3.0,(15-a.vx)/b.vx,1e-10)"`.
The tolerance is tight because the claim is arithmetic. The design note says the same in
words at `docs/concepts/deathride/W3-movement.md:13 "Car contacts split positional correction and impulse by inverse mass"`
and at `docs/concepts/deathride/W3-movement.md:32 "yields the expected 3:1 velocity-change ratio for 600/1800 kg"`.

## Roster spread

`deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:37 "assertTrue(masses.max()/masses.min()>2.7)"`
asserts the roster's heaviest-to-lightest ratio. Mass is derived from a 1-10 stat at
`deathride/core/src/main/resources/data/stat-mapping.csv:7 "massKg,mass,450,190"`, and the
ten shipped classes span stats 1 to 10, so 640 to 2,350 kg, a ratio of about 3.7 before
upgrades. That ratio is a design assertion. The perception literature does not set a
threshold for it (see the golden path).

## The pass count, simulated

The step runs the whole-field contact pass three times:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:391 "repeat(3) {"`. The forge
recorded this as an unmeasured choice. On 2026-10-09 the run ported `collide` and `contain`
into a 1D simulation, using single circles, no rotation, the tree's 0.24 restitution and its
60 Hz step. It ran each case once:

| Case (180 steps) | Passes | Residual overlap at end | Jitter, last second |
| --- | --- | --- | --- |
| 1,000 kg car pinned against the wall by a 2,350 kg car pushing at 8 m/s² | 1 / 2 / 3 / 5 | 8.7 / 0.9 / 0.0 / 0.0 mm | 0 |
| Three-car pile: wall, 1,000, 1,000, 2,350 kg pushing at 8 m/s² | 1 / 2 / 3 / 5 / 8 | 42.9 / 9.6 / 3.3 / 0 / 0 mm (A-B) | at most 0.3 mm |
| The same pile with 80% correction and 10 mm slop | 1 / 3 / 8 | 68.7 / 17.7 / 11.7 mm | 0 |

In this model three passes settle a pinned pair and leave about 3 mm in a three-car pile. The
blind lane proposed percentage-and-slop correction for wall pile-ups. Simulated, that
proposal was **not better**: it left more overlap at every pass count and removed no
jitter, because none appeared. The technique's rule against it stands. Rotation, the
multi-circle chain and 2D are not modelled, so this result does not reach a pile-up that
twists.

## What differs from the standard

- The positional margin of `.002` is a literal inside the function, not an authored value
  in the movement table. The standard keeps every feel number in one table. It is small,
  but it is a second place a contact number lives.
- The obstacle contact reuses the impulse helper, the tangent loss and the spin
  (`deathride/core/src/main/kotlin/dev/deathride/core/Obstacles.kt:173 "c.yaw=(c.yaw+(ox*ny-oy*nx)*impulse*inverse*Movement.collisionSpinScale)"`).
  Two contact paths now share one set of contact numbers, which is the one-authority law
  working.
- Every World.kt line the forge cited had moved by `d9990777` (the impulse split from 341
  to 532). The MovementTest anchors held their place.
