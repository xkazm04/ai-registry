---
layer: application
type: application
subject: regional-culture-worldbuilding
technique: what-the-local-power-wants-and-what-joining-costs
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# In Death Ride's code, joining costs a region nothing

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. The script and the story
bible are read from the same tree. The bible is the head writer's draft, still awaiting the
owner's decision. Nothing has been played.

## What joining changes in the state

When the player wins a region's boss race, `promoted` marks the ally's reward as pending and
clears that rival's grudge
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:100 "p.grudges[rival]=-1"`).
For the foundry boss it also exposes the diversion. Nothing else changes. The ally's own
economy is untouched. Every rival, ally or not, gets the same per-event grant
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:98 "npc.credits+point.rivalGrant"`),
and allies are pinned to zero race effect
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:14 "No unmeasured ally power is supported"`;
`deathride/core/src/main/resources/data/campaign-rules.csv:12 "allyRaceBenefit,0"`). The
payout flows one way, from the ally to the player, as money, a car or a part
(`deathride/core/src/main/resources/data/campaign-allies.csv:2 "rook,scrap-7,350,Trail,tires"`).
As the systems see it, each region is the technique's trophy region.

## Where the bible puts the price

The bible writes a price for each boss, to be shown in the next act. Rook loses the gate and
his car, Ox's furnaces go cold, Vex is erased from the haul contracts, and the pass gets no grit
for winter. Three of the four reach the script only as text. A story card says
`deathride/narrative/lines.csv:47 "Cinder Row's furnaces are cold. The crew eats at the door anyway."`,
the announcer says
`deathride/narrative/lines.csv:165 "No grit going up the pass this winter. The keeper knows why."`,
and Vex's loss is in his barks. These are prices in the region's own currency, and in the
case of the pass the price is what its code protects. The technique's rule for that case is
to move a text-only price onto a screen the player handles.

The fourth price claims data. The bible says Rook "races a Trail (matching
`rival-garages.csv`)" (`docs/narrative/STORY-BIBLE-V2.md:169 "Ash Yards, Needle, bitter collector"`).
He does race a Trail, but at the second tier, because that is his schedule
(`deathride/core/src/main/resources/data/rival-garages.csv:2 "rook,Needle,Trail,Flint,Quill,Kestrel"`).
The pass's boss, who pays no car, has the same schedule
(`deathride/core/src/main/resources/data/rival-garages.csv:4 "mica,Needle,Trail,Flint,Quill,Kestrel"`).
Rook would have moved into a Trail if the player had never come. The rivals panel shows
"ROOK / Trail", so the price is on screen. It is not a loss.

## The A/B, and the condition it earned

Simulation over the four prices:

- **A**, the rule as written: is the price paid on screen, in the region's currency? Rook's
  Trail passes, since the rivals panel shows it. The other three are text only, and A flags
  them for a screen.
- **B**, A plus the counterfactual test (measure the price against a region that did not
  join): Rook's Trail fails, because a non-joining rival on the same schedule has the same car.
  The other three get the same flag as under A.

B catches one false price in four that A passes, and changes nothing else. That
counterfactual rule now sits in the technique and the golden path. The prediction is
falsified by a campaign whose data-carried prices all differ from a non-joining rival's state,
yet still read to players as costless.

## The region-side price this tree could carry

Ally power is forbidden by a balance rule, so the price has to sit on the region's side. That
side has economies of its own to spend from. The per-event grant, the car schedule and the
rival's wallet all belong to the region, and none of them is player power. The bible already
voices one payout as the price:
`deathride/narrative/lines.csv:385 "Grit money. There's no grit coming. Spend it on something that moves."`
Here the reward and the price are the same transfer, seen from the giver's side. That
costs no balance and no new state. The open part is making the next act show it. The pass
runs without grit and the furnace rival races on a reduced grant. Either would be a state
change that the counterfactual test passes.
