---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: bounded-projection-of-external-work
status: forged
laws: [identity-survives-reuse, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [a tool operation runs longer than a turn, the model is polling a remote status, a remote result must reach a conversation after the run that submitted it ended, deciding what the loop may hold about work a store owns]
---

# Bounded projection of external work

Some tool operations do not finish inside the turn that started them. A
remote server accepts a job — a long crawl, a build, a batch analysis — and
returns a handle; the result arrives minutes or hours later, after the
context has been compacted, after the process has been redeployed, after the
run has ended. The naive integration keeps the handle in the model's context
and lets the model poll. It works in a demo and fails in production in every
way at once: the handle is lost to compaction, liveness is tied to a model
turn, a status write landing after a restart overwrites newer state, and the
remote server's result text becomes an instruction channel into the
conversation. This technique is the alternative: the loop submits and never
polls; a durable runtime outside any run owns the work; the loop reads a
bounded projection; and results are delivered by a framed, idempotent run.

## The loop holds nothing a store does not hold first

The agent loop is the least durable place in the system, and its durability
is not under its own control. Context is compacted when it grows, and the
compaction does not know which lines were handles. The process restarts on
deploy. The run ends when the turn does. A handle held only in context is
therefore held nowhere, and a model that "remembers" to poll it is a model
that will forget at the first of those three events.

So the rule is structural: **a remote operation that outlives a turn is
submitted from the loop and never polled by it.** The submit persists the
remote handle, the owning thread, and the lease the work runs under to a
durable row *before* returning, and returns to the model a **local
identity** — minted by the runtime, carried thereafter, and meaningful to the
runtime alone. Per [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse),
the local identity is minted once at submit and survives compaction,
restart and run end because it is a key into a store, not a fact in a
window. The remote handle never appears in the model's context at all.

Submit has a failure window of its own. The remote server has accepted the
job the instant it returns a handle; if persistence then fails, or the caller
is cancelled while the persist is in flight, the system holds a live remote
job that no row records — the forgotten-work case, one line after the code
that exists to prevent it. So a submit whose persist fails **compensates**:
it best-effort cancels the remote job, and it preserves the original error
or cancellation as the reported outcome even when the compensation itself
fails. The one conflict that must *not* compensate is a duplicate: a row
already owning that remote handle means the work is tracked, and cancelling
it would kill a job the system is correctly watching.

Leaving the loop also leaves the request. A submit runs inside a turn and
may carry that turn's credentials — a per-request key, a tenant header. The
poll and the cancel run later, in the background runtime, under no request
at all; they carry the server-level credential, or none. A per-request
credential policy that covers submit therefore does not cover the polls, and
the design says so at startup rather than discovering it at the first
status call.

## Only submit is model-visible

A task-capable tool server exposes a family of operations: submit, status,
cancel, result. The model sees exactly one of them. Status and cancel are
hidden from the roster, and submit is replaced by a wrapper that performs
the persist-then-return sequence above. Two reasons, and both matter.

The first is the durability argument already made: a model that can poll
will poll, and a design that permits polling has the handle in context by
construction. The second is a vocabulary argument. The model should see *one
identity and no protocol*: not the remote server's handle format, not its
status enum, not its retry semantics. Those belong to the runtime that
owns the work; exposing them to the model makes the model's behaviour depend
on a wire it cannot see and the runtime cannot version.

The set of raw operation names bound to the wrapper — which server names
are submit, which are status — is declared explicitly per server, and the
installed, process-local binding is the source of truth. A change to that
binding on disk waits for a restart; hot-editing which name is *submit*
under a live loop is how a poll gets exposed by accident.

## A durable runtime outside any run owns the work

After submit, the work has an owner, and the owner is not the run. A
background runtime — a supervised loop that survives every run and every
restart — reads the durable rows, polls the remote server under a lease it
holds on each row, writes status transitions to the row, and reaps
terminal rows. Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper),
the submit that created the row names this runtime as its reaper; a row
with no reaper is a remote job the system has forgotten it started.

The lease is borrowed, not defined. Its shape — the holder, the deadline,
the renewal cadence, expiry as evidence of a dead holder, the fence on
stale writes — is job-coordination's, and the durable task runtime is one
more executor under that discipline. What this technique adds is what the
*loop* may know about the work under that lease: the local identity, and a
projection.

## Late and post-cancel results are discarded, even from the right owner

Two writes must be refused, and the refusal must not depend on the writer
being an impostor.

**A result arriving after the lease expired** is discarded even when the
owner token matches. The lease expired because the holder could not confirm
it was alive; a peer may have taken over and written newer state; a late
write from the original holder would overwrite it. The owner is not lying —
it is *late*, and late is the case the lease exists to detect.

