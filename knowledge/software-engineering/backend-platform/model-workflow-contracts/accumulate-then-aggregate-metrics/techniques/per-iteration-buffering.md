---
layer: technique
type: technique
subject: accumulate-then-aggregate-metrics
technique: per-iteration-buffering
status: forged
laws: [derivation-names-recomputation, creation-names-reaper]
shared_with: []
use_when: [a metric is computed inside a batch loop and reported once, two handlers read the same metric and see different numbers, a set-level metric is being averaged from per-batch versions of itself]
---

# Per-iteration buffering

A metric that must be reported over a set the loop only ever sees one batch at a
time has exactly one safe shape: **a per-batch call that appends and a separate
aggregate that reduces**, with the buffer between them owned by the metric and
emptied only on an explicit reset. Every other shape — reduce as you go, reduce on
read and clear, compute at the end from whatever the loop kept — collapses one of
the two phases into the other and pays for it with a wrong weight, a vanished
distribution, or a second reader that sees nothing.

## The seam

The per-batch call takes the batch's prediction and reference, computes the value
**per sample** and, where the metric has a class axis, per class, and appends the
result. It reduces nothing: the batch axis is preserved so that every row in the
buffer is one case. The aggregate concatenates the buffered rows into one table,
samples by classes, and applies the reduction the caller named. The reset empties
the buffer. Three entry points, and the loop calls them in a fixed order: reset at
the start of a pass, append per batch, aggregate when the pass ends.

The rule that the buffer holds per-sample rows rather than per-batch means is the
one that carries the weight. A batch mean weights a short last batch as heavily as a
full one; a per-sample buffer weights every case once regardless of how the batches
fell. And a per-sample buffer can be re-reduced under any rule after the fact — a
median, a worst case, a per-class figure, a table with one row per case — where a
buffer of batch means can only ever be averaged again. The aggregate figure is a
derived value and the buffer is how it is recomputed
([_laws: derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation)):
the recomputation path is "aggregate again", and it exists only while the rows do.

## Parallel buffers stay aligned

A metric often needs more than one thing per batch — a value and the count of
samples it was defined for, or the three confusion counts a rate is later formed
from. Keep them as **parallel buffers appended in one call**, so row *i* in every
buffer is the same case. The arity is fixed at the first append; an append with a
different number of buffers is a programming error and is refused, because a buffer
that silently receives fewer entries than its siblings is misaligned from that point
on and no later step can detect it. Never append conditionally to one buffer and not
another — the undefined case is encoded in the value, not in the buffer's length
([nan-as-undefined-not-zero](./nan-as-undefined-not-zero.md)).

## The decomposable split

The description above assumes the metric over the set is a reduction over the
metric per sample. Most overlap, distance and error measures are. Some are not: a
ranking measure, the area under a curve, anything whose definition ranges over the
whole set at once. For those, **the buffer holds the inputs and the computation
moves into the aggregate**. Computing a non-decomposable metric per batch and
averaging the results is computing a different metric and reporting it under the
original's name; the averaged figure is typically biased, and the bias moves with
the batch size, so two runs with different batch sizes are not comparable. The
decision rule: when the set-level value is a mean or sum of per-sample values,
buffer values; otherwise buffer the scores and references and reduce nothing until
aggregate.

## Aggregation is a read

The aggregate returns a new object and leaves the buffer as it was. This is not
tidiness; it is what lets two consumers of the same metric agree. In a typical loop
one handler logs the figure, another compares it against the best so far to decide
whether to checkpoint, a third writes the per-case report. If aggregate cleared the
buffer, the second reader would aggregate an empty buffer and either raise or
report nothing, and the checkpoint would be saved — or not — on the wrong number.
The symptom is that the logged figure and the checkpointed figure disagree, and the
disagreement is intermittent because it depends on handler order.

## Reset is explicit and owned by the loop

The buffer's lifetime is one evaluation pass, and the code that starts the pass is
what empties it
([_laws: creation-names-reaper_](../../../../_laws.md#creation-names-reaper)). Not
the aggregate, for the reason above; not the constructor, because a metric object
outlives a pass; not a "first append after aggregate" heuristic, because a reader
that aggregates twice would then trigger a reset between reads. Forgetting the
reset is the mirror failure: the second pass's figure is over both passes' rows,
and the count returned beside it is the only thing that shows it — which is one
more reason the count is returned at all.

## When not to use it

A stream with no end — a monitoring metric over live traffic — has no aggregate
moment, and the right instrument is a running estimator with known weights, which
is another subject's territory. A set small enough to evaluate in one call needs no
buffer; the append-then-aggregate shape costs nothing there but adds nothing. And
where memory is the binding constraint and no per-case output is wanted, an
additive metric can keep running sums and counts instead of rows; that is a
deliberate trade of the distribution for space, and it is taken knowingly, never as
the default.
