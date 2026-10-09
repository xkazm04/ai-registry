---
layer: application
type: application
subject: antagonist-fair-grievance-craft
technique: rationed-necessity-in-public
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
---

# Death Ride: the leash as constants, one lever at the finale, and a signature nobody reads

This application reads the technique against running code, where the companion `process`
application read only the plan. The tree is the `firetv` repository's `deathride/main` branch
at `10974fa3`, read on 2026-10-09; the version witness is the Kotlin plugin pinned in
`gradle/libs.versions.toml:3` (`kotlin = "2.0.21"`). Death Ride is a top-down vehicular combat
racer for a television whose campaign runs on a debt to the league boss Marrow and ends with
the seizure of the player's car. Nobody has played the campaign: its evidence is automated
tests and scripted runs on the device, and the owner has not accepted the story draft
(`docs/narrative/STORY-BIBLE-V2.md:3 "Head writer's draft, 2026-10-04. **For the owner to accept or reject.**"`).
Nothing below claims a result in play.

## The binding is met: the debt is the player's own money

The technique's fourth property — the antagonist's hand on a resource the player spends — is
real in the runtime. The campaign opens with a debt
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:23 var initial=if(fresh)CampaignRules["startingDebt"].toLong() else 0L`),
each payment is a share of the player's prize
(`Campaign.kt:89 val amount=min(s.debt,min(available,floor((net-loanPaid)*CampaignRules["paymentShare"]).toInt()).toLong())`),
and the balance sits on the HUD
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:835 label("LEAGUE DEBT ${p.campaign.debt} CR / PAID ${p.campaign.lastPayment}",66f,343f)`).
The ledger is one authority with a reconciliation check
(`Campaign.kt:45 require(initial+interest-paid+diverted-recovered-voided==debt) { "Campaign ledger does not reconcile" }`),
which is the [one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)
law held in code: the story reads the economy's number, never states its own.

## Leash or loan, read in code

The arithmetic is a loan. Every term is a constant in one data file
(`deathride/core/src/main/resources/data/campaign-rules.csv:2-7`: `startingDebt,1200`,
`interestPerEvent,6`, `interestThroughEvent,14`, `paymentShare,0.20`, `divertedShare,0.25`,
`exposeAfterEvent,14`), and interest is a flat charge per event until a fixed round
(`Campaign.kt:74 if(!s.exposed && s.debt>0 && round<CampaignRules["interestThroughEvent"].toInt()) {`).
A player who wanted to could compute the date of freedom. Nothing at runtime lets Marrow revise
the rate, the unit or the prices, and his own line admits it
(`deathride/core/src/main/resources/data/lines.csv:513 "Again. The terms have not changed."`).

Two creditor moves make it a leash anyway, and neither is one of the four levers the technique
lists. **The posting.** A quarter of every payment never reaches the balance
(`Campaign.kt:90 val cut=if(s.exposed)0L else floor(amount*CampaignRules["divertedShare"]).toLong()`;
`Campaign.kt:92 s.paid+=amount;s.diverted+=cut;s.debt-=amount-cut`), shown on screen as
`RaceGame.kt:862 "DIVERTED ${p.campaign.diverted} CR"`. He does not change the rate; he
controls how much of what you pay counts, which is the same lever with a different handle,
and it is exposed and refunded at a fixed event (`Campaign.kt:101-103`). **The clause.** The
seizure ignores the balance entirely: it fires on the elimination event whatever the player
owes (`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:21 if(!Career.events[p.careerRound].elimination || seized(p))return`),
and the scene names the new term (`lines.csv:197 "Clause nine. You will find it on the back of your copy now."`).
That is the decision rule's "use it once, visibly", and the foreshadowing that makes it a
leash rather than a twist does reach the player once, as an announcer notice before the
penultimate event (`lines.csv:142 "From the book: a lien has been posted under clause nine. In good order."`).

So the runtime meets the rule's intent with a narrower instrument than the technique imagined:
the creditor's control lives in what is credited and in a clause added late, not in the rate.
That is the honest reading for an economy the balance tests pin to constants.

## What the runtime does not carry

**No necessity is rationed, in public or anywhere.** The story's necessity — fuel, grit and
food moving between regions because the races exist
(`STORY-BIBLE-V2.md:198`) — has no quantity in the economy: a word-bounded search of
`deathride/core` and `deathride/game` for ration, rationed, rationing and medicine returns
nothing (the same search finds `debt`), and fuel exists only as a race consumable
(`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:15 const val SPIKES=0;const val TURBO=1;const val FUEL=2;const val SABOTAGE=3`).
The queue, the elevated place and the community's visible complicity are absent. Under the
technique's own law the story should not stage a scarcity the economy does not hold, so the
rationing scene is either an economy change or a cut, decided before any card is written.

**The signature proxy is authored and unwired.** Fifteen receipt remarks signed by Marrow are
in the script (`lines.csv:175 "Four lines. Each one fair. M."`; `lines.csv:178 "The levy keeps the road open. You are welcome to walk instead. M."`;
`lines.csv:187 "Lien posted under clause nine. In good order. M."`), all keyed to a
`ledger-receipt` trigger that no Kotlin file names (searched at `10974fa3`; the same search
finds `pre-race`, which the script director handles). The receipt the player sees carries no
signature (`RaceGame.kt:899 label("PRIZE ${receipt.gross} / PIT ${receipt.repair} / DEBT + CAP ${receipt.net-receipt.banked}",291f,245f,accent)`).
The purest proxy in the sibling technique — his name on every transaction — is therefore the
one the running game lacks, and the live proxy is the announcer's "From the book" notice
(`lines.csv:137 "From the book: interest on Yards accounts is suspended. The league is generous."`).
The one line that offers the player the door (`lines.csv:178`) is among the unwired.

**The protected thing's payoff is unwired the same way.** The finale line that collects
Marrow's attachment is keyed to a finale-phase condition
(`lines.csv:497 fin.p3.marrow,marrow,finale,crown-7,phase,finale-phase=3,Do not round it.`)
that no Kotlin file reads (`finale-phase` searched at `10974fa3`; the same search finds
`seizure` in `deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:92`). The
seizure, the clause and the debt arrive in play; the price he pays does not.

## What transfers

- **A leash can be built from fixed terms** if the creditor holds the posting or can add a
  clause, and the addition is foreshadowed once in public. The technique's lever list (unit,
  store, repair price, rate) is not exhaustive; this tree adds two.
- **Check the proxy against the trigger table, not the script.** A script can hold every
  signed remark and the runtime still show none of them; the gap is invisible from the
  writing side.
- **A necessity the economy does not hold is a story claim with no authority behind it.**
  Read the economy before staging the queue.
