---
layer: application
type: application
subject: batch-undo-commit-window
technique: single-pending-batch-invariant
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: experiment
ab_verdict: better
---

# One window, one write per identity - a recruiter's quick reject

The Decisions tab arms a quick reject for eight seconds and writes only when the
window closes. Its module header states the invariant in two rules: "ONE window.
Arming a second decision FLUSHES the first (commits it) and then arms", and "a row
already pending, committing or in flight is ignored (checked against the current
state, not a stale closure)". Verified against the tree at `5abd67318`, working
copy clean for the files read.

## Where the invariant sits

- **The guard is in the arming function, not on the control.** `arm()` is a pure
  reducer step, so the check reads the state it is handed; there is no closure to
  go stale, and the store calls it as `arm(s, decision, Date.now())` on the live
  state.
- **The refusal answer is flush-then-arm, and it is the disjoint case.** A queue
  where each verdict removes its row makes overlap structural: `hiddenIds()` hides
  the pending row, every flushed row still in flight, and every landed row until
  the queue's next read. The guard asks that one set, so the "window open or commit
  in flight" condition is a single question.
- **No queue of windows.** The flushed predecessor is a commit in flight, not a
  second pending window, so the strip always names the latest and has one Undo.

## Anchors

Each resolved against the tree with `check-anchors.mjs`.

- app/features/hiring/decisions/decisionsCommitWindow.ts:18 "ONE window."
- app/features/hiring/decisions/decisionsCommitWindow.ts:21 "checked against the current"
- app/features/hiring/decisions/decisionsCommitWindow.ts:96 "if (hiddenIds(state).has(decision.entryId)) return same(state);"
- app/features/hiring/decisions/useDecisionCommitWindow.ts:83 "dispatch((s) => arm(s, decision, Date.now()))"

## The experiment: which clause of the guard does each test see?

The seam was chosen to falsify the finding that the reducer suite already pins the
invariant. Its test 5 covers a double click on the pending row and a click on a
committing row, which is the "current window" half of the guard. The technique's
wider clause - a second arming on an identity whose commit is still in flight after
a flush - was named in the module header and tested nowhere.

- **A (nine tests):** the guard narrowed to the current window only
  (`state.kind !== "idle" && state.entryId === decision.entryId`) passes 9 of 9.
  Removing the guard outright is caught by one test; narrowing it to the pending
  window alone is caught by one; narrowing it to the current window is not.
- **B (ten tests, one added):** arm A, arm B (A is flushed and in flight), arm A
  again from a second surface holding the old snapshot, then the same after A's
  commit landed and before the read pruned it. The narrowed guard now fails 1 of
  10; the real guard passes 10 of 10.

Target: mutants surviving, A 1 of 3 (current-only), B 0 of 3. Floor: reducer
suite green, `tsc --noEmit` clean for the file, sources unchanged (test only).
Shipped as a kp test commit on main, not pushed.

## What the realization cannot do

It cannot show that the second click is reachable today. The ledger hides a flushed
row, so the only path to a repeat is a surface holding a stale snapshot, and none
was found; the test pins the clause for the day the modal and the ledger disagree.
It also measures the reducer, not the repaint gap: no double-click timing was run
against the rendered control.
