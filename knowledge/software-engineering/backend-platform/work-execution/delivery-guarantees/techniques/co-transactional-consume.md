---
layer: technique
type: technique
subject: delivery-guarantees
technique: co-transactional-consume
status: forged
laws:
  - record-precedes-effect
  - creation-names-reaper
shared_with:
  - job-coordination
use_when: [deciding whether a queue needs a lease and a reaper at all, every effect of a handler lands in the store that holds the queue, auditing a claimed exactly-once guarantee, adding the first external effect to a handler that had none, a worker was given an idempotency key it may not need]
---

# Co-transactional consume

The rest of this subject is built for a queue that lives somewhere other than
the data it changes. That separation is what forces the machinery: the claim
has to be its own durable write because nothing else can hold it, the lease has
to be renewed because the holder is unreachable, the reaper has to exist
because a crash leaves a row nobody will ever come back for, and the effect has
to be idempotent because the acknowledgment and the effect are two commits with
a window between them.

**When the queue row and every effect live in the same transactional store,
that window does not exist, and none of that machinery is load-bearing.** One
transaction takes the row, performs the effect, and removes the row. It commits
as one fact or it commits as nothing. A worker that dies mid-handler does not
leave a claimed row and a half-applied effect — it leaves no trace at all, and
the row is immediately available to the next worker because the store released
the lock when the connection dropped.

This is not exactly-once *delivery*, which remains an illusion: the handler may
run any number of times. It is exactly-once **effect**, which is a different
and achievable property, and the distinction is the whole technique. The
handler's re-execution stops being a correctness problem the consumer must
neutralize and becomes wasted work the store already discarded.

## The shape

Open one transaction. Take exactly one claimable row under a lock that skips
rows other workers hold, so parallel consumers never contend and never wait.
Do the work. Delete or complete the row. Commit.

The rewrite of the spine is worth stating explicitly, because four of this
subject's states stop being reachable:

| The separated shape | The co-transactional shape |
|---|---|
| *pending → processing* is a durable conditional write | the row lock **is** the claim, and it is never written down |
| the claim carries holder and timestamp as evidence | there is nothing to attribute; the holder is the open transaction |
| a reaper returns claimed-then-died work to the spine | the store returns it, on connection loss, with no supervised sweep |
| the retry counter is persisted before the attempt | a rolled-back attempt leaves no counter to increment |

The law record-precedes-effect is not weakened here, it is met in its strongest
form: the record and the effect are the same commit, so the window the law
exists to close has zero width rather than a bounded one. creation-names-reaper
is satisfied structurally rather than by naming a reaper — the lock's owner is
the connection, and the substrate reaps it.

## What it costs, and why the cost is not optional

**The transaction stays open for the handler's full duration.** Lock lifetime
is the currency a store spends, and this technique spends all of it on the
handler. Everything the [transactions-and-units-of-work](../../../data-layer/data-access/techniques/transactions-and-units-of-work.md)
discipline says about not holding a boundary open across slow work applies at
full strength — that technique's rule and this one are in genuine tension, and
the resolution is that this shape is only correct for handlers that are *short*
as well as local.

**Consumers cost connections, not sockets.** This is the boundary that
demonstrations of the pattern reliably hide, because it does not appear until
the worker count is raised: a broker's consumer is cheap and its in-flight
messages are held in the broker, so scaling consumers is scaling a client
count. Here every in-flight item holds one connection and one open transaction
for the whole handler, so the concurrency ceiling is the store's connection and
version-retention budget, shared with the application's ordinary traffic. A
throughput number measured by launching many workers against an otherwise idle
store has measured the wrong resource; the number that matters is what the
handler does to the store's write path while the rest of the system is using
it.

Both costs push the same way: **this technique is for short handlers whose work
is a query or two, and it degrades badly exactly where the separated shape is
strongest** — long, expensive, externally-paced work. A subject that reaches
for it there will hold locks for minutes and discover the tension the hard way.

## The escape rule — one external effect reverts the whole class

The property rests on a claim that is easy to state and easy to stop being
true: *every* effect of this handler lands in this store. One call to another
service, one notification, one file written elsewhere, and the atomicity is
gone — not degraded, gone — and the class is back to choosing between the
postures in [guarantee-selection](./guarantee-selection.md), now with no lease,
no reaper, no retry counter and no stable identity, because the design deleted
them on the strength of a property it no longer has.

**The revert arrives by addition, and it is silent.** Nobody removes the
guarantee; someone adds a notification to a handler eighteen months later, in a
change that reviews cleanly, because nothing in the handler says that its
correctness depended on having no external effects. So the discipline is not
"be careful" — it is to make the precondition a written property of the class
that a reviewer trips on, in the same place the class's posture is recorded,
phrased as a prohibition rather than as a description: *this handler must not
acquire an external effect; if it must, it changes posture first.*

## Composition: an escaping effect becomes a row

The escape rule does not mean the technique is unavailable to any handler that
must eventually touch the outside world. It means the external effect does not
belong *in* the handler. Write it as a row — in the same transaction, so its
intent is durable exactly when the data is — and let a second consumer, whose
own effect is external and therefore at-least-once with an idempotency barrier,
deliver it after the commit.

That splits one handler into a local half that keeps this property and a
remote half that pays the full dedup cost, and the win is not that the cost
disappears but that it stops being spread: at-least-once now lives in one
consumer that exists to be at-least-once, rather than in every handler that
happens to send something. The row-in-the-same-transaction half is the mirror
of this technique on the producing side and is that technique's strong form;
this one is the consuming side of the same property.

## Decision rules

- **Ask the locality question per handler, not per queue.** One queue can carry
  a class whose effects are entirely local beside one that calls out. The
  question is *does every effect of this handler land in the store that holds
  the row*, and it is answered by walking the handler's effects the same way
  guarantee-selection's duplicate-effect analysis does — the same walk, reused
  for a different verdict.
- **Do not pay for a lease you cannot use.** A handler that is local and short,
  running behind a persisted claim, a renewed lease and a supervised reaper, is
  carrying the cost of a guarantee it already has by construction. That is not
  harmless: the reaper is a sweep that can misfire, and the lease introduces the
  duplicate-execution failure the design was built to avoid.
- **Do not reach for it when the work is long.** The separated shape exists
  because expensive work outlives the boundary a store can hold. A handler that
  runs for minutes wants a claim, a lease it renews, and a completion write
  conditioned on still holding it ([atomic-claiming](./atomic-claiming.md)) —
  and this technique's rules invert there, deliberately.
- **State which posture the class has, in the class's contract.** Both shapes
  are correct and they are not distinguishable from the handler's body. The
  cost of leaving it unwritten is paid by whoever adds the effect that breaks
  it.
- **Do not advertise the result as exactly-once delivery.** It is exactly-once
  effect, bounded by one store, and the phrase that survives contact with a
  reviewer is the bounded one. A system that claims the unbounded version has
  told its consumers they need no idempotency at their own boundaries, which
  is the one thing that was never true.
