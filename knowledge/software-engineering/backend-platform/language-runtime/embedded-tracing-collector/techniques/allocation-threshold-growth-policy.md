---
layer: technique
type: technique
subject: embedded-tracing-collector
technique: allocation-threshold-growth-policy
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [deciding when an embedded collector runs, a collector under a growing live set runs more and more often for less and less, sizing what the collector keeps between cycles]
---

# Allocation threshold growth policy

A collector that runs on its own thread can run whenever it likes. A collector
on the engine's thread runs when the engine calls it, and the engine calls it
from the allocator: every allocation adds to a running count of bytes, and
when the count exceeds a threshold, the allocation collects before it returns.
The whole policy is the choice of the threshold and of what happens to it
after a collection, and the naive choice - a constant - is wrong in a way that
shows up only under load.

## The failure of a constant threshold

Under a growing live set, a constant threshold collects more and more often
for less and less. If the threshold is one unit and the live set has grown to
nine tenths of a unit, every tenth of a unit allocated triggers a full
collection - a full root count, a full mark, a full sweep - that reclaims at
most that tenth. The collector's cost is linear in the live set and its yield
is linear in the margin above it, and the ratio between them goes to infinity
as the live set approaches the threshold. Programs that build a large working
set and then churn on top of it spend most of their time collecting.

## The growth rule

After a collection, the surviving bytes are measured against the threshold.
**If they occupy more than a fixed fraction of it, the threshold is raised so
that the survivors sit at exactly that fraction.** With the fraction at
seven tenths, a heap whose survivors fill the whole threshold gets a new
threshold of survivors over seven tenths - roughly forty percent more - and
the next collection runs after the program has allocated the difference. The
derivation is in the code beside the ratio, computed from the measured
survivors on every cycle, and the ratio is the single tunable
([limits-are-derived](../../../../_laws.md#limits-are-derived)). A threshold
written as a constant that someone doubles under load is the same policy
without the derivation, and it is doubled again next quarter with nobody able
to say why the first doubling was enough.

The fraction is a trade between memory and time. Lower, and the collector
leaves more headroom above the live set, so cycles are rarer and each reclaims
more, at the price of more memory held between cycles. Higher, and the heap
stays tight and the collector runs often. Seven tenths is a defensible default
for an engine that will share a process with a host that has its own memory
budget; it is not a measurement, and an engine with a measured allocation
profile should tune it.

The initial threshold is a small constant - on the order of a megabyte - and
it is the *only* constant in the policy. Its job is to keep tiny programs from
collecting on their first few allocations, and its size is chosen so that a
program that never grows past it never collects at all.

## Whether the threshold falls

The naive policy grows and never shrinks, and this is a real decision, not an
oversight. A program that built a large working set, released it and returned
to a small one is now collecting rarely on a small heap, holding a threshold's
worth of headroom it will not use. The cost is memory; the alternative cost
is oscillation - a threshold that tracks the survivors downward collects
frequently through the release and grows back through the next build-up,
paying a full cycle at each step of the way.

The rule is: **let the threshold fall only on an explicit signal**, never on
the survivors alone. The signal is the host's - an idle notification, a
memory-pressure callback, a manual collection request - because the host is
the only party that knows whether the memory is wanted elsewhere. A manual
collection resets the accounting and may reset the threshold to its initial
constant; an automatic one never does. The engine offers the manual door and
documents that it is the one way down.

## What is counted

The count is **bytes**, not cells, and it is the bytes the collector will
have to walk: the cell's own size, recorded in its header at allocation and
subtracted at free, plus any allocation the cell owns and the collector
traces through. It is not the process's resident size, which the collector
cannot reduce and should not chase, and it is not the allocator's arena size,
which includes fragmentation the collector did not cause. The number the
threshold is compared against must carry the predicate that produced it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
bytes in traced cells, measured at allocation, decremented at sweep. A count
that quietly includes something else - a string arena, a bytecode buffer -
triggers collections that reclaim none of what triggered them.

## Shrinking the bookkeeping

A collection builds structures of its own: the pending ephemeron list, the
list of weak maps to clear, the mark queue. Each grows to the size of the
worst cycle and, in a language whose growable vectors keep their capacity,
stays there. A burst that pended a hundred thousand ephemerons once leaves the
collector holding a hundred-thousand-slot vector forever, in a process whose
host is watching memory.

So **after every collection, the collector shrinks its bookkeeping to fit**.
The cost is a reallocation at the next cycle that needs more, which is a
cycle already doing a full heap walk; the benefit is that the collector's own
footprint tracks the current heap rather than the historical maximum. The
rule generalises to any structure the collector keeps across cycles: keep it
sized to the heap it serves, not to the heap it once served.

## Decision rules

- Trigger collection from the allocator when allocated bytes exceed the
  threshold; do not run a timer.
- After a collection, if survivors exceed the fraction, set the threshold to
  survivors over the fraction; write the derivation beside the ratio.
- Keep the ratio as the single tunable and the initial threshold as the single
  constant.
- Never lower the threshold on survivors alone; lower it only on a host
  signal or a manual collection.
- Count bytes in traced cells, recorded at allocation and released at sweep;
  never resident size, never arena size.
- Shrink the collector's own vectors to fit after every cycle.

## When not to use it

A collector that runs on a schedule the host controls entirely - collect on
idle, collect between requests, never during a request - does not need an
allocation threshold at all, and adding one gives the host a pause it did not
schedule. The threshold earns its place when the engine may allocate
unboundedly inside a single host call, which is every engine that runs
programs it did not write.
