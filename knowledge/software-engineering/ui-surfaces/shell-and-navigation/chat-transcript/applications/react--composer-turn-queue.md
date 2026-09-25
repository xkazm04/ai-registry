---
layer: application
type: application
subject: chat-transcript
technique: composer-turn-queue
stack: react
verified_on: 2026-09-25
verified_against: react@19.2
applied: code
ab_verdict: better
---

# The companion composer: a durable draft and a perishable queue, until the restart hands the queue back

The desktop companion's chat panel follows most of the technique. The composer
is never disabled. A mid-turn message is classified as a redirect (which
interrupts) or an addition (which queues), and one queued message drains per
turn completion, carrying the idempotency nonce it was minted with
(`chat/athenaChatQueue.ts`). Drafts are persisted per thread
(`athenaStore.ts`, the `companion-drafts` persist key).

## The defect: the send gesture lowered durability

Only the draft map was persisted. The store's own comment said everything else
"resets fine on a fresh app launch", and that included `queuedByConversation`.
`Composer.submit` clears the draft as soon as it calls `onSend`, and mid-turn
`onSend` enqueues. So pressing Enter moved the text from a store that survives
a restart into one that does not. A restart before the drain lost the message,
when the same words left unsent would have come back.

## A/B (code, 2026-09-25)

The instrument is one vitest file, `__tests__/queueRestart.test.tsx`, run
unchanged on every arm. It simulates a restart by snapshotting localStorage,
resetting the store to its initial state, restoring the snapshot and
rehydrating through the real persist middleware. Two assertions pull in
opposite directions on the same build. T1: text queued mid-turn is
recoverable after a restart. T2: no pre-restart text is sent without a fresh
gesture, neither at mount nor at the completion edge of the next, unrelated
turn. T3 checks order. Control C0 checks that the drain does deliver when
there is no restart, so a T2 pass cannot come from a deaf listener.

| arm | T1 survives | T2 no unprompted send | T3 order | floor (5 suites) |
| --- | --- | --- | --- | --- |
| A, as-is (ephemeral queue) | fail | pass | fail | 21/21 |
| B1, ephemeral, with the loss written beside the decision | fail | pass | fail | 21/21 |
| BD, queue persisted as a queue | pass | **fail** | pass | 21/21 |
| B2, queue persisted and restored as draft text | pass | pass | pass | 21/21 |

BD answers the question the technique warns about. The naively persisted
queue did not fire at startup, because the drain is edge-triggered. It fired
at the end of the first turn the user started after the restart, and
delivered the old follow-up into the new conversation. B1 is identical to A in
behaviour: writing the cost down makes the trade-off visible to the next
reader, but it does not keep the text.

B2 is shipped on the branch: the queue joins `partialize`, and a `merge`
folds any persisted queue into that thread's draft, in arrival order and ahead
of the existing draft, with the runtime queue left empty. A migration case
covers a profile written before the change: its drafts are kept and its queue
is empty. The companion suite shows 834 of 836 passing. The two failures are
an overseer component test that also fails on the base commit. Typecheck is 0
errors (its positive control went red on a planted error), and eslint is clean
on both touched files.

## What the floor could not see

The existing draft test, "survives an unmount/remount (window close/reopen)",
never rehydrates. Removing the draft map from `partialize` left every floor
suite green (21/21), and only the new order assertion went red. Breaking the
queue's shift was caught by two floor suites. The draft's restart guarantee
was pinned by nothing until this file.
