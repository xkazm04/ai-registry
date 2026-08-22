---
layer: technique
type: technique
subject: batch-undo-commit-window
technique: partial-failure-reselect
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [some rows in a batch failed to write, a counter drifting away from the rows on screen, offering a retry after a partial bulk failure]
---

# Reverting, recounting, and re-selecting what failed

A batch is not a transaction unless the owning store makes it one, so partial
success is the normal case rather than the edge. Twenty-eight identities
wrote, two were rejected. What the surface does in the next few milliseconds
decides whether the operator can finish the job or has to reconstruct it by
hand from a notice that has already disappeared.

Three moves, in this order: revert exactly what failed, re-derive the counts
from the result, re-select the failures so the next action is already aimed.

## Revert exactly the failures

The succeeded identities stay applied. Reverting the whole batch because part
of it failed lies about the twenty-eight that landed, and it invites the
retry that writes them a second time — the operator sees thirty rows back and
does the only reasonable thing.

Reversion is per identity, driven by the paired result from the commit, and it
restores the rows to the state they had *before* the optimistic apply, not to
whatever the store currently says. Those differ: the store may have moved on
its own while the refresh was suspended, and a reversion that fetches fresh
truth is doing reconciliation work in the middle of an error path. Restore
locally, release the refresh suspension, and let the next refresh reconcile —
that is what it is for.

The reversion must also check that the batch it is reverting is still the
current one. A failure handler arriving after the surface has moved to a new
batch, and reverting by position or by "the current selection", corrupts a
batch that has nothing to do with the failure.

## Re-derive the count; never union it

Every such surface carries a count — items pending, items selected, items
remaining — and the tempting way to maintain it after a partial failure is
arithmetic on what is already known: the count before, minus the successes,
or the old set unioned with the failures. Both drift, for the same reason. The
identities in the batch are not guaranteed to still be in the collection: one
may have been resolved by another operator, filtered out by a change of view,
or removed by a lifecycle sweep while the window was open. A union counts it;
the rows on screen do not contain it; the number and the list disagree, and
the number is what the operator trusts.

Re-derive instead: apply the predicate to the freshly-mapped collection and
count what is actually there
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The
count is then a fact about the current collection rather than a running
subtraction whose error accumulates over a session. This is cheap — the
collection is in hand and already being mapped for the reversion — and it is
the only version that is still correct after the third partial failure in a
row.

The same law governs the report. "Twenty-eight archived, two failed" with the
two reachable is the honest shape. A bare "some items failed" gives the
operator nothing to act on, and a bare success notice after a partial failure
is the defect this whole technique exists to prevent
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Re-select the failures

After the revert, the surface's selection is exactly the failed identities.
This is the move that converts an error into a next step: the operator's
working set is already the work that remains, the count next to it is the
count of what remains, and a retry is one action rather than a re-selection
performed against a list that no longer visibly distinguishes the failures
from their neighbours.

Two qualifications. The re-selection replaces the previous selection rather
than adding to it — leaving the successes selected re-arms the double write.
And where the collection has been re-ordered or partly emptied since arming,
identities that are no longer present simply do not enter the selection; they
are reported in the failure notice, but a selection cannot hold rows that are
not there.

## The retry re-enters the same window

The retry is an ordinary invocation of the same action over the re-selected
identities: same guard, same optimistic apply, same refresh suspension, same
window, same undo. It is tempting to make it a shortcut — the operator has
already decided, so write immediately — and that shortcut removes every
protection at the exact moment the operator is least sure what state anything
is in. A retry path that differs from the primary path is also a second code
path that will not be exercised except during incidents.

Bound the loop honestly. A retry that fails for the same reason twice is not a
transient problem, and offering a third identical button teaches the operator
to hammer it. Surface the reason — the store rejected it, the identities no
longer exist, the caller is not permitted — and offer the action that
addresses the reason rather than the one that repeats the request.

## Three shapes of failure, all of them real

- **A rejected write** — the store answered and said no. The common case, and
  the only one most implementations handle.
- **A write that succeeded with a per-row error inside a successful
  response.** A response arrived and its status was fine; the body says one
  identity was not applied. Reading only the transport's verdict marks it
  applied, and the row silently diverges from the surface forever.
- **A write that never resolved** — timed out, or aborted when the surface was
  torn down mid-flush. Its outcome is genuinely unknown, which is a third
  state and must not be collapsed into either of the others. Treat it as
  failed for display purposes, but never as *known* failed for anything that
  would write again without checking.

## Prohibitions

1. No whole-batch revert on partial failure.
2. No count maintained by arithmetic over the previous count.
3. No selection left holding the succeeded identities.
4. No retry that bypasses the guard, the window, or the undo.
5. No success notice for a partially failed batch.
6. No unresolved write recorded as a definite outcome in either direction.
