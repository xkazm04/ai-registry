---
layer: application
type: application
subject: batch-undo-commit-window
technique: flush-on-teardown
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# The unmount that commits — bulk review verdicts in a Next.js dashboard

`src/hooks/useReviewBulkActions.ts` runs the whole commit window for the
manual-review queue: select rows, approve or reject, five seconds of undo,
then a bounded fan-out of `PATCH`es. The teardown path is at `:287-311`, and
it is the file's only comment marked *Critical*.

## The cleanup commits, and says why

```ts
// Critical: if the operator navigates away while an undo window is
// open, commit the optimistic batch *before* clearing the timer.
// Without this flush, clearTimeout silently abandons the 5-second-
// pending PATCHes and the rows revert on the next poll — the
// operator's audit decisions are dropped with no signal.
```

(`:289-293`.) The body reads the pending payload, cancels the timer so it
cannot also fire, and fires the commit itself (`:294-304`). Note the order:
`clearTimeout` first, then the commit inside the same branch — the timer is
the thing being replaced, not the thing being obeyed.

## Where the payload lives, and why it is not state

The non-obvious half of the technique is visible at `:41-44`:

```ts
// Mirror of `undoState` so the unmount cleanup can read the latest pending
// batch — React state is captured at mount-time in a `[]`-deps cleanup,
// so the cleanup would otherwise see `null` and silently drop the action.
const undoStateRef = useRef<UndoState | null>(null);
```

`undoState` (the `useState`) exists to render `UndoToast`; `undoStateRef` is
the authority the cleanup reads. The arming path writes both in the same step
(`:214-215`), and every release clears both — the expiry timer at `:221-222`,
the operator's undo at `:269-270`, the teardown at `:305`. Two stores of one
fact is normally a defect; here it is the price of a cleanup that must read a
value the render it was registered in had not produced yet.

The registration deps are the other half. The effect's dependency array is
`[executeBulkAction]` (`:311`), and `executeBulkAction` is a `useCallback`
over `[resolveReview]` (`:180`) — a store selector result, stable for the
store's lifetime. So the cleanup is registered once per mount. Had
`executeBulkAction` closed over the filtered rows (which change on every
15-second poll), the effect would tear down and re-run on each poll and the
"flush" would commit one frame after arming, with the undo affordance still on
screen. The stability of that dep is load-bearing and worth a test, not a
comment.

## Everything the window acquired is released here

`setPollPaused(false)` at `:308` sits **outside** the `if (undoTimerRef.current)`
branch, unconditionally, with the reason stated: leaving it `true` "would
freeze polling for the lifetime of the next mount until something cleared it".
That is exactly the shared-store failure the technique names — the flag lives
on the store (`src/stores/reviewStore.ts:266`, read as an early return in
`fetchReviews` at `:290`), so it outlives the surface that set it, and a
frozen queue produces no error anywhere. The result-toast timer is cleared on
the same path (`:309`).

## Fire-and-forget, honestly labelled

```ts
// Fire-and-forget — cleanup must be synchronous, but the network
// round-trip can complete after unmount; the store mutations
// inside executeBulkAction are safe against an unmounted consumer.
```

(`:299-301`.) True as far as it goes: `executeBulkAction` writes through
`useReviewStore.setState`, which is external to the React tree and unaffected
by unmount, so a late-arriving success still lands in the store the next mount
reads.

## Where it falls short of the technique

- **A flush that fails reports to nobody.** After unmount, the failure branch
  at `:147-172` calls `setSelectedIds` / `setBulkResult` — no-ops on a dead
  component — and there is no error-channel write. A teardown commit that
  rejects for all 30 ids is indistinguishable from one that succeeded: the
  rows are simply still pending on the next visit. The technique requires the
  failure to land somewhere durable with the identities in it.
- **Hard session termination is uncovered.** The flush is an ordinary
  `fetch`-backed `PATCH` issued during unmount; a closing tab can cancel it
  in flight. Nothing here claims otherwise, and nothing mitigates it either —
  `sendBeacon`/`keepalive` would be the shape if the exposure ever matters.
- **The arming path drops an orphan instead of flushing it.** `:185-192`
  clears a surviving `undoTimerRef` before queuing the next batch, without
  committing `undoStateRef.current`. The guard at `:237` makes that branch
  hard to reach, but where it *is* reached the earlier batch is silently lost
  — the same data loss the teardown flush exists to prevent, arriving through
  a different door. The technique's rule holds in both places: the only thing
  that cancels a pending batch is the operator asking.
