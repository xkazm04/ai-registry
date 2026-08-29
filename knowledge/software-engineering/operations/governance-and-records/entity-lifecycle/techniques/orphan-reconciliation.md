---
layer: technique
type: technique
subject: entity-lifecycle
technique: orphan-reconciliation
status: forged
laws: [creation-names-reaper, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a dependent store the schema cannot cascade into, a reaper failed after the entity row was already gone, deciding which direction an orphan sweep walks, resuming a half-finished delete]
---

# Orphan reconciliation

Cascade-design ends where the store's declarations end: dependents in a
second database, a vector index, a blob store, a search index, an external
registration get an application-level reaper. This technique owns what
happens when a reaper **fails** — and it will, because a multi-store delete
is a distributed operation wearing a single door's clothing. The parent row
is removed transactionally; the reapers run best-effort afterward; and the
moment one of them fails, the system holds data whose owner no longer
exists, addressable by an identifier that nothing live remembers. Without
the structures below, that data is not merely leaked — it is
*unreachable*: the one handle that could target it again survived only in
a log line.

## One registry, three derivations

The set of reapers is a **first-class registry** — one enumerable
structure, one entry per dependent store, each entry a stable name plus
its delete operation. Three consumers derive from it and none maintains a
second list ([gate-sees-target](../../../../_laws.md#gate-sees-target)): the
**cascade** iterates it, the **receipt** reports per-entry outcomes by its
names, and the **sweep** builds its work list from it. The test of the
shape is the next dependent store: adding it must be one registry entry,
after which it is cascaded, accounted, and swept automatically. A sweep
with its own hand-maintained table list covers the stores someone
remembered on the day it was written — which is the population minus
exactly the entries added since.

## The ledger: record the orphan while its name still exists

When a reaper fails, the delete door writes a **durable orphan record** —
the parent's identifier, its contemporaneous display name, and precisely
which reapers are still owed — *before* returning. The timing is the whole
point: the parent's identity is in scope at the door and nowhere
afterward; a failure reported only in a log message converts a recoverable
half-delete into a permanent leak. The ledger itself must be a survivor by
construction — stored outside every cascade it describes, under a scope no
entity's deletion can reach — and written with concurrency-safe updates,
because two failing deletes at once is exactly the load pattern a store
outage produces. Re-recording the same parent merges rather than
duplicates: the pending set shrinks to what is still dirty, the attempt
count grows, and an empty pending set resolves the record. A resolved
ledger is how the sweep knows it is done.

Reaper failures are **loud at the door, not quiet in the reaper**. A
fire-and-forget reaper that logs its own failure at trace level and
returns has swallowed the one signal the ledger needed
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
the outcome of every reaper flows back to the door that must account for
it.

## The sweep: derived, report-first, and pointed the right way

The reconciliation sweep re-runs owed reapers and hunts orphans nobody
recorded. Its disciplines:

- **Report mode before apply mode.** The default invocation enumerates
  what it *would* delete and removes nothing; destruction is an explicit
  flag. Nothing is ever removed by looking.
- **Existence-checked.** Before touching a candidate's data, the sweep
  re-resolves the parent. A parent that exists means nothing is orphaned —
  the record is dropped, no delete runs — so a recreated or mistyped
  identifier can never destroy a live entity.
- **Idempotent.** Every reaper tolerates an already-gone target; a second
  run finds nothing left. This is what lets the sweep piggyback on the
  next delete: finishing the previous half-delete before starting a new
  one costs one ledger read in the common empty case and makes transient
  outages self-healing without a scheduler.
- **Direction.** A sweep that starts from the authoritative side —
  enumerate live parents, clean their known dependents — **cannot find an
  orphan**, because an orphan is by definition absent from the side being
  enumerated. At least one reconciliation pass must walk the *dependent*
  store and ask, per item, whether its parent still exists. Fleet
  measurement has shown a store 100% orphaned while every sweep in the
  system ran parent-first and reported clean.
- **An entry point for pre-ledger orphans.** Orphans that predate the
  ledger (or whose record was lost) need a door that accepts a
  parent identifier, assumes every reaper is owed, and existence-checks it
  like any other candidate.

## When not to build it

One store, all dependents reachable by declared cascade: the schema is the
reconciler and this technique is scaffolding. It starts paying at the
second store the schema cannot reach — and by the third, the registry,
ledger, and dependent-side sweep are the difference between "the delete is
eventually complete" being a property and being a hope.
