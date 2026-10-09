---
layer: application
type: application
subject: llm-dialogue-quality-control
technique: measured-banned-pattern-list
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: not-better
---

# Death Ride: the ban list ran once in a scratchpad and is not in the build

The companion `process` application reads the banned-pattern table that Death Ride's research
proposed. This application reads what became of it. The 518-line script now loads into the
Kotlin runtime, in the `firetv-deathride` tree at `firetv-deathride` (`deathride/main`,
d9990777). Anchors are root-relative to that tree. The game has not been played.

## Deviation: the filter guards nothing that ships

The writer's report says the lint is part of the build:
`docs/narrative/WRITING-PROCESS.md:79 "I wrote a lint that runs on every build"`. The same
report puts it outside the repository:
`docs/narrative/WRITING-PROCESS.md:159 "They are not part of the repository."`. No tracked file
holds the list or the lint. The script's suite checks other things: that the bundled copy
matches the source
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:13 "resourceCopyMatchesTheNarrativeSource"`),
coverage, and fit
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:72 "captionsFitTwoLinesOfTheCaptionBox"`).
None of its 13 tests reads a tell, a never-say rule or a shared phrase. The list was checked
once, and any later edit to the script ships unfiltered.

## Measured: the list rebuilt and run at HEAD

The filter was rebuilt from the dossier's text and nothing else: the C4 constructions and
vocabulary (`docs/narrative/research/R3-dialogue-craft.md:380 "A hit rejects the line."`), each
speaker's never-say rows
(`docs/narrative/VOICE-BIBLES.md:39 "a direct threat; a raised voice or an"`), and every 4-word
sequence shared by two speakers. It added one structural entry, described below. Controls ran
before any count: a known positive ("That's the car, not you."), a Marrow contraction, and two
known negatives, a clean Marrow line and a possessive. The first version struck the possessive
"the boy's welding" as a contraction, the control caught it, and the rule was narrowed.

| Result at d9990777 | Count |
|---|---|
| Rows read | 518 |
| C4 construction or vocabulary hits | 0 |
| Never-say hits | 1, the logged override `rec.mechanic.ally` |
| Structural "X, not you" hits | 2 |
| 4-word phrases shared between speakers | 8, two deliberate phrases |

The override is logged with its reason:
`docs/narrative/WRITING-PROCESS.md:97 "means the division boss, not a way of addressing the player"`.
The shared-phrase count matches the report's final build exactly
(`docs/narrative/WRITING-PROCESS.md:90 "3 (all overridden, below)"`). So the script at HEAD is
what the writer's lint left. Nothing has regressed, because nothing has edited it since.

**The yield, measured.** Run over the 456 judged candidates, the filter would have struck 3, or
0.7%. The protocol had predicted half:
`docs/narrative/research/R3-dialogue-craft.md:397 "Expect about half to drop."`. The voice bibles,
never-say lists included, were written before any candidate, and the never-say rows were broken
once in 456, by a Marrow contraction. The scratchpad prompts are gone, so whether those rows sat
in the drafting prompt is not on record. On the full script the first build had 8 lint hits in 518
rows (`docs/narrative/WRITING-PROCESS.md:89 "| First build | 8 | 16 |"`).

**The miss the read-aloud found.**
`docs/narrative/WRITING-PROCESS.md:106 "The Mechanic blamed the car with the same move five times"`.
The C4 regex wants a comma-joined "It's not X, it's Y" and missed the same reversal split by
full stops. The added structural entry is a ", not you|me|yours" tail plus the "That's not
you." opener. It catches the one instance the writer kept on purpose
(`deathride/narrative/lines.csv:512 "It's the rig, not you."`) and a key-pick card the writer's
lint passed (`deathride/narrative/lines.csv:3 "Marrow reads the car's number, not yours."`). The
card is the theme stated outright, so it is either an editorial override or a rewrite. The
report's text does not record a decision either way.

## Applied

`experiment`, `not-better`. A is the build as shipped, with no filter. B is the rebuilt filter
wired where the script's checks live. At HEAD, B catches nothing that A ships unrecorded, apart
from the theme card above. Its value is the next edit, which has not happened, so this run
cannot measure it. The `not-better` bounds the technique: on a script already cleaned once by
hand, a build filter's worth is the edits still to come, and it pays only if it ships with the
script. That is the rule this run added: a filter that runs outside the build guards nothing.
Nothing was changed in the project.

## Death Ride use

Commit the list as a data file with a tier column, and add one ScriptTest case that reads the
file and fails on an unlogged hit. Have the case report rows read and rows struck, so an empty
read fails loudly. Add the "X, not you" shape as a structural entry with a per-speaker rate, and
decide the prologue card. Keep the shared-phrase check in the same case, with the two
deliberate phrases as named exceptions.
