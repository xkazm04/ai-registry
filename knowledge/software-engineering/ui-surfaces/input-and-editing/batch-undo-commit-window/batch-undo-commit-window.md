---
layer: golden-path
type: golden-path
subject: batch-undo-commit-window
status: forged
use_when: [applying one verdict to many rows at once, making a bulk action cancellable without writing first, bulk decisions vanishing when the operator navigates away, optimistic rows being repainted by a background refresh]
techniques:
  - deferred-write-window
  - single-pending-batch-invariant
  - freeze-refresh-during-window
  - flush-on-teardown
  - bounded-fanout-commit
  - partial-failure-reselect
---

# Batch undo & the commit window

An operator selects thirty rows, applies one verdict, and the rows leave the
surface immediately. Nothing has been written. For a bounded interval — a
handful of seconds, stated in the interface — the verdict exists only in the
surface's own state, alongside one control that takes the whole batch back.
When the interval expires the batch is written; if the control is pressed
first, the batch simply never happened. That interval is the **commit
window**, and this subject is the window plus the invariants that make
deferring a write safe.

The window exists because of an asymmetry in how bulk mistakes are made and
found. An operator working a queue at speed is right almost every time and
wrong in a way they notice within about a second — the selection included one
row they meant to keep, or they hit the wrong verdict on the right rows. A
confirmation dialog charges every correct action for that rare wrong one, and
decays into a click-through by the tenth invocation. The commit window charges
nothing up front, costs only latency the operator does not experience, and is
still open at the exact moment the mistake becomes visible.

## The distinction that decides everything

The naive reading is that this is undo with the write moved earlier, and the
reading is wrong in a way that changes every invariant downstream. In
post-commit undo the write landed, and reversal means **authoring a second
write that compensates for the first**: an inverse operation to implement and
keep in sync, an audit trail that now reads "decided, then retracted", a race
against any other actor who touched the row in between, and a reversal that
can itself fail. In a commit window nothing landed. Reversal means cancelling
a timer. There is no inverse to get wrong, no retraction to explain, no race
to lose, and no failure mode in the undo path at all — cancellation cannot be
rejected by a server that was never asked.

That simplification is the whole value proposition, and it is bought with one
price: **for the length of the window, the truth is local**. The surface says
the rows are handled; the owning store still says they are pending. Every
other reader — a second operator, another tab, a report, the same operator's
own background refresh — sees the old value and is not wrong to. A design
that forgets it is holding unshared truth produces the three failures below,
and each of them is silent.

## What the naive implementation gets wrong

**The vanished batch.** The operator applies the verdict, sees the rows go,
and immediately navigates away — to the next queue, to a linked record, out of
the application. The surface is torn down, its timer dies with it, and the
write never happens. On the operator's next visit the rows are back, wearing
the verdict they had before, and nothing anywhere records that a decision was
made and dropped. This is the subject's defining failure, and the fix is a
reversal of the obvious cleanup: **teardown commits the pending batch rather
than cancelling it** ([flush-on-teardown](./techniques/flush-on-teardown.md)).
The window is a courtesy extended to the operator, not a condition they must
satisfy by standing still.

**The stale repaint.** A surface that shows a live queue refreshes itself in
the background. During the window that refresh returns the store's truth,
which still says pending, and the optimistically-removed rows reappear
mid-window — undone by nobody, in front of an operator who did nothing wrong.
Worse, the reappearance can arrive after the operator has already moved on to
the next batch. The fix is to suspend background refresh for exactly the
window's duration and release the suspension on every exit path without
exception ([freeze-refresh-during-window](./techniques/freeze-refresh-during-window.md)).

**The double-armed batch.** The operator's second click lands sixty
milliseconds after the first, before the control that was supposed to disable
itself has been repainted. Two windows are now open over the same identities.
Both commit; the store takes the write twice; where the write appends a
decision record, one judgment produces two, and any reconciliation that counts
decisions is now wrong. Disabling the control is a courtesy to the eye. The
invariant lives in the handler, checked against the authoritative pending
state before anything is applied
([single-pending-batch-invariant](./techniques/single-pending-batch-invariant.md)).

## The invariants

Everything in this subject reduces to five statements that must hold at every
instant, including the instants between a click and the next repaint:

1. **At most one window is open**, and the identities it covers are frozen at
   arming time.
2. **The pending payload is self-sufficient** — it carries the identities and
   the verdict, so committing it needs nothing from the surface, which may be
   gone by then.
3. **Every path out of the window releases what arming acquired**: the timer,
   the refresh suspension, the optimistic overlay. Commit, undo, failure, and
   teardown are four paths, not one happy path with three exceptions.
4. **Teardown commits.** The only thing that cancels a pending batch is the
   operator asking for cancellation.
