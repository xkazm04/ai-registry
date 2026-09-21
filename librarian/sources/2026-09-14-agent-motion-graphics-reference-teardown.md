---
source: youtube:-4D8ZrryVTA
kind: second-hand practitioner review
url: https://www.youtube.com/watch?v=-4D8ZrryVTA
title: "ChatGPT-6 Astra Just Unlocked AI Motion Graphics"
author: Matteo AI
words: 2034
extracted: 11
accepted: 1
declined: 0
leads: 4
already_covered: 5
untriaged: 2
dispatched: 0
applied: 1
shipped: 1
run_id: intake-4D8Zr
siblings: 0
verified_with: [codex-cli gpt-6-astra, codex-cli gpt-5.6-sol, claude-cli claude-opus-5]
rescan_when: "never - a video; a later source that shows an extractor measuring a stream it cannot decode reopens row 6's boundary"
---

# A demo of a chat model taking a motion graphic apart

**Class: second-hand practitioner review.** A creator demos a vendor's model driving a
video platform through a plugin. Expected yield said out loud before triage: one currency
signal or lead, the "rules" mostly catches, and the proudest segment is where the boundary
is missing. The proudest segment was "it pulls every frame, reads the hex codes off the
pixels, every cut down to the second". That is the row that landed.

No siblings were live on the board at claim or at any beat.

## Verification lane (operator request)

The operator asked that verification run through codex-cli with GPT-6 Astra, compared with
claude-cli and the model used as the standard engine. The fleet's standing engine rule is
the Claude Code CLI, so the arms were:

- GPT-6 Astra through codex-cli, two runs
- GPT-5.6-Sol, codex-cli's configured default, one run
- Claude Opus 5 through claude-cli, two runs

The prompt was one prompt, naming the output and not the method. The input was a
planted-truth reference generated for this run: an original abstract clip, 12 s at 24 fps,
no text, with every value known. The encode was asserted by reading pixels back, at most
3 levels of channel error.

- **Cuts:** five, at frames 60, 132, 200, 204 and 216. The middle two bound a four-frame insert.
- **Palette:** eleven flat colours.
- **Camera:** a lateral move, a push-in, two locked-off shots.
- **Holds:** two, from 1.0 to 2.5 s and from 10.0 to 12.0 s.

A mechanical scorer judged each brief. The truth files stayed outside every arm's folder,
and no transcript or log touched them. Codex logs were checked, and so were the Claude
session transcripts, because Claude's JSON log carries only the final result. The contrast
arm gave the same two engines 12 stills at 1 per second and no tools.

| Arm | Access | Cuts, of 5 | Insert | Colours, of 11 | Camera, of 4 | Holds, of 2 | Wall | Spend |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Astra | file + shell | 5 | measured | 11, 0 spurious | 4 | 2 | 615 s | 70.9k tokens |
| Astra, repeat | file + shell | 5 | measured | 11 | 4 | 2 | 600 s | 69.5k tokens |
| Sol | file + shell | 5 | measured | 11 | 4 | 2 | 707 s | 75.3k tokens |
| Opus 5 | file + shell | 5 | measured | 11 | 4 | 2 | 260 s | $0.68 |
| Opus 5, repeat | file + shell | 3 | measured, called an overlay | 11 | 4 | 2 | 448 s | $0.92 |
| Astra, vision | 12 stills | 1 (gap midpoints) | missed | 10 | 4 | 0 | 44 s | 19.1k tokens |
| Opus 5, vision | 12 stills | 1 (gap midpoints) | missed | 10 | 4 | 0 | 87 s | not read |

**Reading.** The engine made no measurable difference, and access made all of it. Every
tool arm chose on its own to measure every frame. The Opus 5 repeat's 3 of 5 is a
definition, not an error: it measured the insert exactly and ruled it an overlay because
the push-in continued through it at its projected rate. The truth file listed both a cut
and a continuing move there, so the ambiguity was planted by this run.

Both vision arms declared the ±0.5 s cut uncertainty honestly. Both named every camera
move. The one colour they missed belongs to the insert, which no still contained. Opus 5
was the fastest tool arm, and Astra was not better than Sol. n=2 per engine for Astra and
Opus 5, n=1 for Sol.

**Instrument defects found and fixed during the run, recorded so the numbers can be
re-read:**

- The scorer's camera rule failed a correct "pan right, content slides left" twice. It
  was fixed and re-scored, and no arm's result changed except the corrected mark.
- A PowerShell `*>` redirect mangled the non-ASCII output of both vision arms. Their
  answers were recovered from the clean session records.

## Triage

