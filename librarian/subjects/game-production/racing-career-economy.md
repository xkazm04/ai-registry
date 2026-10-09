---
subject: racing-career-economy
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# racing-career-economy

A systems-canon subject with seven techniques. Before this run it had two `process` applications.
Both read Death Ride's settlement code and design documents at firetv `9793226` (2026-10-01). It
had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-rce-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. Three
lanes ran:
- a field lane that read the firetv `deathride/main` tree at `d9990777` and its committed seeded
  career traces (`deathride/evidence/campaign/design-v2/after/`, 2,000 AI-proxy careers per
  buying policy);
- a counter-evidence web lane;
- a training-data-only blind lane.

The rank was real, and the subject had moved under it. In the 446 commits since `9793226`, the
game added:
- a loan;
- a compulsory league debt;
- a car seizure with a supplied rig;
- persistent rival garages;
- per-class upgrade caps.

**Widened: seven kotlin applications (kotlin@2.0.21), one per technique.** Every anchor holds
(108 across the seven).
- **`kotlin--participation-floor-no-dead-end`** (simulation, better).
  - The floor is additive, and entry never checks cash. A test runs 100 worst results at maximum
    debt in every act.
  - The traces show 0 negative-income rows in 248,266 and 0 of 4,000 careers bankrupt.
  - Both debts repay after the cap and stop at a flat 40-credit take-home. The worst campaign
    race takes home 42 of a gross 160, which is 26%.
  - Seizure supplies a rig, and manual service leaves the car roadworthy at 50%.
- **`kotlin--idempotent-race-ticket-settlement`** (simulation, better).
  - The ticket is bounded on both sides, and the settled mark is checked on load. A replay test
    compares the whole encoded profile.
  - The receipt has no debt line, so net minus banked mixes three takes.
  - Restitution moves money with no line, and rivals have a second ticket gate.
- **`kotlin--repair-share-prize-cap`** (code read).
  - The cap is unchanged at a 0.6 share held in data.
  - Service is zero under manual service and in the rig.
  - The cap no longer sets the take-home.
- **`kotlin--rival-shopping-windows-no-player-read`** (traces).
  - It is the ceiling-and-grant form, with a flat grant.
  - Rival wallets fill from the player's races, and a test codifies it.
  - Measured residual: the realised field's rating spreads by up to 18 points (sd 3.92) at event
    14 across 2,000 careers. The spread runs from event 14 to event 21 and is about 0 elsewhere.
  - The blindness test covers the window table only.
- **`kotlin--pr-ratio-boss-dip`** (traces, simulation, unmeasurable).
  - The authored boss targets at events 21 and 28 no longer dip (0.98), and the design document
    still says 0.89.
  - The realised dips are 0.830, 0.865, 0.898 and 0.970, set by the field-tier step.
  - Walls under the pre-HEAD boss rule: a mean 20.25 attempts at event 21 with 712 careers
    censored (race buyer), and 33.57 attempts at event 7 with 664 censored (pr buyer).
- **`kotlin--finite-garage-end-state-honesty`** (traces, simulation, unmeasurable).
  - Inert offers are exact by stat comparison, but there is no completion state.
  - 1,143 and 1,258 careers end at the 8,000 cap. Every capped row has no useful offer, mostly
    at a boss being retried.
- **`kotlin--qualified-wreck-advancement`** (code read and traces).
  - Both rules are realized. Unqualified rows pay a minimum of 455 and advance 0.
  - A full-field destruction bonus of 60 sits outside the bounty cap.
  - The receipt lacks the paid-wreck count.

Trace provenance: the traces were committed at `f886edc8`. That is before `c082fd4b`
(first-place boss promotion) and `a053c363` (shorter laps). The money code and data are
unchanged since, so the money figures stand and the attempt counts need a re-run. I re-counted
the following myself from the gzipped traces before citing them:
- the career completion, cap and censor counts;
- the field-rating spread per event;
- the ratio means;
- the event-21 attempt mean.

**Both `process` applications were re-resolved at `d9990777`.**
- Repair-share: 13 anchors held, 8 moved and 2 were absent. Now 23 of 23 hold.
- Rival: 7 held and 4 moved. Now 11 of 11 hold.

Stale claims corrected:
- service prices the damage (it is now zero in two states);
- banked is net under the cap alone;
- "There is no debt or entry fee." (W5:7);
- no rival shopping window exists as running code;
- the 1.05 finale.

`verified_on` moved to 2026-10-10.

