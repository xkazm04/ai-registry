---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: read-phase-before-write-transaction
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a poll cycle writes rows as it reads and a mid-cycle failure leaves half a project updated, deciding what a polled replica keeps when one read of a cycle fails, a failed read is about to be written as zero or empty]
---

# Read phase before write transaction

A replica refreshed by polling has no change stream to keep it consistent; each
cycle re-reads its slice and rewrites what it derived. Done naively, the cycle
interleaves the two — read the merge requests, write the task rows; read the
deployments, update the same rows; read the pipeline, write its status — and
the first read that fails halfway leaves the replica in a state that was never
true at the source: some rows from this cycle, some from the last, and
derived counts computed over the mixture. It is the polled form of the
half-filled replica that [atomic-swap-at-initial-sync](./atomic-swap-at-initial-sync.md)
forbids for a stream.

The rule: **per unit of consistency, all reads first, then one transaction of
writes. A read that fails writes nothing, and the unit keeps its last good
rows.**

## Procedure

1. **Choose the unit of consistency.** The unit is the largest slice whose
   rows reference one another and are read together — usually one source
   (one project, one tenant, one account), not the whole poll. A failure in
   one unit must not discard the others' fresh reads, and a unit too small
   lets derived rows disagree with their parents.
2. **Read everything the unit's writes need into memory.** Lists, details,
   the facts derived from them. Derivation runs here too, over the
   in-memory reads, so the write phase does no remote calls and cannot fail
   for a remote reason.
3. **Write the unit in one transaction.** Parent rows before the rows that
   reference them, roll-ups after the rows they count. Either the whole
   unit's new state lands, or none of it does.
4. **On a failed read, abandon the unit's writes and record the failure.**
   Nothing is written to the unit's rows; its freshness record keeps the
   last good time and takes the error (see
   [per-source-freshness-rows](./per-source-freshness-rows.md)); the unit is
   marked stale so readers see age, not absence
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
5. **Separate optional facts from required reads.** A fact the unit can be
   written without — the size of one item, the status of one pipeline — is
   read in the read phase too, but its failure becomes *unknown* on that one
   field with an issue recorded, and the unit still writes. Writing it as
   zero, *none* or *passed* converts a failed read into a confident value
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
   The line between required and optional is drawn per field, in advance,
   not by whichever read happened to fail.

## Decision rules

- **When a write needs a value only the store holds** (a counter the source
  cannot restate, an identity minted locally), read it inside the
  transaction and merge; the source's reads are still done before it opens.
- **Work that must follow the unit's rows** — a scan whose rows reference
  the unit's row — runs after the transaction commits, and its failure is
  recorded against the unit without undoing the transaction.
- **A cycle-level read that every unit depends on** (the list of units
  itself) gets the same rule one level up: if it fails, no unit is
  written, every unit polled before keeps its rows and becomes stale.
- **Importers that write their own tables during the read phase break the
  rule.** If an import must write before the unit's transaction, it either
  joins the transaction or is idempotent and keyed so a repeat after the
  unit's failure rewrites the same rows.

## When not to use

A replica fed by a compacting change stream applies each event as it comes and
relies on the atomic swap for re-reads; this technique is for the replica that
has only a poll. And a store that is the system of record, with writers of its
own, needs a conflict policy, not a read phase — that is sync-replication's
ground.
