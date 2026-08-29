---
layer: application
type: application
subject: sync-replication
technique: tombstone-propagation
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.96
applied: experiment
ab_verdict: better
---

# Tombstone propagation — a complete consumer with zero producers, counted

*Verified against the project tree at `bf2a1e249`.*

The [tombstone-propagation](../techniques/tombstone-propagation.md) technique
names an audit question and predicts what it catches: **name the line that
writes the tombstone.** The recurring field defect it describes is a fully
built consumer side with no producer — everything compiles, the propagation
logic is even correct, and no delete has ever propagated. This is that case,
measured rather than asserted.

## The seam

The consumer side of this desktop app's cloud sync is complete and, on its own
terms, well built:

- the table and its index —
  `src-tauri/db/src/migrations/incremental/e06_teams_and_sync.rs:239`;
- the reader — `src-tauri/src/cloud/sync/rows.rs:907`,
  `SELECT persona_id FROM persona_tombstones …`;
- the cascade propagator with its own cursor and fault isolation —
  `src-tauri/src/cloud/sync/mod.rs:388-442`, which deletes every
  persona-scoped table in the cloud, then the persona row, and refuses to
  advance its cursor unless every delete in the batch succeeded, because
  deletes are idempotent and a retry is free.

The producer seam is `src-tauri/db/src/repos/core/personas.rs:1803-1824`:

```rust
let tx = conn.unchecked_transaction()?;
tx.execute("DELETE FROM persona_events WHERE source_id = ?1", params![id])?;
let rows = tx.execute("DELETE FROM personas WHERE id = ?1", params![id])?;
tx.commit()?;
```

An open transaction, a hard delete, a commit. The line the technique asks for
would go between the second and third statements. It is not there.

## A and B

**A** — the tree as it stands: a delete reaches the replica only if its path
writes a row the tombstone reader can see.
**B** — the technique's rule: the delete path writes the tombstone in the same
transaction as the delete, for every stream whose deletes carry user intent.

Code mode was not reachable. The gate that could see a Rust behaviour change
here is the workspace's own test build — a 431k-LOC crate that the manifest's
own comment prices at an 8.9 GB peak on test builds — and a fresh worktree
carries no target directory, so the cheapest observation costs more than the
finding. The change is also not a few readable lines: it is one producer plus
a policy decision replayed across every delete site on eleven streams.

So the A/B was run as a harness over the tree instead
(`tombstone-audit.py`): resolve the eleven synced streams
(`SYNC_TABLES`, `mod.rs:58`) to their local tables through the `fetch_*`
helpers in `rows.rs`, find every `DELETE FROM` against those tables in
`src-tauri/{src,db,engine}` outside tests and migrations, and ask of each
whether its enclosing function writes a tombstone.

## What it said

```
delete sites on synced streams : 27
  user-intent deletes          : 19
  local retention evictions    : 8  (must NOT propagate)
distinct streams they touch    : 9 of 11
tombstone producers in tree    : 1  ['src-tauri/src/companion/brain/semantic.rs:475']

POLICY A (today)      intent deletes that reach the replica: 0 / 19
POLICY B (technique)  intent deletes that reach the replica: 19 / 19
```

Nineteen user-intent delete paths across nine of the eleven synced streams —
`personas::delete`, `memories::batch_delete` / `delete_all` / `merge`,
`reports::delete`, `executions::delete`, `healing::delete`,
`events::delete_subscription`, `manual_reviews::delete_for_execution`,
`knowledge::dismiss_annotation`, the trigger unlink paths — and not one of
them reaches the replica. Verdict: **better**, and by the widest margin any of
this run's picks produced: the technique's claim is not that A is suboptimal,
it is that A transfers nothing, and the count is zero.

## The structural fact

The harness found exactly one tombstone producer in the entire Rust tree, and
it is not for this feature. `src-tauri/src/companion/brain/semantic.rs:475`
writes `companion_fact_tombstone` — inside the same transaction as the five
deletes it accompanies, with the identity read *before* the rows go away, an
upsert so a re-forget is idempotent, and the value excerpt kept deliberately
as audit trail rather than as matching material. That is the technique's rule
implemented correctly, by the same codebase, in a module whose data is not
synced at all and where a tombstone buys only local correctness.

Nobody designed that contrast. It refutes the comfortable explanation for a
missing producer — that the team did not know the pattern. They knew it well
enough to apply it where it was merely useful, and left it unwritten on the
one path where its absence means every delete a user performs on their second
device stays deleted only on the first. The technique's own diagnosis of why
("the trap is worst across module boundaries… the propagator's author must
verify the producer exists rather than inferring it from the schema") is
visible in the layering: the propagator lives in `cloud/sync`, the delete
lives in `db/repos/core`, and the table between them is real, indexed, and
empty.

## The boundary the count exposed

Eight of the 27 delete sites are local retention evictions —
`events::cleanup`, `events::enforce_count_cap`, `reports::cleanup_old_reports`,
`executions::cleanup_old_executions`, `prune_storage`, the orphan sweeps. The
technique's rule as written ("a delete is a write", uniform per stream) would
tombstone those too, and that would be wrong here: the replica is the
long-term copy, and propagating a local storage cap as a user delete would
have the smaller device dictate the cloud's retention. The distinction the
tree needs is not *which stream* but *which intent*, and neither the technique
nor `SYNC_TABLES` has a column for it. That is the amendment this measurement
argues for: uniformity is per stream *and per delete kind*, and a stream that
carries both kinds needs the eviction path to be structurally distinct from
the delete path rather than distinguished by a function name.

## What this realization cannot do or prove

- It is a static count, not a behavioural one. The harness proves no code path
  writes the row the reader reads; it does not prove a resurrection was ever
  observed by a user, and it cannot — this tree's second-device topology
  (`cursor.rs:110` mints a per-device id, `mod.rs:315` heartbeats it) is
  provided for but nothing here exercised it.
- Policy B was never executed. Nothing was compiled, no test ran, and the
  "19/19" column is what the rule *entails*, not what a gate observed. It is a
  count of sites that would change, not a measurement of a system that changed.
- The intent/eviction split is drawn by function name (`cleanup|prune|_old_|
  _cap|orphan`). That heuristic is defensible on this tree because those
  functions are honestly named, and it is exactly the kind of convention the
  rest of this corpus refuses to trust. A tree that named its sweeps
  differently would be misclassified and the harness would not know.
- It says nothing about retention. The technique requires every tombstone to
  name its reaper before the table is large; this tree's tombstone table has
  no reaping rule at all, which is invisible while the producer count is zero
  and becomes urgent on the day it is not.
