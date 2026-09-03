---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: drain-a-derived-queue
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [shutting down a loop whose queue holds no promises, deciding whether queued work needs parking at shutdown, a deploy interrupts convergence passes mid-effect]
---

# Drain a derived queue

Shutdown asks one question of every queue: what is owed to the entries still in
it? For a queue of accepted requests the answer is a per-class disposition —
finish, park, or revoke — because each entry is a promise somebody is waiting
on. For a convergence loop the answer is simpler and stranger: **nothing is owed,
because nothing in the queue is information.** Every entry says "look at this
key again", and the successor process will derive the complete set of such
statements by reading every declared record on startup. Abandoning the queue
costs one full pass over the world, which is what the successor was going to do
anyway.

That makes drain here a two-part job with a different centre of gravity: close
the door so the loop stops taking on new work, and protect the passes already
running, which are the only things that carry state a restart cannot recover.

## Step one: close the trigger door

Drain begins by ending the trigger stream, not by killing the loop. The
consequences cascade correctly on their own: no new triggers enter the queue, the
queue empties by execution rather than by deletion, and the loop terminates
naturally when the last pass finishes. Killing the loop instead — cancelling the
task, dropping the runtime — leaves passes stopped at whatever line they had
reached, which is the failure this whole technique exists to avoid.

The mode is visible. "Draining since T, N passes still running" is what an
operator needs during a deploy, and a loop that merely goes quiet is
indistinguishable from one that has wedged
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Step two: let running passes finish, under a deadline

A pass in flight may be halfway through a sequence of external effects: it has
created two of three things, or it has created something and not yet recorded
that it did. Interrupting it does not undo any of that. So the running set is
allowed to complete, and the deadline exists because "allowed to complete" with
no bound is a hang wearing a shutdown's clothes — a converger with a pass
blocked on an unreachable dependency will wait forever, and the orchestration
around it will eventually kill the process in the least graceful way available.

The mature shape is a **two-signal ladder**: the first shutdown signal begins
the graceful drain, and a second, explicitly repeated signal requests immediate
termination. This is better than a timer alone because the operator holds the
judgement — the person watching the deploy knows whether waiting three more
minutes is better than stopping now, and a fixed timeout does not. Where a timer
is also needed (an unattended restart), it is a backstop on the graceful phase,
not a replacement for it.

Two honesty rules attach to the forceful path. **An aborted pass is not a
rolled-back pass**: whatever effects it had already applied remain, and the
successor will find a partially converged key. That is tolerable precisely
because the pass is full-state and restartable — the next pass reads the
half-built world and finishes it — and it is *not* tolerable for any effect that
cannot be safely re-attempted, which is a signal that the effect needs a
contract on the record rather than a longer drain. And **an abort is reported as
an abort**, never as a completed pass: a loop that logs its aborted passes as
finished has manufactured evidence that a key converged.

## The requeue that has nowhere to go

There is a moment specific to this subject that is easy to implement as a bug: a
pass that completes *during* drain returns a next-look decision, and the queue
it would write into is already closed. The correct behaviour is to discard the
request silently — the successor will re-enqueue that key along with every other
— and the code should say so where it happens, because the natural reading of a
dropped enqueue is a lost message.

The reason this is safe is the same reason the whole technique works, and it is
worth converting into a test the design can fail: **is every queue entry
derivable from state the system already holds?** A requeue that carries
information not present anywhere else — an attempt count, a computed next time
that encodes history, a decision the successor cannot reconstruct — is not
derivable, and dropping it loses something real. The repair is not to make drain
cleverer; it is to move that information onto the record, where it belongs and
where a restart can read it. A converger that fails this test has quietly grown
a durable queue without the machinery of one.

## Unplanned death needs no separate design

Crashes do not run drain, and here that costs almost nothing. The successor
starts, reads every record, enqueues every key, and converges — including the
keys whose passes were interrupted, which it finds in whatever partial state
they were left in. This is the one place a converger is strictly simpler than a
durable job system: there is no wreckage to distinguish from clean shutdown, no
parked entry to tell apart from an abandoned one, no reaper to sweep records
stuck in a running state. The startup path is the recovery path, and it is the
same path every start takes, so it is exercised constantly rather than only
during incidents.

The corollary is that a converger's drain code is *smaller* than a queue's and
therefore rots more quietly. Rehearse it the same way: restart under load, with
passes in flight, and check that the successor reaches a converged world without
manual intervention. What that rehearsal actually tests is the pass's
restartability, which is the property everything here rests on
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) read in
this subject's terms — the effects a pass creates are reaped by the next pass
over the same key, and a pass whose leftovers no future pass will notice has no
reaper at all).

## Boundary

[drain-and-shutdown](../../../../backend-platform/work-execution/admission-queue/techniques/drain-and-shutdown.md)
owns drain for a queue of promises: the three dispositions, the park record and
its stamp, the successor's distinguish-and-re-admit path, and the honest
discussion of what a crash voids. Every one of those exists because an entry
there is the only record of a request. This technique is the same discipline
under the inverted premise — the entries are derived, so the disposition is
uniform and trivial, and the whole design budget moves to the in-flight set.
Read there when the queue holds work nobody else can reconstruct; read here when
a full re-read of the world would rebuild it. And when a converger genuinely
needs to park something across a restart, that is the signal it has acquired
durable state, which belongs to
[job-coordination](../../../../backend-platform/work-execution/job-coordination/job-coordination.md)
and not to a queue that was designed to be thrown away.
