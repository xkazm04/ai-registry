---
layer: application
type: application
subject: mass-based-arcade-collision
technique: bounded-collision-spin
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# A clamped yaw kick beside a handling model that already has inertia

Read against the Death Ride tree (`firetv-deathride`, branch `deathride/main` at `d9990777`,
Kotlin 2.0.21), 2026-10-09. The arithmetic below uses the tree's real shapes, masses and
tuning. Nobody has driven it.

## The kick, as written

The car contact turns both bodies by lever arm times impulse times inverse mass times one
scale, clamped per contact:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:552 "a.yaw=(a.yaw-(ax*ny-ay*nx)*impulse*invA*spin).coerceIn(-Movement.maxCollisionYawRadPerSecond,Movement.maxCollisionYawRadPerSecond)"`.
The arm is the touching circle's offset, so a middle-circle contact has none, which is the
technique's step one. The scale and ceiling are table values,
`deathride/core/src/main/resources/data/movement.csv:16 "collisionSpinScale,0.35"` and
`deathride/core/src/main/resources/data/movement.csv:17 "maxCollisionYawRadPerSecond,3"`. The
spin is gated on role,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:550 "if(a.carClass!=null || b.carClass!=null) {"`.
The obstacle contact applies the same kick with the same two numbers.

## The second rotational quantity

The same car spec carries a physical yaw inertia,
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:37 "val yawInertiaKgM2 get()="`,
from mass, length and width. The drift handling model divides its tyre torque by it:
`deathride/core/src/main/kotlin/dev/deathride/core/Drift.kt:197 "val physicalYaw=(g.frontArmM*(fyF*wheelCos+fxF*wheelSin)-g.rearArmM*fyR)/spec.yawInertiaKgM2*p.yawTorqueScale"`.
These are not two authorities fighting over one write. The contact writes the yaw rate once
and the handling model integrates from it, as the technique's step five asks. They do
disagree about which car is hard to turn. Per unit impulse at the end circle, relative to
the Needle (640 kg, 6.6 m):

| Car | Mass | Arm | Contact kick (arm/m) | Handling's own inertia (arm/I) |
| --- | --- | --- | --- | --- |
| Kestrel | 1,020 kg | 2.93 m | 1.02 | 0.57 |
| Comet | 1,210 kg | 2.75 m | 0.81 | 0.46 |
| Bastion | 2,350 kg | 2.33 m | 0.35 | 0.17 |

The long, light Kestrel takes the same kick from a hit as the shortest car, yet its tyres
turn it at about half that car's rate. The heavy classes spin about twice as easily from a
hit as their inertia says. All ten classes use an inertia scale of 1.0 in
`deathride/core/src/main/resources/data/drift-geometry.csv`.

## The ceiling is the active authority

The ceiling decides most rams. A Needle hit square on its end circle by a Bastion at 10 m/s
receives an impulse of about 6,240 N s at the tree's 0.24 restitution. The kick works out at
6.1 rad/s, so it is clamped to 3. The ceiling binds above roughly 5 m/s of closing speed in
that matchup, and the ram threshold is 4 m/s. Above the threshold, light cars therefore all
turn by the same capped amount, and mass shapes only the smaller hits. That is the
technique's "lower the ceiling first" rule seen from the other side: the scale barely
matters once the cap binds.

## Verdict

Simulation over the roster: the inertia-scaled rule (see the technique) and the shipped
mass-scaled kick rank the long classes differently. Kestrel and Comet move from 0.8-1.0
of the Needle's kick to about half of it. Whether that reads better cannot be measured
without a driver, so the verdict is **unmeasurable**. Return condition: a play session
that rates spin-outs by class, or a replay review of Kestrel side hits.
