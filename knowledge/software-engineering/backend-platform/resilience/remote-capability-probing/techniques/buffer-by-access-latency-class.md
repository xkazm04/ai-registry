---
layer: technique
type: technique
subject: remote-capability-probing
technique: buffer-by-access-latency-class
status: forged
laws: [one-authority-per-vocabulary, limits-are-derived]
shared_with: []
use_when: [one file-shaped abstraction spans backing stores at very different distances, a buffering layer is copying data that was already in memory, deciding the page size for reads against a remote store, a global direct-access mode is being proposed to make one workload faster]
---

# Buffer by access latency class

A file-shaped abstraction is the standard way to let a reader work against
heterogeneous storage without knowing where the bytes are. It is also, for this
subject, the exact thing that has to be partially undone: the abstraction hides
the one property the probe went to the trouble of establishing, which is **how
far away the bytes are**.

Under a uniform buffering layer, every backing store is treated as though it
were at the same distance, and the result is wrong in both directions at once. A
store that is already resident — an object held in the process's own memory,
a region mapped in — pays for a copy, a latch, a residency table entry and an
eviction decision on data that was one dereference away. A store several round
trips out gets the same fixed-size page and the same eviction rule as the
resident one, which is nowhere near enough structure to amortise the distance.
There is no single buffer configuration that is right for both, because the cost
being amortised differs by orders of magnitude.

## The rule

**Classify each backing store by access latency class at open time, buffer
explicitly for every expensive class, and provide a direct bypass for the class
that is already at memory speed. The bypass is per file, set at open, and never
a global mode.**

Three parts, each carrying its own reason.

**Classify at open.** The class is decided once, when the store is opened,
against evidence — the address's scheme, the probe verdict from
[advertised-support-is-not-evidence](./advertised-support-is-not-evidence.md),
whether the bytes are already held. Deciding it per read means re-deriving the
same fact on the hot path; deciding it at configuration time means deciding it
for a store nobody has looked at yet. A useful ladder has three or four rungs and
no more: resident, local-device, one round trip away, one round trip away behind
infrastructure that will not serve fragments. Each rung is a genuinely different
order of magnitude; a ladder with eight rungs is a ladder whose middle rungs
nobody can distinguish.

**The class is one vocabulary with one definition**
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The buffering layer, the readahead policy, the ceiling in
[degraded-rung-refusal-ceiling](./degraded-rung-refusal-ceiling.md) and the
counters in
[instrument-by-cause-not-by-hit-rate](./instrument-by-cause-not-by-hit-rate.md)
all branch on it, and the moment two of them classify independently they will
disagree about a store somebody added later — with the reliably worse outcome
that the layer with the cheaper classification wins the hot path.

**Derive the page size, do not pick it.** For an expensive class the page is
derived from the smallest request the transport serves efficiently and from the
per-request overhead: below that size the overhead dominates and the buffer is
issuing requests it could have coalesced
([limits-are-derived](../../../../_laws.md#limits-are-derived)). For a resident
class there is no page size, because there is no buffer.

## The bypass is per file, at open

The temptation is to expose direct access as a global switch, because that is
one line of configuration and it makes a benchmark look good. It is wrong for
the same reason a single buffer configuration is wrong: the property being
switched on is a property of one backing store, not of the process. A global
direct mode turns off buffering for the remote stores too, and the workload that
motivated it — a resident store being copied pointlessly — is not the workload
that will notice.

So the bypass is requested per file, at open, by whoever opened it and therefore
knows what it is. Two consequences follow. A caller may request direct access
explicitly for a store it knows is resident, and the layer may also *impose* it
from the class it derived — the two paths meet at one predicate, evaluated once,
rather than at two conditions that can disagree. And a file opened with the
bypass keeps it for its lifetime: a store that switches between buffered and
direct access mid-life has two coherence stories and will eventually be asked to
tell both at once.

## Readahead is a per-class policy, and it grows

For an expensive class the buffer is only half the answer. A reader that walks
forward through a remote object one page at a time pays the distance on every
page, and the fix is speculative: fetch ahead of the reader. The policy is
per class because its whole justification is the latency it hides, and it is
**adaptive** because a fixed read-ahead size is either too small to hide the
first accesses or too large for a reader that is about to seek elsewhere.

The shape that works is a small base window that multiplies while sequential
access continues and resets when the pattern breaks, bounded by a maximum, with
a bounded number of concurrent windows per reader. Every one of those four
numbers is derived rather than chosen — the base from the transport's efficient
request size, the maximum from the memory one reader may hold, the count from
that memory divided by the maximum — and the whole policy is only legitimate
because the counters can say whether it paid. Speculative bytes that were never
read are the cost of this policy, and a system that cannot separate them from
demanded bytes cannot tune it at all.

## Decision rules

- **Never buffer a store that is already resident.** The buffer is pure overhead
  and it is paid on the path that was supposed to be free.
- **Never leave an expensive class unbuffered because a benchmark against a
  resident store said buffering was slow.** The benchmark measured the wrong
  class, and this is the commonest route to a global direct mode.
- **Classify from evidence available at open**, and where the evidence is a
  probe verdict, take it from the stored verdict rather than re-probing.
- **One classification, consumed by every layer.** A layer that infers the class
  from an address prefix rather than reading it has minted a second vocabulary.
- **Derive every size from a measured property and write the derivation beside
  the constant.**
- **A store whose class cannot be determined is treated as expensive.** Guessing
  cheap on an unknown store makes the far case pay for the near case's
  optimisation; guessing expensive costs one unnecessary copy.

## When this does not apply

If every backing store the abstraction spans sits in the same latency class —
all local, all remote, all resident — there is one right buffer configuration
and this whole technique reduces to choosing it. The classification is
justified by heterogeneity and by nothing else, and a system that introduces the
vocabulary before it has a second class has added a switch statement with one
arm and a second place for a constant to drift.
