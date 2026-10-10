---
layer: application
type: application
subject: agent-benchmark-design
technique: comparable-cell-construction
stack: python
status: forged
verified_on: 2026-10-10
refresh_by: 2027-01-10
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# Python: a ladder that asserted its pins instead of checking them

The realization is the memory benchmark in the desktop agent app (personas,
`evals/memory-year/`), a dependency-light Python harness. It replays one fabricated year
against any memory design that implements four calls, and it prints a ladder of designs
from their stored run directories. The tree pins no interpreter version. The witness for
`verified_against` is the interpreter both arms ran on, 3.12.1. The arms were read at
personas commit `8c9b93bbd1` (the change, pushed 2026-10-10) and its parent `8bfc211f64`
(arm A). The harness is a configuration benchmark in the sense this technique means: every
row is a design, and everything else is supposed to be held still.

## What the harness already pinned

The run header records the consumer, the judge and its direction, the context budget, the
elaboration regime and the scenario. Since 2026-09-27 it also records the harness's own
revision, stamped once at the start of the run. Two runs with identical headers had turned
out to be two harnesses:

- `evals/memory-year/memory_year/run.py:136` "harness = harness_revision()  # at start: a commit landing mid-run must not relabel it"
- `evals/memory-year/memory_year/run.py:359` "rejudged_harness"

The harness's own findings record the lesson that a cap binding before the declared budget
is a pin:

- `evals/memory-year/FINDINGS.md:196` "An undeclared constant inside an arm silently sets that arm's budget"

## The seam

The pins were recorded but nothing checked them where they were used. The comparison command
printed the first row's consumer, budget and elaboration under the sentence "every row
shares them or the table is not a ladder", and it never compared that row with any other.
The judge did not appear in the sentence at all. The harness-revision warning read the
revision that produced each run, not the one that last scored it.

Arm B diffs every pin except the design across all rows when the table is printed. The
scorer is the re-judging revision when a run was re-judged. A pin that differs is named
with its rows, and the output says the table is not a ladder:

- `evals/memory-year/memory_year/run.py:376` "The scorer is whichever harness last judged the answers"
- `evals/memory-year/memory_year/run.py:398` "**not a ladder** - rows differ in"
- `evals/memory-year/memory_year/run.py:402` "scorer revision unrecorded on"

## Proof

Both arms ran over the same stored run headers with no model call. There were six sets: the
published ladder (16 runs), every smoke run (17), and the smoke runs grouped by design (5,
3, 3 and 2).

- **Target: false shared-pin assertions.** Arm A printed the sentence in 6 of 6 sets, and in
  5 it was false. The rows mixed a 12B and a 7B local model with two hosted consumers, the
  local models judged their own answers, and one design's rows had a 2,000-token budget
  beside 6,000. Arm B made no false assertion. In all 5 divergent sets it named the pins
  that differed (consumer and judge in four, budget in two) and which rows held which value.
- **Floor: the table.** Every table row was byte-identical between the arms in all 6 sets.

The seam was chosen because it could falsify the technique. The published ladder could
have hidden a pin divergence under the sentence, and a caught divergence would have voided
a row. On the five pins the header records, it did not: consumer, judge, direction, budget,
elaboration and scenario hold across all 16 runs. It did catch the scorer. The findings
document says:

- `evals/memory-year/FINDINGS.md:10` "scored by the same judge revision"

The record cannot show that. No row carries a scorer revision, and the 16 runs were scored
at 13 different times: four re-judging passes, and nine runs scored when they ran. The
harness did collect evidence that bears on the claim. A paired re-judge over the published
runs found no verdict change between two judge revisions. That is evidence about those two
revisions. It is not a stamp on the stored verdicts.

## What the tree's shape says

There are two more pins this realization cannot state, and both sit inside the design that
was tested the most. The app's own memory is driven through a separately built binary, and
the harness stamps only its own revision. Between two of that design's ladder cells, the
consolidation step's timeout moved from 180 to 300 seconds. It shows up only in the text of
the failure samples. The earlier cell had 31 timed-out consolidation cycles against 1 in
the later cells:

- `src-tauri/src/companion/brain/sleep_cycle/limits.rs:112` "RECONCILE_TIMEOUT: Duration = Duration::from_secs(300)"

So the rows labelled by design change also differ in a ceiling, and in how many cycles
failed. By this technique's rule a cell spoiled that way is void rather than a data point,
and the harness has no rule that voids it.

## What this realization cannot do

It checks the pins the header records. It cannot check a pin the header omits, and the
binary's build revision, its timeouts and the operator's runner configuration before
2026-09-27 are all omitted. It also cannot re-establish that one judge revision scored a
ladder that was already published. That takes one re-judge of every row under a stamped
revision, which costs model calls and was not run here.
