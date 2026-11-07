---
layer: application
type: application
subject: sync-replication
technique: conflict-detection-and-policy
stack: react
status: forged
verified_on: 2026-11-06
counterpart: external
---

# Excalidraw at `701b901a`: a live room that chooses last-writer-wins across users

An MIT canvas editor, read at a pinned commit and never run. The React version is the witness at
`excalidraw-app/package.json:36 "19.0.0"`. The relay is not in this repository, so its ordering and buffering are unseen.

**This tree does what the technique's across-users sentence forbids, on purpose.** That sentence stands unchanged. A proposed
narrowing to users who are not in one live session missed the admission bar, because it rewrites the sentence, and the corpus has no
co-editing subject to hold the exception. Read this as one tree's counterexample and its forces.

## The decisions

- **Each element is a register.** Higher edit count wins, and a tie goes to the lower random nonce regenerated per write:
  `packages/excalidraw/data/reconcile.ts:35 "local.version > remote.version ||"`, `packages/excalidraw/data/reconcile.ts:36-39 "taking the one with"`, `packages/element/src/mutateElement.ts:142 "element.version = updates.version ?? element.version + 1;"`.
  Forces: the store and relay hold ciphertext and cannot arbitrate, clocks are not used for order, and a lost edit to a small object in a
  room is visible at once. Price: a concurrent move and recolour of one element lose one edit whole, and the loser is not told.
- **The merge takes local gesture state as an input.** An element being edited refuses remote writes until its gesture ends, then wins by a
  higher count: `packages/excalidraw/data/reconcile.ts:30-33 "local.id === localAppState.editingTextElement?.id"`. So two clients can disagree while a
  gesture is open, and convergence holds at rest.
- **Merge at the edge, inside the store's transaction.** `excalidraw-app/data/firebase.ts:209 "runTransaction(firestore, async (transaction) => {"`, `excalidraw-app/data/firebase.ts:222 "restoreElements(await decryptElements(prevStoredScene, roomKey), null),"`.
- **The array is a cached order, and a fractional key is what survives merge.** `packages/element/src/fractionalIndex.ts:30 "Array (or array-like ordered data structure) should be used as a cache of elements order"`.
  Repair can rewrite records nobody moved: `packages/element/src/fractionalIndex.ts:221 "it could modify the elements which were not moved"`.

## Where the tree departs from this subject's rules, as read

Nothing here was reproduced, and none is filed as a defect.

- **Resync is armed by the sender's change.** The comment says periodic, `excalidraw-app/collab/Portal.tsx:152 "periodically we'll resync the whole thing"`, and the only call
  sits inside the change gate, `excalidraw-app/collab/Collab.tsx:978 "this.queueBroadcastAllElements();"`. A receiver has no sequence number with which to notice a gap, so an idle sender's dropped
  update waits for its next edit or a joiner. Versions are marked sent before the send: `excalidraw-app/collab/Portal.tsx:173-178 "this.broadcastedElementVersions.set("`.
- **Tombstones are reaped by age on a client clock, with no horizon detection.** `excalidraw-app/data/index.ts:50 "element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT"`. A joiner by link is
  safe by construction, `excalidraw-app/collab/Collab.tsx:560 "when joining existing room, don't merge it with current scene data"`. A long-open tab that reconnects is not reset by what was read, so it could resurrect a reaped record.
- **A gate the tree itself calls unsafe is live.** `packages/element/src/index.ts:13 "@deprecated unsafe, use hashElementsVersion instead"`, used at `excalidraw-app/collab/Collab.tsx:973 "getSceneVersion(elements) >"`. No failure was constructed, so this is declared debt and not a bug.

## What its tests cannot see

The merge harness compares identifiers only, `packages/excalidraw/tests/data/reconcile.test.ts:111 ".map((x) => x.id),"`, and passes empty local state, `packages/excalidraw/tests/data/reconcile.test.ts:81 "{} as AppState,"`.
In our own transliteration of the guard, with no code from the clone run, always-keep-local, an inverted version compare and a dropped tie-break each stayed green on identifiers
wherever the two copies shared a fractional key, and went red only where keys differed. Comparing winners turned all three red on those same cases. So order witnesses the winner in part. A
transliteration is not the tree, and this stands as a reading supported by a model.
