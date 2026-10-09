---
layer: application
type: application
subject: condition-tagged-line-tables
technique: repeat-avoidance-by-recency-and-cooldown
stack: process
status: forged
verified_on: 2026-10-09
---

# Sizing Death Ride's bark and card pools from hearings

This application runs the repeat-avoidance arithmetic over the pool sizes proposed in the
narrative research for Death Ride, an arcade combat racer of about thirty-five races, in the
`firetv-deathride` tree at `firetv-deathride`. It is a process
realization: a worked sizing pass a narrative lead runs before commissioning lines. The
dossiers are research and design proposals; the game has not been played, no row exists in
code, and every figure below is an estimate stated with its assumption.

Re-read on 2026-10-09 at `10974fa3`: every anchor below still holds. Rows now exist in code. The
shipped runtime gates barks with a 6-second scene gap, a 25-second cooldown per speaker and
trigger, and 14 barks a race. Its bark pools hold one to four rows each, and it ranks
specificity ahead of recency ([kotlin application](kotlin--line-table-schema.md)). This
sizing pass stays an estimate over the figures in the dossiers.

Anchors are root-relative to that tree.

## What the dossiers say

Two numbers sit side by side in the research, and they disagree.

The practice reported by a studio creative director is volume measured in encounters:
docs/narrative/research/R2-game-narrative-craft.md:66 "lines repeat only after" twenty or thirty times,
rated high (source: GeekDad interview with Greg Kasavin, 2019,
https://geekdad.com/2019/10/narrative-and-early-access-supergiants-greg-kasavin-discusses-hades-development/ ).

The dialogue dossier's bark mechanics give fixed pool sizes:
`docs/narrative/research/R3-dialogue-craft.md:135 "4 to 8 lines for common triggers, 2 to 3 for rare ones."`,
with its own confidence note that these are medium and "should be tuned in playtests"
(source: Ryan Matejka, "How To Write Video Game Barks",
https://howtowriteagame.substack.com/p/how-to-write-video-game-barks ). The campaign target is
stricter than either:
`docs/narrative/research/R2-game-narrative-craft.md:253 "no pre/post line for a given rival repeats within a campaign"`.

## The arithmetic

A shuffled bag of n lines returns a given line every n hearings of its row. To reach a
forgetting horizon of twenty to thirty hearings with recency alone, a row needs twenty to thirty
distinct lines. A pool of eight returns each line every eighth hearing.

Take the boss trigger the dialogue dossier writes its example for, "player rams me"
(docs/narrative/research/R3-dialogue-craft.md:144 "player rams me"). Assume, for
illustration, that a region boss shares four races with the player and is rammed three times a
race. That is twelve hearings before retries. A struggling player who retries each of those races
twice hears it thirty-six times. An eight-line pool repeats every line four or more times; the
row needs a cooldown of at least one ram per race and a fall-through to the speaker's general
"hit" row and to a signal (a portrait flinch) for the rest. Retries are hearings — this is the
figure most often left out of the sizing, and in a game whose loss and retry are frequent events
it can triple the count.

For pre-race and post-race cards the campaign target means one line per hearing per rival: a
rival met in six races needs six distinct pre-race cards, and the retry count again multiplies
the pre-race card unless the retry is its own event with its own rows, which the trigger list
already allows (`docs/narrative/research/R2-game-narrative-craft.md:250 "retry"`).

## Confirmed

**Use-once and cooldown flags**, scoped to the race:
docs/narrative/research/R3-dialogue-craft.md:136 "no repeats within a race."

**Rationed standouts** — an upward lesson for the technique, which lacked it:
`docs/narrative/research/R3-dialogue-craft.md:137 "The memorable ones wear out first."`
and the checklist's
`docs/narrative/research/R3-dialogue-craft.md:372 "long cooldown on the standout; never back-to-back from one speaker"`.

**Synonyms are one line** — `docs/narrative/research/R3-dialogue-craft.md:142 "Five synonyms"` —
and the cross-pool phrase rule,
`docs/narrative/research/R3-dialogue-craft.md:371 "No phrase shared with another character or another pool"`.

**Cut-off variants** — another upward lesson:
`docs/narrative/research/R3-dialogue-craft.md:376 "Still makes sense if cut off halfway, or has a cut-off variant"`.

**The cost of a parrot is the voice**, as a low-confidence illustration only:
`docs/narrative/research/R2-game-narrative-craft.md:86 "players made a mod to mute the DJ's repetitive lines"`
(source: https://se7en.ws/modders-finally-shut-up-dj-atomika-in-burnout-paradise-remastered/?lang=en ).

## Deviations

The fixed pool sizes at R3 line 135 are not derived from a fire rate and cannot meet either the
twenty-to-thirty-encounter practice or the campaign target the same research sets; they are a
starting draft count, not a sizing. Clocks are named only as races and "within a race"; a
mid-race bark also needs a seconds clock and a per-speaker talk budget, and once-only scopes
counted per campaign must persist in the save. The playtest audit
(`docs/narrative/research/R3-dialogue-craft.md:404 "Count bark repeats and phrases shared between characters"`)
is the right instrument and should run against simulated sessions before any human plays.

## Death Ride use

Before lines are commissioned, each row gets a sizing line in the table: expected hearings per
campaign for a struggling player including retries, chosen horizon in hearings, resulting line
count, and where the overflow goes (cooldown, a general row, a signal or silence). Rows whose
line count the budget cannot fund are routed before they are written.
