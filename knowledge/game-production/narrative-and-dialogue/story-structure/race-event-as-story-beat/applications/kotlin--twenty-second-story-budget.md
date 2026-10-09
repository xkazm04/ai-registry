---
layer: application
type: application
subject: race-event-as-story-beat
technique: twenty-second-story-budget
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
---

# Death Ride's words around each event, counted against the budget

Death Ride is an arcade combat racer for Fire TV with a 35-event campaign. Its research dossier
proposed the twenty-second budget this technique carries (see the `process` application on
four-part delivery). This application counts what the shipped script actually puts before the
grid and after the flag. The tree is the `firetv` repository's `deathride/main` branch at
`d9990777`, read 2026-10-09 and re-resolved 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nobody has played the campaign, and nothing
here was timed on a television.

## No budget is stated in seconds

The project states two figures, and neither is a per-event budget. The first is a speaking
rate for its voiced estimate,
`docs/narrative/WRITING-PROCESS.md:73 "150 words a minute plus pauses; formula, not measured"`.
The second is a length per card line,
`docs/narrative/WRITING-PROCESS.md:143 "Card line lengths fit a 12-word target"`. A per-line
target bounds one line. It says nothing about the card and the scene before the grid together,
which is the deviation the technique's basis rule now names.

## The counts

Whitespace word counts over the 35 events, using the lines the selector picks in a default
first-attempt state:

| Surface | Min | Median | Max |
|---|---|---|---|
| Card | 19 | 32 | 38 |
| Card plus pre-race scene | 25 | 38 | 110 (the finale) |
| The same, finale excluded | 25 | 38 | 74 (`switchback-6`) |
| After the flag | 10 | 11 | 40 |

Eighteen events have no pre-race scene, only the card. Thirty get one announcer line after the
flag. The boss events run longer after it.

At the project's own 150 words a minute, the median event carries about 15 seconds before the
grid and about 4 after. At an adult silent-reading rate of 200 to 250 words a minute, before
correcting for a television read from across a room, that is 9 to 11 seconds. **Confirmed:**
the typical event sits inside twenty seconds on both sides.

## One free beat over, and an undeclared heavy one

`switchback-6` is a qualifier whose scene before the grid is the league owner's private offer
in a mountain hut,
`deathride/core/src/main/resources/data/lines.csv:190 "I kept your bench. Nobody has touched it in thirteen years."`.
It runs 74 words with the card, about 30 seconds at the project's rate. The story bible's
hand-placed list does not include it,
`docs/narrative/STORY-BIBLE-V2.md:51 "Hand-placed beats (never chosen by salience)"`, so by the
technique it is a free beat ten seconds over. **Deviation.** The technique leaves two moves:
declare it a spine beat with its own stated figure, or cut toward the stake. The scene is
already a hub scene, so the overrun spends the player's patience, not their race. The finale,
at 110 words plus the seizure captions, is a fixed beat overrunning as fixed beats may.

## Skipping skips only words

Nothing blocks the race on reading. The countdown clears whatever captions are still up,
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:108 ")clear()"`, and
settlement writes the campaign state whether or not any line was shown. **Confirmed.**

## What this application does not show

The counts are counted, not timed. The technique's basis is seconds from the card's first frame
to the first accepted input, on the shipped display at its viewing distance, and that
measurement has not been taken. Whether players read the 38 words, or learn to skip them, is
play evidence this campaign has not reached.
