---
layer: technique
type: technique
subject: realtime-events
technique: subscription-lifecycle
status: forged
laws: [creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [a callback still fires after its owner is gone, teardown races an unfinished handshake, events arrive before any consumer attaches]
---

# Subscription lifecycle

A subscription is a resource: it holds a callback alive, the callback holds
its closure alive, and the closure usually holds a view or a store alive. The
technique is the discipline that every subscription created is destroyed
([creation-names-reaper](../../../_laws.md#creation-names-reaper)) — including
in the awkward interleavings that actually occur in long-lived interactive
applications, which are the whole game. The happy path (attach on mount,
detach on unmount) is one line; the technique is the other five cases.

## The zombie is worse than the leak

A leaked subscription costs memory. A **zombie** subscription — one whose
owner is gone but whose callback still fires — costs correctness: it paints
state into a store nobody renders, double-fires side effects when its
replacement also fires, and throws from closures over dead resources. Every
rule below exists to prevent zombies first and leaks second.

## The cancelled flag: teardown races the handshake

Where subscribing is asynchronous — any process-boundary subscription is —
there is a window between *requesting* the subscription and *holding* it.
If the owner tears down inside that window, a naive cleanup finds nothing to
detach (the handle doesn't exist yet) and the handshake completes afterward
into a subscription that nobody owns: a zombie born fully formed.

The discipline is a cancelled flag scoped to each attach attempt:

- teardown sets `cancelled` and detaches the handle *if it exists*;
- the handshake continuation checks `cancelled` **first** — if set, it
  immediately releases the just-created subscription instead of storing it.

Both halves are mandatory. The flag without the continuation check is a
comment; the continuation check without the flag has nothing to read. And
the flag is per-attempt, not per-owner: an owner that detaches and rapidly
re-attaches (remount, dependency change) has two attempts in flight, and a
shared flag lets the stale handshake adopt the new attempt's identity —
identity must survive reuse
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).

## Singleton at the boundary, fan-out inside

Boundary subscriptions are expensive: a handshake, a serialization channel,
sometimes a per-subscription resource on the far side. When N consumers in
one process want the same event name, N boundary subscriptions is N times
the cost for one unit of information — and N opportunities for the races
above. The correct topology:

- **One native listener per event name**, created lazily when the first
  consumer arrives.
- **An in-process subscriber set** the native callback fans out to.
  Attaching a consumer is a set insertion; detaching is a removal. Cheap,
  synchronous, unable to race the boundary.
- **Reaping**: when the last consumer leaves, the native listener is
  released — after a grace period if thrash is expected (a view detaching
  and reattaching within one navigation should not cycle the boundary
  handshake). The singleton's creation names its reaper: last-out releases,
  or an explicit registry shutdown does.

The fan-out loop has two sharp edges, and only the first is about the
correctness of the set. The first: a consumer's callback may detach other
consumers (or itself) mid-dispatch. Iterate over a snapshot of the set, and
define whether a consumer detached mid-dispatch still receives the in-flight
event (either answer is fine; undefined is not).

## The second sharp edge: dispatch outside the registry's own lock

Snapshotting the subscriber set answers *what* the loop iterates over. It says
nothing about *what the dispatcher is still holding while it iterates*, and the
default — take the registry's lock, snapshot under it, dispatch without ever
releasing it — is a deadlock waiting for one blocking subscriber.

The cycle needs only two ordinary things to close, and any interactive system
already has both. A subscriber callback that can block: a hand-off into a
bounded queue that parks when the queue is backed up, which is what delivering
to a rendering surface usually is. And a second party that takes the registry's
lock to *read* it: the same surface, enumerating subscriptions to paint them.
Then the producer holds the lock and waits on the surface's queue while the
surface waits on the lock, and neither moves again. The symptom is a wholly
wedged system whose stacks show both parties parked in code that is innocent on
its own, which is why this is found by reading a thread dump and essentially
never by reading the dispatcher.

Two rules make the cycle structurally impossible, and both are needed:

- **The dispatcher snapshots under the lock and invokes after releasing it.**
  A parked subscriber may hold its own thread of control; it must never be
  holding the registry's lock while it does. This is the rule the snapshot
  discipline above is most often mistaken for — snapshotting is about set
  mutation, releasing is about lock ownership, and a loop can get the first
  right while getting the second wrong.
- **A subscriber whose delivery can park detaches that hand-off from the
  callback.** The dispatcher runs on the producer's thread, and a subscriber
  that borrows it for an unbounded wait has taken the producer hostage no
  matter who holds which lock. Detaching costs a thread's worth of scheduling
  and buys the producer's independence from every consumer's health.

The second rule trades away an ordering guarantee, and the trade is worth
stating because it reads as a regression: once the hand-off is detached, an
interim frame can arrive out of order. That is the correct price, and the
reason is the reconciliation rule this subject already runs on — a surface that
resyncs from the settled record on its next paint loses nothing durable to a
reordered interim frame, while a producer stalled on a surface loses the work
itself.

Write the regression test the day the fix lands, because this defect returns
the moment someone consolidates the dispatcher back under a single lock. The
test needs no timing: a subscriber parked on a wait that never completes stands
in for the backed-up queue, and the assertion is that the dispatcher finishes
anyway. Against the pre-fix dispatcher it hangs — which is the only evidence
that it tests the thing it claims to.

## The early-arrival buffer

The singleton creates a gap the naive design doesn't have: events can arrive
after the native listener is live but before the first in-process consumer
attaches — or between one consumer's detach and the next's attach. For
events that mark rare, important transitions (a completion, a failure),
dropping the early arrival means a consumer that attaches milliseconds late
misses the only event it cared about.

The remedy is a small **bounded** buffer in the singleton: events arriving
with zero consumers are held (newest-retained, oldest evicted — the buffer
must not become an unbounded queue with its own outage); the next consumer
to attach is replayed the buffer, marked as replay if consumers care about
tense. Two disciplines keep it honest:

- the buffer is *per name* and *small* — it is a race-closer, not a history;
  consumers needing history need a read path, not a longer buffer (see
  [push-vs-refetch-reconciliation](./push-vs-refetch-reconciliation.md));
- eviction is counted, per the shedding rule in the
  [golden path](../realtime-events.md).

## Teardown is idempotent and total

Detach paths get called twice (defensive callers, error paths that also run
finally paths), and they get called in every state: before the handshake,
during it, after it, after the far side already died. Teardown therefore:

- is idempotent — a second call is a no-op, not a crash;
- never assumes the far side is alive — releasing a handle whose channel is
  already gone must succeed locally;
- runs in a context that cannot be interrupted by the very event flow it is
  tearing down.

## The audit question

The lifecycle is healthy when the system can answer, at any moment: *which
names have native listeners, how many in-process consumers each has, and
how many buffered early arrivals are waiting*. That census is a debugging
tool on day one and a leak detector forever — a native listener with zero
consumers outside its grace period is a reaper that failed, found by
counting rather than by profiling a heap dump six months later.

## When dispatch must stay synchronous: budget the re-entry

The second sharp edge's remedy — detach the hand-off, let the subscriber run
on its own thread of control — assumes the subscriber only *observes*. There
is a surface where that assumption is the wrong one: a subscriber that must
**transform the item before it is rendered** — replace a message, rewrite a
field, veto a paint — has to run inside the producer's call, before the
producer proceeds, or the transformation lands after the first frame and the
surface flickers through the untransformed state. Synchrony is the feature,
not the defect, and the same subscriber may itself publish back into the
source it is listening to: it appends a reply, clears a set, replaces the
item it was handed. Re-entry is then by construction, not by accident, and
no hand-off rule reaches it.

The rule that does reach it is a **re-entry budget** at every mutation door.
Each door — append, replace, clear, backfill — increments a depth counter on
entry and decrements on exit; a call arriving above the budget returns
without acting, and the refusal is counted rather than silent. The budget is
small and stated (a few dozen frames is generous; two is often right) and it
is a guard against the *trivial* cycle — a subscriber that unconditionally
re-publishes on every delivery — not a proof against every cycle; the
document that installs it says so. Alongside it, the host hands each
subscriber a mute for its own registration, so a subscriber that knowingly
publishes can silence its own echo for the duration rather than relying on
the budget to stop it.

The snapshot rule stands unchanged under this: the dispatcher still iterates
a snapshot of the set, and the store still returns copies so a re-entrant
mutation cannot invalidate the iteration in progress. What changes is only
which of the two remedies the second edge gets. Detach the hand-off when the
subscriber is a consumer; budget the depth when the subscriber is a stage in
the producer's own pipeline. A surface that does both — detaches for
observers, stays synchronous for transformers — declares which registration
is which, because a transformer handed a detached hand-off silently becomes
an observer of a frame that has already been painted.
