---
layer: application
type: application
subject: batch-undo-commit-window
technique: partial-failure-reselect
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Reverting two of thirty — the partial-failure path of a bulk review commit

When the five-second window closes, `executeBulkAction`
(`src/hooks/useReviewBulkActions.ts:110-181`) writes the batch through a
six-worker pool over a shared cursor and lands the whole partial-failure
contract in twenty-five lines.

## Alignment first, so the failures have names

```ts
const results: { status: "fulfilled" | "rejected" }[] = new Array(ids.length);
let cursor = 0;
```

(`:122-123`.) Each worker takes `const i = cursor++` (`:127`), awaits
`resolveReview(ids[i], status)`, and writes its outcome into `results[i]`
(`:129-135`) — never pushes. The comment at `:117-120` states both reasons:
cap the concurrency "so a 100-item bulk approve doesn't thunder against the
orchestrator", and keep results index-aligned "so the existing `failedIds`
derivation still works". That derivation is one line:

```ts
const failedIds = ids.filter((_, i) => results[i].status === "rejected");
```

(`:145`.) `ids` is the array captured when the window armed, immutable for
the call — the precondition that makes positional pairing legal here. Note
the `catch` at `:131` swallows the error object itself: `failedIds` carries
identities but no reasons, so the surface can say *which* failed and never
*why*.

## Revert exactly the failures, then recount from the mapped array

The reversion (`:148-161`) maps the whole collection but flips only the rows
in `failedIds` back to `pending`, clearing `resolvedAt` / `resolvedBy`. The
succeeded rows keep the verdict the optimistic apply gave them. Then the
comment that names the drift:

```ts
// Derive the count from the freshly-mapped array, not from the stale
// pre-map `s.reviews` + failedIds union (which drifted from the real
// count of status==="pending" rows until the next poll healed it).
```

(`:154-156`) — followed by `pendingReviewCount: reviews.filter((r) => r.status
=== "pending").length` (`:159`). The union it replaced was wrong whenever a
batched id had already left the collection, and the symptom was the badge
disagreeing with the visible rows until the next 15-second poll papered over
it. Every other write of that counter in the hook now uses the same
recompute-from-the-fresh-array shape (`:203` on the optimistic apply,
`:266` on undo), which is what makes the three paths agree.

## Re-select, report, retry

`setSelectedIds(new Set(failedIds))` (`:162`) leaves the operator's selection
holding exactly the work that remains — and replaces the previous selection
rather than merging into it. `setBulkResult` (`:163-168`) carries `total`,
`successCount`, `failedIds` and the verdict; `BulkResultToast` renders it only
when `failedIds.length > 0`
(`src/app/dashboard/reviews/reviews-split-pane/ReviewsSplitPaneToasts.tsx:51-62`),
so a clean commit is silent and a partial one is `role="alert"`. The copy
carries both halves of the count —
`"{failed} of {total} failed to approve"` and
`"{count} succeeded · failed items re-selected"`
(`src/i18n/en.ts:2258-2260`) — which is the count-with-its-predicate rule
applied to a toast.

`retryFailed` (`:280-285`) dismisses the result and calls
`startBulkWithUndo(failedIds, status)` — the *same* arming path, so the retry
gets the same optimistic apply, the same poll pause, the same five seconds and
the same undo. No shortcut path exists, which is the point.

The success branch is equally deliberate: `setSelectedIds(new Set())` at
`:174` clears the selection only when nothing failed.

## Where it falls short of the technique

- **Only thrown rejections count as failure.** `resolveReview`
  (`src/stores/reviewStore.ts:314-329`) awaits `api.updateEvent` and throws on
  a non-OK response, so transport failures are caught. A 200 response carrying
  a per-row error in its body would be recorded `fulfilled`, and that row
  would diverge from the surface permanently. The third failure shape — a
  write that never resolved because the flush was cut off at unmount — is
  likewise recorded as a plain rejection with no "outcome unknown" state.
- **The retry re-enters arming without re-entering the guard.**
  `retryFailed` calls `startBulkWithUndo` directly, skipping the
  `undoState !== null || bulkResolving` check that `handleBulkAction` (`:237`)
  and `handleBulkRejectConfirm` (`:249`) both perform. It is currently
  unreachable in a bad state — a result toast only exists after a commit
  settled — but it is a second door into the arming path, and the invariant
  wants one.
- **Two clocks own one deadline.** The commit timer (`:220-226`) and
  `UndoToast`'s own `setTimeout(onExpire, durationMs)`
  (`src/components/UndoToast.tsx:31-34`) both run for 5000ms;
  `handleUndoExpire` (`:274-278`) clears `undoState` and releases the pause
  without committing, relying on the hook's timer to fire at the same instant.
  Whichever lands first nulls `undoState`, which is what the arming guard
  reads. One authority for the deadline — the hook's timer, with the toast
  purely presentational — removes the race.
- **A no-op reversion after unmount.** The failure branch's `setSelectedIds` /
  `setBulkResult` are dead calls when the commit came from the teardown flush,
  so a partially-failed flush reverts the store rows correctly (`:148-161`
  writes through the store, not React state) but reports nothing at all.
