---
layer: application
type: application
subject: racing-career-economy
technique: qualified-wreck-advancement
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's wreck rules: both realized, one faucet outside the cap

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. The traces are AI proxy drivers: 2,000 seeded ledgers per buying
policy, committed under `deathride/evidence/campaign/design-v2/after/`. Their README says they
are not 2,000 independent full-physics campaigns
(`deathride/evidence/campaign/design-v2/README.md:16 "Therefore 2,000 ledgers are not 2,000 independent full-physics campaigns."`).

## The progress rule

A result is qualified by a lap or by a share of the course, both read from the car's own state
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:82 "car.lap.progressM>=world.track.lengthM*get("`).
The share is data:
`deathride/core/src/main/resources/data/career-rules.csv:2 "minimumWreckProgressFraction,0.20"`.

A refused result tells the player what to do
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:101 "Complete a lap or make progress before a wreck"`).
A boss adds a survival condition on top
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:92 "qualified && (!events[expectedRound].boss || hp>0 && finished)"`).
That is a third rule, about the event and not about the wreck. It fits the technique: a
boss is a stage, and its gate is authored.

**An unqualified result still pays.** The money settle runs after the progress decision,
whatever that decision was
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:93 "check(Economy.settle(p,ticket,position,kills,hp"`).
The race-buyer trace has 2,399 unqualified rows below the wallet cap, and 0 of them advanced.
Their lowest income is 455 credits. The pr-buyer trace has 2,077 such rows, with the same
minimum.

## The economy rule

The bounty is capped per race in data
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:133 "min(kills,EconomyRules["`,
`deathride/core/src/main/resources/data/economy.csv:7 "paidWreckCap,2"`).

**A second violence faucet sits outside the cap.** Destroying the whole field pays a separate
bonus
(`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:95 "if(kills==Tuning.CAR_COUNT-1)bonus+=MarketRules["`,
`deathride/core/src/main/resources/data/market.csv:15 "destructionBonus,60"`). It fires at most
once per race, so it is bounded. The cap still does not govern it, so the cap understates the
most one race can pay for violence by 60 credits. That is the case the technique warns about: a
rule tuned for one question silently failing another.

**The receipt lacks the paid count.** It carries `kills` but not how many of them paid
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:22 "val position: Int,val kills: Int,val gross: Int"`).
Procedure step 4 asks for both counts. Without the paid count, a player who wrecked four
cars cannot tell from the receipt why only two were paid.

## Not measured

Nobody measured whether 20% of the course is the right threshold for a person. It was set
against simulated drivers, and the traces carry the boss rule the game used before
2026-10-03 (`c082fd4b` restored first-place boss promotion after them).
