---
layer: application
type: application
subject: racing-career-economy
technique: idempotent-race-ticket-settlement
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride's race ticket: one gate, a saved high-water mark, a receipt that lost its debt lines

The companion `process` application read the settlement as a method, at the tree's
2026-10-01 tip. This one reads the code that settles a race today. The tree is the `firetv`
repository's `deathride/main` branch at `d9990777`, read on 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are root-relative to that tree. Every
figure from a career is an AI proxy driver; nobody has played the campaign.

## What holds

**The ticket is issued at start and bounded on both sides.** A race start increments the
profile's counter and returns it
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:126 "return ++profile.startedRaces"`).
Settlement refuses a replay and a ticket that was never issued with one comparison
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:131 "if(ticket<=profile.settledRace || ticket>profile.startedRaces)return null"`).
The career entry point runs the same check before progress moves
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:89 "if(ticket<=p.settledRace || ticket>p.startedRaces)return null"`),
which is the technique's "ticket check ahead of both writes".

**A replay changes nothing, byte for byte.** A test settles a league race twice and compares
the encoded profile
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignTest.kt:31 "assertNull(Career.settle(p,ticket,0,0,position,0,0.0,false));assertEquals(state,ProfileCodec.encode(p))"`).
Comparing the whole encoded save is a stronger test than comparing the balance. It also catches a
replay that leaves the money alone but moves progress or the debt.

**The record is a high-water mark, and it is checked on load.** The save keeps the last settled
ticket, not a set, and refuses one outside the issued range
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:38 "p.settledRace in 0..p.startedRaces"`).
The stored receipt must belong to that ticket
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:98 "require(receipt.race==p.settledRace"`)
and must satisfy the identity
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:99 "require(receipt.gross-receipt.repair==receipt.net && receipt.banked<=receipt.net)"`).
A ticket write counts only once it is durable
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileWriter.kt:23 "nothing counts until it is durable."`).
A high-water mark works here because a career runs one race at a time. Two races open at once
would need the set.

## What moved since the companion read it

Debt arrived after 2026-10-01, in two forms:
- an optional shop loan;
- a compulsory league debt, which the campaign's story imposes.

Both are repaid inside settlement, from net and after the repair cap:
- `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:139 "val debtPaid=min(profile.debt,min(floor(net*MarketRules["`
- `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:140 "val leaguePaid=if(league)Campaign.payment(profile,net,debtPaid) else 0"`

The balance then moves by what is left, under the wallet cap
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:141 "val banked=min(net-debtPaid-leaguePaid,EconomyRules["`).

The receipt did not grow with them. It still has nine fields
(`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:22 "val net: Int,val banked: Int,val balance: Int)"`),
and none of them is a debt take. The takes live in separate profile fields. So the gap between
net and banked on the receipt now holds three different things:
- a loan repayment;
- a league payment;
- the wallet cap's discard.

The load check accepts any split of that gap, because it asserts only that banked does not exceed
net. The full identity, which adds the takes back, exists only in a test
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignTest.kt:27 "assertEquals(r.net,r.banked+p.lastD"`).

Two smaller departures:
- **Restitution moves money with no receipt line.** It is collected while the career prepares
  the settle (`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:90 "Campaign.prepare(p,expectedRound)"`).
- **Rivals have a second ticket gate.** It runs on the same ticket and keeps its own saved mark
  (`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:133 "if(ticket<=p.rivalSettledTicket || ticket>p.startedRaces)return"`,
  `deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:49 "p.rivalSettledTicket=ash[2]"`).

  Each gate is idempotent on its own. The technique asks for one gate to be authoritative. Here
  there are two, so a save could hold the player's settlement without the rivals' and still load.

## Applied: every take from net is a receipt line

The simulation walked three receipts from the tree's own data under both rules. The data is
`deathride/core/src/main/resources/data/market.csv:7 "repaymentShare,0.20"` and
`deathride/core/src/main/resources/data/market.csv:8 "minimumTakeHome,40"`.
- **The worst campaign result with a loan.** The values are gross 160, repair 96, net 64, loan
  12, league 10, banked 42.
- **A result at the wallet cap with no debt.** Net 64 and banked 42 would be the cap's discard
  of 22.
- **A league-only result.** Net 64, league 12 and banked 52 in an unexposed act.

The old rule's identity checks gross, repair and net, and checks that banked does not exceed net.
All three receipts pass, and the first two are the same receipt. The new rule makes each take
its own line and closes the identity: net equals banked plus every take plus the cap's discard.
It tells the three apart, and it refuses a save whose takes do not add up.

Verdict: **better**, at the simulation floor. The prediction would be falsified by a screen that
derives each take correctly from fields already on the receipt. No such screen exists. The
phone panel reads the league line from campaign state, not from the receipt
(`deathride/controller/index.html:56 "'Last league payment '+c.lastPayment"`).

## Not measured

How a player reads a receipt whose net and banked differ for an unstated reason was not
measured, and nobody has played the campaign.
