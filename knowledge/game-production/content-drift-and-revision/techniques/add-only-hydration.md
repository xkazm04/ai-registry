---
layer: technique
type: technique
subject: content-drift-and-revision
technique: add-only-hydration
status: forged
laws: [refuse-rather-than-destroy]
shared_with: []
use_when: [merging persisted state into an in-memory model, several writers update one record concurrently, produced artifacts go missing without an error]
---

# Add-only hydration

When persisted state is loaded and merged into an in-memory model, the merge may add
keys and may update keys it owns, and may **never remove** a key it did not expect to
find. A hydration that replaces wholesale silently deletes whatever a concurrent writer
added between the read and the write — and the deletion produces no error, no log line,
and no corrupt data. It produces an absence, which is indistinguishable from work that
was never done.

## Why this is a drift concern and not a database concern

On a regenerating line, the record for one entity is usually a bag keyed by step: one
artifact per step, written by whichever job produced it. Batch jobs write concurrently;
an authoring surface writes while a batch runs; a background sweep writes after both.
Every one of them hydrates the record, mutates its own slice, and persists. The
read-modify-write window is wide because generation is slow — seconds to minutes, not
milliseconds — so the collision is not a rare race, it is the normal case.

The lost artifact then re-enters the pipeline as unproduced, is regenerated at cost, and
that regeneration is itself a content change under a standing verdict. A wholesale
hydration is therefore an *upstream cause of content drift*, not merely a data-integrity
bug.

## The procedure

1. **Merge per key, never per record.** Start from the in-memory state, iterate the keys
   present in the persisted payload, and set each one. Do not construct a fresh object
   from the persisted payload and assign it over the model.
2. **Never delete on hydrate.** A key present in memory but absent from storage means
   either a concurrent local write not yet persisted, or a delete performed elsewhere.
   Hydration cannot tell these apart, so it does nothing — deletion is an explicit
   operation with its own path, which is
   [refuse rather than destroy](../../_laws.md#refuse-rather-than-destroy) at merge
   granularity.
3. **Own the sub-tree you write.** A writer persists only the keys it is the author of.
   Persisting the whole hydrated record re-writes other authors' keys from a possibly
   stale read, reintroducing the clobber on the write side after you removed it from the
   read side.
4. **Make deletion explicit and narrow**: a named operation on a named key, which
   snapshots into revision history first.
5. **Test with an interleaving, not with a round trip.** A test that saves and loads
   passes trivially. The test that has teeth writes key A, hydrates a payload containing
   only key B, and asserts both survive.

## The escape hatch: an explicit reconciliation

Add-only alone can never converge. Content deleted at the store stays in memory forever,
and the model drifts upward without bound. The escape is a **separate, operator-triggered
reconciliation** — never the load path — built on three properties:

- **Completeness makes absence informative.** The reconcile is handed the *complete* set
  of records the store holds for the entity, so a key missing from it means deleted, not
  merely unfetched. Add-only hydration cannot say this because it never sees the whole set.
- **A seen-marker separates the two absences.** Stamp each in-memory key with the moment
  the store was last observed to hold it. Then a locally-present, store-absent key
  resolves: if it was ever seen at the store, it was deleted there and can be reconciled
  away; if it never was, it is local work that never reached the store and must survive,
  flagged. Without this marker the only options are "keep every dropped key forever" and
  "destroy unsynchronised work", and teams correctly choose the first, which is the
  unbounded drift above. This marker is the piece most designs are missing.
- **Every key lands in exactly one reported bucket** — adopted, removed, kept, unchanged —
  with counts. A reconciliation that mutates an operator's work without reporting what it
  did is the wholesale clobber wearing a better name.

The ordered rules inside the reconcile: store has it and memory does not, adopt; both have
it and they are identical, nothing; both have it and memory holds work the store does not
(a recorded write failure, or a local production strictly newer than the stored one), keep
local and report it; otherwise adopt the stored version while preserving the local
bookkeeping the store does not carry.

## Decision rules

- **When hydrating, the direction is storage → memory, additively.** If a code path needs
  memory to become an exact mirror of storage, that is a *reset*, and it is a different,
  explicitly named operation that the normal load path must not perform.
- **When two writers legitimately own the same key**, add-only is not sufficient — you
  need a per-key version or timestamp and a last-writer-wins rule stated out loud.
  Add-only solves disjoint ownership, which is the common case; it does not solve genuine
  contention on one key.
- **When a key must be removed as part of a bulk operation**, do it through the explicit
  delete path once per key, so each removal is snapshotted and countable. Never by
  hydrating a smaller payload.
- **When the persisted payload fails to parse**, hydrate nothing and report the failure.
  A partial hydrate over a corrupt read merges arbitrary subsets, and a failed parse that
  yields an empty object is the wholesale clobber in its worst form.
- **When an artifact reappears after being reported missing**, stop looking for a
  generation bug: a lost-update window is the far likelier cause.

## Failure signatures

- Artifacts vanish and are regenerated with no error anywhere in the logs.
- Losses cluster on entities that a batch and an operator touched in the same minutes.
- The last writer's work always survives and everyone else's does not — a wholesale
  assignment on either the read or the write side.
- A record shrinks over time under steady production: each save is persisting a stale
  full read.

## When not to use this

- **When the store supports per-field atomic updates**, use them — a targeted field
  update at the storage layer removes the read-modify-write window entirely, and is
  strictly better than a disciplined merge on top of a wide one.
- **When the record is genuinely single-writer** — one job owns it for its whole life,
  enforced by a lease — the merge discipline is unnecessary ceremony. Prefer the lease;
  it is the stronger guarantee. Note that the lease must be real, not conventional.
- **When you need storage to be authoritative after an external repair** — a manual fix,
  a restore, a migration — add-only hydration will actively fight you by preserving stale
  in-memory keys. Use the explicit reset path, and make it loud.
