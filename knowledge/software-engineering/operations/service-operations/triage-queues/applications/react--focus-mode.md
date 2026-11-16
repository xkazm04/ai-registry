---
layer: application
type: application
subject: triage-queues
technique: focus-mode
stack: react
verified_on: 2026-11-16
verified_against: react@19
---

# Focus mode: the decision deck in this repo, and the deck it replaced

*Re-read 2026-11-16 at project HEAD `8d076db46a` (`react ^19.2.6`). Read only,
through `git show` and `git grep`.*

**Correction (2026-11-16).** The 2026-08-18 version of this file described
the Quick Answer triage deck (`src/features/agents/quick-answer/triage/deck/`,
including `useDeckControls.tsx`). That surface no longer exists. Commit
`f5a1c27d2b` (2026-10-06, "retire what the Decision Center replaced")
deleted the deck UI, together with its in-flight lock, its
`FLIGHT_TIMEOUT_MS` watchdog, its reason-capture split, its persisted
drafts and its keyboard priority constant. The triage *model* stayed and
now feeds the Decision Center roster. `quick-answer/DESIGN.md` is headed
"Retired as a surface 2026-10-06". The live deck is
`src/features/decision-center/deck/`. Sections 1-3 below describe it.
Section 4 records what survives of the old deck's model code.

## 1. Cursor by identity, verdict bound to the card shown

`deck/useDeck.ts:57` resolves the card in hand from an id:
`Math.max(0, queue.findIndex((x) => x.id === currentId))`. A missing id
falls back to the front. The queue is the roster's, ordered by
`compareDecision` (see the ordering application). `decide`
(`useDeck.ts:106-112`) captures `item` from the render that showed it, and
commits that captured identity after the stamp beat. So a poll that
reorders the queue during the beat cannot redirect the verdict to another
card. That is the technique's "the verdict targets what the operator saw"
rule.

## 2. No flight lock: optimistic removal instead, and where the watchdog went

The old deck locked input while a card was in flight and armed a 1200 ms
watchdog. The new deck has no lock on the write. The only guard is
`if (!item || stamp) return` (`useDeck.ts:107`). It covers the
`STAMP_BEAT = 150` ms (`:38`) between the stamp and the commit, and a
`setTimeout` always releases it. After the commit:

- The roster removes the item at once, through an identity set
  (`useDecisionRoster.ts:351`, `setRemoved(... .add(id))`). The deck moves
  to a neighbour by id (`useDeck.ts:93`). Input is free immediately, and a
  second keystroke cannot reach the departed card, because it is no longer
  in the queue.
- A rejected write restores the item (`useDecisionRoster.ts:357-369`), and
  the deck walks back to it (`useDeck.ts:102`). The restore returns the
  operator, as verdict-writeback requires.
- The last card closes the deck only after its write lands (`:100`).

What bounds a write that never settles is not the deck. It is the IPC
wrapper's default 90 s deadline (`src/lib/tauriInvoke.ts:39`), because the
row writes go through `invokeWithTimeout`. While a write is pending, the
item stays hidden: `removed` keeps every id its source still returns
(`useDecisionRoster.ts:260-270`). Only the deadline's rejection brings it
back.

**Gap against the amended watchdog clause.** The timeout rejects with
`InvokeTimeoutError`. The wrapper documents that this rejection "does NOT
cancel the backend", and the error carries `backendMayStillBeRunning`
(`tauriInvoke.ts:45-56`, `:134-147`, `:571-581`). The tree already treats
this error as "indeterminate" elsewhere (`src/lib/network/p2pCapability.ts:56`).
The roster's `decide` does not. It handles a timeout like a refusal:
the item is restored as plainly pending, and the deck walks back to offer
it for a fresh verdict. The second verdict is safe only where the row
write is a compare-and-swap, because a lost swap is handled as "decided
elsewhere" (`:358-361`). Commit `4223926cf7` (2026-10-31) describes the
deck writes as compare-and-swap. That was not re-verified write by write
for this file.

## 3. Skip is a walk, not a deferral

`useDeck.ts:86-91`: a skip moves to the next card, wrapping round
(`q[(i + 1) % q.length]`). With one card left, it does nothing. The roster
writes nothing for a skip (`roster/decisionDispatch.ts:89-93`,
`isRosterDeferral`). So skipping neither hides a card nor reorders the
queue. Skipped cards stay in the tray's count, and the deck never reaches
its empty state while any of them remain. The operator leaves with close.
The technique's bound on skips exists so that a *sorts-last* deferral can
terminate. A walk does not need one, because it never claims the queue is
clear. A reject is two-step (`:115-121`): the first `R` arms it, the
second confirms, and if the item has a reject prompt, the prompt opens
before the write.

## 4. What survives of the retired deck

`triage/triageQueue.ts` is byte-for-byte the projection the old deck dealt
from:

- `MAX_SKIP_PASSES = 2` (`:42`).
- The id cursor at `:171`.
- Skips sort before the ordering law (`:151-162`).
- `sessionTotal = resolved.size + pending.length` (`:177`).

`useUnifiedTriage.ts:876` still computes this projection, and
`UNDO_WINDOW_MS = 30_000` (`:125`) still exists. But the roster, which is
the only caller of `useUnifiedTriage` (`useDecisionRoster.ts:167`), reads
`triage.sources` (`:224`), which is the data *before* the session filters.
No live surface deals from the skip ledger or offers the 30-second undo.
That is model code with no surface left to use it. It is correct, and it
is unused.
