---
layer: technique
type: technique
subject: content-drift-and-revision
technique: bounded-revision-history
status: forged
laws: [refuse-rather-than-destroy, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [an operation overwrites a generated artifact in place, choosing a retention depth for regenerable content, an accidental re-produce needs to be recoverable]
---

# Bounded revision history

Keep the last N versions of every artifact that a re-generation overwrites, where N is
small, fixed, and defended by an argument about the accident you are insuring against —
not by storage convenience and not by "history is good".

## The procedure

1. **Identify the overwrite key.** Every artifact is addressed by a compound identity —
   the collection it belongs to, the entity it describes, the step that produced it.
   Writing is an upsert on that key. That upsert is the only place a version can be lost,
   so it is the only place history is written.
2. **On upsert, snapshot before replace — but only when the content differs.** Compare the
   outgoing content against the incoming content and archive only on a real difference.
   This is the single most important refinement, because most writes to a produced artifact
   are *status* writes: a gate resolving, a verification pass re-persisting the identical
   payload with a new verdict. Archiving those buries the handful of genuine produce
   versions under dozens of identical rows and destroys the history for the one purpose it
   exists for. Snapshot-before-replace, never snapshot-after: a write that fails halfway
   must not have already lost the previous state.
3. **Trim to N, oldest first, in the same transaction as the write.** A trim that runs as
   a separate sweep will be skipped, disabled, or fall behind, and retention that varies
   with the health of a background job is not retention.
4. **Expose restore as a first-class operation**, not a database exercise. If restoring
   requires an engineer, the history exists for auditors rather than for operators, and
   it will not be used on the day it matters.
5. **Timestamp the revision with when it was written, not when it was archived.** An
   operator choosing between versions is choosing by when each was *made*. Keep the
   archival moment as a separate field; conflating them makes every revision look like it
   was created at the moment of the write that superseded it.
6. **Snapshot the artifact, not the record.** Bookkeeping — the drift fingerprint, the
   verdict, the produce log — is state about the artifact and is recomputed or re-derived
   on restore. Storing it inside the revision creates two authorities for the same
   derived value.

## The archive is also a change oracle

Because a revision is written only when content genuinely differs, the revision list is
the cheapest proof-of-change the system has: *n* revisions archived since a given moment
is proof the content moved, and how many times. This is worth designing for deliberately,
because it costs nothing beyond the discipline in step 2.

The asymmetry must be reported honestly. Zero revisions since a moment does **not** prove
the content is unchanged — it proves nothing was archived, which also covers a status
write, a re-produce that happened to yield identical content, and a first write. Such a
row says *written*, never *changed*.

And the bound creates a blind spot the consumer must be told about: once a step is at N
revisions, older ones have been pruned, so any count derived from the archive is a
**floor, not a total**. Return the cap alongside the count and flag the rows that are at
it. A churn count that silently saturates at N is a number reported without its basis.

## Choosing N

State the accident, then size for it. The realistic accidents on a regenerating line are:
a batch run against the wrong specification, a bad steer applied across a sweep, a
template edit that degrades output, and a single operator re-producing the wrong row. All
but the last are *multi-generation* accidents — they are frequently noticed only after a
second and third regeneration has been layered on top while people debug.

- **N = 1 fails.** One revision survives exactly one mistake and no investigation. The
  common pattern of "regenerate, look, regenerate again, realise the first was better"
  destroys the artifact with the second attempt.
- **N in the low tens holds.** It survives a bad sweep plus the debugging that follows,
  and it is a constant: retention per artifact does not grow with how long the project
  runs. Twenty is a defensible landing point for artifacts that are text-scale payloads
  produced a few times a week — and note the storage argument is not abstract: one
  revision holds a full produce output, which is commonly tens of times larger than
  anything a viewing surface renders from it.
- **Unbounded fails differently.** Storage grows with production volume, backups slow,
  and nobody has ever consulted the fortieth revision. The cost is paid continuously for
  a benefit that decays to zero within a handful of versions.

The argument, not the number, is the transplantable part. If your artifacts are large
binaries, N drops and you keep pointers rather than payloads; if they are small and
cheaply diffed, N can rise. What does not change is that the bound is derived from a
named accident.

## Decision rules

- **When the write is an in-place overwrite of *different* generated content, snapshot.**
  When it is a first insert, there is nothing to snapshot, and no empty revision is
  written — an empty first revision makes restore offer a version that never existed. When
  it changes only status, tier or reason, do not snapshot.
- **When the content comparison and the drift fingerprint could differ, make them agree.**
  Both answer "did the content move"; two implementations of that question is the standard
  way one authority becomes two.
- **When a restore happens, it is itself an upsert** and takes a snapshot of what it
  replaced. Restoring must be undoable, or you have moved the irreversible operation
  rather than removed it.
- **When history and the live artifact disagree about schema**, migrate the live payload
  and leave revisions in their original shape, marked with the shape they were written
  in. Migrating history rewrites the record of what was actually produced.
- **When storage pressure appears, lower N — do not disable trimming or history.** A
  smaller bound is a stated policy; an unbounded list plus a disabled sweep is an
  unstated one.
- **When an entity is deleted, do not cascade the revisions away.** They become orphans,
  which is a visible state with an owner, and deleting them is the destructive branch of
  [refuse rather than destroy](../../_laws.md#refuse-rather-than-destroy).

## Failure signatures

- Operators ask an engineer to "get back yesterday's version": restore is not a
  first-class operation.
- Revision lists of wildly differing lengths across artifacts: trimming runs outside the
  write transaction.
- The newest revision is byte-identical to the live payload: the snapshot is taken after
  the replace, and the actual previous version was never captured.
- Restores succeed but the drift fingerprint still reports the newer content: derived
  bookkeeping was snapshotted and restored rather than recomputed.
- Every step sits at exactly N revisions and they are near-identical: status writes are
  being archived, and the real produce versions were pruned out from under them.

## When not to use this

- **When the artifact already lives in a versioned store** — a repository, an
  object store with versioning — do not build a second history. Two authorities for
  "what the previous version was" is worse than one.
- **When the content is genuinely deterministic** from a versioned specification and a
  pinned toolchain, the specification's own history is the history; storing outputs
  duplicates it. This is rare on a generative line and should be proven, not assumed.
- **When the payloads are large binaries**, snapshot references and lifecycle-managed
  copies rather than inline payloads, and expect a much smaller N. Inlining large
  binaries into a revision list makes every read of the live artifact expensive.
- **When regulatory retention applies**, this technique is not the mechanism — a bound
  that discards old versions is the opposite of what an audit trail requires. Keep an
  append-only audit record separately and let it have its own, longer, policy.