5. **The result is reconciled per identity.** A batch is not a transaction
   unless the store makes it one; partial success is the normal case and is
   reported as such
   ([partial-failure-reselect](./techniques/partial-failure-reselect.md)).

The window's length is a stated number, not an implementation detail. Long
enough that a person who has just realised their mistake can reach the
control — a few seconds is under that floor, and a minute is above the
ceiling where the operator's model of "done" has become a lie they will act
on. The interface states it before the act ("these will be archived in five
seconds unless you undo") rather than leaving the operator to infer urgency
from a shrinking bar.

## Where this subject ends

The closest neighbour is [undo & history](../undo-history/undo-history.md),
and the line between them is the commit boundary itself. That subject owns
reversal *after* the change is real: the model that stores what must be
restored, the stack that bounds it, the checkpoints that let a user return to
a state the system has already committed to. It assumes the change happened
and asks how to get back. This subject owns the interval *before* the change
is real, where getting back means never having gone. A reader picks in one
sentence: **if reversing requires writing something, that is undo history; if
reversing requires only not writing, that is a commit window.** The two
compose in one surface without conflict — a commit window over the bulk
verdict, an undo stack over the editing beneath it — but they never share
mechanism, because a stack entry that represents an un-happened write is an
entry whose inverse is a no-op, which is a stack lying about its own depth.

[Triage queues](../../../operations/service-operations/triage-queues/triage-queues.md)
own the surface this most often appears on, including
[bulk triage](../../../operations/service-operations/triage-queues/techniques/bulk-triage.md) —
selecting many rows, holding that selection as identities, and choosing how
much friction a bulk verdict earns in each direction. That subject stops at
the decision. This one starts at it: given a batch and a verdict, when does
the write happen, what protects the interface until then, and what happens to
the batch when the operator leaves. Where the two touch, the queue's rule
governs *what may be batched* and this subject's rules govern *how the batch
lands*.

[Human-in-the-loop approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md)
owns the durability of a verdict — what a decision record must contain, that
it is written in the same step as the state transition, that it is appended
rather than edited. Nothing here contradicts that: a commit window does not
weaken the record, it moves the moment the record is written to the end of the
window. The two subjects meet at exactly one rule, and it runs in this
direction: a commit window is legitimate only for actions whose *non-
occurrence* is a safe outcome. Where a machine is blocked waiting on the
verdict, or where the record's timestamp is itself the artifact, the window is
a delay with no compensating benefit and the write goes immediately.

## When not to open a window

- **When the act is irreversible by any means** — a send, a payment, a
  publish, a destructive delete with no recorded state. A window makes these
  *feel* recoverable for five seconds and then removes the feeling without
  announcement, which is worse than the friction it replaced. Irreversible
  acts earn their friction up front.
- **When another actor is waiting.** If a second person or a machine is
  blocked on the verdict, deferring the write defers their unblocking, and the
  local truth is being kept from precisely the party who needs it.
- **When the batch is one row and the act is cheap.** A window over a single
  trivially-repeatable action is ceremony; the operator can simply do it
  again.
- **When the commit itself is slow enough to outlast the window.** If writing
  the batch takes longer than the window is open, the operator's "undo"
  overlaps a running commit, and the design is back to needing compensation —
  at which point undo history's machinery is the honest choice.
- **When the surface cannot suspend its own refresh.** A window without the
  freeze produces the stale repaint on a schedule, and an operator who has
  watched their decisions flicker back once does not trust the surface again.

## The techniques

- [deferred-write-window](./techniques/deferred-write-window.md) — the
  mechanism and its ledger: what deferring buys, what it costs, how long the
  window runs, and what the affordance owes the operator while it is open.
- [single-pending-batch-invariant](./techniques/single-pending-batch-invariant.md) —
  one open window at a time, guarded where the action is taken rather than
  where the control is drawn, and what the guard does with the click it
  refuses.
- [freeze-refresh-during-window](./techniques/freeze-refresh-during-window.md) —
  suspending background refresh while local truth is on screen, discarding the
  response already in flight, and releasing the suspension unconditionally.
- [flush-on-teardown](./techniques/flush-on-teardown.md) — leaving commits the
  batch; where the payload has to live for the cleanup to still see it; what a
  commit with no surface left to report to may and may not assume.
- [bounded-fanout-commit](./techniques/bounded-fanout-commit.md) — a small
  number of workers over a shared cursor, each identity claimed once, results
  aligned with inputs, no rejection escaping a worker.
- [partial-failure-reselect](./techniques/partial-failure-reselect.md) —
  reverting only what failed, re-deriving counts from the mapped result rather
  than from a union, and a retry that re-enters the same window instead of
  bypassing it.
