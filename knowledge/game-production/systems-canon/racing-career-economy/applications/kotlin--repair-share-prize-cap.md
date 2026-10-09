---
layer: application
type: application
subject: racing-career-economy
technique: repair-share-prize-cap
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's repair cap: unchanged, and no longer the last take from the prize

The companion `process` application read the cap at the tree's 2026-10-01 tip. This one reads
it on the `firetv` repository's `deathride/main` branch at `d9990777`, on 2026-10-10. The version
witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that
tree.

## The cap

Paid repair is the smaller of the service cost and the rounded-down share of gross
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:137 "val paid=min(service,floor(gross*"`).
The share has one owner, a data row
(`deathride/core/src/main/resources/data/economy.csv:9 "maxRepairPrizeShare,0.6"`), and the code
refuses a share of one or more at load
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:9 "in 0.0..<1.0"`). The receipt
writes the insured remainder as its own field. This is the technique as written.

## Two states where service is zero

Service is now zero in two cases
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:136 "val service=if(profile.manualService || supplied)0 else ceil("`):
- **Manual service.** The player buys repairs in the shop instead. The settlement charges
  nothing, and the car keeps its damage, down to a roadworthy floor.
- **The supplied rig.** While the story has seized the player's car, the player races a rig the
  game supplies at full condition every race.

In both, the cap has nothing to bound. The technique's guarantee, that a bad race keeps at least
40% of its prize, still holds, because nothing was charged. But the inequality is now satisfied
by a zero bill, not by the cap. A test of the cap alone would pass these states without ever
exercising them.

## The takes after the cap

Since 2026-10-01, two repayments come out of net after the cap:
- an optional shop loan
  (`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:139 "val debtPaid=min(profile.debt,min(floor(net*MarketRules["`);
- a compulsory league debt
  (`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:140 "val leaguePaid=if(league)Campaign.payment(profile,net,debtPaid) else 0"`).

So the cap still bounds what repair takes. It no longer bounds what the player keeps. The
participation-floor application works the worst case through: the take-home falls to about
26% of gross.

## Not found

- **A binding rate.** The committed traces do not record repair paid per race, so the
  technique's binding-rate figure cannot be computed from them.
- **A pre-race preview of the charge.** The core serializes the charge only on the receipt,
  after the race
  (`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:24 "val json get()="`). The
  controller UI was not audited for a preview, so this is unverified, not absent.
