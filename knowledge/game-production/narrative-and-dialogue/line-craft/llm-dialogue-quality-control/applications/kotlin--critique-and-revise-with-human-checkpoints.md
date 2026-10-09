---
layer: application
type: application
subject: llm-dialogue-quality-control
technique: critique-and-revise-with-human-checkpoints
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: a model's highest mean ships as "the pick the writers marked"

The companion `process` applications read the dialogue protocol in Death Ride's research. Since
then the protocol has been run. On 2026-10-04 a writing session drafted 456 candidates for 45
key slots, had two judges score every one, revised nine weak slots, and wrote a 518-row script
that the Kotlin runtime now loads. This application reads that run's record and the runtime that
consumes it, in the `firetv-deathride` tree at `firetv-deathride` (`deathride/main`, d9990777;
the narrative files are unchanged since 256b8868). Anchors are root-relative to that tree. The
game has not been played, and nothing here shows that any line works in play.

## The run, as recorded

The writer and all four judges were one vendor's models:
`docs/narrative/WRITING-PROCESS.md:20 "a Sonnet-class model (J1) and an Opus-class model (J2)"`,
`docs/narrative/WRITING-PROCESS.md:137 "All four judges were Anthropic models."`. The commit that
landed the script is co-authored by a model, and the report names no person at any step before
the owner's pick, which it leaves for later:
`docs/narrative/WRITING-PROCESS.md:152 "Pick the anchor lines from the top three on the review page, reading each aloud."`

## Confirmed

**Revisions were judged against their originals, blind.**
`docs/narrative/WRITING-PROCESS.md:39 "judged them blind against the two best originals by two fresh judges"`.
When the rewrite lost, the original stood. Ox's boss card kept its round-1 runner-up.

**Bounded rounds.** `docs/narrative/WRITING-PROCESS.md:53 "I stopped after one revision round"`.

**Post-judging edits are recorded.** `docs/narrative/WRITING-PROCESS.md:62 "Two edits after judging,"`
Both edits were made before the final-build lint, so the filter saw the edited text.

## Measured: the originals moved when they were re-scored

An anchor in the revision round is a round-1 line scored again, beside its rewrites, by fresh
judges of the same two model classes. A script parsed all six candidates files and matched each
anchor to its round-1 row by exact text. All 18 matched. As a check on the parse, the same
script reproduced the report's own round-1 table: 456 candidates, means 3.65 and 3.73, Pearson
0.64, 57 passing for both judges, and slot winners by batch of B 17, D 16, C 7 and A 5. The
first-choice and top-3 counts differ by two and three because of how ties are broken.

| Measure (18 anchors, 9 slots) | Value |
|---|---|
| Absolute change in mean score, median / max | 0.30 / 1.05 |
| Signed mean change | -0.31 |
| Anchors whose ship-rule result changed | 5 of 18 |
| Anchor pairs that swapped order | 2 of 9 |
| Slots where the best rewrite beat the best anchor, same draw | 7 of 9 |

The protocol compared each rewrite with the anchors in the same draw, which the drift makes
necessary. A rewrite set against its original's round-1 score would have been credited with
0.31 it did not earn. The decision record for Vex's refusal mixes the two draws:
`deathride/narrative/candidates/turns.md:185 "Judges disagreed across rounds"`. The line it
keeps scored 4.10 in round 1 and 3.30 in round 2, where it ranked third of five.

## Deviation: the runtime ranks the model's pick first

Every `key-pick` in `deathride/narrative/lines.csv` is the writer's call, made by highest mean
or by the revision round. There are 71 of them, and the tree records no person's pick. The
loader treats the status as a person's choice and ranks it ahead of every other key:
`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:99 "the pick the writers marked"`,
`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:101 "options.sortedWith(compareBy<ScriptLine>"`.
Rows in one slot share their conditions
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:11 "only one is shown"`), so
specificity ties and the status decides. In those slots the least-shown rotation never runs.

A census of the loader's rules over the table found 496 usable rows in 479 slots, 13 of them
with more than one row. In 6 of those 13 a `key-pick` is present, and 9 rows never play while
it is eligible. They include Rook's refusal (three silenced) and Vex's refusal. That slot is
the one the record flags as weak and meant to play as two lines, the want and then the close.
At runtime only the close plays: `deathride/narrative/lines.csv:350 "Race me for it. You won't, but race me."`.
The want line never plays: `deathride/narrative/lines.csv:346 "Every haul I've run is in the log under somebody"`.
The project's suite is green over all of it.

## Applied

`experiment`, `better`. A is the loader as shipped, with an unratified pick ranked first. B is
the technique's rule: the mark says who picked, and an auto-pick does not outrank its siblings.
Measured on the shipped table, B gives 6 slots their rotation back and gives 9 rows a turn. In
the one slot the record flagged, B restores the reading the writer intended. Whether rotating
these refusals plays better has not been measured. What is measured is that a label nobody
ratified now decides what the player hears. Nothing was changed in the project.

## Death Ride use

Until the owner picks on the review page, write `auto-pick` instead of `key-pick` and rank it
with the drafts. Keep `key-pick` for lines a person chose, with the picker's name recorded
beside it. Split Vex's refusal into an `after:` chain, so the want line and the close play as
the record intended. Re-score any slot whose decision cites two draws.
