---
layer: application
type: application
subject: racing-career-economy
technique: participation-floor-no-dead-end
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride's floor under a debt and a seizure

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. Since the companion `process` application was written on 2026-10-01,
the campaign has added three things that test this technique:
- a loan;
- a compulsory debt the story imposes;
- a seizure of the player's car.

The traces are the committed seeded ledgers under `deathride/evidence/campaign/design-v2/after/`:
AI proxy drivers, 2,000 careers per buying policy.

## The payout floor

The floor is additive. A flat participation amount is added to every result
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:133 "val gross=floor((EconomyRules["`,
`deathride/core/src/main/resources/data/economy.csv:5 "participationCredits,90"`), and the
position table may not go below zero
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:9 "require(prizes.size==Tuning.CAR_COUNT && prizes.all { it>=0 })"`).

Entry never checks cash. A race start checks only the profile's race counter
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:121 "check(profile.startedRaces<EconomyRules["`).

The state guarantee is a test: a wreck at zero cash leaves the player insured and in credit
(`deathride/core/src/test/kotlin/dev/deathride/core/GarageTest.kt:48 "assertTrue(receipt.insurance>0);assertTrue(p.credits>0)"`).
A second test runs 100 consecutive worst results at the maximum loan in every act, the seized
finale included, and asserts the balance never falls and the selected car stays owned
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignDesignV2Test.kt:103 "assertTrue(p.credits>=cash);assertTrue(p.owned[p.selectedCar])"`).
That is procedure step 4, verified in the real settlement path rather than on the formula.

In the traces, 248,266 timeline rows across both policies show:
- **0** rows with negative income;
- **0** of 4,000 careers flagged bankrupt;
- a lowest income below the wallet cap of **88** credits (race buyer) and **92** (pr buyer).

One limit: no simulated driver ever took a loan, so the loan stacked on the league debt is
covered by the test above and not by any trace.

## The debt, taken after the cap

Both debts are repaid inside settlement, from net and after the cap:
- `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:139 "val debtPaid=min(profile.debt,min(floor(net*MarketRules["`
- `deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:88 "val available=max(0,net-loanPaid-MarketRules["`

Each take is a share of what remains, at
`deathride/core/src/main/resources/data/market.csv:7 "repaymentShare,0.20"` and
`deathride/core/src/main/resources/data/campaign-rules.csv:5 "paymentShare,0.20"`. Together they
stop at a flat protected take-home of
`deathride/core/src/main/resources/data/market.csv:8 "minimumTakeHome,40"`.

The league debt is imposed by the story
(`deathride/core/src/main/resources/data/campaign-rules.csv:2 "startingDebt,1200"`). Its interest
is flat, charged once per event rather than per attempt, and stops after event 14
(`deathride/core/src/main/resources/data/campaign-rules.csv:3 "interestPerEvent,6"`).

**The worst campaign race, worked from the data.** The lowest reward scale is 1.6
(`deathride/core/src/main/resources/data/career-curve.csv:8 "scrap-7,7,0,505,0.89,1.6"`), and the
last-place prize is 10 (`deathride/core/src/main/resources/data/prizes.csv:7 "6,10"`).

| Line | Credits |
|---|---|
| Gross: (90 + 10) x 1.6 | 160 |
| Repair, capped at 60% | 96 |
| Net | 64 |
| Loan, 20% of net (the 40 floor leaves 24) | 12 |
| League, 20% of 52 (the 40 floor leaves 12) | 10 |
| Take-home | 42 |

The take-home is about 26% of gross, against the 40% the cap alone guarantees. Of the league's
10, a quarter is diverted before the exposure, so 8 is credited against 6 of interest. The debt
still falls after a worst-case race.

## Seizure supplies a car

The story can seize the player's car. Ownership is kept and enforced on load
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:106 "p.selectedCar==p.campaign.seizedCar && p.owned[p.selectedCar]"`),
but the player races a fixed rig
(`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:7 "val rigClass=CarClass(CarCatalog.all[rigIndex].values+Content.ta"`).
The rig starts every race whole and without items
(`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:17 "car.startingCondition=1.0;car.utilityMask=0"`),
and the shop is closed while seized
(`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:46 "if(DeathDuel.seized(p))return"`).
A test pins the retry state
(`deathride/core/src/test/kotlin/dev/deathride/core/DeathDuelTest.kt:63 "assertEquals(73,p.condition[seized]);assertEquals(0,p.lastReceipt!!.r"`).

The money guarantee holds: service is zero and the floor still pays. Progress resumes only by
winning a duel authored at a ratio of about one half. In the traces:
- **reached the duel:** 1,207 careers (race buyer) and 1,078 (pr buyer);
- **won within the 70-race cap:** 1,162 and 961;
- **mean attempts:** 4.06 and 3.81.

The car returns on victory
(`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:28 "if(s.seizedCar>=0){p.owned[s.seizedCar]=true"`).

## Manual service: roadworthy, not repaired

A player who opts into manual service leaves settlement with the car's damage intact, floored
at half condition
(`deathride/core/src/main/resources/data/market.csv:11 "roadworthyPercent,50"`,
`deathride/core/src/test/kotlin/dev/deathride/core/CommerceTest.kt:38 "assertEquals(50,p.condition[p.selectedCar])"`).
The technique asks for a serviceable car, not a repaired one, so this meets it. A player at zero
cash in this mode starts the next race at half condition.

## Applied: the debt clause and the supplied car

The technique's old loan clause said three things:
- repayment comes from net after the cap;
- it "cannot push the take-home below the guaranteed share";
- the loan is optional.

The simulation walked three real cases from this tree under that clause and under the
replacement. The replacement says:
- a debt, chosen or imposed, takes a share of net after the cap;
- it stops at a stated minimum take-home;
- it does not compound;
- the worst result's repayment covers at least one event's interest;
- a seizure supplies a car rather than stranding the player.

1. **The worst race with a loan.** The take-home is 42 of a gross 160.
   - Old clause: **fails**, because 42 is under the guaranteed 64.
   - New clause: **passes**. 42 is above the stated 40, and 8 credited exceeds 6 of interest.
2. **The compulsory league debt.**
   - Old clause: outside its scope, because the debt is not optional.
   - New clause: covers it, with the same arithmetic.
3. **The seized finale.**
   - Old clause: says nothing.
   - New clause: checks the supplied rig, which is whole, has the floor paying and charges no
     service.

The old clause refuses a design whose balance never fell in 248,266 trace rows and never
bankrupted a career. It is also silent on the two things that could actually strand a player
here: a debt whose interest outruns the worst payment, and a seizure with no car.

Verdict: **better**, at the simulation floor. The prediction would be falsified by a career in
which the worst-case credited payment falls below an event's interest while the take-home rule
still holds. In this tree the margin is 2 credits per event at the lowest scale, so a raise in
interest to 8 would produce exactly that case.
