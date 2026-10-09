---
layer: application
type: application
subject: racing-career-economy
technique: repair-share-prize-cap
stack: process
status: forged
verified_on: 2026-10-10
---

# The insured repair share in a Fire TV combat racer's settlement

Source tree: the Death Ride combat racer for Fire TV (source repo root `firetv-deathride`).
It was first read at tip `9793226` on 2026-10-01. Every anchor was re-resolved at `deathride/main`
`d9990777` on 2026-10-10. By then the next phase's design notes, once a separate content tree
marked "content tree" below, were committed in the same tree. The game is a
Kotlin core with data tables. This application reads the settlement path as a methodology, because the
repair cap, the floor, the ticket, the wallet cap and the receipt identity are one function in this code.

**Honesty first.** Every economy figure below is the output of an abstract seeded model with an assumed
outcome distribution, or of a proxy driver. The shop design says so about its own device test:
`docs/concepts/deathride/W5-parts-and-shop.md:40` "This verifies settlement/save plumbing". No person has
played a career end to end, and none of the feel claims were measured.

## The three lines

`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:133` "val gross=floor((" builds gross as a flat participation amount plus the position prize plus a capped wreck bounty plus a campaign bonus, scaled once by a reward scale.

`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:136` "else ceil(max(0.0,maximum-hp)*" prices the damage that actually happened, from hit points lost and a per-point rate, rounded up. Since 2026-10-01 the same line sets service to zero in two states: manual service, and the supplied rig the player races while the story holds their car. The kotlin applications read those states.

`deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:137` "val paid=min(service,floor(gross*" is the cap: the smaller of the true service cost and a rounded-down share of gross.

The values are data, not code. `deathride/core/src/main/resources/data/economy.csv:9` "maxRepairPrizeShare,0.6"; `deathride/core/src/main/resources/data/economy.csv:5` "participationCredits,90"; `deathride/core/src/main/resources/data/economy.csv:6` "wreckBountyCredits,15"; `deathride/core/src/main/resources/data/economy.csv:7` "paidWreckCap,2". The worst case is built from the floor and the share together: gross is at least 90 plus the smallest position prize, and 40% of it survives.

## What the design says, and what it measured

The design states the pair as a rule of the system: `docs/concepts/deathride/W5-parts-and-shop.md:7` "A participation floor plus insured pit-service cap means even a wreck with zero starting cash can start the next race fully repaired." The same line adds "There is no debt or entry fee.". That was true at the first read and is stale at `d9990777`: an optional loan and a compulsory league debt are both repaid inside settlement now. The receipt carries the insured remainder as its own field: `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:22` "val repair: Int,val insurance: Int".

The simulated outcomes come from 2,000 seeded 100-race careers per scenario over 13 scenarios, an abstract model: `docs/concepts/deathride/W5-parts-and-shop.md:31` "not millions of simulated physical races". A permanent last-place wreck still earns 40 CR a race, buys its first part after three races and ends with 429 CR, with zero bankruptcies. The tornado over final cash ranked reward size first at 4,883 CR of swing, repair rate second at 2,461 and prices third at 2,221: `docs/concepts/deathride/W5-parts-and-shop.md:33` "The tornado ranks absolute final-cash swing". That is the evidence behind the technique's claim that repair deserves the same sweep as a headline price. The assumed player-outcome frequencies in that model are unmeasured, and the document says so.

## The identity is enforced on load

`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:99` "require(receipt.gross-receipt.repair==receipt.net && receipt.banked<=receipt.net)" runs when a save is decoded, so a profile whose stored receipt violates the identity is a corrupt save, not a plausible one. This is an upward lesson: the first draft of the technique enforced the identity only on write.

## Deviations and things the code taught

- **The floor is additive, not a table row.** The first draft said the lowest prize must be positive; the code adds the participation amount to every result: `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:133` "val gross=floor((EconomyRules[" opens the line that adds the position prize. That is a better shape and the technique now names it.
- **Net and banked are different lines.** At the first read, banked was net under the cap alone. At `d9990777` it is `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:141` "val banked=min(net-debtPaid-leaguePaid,", so the gap between the two lines now also holds two debt repayments that the receipt does not itemize. The kotlin ticket application reads the consequence. The cap itself is at `deathride/core/src/main/resources/data/economy.csv:4` "creditCap,8000". The receipt shows both lines. The first draft had no second line.
- **A repeated ticket returns null, not the stored receipt.** `deathride/core/src/main/kotlin/dev/deathride/core/Garage.kt:131` "if(ticket<=profile.settledRace || ticket>profile.startedRaces)return null". It changes nothing, which is the guarantee; it is not the stricter form the draft preferred. The technique was relaxed to accept a distinguishable refusal, and it now also names the upper bound the code checks.
- **No gap on the cap itself.** The 0.6 share, the round-down on the share and the round-up on the service price agree with the technique.
- **Debt arrived after the first read.** The design added optional loans: `docs/concepts/deathride/C3-combat-economy.md:7` "Loans are optional; repayment leaves a positive insured income floor." (once the content tree, now committed). The technique's rule that repayment come out of net after the cap is taken from that sentence. Its measured cost is `docs/concepts/deathride/C3-combat-economy.md:25` "repays 330 credits on a 300-credit loan" (once the content tree, now committed), which is why the baseline policy does not need it. The campaign later added a compulsory league debt beside the loan. Its repayment stops at a flat 40-credit take-home rather than at the cap's share; the kotlin floor application works the worst case through.
- **Progress is gated separately and the money is not.** `deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:82` "car.lap.progressM>=world.track.lengthM*get(" qualifies a wreck-out, and `deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:101` "Complete a lap or make progress before a wreck" refuses promotion. `deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:93` "check(Economy.settle(p,ticket,position,kills,hp" then runs whether or not the result advanced, so an unqualified result is still paid and repaired. The qualifier concerns the player's own wreck-out, not the bounty for opponents; the first draft of the qualified-wreck technique had it the other way round. The minimum is `deathride/core/src/main/resources/data/career-rules.csv:2` "minimumWreckProgressFraction,0.20".
