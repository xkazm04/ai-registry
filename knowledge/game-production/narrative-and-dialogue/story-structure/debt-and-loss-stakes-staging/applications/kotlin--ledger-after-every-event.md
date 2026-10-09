---
layer: application
type: application
subject: debt-and-loss-stakes-staging
technique: ledger-after-every-event
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: not-better
---

# Death Ride's Marrow account: one authority, a balance that goes dark

The companion `process` application read the ledger Death Ride's canon and research proposed.
This one reads the ledger the game shipped: the state it keeps, the panel that shows it, and
what that panel says across 2,000 seeded careers. The tree is the `firetv` repository's
`deathride/main` branch at `10974fa3`, read on 2026-10-09. The version witness is
`deathride/gradle/libs.versions.toml:3 "kotlin = \"2.0.21\""`. Anchors are root-relative to that
tree. Nobody has played the campaign, and the careers are AI proxy drivers.

## What the code holds

**One authority, reconciled on load.** The debt lives in one state class with every component
kept apart: interest, paid, diverted, recovered, voided. A save that does not add up is refused:
`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:45 "require(initial+interest-paid+diverted-recovered-voided==debt) { \"Campaign ledger does not reconcile\" }"`.
The phone panel prints the numbers that state serialises, with no arithmetic of its own
(`deathride/controller/index.html:56 "'Last league payment '+c.lastPayment+' / credited '+c.lastCredited+' / diverted '+c.lastDiverted"`).
That is the technique's shared source, held as an invariant rather than a convention. The
project's ledger harness asserts the same identity after every race of every seeded career
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignReport.kt:273 "check(s.initial+s.interest-s.paid+s.diverted-s.recovered-s.voided==s.debt)"`).

**The floor is in the creditor's arithmetic.** A payment can never take the player below a
protected take-home
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:88 "val available=max(0,net-loanPaid-MarketRules[\"minimumTakeHome\"].toInt())"`),
and interest is charged once per event, not per attempt, and stops after event 14
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:74 "if(!s.exposed && s.debt>0 && round<CampaignRules[\"interestThroughEvent\"].toInt())"`).

**The diversion is a line.** A quarter of each payment goes to Marrow's own fleet
(`deathride/core/src/main/resources/data/campaign-rules.csv:6 "divertedShare,0.25"`), and the
panel shows it separately. This is the separated-lines rule doing plot work: the theft can be
read only because nothing is netted.

## What the panel says, measured

The project commits seeded career traces with the league debt after every race. In the newest
(`deathride/evidence/ai/z3/raw/after/timeline-race.csv.gz`, 2,000 careers), the debt first reads
zero at event 7 to 16, with a median of 14. In 1,984 careers that happens at event 14, when Ox
exposes the diversion and the recovered money clears the balance
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:101 "if(round+1==CampaignRules[\"exposeAfterEvent\"].toInt() && !s.exposed)"`).
Only 16 careers pay it off by payments alone. The seizure then fires on a zero balance in every
career that reaches it: 1,085 of 1,085. Three other committed traces agree, with 669, 1,215 and
1,056 of the same. The balance line reads `0 CR` for a median of 21 of the campaign's 35 events.

The panel's threat line is not computed from state. It is one fixed string before the
exposure and another after it
(`deathride/controller/index.html:57 "'Ox exposed the fleet account. Restitution paid '"`, ending
`"All new payments count."`, with `"Marrow takes a cut. Keep your receipts."` before it). One of
those strings stands unchanged for twenty events.

The per-event threat line the technique asks for was written. The line table holds 24 ledger
rows, 15 under the receipt and 9 in the mechanic's voice. One of them is exactly the bridge
the zero balance needs:
`deathride/narrative/lines.csv:185 "Settled in full. The car remains registered. M."`, followed
by `"Registration under review."` at crown-5 and `"Lien posted under clause nine."` at crown-6.
They sit on the triggers `ledger-receipt` and `ledger-open`, which no Kotlin file or controller
script names. As a positive control, the same search finds the `payout-offer` trigger's call
site (`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:86`). The fact those
rows test is written
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:66 "if(p.campaign.initial>0 && p.campaign.debt==0L)f.set(\"debt\",\"paid\")"`),
and nothing reads it for the ledger.

## The verdict, and what the technique gained

A is the technique as written: bind every figure to the owning quantity, separate the lines,
keep the history. This tree does all three, and the account is still empty of stakes for 21
events in every career. That is `not-better`, not because the binding failed but because the
technique had no rule for a balance that reaches zero long before the stake is called. The
design's own answer, moving the leash from money to the car's registration, is authored and
unreachable. So the shipped screen shows a paid-off debt and a static sentence from event 15 to
the seizure. The technique now carries the condition. When the counted quantity can reach zero
before the climax, the threat line must switch, at the payoff event, to the term that outlives
it. A census of the ledger's triggers against the screen that renders the account is the check.

## What this does not show

Whether a player notices the diversion, reads the panel, or feels anything when it reads zero.
The traces predate the tip by five days, and the debt rules have not changed since. Wiring the
ledger rows is a project lead for the owner, not a change made here.
