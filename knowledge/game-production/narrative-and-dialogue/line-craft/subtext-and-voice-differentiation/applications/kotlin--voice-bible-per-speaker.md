---
layer: application
type: application
subject: subtext-and-voice-differentiation
technique: voice-bible-per-speaker
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the script ships in Kotlin, the voice lint stayed in a scratchpad

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on 2026-10-10.
The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are relative to
that root. The sibling `process--voice-bible-per-speaker` application read the research dossier
behind this cast on 2026-10-04. Since then the 518-line script has been wired into the game, so
this application reads what ships, and what guards it.

## What ships and what checks it

The script is loaded as data:
`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:3 "One row of narrative/lines.csv (the 518-line script)"`.
Its tests cover the loader, card coverage, screen fit, scenes and race captions:
`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:9 "Narrative wiring: lines.csv loader, card coverage, fit on the career screen, scenes and race captions."`
No test in `deathride/core` reads the voice bibles. A `git grep` for `VOICE-BIBLES` or "never says"
under `deathride/core` returns nothing.

The writer did build the check the technique asks for, and reports it:
`docs/narrative/WRITING-PROCESS.md:79 "I wrote a lint that runs on every build:"`.
It covered each speaker's never-says rules as patterns, plus every 4-word phrase two characters
share. It found 8 lint hits and 16 shared phrases on the first build, and the writer fixed them.
Then: `docs/narrative/WRITING-PROCESS.md:159 "They are not part of the repository."`. The lint ran
during the writing session only. The bible was consumed while the lines were being written, and
nothing reads it now that the lines are being changed. The script is still a draft awaiting the
owner's sign-off, so the edits that would need the guard are still to come.

## The experiment

This ran in a scratch worktree of `d9990777`. A test class read its rules from
`docs/narrative/VOICE-BIBLES.md` itself, as the technique's single-source rule requires, and ran
over `lines.csv`. The checks were:

- every quoted term in each NEVER SAYS row, matched as a whole word;
- an exclamation ban where the row names one;
- the word range in each RHYTHM row;
- 4-word phrases shared by two speakers;
- 2-word sequences one speaker repeats across four or more lines.

**Mutants** carried the writer's documented first-build defects back into the script. There were
six, each a real phrase from the report placed in lines of the speakers it named:

- "tow it to the" (Marrow and Ox);
- "I can hear it" (the Mechanic and Mica);
- "spend it on something" (Ox and Mica);
- "five seconds a drop" (Vex and the Mechanic);
- three boss loss lines opening "Come back when you";
- the Mechanic blaming the car with the same "not you" move in five lines.

| Arm | Defects surfaced |
|---|---|
| The shipped suite (`ScriptTest`, 13 tests), with each mutant copied into both CSVs | 0 of 6. Green on every mutant. A copy-mismatch control turned it red, so the suite did run. |
| Bible-reading lint, shared 4-grams | 5 of 6, each as a new finding against the clean script |
| Bible-reading lint, same-speaker repetition | the sixth ("not you", 5 lines), but only as a diff. The clean script already carries 26 such repeats, mostly "on the" and "from the". |

On the clean script the shared-phrase check found 8 phrases. These are the two deliberate ones,
"posted under clause nine" and "they hold anything that wants to stay", and they match the
writer's final-build count of 8. That agreement is the instrument's positive control.

## Two rows the bible states but nothing can check as written

**Prose rules read as literal bans.** The 8 entries hold 36 never-says items, and 16 of them carry
a quoted term. The rest are semantic: "a direct threat", "a lie about a part", "a time he can't
prove". Reading the quoted terms straight out of the prose gave 15 hits on the clean script, and
all 15 were false. They came from one rule,
`docs/narrative/VOICE-BIBLES.md:211 "when she can say"`, which quotes "I" and "we" as an
illustration, not as banned words. The only literal hit that names a real break is "boss" in an
owner-kept recording that the game does not play. The single-source rule holds only when the
entry marks which rows are literal bans.

**Rhythm rows that no one ran.** Five entries state a word range, and 93 of their 187 playable
lines fall outside their own speaker's range. 12 of the 19 key picks fall outside it too. Mica's
row reads `docs/narrative/VOICE-BIBLES.md:262 "The fewest words in the cast; 2 to 7 words"`, yet
her median line is 8 words, the same as Marrow's and Ox's. Relay's median is 6.

The blind judging explains it:
`docs/narrative/WRITING-PROCESS.md:35 "brevity alone (A) does not."`. The judges' ten-dimension
rubric preferred concrete, longer lines, and the bible was never brought back into line with
that. The technique's rule is that the bible wins a disagreement with the rubric. Here the rubric
won silently, and the bible now describes a cast the script does not have.

## Verdict

Better, at experiment level. A lint that reads the bible caught 5 of the 6 real first-build
defects, where the repository's own suite caught none. The sixth needs a baseline diff rather than
an absolute gate.

The run also put two conditions on the technique:

- Checkable rows must be written in a form a parser can read. Literal bans need to be separated
  from semantic rules.
- A checkable row has to be run against the script after judging. When most key picks break a
  row, the row is the question.

Nothing was committed to the game. The bibles are a draft awaiting the owner's sign-off. The
return condition: when the owner signs off `VOICE-BIBLES.md`, the lint lands as a test beside
`ScriptTest`, with the literal bans moved into a parseable row.