Routing rule per row: rows 2-6 and 8-11 ran under the Phase 5 score. Rows 1 and 7 ran
under the corroboration table, as a currency signal and a lead.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | currency | S | A frontier chat model drives a video platform through a plugin | nothing in the corpus cites either | none | thin | table | lead |
| 2 | K | technique | S | Point at a reference instead of writing adjectives | visual-style-locking / style-onboarding-from-sample, first decision rule | none | likely catch | 0/2/1 | catch |
| 3 | K | amendment | S | Name the generator's default look as a negative | image-prompt-composition, the constraint block | none | likely catch | 1/2/1 | untriaged |
| 4 | K | amendment | M | Text as texture: abstract marks instead of words | image-prompt-composition bans all text; text-magnet nouns | corrects-claim? | partial | 1/3/2 | lead |
| 5 | K | technique | S | Generate a batch, keep one, stop polishing | generated-output-grading, "the spread is the finding"; cost-per-usable-economics | none | likely catch | 0/2/1 | catch |
| 6 | K | amendment | M | An agent that can decode the reference measures timing and palette; the frame budget binds only the naming | visual-style-locking / motion-sampled-under-a-frame-budget | corrects-claim | real gap, after the experiment | 3/0/2 | **accept** |
| 7 | K | lead | S | One continuous generation keeps camera and colour from resetting | generative-provider-routing | none | thin | table | lead |
| 8 | P | technique | S | Pair two incongruous things as the hook | platform-format-adaptation / hook-shape-selection | none | likely catch | 0/2/1 | untriaged |
| 9 | K | technique | S | One topic in several styles in one batch | folds into row 5 | none | likely catch | 0/2/1 | catch |
| 10 | T | practice | S | Approve the plan, do not do the plan | agent doctrine in skills/ | none | likely catch | 0/2/1 | catch |
| 11 | K | technique | S | Screenshot the defect and point at it | review-iteration-loops / critique-carries-its-fix | none | likely catch | 0/2/1 | catch |

`auto=1/9/0`, `fp=0`. Row 6's promoting question was: does the technique's premise
survive an extractor with tools? It was answered by the experiment, not by a read. Its
gain is 2 for inverting a stated premise plus 1 for refuting it. Its risk is 0: the
director measured it, and the landing is an append that leaves every existing sentence
true for a vision request.

**Render-bound judgment (Phase 6b), stated so it can be overruled.** The home is in
visual-generation, but the landing changes how a reference is read into numbers, not what
a generator is told. Its observable is extraction accuracy against a planted truth, which
is measured, not perceived. Whether a brief built from measured values renders a closer
recreation is a render question; it is lead 3 below and was not claimed.

## Landed

- **Amendment** to `motion-sampled-under-a-frame-budget`: a new section, "When the
  extractor can run instruments, the budget binds only the naming", one decision rule
  and two `use_when` entries. File:
  `knowledge/media-generation/visual-generation/visual-style-locking/techniques/motion-sampled-under-a-frame-budget.md`.
  Three rules:
  1. Route each quantity to the cheapest instrument that can measure it.
  2. Measurement settles values, not categories.
  3. A measured value still declares its origin.
- **Application** `python--motion-sampled-under-a-frame-budget.md`, `applied: code`,
  `ab_verdict: better`, `proof: ab-paired`.

## Applied and shipped

- **Project:** gravity.
- **Seam:** the multi-frame style readback. It picks 8 published frames per source, records
  only their names, and asks two readers for a palette category.
- **Chosen to falsify.** If a measurement over the same frames could not separate the
  categories, rule 2 would have been refuted along with the landing. The finding held, and
  the seam also produced its own boundary.
- **Arm A:** the two readers gave different categories for 6 of 6 sources.
- **Arm B:** a measurement over exactly those frames. The pick matched the readers' frames
  for 6 of 6 sources, a rerun was byte-identical, and it settled 4 of 6 disagreements. The
  other 2 sit where the categories overlap.
- **Sampling disclosure:** the stride was even for 2 of 6 sources.
- **Shipped:** a new stdlib-only measuring module, the step writes `sampling` and
  `measured_palette` beside the readers' answers, and one selftest case (8 cases green
  under the pinned interpreter).
- **A defect the gate caught:** 180 degrees was binned at 179. It was fixed before the
  commit.

## Leads

1. **A chat model driving a video platform through a plugin.** Return when a connected
   project routes a generation through a chat-model plugin, or when a vendor document
   states what the plugin exposes.
2. **"Text as texture": abstract bar-and-dash marks standing in for words.** The corpus
   bans all text, and the source's variant may invite glyph-like marks the text-leakage
   grader counts as text. Return when a render pair can be made on the local video model:
   an explicit no-text constraint against abstract marks, same seed. Instrument named:
   the local image-to-video route plus the leakage grader.
3. **Does a brief built from measured values render a closer recreation than one built
   from a readback?** Return when a local renderer can recreate a motion graphic from a
   brief, for example an HTML or vector animation rendered to frames, and the operator
   can triage the pair blind.
4. **One continuous generation keeps camera and colour from resetting across shots.**
   This is a vendor capability claim. Return when a vendor document or a local model
   supports multi-shot single generation.

## Untriaged (nobody verified these)

- Row 3: name the generator's default look as a negative. Anchor [00:09:30]. The
  corpus's constraint block is the likely home.
- Row 8: pair incongruous things as the hook. Anchor [00:06:29]. The likely home is
  hook-shape-selection.

## Catches

Rows 2, 5, 9, 10 and 11, with homes as in the triage table. Row 5 carries a boundary the
corpus already draws and the source does not. Keep-one is a production selection, and as
an evaluation of a model it is the flattery generated-output-grading forbids.

## Directions

`n/a`: a video, no design record.

## Cleanup

The planted clip, the arm folders, the 12 stills and the probe outputs were all in this
run's scratch folder. Deleted by run id at close.
