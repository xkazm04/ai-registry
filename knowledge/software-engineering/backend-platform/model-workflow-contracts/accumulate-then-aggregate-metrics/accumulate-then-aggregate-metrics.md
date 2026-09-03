---
layer: golden-path
type: golden-path
subject: accumulate-then-aggregate-metrics
status: forged
use_when: [computing a model-quality figure over a validation set that arrives in batches, a per-class score is dragged down by samples where the class is absent, evaluating across several processes and reducing to one number, choosing what a metric returns beside its value]
techniques:
  - per-iteration-buffering
  - nan-as-undefined-not-zero
  - lazy-rank-synchronization
  - reduction-axis-vocabulary
  - detached-buffer-reads
---

# Accumulate-then-aggregate metrics

An evaluation pass runs a model over a finite set — a validation split, a held-out
cohort, a test fold — and produces a figure: an overlap score per class, a surface
distance per case, a confusion-derived rate. The model runs in batches because the
set does not fit in memory and because that is how the model runs, so the figure is
necessarily computed in pieces and combined. This subject owns that combination:
**compute per batch, keep what was computed, reduce once at the end, and make the
reduction correct** across batches of unequal size, across processes that each hold
a shard of the set, and across samples for which the metric has no value at all. It
is a small contract with a large surface, and every clause of it exists because the
naive shortcut produces a number that looks right and is not.

The naive shortcut is the running mean: each batch yields a batch mean, the batch
means are averaged, the result is reported. It is wrong in four independent ways. A
short last batch is weighted as heavily as a full one. A sample in which a class is
absent contributes a zero — or a one — to that class's mean, and the figure moves
with the *prevalence* of the class rather than the *quality* of the model. Several
processes each averaging their own shard and then averaging the averages weight by
process rather than by sample, and no process can see that its shard was padded to
match the others. And the per-sample distribution is gone the moment the first batch
mean is taken, so there is no median, no worst case, no per-case table, and no way to
recompute the summary under a different rule. The four corrections are the four
techniques below, and the fifth guards the accumulator that makes them possible.

## Two phases, one seam

The metric is an object with two entry points and one explicit lifecycle. The
per-batch call takes a prediction and a reference for one batch, computes the
per-sample, per-class value, and **appends** it to a buffer. The aggregate call
reads the whole buffer and reduces it. A reset empties the buffer. The seam between
the two is the whole design: the append is cheap and runs inside the loop; the
aggregate is the only place a reduction happens, and it runs once. When the metric
is decomposable — its value for the set is a reduction over its value per sample —
the buffer holds per-sample values. When it is not — a ranking measure, a curve
area, anything defined only over the whole set — the buffer holds the *inputs* and
the computation itself moves to the aggregate, because a per-batch version of a
non-decomposable metric is a different metric with the same name.

Two rules keep the seam honest. **Aggregation never mutates the buffer**, so a second
aggregate — by a logger and a checkpoint handler, by a report writer and a scheduler
— reads the same data and produces the same figure. **Reset is explicit**, called by
the loop at the start of an evaluation pass and nowhere else; an aggregate that
resets as a side effect turns the second reader into a reader of nothing, and the
symptom is a checkpoint saved on an empty figure. The buffer's lifetime is one pass
and the loop is its reaper. The mechanics — parallel buffers kept aligned, the
per-sample shape, the decomposable split — are
[per-iteration-buffering](./techniques/per-iteration-buffering.md).

## Undefined is not zero

