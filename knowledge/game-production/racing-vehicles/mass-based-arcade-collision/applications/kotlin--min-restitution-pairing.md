---
layer: application
type: application
subject: mass-based-arcade-collision
technique: min-restitution-pairing
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
---

# A minimum written in code over a roster that shares one value

Read against the Death Ride tree (`firetv-deathride`, branch `deathride/main` at `d9990777`,
Kotlin 2.0.21), 2026-10-09.

## The rule is in the code

The car pair takes the smaller restitution, inside the shared impulse helper call:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:547 "ContactImpulse.magnitude(relative,min(sa.restitution,sb.restitution),invA,invB)"`.
That is the technique's step two, written once. The wall uses the car's own value alone
(`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:525 "c.vx-=(1+spec.restitution)*vn*nx"`),
and so does a solid obstacle. That answers step four's "say which side wins", although the
tree does not write the answer down.

## The rule has nothing to decide

The spec field defaults to a single base value,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:30 "val restitution: Double = Physics.base.getValue"`,
and that base is `deathride/core/src/main/resources/data/physics.csv:14 "restitution,0.24"`.
The roster builder sets mass, shape, grip and steering per class, but never restitution:
`deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:28 "massKg=physical("`
is the only weight-class field on that line, and no class table has a restitution column.
All ten classes therefore resolve every pair at 0.24. The minimum, mean and maximum of two
equal values all give 0.24; only the product would differ (0.058).

The design note says the opposite of the code:
`docs/concepts/deathride/W3-movement.md:13 "use each car's radius/offset and restitution"`.
Per-car radius and offset are real. Per-car restitution is not.

## Status

No verdict. The pairing rule is inert in this tree, and the correction this run made to the
technique (the minimum is a design choice, not physics, and is no engine's default) changes
no outcome here. Return condition: when a class first gets its own restitution, or when the
note is corrected to say the value is shared.
