---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: single-pending-batch-invariant
status: forged
laws: [one-validation-door, identity-survives-reuse]
shared_with: []
use_when: [a double click arming two batches over the same rows, deciding what a refused bulk action should do, a disabled control failing to prevent a second action]
---

# One pending batch at a time

While a commit window is open, no second window may be armed. The invariant is
short to state and is violated by the most ordinary user behaviour there is —
a double click — because the control that was supposed to prevent it is
disabled by a repaint that has not happened yet.

## Why two windows cannot be allowed to coexist

Two open windows over the same identities commit the same verdict twice. If
the store is idempotent per identity the damage is invisible until something
counts: a decision record appended per write turns one judgment into two
authorships, a metric of "verdicts per hour" doubles, and a downstream
reconciliation that expects one record per identity finds two and cannot tell
which is authoritative. If the store is *not* idempotent, the second write
lands on the state the first one produced, and the result depends on which
worker finished first. And the damage does not stop at the store: where a
write fans out — a notification per resolution, an outbound delivery to a
subscriber, a downstream job per record — the duplicate leaves the system
entirely and cannot be reconciled by anyone who receives it.

The guard's condition is wider than "a window is open". The dangerous
interval runs from arming until the commit has settled, and it includes the
stretch after the window closed while the writes are still in flight — arming
a second batch there produces exactly the same double write, with the added
confusion that the affordance has already disappeared. Guard on *window open
or commit in flight*.

Two open windows over *different* identities are less catastrophic and still
wrong, because the undo affordance is singular. The operator sees one control
and one count; pressing it takes back one batch, and which one is an
implementation detail nobody can predict from the screen. An affordance whose
meaning depends on invisible ordering is not a reversal mechanism.

## The guard belongs in the handler, not on the control

Disabling the trigger while a window is open is correct and insufficient. The
disable is a rendering consequence of a state change, and rendering is
scheduled: between the first click's state update and the repaint that reflects
it there is a gap wide enough for a second click, and human double-click
timing lands squarely inside it. The gate that actually holds is a check at
the top of the action handler, before anything is applied
([one-validation-door](../../../../_laws.md#one-validation-door)) — one door
through which every arming path passes, whether it came from the toolbar
button, the keyboard shortcut, the context menu, or a repeated invocation of
the same one.

The check must read the **current** pending state, not a copy captured when
the handler was created. A handler holding a snapshot from the render that
preceded the arming sees "idle" forever and guards nothing — which is the
failure that makes teams conclude the guard "doesn't work" and reach for the
disabled attribute again. Read through the same authority the arming path
writes to: if arming sets a field, the guard reads that field's live value.

The pending batch carries an identity minted when it is armed
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). The
guard uses it to distinguish "a window is open" from "a window was open"; the
commit callback uses it to prove the batch it is about to write is still the
current one; a late failure handler uses it to avoid reverting rows belonging
to a batch that has since been replaced. A boolean flag answers the first
question and none of the others.

## What the refused click should do

A silently swallowed second click reads, to the operator, as an application
that ignored them — and the reliable response to being ignored is to click
again, harder. Two answers are defensible and the choice depends on overlap:

- **Refuse visibly.** The action does nothing and says why: the previous batch
  is still pending, here is the control that resolves it. Correct when the new
  selection could overlap the pending one, because a flush-then-arm across
  overlapping identities produces exactly the double write the invariant
  exists to prevent.
- **Flush, then arm.** Commit the pending batch immediately, then open a new
  window for the new one. Correct when the identities are provably disjoint
  and the operator is working at speed — a queue where each verdict removes
  its rows from the collection makes overlap structurally impossible, and
  making the operator wait out a window they have already moved past is
  friction with no safety return. The operator loses the ability to undo the
  first batch; that loss must be acceptable *because* they have already acted
  again, which is the strongest possible signal that they meant it.

What is not defensible is queueing the second batch behind the first. A queue
of pending windows multiplies every invariant in this subject by its depth,
and the affordance still has one slot.

## Arming, in order

The order of operations at the top of the arming path is itself the invariant,
and each step is there because of a failure it prevents:

1. **Refuse or flush** if a window is already open — the guard above.
2. **Resolve any orphaned timer — by committing it, not by clearing it.**
   Even under the guard, a timer can survive a path that released the
   displayed state without releasing the timer, and overwriting the handle
   would leave it to fire later against identities the surface has forgotten.
   Resolving it before arming makes the arming path self-healing rather than
   dependent on every other path's discipline. The instinct here is to cancel,
   and cancelling is the vanished-batch failure arriving through a second door
   ([flush-on-teardown](./flush-on-teardown.md)): an orphan with a payload is
   still an operator's decision, and it is committed before the new window
   opens.
3. **Apply optimistically** to the local state, so the surface reflects the
   verdict before the next frame.
4. **Suspend background refresh**, before the timer exists rather than after —
   a refresh that lands between the optimistic apply and the suspension
   repaints exactly the rows just removed.
5. **Record the pending payload** where the commit and the teardown can both
   reach it.
6. **Arm the timer** last, so it can never fire against a half-built window.

## Prohibitions

1. No arming path that bypasses the guard, including the keyboard one, the
   confirmation dialog's own handler, and the retry.
2. No guard reading a captured copy of the pending state.
3. No guard that covers the open window but not the in-flight commit.
4. No boolean where the batch's identity is needed.
5. No queue of pending windows.
6. No flush-then-arm across identities that can overlap.
7. No orphaned timer discarded with its payload.
8. No refusal the operator cannot see.
