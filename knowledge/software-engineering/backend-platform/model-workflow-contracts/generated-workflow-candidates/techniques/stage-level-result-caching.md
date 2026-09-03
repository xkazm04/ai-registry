---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: stage-level-result-caching
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [writing the runner that drives analyze-generate-train-select, deciding how a crashed run resumes, exposing a way to force one stage to run again]
---

# Stage-level result caching

The runner has four stages and each is expensive in its own currency:
analysis in disk reads, generation in almost nothing, training in
accelerator hours, selection in a sort. A runner written as one function
pays all four every time, and a crash in the fourth throws away the third.
This technique is the contract that makes a rerun a resume.

## Each stage owns a result and a check

A stage is a unit with three parts: the **result** it produces on disk, the
**check** that says whether that result is already present and complete, and
the **work** that produces it. The runner's loop over stages is: for each
stage, if its flag says run and the check finds a complete result, skip; if
the check finds nothing, run the work; if the flag says do not run, skip
regardless. The flag defaults to run, so the default behaviour of the runner
is *run whatever is not done*.

The result must be something the next process can find without the previous
process's memory. The statistics stage's result is the statistics file. The
generation stage's result is the set of candidate directories, each with its
bookkeeping record. The training stage's result is per candidate: the
bookkeeping record says training reached completion, and the weights it
names exist. The selection stage's result is the ranked table. None of these
is an in-memory flag, which is why the subject's rule that candidates are
directories is a precondition of this technique rather than a separate
preference.

## The check reads the result, not a marker

The tempting shortcut is a sentinel — a done-file per stage, written last —
and on its own it is wrong for the reason the gate law states: a check must
observe the thing it gates (`../../../../_laws.md#gate-sees-target`). A
done-file says the stage finished once; it does not say the result is still
there, still complete, or produced from the inputs the current run has. The
check reads the result itself: the statistics file parses and carries the
required keys; each candidate directory has its bookkeeping record and the
record's state says what it should; the weights file the record names is
present. When the check is cheap this costs nothing; when it is not, the
cost is the price of being right after the one crash that mattered.

A marker file is still useful as an **index** — one small record in the
working directory saying which stages claim completion and where each
result lives — provided the check that reads it re-verifies every claim
against the result and downgrades the claim when the result is gone. An
operator who deleted the statistics file to force re-analysis must get
re-analysis, not a runner that trusts a marker and hands generation a path
to nothing. The marker points; the result decides.

The check must also distinguish a **complete** result from a **partial**
one. A training run that died mid-epoch leaves weights on disk and a record
that says training started. A check keyed on the presence of the weights
file resumes past a candidate that was never trained; a check keyed on the
record's completion state re-runs it. The record's state field is the
authority, and the work sets it to complete as the last thing it does, after
the weights are flushed.

## A cached failure is not a cached success

A stage that ran and failed — a template that declined the dataset, a
candidate whose training crashed on a shape error — must leave a result that
spells failure, distinct from a result that spells "nothing to do"
(`../../../../_laws.md#failure-not-empty-success`). A generation stage that
produced zero candidates because every template declined must not be
indistinguishable from one that has not run. The skip records from the
generation stage and the state field in each candidate's record are where
the distinction lives; a runner that finds a failed state re-runs the work
by default and reports what it is retrying, rather than treating the failure
as done.

## Forcing a stage

An operator will want one stage re-done: new templates arrived, a training
recipe was fixed, a bug in the analyzer was corrected. The runner exposes a
per-stage flag that means *run this stage regardless of its result*, and the
flag's effect is stated precisely: it re-runs that stage, and the stages
downstream of it whose results are derived from it are stale and re-run too.
Re-analysing without re-generating leaves candidates filled from the old
statistics beside a new statistics file; the runner must either cascade or
refuse, and it must say which in the flag's documentation. Cascading is the
safer default because the alternative produces a run whose files disagree
with each other in a way no single file reveals.

## Decision rules

- **Every stage has a result on disk and a check that reads it.** The check
  never reads a sentinel in place of the result.
- **The default per-stage flag is run; the default behaviour is
  run-if-not-cached**, so a rerun with no flags is a resume.
- **Completion is a state in the result, set last.** Presence of an output
  file is not completion.
- **A failed stage leaves a failure-shaped result** that the runner re-runs
  by default and reports.
- **Forcing a stage cascades to the stages derived from it**, or the runner
  refuses and says so.
- **The cache key includes the inputs the stage depends on** — at minimum
  the template set identity for generation and the statistics file's
  identity for both generation and training — so a changed input is a miss
  rather than a stale hit.

## When not to use this

A runner whose stages are all cheap gains nothing but complexity from
caching, and a runner whose stages are user-authored and branch is a
pipeline engine, which owns persisted node status and resume as a general
mechanism. This technique is for the fixed, linear, four-stage vocabulary of
one generator, where the whole design fits in a loop with a check.
