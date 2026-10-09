---
layer: application
type: application
subject: ending-first-narrative-structure
technique: back-planned-beat-sheet
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: not-better
---

# Death Ride's script as its own beat sheet: paid on paper, a third of it never fires

The companion `process` application read the research dossiers Death Ride's narrative lead
commissioned. This one reads what the head writer built from them and what the game ships.
The tree is the `firetv` repository's `deathride/main` branch at `10974fa3`, read on
2026-10-09 (the `process` applications call the same checkout `firetv-deathride`). The
version witness is `deathride/gradle/libs.versions.toml:3 "kotlin = \"2.0.21\""`. Anchors are
root-relative to that tree. Nobody has played the campaign.

## The sheet exists, twice

The head writer's story bible carries the back-planned sheet as a table. The locked card
comes first, then the acts with one reveal each, then a 35-event beat table. It also names
the fixed beats:
`docs/narrative/STORY-BIBLE-V2.md:51 "Hand-placed beats (never chosen by salience)"`.
The 518-line script carries the same sheet as data. Every line has a `tags` column, and the
writer marked the ledger in it: `plant:<thread>`, `payoff:<thread>`, `reveal:<thread>`. The
script was wired into the game on 2026-10-06, and the loader reads it as the source of every
story card:
`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:18 "(1..3).map{i->script[i-1]?:row.getValue(\"line$i\")}"`.
So the checks in the technique could be run as a script over the game's own data. Run
mechanically, they had never been run at all.

## The census: three levels of "planted"

A scratch reader parsed `deathride/narrative/lines.csv` and dropped the rows the game never
shows on screen: alternates, unused variants and recorded-voice rows
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:10 "val usable get()=status !in UNUSED_STATUS"`).
That left 496 usable rows, 96 of them tagged plant, payoff or reveal. The checks then ran at
three levels:

- **authored:** every usable row;
- **fired:** rows whose trigger some runtime call site raises;
- **on a card:** rows on the story card every player sees before each event.

**Fired.** Every call site that requests lines was read. The career screen asks for
`pre-race`
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:96 "setOf(\"pre-race\")"`).
The race asks for start, finish, boss-turn and duel lines, plus the bark set. Twenty trigger
kinds have no call site at all: `shop-enter`, `shop-idle`, `ledger-receipt`, `ledger-open`,
`duel-pit`, `phase`, `own-mine-hit` and thirteen more. **101 of 496 usable rows, and 33 of the
96 ledger rows, sit on them.**

The instrument was checked both ways.
- **Positive:** it finds the card, pre-race and boss-turn call sites.
- **Negative:** it reports the ledger triggers unwired, as run dp-dls-1009 found
  independently the same day.
- **Cross-check:** run dp-ctl-1009 also paired each trigger with the kind it is asked for, and
  added facts that nothing writes. That census reached 130 unselectable rows. This one is the
  trigger-only floor of it.

**Shadowed.** Numbered siblings with the same conditions form one slot
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:12 "val slot get()=id.replace"`).
In a slot, the writer's key pick always wins
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:101 "if(it.status==\"key-pick\")0 else 1"`).
Nine rows can therefore never be shown, and two of them are plants. One is the second half of
Rook's refusal. The bible writes it as a sequence. The data holds it as a variant that loses
to the first half:
`deathride/narrative/lines.csv:301 "Nice frame. Never saw it. Now shut your curtain."`
against `deathride/narrative/lines.csv:299 "Kid, I collect for a living. Don't show me things."`.

**One major reveal per unit.** This check passes. Acts 1 to 4 carry one `reveal:` thread
each, both as authored and as fired. On the cards, only acts 1 and 4 carry a reveal. The
reveals of acts 2 and 3 land in the boss-turn scene instead. That scene fires for every
player, because promotion requires first place:
`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:102 "if(events[p.careerRound].boss && position!=1)return CareerResult(false"`.
The Crown's reveal is named in the bible
(`docs/narrative/STORY-BIBLE-V2.md:44 "Marrow's one protected thing is the Voice"`) but is
tagged `protected-thing` rather than `reveal:`.

**Every payoff with plants in two earlier units, and every plant with a payoff.** Run over
the raw tags, both checks fail almost everywhere:

| Level | Payoff rows passing | Plant threads with no payoff |
|---|---|---|
| authored | 2 of 45 | 9 of 19 |
| fired | 1 of 29 | 7 of 11 |
| on a card | 0 of 21 | 9 of 10 |

**Most of those failures come from the tag vocabulary, not the story.**
- The rig is one thread under six names: `frame`, `drum`, `bearing`, `plate`, `watch` and
  `gearbox`. The row that reveals it pays off only two of them
  (`deathride/narrative/lines.csv:98 "Relay's sealed gearbox, seal still on. Rook's tyres. Ox's plate."`
  is tagged `payoff:pardon;payoff:bearing`).
- The ending is tagged `payoff:keys`, and no row is tagged `plant:keys`. Yet three
  always-shown cards hang keys on the Tag Board under an `institution:` tag
  (`deathride/narrative/lines.csv:5 "Forty-one keys on the Tag Board now."`).

So a census over free-text tags measures the tagging. The plant check that tags cannot fake
was done by hand: the final card's prerequisites. It is in the companion
`kotlin--lock-the-final-card-first` application. Of the four objects the card names, one is
planted where every player sees it, and the card's price is planted only on triggers nothing
fires.

## What the project's own test asks

The suite asserts that every event has a scripted card and that the game shows it
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:35 "AshStory must show the scripted card"`).
That guard is real, and it covers only the card channel. Nothing in the suite asks whether
a trigger is ever raised, so the 101 rows pass every gate the tree has.

## Verdict: not better as written

The comparison is between the technique's checks run against the sheet as written (A) and
the same checks run against what the build can show (B).
- A passes rows that B fails: 33 of 96 ledger rows, two shadowed plants, and the plants for
  the final card's price.
- The technique's own text would have certified all of them. Its critical-path check speaks
  of player routes, and here the route the plant missed is the build.

The condition this gave the technique: run the checks against what the build can show.
Unwired triggers and slots the picker never chooses count as unplanted.

A second lesson is banked, not landed, because only this lane reached it: **the mechanical
checks need one thread id carried by plant and payoff alike.** Without it they report
vocabulary, here 43 failures of which most are names.

Not changed in the project. The project leads, which wait on the owner:
- wire the shop and finale-pit triggers, or move their plants onto the cards and scenes that
  fire;
- turn the refusal sequences into `after:` chains rather than numbered variants;
- key the tags by one thread id.

## What this does not prove

Whether any plant registers with a player, or whether the ending moves anyone. The census
counts where lines can appear. It does not count what a player reads. Captions queue and
can be skipped, and a bark is chosen among rivals. The fired level is an upper bound on
reach, not a measurement of it.
