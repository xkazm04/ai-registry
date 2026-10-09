---
layer: application
type: application
subject: racing-career-economy
technique: finite-garage-end-state-honesty
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# Death Ride's shop: exact inert offers, no completion state, a wallet full at a wall

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree. The trace counts come from the committed seeded ledgers under
`deathride/evidence/campaign/design-v2/after/`, with 2,000 careers per buying policy. They are
proxy drivers, and the traces predate the current boss rule.

## The inert state is exact

An offer is useful only if some stat it raises actually rises
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:92 "val useful=before.indices.any { part.bonuses[it]>0 && after[it]>before[it] }"`).
That is the technique's stat comparison, not an exclusion list. The button is enabled only when
the offer is useful, unlocked, below its top tier and affordable
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:96 "!seized && tier<part.maxTier && useful && lock.isEmpty() && profile.credits>=price"`).
The reason string puts seizure first, ahead of the technique's own order
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:95 "val reason=when { seized->"`).
Seizure is the most permanent obstacle a seized player faces, so the order still follows the
technique's principle.

Per-class ceilings were added on 2026-10-03
(`deathride/core/src/main/resources/data/class-upgrade-caps.csv:3 "Line,8.125,10,10,10,10,10,3,10"`).
A test buys out a garage and asserts that nothing remains on offer
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignClassLimitsTest.kt:12 "assertTrue(Parts.all.indices.none{Garage.offer(p,it).available})"`).

A part that is clamped by a ceiling is still sold at full price, but the offer shows the stat
before and after
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignClassLimitsTest.kt:29 "assertEquals(9.0,offer.before[speed]);assertEquals(9.5,offer.after[speed])"`).
This meets the decision rule's "state the usable fraction" half.

Resale stays under the price paid, and installed parts do not survive a trade
(`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:57 "p.owned[p.selectedCar]=false;for(part in Parts.all.indices)p.tiers[p.selectedCar*Parts.all.size+part]=0"`).
A trade swaps the selected car, so the player always owns one
(`deathride/core/src/test/kotlin/dev/deathride/core/CommerceTest.kt:24 "assertEquals(1,p.owned.count{it})"`).

## No completion state

The core code has no garage-complete state, per car or for the career. A search for
"complete" finds only a reward label, which also proves the search works
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:143 "Tier garage complete"`).
The controller UI was not audited for one, so the claim covers the core only.

## The wallet fills at a wall, not at the end

The wallet cap is data (`deathride/core/src/main/resources/data/economy.csv:4 "creditCap,8000"`).
The two buying policies end at the cap as follows:
- the race buyer: 1,143 of 2,000 careers;
- the pr buyer: 1,258 of 2,000.

Every trace row where the wallet sits at the cap also has no useful priced offer: 6,501 of 6,501
for the race buyer and 12,700 of 12,700 for the pr buyer. Most of those rows sit at one boss the
driver keeps retrying: event 21 for the race buyer, event 7 for the pr buyer. The trace column is
written at `deathride/core/src/test/kotlin/dev/deathride/core/CampaignReport.kt:228 "trace.append("`,
and its header names `nextUsefulPrice`.

So the shop runs out for the current tier while progress is blocked. That is not the end of the
catalogue. The technique reads early completion as an economy that is too generous. Here the
same signal points somewhere else: the pacing finding is the wall, and the money has nothing to
do. The pr-ratio-boss-dip application measures that wall.

## A stale design line

The shop design still says
`docs/concepts/deathride/W5-parts-and-shop.md:7 "There is no debt or entry fee."`. The same line
also rules out resale and interest. All three now exist in code
(`deathride/core/src/main/resources/data/market.csv:6 "debtCap,1200"`).

## Applied: the cap sits above the dearest useful offer

The rule added on 2026-10-10 asks that no state with the wallet at the cap hold a useful offer
the player cannot afford. The simulation read three cases from the traces:
- every capped row of the race buyer, 6,501 rows;
- every capped row of the pr buyer, 12,700 rows;
- the dearest next useful part across all rows: 617 credits for the race buyer and 411 for the
  pr buyer, against the 8,000 cap.

The tree passes, and it passed under the old wording too, which asked nothing of the cap's
height. The new rule changes no verdict here, so the result is **unmeasurable**. Car prices are
computed from stats in code and were not tabulated, so a car priced above the cap would fall
outside this check. Return: a tree whose cap binds while a useful offer is still unaffordable.

## Not measured

How a player reads a full wallet and an empty shop while stuck at a boss was not measured.
Nobody has played the campaign.
