---
layer: technique
type: technique
subject: edge-queue-policy
technique: drop-accounting
status: forged
laws: [count-carries-predicate, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [an edge drops on purpose and nobody can tell, a consumer sees fewer messages than the producer sent, one edge policy must hold across two transports]
---

# Drop accounting

Every policy in this subject spends messages deliberately. A spend that is not
counted is a fault the system has agreed in advance not to notice, so each edge
counts what it discarded, by cause, and the count is readable by the consumer
and not only by an operator.

## The observation that cannot be made without it

A consumer receiving one message in four cannot distinguish, from the data
alone, between a producer that has degraded, a transport losing messages, and
its own queue doing exactly what it was configured to do. The three have
nothing in common except their appearance, and the repairs point in opposite
directions: fix the producer, fix the network, or raise a depth. Without
counters, the team picks by intuition and usually picks the queue last, because
the queue's behaviour is the only one of the three that was designed on purpose
and is therefore assumed to be innocent.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
in its data-plane form. A stream that arrives thin because policy discarded
three quarters of it, and a stream that arrives thin because the producer is
broken, must be spelled differently at the receiver — and the only place that
difference exists is the queue that made the decision.

## What to count

Per edge, and per cause, as monotonic counters:

- **evicted-ordinary** — the designed spend. Expected to be non-zero on a
  freshness edge under load; a zero here on a saturating edge means the counter
  is wrong, not that the queue is idle.
- **evicted-correlated** — should be zero, always. Any value is an incident:
  some peer is stranded in a wait.
- **flushed** — discarded by an interruption. Counted apart from eviction
  because the cause and the remedy differ: eviction says the consumer is slow,
  flush says the producer changed its mind, and conflating them makes a healthy
  interruptive workload look like a saturated one.
- **refused-at-cap** — a drop under a declared lossless policy. Always a defect
  report, never a policy outcome.
- **depth** and **oldest-message age**, sampled rather than accumulated. Depth
  alone cannot distinguish an idle edge from a starved one; age can.

Each of these carries its predicate wherever it travels
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): which
edge, which cause, since when, and whether the number is a total for the process
lifetime or a window. "Dropped: 1,204" pasted into an incident channel is not a
finding, and it will be reused for a claim it does not support — most often the
claim that the number is small, when it is one edge's total over three days.

## Count at the drop site, never at the send site

The counter belongs to the code that performed the discard. A sender's "message
handed off" is not a delivery, and where payload and notification take
different routes it is not even evidence of one — the notification can be
delivered while the payload it announces is dropped at the receiver's queue a
moment later. Any measurement derived from the send side therefore reports a
healthy edge in precisely the case this technique exists to expose, and
anything built on that measurement inherits the blindness: a liveness deadline
refreshed on send never expires for a slow consumer, and a breaker gated on
send-side counts never opens.

## The counter goes to the consumer, not only to the dashboard

An operator's dashboard is the second audience. The first is the **consumer's
own code**, which is the only party that can degrade intelligently: a fusion
step that knows a stream is being decimated can widen its tolerance or fall
back to the last good value, and a controller that learns its command edge is
evicting can refuse to act rather than act on stale input. Expose the counts
where the consumer reads its messages, so the decision to degrade is made with
information rather than by a timeout the consumer had to invent.

The paired discipline is restraint on the log. Counters are aggregate; a
per-drop log entry on a saturated edge is a second outage layered on the first.
Log at transitions — the first drop after a clean period, the crossing of a
rate threshold, every drop of a class that should never be dropped — and leave
the volume to the counter.

## One declared policy, every transport

The strongest use of these counters is settling a question that otherwise stays
open forever: a policy declared on an edge must hold on **every** route that
edge may take. A system that can move a payload by more than one transport —
a brokered path and a direct one, a local shortcut and a network hop — acquires
a second queue implementation the moment the fast route bypasses the slow one,
and the second one is written by whoever built the fast route, under deadline,
without the class ladder and usually without a bound at all. The declaration
still reads the same in the graph. The behaviour depends on where the peer
happens to be running, which is the least predictable input in the system.

The rule: **both routes enter one scheduler under one policy**, and the drop
counters are the evidence that they do. Where the implementations genuinely
cannot be merged, every test that asserts a policy behaviour is written twice,
once per transport, and the pairing is visible in the test names so a reviewer
can see a missing half. A suite that exercises the policy only on the route the
harness happens to select is a gate reading a proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)): it passes exactly
when the two routes diverge, since divergence is what it never observes.

## Reconciliation is the test that finds the leak

Counters are only as good as their agreement. Producer sends, consumer
deliveries, and the drop counts on the edge between them must reconcile:
*sent = delivered + evicted + flushed + refused*, over a window, on a quiet
edge. A residual is a drop path that forgot to count — and the drop path that
forgot to count is, in practice, the same one that forgot the class ladder,
because both are the branch nobody exercised. Run the reconciliation once, in a
test, on an edge driven to saturation deliberately; it is the cheapest way to
discover a discard site nobody knew existed.

## When counting is not worth it

An edge that cannot drop — an unbounded in-process handoff, a lossless edge
that has never reached its cap — still counts, and the counter reads zero,
which is information. What is not worth it is per-message tracing on a
high-rate edge, or exporting every counter of every edge of every process to a
central store by default: the cardinality is the number of edges in the graph
multiplied by the number of causes, and that bill arrives quietly. Keep the
counters local and cheap, export the edges that matter, and let the local ones
be readable on demand.
