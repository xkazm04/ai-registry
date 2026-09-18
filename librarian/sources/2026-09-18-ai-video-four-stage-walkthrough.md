---
source: youtube:0GO3-JzQjzg
kind: second-hand practitioner review (sponsored platform walkthrough, affiliate link)
url: https://www.youtube.com/watch?v=0GO3-JzQjzg
title: How to Start Making AI Videos In 2026 (Beginner to Advanced)
author: Youri van Hofwegen
words: 2472
extracted: 12
accepted: 0
declined: 0
leads: 2
already_covered: 10
untriaged: 0
applied: 0
shipped: 0
dispatched: 0
run_id: intake-0GO3
siblings: 1
rescan_when: n/a (not a repository source)
---

# Four stages of AI video, one idea held constant

A creator takes one brief (a motorcycle rider crossing a desert canyon) through four
workflows on one hosted platform, holding the model and settings fixed: a one-line prompt,
a chatbot-expanded multi-shot prompt, a three-panel storyboard image as the reference, and
finally a saved character sheet plus a saved location plate feeding a six-panel board that
is animated as two 15-second requests and cut together.

**Class: second-hand practitioner review**, sponsored. Expected yield, said before the
table: currency signals, leads and catches, and no upper-layer landing without a fetched
primary. That is what came back. **Currency was zero because the corpus is ahead of the
source**: the video says the next model version is "about to release", while
`video-assembly`'s `process--generated-shot-sourcing` application already records that
version as live and superseding the one demoed (2026-09). No fetch was spent; the class
rule says the fetch is the extraction for a review, but nothing a fetch could extract
here had a home that did not already hold it.

Board: 1 live sibling at claim (`intake-kwp-smallbiz`, a small-business plugins
repository), with no overlap with this run's homes. The checkout was on
`harvest/live-system-demo-film` with foreign uncommitted llm-observability work, and none
of it was touched.

**Declared focus (the sibling lane):** read the leads and untriaged rows of the last seven
days' media-generation notes. Done over `2026-09-15-ai-filmmaking-course-digest`,
`2026-09-17-muse-character-sheet-local`, `2026-09-08-seedance-prompt-showcase` and
`2026-09-09-blender-previs-to-video-reference`. **No sibling row was answered, and none
could have been.** This source touches three of them without measuring them: it
mints a character sheet in one call from a photo collage (Muse, per-view versus one-call
minting), layers identity, location and layout references without saying how they are
weighted (Muse, layout below identity), and repairs two storyboard panels by an edit
instruction rather than drawn marks (filmmaking digest, row 10). The source showed each
one working once, with no second arm. A demo cannot close a question that needs a pair.

## Triage (Phase 5)

Rows that target an upper layer were scored. Leads went through the corroboration table.
Nothing auto-accepted.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| - | - | - | - | - | - | - | - | - | - |
| 1 | K | technique | M | Expand a one-line idea into a shot list with a chat model | `image-prompt-composition`, `cinematic-language` | none | likely catch | - | already covered |
| 2 | K | technique | M | Condition a multi-shot clip on one storyboard grid image | `video-assembly/storyboard-grid-conditioning` | none | likely catch | - | already covered |
| 3 | K | technique | S | Repair the wrong panel, not the whole board | `storyboard-grid-conditioning` ("A wrong panel is repaired, not a wrong board"), `review-iteration-loops/partial-regeneration-seams` | none | likely catch | - | already covered |
| 4 | K | technique | S | Hand the board to the prompt writer so the beats are keyed to panels | `storyboard-grid-conditioning` ("Prompting against the grid") | none | likely catch | - | already covered |
| 5 | K | technique | M | Character sheet from a multi-photo collage, neutral background | `character-identity-continuity`, `visual-style-locking/approved-reference-sheet` | none | likely catch | - | already covered |
| 6 | K | amendment | S | The sheet carries the scene's outfit | `reference-shows-only-invariants` (lines 108-109: a costume that changes by scene is state and belongs in a per-scene reference) | none | likely catch | - | already covered: the source did exactly what the corpus prescribes |
| 7 | K | technique | S | Save a location plate as its own reusable asset | `image-prompt-composition/reference-role-map` | none | likely catch | - | already covered |
| 8 | K | technique | S | A per-shot emotion control, switched as the scene's arc turns | `cinematic-language/performance-direction` (lines 66-69: "per-character emotion selectors with intensity... the dial holds the emotional register") | none | likely catch | - | already covered |
| 9 | K | technique | S | Edit a still before animating: it costs less than re-rendering a clip | `cost-per-usable-output` law, `edit-plan-over-regeneration` | none | likely catch | - | already covered |
| 10 | K | currency | S | The demoed video model is about to be superseded | `video-assembly` application `process--generated-shot-sourcing` (already records the successor as live, 2026-09) | none | - | - | already covered: corpus ahead of source |
| 11 | K | amendment | S | Two requests from one board, cut on a panel boundary, need no tail anchor | `generated-shot-sourcing` decision rule "condition the second on the first's tail", the star/chain/pinned-bank table | corrects-claim | partial | 1/2/1 | **lead** (below) |
| 12 | K | amendment | S | Over-budget dialogue can be dropped, not only compressed | `generated-shot-sourcing` "does not refuse, it compresses" | corrects-claim | partial | 2/2/1 | **lead** (below) |

