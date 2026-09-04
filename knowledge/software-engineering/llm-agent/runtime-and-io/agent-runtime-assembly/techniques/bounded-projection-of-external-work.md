---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: bounded-projection-of-external-work
status: forged
laws: [identity-survives-reuse, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [a tool operation runs longer than a turn, the model is polling a remote status, a remote result must reach a conversation after the run that submitted it ended, deciding what the loop may hold about work a store owns, several background tasks complete close together, deciding whether a notification carries its payload]
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

## Completions that arrive together are delivered together

The delivery above is one internal run per task, and per-task is right for
every durability property it was built for: each result reaches its thread
under its own key, and is recoverable on its own. What that shape never
prices is the reader. **Every delivery wakes the reader, and a reader who
must then ask for the result spends two turns on one completion** — one to
notice, one to fetch. When several background tasks finish close together —
the normal case for a system that submits work in parallel, because that is
what submitting in parallel is for — the detour repeats per task. The rule
that removes it is the one worth carrying out of this section: *work the
runtime can complete deterministically must not be paid for in model turns.*

Two mechanisms, and they are separable. The first is already this
technique's rule and is restated only as the setup for the second: the
completion signal **carries its result** — the runtime's directive is "a
task you submitted has completed; here is its result", not "a result is
ready" — so the reader continues without a retrieval turn.

The second is new. **Eligible completions on the same thread, arriving
close together, are delivered as one run.** Two tasks finishing near each
other cost four model calls under per-task delivery — a wake and a retrieval
each — and one under grouping. The larger term for a long session is not the
calls themselves but the session context carried through each of them; the
calls that grouping removes were each paying to re-read the whole
conversation. One first-party account of one agent harness (2026-09, n=1)
measured exactly this: a long-running shell command alongside a sub-agent
investigation, with the model not explicitly waiting on either, cost four
model calls before work could continue, and grouping the two completions
left one. The same change — delivering results whole, "without compressing,
summarizing, or withholding anything" — moved that harness's average
token-related usage by about 2.3%, measured in its operator's own billing
unit over its own mixed workload. Take the mechanism as transferable and
the magnitude as one datum.

**Grouping collides with the idempotency key, and this is the part that
must not be skipped.** An amendment that adds batching to an idempotent
delivery without touching the key has reintroduced the duplicate delivery
the key exists to prevent. There are two ways to define it and only one is
sound. Keying the delivery *over the set* fails at the first restart: the
set is assembled at delivery time from whatever happened to be ready, so a
runtime that dies mid-delivery reassembles a different set on resume — some
members already landed, others newly eligible — and a key derived from that
grouping is a key derived from timing, which is the reuse
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
exists to forbid. It also has no representation for the partial case: three
of five landed is neither "the set delivered" nor "the set undelivered".
Keying **per item** is unchanged from the rule above and answers all of it:
*the batch is a transport-level grouping over individually-keyed items.*
The delivery run selects items on one thread whose keys are unclaimed,
then claims those keys and appends the message in one durable write; a
crash before that write leaves every member unclaimed and regroups them on
resume, possibly beside different neighbours, which is harmless precisely
because the grouping carries no identity. Where one atomic write cannot
cover the whole set — an over-bound batch is split, never truncated, by the
payload rule above — the per-item key is what makes the split resolvable at
all: three delivered and two pending is an ordinary state of five keys, not
a half-delivered object. For the same reason a member whose target thread
has been deleted dead-letters on its own key and does not fail the delivery
for its neighbours.

The boundary is that grouping applies only to completions the runtime
**already holds**, never to a wait. A run that explicitly asks about
outstanding work still reads the bounded projection and behaves exactly as
before: grouping does not delay it, does not widen it to tasks it did not
name, and does not answer it early. And the window that collects
co-arriving completions is itself a delay the reader pays for — bound it,
and let a lone completion flush immediately rather than wait out a window
for company that is not coming.

## A signal carries its payload only when nothing else is the authority

This corpus now states two opposite rules about notification payloads, and
both are correct. The neighbouring tool-server discipline holds that a
list-changed notification deliberately carries **no** payload — the listing
remains the single authority and the notification is only an invalidation
hint ([server-composition](../../mcp-tools/techniques/server-composition.md)).
This technique does the reverse and delivers the result **with** the signal.
The discriminator is what the notification is *about*.

A notification that **invalidates a mutable authority** carries nothing.
The listing, the index, the roster can change again between the
notification and the reader's next act, so a payload would be a second,
racing copy of something possibly already stale, competing with the
authority it was meant to point at. Delivery is best-effort and the reader
re-reads.

A notification that **announces a completed, immutable result its producer
already holds** carries it. There is no separate authority to defer to —
the result *is* the authority, it cannot go stale, and withholding it buys
nothing but a round trip. The test is one question: told only that
something happened, would the reader have to go somewhere else for the
truth? If that somewhere else exists and can move, send no payload. If the
message *is* that somewhere else, send it.

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
- Group eligible completions on one thread into a single delivery run, and
  key that delivery **per item**, never over the set: the grouping is
  transport, the local identity is still the identity. Claim the keys and
  append the message in one durable write; split an over-bound batch rather
  than truncating it; bound the collection window and flush a lone
  completion at once.
- Carry the result in the completion signal. Withhold a payload only when
  the signal invalidates a mutable authority the reader must re-read
  anyway — a completed, immutable result has no authority above it to
  defer to.
- Never group a wait: a run that explicitly asked about outstanding work is
  served from the projection, unchanged.
- Dead-letter immediately when the target thread no longer exists; never
  recreate a thread to deliver into it. In a grouped delivery, dead-letter
  that member on its own key and deliver the rest.

## When not to use it

An operation that reliably completes inside its own call — even a slow one
— is a tool result, and wrapping it in a durable runtime adds a row, a lease
and a delivery for nothing. The technique begins where the operation's
duration exceeds the turn's, or where its completion must survive a restart
of the process that submitted it; below that, a bounded synchronous timeout
and an honest failure is the whole design.
