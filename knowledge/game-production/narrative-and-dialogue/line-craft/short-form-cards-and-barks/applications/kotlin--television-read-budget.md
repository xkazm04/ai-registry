---
layer: application
type: application
subject: short-form-cards-and-barks
technique: television-read-budget
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: a card budget enforced by a test, and the line breaks the renderer throws away

This application reads the text budget as code, and measures it with the game's own font proxy.
The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing
has been read from a sofa. Anchors are root-relative to that tree.

## The budget the code holds

The game draws on a fixed 1280 by 720 stage
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:64 "private val view=FitViewport(1280f,720f)"`).
A unit test holds the card budget, measured with a desktop font as a proxy for the device font
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:168 "Font.PLAIN,20)"`). The test
says the proxy errs wide
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:160 "is a little narrower, so this errs on the side of reporting an overflow"`).
The budget allows a 72-character card line
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:162 "const val MAX_LINE_CHARS=72"`)
and five rows of card text
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:167 "const val CAREER_BUDGET_LINES=5"`).
A second test holds every spoken caption to two rows of its box
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:72 "captionsFitTwoLinesOfTheCaptionBox"`).
Timed captions stay up for their spoken length plus a second and a half, between 3 and 8
seconds
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:49 "(line.durationSeconds+1.5).coerceIn(3.0,8.0)"`).
Cards are not timed. They sit on the career screen until the player moves on, and they are not
voiced (`deathride/narrative/lines.csv:4 "Not voiced: story-card caption, read at TV distance"`).

That is most of the technique. The type size is fixed before the text is counted. A test, not
a reviewer, holds the budget. Bark captions are capped at two rows, and cards are read at the
player's pace.

## What the renderer does with three authored lines

The writers author each card as three lines, one job per line. The career screen joins them
with spaces and wraps the result as one paragraph
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:834 "detail.wrapped(DeathDuel.story(p).lines.joinToString("`).
The wrapper would honour a hard break, because it splits on newlines before it wraps words
(`deathride/game/src/main/kotlin/dev/deathride/game/GlyphLayer.kt:32 "for(paragraph in value.split('\n')) {"`).
So the sense breaks are lost by a choice of separator. Nothing in the layout requires it.

## The experiment

- **Setup.** A scratch worktree of `d9990777`, deleted afterwards, ran the test suite's own
  width proxy and wrap rule over the 36 cards at the 548-unit text width used beside a story
  panel.
- **Arm A** is the shipped layout: the lines are joined and wrapped, under the 72-character
  ceiling.
- **Arm B** is the technique's layout: each authored line starts its own row, against a target
  of one row per line.
- **Scaling.** Both arms were then run at one and a half and twice the text size, as
  the proxy font in a proportionally narrower box.

| Measure | Arm A (joined) | Arm B (sense breaks) |
| --- | --- | --- |
| Cards over the five-row area | 0 of 36 | 0 of 36 |
| Authored lines that wrap inside themselves | not visible (no line structure) | 23 of 108 |
| Cards over the area at 1.5x text | 34 of 36 | 35 of 36 |
| Cards over the area at 2x text | 36 of 36 | 36 of 36 |

One row at this width holds about 58 characters of card text. Across the 111 usable card rows,
the median line is 54 characters and the longest is 72. 96 rows are longer than the 40-character
subtitle ceiling, and 16 are longer than twelve words.

## Reconciliation against the technique

**Deviation 1: the breaks are placed by hand and discarded by the layout.** Arm B fits every card
inside the same five rows, so joining the lines buys no space. The 23 lines that wrap inside
themselves are the lines to cut. That is a number the 72-character ceiling cannot give.

**Deviation 2: a ceiling, not a target.** Told "at most 72", the script's lines settled at a median
of 54. That is close to one row, but nothing asks for one row. The technique's old card-line
figure said both "under forty characters" and "near a dozen words", and on this script those two
disagree by half: a dozen words here runs to about 60 characters. The technique now states the
target as one row at the card's type size.

**Upward lesson: the scaled case.** No text-size setting for the television turned up in the game's
code. At the console guidance's 200 percent, every card overflows its area,
and so do all but two at 150 percent. The technique now budgets for the largest size the player
may choose.

**Confirmed: the caption budget.** Every bark caption fits two rows, and so does every other
spoken caption. The timer gives a bark a median of about 88 words a minute to be read, and at most
128. That is well inside both the broadcast adult rate and the children's rate in one
streaming standard. The timer is derived from the spoken length estimate, not from a read-aloud by the
slowest reader, which the technique would prefer.

**Verdict.** Better. Arm B keeps the writer's breaks at no cost in rows, and it points to 23
specific lines to cut. The cost is one changed separator in the renderer. This finding is recorded
for the project's owner and has not been patched, because a change to the career screen of a game
under active development is the owner's call.
