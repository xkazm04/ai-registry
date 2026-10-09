---
layer: application
type: application
subject: mass-based-arcade-collision
technique: ram-energy-accumulate-once-per-step
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# A per-pair ram accumulator between a contact solver and three readers

Read against the Death Ride tree (`firetv-deathride`, branch `deathride/main` at `d9990777`,
Kotlin 2.0.21), re-resolved 2026-10-09. The forge filed it under `process` because the
bundle had no Kotlin stack then. The behaviours here are simulated and authored, not felt.

## Clear, write the maximum, read after the solver

The accumulator is `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:322 "val ramClosingMps=DoubleArray(Tuning.CAR_COUNT*Tuning.CAR_COUNT)"`,
sized once. It is cleared first thing each step:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:361 "steps++; seconds+=dt; ramClosingMps.fill(0.0)"`.
The solver writes into it behind the closing test, indexed by the unordered pair:
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:555 "val pair=min(a.id,b.id)*Tuning.CAR_COUNT+max(a.id,b.id)"` and
`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:556 "ramClosingMps[pair]=max(ramClosingMps[pair],max(0.0,-relative-Movement.ramMinClosingMps))"`.
That line carries three of the technique's rules at once: a maximum, not a sum; the
threshold subtracted and floored; the pair index symmetric. The threshold is
`deathride/core/src/main/resources/data/movement.csv:18 "ramMinClosingMps,4"`, in the shared
movement table. All three contact passes finish before anything reads the slot
(`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:391 "repeat(3) {"`), and the
design note states the order as a rule at `docs/concepts/deathride/W3-movement.md:5 "ram energy accumulates for W4 damage consumption once per step"`.

## Three readers, not one

At the forge (2026-10-01) the damage step was the only reader. Two more arrived within two
days, and both read the raw slot after the solver:

- **Damage**, behind a pair cooldown:
  `deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:375 "if(closing>0 && ramCooldown[pair]<=0) {"`.
  It caps the figure and splits it by mass so the heavier car takes less
  (`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:377 "val raw=min(CombatRules.ramMaxDamage,closing*CombatRules.ramDamagePerMps)"`).
- **Contact presentation** (audio commit of 2026-10-03), one event per pair per step:
  `deathride/core/src/main/kotlin/dev/deathride/core/World.kt:396 "for(i in cars.indices)for(j in i+1 until cars.size)if(ramClosingMps[i*Tuning.CAR_COUNT+j]>0)"`.
- **The spikes and charge abilities** (2026-10-02), which ask only whether the pair rammed
  this step: `deathride/core/src/main/kotlin/dev/deathride/core/Abilities.kt:135 "if(world.ramClosingMps[pair]<=0)continue"`.

Each extra reader had a reason to skip the damage event. A sound must play during the
damage cooldown, and an ability hit should not depend on it. The technique's "keep one
reader" rule was too strong. What the tree keeps is one writer, and readers only after the
last pass. That is the bound this run wrote into the technique.

## The basis did not travel with the number

The slot holds closing speed minus the 4 m/s threshold. The wall impact beside it holds
the raw normal speed. Presentation emits both as `strength`, and the audio director treats
them alike:
`deathride/game/src/main/kotlin/dev/deathride/game/audio/RaceAudioDirector.kt:104 "val gain=if(event.kind==PresentationKind.CAR_CONTACT || event.kind==PresentationKind.WALL_CONTACT)(event.strength/12)"`.
Three real impacts at the same speed show the result:

| Impact speed | Car contact gain | Wall contact gain | Car cue (cut at 6.0) |
| --- | --- | --- | --- |
| 6 m/s | 0.25 (floor; slot 2) | 0.50 | base |
| 10 m/s | 0.50 (slot 6) | 0.83 | full |
| 16 m/s | 1.00 (slot 12) | 1.00 (clamped) | full |

A car hit at 10 m/s sounds at 60% of a wall hit at the same speed, and the cue switch at
`deathride/game/src/main/kotlin/dev/deathride/game/audio/RaceAudioDirector.kt:96 "PresentationKind.CAR_CONTACT->if(event.strength<6.0)"`
sits at a 10 m/s closing speed for cars. This may be the mix the
designers want. Nothing in the tree says it is, and the units law exists for exactly this
case.

## What differs from the standard

- No test asserts that the figure is unchanged by the number of solver passes.
  `deathride/core/src/test/kotlin/dev/deathride/core/MovementTest.kt:17 "assertTrue(w.ramClosingMps[1]>0)"`
  only shows that the slot is positive after one collision. A 2026-10-09 simulation of the
  tree's arithmetic ran an isolated pair at 1-8 passes. It gave the same slot every time,
  and summing gave the same figure, because the closing test already stops the second
  visit. In a three-car chain behind a 2,350 kg car, the sum rose to 23.2 against the
  maximum's 20.0. In the same chain a single pass delayed the second pair's figure by one
  step. Pass-count invariance therefore holds per meeting, not per step.
- The unit (metres per second above the threshold) lives only in the array's name.

## Verdict

Simulation over the three real impact speeds above. Under the old rule a second reader is
a defect, and under the new one it is allowed but must carry the basis. Both rules flag the
same line, so neither verdict is **better**. The gain difference is a mix decision that only
a listen can judge, which makes it **unmeasurable**. Return condition: an audio review that
compares car and wall impacts at matched speed.
