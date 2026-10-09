---
layer: application
type: application
subject: debt-and-loss-stakes-staging
technique: the-last-act-is-the-players
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
---

# Death Ride's death duel in code: four borrowed endings refused

This reads the final act of Death Ride as code: a two-car fight to the last survivor in a
supplied rig, after the creditor has seized the player's car. The tree is the `firetv`
repository's `deathride/main` branch at `10974fa3`, read on 2026-10-09
(`deathride/gradle/libs.versions.toml:3 "kotlin = \"2.0.21\""`). Anchors are root-relative to that
tree. Nobody has played the duel. The win rates below come from the project's own duel
simulations, with AI proxy drivers in the player's seat.

## The five borrowed endings, checked against the code

**Timed out: refused.** A duel that reaches its time limit with nobody wrecked is a draw, not a
win
(`deathride/core/src/main/kotlin/dev/deathride/core/World.kt:310 "val duelDraw get()=eventType==EventType.ELIMINATION && finished==0 && (combat.wreckCount==entrantCount || seconds>=raceLimitSeconds)"`).
A draw does not advance:
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:101 "No survivor victory - the rig is ready for another attempt"`.
This is the technique's fifth failure, closed at the rule level.

**Given: refused at load.** Allies rebuild, lend and testify, but the campaign rules refuse any
ally contribution to race power:
`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:14 "require(get(\"allyRaceBenefit\")==0.0) { \"No unmeasured ally power is supported\" }"`.
The duel has two entrants, the player and Marrow
(`deathride/core/src/main/resources/data/campaign-rules.csv:10 "duelEntrants,2"`), so there is
nobody else to land the blow.

**Rigged: refused.** The duel can be lost, and it is mostly lost. In the project's newest duel
simulation (`deathride/evidence/ai/z3/raw/after/duels.csv.gz`, 1,024 duels per skill), the proxy
driver wins 150, 187 and 151 times across the three skills: 14.6% to 18.3% per attempt, with 8%
to 10% draws.

**Watched and fumbled: not tested here.** Victory is the settled result of the played duel,
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:95 "if(result.advanced && events[expectedRound].elimination)DeathDuel.victory(p)"`.
No cutscene path or boss self-wreck awards it in the settlement code read here. Whether the
boss AI can wreck itself on the arena without the player's hand was not measured.

## Cheap, identical retry, and what it buys

The technique's rule for a hard final event is to make retry cheap and identical and keep it
losable. The tree states it to the player
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:140 "Last car running wins. Free supplied rig on every retry."`).
Its effect shows in the seeded career trace
(`deathride/evidence/ai/z3/raw/after/timeline-race.csv.gz`). Of the 1,066 careers that reached
the finale, 868 cleared it within the harness's race cap. The median took 4 attempts, the 90th
percentile 11, and the worst 26. A per-attempt win rate under one in five becomes a finale
that about four in five reference careers finish. The tree measures this; it does not assume
it.

The cost is the one the lean-stretch technique names. The rig is first driven in this event,
so the first several attempts are also the lessons. The subject's `take-it-after-a-win` kotlin
application reads why there is no stretch before it.

## The ledger closes

Victory voids the remaining claim and records it apart from money paid:
`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:27 "s.voided+=s.debt;s.debt=0"`.
The reconciliation identity carries `voided` as its own term, so the account says what happened.
In practice the balance is already zero at the finale in every seeded career, as the ledger
application measures. The void is therefore a story line with nothing to cancel in money. The
authored closing remark,
`deathride/narrative/lines.csv:189 "Claim void. Unsigned."`, sits on the
`ledger-receipt` trigger, which no runtime code calls.

## What this does not show

That a human feels the win is theirs, or tolerates eleven attempts. The duel numbers are proxy
drivers against the shipped boss AI, from a build five days before the tip. Since then the boss's
search speed has become its own rule
(`deathride/core/src/main/resources/data/campaign-rules.csv:17 "bossSearchSpeedFraction,0.42"`),
so the current win rate has not been measured.
