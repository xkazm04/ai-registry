---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: deferred-write-window
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [choosing between deferring a write and compensating one, setting the length of an undo window, deciding what the undo affordance must say while it is open]
---

# The deferred write window

Undo, in this subject, cancels a timer. That sentence is the technique: the
verdict is applied to the surface's own state at once, a timer is armed for a
stated interval, and the write to the owning store happens only when the timer
fires. Pressing undo clears the timer and restores the local state. No inverse
operation runs, because no operation ran.

## The ledger, stated honestly

**What deferring buys**

- **No compensating write to author.** An inverse is a second implementation
  of the forward operation's meaning, and it drifts from the forward path the
  first time somebody changes one of them. Deferral has one code path.
- **No retraction in the record.** Where the write appends a decision record,
  post-commit undo leaves a trail that reads "decided, then undecided", and
  every consumer of that trail — an audit, a rate of reversals, a
  reconciliation — must now understand a state that means "pretend the first
  one was not there". A cancelled window leaves no trace, which is correct:
  nothing was decided.
- **No race to lose.** A compensating write contends with whatever happened to
  the row in the meantime, and the honest resolution is that the undo
  sometimes *loses* and must say so. A cancelled window never touched the row,
  so there is nothing to contend with.
- **An undo that cannot fail.** Cancellation is local and synchronous. A
  reversal that can itself be rejected is a reversal the operator cannot rely
  on at the moment they most need to.

**What deferring costs**

- **A window of unshared truth.** The store is behind the screen for the
  window's length. Every other reader sees the old value, and any of this
  surface's own reads will contradict it — which is why the refresh must be
  frozen ([freeze-refresh-during-window](./freeze-refresh-during-window.md))
  and why a second operator working the same queue is a genuine, if rare,
  collision.
- **A batch that exists only in memory.** A crash, a reload, or a navigation
  destroys it unless something commits it on the way out
  ([flush-on-teardown](./flush-on-teardown.md)). Deferral converts a write
  problem into a lifetime problem, and a lifetime problem is only safe when
  the resource names its reaper
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
- **Delay for whoever is waiting.** If anything downstream is blocked on the
  verdict, the window is dead time added to their wait for a benefit they do
  not receive.

The decision rule follows from the ledger: **defer when not-writing is a safe
outcome and this surface is the only party that needs to know yet; compensate
when the write must be visible immediately or the act cannot be un-had.**

## The timer names its reaper, in four directions

An armed window acquires three things — a timer, a refresh suspension, and an
optimistic overlay over the displayed rows — and there are four ways out:
commit on expiry, undo by the operator, failure during commit, and teardown of
the surface. Each of the four releases all three. The common defect is a
release written once, on the success path, with the other three paths
inheriting whatever state the failure left; the symptom is a surface that
works perfectly until the first error and is subtly broken forever afterward.
Write the release once, as a single function, and call it from all four.

A fired timer must also prove it is still the window that armed it. A
cancelled-but-not-cleared timer, or a timer surviving from a previous batch,
fires into a surface that has moved on and commits a payload nobody is
expecting; the guard is that the callback reads the current pending batch and
does nothing if the batch it was armed for is no longer the one there.

## What the affordance owes the operator

The window is only worth having if the operator can find it, and the
constraints are unusually specific:

- **One slot, and the reversal wins it.** Whatever transient region the
  surface uses for status, the undo affordance owns it for the window's
  duration, and progress or confirmation messages about the same action are
  suppressed rather than stacked. Two competing notices for one act is how an
  operator misses the one that matters — and the one that matters is always
  the one that can still be acted on.
- **The window's length is stated before the act, not inferred during it.**
  The copy names the interval ("archiving 34 items in five seconds") so the
  operator knows there is a deadline. A bar that silently drains is a deadline
  discovered by missing it.
- **The countdown is decorative and must be hidden from assistive
  technology.** A live region announcing a number that changes every second
  produces a stream of announcements that buries the sentence the operator
  needs. Announce once — what happened, how many, that undo is available —
  and mark the ticking number as presentational.
- **The deadline has exactly one owner.** The countdown a viewer draws is a
  *display* of the window, never a second clock that decides when it ends. Two
  timers started for the same interval do not expire simultaneously — one of
  them lands first, and if the display's timer is the one that clears the
  pending state, the guard that reads that state now says "idle" while the
  real commit timer is still armed. Give the display the deadline and let it
  render; the window's owner alone decides that it is over.
- **The control is reachable without a pointer** and does not steal focus from
  whatever the operator is doing next. A reversal affordance that requires a
  mouse, or one that yanks focus out of the row the operator has moved to,
  trades one mistake for another.
- **Expiry is silent; failure is not.** The window closing normally needs no
  announcement — the operator already believes it is done. A commit that
  failed must say so, in a form that survives the transient region
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  because a batch that silently did not land is indistinguishable, on screen,
  from one that did.

## Choosing the interval

Long enough to notice and reach the control; short enough that "done" is not a
lie the operator will act on. Five to ten seconds is the working band for a
verdict applied at a desk. Below about three seconds the control disappears
before a person who was looking elsewhere can return to it, which makes the
affordance decorative. Above about thirty the operator has left the moment,
and the window is now holding unshared truth for someone who has stopped
thinking about it — and holding it against every other reader of the store.

Do not make the interval a per-user preference without a floor; the setting
exists to be raised, and the operator who lowers it to zero has silently
opted out of the only protection the surface offers.

## Prohibitions

1. No window over an act that cannot be reversed by not happening.
2. No release path that exists only on success.
3. No timer that fires without checking it is still the current batch.
4. No countdown announced repeatedly to assistive technology.
5. No window whose length the interface never states.
6. No second notice competing with the undo affordance for the same slot.
7. No second clock deciding the deadline the window's owner already owns.
