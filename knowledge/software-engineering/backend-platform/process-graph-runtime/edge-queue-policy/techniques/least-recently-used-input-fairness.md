---
layer: technique
type: technique
subject: edge-queue-policy
technique: least-recently-used-input-fairness
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [one consumer reads several typed inputs at different rates, a slow input is never served under load, choosing between a fair receive and a chronological stream]
---

# Least-recently-used input fairness

When a consumer holds several inputs, the choice of which non-empty input to
serve next is a scheduling decision. Make it explicitly: serve the
**least recently served non-empty input**, rotating so that every input with
something waiting advances before any input advances twice.

## The starvation this removes

Under sustained load, "take whatever is ready" is "take whatever is fastest".
A high-frequency input is non-empty at every poll; a low-frequency input is
non-empty only in the instants between its message arriving and being taken,
and those instants never coincide with the fast input being empty. The slow
input is served only when the fast producer blinks, which under the load this
matters in it does not.

The failure does not present as a queue problem, which is why it survives
review. It presents as a consumer that ignores a class of input: the controller
that does not react to the operator, the planner that never sees the new goal,
the recorder that drops one stream entirely while faithfully capturing another.
Every queue in the system reads healthy — the slow input's queue is shallow,
because nothing is accumulating in it that a single service would not clear.

Fair rotation removes it structurally rather than by tuning. Each non-empty
input advances once per round, a fast input's surplus is discarded by *its own*
overflow policy rather than absorbed at its siblings' expense, and the slow
input's worst-case wait becomes one round rather than unbounded.

## The rotation

Keep, per input, the position in the service order at which it was last served
— a counter suffices and needs no clock. To select: among inputs with a queued
message, take the one whose last-served position is smallest; stamp it with the
current position; deliver one message. One message, not one queue: draining an
input to empty before moving on reinstates the starvation with an extra step,
because the fast input is never empty.

Two refinements are worth their small cost. Inputs that have never been served
sort ahead of every served input, so a newly connected edge is served
immediately rather than after the incumbents have each had a turn. And an input
whose edge has closed leaves the rotation once its queue is drained, rather than
being polled forever — the rotation's cost is proportional to the number of
inputs, and a long-running graph accumulates dead ones.

The rotation covers the **data** class only. Lifecycle messages are served
ahead of it, unconditionally and before any input queue is consulted, so a
consumer with deeply saturated inputs still reacts to a stop, a closure or an
upstream restart in its next turn of the loop rather than after its queues
drain. This is not an exception to fairness; it is the same priority ladder the
eviction path reads, applied to selection instead of to admission, and keeping
the two ladders identical is what stops a message class from being immune to
eviction but invisible to selection.

Where inputs are genuinely unequal in importance rather than merely in rate, the
rotation takes weights — an input served *k* times per round — but weights are a
priority scheme wearing a fairness scheme's clothes, and they reintroduce
starvation at the bottom the moment the weighted inputs saturate. Reach for them
only with a measured reason, and keep a floor: every non-empty input is served
at least once per round regardless of weight.

## The two costs, stated up front

Fairness is a reordering, and a reordering has consequences that must be
documented rather than discovered.

**Cross-input chronology is not preserved.** Two messages sent at the same
instant on different inputs are delivered in rotation order, not send order, and
the gap widens with the number of inputs and the depth of their queues. A
consumer that fuses inputs by arrival order is now fusing by scheduler order; if
it needs true temporal ordering it must read a timestamp carried in the message,
which is the honest instrument anyway across processes whose clocks were never
identical.

**A lifecycle event on one input can overtake that input's own last data.**
This follows directly from serving the lifecycle class first: a closure notice
admitted while three payloads are still queued on that input is delivered
ahead of all three, so a consumer can be told an input closed and then be
handed more messages from it. Consumers must therefore treat closure as "no
*more* messages will be admitted after these" rather than "the queue is empty
now", and the runtime must not release the input's resources at the notice.
The same reordering means a stop signal is no longer guaranteed to be the last
event a consumer sees, which breaks the other invariant a naive loop assumes.

## The ordering contract belongs to the entry point

A runtime that offers both a fair receive and a raw sequential stream over the
same inputs is offering two different ordering guarantees, and callers will
assume they are the same function with different syntax. State it at each entry
point: the fair receive reorders across inputs and prevents starvation; the raw
stream preserves arrival chronology and permits it. A consumer choosing between
them is choosing between two failure modes, and it can only choose if both are
written down.

## Do not disable it in tests without saying so

Fair rotation makes delivery order depend on which inputs were non-empty when,
which makes strict end-to-end assertions flaky, and the standard repair is to
disable the scheduler under the integration harness so ordering is
deterministic. That repair is defensible and it is also a
[gate-sees-target](../../../../_laws.md#gate-sees-target) hazard of the purest
kind: the suite now exercises a scheduler the production binary does not have,
and every starvation, reordering and closure-overtake defect this technique
exists to prevent is invisible to it forever.

If the switch exists, three things must be true. It is named for what it does
rather than for the harness that wants it. Its default is the production
behaviour, so a new suite inherits the real scheduler. And at least one suite
runs *with* fairness on and asserts the properties that only exist there — a
slow input served within one round while a fast input saturates, and a message
arriving on a closed-but-undrained input. Without that suite the fairness policy
has no test at all, and a policy with no test is a comment.

## When not to rotate

A consumer with one input has no selection to make. A consumer whose inputs are
strictly ranked by urgency — a stop line and a data line — wants priority, not
fairness, and should say so: fairness would serve the stop line one message per
round when it needs to be served first, every time. And a consumer whose
correctness depends on interleaving inputs in send order should not be selecting
at all; it should be merging on a carried timestamp, with a bounded reorder
window, and paying the latency that costs.
