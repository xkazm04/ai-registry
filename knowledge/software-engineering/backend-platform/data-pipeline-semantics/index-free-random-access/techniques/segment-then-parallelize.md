---
layer: technique
type: technique
subject: index-free-random-access
technique: segment-then-parallelize
status: forged
laws: [count-carries-predicate, limits-are-derived]
shared_with: []
use_when: [parallelising work over one large artifact rather than over many, a worker pool reading one file is no faster than one thread, choosing a thread count for record processing, output rows arrive in an order callers did not expect]
---

# Segment then parallelize

There are two topologies for processing the records of one artifact on several
threads, and almost everyone reaches for the wrong one first.

The reflex is **one reader, many workers**: a single thread walks the artifact
in order, parses each record, and hands it to a pool. It is the topology every
concurrency tutorial teaches, it preserves order for free, and for record work
it is usually slower than a single thread doing everything.

The alternative is **segment then parallelize**: divide the byte range
arithmetically, realign each division to the next record boundary, and give
each thread its own range to open, read and process independently. No record
crosses a thread boundary, because no record is ever handed to anybody.

## The discriminator

The choice is not a matter of scale or taste. It is decided by one comparison,
and a reader can make it before writing any code:

> **Is the per-record CPU work larger than the cost of moving that record
> between threads?**

For a record that is parsed, matched against a pattern, counted or summed, the
answer is no, and it is not close. The work is a few hundred nanoseconds of
cache-resident arithmetic; the hand-off is a queue push, a contended pop, and
the cache-line traffic of moving the bytes to a core that did not read them.
A pool under those conditions pays coordination for a gain that does not
exist, and the single reader remains the bottleneck no matter how many workers
wait behind it — every record still passes through it.

The real opportunity is elsewhere: **the work is IO-bound, so what wants
parallelising is the reading, not the computing.** Segmentation is the
topology that parallelises reading, because each thread issues its own
independent sequence of requests against its own region. That is why it wins,
and it is also why the win is a property of the storage device rather than of
the algorithm.

When the per-record work is genuinely expensive — a decompression, a model
inference, a call that leaves the process — the comparison inverts and the
pool is right, because then the hand-off is cheap relative to the work and a
pool load-balances stragglers that fixed segments cannot.

## Thread count is bounded by the device, not by the core count

The default reflex — one thread per core — is derived from the wrong quantity.
Here the threads are waiting on the storage device, so the useful count is
bounded by **how many concurrent requests that device actually serves**, and
past that point additional threads make throughput worse rather than flat:
they queue against each other at the device, they compete for page cache, and
they add synchronisation the work did not need.

This is [limits-are-derived](../../../../_laws.md#limits-are-derived) at a
boundary where the derivation is unusually easy to get wrong, because the
plausible-looking constant is available and is about the wrong resource. A
thread count that is a fixed multiple of the core count is a constant wearing
a derivation's clothes. Derive it from a measurement of the device, expose it,
and let the caller override it — the correct value differs between local flash
storage, spinning media, a network filesystem and a virtualised volume, and
none of them is discoverable from the process's own view of the machine.

## What segmentation spends: ordering

Independent segments flushing independently produce output in **arbitrary
order**. This is the cost of the topology and it is easy to leave undocumented,
because it usually looks fine in testing: with a small artifact and few
threads, the output often comes out ordered by accident.

There are exactly three honest responses, and picking one is part of adopting
the technique:

- **Declare the output unordered.** Correct whenever the consumer sorts,
  aggregates or otherwise does not care. It costs nothing and it must be
  *stated*, because a consumer that assumes order will not discover the
  assumption until the artifact is large enough for the accident to stop
  happening.
- **Carry a segment ordinal on every record** and let the consumer restore
  order if it wants it. Constant memory, and it pushes the choice to the party
  that knows.
- **Buffer a whole segment's output before flushing it.** This restores
  grouping — a segment's rows arrive contiguously rather than interleaved —
  and it is affordable **only when the per-segment output cardinality is
  bounded and known in advance**. That condition is the whole rule: a pipeline
  whose per-segment output is one row per group per segment can buffer
  fearlessly; one whose output is a filtered copy of the input cannot, and a
  buffer sized by hope is an out-of-memory failure that appears on the largest
  input somebody runs.

What is *not* honest is the fourth option everybody tries first: buffering
"enough" and assuming it is enough.

## Measuring it, and what the measurement is a claim about

The benefit is a property of the storage device and the workload together, so
a figure quoted without both is not reusable
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
result of the shape *2.3 seconds to 0.6 seconds at four threads* means nothing
until it also says: how large the artifact was, how many records, what the
per-record work was, and what the data sat on. Move any one of those and the
number moves, sometimes to *worse than one thread*.

Two specific dishonesties to avoid, both common:

- **Reporting a speedup measured on warm page cache as though it were an IO
  result.** The second run of a benchmark on a file that now fits in memory is
  measuring the memory subsystem, and it will over-report the benefit for
  every reader whose artifact is larger than their RAM — which is the entire
  audience for this subject.
- **Extrapolating across storage classes.** A result measured on local flash
  is not a claim about a network object store, where request latency dominates
  and the right segment size and concurrency are different by an order of
  magnitude. State the class; do not generalise past the one you measured.

## Decision rules

1. Compare per-record work against inter-thread hand-off cost. Below it,
   segment; above it, use a pool.
2. Derive the thread count from device concurrency, not from the core count,
   and let the caller override it.
3. Realign every arithmetic division to a record boundary before a thread
   touches it; a segment that begins mid-record silently corrupts two
   segments' results, not one.
4. Choose an ordering response — unordered-and-said-so, ordinal-carrying, or
   bounded-buffer — and reject the fourth option.
5. Buffer for order only where the per-segment output cardinality is bounded
   by the pipeline's own structure, and say what bounds it.
6. Publish every measurement with its device class, artifact size and
   per-record work in the same breath as the number.
