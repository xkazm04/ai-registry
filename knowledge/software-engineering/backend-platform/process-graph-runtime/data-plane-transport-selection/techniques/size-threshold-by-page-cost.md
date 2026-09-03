---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: size-threshold-by-page-cost
status: forged
laws: [count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [choosing the payload size above which a zero-copy path is used, a fast path made the median message slower, a threshold constant has no stated derivation]
---

# Size threshold by page cost

A zero-copy path buys throughput on large payloads and loses on small ones,
and the loss is not marginal: below a couple of kilobytes the direct path
runs materially slower than a copy through an existing channel — a regression
of more than half, measured, not estimated. The technique is choosing the
crossover deliberately, from the mechanism's own arithmetic, and defending the
majority of messages that must not be touched by the change at all.

## Why the small side loses

The direct path's costs are fixed and do not shrink with the payload. A block
is claimed from a shared pool whose minimum unit is a page. A descriptor is
published so the peer can find the block. The peer maps the region if it has
not already, takes a reference, and later drops it, and the reference counting
is atomic traffic between two address spaces. Nothing in that list gets
cheaper because the message is small — it gets *relatively* more expensive,
because the amortization base shrinks while the fixed cost does not.

The brokered path's cost, by contrast, is dominated by exactly the thing that
does scale: a copy. For a few hundred bytes into a channel that is already
open and already warm, a copy is close to free, and it is competing against
page-granular allocation and cross-process reference counting. The result is a
curve with a crossover, and every part of the design below follows from where
that crossover comes from.

## Derive the threshold from the allocator

**Set the threshold at the allocator's minimum shareable unit — a page —
rather than at the crossover of a benchmark curve.** The two numbers are close
on any given machine and they mean entirely different things. A curve's
crossover is a fact about one cache hierarchy, one kernel version, one
allocator's current tuning; it moves when the fleet is upgraded and nobody
re-runs the benchmark. A page is a fact about the mechanism: a payload smaller
than the minimum shareable unit still consumes a whole unit, so it pays the
full fixed cost with a fraction of the benefit, and no amount of hardware
makes that arithmetic work.

The procedure:

1. **Find the minimum unit the sharing mechanism can hand out.** Usually the
   page size, sometimes a pool's configured block size when that is larger.
2. **Do not lower it to the measured crossover.** The crossover normally sits
   *below* the page — the direct path starts winning slightly before it stops
   wasting the unit it allocates — and the tempting move is to take the extra
   band. Resist it: between the crossover and the page every message consumes
   a whole shared unit for a fraction of its capacity, which is a pool
   exhausted sooner under a burst, and the crossover moves with hardware while
   the page does not. Round up, never down.
3. **Confirm against the two payload populations that actually exist**, and
   report the sweep rather than a single figure. Most real graphs have a
   small-message population (commands, poses, scalars, status) and a
   large-message population (frames, point clouds, tensors); the decisive
   question is whether the threshold separates them cleanly. A sweep across
   size brackets, reporting latency percentiles and throughput *per bracket*,
   is how that is shown — and it is the only report from which someone else
   can check the choice.
4. **Record the derivation next to the constant.** A threshold whose comment
   says what unit it came from survives an allocator change; a bare number
   does not, and the next person to touch it will re-derive it from a
   benchmark and get a machine-specific answer.

## Do not touch the small-message path

The point of a threshold is that most messages keep the behaviour they already
had. A change that "unifies" both populations onto the new transport in order
to delete a code path has traded a maintenance win for a regression on the
majority of traffic, and the regression will be reported as an unexplained
latency rise in the control loop weeks later. **Below the threshold, the
message goes the way it always went, on the code that always carried it.**

This is also what keeps the change reviewable: the diff shows one new branch
at send time and one new path behind it, and the old path is provably
unchanged.

## The threshold is engaged by default and overridable at runtime

A guard that must be switched on protects the examples and not the
installations ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)),
so the threshold ships with a default value and the default is active. What is
configurable is the *value*, through a runtime setting the deployment can
change without a rebuild — because the deployments that most need to move it
are exactly the ones that cannot recompile the runtime: an embedded host with
an unusual page size, a machine where the sharing mechanism is unavailable and
the operator wants the threshold raised beyond every payload to disable the
fast path wholesale.

Two rules on the override. It is **read once, at startup**, and not per send:
a threshold that changes mid-run splits an edge's traffic across two paths and
undoes the stability the freeze exists to provide. And an unparseable or
absurd value **falls back to the default loudly** — logged, with the value that
was rejected — rather than silently disabling the fast path, which presents
later as a performance mystery with no error anywhere.

## What the threshold does not cover

**The first message on a session is not like the others.** Session setup,
mapping and pool warmup land on whichever message triggers them, and that
message can cost an order of magnitude more than its successors — a spike
large enough that a naive latency histogram of a short run is dominated by it.
The threshold does not help, because the first large message is the one that
pays. The answer is to **pre-warm at startup**, inside the readiness phase
where a delay is expected and budgeted, so the spike lands where nothing is
timing it. It is also worth tracing the first few above-threshold sends
hop-by-hop at a log level that survives a default filter: when this path
wedges, it wedges on a node's *first* large output, and a handful of traced
sends names the blocked call without polluting a healthy run's logs.

**A memory-locking limit on the host is a precondition, not a tuning knob.**
Where the sharing mechanism requires locked pages, a host whose limit is too
low cannot use the direct path at all — and the failure surfaces as a route
that never becomes available rather than as an error at the threshold. That
belongs in the deployment checklist and in the demotion reason the operator
reads, not in the size arithmetic.

**A benchmark that reports a single number is not evidence.** Every figure
this technique produces carries the payload size that produced it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); on
this surface the same system is several times faster and substantially slower
depending on that one omitted number, so a throughput claim without it is not
weak, it is reversible.

## When not to use it

- **When all payloads are on one side of the crossover.** A graph that moves
  only small control messages should not adopt the direct path at all, and a
  graph that moves only frames does not need the branch — pick the path and
  say why, rather than carrying a threshold that never fires.
- **When the transport does not have a fixed-cost floor.** The whole
  derivation assumes page-granular sharing with per-transfer bookkeeping. A
  mechanism whose cost is proportional to payload size at every scale has no
  crossover, and a threshold on it is cargo.
- **When the guarantee decides first.** Size is the second question. An edge
  pinned to the brokered path by a declared policy never reaches the threshold
  comparison at all, and a design that tests size first will occasionally
  route a large payload past a guarantee it was required to honour.