**Conditions, each reached by two lanes and checked against the current file:**
- **A debt, chosen or imposed, follows the floor's rules.**
  - The rule: a share of net after the cap, a stated minimum take-home, no compounding, and the
    worst result's repayment covering one event's interest.
  - Field: the code and traces above. Blind: "check that last place can at least service the
    interest".
  - It replaces the clause that repayment "cannot push the take-home below the guaranteed share".
    The field refuted that clause as unmeetable by any debt on a worst race, and the tree it
    refuses never lost money.
  - Landed in participation-floor-no-dead-end, repair-share-prize-cap and the golden path.
- **A consequence that takes the car supplies one.**
  - Field: the seizure rig. Blind: "Never seize the only drivable car. Keep a loaner".
  - Web, low: the Juiced restart cash for a player who lost every car, a TV Tropes summary that
    was not re-fetched.
  - Landed in participation-floor-no-dead-end and the golden path.
- **Every take from net is a receipt line, and the identity closes over all of them.**
  - Field: the receipt with no debt line. Blind: the receipt shows "debt interest or payment".
  - Landed in idempotent-race-ticket-settlement and the golden path.
- **A bill that prices wear or car value charges careful driving.**
  - Web: GRID Autosport players, re-read verbatim 2026-10-10: "even without any contact"
    (https://steamcommunity.com/app/255220/discussions/0/46476145398129923/).
  - Blind: value-scaled repair is a tax on progressing.
  - Landed in repair-share-prize-cap and the golden path.
- **The cap sits above the dearest useful offer still on sale.**
  - Web: GT7 raised its earned-credit cap. Re-read verbatim: "Increase the upper limit of
    non-paid credits in player wallets from 20M Cr. to 100M Cr."
    (https://blog.playstation.com/2022/03/25/gran-turismo-7-an-update-from-polyphony-digital/),
    against "three hitting maximum known price of 20 million"
    (https://www.gtplanet.net/gt7-car-list-prices-20220518/). That the backlash was about the
    cap comes from press summaries.
  - Field: the mechanical check run over every capped trace row.
  - Landed in finite-garage-end-state-honesty.

**Bounds and evidence corrections:**
- **"A loss still pays" gets a stakes exception carried by a stated rescue.**
  - Web: EGM on NFS Unbound, re-read verbatim: "the risk of coming out of a race with less money
    than you entered into it with can really make you sweat as a racer—and it's exhilarating"
    (https://egmnow.com/need-for-speed-unbound-impressions/).
  - Blind: stakes designs and a run-level floor.
  - Landed in the golden path and participation-floor-no-dead-end, under "When not to use".
- **Resentment of banding is conditional.**
  - Melder, Game AI Pro ch. 42, re-read verbatim from the PDF text: "When done correctly, this
    effect can be unnoticeable to the player while keeping the racing feeling close and
    exciting. However, when done poorly, it can leave the player feeling cheated, especially if
    the AI, racing in the same car as they, obviously has more speed."
    (https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter42_A_Rubber-Banding_System_for_Gameplay_and_Race_Management.pdf).
  - Cechanowicz et al., CHI PLAY 2014, abstract via OpenAlex: "were preferred by both experts and
    novices" (https://dl.acm.org/doi/10.1145/2658537.2658701). The study balanced humans, not an
    AI field.
  - Depping et al., CHI 2016: "disclosing assistance did not harm play experience"
    (https://dl.acm.org/doi/10.1145/2858036.2858156). It studied an FPS.
  - Pure, Game Developer: "it's not fair, and that unfairness is easy to spot", and the target
    point "depends directly on the player"
    (https://www.gamedeveloper.com/design/the-pure-advantage-advanced-racing-game-ai).
  - The blind lane reached the same split: covert pace passes, visible cheating is resented.
  - Landed in the golden path and rival-shopping-windows-no-player-read. The economy-level
    position is unchanged.
- **"Rather than contested to the end" softened to "keep the last stretch contestable".**
  - Abuhamdeh, Csikszentmihalyi & Jalal 2015, re-read verbatim from the Springer abstract:
    "Although outperforming one's opponent by a wide margin maximized perceived competence,
    these games were less enjoyable than closer games with higher outcome uncertainty"
    (https://link.springer.com/article/10.1007/s11031-014-9425-2). It was a competitive
    zero-sum video game, not a racer.
  - Web only. This corrects an unsourced overclaim, and the old wording is gone.
- **The naive fix's sibling: dropping repair altogether is an honest choice.**
  - Wreckfest early access, re-read verbatim: "5 races in, no money left, knackered car, game
    over." (https://steamcommunity.com/app/228380/discussions/0/485622866437138128).
  - Removal is reported by a non-developer in a later thread.
  - Blind: Wreckfest has no repair economy.
  - Landed in the golden path.
- **The ticket's two-entry-point rule has a public case.**
  - PC Gamer on the NFS Unbound money glitch, re-read verbatim: "quit the game as soon as the
    cutscene starts" and "you should have the rewards, but you'll still be able to race the
    qualifier again"
    (https://www.pcgamer.com/need-for-speed-unbound-money-glitch/).
  - Landed in idempotent-race-ticket-settlement's evidence grade.
- **No shipped precedent was found** for a share-of-prize repair cap or for rivals buying from
  the player's catalogue on a schedule. This comes from a non-exhaustive search, and the
  evidence grades say so.

**Verified and left:**
- The per-race bounty cap. A FlatOut 2 speedrun guide documents farming opponents by lapping
  them (https://www.speedrun.com/flatout_2/guides/lhicr), which is the faucet the cap answers.
- The ticket and the receipt identity on load.
- The qualified-wreck progress rule.
- The transitive rival audit. The field measured it rather than refuting it.

**Declined, not landed:**
- **"The floor is needed only where a mandatory cost exists."** Rock n' Roll Racing and Death
  Rally paid nothing for last place with no dead end. Web only, and it is not in the techniques.
- **A boss step should be telegraphed or graduated.** GameSpot on NFS Most Wanted. Web only.
- **Management bankruptcy as a named counter-case** (Motorsport Manager). Web, low, one lane.
- **A cap binding while the player is stuck at a stage reads as a wall, not as generosity.**
  Field only. It was drafted into finite-garage-end-state-honesty and removed before commit. It
  stays in the kotlin application.
- **The Forza 2005 "repair deducted from winnings" praise.** Quoted second-hand and not
  re-fetched. It was removed from the repair technique before commit.

## Impact

The subject joins **0 contexts** across the 12 mapped projects. This was checked by reading each
registered project's committed `.ai/registry-map.json`, with a positive control: pof joins
game-economy-tuning 21 times. No verdict went stale, and no `/conform --stale` queue exists.
firetv, the only tree with the seam, has no map and is registered only by a sibling's
uncommitted `projects.json` change in the shared tree, which this run did not touch. Return:
re-run the map once that registration lands.

## Applied

- **participation-floor-no-dead-end + golden path (debt rules; supply a car)** - firetv -
  simulation - better.
- **idempotent-race-ticket-settlement + golden path (a line per take)** - firetv - simulation -
  better.
- **finite-garage-end-state-honesty (cap above the dearest useful offer)** - firetv - simulation
  - unmeasurable.
- **pr-ratio-boss-dip + golden path (keep the last stretch contestable)** - firetv - simulation
  - unmeasurable.
- **Banding resentment bound** - unapplied. No in-race pacing exists in the tree.
- **Wear/value repair** - unapplied. The bill is damage-only.
- **Stakes exception** - unapplied. No buy-in exists.

## Open leads (banked, convergence rule applies)

- **Diminishing replay payouts for grinding earlier events.** Blind lane only. Return: a field
  or web case.
- **Classification at 75-90% distance, as in motorsport, against a minimum share of the
  course.** Blind lane only. Return: a second lane.
- **Telegraph the boss step.** Web (GameSpot) only. Return: a second lane, or a field case where
  the rival rating shown before a boss changes attempts.
- **The floor is needed only where a mandatory cost exists.** Web only. Return: a second lane.
- **A wall reads as a full wallet with an empty shop.** Field only. Return: a second tree or a
  web case.
- **Project leads in firetv, not registry content.** These wait on the owner:
  - add debt and restitution lines to the receipt, and close the identity on load;
  - add the paid-wreck count to the receipt;
  - test blindness on the realised field across two careers;
  - narrow `RivalEconomy.prepare`'s signature;
  - re-run the design-v2 traces under the first-place boss rule;
  - fix the PROGRESSION.md:79 boss-target drift and the stale W5:7 line;
  - add a garage-complete state.

## Saturation

Depth rung L3: a code read, two re-anchored applications, and counts recomputed from 4,000
seeded careers. Last-pass yield:
- 7 applications;
- 5 two-lane conditions;
- 6 bounds or evidence corrections;
- 5 stale claims corrected.

Clocks: the derived per-stack windows. The vendor web evidence has no clock of its own. Demand:
none mapped. dry_streak 0.
