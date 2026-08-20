---
layer: technique
type: technique
subject: generated-output-grading
technique: regrade-without-regenerate
status: forged
laws: [edit-do-not-regenerate, cost-per-usable-output]
shared_with: []
use_when: [a batch has images on disk but missing or suspect grades, upgrading or fixing a grading schema after a run, designing the resume path of a generation harness]
---

# Regrade without regenerate

Generation and judgement are two operations with different costs, different
failure rates, and different reasons to be re-run — and a harness that fuses
them into one step can only recover from a judgement failure by paying the
generation cost, and by silently swapping the artifact under review while it
does. The technique: **make "re-read the existing images" a first-class,
separate path through the pipeline, so a lost or outdated judgement is
recovered for recognition cost only, against the exact bytes already on
disk.**

## Why the failure is common, not exotic

Judgement is the *less* reliable half. Vision calls time out under the very
concurrency that makes a batch affordable; a structured-output parse fails on
one malformed response; a rate limit lands mid-batch. Meanwhile the render
underneath is perfectly good. In a fused pipeline every one of these produces
a cell whose only repair is re-render-plus-regrade, which has two costs:

- **The visible one**: generation is typically an order of magnitude more
  expensive than recognition, so you are paying the large cost to fix the
  small failure — cost per usable output degrades for no gain in usable
  outputs.
- **The corrosive one**: the re-render is a *different image*. Generation is
  stochastic; the replacement may fail checks the original passed (or pass
  ones it failed). Any review, comparison, or verdict computed against the
  batch now describes a mixture of artifacts, and the grade attached to each
  file may not describe the file. This is the general regeneration sin —
  answering a bookkeeping problem by replacing reviewed work — appearing in
  a quality pipeline.

## Procedure

1. **Persist renders and grades separately keyed, together indexed.** The
   image lands on disk under a stable key (every axis that produced it); the
   grade lands in a durable index under the same key, with `gradedBy`
   recorded. A cell can therefore exist in four honest states: absent,
   rendered-ungraded, rendered-graded, and failed — and the index says which.
2. **On resume, branch on both halves.** Image present and grade present:
   skip both — re-reading an unchanged image with an unchanged schema and an
   unchanged judge buys nothing. Image present, grade missing: read the bytes
   from disk and grade them; never touch the generator. Image absent:
   generate, then grade.
3. **Expose regrade as an explicit mode**, not an automatic default. The
   operator invoking it is asserting "the images are fine, the judgements are
   the problem" — that assertion should be a deliberate flag, because in the
   opposite case (the images are suspect) regrading launders bad renders
   through fresh grades.
4. **Grade failures degrade to a labeled state, never to a lost render.** The
   grading call is wrapped so an exception yields `ungraded: <reason>` in the
   index. The batch completes; the regrade pass sweeps the ungraded cells.

## Regrade as an upgrade path, not only a repair path

Because grading binds to bytes on disk, the same mechanism cheaply re-judges
an entire corpus when the *judgement* improves: a sharpened schema field, a
better vision model, a second grader added for a disagreement rule. This is a
quietly powerful property — the whole grading layer can be iterated on, and
its versions compared grade-for-grade, against a frozen image set. That frozen
set is the only fair comparison there is: two schema versions run against two
different sets of stochastic renders confound the schema change with
generation luck. Version the judgement (schema version and grader identity in
each row) so mixed-era grades are never aggregated as if commensurable.

## Decision rules

- When a grade is missing, always regrade from disk; never re-render to
  refresh a judgement.
- When a grade *exists* but the schema or judge has changed, regrade the whole
  corpus under the new version rather than patching cells — a half-migrated
  index is worse than either version.
- When the image itself is suspect (corrupt file, wrong dimensions), that is
  a generation problem: delete the cell and take the generate path. Regrade
  must not be the tool that hides bad renders behind fresh judgements.
- When re-running a batch, the skip check must consult the index, not just the
  filesystem — a file on disk with no grade is half a cell, and treating it
  as done converts "ungraded" into a silent pass.

## When not to use it

If the generation itself is deterministic and cheaper than recognition — rare
for image models, common for programmatic composites — the economics invert
and regenerate-and-regrade may be simpler than maintaining the branch. And do
not use regrade to chase a different *verdict* from the same judge on the same
image with the same schema: at deterministic settings you will get the same
answer, and at stochastic settings you are re-rolling dice and keeping the
roll you liked, which is not grading.
