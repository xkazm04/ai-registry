---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: passthrough-buffered-wait
status: forged
laws: [creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [a blocking call for one reply is eating unrelated events, implementing a request helper on a shared event stream, pipelined requests resolve out of order]
---

# The passthrough-buffered wait

A node has one event stream. Everything arrives on it: input data, parameter
changes, lifecycle notifications from the supervisor, and the replies to
every exchange the node has outstanding. A helper that waits for one reply is
therefore reading a stream that belongs to the whole node, and the question
that decides whether the helper is correct is not "how do I find my reply"
but **"what happens to everything else I pull out of the stream while
looking?"**

The naive helper answers "nothing" — it loops, receives, tests the
correlation predicate, discards on failure, returns on success. That helper
is a message sink. Every event that arrives during the wait is destroyed, the
caller's main loop never sees it, and the defect presents as intermittent
input loss around a call that itself succeeded. It is close to
undiagnosable from the call site, because the call site is the one thing
working.

## The buffer, and the replay contract

The correct helper **buffers**. Each received event that fails the
correlation predicate is appended to a pending buffer owned by the event
stream itself, not by the helper — the helper is transient, the buffer must
outlive it. The stream's ordinary receive path then drains that buffer
**before** touching the transport, in arrival order, so the caller's main
loop sees exactly the events it would have seen, in the order it would have
seen them, delayed by the duration of the wait
([creation-names-reaper](../../../../_laws.md#creation-names-reaper): the
buffer is created by the wait, and the ordinary receive path is named as its
drain).

Three properties make the replay a contract rather than a best effort:

- **Nothing is filtered on the way in.** The buffer is not "events the
  helper thought were interesting"; it is everything that was not the match.
  The helper does not get to decide that a lifecycle event is uninteresting,
  because the helper does not know what the node does with it.
- **Order is preserved end to end.** Buffered events replay before any newly
  received one, so a burst that straddles the wait does not arrive
  interleaved with events that came after it.
- **The buffer is drained, not sampled.** A receive that returns one buffered
  event leaves the rest queued, and the next receive continues from where it
  left off.

The buffer is bounded like every other queue in the system, and the bound is
enforced by the stream's own policy rather than invented here. What must not
happen is a silent drop: if pressure forces eviction, the eviction is counted
and it prefers ordinary traffic over correlated events, because a discarded
correlated event hangs a second waiter.

## The livelock rule

Here is the trap that turns a correct-looking buffer into a spinning process.
The wait consults the buffer for an already-arrived match, finds none, and
then reads the transport for the next event. If the path it uses to read the
transport is the *ordinary* receive path — the one that drains the buffer
first — then the wait pulls back the very events it just deposited, tests
them against its predicate, fails, deposits them again, and repeats. Nothing
crashes. The process burns a core, the reply is never observed even after it
arrives, and every stack trace looks reasonable.

**A targeted wait reads the transport through a path that bypasses the
pending buffer.** State that as an invariant on the two functions, name them
so they cannot be confused at a call site, and write the regression test the
day the helper lands: a wait for an identifier that never arrives, with one
unrelated event deposited first, must block on the transport rather than
consume cycles. That test fails loudly against the broken version, which is
the only evidence it tests what it claims.

## Pipelining: scan before you read

A caller that issues three requests and then waits on them in order is doing
the ordinary thing, and it exposes the second trap. While waiting for the
first reply, the second and third replies arrive; they fail the first wait's
predicate and are buffered. The second wait then starts — and if it goes
straight to the transport, it waits for a message that is already in memory,
and it waits until its deadline or until unrelated traffic happens to arrive.

So **every targeted wait scans the pending buffer for a match before reading
the transport**, removing the matched entry and leaving the rest in place and
in order. This is also why identifiers must be unique per exchange rather
than positional or reused
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): the
buffer scan is a search by identity over messages that arrived in an order
nobody controls, and any scheme where two live exchanges can share a key
resolves the wrong one.

The scan pulls **only a match**, never a control event. A lifecycle event that
ended an earlier wait was already reported to the caller when it was first
seen; extracting it again from the buffer surfaces one occurrence twice, and a
caller that reacts to a peer restart by reissuing will reissue twice for one
restart. The rule is report-once: control events pass through the buffer to the
main loop exactly like ordinary traffic, and no later wait consumes them.

## The deadline covers the wait, not the gap between messages

The bound belongs to the whole wait: compute the absolute expiry once when the
wait begins, and derive the remaining time on each iteration from it. The
tempting alternative — arm a fresh timer before each receive — makes the bound
mean "silence for this long", so a node in the middle of ordinary busy traffic
never times out at all. It buffers unrelated event after unrelated event, each
one resetting the clock, while the reply it is waiting for is never coming. The
symptom is a wait that is bounded in the test suite, where the bus is quiet,
and unbounded in production, where it is not.

## Nesting, and why the buffer is shared

Two waits can be active at once — a wait for a goal result that internally
waits for a service reply, a helper invoked from inside an event handler.
Both must deposit into and scan **the same** buffer. Per-wait buffers make
ordering unrecoverable (two private queues cannot be merged back into arrival
order) and make the pipelining scan wrong (the reply the inner wait needs may
sit in the outer wait's private queue). One buffer per event stream, shared
by every wait over it, is the only arrangement that keeps both properties.

## When not to use this

If the waiting code owns a stream that carries *only* replies — a dedicated
subscription created for one exchange and destroyed with it — there is no
unrelated traffic to lose and the buffer is dead weight; a plain filtered
receive is correct there. The technique is required exactly when the stream
is shared with the node's ordinary work, which on a broadcast bus with one
event loop per node is the normal case.

And when a call has no bound on its duration and the node must keep working
throughout, do not wait at all: register the correlation identifier with a
handler and let the main loop dispatch replies as ordinary events. The
buffered wait is a convenience that makes a short exchange look synchronous;
past a certain duration the honest structure is the event loop the buffer was
protecting.