`auto=0/2/0`. Both rejected rows are render-bound (Phase 6b) as well, so a score that
cleared would still have needed a render pair before landing. No row reached the
escalations. The render instruments were not probed, because no row survived the score.

**The promoting questions (v2), run on both `partial` rows:**

- Row 11: *does the corpus already say when tail-to-head anchoring can be skipped?* One
  read of `generated-shot-sourcing`. It says still anchors are minted as a star and
  clips are conditioned by a pinned bank, and its decision rule tells adjacent shots
  sharing a subject to anchor on the predecessor's tail, with no exception for a seam
  that falls on a drawn cut. The gap is real, but the only evidence is n=1 prose. Not
  promoted.
- Row 12: *does anything in the corpus admit omission as the failure?* The dialogue
  paragraph says the model "does not refuse - it compresses". Nothing admits a dropped
  line. The gap is real, but it rests on one observation (a 10-second, three-shot request
  whose single line never rendered, followed by a 15-second request whose line did). Not
  promoted.

## Leads

1. **A seam on a boarded cut may need identity continuity, not tail continuity.** Stage 4
   is the segment the source is proudest of. It generates the top and bottom rows of one
   six-panel board as two separate requests, both conditioned on the same saved
   character, location and board, "without me having to chain one off the other". It
   then claims the two clips cut together "as one continuous shot". The corpus's
   decision rule anchors adjacent shots on the predecessor's tail, unconditionally. The
   discriminator a technique would carry is whether the seam falls **inside a move**
   (the tail must anchor the head) or **on a cut the board already draws**. In the second
   case the camera changes anyway, so star-derived identity may be enough, and a tail
   anchor would over-pin the next shot's opening composition. The source's claim of
   seamlessness is the class's blind spot, since a demo shows the solution and hides the
   seam. **Return condition:** a render pair on a local model that accepts a non-frame
   reference image for multi-shot generation. Arm A anchors shot 2's head to shot 1's
   tail; arm B derives shot 2 from the shared board panel alone. Seam continuity is
   triaged blind. The local first-frame and first+last-frame models cannot express arm
   B's reference-grid conditioning, so the missing instrument is named. **Home if it
   lands:** an amendment to `generated-shot-sourcing`'s decision rules, beside the
   topology table.
2. **A model handed too much dialogue may drop the line, not compress it.** Stage 2 asked
   a 10-second, three-shot request for one line, and it never rendered. Stage 4 asked a
   15-second request and the line came through. The corpus says over-budget dialogue is
   compressed ("does not refuse"). If omission is also a mode, then acceptance has to
   check that the line is *present*, not only that its pace fits. **Return condition:** a
   second independent source reporting a silently dropped line, or a local joint
   audio-video model on which the dialogue-seconds budget can be varied as the only
   variable. **Home if it lands:** an amendment to the dialogue paragraph in
   `generated-shot-sourcing`, and an acceptance check under "Acceptance and economics".

## Why apply and ship are 0

Nothing landed, so Phase 7.5 owes no row. The fleet has no project with a local
video-generation seam (same finding as `2026-09-17-muse-character-sheet-local`), so a
simulation would have been opinion anyway. Directions: n/a (no design record, since this
is a video).
