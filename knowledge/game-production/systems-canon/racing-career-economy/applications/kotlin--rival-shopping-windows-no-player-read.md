---
layer: application
type: application
subject: racing-career-economy
technique: rival-shopping-windows-no-player-read
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's rival garages: the ceiling form, and the read it leaves, measured

The companion `process` application read the rival design while it was still an uncommitted
document, and found no running code for it. That has changed. The tree is the `firetv`
repository's `deathride/main` branch at `d9990777`, read on 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that tree.
Rivals now buy through the shared shop from an authored window table
(`deathride/core/src/main/resources/data/rival-garages.csv:2 "rook,Needle,Trail,Flint,Quill,Kestrel,2,0,190,9999"`),
and the code states its own contract
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:61 "Actual shared shop transactions; no car stat writes or player-power input."`).

## Which honest form it chose

The tree uses the technique's first form: a ceiling and a grant. A rival buys only while its
rating stays under a per-stage ceiling
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:81 "if(rating<=ceiling*AshRules["`,
`deathride/core/src/main/resources/data/ash-rules.csv:3 "rivalPrCeilingScale,1.015"`). Each new
event gives it a grant
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:98 "if(newEvent)npc.credits=min(EconomyRules["`).

The grant is flat. It is not the technique's top-up to a target, so a rival that fell behind stays
behind by the amount it fell. Rivals may also borrow to reach the scheduled car
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:67 "if(!Market.transact(p,"`),
which adds a debt that depends on their results.

## The read that hides in the settlement, present

Rival results come from the cars in the player's own race
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:129 "val results=world.cars.filter{it.entered && it.rivalIndex>=0}"`),
and each one is settled into that rival's wallet
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:138 "Economy.settle(npc,Economy.start(npc),r.position,r.kills,r.hp,rewardScale=scale,"`).
A test codifies the channel by name
(`deathride/core/src/test/kotlin/dev/deathride/core/CareerV2Test.kt:41 "@Test fun resultsFundRivalsAndGrudgesOnlyAlterDecisio"`).

This is the transitive read the technique names. The ceiling bounds it and does not remove it.

The blindness test covers the window table only, with no race history
(`deathride/core/src/test/kotlin/dev/deathride/core/CareerV2Test.kt:39 "Field must not read player power or money"`).
No test compares the realised field across two different player careers, which is the
technique's step 5.

## The residual, measured from the project's own traces

The traces are the committed seeded ledgers under `deathride/evidence/campaign/design-v2/after/`:
2,000 AI-proxy careers per buying policy. In the race buyer's timeline, the field's realised
rating at each career's first visit to an event spreads like this across the 2,000 careers:

| Events | Careers | Range at the widest event | Standard deviation |
|---|---|---|---|
| 1 to 13 | 2,000 | under 1.5 points | 0.3 or less |
| 14 | 2,000 | 610.4 to 628.4 | 3.92 |
| 15 to 20 | 2,000 | about 8 points | 0.85 to 2.05 |
| 21 | 2,000 | 635.4 to 650.6 | 3.83 |
| 22 to 34 | 1,285 falling to 1,215 | under 6 points | 0.54 or less, 0 from event 29 |

So two careers can meet a field up to about 18 rating points apart, roughly 3%, at the same
stage. The spread opens at event 14 and stays open through event 21. It closes once the rivals
reach their ceiling, by event 25. Event 7 also steps the field up a tier and shows almost no
spread, so a tier step alone does not open it. The window is the stretch where rivals have money
to spend and room under the ceiling to spend it. Outside that window the ceiling holds the field
almost fixed.

The traces' rival results come from cells keyed by the player's car
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignReport.kt:265 "val cells=indexed.getValue(Triple(round,skill,p.selectedCar))"`),
and they are settled into rival wallets
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignReport.kt:268 "RivalEconomy.settleResults(p,ticket,round,result.rivals)"`).
That is the same channel the game uses, so the spread is the residual read, not noise from the
harness.

Whether 3% is small enough is a design call the technique leaves open. It asks only that the
form be stated and the residual tested. The tree states the form in code. The residual had never
been measured until this read.

## The signature

The rival preparation takes the whole player profile
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:87 "fun prepare(p: Profile,round: Int=p.careerRound)"`).
This is interpretation from reading the body. It reads the round, the season, the serial and the
rival records, and nothing about the player's car, rating or money. The technique's step 3 still
calls the signature a broken contract, because nothing in it stops the next change from reading
more.

## Grudges stay in the race

Grudges change only how a rival passes and fires
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:108 "passDistanceScale"`), and
the boss AI targets the human
(`deathride/core/src/main/kotlin/dev/deathride/core/AiBehaviour.kt:199 "if(s.role==AiRole.BOSS && (world.cars[best].human"`).
Both are in-race reads, which belong to difficulty design and are not a breach of the economy
rule, as the technique's last section separates them.
