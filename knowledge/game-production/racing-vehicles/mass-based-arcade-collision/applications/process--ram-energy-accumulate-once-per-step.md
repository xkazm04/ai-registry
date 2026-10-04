---
layer: application
type: application
subject: mass-based-arcade-collision
technique: ram-energy-accumulate-once-per-step
stack: process
status: forged
verified_on: 2026-10-01
---

# A per-pair ram accumulator between a contact solver and a damage step

Read against the Death Ride tree (`firetv-deathride`, `deathride/` module, working copy of
2026-10-01). Stack is `process` for want of a Kotlin stack in the bundle; the citations are
real code. The behaviours here are simulated and authored, not felt.

## Clear, write the maximum, read once

The accumulator is `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:222 "val ramClosingMps=DoubleArray(Tuning.CAR_COUNT*Tuning.CAR_COUNT)"`,
sized once. It is cleared first thing each step: `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:252 "steps++; seconds+=dt; ramClosingMps.fill(0.0)"`.
The solver writes into it and only into it, indexed by the unordered pair:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:364 "val pair=min(a.id,b.id)*Tuning.CAR_COUNT+max(a.id,b.id)"` and
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:365 "ramClosingMps[pair]=max(ramClosingMps[pair],max(0.0,-relative-Movement.ramMinClosingMps))"`.
That line carries three of the technique's rules at once: a maximum, not a sum; the
threshold subtracted and floored; the pair index symmetric. The threshold is
`deathride/core/src/main/resources/data/movement.csv:18 "ramMinClosingMps,4"`, in the shared
movement table.

The contact passes run first and the damage step runs afterwards:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:266 "repeat(3) {"` then `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:267 "combat.step(inputs,dt)"`. The design note
states the order as a rule at `docs/concepts/deathride/W3-movement.md:5 "ram energy accumulates for W4 damage consumption once per step"`.

## One reader, mass-split damage

The only consumer is `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:237 "val pair=i*Tuning.CAR_COUNT+j;val closing=world.ramClosingMps[pair]"`.
It charges only if the closing value is positive and the pair cooldown has expired
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:238 "if(closing>0 && ramCooldown[pair]<=0) {"`), caps the raw figure
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:240 "val raw=min(CombatRules"`), then divides it by mass so the heavier car takes less:
`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:241 "damage(i,raw*other.spec.massKg/total,j,DamageKind.RAM);damage(j,raw*c.spec.massKg/total,i,DamageKind.RAM)"`,
and starts the cooldown on the same line.

Wall impact follows the same pattern for the wall case: `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:255 "c.wallImpactMps=0.0"`
clears it each step and `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:335 "c.wallImpactMps=max(c.wallImpactMps,vn)"` records the
maximum; `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:235 "if(c.wallImpactMps>CombatRules"`
reads it once.

## What differs from the standard

- No test in the cited files asserts the technique's key invariant, that the figure does not
  change with the number of solver passes. `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:17 "assertTrue(w.ramClosingMps[1]>0)"`
  only shows the slot is positive after one collision. The maximum makes the invariant true
  by construction, but a pass-count test would prove it rather than rely on reading.
- The accumulator carries no unit in its type: the unit (metres per second above the
  threshold) lives only in the array's name. The standard asks for the unit and basis at the
  point of writing; the name does it, a comment would do it better.
- The single-pair per-step identity is stated only in the design note at line 5, while
  the code carries it implicitly; a reader of the code alone could not tell the maximum was
  chosen on purpose.
