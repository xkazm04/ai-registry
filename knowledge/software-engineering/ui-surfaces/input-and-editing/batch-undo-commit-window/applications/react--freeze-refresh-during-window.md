---
layer: application
type: application
subject: batch-undo-commit-window
technique: freeze-refresh-during-window
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: experiment
ab_verdict: not-better
---

# The refresh that is not frozen - a review queue that overlays instead

A review queue in a dashboard holds each verdict for five seconds before it is
written, and polls its list every fifteen. The store never suspends the poll.
`fetchReviews` opens with the comment "No pause flag: the response is overlaid
with the ledger at the point it is applied, so a poll (even one already in
flight when a window opened) cannot repaint a pending verdict." Verified
against the tree at `73f09d2d`, working copy clean for the files read.

## What the tree does instead of freezing

The visible list is never stored as one truth. The store keeps the server rows
(`baseReviews`) and the window's ledger separately, and one function
(`derive`, "The only place `reviews` and `pendingReviewCount` are derived")
computes the list as `overlay(baseReviews, ledger)`. A poll replaces the base
and the list is recomputed; the open window's verdicts sit on top because the
ledger, not the rows, carries them. Confirmed writes are kept in a second map
and reconciled against later polls, and a write that settles bumps the fetch
sequence so a response that left before the server had it is dropped.

That satisfies the technique's second half (the response in flight is neutral
when it lands, decided at the point of application) by a different route: the
guard is a derivation at the application point, not a discard.

## The experiment

A harness test over the real store with the list read and the write mocked,
under fake timers, two arms, product code unchanged:

- **A**: the store as it is.
- **B**: the technique as written, placed at the refresh routine: return
  without fetching while the ledger has an open window.

Target: what the operator sees during the window. Floor: the verdict does not
flicker back, and the existing ten store tests stay green.

- Flicker: the verdict held in A; B holds it by construction. Tie.
- Arrival: a review created elsewhere appears during the window in A and is
  hidden in B until the window closes. The technique's own cost, and the one
  thing a frozen surface cannot show.
- Release: in A, after a commit that throws, the window is closed and the next
  poll lands a new row. There is no suspension to strand. A caller-side flag
  cleared only on the success path (mutation B') stays set after the same
  failure, which is the outage the technique's third prohibition describes.

Verdict `not-better`: freezing buys nothing here that the overlay does not
already give, and costs an arrival. The floor held in both arms.

## The boundary this adds

Freezing is the right tool when the visible collection is stored state that
refresh overwrites. It is unnecessary when the view is a pure derivation from
two inputs (fetched rows, the window's verdicts keyed by stable row id)
recomputed on every arrival: the optimistic state is then never in the
collection a refresh writes to, so there is nothing to suspend and nothing to
release. The structural fact is negative: this tree has no suspension flag
because its design made the release problem unrepresentable.

## What this realization cannot do

It needs stable row identity across polls. A row whose id changes on refresh,
or a verdict on a position rather than an id, cannot be overlaid. It also does
not stop a poll from reordering rows under the pointer; the technique's flag
would, and no arm here measured pointer targeting.
