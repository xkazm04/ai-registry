---
layer: application
type: application
subject: generated-output-grading
technique: trial-matrix-design
stack: node
status: forged
verified_on: 2026-08-19
---

# Node — a graded 6×5 trial matrix with regrade and flip analysis

The gravitone-gcloud pipeline realizes the trial matrix as a pair of Node
scripts: an expensive, resumable builder and a free reader — with the grading
schema, the regrade path, and the cross-provider diff all living in the same
few hundred lines.

## The grid

`pipeline/build-style-trials.mts:1-19` states the design intent in its header:
six styles × five trials = thirty plates, and "the point is not thirty
pictures; it is the GRID … you only ever learn that by holding one style still
and varying the problem." The trial axis is `app/library/trials.ts:1-20` —
five beats **lifted from the repo's own finished Bitcoin script**, not
invented, "because a trial set invented for the purpose would quietly avoid
the shapes that are hard to draw." Each trial names its visual problem
(`quantity`, `inventory`, `analogy`, `mechanism`, `flow`), chosen "so that NO
STYLE CAN PASS ALL FIVE BY BEING GOOD AT ONE THING." Every trial subject is
written picture-only — no labels or numbers — because captions are the
deterministic vector layer.

The candidate axis is held still per run: `--provider` is an explicit flag
(`build-style-trials.mts:51-67`), with the comment carrying the doctrine —
"which model drew a plate has to be a variable rather than an environment
side effect." `CONCURRENCY = 3` is "kept low on purpose: Leonardo's rate
limits are unpublished, and the failure mode of guessing high is a
half-finished grid plus a cooldown" (`:68-70`).

## Grading every cell

`GRADE_SCHEMA` (`build-style-trials.mts:78-88`) is the fixed schema: `hasText`
first ("the first field is the unconditional fail — captions are our vector
layer, so a plate carrying letters is unusable however handsome it is"), then
boolean `drewWhatWasAsked`, `dominantColors` as plain lowercase names,
anchored 1–5 `clutter`, and a one-sentence `description`. `gradeImage`
(`:130-146`) quotes the originating brief into the instruction, pins the judge
with "Answer only about what you can actually see", records `gradedBy` from
provenance, and **never throws** — "a lost judgement must not cost the plate";
failure lands as `gradedBy: "ungraded: <kind>"`.

## Resume and regrade

The cell runner (`:148-183`) branches exactly as the technique prescribes:
image on disk + grade in index → skip; image on disk + no grade + `--regrade`
→ read bytes from disk and grade for recognition cost only, with the comment
naming the trap: "Without this branch the only way to recover a lost
judgement is to re-render the plate, which pays generation cost to fix a
recognition problem." The index (`public/trials/index.json`) is keyed
`provider/styleId/trialId` (`:106-111`) so "the two grids coexist in one
index … diffed cell for cell, which is the only comparison worth making."

## The free reader, and the flip diff

`pipeline/report-style-trials.mts:1-12` is a separate script because "reading
the finding must not cost a generation" — the builder half-fails, the reader
re-runs after every partial pass. Its header states the attribution rule:
"When a cell fails on BOTH, the prompt is the suspect. When it fails on one
and not the other, the model is." Lines `95-109` compute the flips: for every
style×trial cell graded on both providers, compare `drewWhatWasAsked` and
print each disagreement.

The measured outcome (`docs/imaging.md:186-208`): 60 cells, on-brief 93% vs
47%, text leak 10% vs 57% — and on the usable-plate denominator the 1.75×
pricier render came out at **$0.052 vs $0.110 per usable plate**, inverting
the per-render price. Fourteen cells flipped, "every one flipped the same
way", and the motivating failure (a countable mechanism drawn 0/6 across six
unrelated style blocks on one model, 4/6 on the other) is the replicated,
model-bound flip the technique calls a verdict.
