---
layer: application
type: application
subject: regional-culture-worldbuilding
technique: follow-the-money-as-map-structure
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's purse climbs with the chain; its costs do not

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10, six
days after the process application read the research dossiers. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that tree.
Nothing here has been played. The question it answers is the one the process application
left open: does the economy the player handles read from the supply chain the story claims?

## The income side carries the chain

Every career race settles through one formula, and its region-dependent input is a single
multiplier on participation money, the finishing prize and the wreck bounty
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:133 "val gross=floor((EconomyRules["`).
The career passes that multiplier from the curve
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:93 "rewardScale=CareerCurve.all[expectedRound].rewardScale"`),
and the curve holds it constant within a region and higher in every region closer to the
Crown: 1.6 in the yards
(`deathride/core/src/main/resources/data/career-curve.csv:2 "scrap-1,1,0,367,0.89,1.6"`),
2.2 at the foundry and on the salt
(`deathride/core/src/main/resources/data/career-curve.csv:9 "foundry-1,8,1,505,0.89,2.2"`,
`deathride/core/src/main/resources/data/career-curve.csv:16 "salt-1,15,2,620,0.89,2.2"`),
2.4 on the pass
(`deathride/core/src/main/resources/data/career-curve.csv:23 "switchback-1,22,3,655.0,0.98,2.4"`)
and 2.6 at the Crown
(`deathride/core/src/main/resources/data/career-curve.csv:30 "crown-1,29,4,665,0.98,2.6"`).

A gate enforces the direction
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:34 "Division prize scale must not decrease"`),
and that gate is the technique's defend-the-order rule in code. Swap the salt and the pass
with their curve rows, and 2.4 comes before 2.2, so the build refuses the swap. The economy
argues for the route without anyone having to write that it should.

## The cost side is flat

Repairs cost one credit per point of hull
(`deathride/core/src/main/resources/data/economy.csv:8 "repairCreditsPerHp,1"`) times a
`repairScale` that defaults to 1.0
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:128 "repairScale: Double=1.0"`)
and that no caller in the tree overrides. Part prices take a `priceScale` with the same
default and no caller sets it either. Prices and repair costs are the same in the poorest yard
and at the richest track.

The technique's rule is "make it cost more and pay less" where the story says a region is
poor. Death Ride does half of that literally and the other half by ratio. Take a mid-pack
finish from the tree's own tables: participation 90
(`deathride/core/src/main/resources/data/economy.csv:5 "participationCredits,90"`), the mean
of the six finishing prizes (56.7), and the economy model's mean hull loss of 52
(`deathride/core/src/main/resources/data/economy-model.csv:6 "hpLossMean,52"`), at a hull scale
of 1 and with no wreck bounty. The repair then takes 22.2% of the gross in the yards, 16.1% at
the foundry and on the salt, 14.8% on the pass and 13.6% at the Crown, under the 60% cap
(`deathride/core/src/main/resources/data/economy.csv:9 "maxRepairPrizeShare,0.6"`). So the
edge does cost more, relative to what it pays, with one lever. A cost-side lever is only
needed where the story makes a specific price claim, such as a good that is scarce in one
region.

## Where it falls short

**Two links pay the same.** The foundry and the salt share 2.2, though the chain puts the
salt hauls one link nearer the owner. The gate reads "must not decrease", so a tie passes. A
strict increase between regions would make the gate assert the whole chain, not just its
direction.

**The region table holds no economy.** The region rows carry palette, weather, ambience, the
boss and a plot paragraph. None of them carries an export, an import or a price, so the chain
exists only as the order of rows and as prose in the plot column. The curve owns the
numbers. That is one authority, which is right, but nothing ties a curve row to what its
region makes.

**The cut link lands on the player, not the centre.** When the foundry's boss exposes the
diverted payments, the diversion stops
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:90 "val cut=if(s.exposed)0L else floor(amount*CampaignRules["`)
and the stolen money returns as restitution. That consequence is mechanical, as the technique
asks. But it is felt on the player's ledger. The rivals at the centre still receive the same
per-event grant
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:98 "npc.credits+point.rivalGrant"`),
so the Crown does not starve when a link is cut.

**The open-order condition does not apply.** The career is one fixed sequence, so the
bound added on 2026-10-10 for player-chosen region order changes nothing here.
