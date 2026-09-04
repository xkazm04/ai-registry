---
layer: technique
type: technique
subject: accumulate-then-aggregate-metrics
technique: lazy-rank-synchronization
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [an evaluation runs on several processes and reports one figure, a distributed run hangs at the end of validation, per-process figures are being averaged]
---

# Lazy rank synchronization

When the evaluation set is sharded across processes, each process accumulates over
its own shard and the figure must be over the union. The gather that joins the
shards is expensive, collective, and shape-sensitive, and the technique is about
**when** it runs and **what it must do first**: once, at the moment an aggregate or
a length is requested, after the shard lengths have been exchanged and every buffer
padded to one shape; the result cached so nothing gathers twice.

## Why not per batch, why not per process

Gathering after every batch puts a barrier inside the loop. Every process waits for
the slowest at every step, for a result nobody reads until the pass ends. Reducing
per process and combining the reductions is cheaper and wrong: the mean of
per-process means weights by process, and processes hold unequal shards whenever
the set does not divide evenly — which is always, because a sharding sampler either
pads the short shards with repeated samples or drops the remainder, and neither is
visible from inside a process. Undefined cells make it worse: a per-process
not-number-aware mean and a per-process count can be combined correctly only by
carrying both and re-weighting, which is the gathered computation done the hard
way. Gather rows, reduce once.

## The procedure

At aggregate, or at any request for the buffer's length, if the buffer is not yet
synced:

1. **Concatenate** each buffer's per-batch rows into one local table.
2. **Exchange lengths.** Every process learns every other process's row count. This
   is the only collective whose shape is known in advance.
3. **Pad** each local table along the row axis to the largest length. The padding
   value is irrelevant because it is stripped; do not pad with the undefined marker
   and rely on aware reductions to ignore it, because a stripped row and an ignored
   row are different things and the count would include the second.
4. **Gather** the padded tables. Every process now holds every process's padded
   rows, in process order.
5. **Strip** each process's padding by the length exchanged in step 2, and
   concatenate. The result is the union in a deterministic order.
6. **Mark synced and cache.** A second aggregate reads the cache. A reset clears the
   cache and the flag together — and so does **every append**, because the writer
   is the only thing that knows the cache is stale. A cache invalidated only by
   reset serves last pass's union to a reader that appended since.

The gather requires one more thing the padding does not fix: every process's rows
must have the same element type, because the collective copies bytes into one
shape and a mismatch is either an error or, worse, a reinterpretation. Cast at
append, to one declared type, on every process.

In a single process the procedure is the identity — no lengths to exchange, nothing
to pad — and it runs through the same code so the behaviour of a metric does not
change with the process count.

## Every process joins the collective

The gather is a collective; every process must call it or the ones that did wait
forever. The common mistake is a guard: "only the first process aggregates, the
others skip". The first process enters the gather, the others never do, and the run
hangs at the end of validation with no error. The rule: **every process aggregates;
at most the reporting is guarded.** A metric handler that formats and writes the
figure may do so on one process; the aggregate it formats was computed everywhere.

The second mistake is a conditional inside the aggregate — skip the gather when the
local buffer is empty. A process with an empty shard still holds a zero-length
table, still exchanges its length, still pads and still joins. Empty is a length,
not an exemption.

## The count exposes the sampler

The union's row count is returned as the count in the aggregate, and it is a
diagnostic in its own right
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
A sharding sampler that pads short shards with repeated samples produces a union
longer than the set; those repeats are real rows and they bias the figure toward
the repeated cases. The accumulator cannot detect a repeat — a row is a row — but a
count larger than the dataset is visible, and the rule is to check it: when the
gathered length exceeds the set's size, either the sampler is padding and must be
replaced with one that does not, or the excess rows are stripped by an index the
sampler also exposes. A count that is silently accepted is a bias that is silently
accepted.

## When not to use it

A metric formed from additive counts and no per-case output can sum-reduce its
counts across processes at aggregate instead of gathering rows — cheaper by the
row count, and exact, because sums combine correctly whatever the shard sizes. The
decision rule: gather rows when the per-case table, the median or the percentiles
are wanted; reduce sums when only the ratio is. Both run once, at aggregate, and
neither runs inside the loop. The gather is also unnecessary when each process
evaluates a different set on purpose — a per-site figure in a federated setting —
and there the aggregate is per process by design and the combination, if any, is a
policy decided elsewhere.
