---
layer: application
type: application
subject: eval-harness
technique: reliability-aggregation
stack: node
verified_on: 2026-08-31
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node — a model bench whose record cannot say how many scenarios it ran

How a model-comparison bench harness stands against
[reliability-aggregation](../techniques/reliability-aggregation.md), and in
particular against the technique's rule that a reliability figure carries the
rule, the N, and **whether it was measured or modelled**.

## The seam

The harness runs a fixed scenario set against each model at each effort level,
several repetitions per scenario, and writes one JSONL row per trial carrying
both `scenarioId` and `rep`. The reporting step reads those rows, filters them
to a cell, and computes a single pooled pass rate over the bag. Both fields
enter the aggregation at exactly one place — the dedupe key — and are discarded
immediately after. The certification decision then reads the pooled figure.

That is the line where a bag of trials becomes a reported reliability number,
and it is where the technique's distinction has to be made or lost.

## The arms

The same recorded trials, aggregated two ways, offline, with no change to the
harness:

- **A** — what the harness reports: one pooled per-trial pass rate per cell,
  with per-scenario N collapsed and no measured/modelled label.
- **B** — the technique's reading: observed any-of-R and all-of-R computed per
  (cell, scenario) group over the same rows, plus a direct test of the
  independence that any compounding of A's rate would assume.

## What the arms said

Over 1,026 scored trials in 342 groups of three:

| | modelled from the pooled rate | observed over the same trials |
| --- | --- | --- |
| any-of-3 | 100.0% | **95.9%** |
| all-of-3 | 80.6% | **89.2%** |

An independent replication over an earlier corpus of 486 trials at a lower
quality level put the gap far wider: modelled any-of-3 97.9% against observed
80.9%, a 17-point optimism.

**The independence assumption is not close to true here**, which is the half of
the correction that matters most. At the pooled rate, groups failing all three
attempts should number about 0.11 of 342; the observed count is **14** — 123
times what independence predicts, χ² = 1737 on 2 df. The earlier corpus repeats
the shape at 9.1×. The cause is visible in the data rather than inferred: a
handful of scenarios fail every trial in every cell (one is 0 of 27), while
most pass every trial everywhere. Failure is concentrated in hard cases the
system reliably misses, which is exactly the condition under which compounding
a pooled rate is meaningless.

Independence also fails mechanically, not only statistically: 682 of 684
repetition-2-and-3 trials read a warm prompt cache. Repetitions share a prefix
by construction, so they were never independent draws and no amount of sample
size would make them so.

**Verdict: better.** A reader taking the headline rate and reasoning "so three
attempts essentially always work" gets 100%; the harness's own trials say 95.9%,
and at the earlier quality level 80.9%.

## The structural fact

The report contains the words "rep" and "scenario" zero times. The repetition
count exists only as a local constant, printed once to standard output and
never persisted into any record. The per-cell aggregate record has a field for
the trial count, the pass rate and the latency percentiles, and **no field for
the scenario count, the repetition count, or whether a figure was measured or
modelled**. The column header reads `runs`, so "114 runs" presents as 114
independent measurements when it is 38 scenarios by 3 repetitions.

So the conflation this technique warns about is not a mistake made at a call
site. It is **forced by the shape of the record**: the distinction could not be
expressed without changing the aggregate's fields, whatever the author
intended. The trial-level JSONL still carries `rep`, which is the only reason
the experiment above could run at all — the aggregation is where N dies.

One further detail makes the point sharper. Elsewhere in the same project a
different subsystem *does* carry a sample count on its record, alongside an
agreement-rate computation over repeated samples — and that code is marked dead
and unwired. The project designed the correct record once and never connected
it.

## What this realization cannot do

The bench measures a pass predicate per trial and nothing about *why* a trial
failed, so it can show that failures cluster and cannot show whether two
failures in one group share a cause. Distinguishing "the same hard case missed
twice" from "two unrelated misses" needs failure attribution on the record,
which this harness does not collect.
