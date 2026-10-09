---
layer: application
type: application
subject: mass-based-arcade-collision
technique: wall-tangent-retention-versus-head-on-loss
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# A track wall that reflects at 0.24 and scrapes off four percent

Read against the Death Ride tree (`firetv-deathride`, branch `deathride/main` at `d9990777`,
Kotlin 2.0.21), 2026-10-09. The behaviour is computed from the tree's own formula and
numbers. Nobody has driven it.

## The contact

The whole wall response is one line:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:525 "if(vn>0) { c.vx-=(1+spec.restitution)*vn*nx"`.
It acts only on a car moving into the wall. It reflects the normal component with the
car's own restitution and records the largest normal speed of the step as the wall impact.
For car classes it then removes the tangent loss from the along-wall component. The
loss is a table value, `deathride/core/src/main/resources/data/movement.csv:15 "wallTangentLoss,0.04"`.
The legacy car with no class skips it, which is the technique's "gate by class, write the
reason" rule; the tree keeps no written reason next to the gate.

The boundary has no restitution of its own. The car's value is used alone, which is one of
the two answers the pairing technique asks the project to state. The impact is reset at the
start of the step and read once by the damage step, above a floor and behind a cooldown:
`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:372 "if(c.wallImpactMps>CombatRules.wallMinImpactMps && wallCooldown[i]<=0)"`.
The floor is `deathride/core/src/main/resources/data/combat.csv:11 "wallMinImpactMps,6"`.

## The ordering contract holds because restitution is low

Every class runs at `deathride/core/src/main/resources/data/physics.csv:14 "restitution,0.24"`
(the pairing application explains why). The outgoing-speed ratio of a glancing hit to a
head-on hit, at the same approach speed and with the tree's formula:

| Restitution | 15 degrees | 30 degrees | 60 degrees |
| --- | --- | --- | --- |
| 0.24 (shipped) | 3.87 | 3.50 | 2.18 |
| 0.40 | 2.33 | 2.14 | 1.48 |
| 0.50 | 1.87 | 1.74 | 1.29 |

The technique's "more than twice" test holds at every angle up to 60 degrees for this tree.
It would fail at a 15-degree glance once restitution reached about 0.47. The contract depends
on the restitution value, not only on the formula.

## The per-second figure the table does not state

At 60 Hz, a car that pressed into the wall on every step would keep `0.96^60`, about 8.6%,
of its along-wall speed after one second. In practice the reflection sends it away and the
contact recurs only when steering brings it back. The tree records neither the per-second
figure nor the real contact rate during a scrape. The technique asks for the per-second
figure beside the per-step one, and a scrape-duration trace would supply it.

## Verdict

Simulation with the tree's formula at three restitution values. The new condition (the
ordering holds only while restitution stays below about 0.45) and the old unconditional
statement agree on this tree's 0.24, so the condition changes nothing here: **unmeasurable**
as a difference. Return condition: a class or surface that raises restitution above 0.4.