**A result arriving after a cancel was requested** is discarded even when
the owner token matches and the lease is live. The cancel is a user's
decision recorded on the row; a result that lands after it would resurrect
a task the user ended, and the conversation would receive an answer to a
question that was withdrawn.

Cancel itself has a shape. The first cancel request **fences** the in-flight
poll lease, so a status result already on its way back is discarded by the
rule above; repeated requests preserve the active cancellation rather than
issuing concurrent remote cancels; and the user-facing cancel returns as soon
as the durable fence is written, leaving the potentially slow remote call
and its retry schedule to the background runtime alone. And a cancel is
never acknowledged without a worker to perform it: when the background
runtime is not running, the request is refused, because an accepted cancel
that nothing will execute is a guard that reports itself present while
absent.

Both discards are recorded on the row as what they are — *discarded, late*
or *discarded, cancelled* — never as silent no-ops. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
a task that produced a result the system threw away is a different fact
from a task that produced nothing, and an operator reading the row must be
able to tell them apart.

Payload bounds belong to the same family: a status or result body that
exceeds the runtime's declared size is a **protocol failure** on the row,
not a truncated success. The runtime does not know what it cut.

## The loop reads a bounded projection

When a run does need to know about outstanding work — to tell the user what
is pending, to decide whether to wait — it reads a **projection**: the
current thread's tasks only, with their local identities, their coarse
states, and nothing else. Not every task in the system; not the remote
handles; not the raw status payloads. The projection is bounded in count
and in field set, computed from the rows at read time, and never written
back. It is the loop's window onto a truth it does not own, and its
smallness is the point — a projection that carried the remote handle would
be the handle in context again, one hop removed.

## Delivery is an idempotent run with the instruction outside the input

When the work reaches a terminal state, or needs the user's input, the
result has to enter the conversation — and the conversation belongs to a
run that ended long ago. The delivery is a **new internal run** on the
target thread, and three properties make it safe.

It is **idempotent**: keyed by the task's local identity and the snapshot's
sequence, so a runtime that restarts mid-delivery, or a row that is
processed twice, produces one message rather than two.

Its **trusted instruction sits outside the input boundary**: the runtime's
own directive — "a task you submitted has completed; here is its result" —
enters through the channel the runtime controls, never as part of the
message content. And the **remote payload is framed as untrusted** inside
the input boundary, fenced and attributed like any other tool result. A
delivery instruction placed inside the input boundary is an injection
channel from the remote server: whatever the server returns is read with
the authority of the runtime's own voice. The framing is the same one the
tool protocol requires for results at the wire, applied a second time at
delivery, because the payload has crossed the boundary a second time.

And **a deleted target thread dead-letters immediately**. The alternative —
recreating the thread so the delivery has somewhere to land — resurrects a
conversation the user removed, with the remote server's content as its
first message. The row records *dead-lettered, thread absent*, and an
operator surface can show it; the user's deletion stands.

## Decision rules

- Submit long-running remote work from the loop; never poll it from the
  loop. Persist the remote handle, thread and lease before returning; return
  a runtime-minted local identity and nothing else. Compensate a submit
  whose persist fails by cancelling the remote job, except on a duplicate
  handle already tracked.
- State at startup which credential scope the polls run under; a
  per-request credential does not follow the work out of the loop.
- Fence the poll lease on the first cancel; coalesce repeats; refuse a
  cancel when no worker exists to perform it.
- Expose only submit to the model; hide status and cancel; bind the raw
  operation names explicitly per server, from the installed process-local
  binding, and make binding changes wait for restart.
- Give the work a durable runtime outside any run as its owner and reaper,
  under a lease borrowed from the job discipline.
- Discard a result that arrives after lease expiry or after a cancel
  request, even from the matching owner; record the discard as its own
  state. Treat an over-bound payload as a protocol failure, not a
  truncated success.
- Let a run read only a bounded, current-thread projection of the rows —
  local identities and coarse states — computed at read time, never
  written back.
- Deliver terminal and input-required snapshots by an idempotent internal
  run; keep the runtime's instruction outside the input boundary and frame
  the remote payload as untrusted inside it.
- Dead-letter immediately when the target thread no longer exists; never
  recreate a thread to deliver into it.

## When not to use it

An operation that reliably completes inside its own call — even a slow one
— is a tool result, and wrapping it in a durable runtime adds a row, a lease
and a delivery for nothing. The technique begins where the operation's
duration exceeds the turn's, or where its completion must survive a restart
of the process that submitted it; below that, a bounded synchronous timeout
and an honest failure is the whole design.
