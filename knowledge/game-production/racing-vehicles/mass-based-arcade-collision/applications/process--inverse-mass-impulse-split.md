---
layer: application
type: application
subject: mass-based-arcade-collision
technique: inverse-mass-impulse-split
stack: process
status: forged
verified_on: 2026-10-01
---

# A pure-Kotlin three-circle contact solver for a combat racer

Read against the Death Ride tree (`firetv-deathride`, `deathride/` module, working copy of
2026-10-01), a libGDX-targeted racer whose core is plain Kotlin with no physics engine. The
stack is recorded as `process` because the bundle has no Kotlin stack; the citations are real
code. Everything below is simulated and authored: the tests are arithmetic and simulation
checks, and nobody has driven these collisions by hand.

## The split, in one function

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:341 "val invA=1/sa.massKg"` computes the inverse masses
once per car pair: `val invA=1/sa.massKg; val invB=1/sb.massKg; val invSum=invA+invB`. The
position repair at lines 351-353 is the technique's step three, with a small constant margin:

`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:351 "val push=limit-d+.002"` then `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:352 "a.x-=nx*push*invA/invSum"` and
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:353 "b.x+=nx*push*invB/invSum"` (with the matching y lines). The impulse follows at
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:355 "if(relative<0) {"` and `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:356 "val impulse=-(1+min(sa.restitution,sb.restitution))*relative/invSum"`,
applied at lines 357-358 as `a.vx-=impulse*invA*nx` and `b.vx+=impulse*invB*nx`. The closing
test is on every call, so the second and third passes of the step find the pair separating
and do nothing.

## The acceptance test is the ratio

`deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:9 "@Test fun massContactsConserveLinearMomentumAndFavorHeavyCar() {"`
sets masses of 600 and 1800 with a zero circle offset, collides once, then asserts momentum
before and after at `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:15 "assertEquals(before,a.spec.massKg*a.vx+b.spec.massKg*b.vx,1e-8)"`
and the three-to-one change ratio at `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:16 "assertEquals(3.0,(15-a.vx)/b.vx,1e-10)"`.
The tolerance is tight because the claim is arithmetic. The design note says the same in
words, at `docs/concepts/deathride/W3-movement.md:13 "Car contacts split positional correction and impulse by inverse mass"`
and at line 32 "yields the expected 3:1 velocity-change ratio for 600/1800 kg".

## Roster spread

The weight classes only read if they differ enough. `deathride/core/src/test/kotlin/dev/deathride/core/TracksTest.kt:23 "assertTrue(masses.max()/masses.min()>2.7)"`
asserts the roster's heaviest-to-lightest ratio. This is confirmed against the technique's
"well above two" rule, and is a good template for a roster-balance check.

## What differs from the standard

- The positional margin of `.002` is a literal inside the function, not an authored value
  in the movement table; the standard keeps every feel number in one table. Small, but it is
  a second place a contact number lives.
- The step runs the whole-field contact pass three times (`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:266 "repeat(3) {"`), and
  inside each pass a car pair can contribute up to nine circle contacts. The closing test
  makes that safe for impulses, but the pass count is an unmeasured choice: there is no
  recorded run showing that three passes settles a pile-up and two does not.
- The cited design note's contact line is at `docs/concepts/deathride/W3-movement.md:13`, not the line 105 the scout
  gave: the file has 34 lines in this tree.
