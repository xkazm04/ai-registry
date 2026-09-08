---
layer: technique
type: technique
subject: remote-capability-probing
technique: instrument-by-cause-not-by-hit-rate
status: forged
laws: [count-carries-predicate, limits-are-derived]
shared_with: []
use_when: [a buffer or read cache reports hits and misses and nobody can act on the number, tuning a readahead policy, deciding whether a peer silently fell back to whole-object transfers, adding a per-object access histogram to a reader]
---

# Instrument by cause, not by hit rate

A buffer in front of a remote store is instrumented, almost by reflex, as hits
against misses. The ratio is easy to compute, easy to graph, and answers no
question anybody has. It averages together three populations whose remedies point
in opposite directions:

- **bytes fetched because a caller demanded them and they were not resident** —
  cold demand, the irreducible cost of the workload;
- **bytes fetched speculatively that nobody ever read** — readahead waste, pure
  cost, and the thing the readahead policy is tuned against;
- **bytes served from what was already resident** — the buffer working.

A hit rate that improves because readahead grew more aggressive and a hit rate
that improves because the working set shrank are the same number, and only one of
them is good news. Worse, aggressive readahead improves the ratio *while
increasing* the bytes moved, so the instrument rewards precisely the change an
operator would want to reverse.

## The rule

**Partition every byte counter by why the fetch happened, and report the
partitions rather than a ratio over them.**

Three read causes at minimum — cold demand, speculative, resident — and, where
the layer writes, a fourth for written bytes, because a write path that shares a
buffer with reads will otherwise be attributed to one of the read causes. Each is
a byte total, not an operation count: operations of wildly different sizes are
what the remote case is made of, and a count of them measures the request
pattern rather than the transfer.

Carry the predicate with every number
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
speculative-byte total is not comparable to a cold-byte total unless both name
the same population — the same object, the same window, the same layer — and the
commonest way this instrument goes wrong is that one counter is incremented at
the transport and another at the page layer, so a change to the page size moves
a number nobody touched.

## Two layers, counted separately

The partition above is about the *transport*: bytes that crossed the distance.
There is a second, independent partition about the *pages*: how often a resident
page was accessed, and how often one had to be loaded into residency. Both are
worth having and they must not be summed, because they count different events at
different layers — a single transport fetch can satisfy many page accesses, and a
page load can happen with no transport activity at all when the class is
resident.

Keeping them separate is what makes the numbers diagnostic. A high page-access
total against a low cold-byte total is a workload with good locality being served
well. A low page-access total against a high cold-byte total is a workload
fetching data it does not use, which is either a readahead policy that is too
eager or a caller whose access pattern is not what the layer assumed.

## The readings that are instructions

The point of the partition is that each combination says what to do next.

- **Speculative bytes approaching or exceeding cold bytes.** The readahead policy
  is fetching more than it saves. Reduce the growth factor or the maximum
  window; the ratio-based instrument would have shown this as an improvement.
- **Speculative bytes near zero on a sequential workload.** Readahead is not
  engaging — usually because the access pattern is being reset by something the
  policy does not recognise, or because the store was misclassified as resident.
- **Cold bytes far larger than the bytes callers asked for.** The peer is on the
  expensive rung. This is the reading that makes the probe ladder falsifiable:
  when a whole-object transfer is standing in for a fragment read, the cold byte
  count stops tracking demand and starts tracking object size, and it is
  frequently the *only* place that shows up, because every result is still
  correct. Cross-check it against the verdict provenance from
  [assertion-permission-and-bypass-are-three-switches](./assertion-permission-and-bypass-are-three-switches.md)
  before concluding anything about the peers: a fleet that never probed and a
  fleet of peers that cannot serve fragments produce the same cold byte total and
  want completely different responses.
- **Resident bytes dominating with a buffered class.** The buffer is earning its
  place. On a class that should have been direct, the same reading is the copy
  the bypass was supposed to remove.

## The per-object histogram, and the resolution trade

Aggregate totals say a workload is fetching too much; they do not say *which
part* of an object is being fetched. A per-object access histogram — the object
divided into blocks, each block carrying its own small set of cause counters —
is what turns the aggregate into a layout decision, because it shows whether the
reads are clustered in a region, spread evenly, or concentrated in a header the
reader consults repeatedly.

The naive version allocates one block per fixed-size unit and grows without
bound with the object, which is unaffordable for exactly the objects this
subject exists to read. The trade that works is to **cap the block count and
widen the block instead**: choose a minimum block size, and while the resulting
count exceeds the cap, double the block and halve the count. Memory per object is
then bounded by the cap regardless of size, and what degrades as the object grows
is *resolution* rather than footprint — which is the right thing to give up,
because a hundred-fold larger object does not need a hundred times more detail to
show where its reads are clustered. The cap and the minimum block are derived,
not chosen: the cap from the memory one tracked object may occupy divided by the
per-block counter size, the minimum block from the page size of the class being
tracked ([limits-are-derived](../../../../_laws.md#limits-are-derived)).

Two details follow from the counters being small. They **saturate rather than
wrap** — a per-block counter that overflows reports a hot block as a cold one,
which is worse than reporting it as merely very hot — so the increment clamps at
its maximum. And re-sizing the histogram when the object's size changes discards
the previous blocks rather than attempting to rescale them, because a rescaled
histogram mixes two block widths in one series and no reader can tell.

## Decision rules

- **Never report a hit rate as the primary number for a buffer over a remote
  store.** Report the partitions; a ratio may be derived for a glance, never
  stored as the instrument.
- **Count bytes, not operations**, at every cause.
- **Increment each counter at exactly one layer**, and say which layer at the
  definition.
- **Keep the transport partition and the page partition separate and never sum
  them.**
- **Make collection switchable per object and off by default.** A histogram over
  every object a process ever opens is a memory cost paid by workloads that will
  never be inspected; the instrument is armed for the objects under
  investigation.
- **Saturate every bounded counter**, and say so beside it.
- **Bound the histogram by count, not by resolution.** Degrade detail as objects
  grow; never let per-object memory track object size.

## What this technique does not own

Cache admission, keying, lifetime and eviction policy belong to the client
fetch-cache subject, and the bet a cache is making about why an entry will be
read again is its question, not this one. The line is that this technique owns
the **instrument** and the other owns the **policy**: what to measure and how to
partition it here, what to keep and what to discard there. They meet at one
point — a policy's claim is only checkable against a partitioned counter, and a
partition nobody uses to change a policy is a graph.
