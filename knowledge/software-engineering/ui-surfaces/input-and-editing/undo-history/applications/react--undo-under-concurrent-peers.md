---
layer: application
type: application
subject: undo-history
technique: undo-under-concurrent-peers
stack: react
status: forged
verified_on: 2026-11-06
counterpart: external
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Excalidraw at `701b901a`: undo written for peers, and whose idea it was

An MIT canvas editor, read at a pinned commit and never run. The React version is the witness
at `excalidraw-app/package.json:36 "19.0.0"`; the history code itself does not depend on it.

## The mechanism in the tree

- **Baseline that never forgets.** `packages/element/src/store.ts:974 "never delete, in case nextElements would be just a subset"`.
- **The tag.** Captured, never and eventually: `packages/element/src/store.ts:49-55 "Never undoable."`, `packages/element/src/store.ts:57-68 "Eventually undoable."`. A remote write moves the baseline and mints nothing.
- **Redo is reset only by a local element change.** `packages/excalidraw/history.ts:134-138 "only reset on non empty elements changes!"`.
- **New version, always.** `packages/excalidraw/history.ts:35-39 "approaching each undo / redo as a new user action"`.
- **Rewrite on running.** `packages/excalidraw/history.ts:217 "HistoryDelta.applyLatestChanges("`, with its one exception, a list-valued reference, at `packages/element/src/delta.ts:1342 "do not update following props"`.
- **Skip the invisible, and err toward visible.** `packages/excalidraw/history.ts:198 "iterate through the history entries in case they result in no visible changes"`, `packages/element/src/delta.ts:1445-1447 "in the worst case, it could lead into iterating through the whole stack with no possibility to redo"`.
- **An entry that throws.** Pop first, push in a `finally`: `packages/excalidraw/history.ts:235-236 "finally {"`. The test walks it in both directions: `packages/excalidraw/tests/history.test.tsx:147 "should not collapse when applying corrupted history entry"`.

The two limits the technique states are tested here as behaviour:
`packages/excalidraw/tests/history.test.tsx:2372 "should override remotely added groups on undo, but restore them on redo"` and
`excalidraw-app/tests/collab.test.tsx:205 "with explicit undo (as addition) we expect our item to be restored from the snapshot!"`.

## This tree is not an independent voice on the rewrite

The test that pins the rewrite links the account it follows:
`packages/excalidraw/tests/history.test.tsx:2204 "how-figmas-multiplayer-technology-works/#implementing-undo"`. So that design tool's 2019 account
(an undo modifies redo history at the time of the undo, and a redo modifies undo history likewise) and this tree are one lineage. They count once.

The independent voice is older and reached the rule by another route. A positional text editor's 2015 account says a single shared
history is out, that rolling back to a previous state does not work, and that its history accumulates inverted steps and compacts by mapping
them forward, because the position maps otherwise pile up without bound (<https://marijnhaverbeke.nl/blog/collaborative-editing.html>).
A third library separates by transaction origin and does not say what happens to remote changes on the page read
(<https://docs.yjs.dev/api/undo-manager>), so it is recorded as partial and given no credit.

## What this tree cannot show

The multiplayer history tests run one client, with the remote write simulated through the tag, and the file says so:
`excalidraw-app/tests/collab.test.tsx:67 "testing collab with (at least) two clients simultanouesly"`. The history logic is well pinned. Its
interaction with the merge is not.

## Proof, on our own code

Nothing in the clone was executed. A small model written for this landing runs three arms on one property document:
snapshot, captured-value entries and rewritten entries. The scenarios come from the tree's own tests. Predictions were
fixed before the run, and each case is one deterministic run.

| Case | Snapshot | Captured | Rewritten |
| --- | --- | --- | --- |
| Peer's write to another property survives my undo | no | yes | yes |
| Peer wrote before my undo; redo gives the peer's value | yes | no | yes |
| Peer writes after my undo; redo then undo gives the peer's value back | yes | no | yes |
| Floor: three edits, three undos, three redos return to the end state | yes | yes | yes |

Separately, under an edit-count merge, an undo at a new version survives against a peer holding the undone state, and a
rolled-back version loses. Only the rewritten arm passes all three cases, and the floor held in every arm.

The third case was chosen to falsify, since a redo there overwrites a peer's later value. The rewrite does overwrite it and
the next undo returns it, which is why the technique says the identity holds across the pair. The verdict is `unmeasurable`: the model was
written by the same reader from the same tree, and no managed project was changed. The instrument that would decide it is a test with two
real clients on a project with a live peer.
