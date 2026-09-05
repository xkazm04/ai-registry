---
layer: technique
type: technique
subject: engine-binding-surface
technique: capability-deferred-release
status: forged
laws: [creation-names-reaper, record-precedes-effect]
shared_with: []
use_when: [a destructor must release a foreign resource that only one thread is allowed to touch, a handle is sendable but its release is not, a cleanup path is being made conditional on where it happens to run, deciding where deferred cleanup is drained and how to prove it drains]
---

# Capability-deferred release

## The case this is not

[Release guarantees](../../../work-execution/concurrency-guards/techniques/release-guarantees.md)
enumerates five ways a release fails to fire — early return, exception,
cancellation, timeout, process death — and answers all five with the same
move: bind the release to the destruction of a scope, so the language runtime
rather than programmer discipline guarantees it runs.

This is the case where that answer is complete and still wrong. The scope is
destroyed. The destructor runs, on time, on every path, exactly as designed.
**It runs somewhere it is not permitted to do the work.** The resource belongs
to a foreign runtime that admits only one thread at a time, or only the thread
that created it, or only a caller currently holding its lock — and the value
being destroyed is a plain owned value that the host language allowed to travel
somewhere else entirely.

Diagnosing this as a release-path problem sends the repair to the wrong place.
No additional exit path helps; every exit path already works. The defect is
that the destructor has the *obligation* to release and not the *capability*.

## The shape of the problem

Three properties together, and all three are required:

1. **The owning value may legally travel.** It is sendable, storable in a
   collection somebody else owns, capturable by a task the scheduler moves. If
   it cannot travel, the ordinary scope-bound release is correct and this
   technique is over-engineering.
2. **The release requires a capability the destructor cannot demand.** A
   destructor's signature is fixed by the language. It cannot take a lock guard
   as an argument, cannot return a failure, cannot decline to run, and cannot
   ask to be run later.
3. **Performing the release without the capability is undefined, not merely
   wrong.** If it were merely wrong — a stale entry, a late write — a check
   and a log would do. The reason this earns a mechanism is that the naive
   version corrupts a foreign heap and the symptom appears somewhere else
   entirely.

## The move: split the destructor into enqueue and perform

The destructor does the part that is always legal — recording that a release
is owed — and nothing else. The part that needs the capability runs later, at a
point where something provably holds it.

**Enqueue is unconditional and cheap.** It takes the identity of the thing to
release and appends it to a queue owned by the foreign resource's own liveness
record, not by the value being dropped. It performs no foreign call. It cannot
fail in a way the destructor would have to swallow, which matters because a
destructor has nowhere to put a failure. This ordering — the record of the owed
work is committed before the work is attempted — is
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) at the
smallest possible scale.

**Perform runs at a checkpoint, and the checkpoints are named.** A checkpoint
is any point in the binding layer where the capability is provably held. Naming
them is the design work; there are usually few, and they are structural rather
than invented:

- the moment a thread acquires the foreign lock, and the moment it releases it;
- any operation on the resource that already required the capability to be
  called at all — creating another handle, or destroying one from the permitted
  thread;
- teardown, which must drain and then refuse further enqueues.

**Optimise the empty case, because it is every case.** The queue is almost
always empty, and a checkpoint that acquires a mutex to discover this makes
every ordinary operation pay for a rare one. Keep a separate count that can be
read without the lock, and take the lock only when it is non-zero. The count is
a hint in one direction only: it may lag, so it must never be the thing that
decides a *final* drain.

## The three questions a deferral scheme owes

A queue that defers work until later is a promise, and these are the three ways
the promise is broken. Answer all three explicitly or the mechanism is a leak
with a data structure.

**Who drains last?** Every deferral scheme needs a terminal drain that runs
after no further enqueue is possible, and it must be ordered against the
resource's teardown rather than racing it. The honest form closes the queue —
replaces it with a state that means *no longer accepting* — inside the same
critical section that performs the final drain, so a late enqueue observes a
closed queue and can make its own decision rather than appending to a vector
nobody will ever read again. A scheme whose final drain and whose close are two
operations has a window, and the window is exactly where the last handle in a
program tends to die.

**What does a late arrival do?** After close, the enqueue path still exists and
will still be called, because a handle can outlive the resource in the host's
own object graph. It must have a defined answer, and *leak deliberately* is a
legitimate one: the foreign resource is gone, its heap is gone, and the cell
being released does not exist any more. Say so at the site. The failure to
avoid is the one where the late arrival takes the branch written for the
ordinary case and touches a freed heap.

**How is the drain proven to happen?** This is the half that is usually
skipped, and it is skipped because the mechanism's failure mode is silence: a
queue that never drains looks exactly like a queue that had nothing in it
([failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)).
The deferral is a created resource and it must name its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). In
practice that means one test per checkpoint, each written the same way: drop
the owner somewhere the release is not permitted, assert the release has *not*
happened, reach the checkpoint, assert it has. A scheme with three checkpoints
and one test has one checkpoint.

## What it costs

**The release is no longer prompt, and callers can observe that.** Between the
drop and the next checkpoint the foreign resource still holds the cell. Under a
workload that drops many handles off-thread and rarely reaches a checkpoint,
the queue is a retention set — the memory is not leaked but it is not returned
either, and the graph looks like a slow leak until a checkpoint arrives. If the
foreign resource's occupancy matters, the count that guards the fast path is
also the number worth exporting.

**Ordering between releases is lost.** Items drain in whatever order the queue
imposes, on a thread that is not the one that dropped them. Where the foreign
runtime attaches finalizers with observable effects, those effects now run
somewhere else, later, in a different order — and that is a behavioural change
the binding's users must be told about, not an implementation detail.

**It concentrates unsafety in one place, which is the point.** The queue is the
one place in the layer that holds raw identities of foreign objects whose owner
has already gone. It is worth marking as such, worth keeping small, and worth
being the first thing a reviewer reads.

## When not to use it

**When the value can be made unable to travel.** If the handle can be tied to
the permitted thread by construction — not sendable at all — the ordinary
scope-bound release is correct, the whole mechanism disappears, and the
compiler enforces what the queue was going to enforce at run time. Prefer this
whenever the API can afford it. The reason a binding layer usually cannot is
that the *storage* of a handle and its *use* have different thread rules, and
refusing to send the storage costs the caller a great deal more than the
deferral costs the implementation.

**When the release is merely order-sensitive rather than capability-gated.** If
any thread may perform it and only the sequence matters, this is an ordering
problem with well-known answers and a deferral queue is a heavier tool than it
needs.
