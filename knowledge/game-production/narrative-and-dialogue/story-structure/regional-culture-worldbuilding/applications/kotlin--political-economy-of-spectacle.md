---
layer: application
type: application
subject: regional-culture-worldbuilding
technique: political-economy-of-spectacle
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's balance sheet is a save invariant; its audience is not in the code

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played.

## The player's success is the league's revenue, literally

The technique's most uncomfortable claim is that the protagonist's rise strengthens the system
they mean to bring down. Death Ride makes it arithmetic. Each league race takes a share of the
player's net purse toward the debt
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:89 "floor((net-loanPaid)*CampaignRules["`;
`deathride/core/src/main/resources/data/campaign-rules.csv:5 "paymentShare,0.20"`). The debt
starts at 1200
(`deathride/core/src/main/resources/data/campaign-rules.csv:2 "startingDebt,1200"`), and the
better the player finishes, the more the league takes in that race. Until the foundry boss
exposes the books
(`deathride/core/src/main/resources/data/campaign-rules.csv:7 "exposeAfterEvent,14"`), a
quarter of every payment goes somewhere other than the balance. The player's wins are what
fund the theft.

## The balance sheet is enforced, not described

Most of the technique's balance sheet is prose. This tree turns the league's account with the
player into an identity that a save must satisfy to load:
`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:45 "require(initial+interest-paid+diverted-recovered-voided==debt)"`.
Who paid, who was skimmed, what was recovered and what was voided are separate fields that
must reconcile. The career screen shows the debt and the last payment on every visit
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:835 "LEAGUE DEBT"`). That is
the technique's cheapest visible piece of the balance sheet, a share of the purse shown going
somewhere other than the player.

The bible's table of who profits and who pays covers the league, the announcer, the regional
bosses, the drivers, the debtors racing house cars, the audience and the excluded
(`docs/narrative/STORY-BIBLE-V2.md:239 "The road licences, the book, the purse schedule"`).
Only one row of that table reaches the code: the player's own account with the league.

## Where it falls short

**The audience is not in the systems.** The bible makes the basin's audience the
league's legitimacy: it listens on the radio because it cannot afford the trip
(`docs/narrative/STORY-BIBLE-V2.md:244 "The basin listens on the radio"`). The Crown's ambience
is empty stands. But no state tracks the audience. Its appetite, its loyalty and its
drift to the player's side are all carried by lines and cards. The technique's claim that an
audience with wants is a faction is staged as story, not play.

**The regional bosses' cut is not in the systems either.** Only the player pays the league.
The rivals' settlements go through the same formula with no league payment, so the bosses'
"part of every purse" is prose.

**The motive is not a historical claim.** The league's motive is written as a business
(licences, a cut, the fleet), not as status display, so the condition added on 2026-10-10
changes no verdict here. The fiction chose the purchase reading, which is allowed.