A class absent from a sample's reference and absent from its prediction has no
overlap score: the ratio is zero over zero. A case with no surface has no surface
distance. Encoding that as zero punishes the model for a correct prediction of
absence; encoding it as one rewards it; dropping the sample misaligns the buffer
against every other buffer and loses the case's row in the report. The value is
**not a number**, and it stays not a number through every reduction: a mean is the
sum of the defined values over the count of the defined values, and the metric
returns that count beside the figure so a reader can see that a class present in
three of two hundred samples has a mean supported by three
([_laws: unknown-is-not-a-value_](../../../_laws.md#unknown-is-not-a-value)). The
case split, the contagion through non-aware operations downstream, and the
comparator that must never call a not-number an improvement are
[nan-as-undefined-not-zero](./techniques/nan-as-undefined-not-zero.md).

The neighbour that already states the doctrine one level up is worth naming here.
The assertion-vs-judgment technique of the evaluation subject insists that a run
which crashed is a third verdict and not a low score; this subject applies the same
rule to a *sample* — a case for which the metric has no value is a third state, not
a zero — and carries it through arithmetic the harness never sees.

## Processes are gathered lazily, once

When the set is sharded across processes, every process holds a buffer over its own
shard and the figure is over the union. Gathering after every batch puts a
synchronization barrier inside the loop for no benefit; averaging per-process
figures weights by process. The correct move is to gather the buffers **when the
aggregate is requested**, pad each process's buffer to the largest length so the
collective operation has one shape, gather, strip the padding by the lengths that
were exchanged first, and reduce over the union. The gathered result is **cached**
and a flag records that the sync happened, so a second aggregate does not gather
again; a reset clears both, and so does any append, because a cache that outlives
the next write is a stale union reported as the current one. Every process
participates in the gather because it
is a collective; only the reporting afterwards is allowed to be the business of one
process. The procedure, the deadlock a rank-zero guard produces, and the count that
exposes a padded sampler are
[lazy-rank-synchronization](./techniques/lazy-rank-synchronization.md).

## Reductions are named by the axis they collapse

The buffer is a table of samples by classes. There are seven things a caller can
mean by "reduce it": leave it alone; collapse the sample axis by mean or by sum to
get one figure per class; collapse the class axis by mean or by sum to get one
figure per sample; collapse both to a scalar. A single boolean flag names none of
them, and a caller who wants a per-class figure and receives a scalar has been given
a number that answers a question they did not ask. The reduction is therefore a
**closed vocabulary whose members name the axis** — none, mean, sum, mean over
batch, sum over batch, mean over channel, sum over channel — and the vocabulary is
an enumeration whose members are strings, so a configuration file, an equality
comparison and a validator all read the same definition. The composite mean has an
order, and the order is a policy: reducing classes within a sample first and samples
second weights every case equally, and the other order weights every class equally;
with undefined entries present the two differ, so the order is declared. The
vocabulary, the count that follows each shape, and the validator are
[reduction-axis-vocabulary](./techniques/reduction-axis-vocabulary.md).

## Reads are detached

The buffer is the one piece of state the whole contract rests on, and two things
corrupt it silently. A value appended while still attached to the computation that
produced it keeps that computation alive — every batch's forward graph retained
until the pass ends, memory rising in a straight line across the epoch. And a
downstream reader handed the buffer itself can operate on it in place, so a second
reader sees a buffer the first one modified. The accumulator therefore **detaches at
append** and **hands out detached clones at read**; its own storage never leaves it.
The rules and the one situation where a clone is too expensive are
[detached-buffer-reads](./techniques/detached-buffer-reads.md).

## The report is computed from the buffer, not from the figure

The aggregate figure is one consumer of the buffer. The other is the report: a table
with one row per case and one column per class, and a summary row carrying the mean,
median, minimum, maximum, chosen percentiles and standard deviation of each column.
Every one of those summaries is computed from the synced buffer with the reduction
left as none, and every one of them is aware of undefined entries — a percentile
that interpolates across a not-number returns a not-number, and a standard deviation
computed over a column with undefined entries needs the same count the mean does.
The report is where the running-mean shortcut is finally seen to have thrown away
the thing that mattered: the case at the bottom of the sorted table is the case a
reviewer opens.

## What this subject is not

This is not [metrics-rollups](../../platform-observability/metrics-rollups/metrics-rollups.md).
That subject folds an unbounded, time-indexed log into buckets and windows, and its
hard problems are the ones time creates: a trailing bucket still filling, a range
clamped by retention, a stored rollup that must name its recomputation, a comparison
between two windows. Nothing here has a time axis. The set is finite and has a last
element; the reduction collapses samples and classes, never time; and the
"undefined" case is a fact about one sample and one class, not a coverage gap in a
series. The rule for a reader: if the numbers are indexed by time and the input
never stops arriving, that subject; if they are indexed by sample and class over a
set that ends, this one. The two share one instinct — an empty bucket is not a zero,
an undefined sample is not a zero — and nothing else.

This is not [eval-harness](../../../llm-agent/evaluation-and-cost/eval-harness/eval-harness.md).
That subject decides what is scored and how the measurement stays honest: which
property is asserted and which is judged, how the judge is pinned, how many trials
a cell gets and how they are aggregated into a verdict, what a red case is evidence
of. It hands numbers over. This subject is the arithmetic underneath the handover —
once a per-sample score exists, how it becomes one figure across batches and
processes without lying. The rule: choosing or validating the instrument is that
subject; folding the instrument's per-sample output is this one. Where the two meet
is the third verdict: the harness's crashed run and this subject's undefined sample
are the same doctrine at two granularities.

The sibling that produces this subject's input is the windowed-inference subject in
the same category: it stitches one prediction per case out of many windows. The
metric consumes the stitched prediction and never the windows. A score computed per
window and averaged is a score of the windowing, not of the model, and the boundary
is exact: window-level arithmetic there, sample-level arithmetic here.

## What this subject refuses

- **A running mean as the figure.** Any accumulator that reduces at append has
  chosen the wrong weights, lost the distribution, and cannot be re-reduced.
- **Zero for undefined.** A sample with no value for a class contributes nothing to
  that class, and the count says so.
- **A gather inside the loop.** The collective runs once, at aggregate, and its
  result is cached.
- **A boolean reduction flag.** The axis is named or the caller is guessing.
- **Handing out the buffer.** Reads are clones; the accumulator's storage is its own.
- **An aggregate that resets.** Reset is the loop's call, and it is explicit.

## The techniques

- [per-iteration-buffering](./techniques/per-iteration-buffering.md) — the append
  and aggregate seam, aligned parallel buffers, per-sample shape, the
  decomposable split, explicit reset.
- [nan-as-undefined-not-zero](./techniques/nan-as-undefined-not-zero.md) — the
  case split that yields a not-number, not-number-weighted reductions, the
  returned count, contagion downstream and the comparator rule.
- [lazy-rank-synchronization](./techniques/lazy-rank-synchronization.md) —
  lengths first, pad, gather, strip, cache; the collective every process joins;
  the count that exposes a padded shard.
- [reduction-axis-vocabulary](./techniques/reduction-axis-vocabulary.md) — the
  seven-member vocabulary, result shapes, the declared composite order, the
  string-valued enumeration and its validator.
- [detached-buffer-reads](./techniques/detached-buffer-reads.md) — detach at
  append, clone at read, read implies sync, the memory case.
