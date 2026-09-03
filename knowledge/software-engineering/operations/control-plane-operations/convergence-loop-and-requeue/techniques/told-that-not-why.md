---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: told-that-not-why
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [designing what a trigger hands the loop, a convergence pass wants to branch on which watcher woke it, deciding whether a key may opt out of periodic re-checking]
---

# Told that, not why

A trigger arrives carrying everything it knows: which record changed, which
dependent changed, which watcher saw it, which operator asked. The design
decision is how much of that reaches the pass, and the answer that holds up is
**none of it**. The trigger is reduced to a key before it enters the queue, the
reason is retained beside the key for tracing and excluded from the key's
identity, and the pass receives the key alone.

## Why the reason is discarded and not merely ignored

Discarding is stronger than not-using, because the two differ under pressure.
A pass that *could* read the reason will eventually read it: a fast path for
"the record itself changed", a skip for "only a dependent changed", a special
case for "this was a retry". Each of those is correct on the day it is written
and each converts a *lost notification* into a *lost branch*. Notifications are
lost — a stream reconnects past a gap, a mapper drops an event during a
restart, a dependent's change is observed while the loop is busy — and a system
whose correctness depends on seeing every one of them has made delivery
load-bearing. Erasing the reason at the boundary means there is no branch to
lose: the pass reads the world, and the world is the same whether it was woken
once or five times or by the wrong thing entirely.

The erasure has a mechanical form worth stating precisely. The reason travels
*with* the key but is excluded from the key's equality and hashing, so a record
triggered for six different reasons occupies exactly one queue slot rather than
six. That is not an optimisation bolted onto a tracing field; it is the same
decision expressed once, in the one place the queue can enforce it. Where the
reason is part of identity, deduplication silently stops working for exactly
the keys under the most pressure — the ones with the most distinct reasons —
and the queue's depth graph reads as load rather than as a design fault.

One consequence surprises people and should be written where the field is
declared: only the *first* reason to arrive is kept, because the later arrivals
find an occupied slot and change only its time. A trace that says "reconciled
because a dependent changed" is telling you the truth about the first trigger
and nothing about the other five ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
— the field means "one of the reasons", and a reader who takes it as "the
reason" is being misled by a name).

## What the pass must therefore be

- **Full-state.** It reads the declared record and the observed world at the
  moment it runs, and computes the difference. It never consumes a delta and
  never assumes the previous pass finished.
- **Idempotent in the convergent sense.** Run twice against an unchanged world,
  it converges once and then does nothing. The second run is not a no-op
  because a flag says so; it is a no-op because the difference it computes is
  empty.
- **Restartable from any point.** A pass killed halfway leaves the world in an
  intermediate state, and the next pass must be able to read that state and
  continue. This is where the discipline meets the record-side contracts: an
  effect that cannot be safely re-attempted needs a marker on the record, not a
  cleverer trigger.

The test is one line and belongs in the suite from the first commit: hand the
pass the same record twice, assert one converged result and no second effect.
A pass that fails it has a reason-shaped dependency somewhere, and the trigger
layer will not save it.

## The periodic re-check is the safety net, and switching it off is a decision

Erasing the reason makes delivery an optimisation *only if something else
provides eventual truth*. That something is the periodic re-check: every key is
looked at again after a stated interval whether or not anything asked. It is
what converts "we may have missed a notification" from a correctness problem
into a latency problem bounded by the interval.

So the interval is not a performance knob, and the option to have no interval
at all — wait purely for a trigger — is a guard being switched off
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). It is
legitimate in exactly two situations: the key changes so often that its own
traffic re-checks it far more frequently than any interval would, or a separate,
named mechanism provides the same eventual guarantee. Outside those, choosing
it trades an unbounded staleness window for a small saving, and the trade is
invisible until the notification the design assumed would arrive does not.

Decision rules:

- **Default to a periodic re-check on every key**, with the interval sized to
  how long the system can tolerate being wrong about that key — not to how
  often it changes.
- **Vary the interval by outcome, not by key type.** A pass that converged asks
  for a long interval; a pass that found the world still settling asks for a
  short one. This is the cheapest adaptive cadence available and it needs no
  separate machinery.
- **Record every opt-out with its reason, in the code that opts out.** A list of
  keys with no clock is reviewable; a scattering of "wait for change" returns is
  not.
- **Never derive the interval from the reason.** That is the branch, wearing a
  different coat.

## The rejected alternative: an event-typed handler

The shape this technique refuses is the familiar one — separate handlers for
created, updated and deleted, each receiving what changed. It is genuinely
better on two axes and worse on the one that matters. Better: each handler is
smaller, and the work is proportional to the delta rather than to the state, so
a large record with a small change costs little. Worse: every handler is a
branch that a missed notification skips, and the system has no way to notice.
The forces that decide it are the reliability of the notification channel and
the cost of reading full state. Where the channel is a transactional outbox
inside one store, with delivery the store itself guarantees, event-typed
handlers are correct and this technique is over-engineering. Where the channel
is a network stream from a system that is allowed to forget — a bounded change
window, a reconnect that cannot be resumed, a source under no obligation to
retain anything — the branches are unsound and only a full-state pass converges.

The deletion case is where the refusal bites hardest and where teams reach back
for the event handler. A full-state pass cannot see a record that is gone: it
reads nothing and concludes nothing needs doing, which is exactly wrong when the
record's disappearance should have torn down external things. The answer is not
to re-introduce a delete branch, because a delete notification is the single
easiest one to lose. The answer is that the record must not vanish until the
teardown is confirmed — which is a contract written on the record, owned by the
sibling subject on declarative resource lifecycle, and the reason a converger
that only ever creates is much easier to build than one that must also destroy.
