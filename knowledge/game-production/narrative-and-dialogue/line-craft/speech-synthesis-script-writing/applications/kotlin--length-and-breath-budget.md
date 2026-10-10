---
layer: application
type: application
subject: speech-synthesis-script-writing
technique: length-and-breath-budget
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the line catalogue's spoken-length estimate against fourteen rendered clips

This application tests the script's own length estimate against the clips the game actually
rendered. The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors
are root-relative to that tree. Nothing here has been played by a person, and no new audio was
rendered for this pass.

## Where the estimate lives and what reads it

The 518-line script is one table, copied into the game's resources and loaded by the Kotlin
`Script` object. Its header carries a spoken-length column:
`deathride/narrative/lines.csv:1 "text,voice_direction,tags,chars,duration_s,status"`. The loader
reads it with a fallback of three seconds:
`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:82 "toDoubleOrNull()?:3.0"`. The director turns it into how long a caption holds:
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:49 "(line.durationSeconds+1.5).coerceIn(3.0,8.0)"`.
No test reads the column against a voice. The script tests guard card width
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:162 "const val MAX_LINE_CHARS=72"`)
and nothing about spoken length.

The column has no generator in the tree; the script arrived whole with the research dossiers.
A least-squares fit over all 518 rows recovers its rule: about **0.377 seconds per word plus
0.316 seconds per sentence**, the same for every speaker, with 363 of 518 rows inside 0.15
seconds of the fit (largest residual 0.82). It prices sentence boundaries, which is better than
words alone, but at one price for the whole cast.

## The experiment

Fourteen of the table's rows are the lines already synthesised, kept as `rec.*` rows beside
their rewrites, for example
`deathride/narrative/lines.csv:294 "He took your car? Right. Right... I thought he might. Come round the back."`.
Each has a measured clip in `deathride/audio/x3/voices/acceptance.json`, with an edited duration
(for that line, `deathride/audio/x3/voices/acceptance.json:1731 "7.047074829931973"`) and the
silent intervals the screen found (below -50 dBFS for at least 0.1 seconds, after an edge trim).
Two estimators were scored against those fourteen durations:

- **A — the catalogue:** the `duration_s` value on the row.
- **B — per-voice boundary price:** words times the voice's speech seconds per word, plus
  interior sentence boundaries times the voice's silence per boundary, both taken as medians of
  the *other* lines of the same voice (leave one out), so no line predicts itself.

Each measured line splits into speech time and interior silence, which shows the two voices
plainly. The Announcer speaks at about 0.29 to 0.40 seconds per word and spends a median 0.17
seconds of silence per interior boundary (range 0 to 0.47). The Mechanic speaks faster, about
0.22 to 0.28 seconds per word, and spends a median **0.70** seconds per boundary (range 0.34 to
1.21). The catalogue charges both 0.377 per word and 0.316 per boundary.

| | median absolute error | largest error | direction |
|---|---|---|---|
| A, catalogue | 1.31 s | 2.37 s | over every one of the 14 lines, by 4 to 53 percent |
| B, per-voice boundary price | 0.48 s | 1.18 s | both directions |

n = 14 clips, one take each, two voices, one engine generation (`eleven_multilingual_v2`).

## What the catalogue gets right for the wrong reason

The catalogue's closest estimate on all fourteen is the line that failed: the Mechanic's seizure
line, estimated at 7.3 seconds and measured at 7.05, with 55.5 percent of it silence. The
catalogue's word rate is too slow for this voice and its boundary price is less than half of
what the voice charges, and on a line of five short sentences those two errors cancel. So the
one row where the estimate looks validated is the row where the render broke. An estimate that
agrees with a render is not evidence that the line is well shaped.

## Verdict

**Better**, measured: pricing the boundary per voice cut the median duration error by about
two thirds against the cast-wide rule on the same fourteen clips. That is the technique's rule,
*learn each voice's pause per boundary from its first renders*, applied to data the project
already had. The model is coarse. It uses a median of seven or fewer lines per voice, it was
fitted on lines of 10 to 17 words, and it under-predicted the failed line by 1.2 seconds,
because that line's boundaries ran nearer a second each. It ranks risk better than the
catalogue does, and it does not certify a line.

## Death Ride use

When a row is voiced, its caption hold comes from the rendered clip's measured duration, not
from `duration_s`. While a row is still a draft, the estimate for a voiced speaker uses that
speaker's measured boundary price. That is about 0.7 seconds for the Mechanic at his current
settings, and it must be re-measured if his settings are re-baselined. Any generator drafting
more lines for him gets that price in its brief. For on-screen-only rows the column is reading
time, and the cast-wide rule is harmless there.
