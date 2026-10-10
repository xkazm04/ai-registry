---
layer: application
type: application
subject: short-form-cards-and-barks
technique: barks-that-survive-repetition
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: what one evening of the campaign makes a player hear

This application counts the repetition in running code. The `process` application beside it
reads the pool rules in the game's research dossiers. The tree is the `firetv` repository's
`deathride/main` branch at `d9990777`, read on 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played by a person. The
figures come from a headless run of the game's own director over the whole campaign. Anchors
are root-relative to that tree.

## How a bark is chosen

The director speaks a bark only if three gates are open. There is a 6-second gap since the
last bark, a cap of 14 barks per race, and a quiet screen
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:182 "if(raceClock-lastBark<minGap || barkCount>=14 || needIdle && !idle)return false"`).
Each speaker and trigger pair also waits 25 seconds before it can fire again
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:184 "+25.0>raceClock)return false"`).
Inside a pool, the picker takes the writers' marked line first, then the line with the most
conditions, then the line heard least often
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:101 "{-it.terms.size},{shown[it.id]?:0},{it.id})).first()"`).
The heard counts live in one map for the lifetime of the director
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:19 "private val shown=HashMap<String,Int>()"`),
and the game holds one director (`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:37 "private val script=ScriptDirector()"`).
So an evening of play rotates each pool by least heard. Nothing rotates across evenings.

The table has 98 usable bark and taunt rows in 64 pools, one pool per speaker and trigger.
Most pools hold one to three lines.

## The census

- **Setup.** The census ran in a scratch worktree of `d9990777`, which was deleted afterwards.
  Nothing was committed to the project. One test drove the campaign's 34 non-finale events in
  order for each of three seeds. The rival fields came from the campaign's own economy at
  difficulty 1, and the game's AI drove the player's car at Club skill as a stand-in for a
  person. After each boss race the probe applied the real promotion and rival settlement, so
  allies and grudges changed as they would in play.
- **Instrument.** One `ScriptDirector` ran for each sitting, as in one evening. It was called
  once per 60 Hz simulation step, and every caption that became visible was recorded.
- **Scope.** Every event was cleared at the first attempt. A real evening has retries, which
  only add hearings, so these counts are a floor.

| Sitting | Barks heard | Distinct lines | Repeats | Most-heard line | Lines heard 5+ times |
| --- | --- | --- | --- | --- | --- |
| seed 1 | 143 | 38 | 105 (73%) | 10 | 14 |
| seed 2 | 156 | 33 | 123 (79%) | 14 | 13 |
| seed 3 | 143 | 30 | 113 (79%) | 12 | 15 |

That is about 4.3 barks a race. Barks heard per sitting, by trigger:

| Trigger | Heard per sitting | Pool lines (all speakers) |
| --- | --- | --- |
| grid | 34.0 | 18 |
| hit-by-player | 33.0 | 12 |
| last-lap | 30.3 | 6 |
| overtakes-player | 19.7 | 10 |
| finish-ahead | 12.7 | 5 |
| overtaken-by-player | 12.3 | 11 |
| near-rival | 5.0 | 6 |
| wrecked-by-player, wrecks-player, low-hp | 0 | 23 |

31 of the 64 pools never fired in any sitting. Across pools, size and firing rate correlate at
only 0.48.

## Reconciliation against the technique

**Confirmed: the line that wears out is the specific one.** The most-heard line in every sitting
is a joke with a punchline, in a two-line pool on the second-commonest trigger
(`deathride/narrative/lines.csv:436 "Don't touch the paint. The paint's faster than you."`).
It was heard 10, 14 and 12 times. Two lines behind it are also jokes
(`deathride/narrative/lines.csv:469 "That goes on my repair slip. I'll read it twice."`,
`deathride/narrative/lines.csv:412 "Collected. Don't tell anyone I enjoyed it."`). The
attitudinal lines heard almost as often are the kind the technique expects to survive
(`deathride/narrative/lines.csv:455 "Last crossing. Quiet now."`,
`deathride/narrative/lines.csv:472 "Final leg. Delivering."`).

**Confirmed: the writing effort went where the writer imagined the drama.** The last lap is the
third-commonest bark in the game. It has one line per speaker, so each of those lines is heard
seven to ten times a sitting. Crashes have 23 lines between three triggers, and those lines
were never heard. This is the technique's naive pool, measured.

**Upward lesson 1: count what the player hears, not what happens.** The neighbouring
`condition-tagged-line-tables` application measured the hit event on the same tree. Its
predicate fired 2,537 times in 102 races, and 460 lines were spoken after the gates
(kotlin--react-to-what-the-player-caused, in that subject). That is about one hearing for every
five and a half events. A pool sized to event counts is five times too large for this game's
gates. The wear the census measures follows the heard count. So the technique now counts fires
after the selection gates whenever the gates exist.

**Upward lesson 2: "prefer silence to a repeat" cannot be absolute.** Applied literally (no
line heard twice in a sitting), the rule would have silenced 77% of the barks each sitting
heard. A cap of three hearings silences 44%, and a cap of five silences 23%. These figures
were computed after the run from the recorded stream. A silenced bark would have freed its
6-second gap for another line, so the true losses are a little smaller. A cast that falls
silent three times in four has stopped being a cast. The rule holds for rare-band lines, which
lose everything on a second hearing. An attitudinal line is written to be recognised and may
repeat on its band's horizon. The technique now says so.

**Deviation: one line per speaker on a common trigger.** The `last-lap` and `finish-ahead`
pools are single lines, and the `hit-by-player` pools hold two. Under the technique's band
rule, a trigger heard about 30 times a sitting needs either plain lines or more of them. The
punchline lines on `hit-by-player` belong on a rare trigger.

**Not answerable here.** In these sittings the crash and low-health pools never fired. The
census does not say whether that is because the AI stand-in wrecks less than a person or
because the gates were closed when those events came. A person who wrecks rivals often would
hear the crash pools. Whether these repeats grate is a question for a person on a
sofa. The census only says how many there are.

## The A/B behind the verdict

- **Arm A** sized pools by event counts, which is the technique's old basis.
- **Arm B** sized them by heard counts after the gates.
- **Measurement.** Each arm's figure for the commonest triggers was compared with the measured
  wear. Arm B predicts the measured hearings: 33 hit barks a sitting across six speakers, with
  the most-heard two-line pool reaching 10 to 14. Arm A predicts about 25 hit events a race, or
  roughly 850 a sitting, which overstates the hearings by about the gate ratio.
- **Verdict.** Better. The cost is that the heard count exists only once the selection table
  does. Before that, the writer counts events and labels the figure as an upper bound.
