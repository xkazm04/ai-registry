---
layer: application
type: application
subject: agent-memory
technique: lane-reconciliation
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# A filesystem record with a derived vector lane, and a stated invariant that orders every destructive write (OpenViking)

The realization is an agent context database whose **record is a filesystem** —
every memory, resource, skill and session is a file under a `viking://` URI — and
whose only retrieval lane is a vector index that stores URIs, vectors and scalar
filters and **never file content** (`docs/en/concepts/05-storage.md:21-34`,
`docs/en/concepts/01-architecture.md:145-152`). Each vector record's id is a hash of
`account_id:uri` (`docs/en/concepts/04-viking-uri.md:63`), so identity is derived from
the record's address and a move re-keys the lane rather than duplicating it.

## What the tree confirms

The technique's opening premise — no shared transaction across the record and its
lanes — is stated by the tree in its own words: the "transaction" chapter is
explicit that there are no undo, journal or commit semantics, only path locks and a
persistent queue (`docs/en/concepts/09-transaction.md:7-17, :358-364`). What the tree
adds is the amendment this run landed: **the invariant chooses the write order per
operation.** The invariant is written once — "better to miss a search result than to
return a bad one" (`09-transaction.md:82-105`) — and the orders follow from it:

- `rm`: delete the index records first, then the file, so a crash leaves the file
  present and the lane missing, which a retry completes (`09-transaction.md:86`).
- `mv`: copy the file, re-key every index record to the new URI, then delete the
  source, so no instant has a lane entry pointing at an absent path
  (`09-transaction.md:107-128`).
- write: file first, then lane — the technique's usual order, kept for creates.

The structural fact is that the tree could not have been built to prove the
technique's *reconciler* and instead proves its *ordering rule*: the lane is the
consumer's door (search returns URIs the caller then reads), so a served-but-missing
URI is indistinguishable from an engine fault, and the tree chose the order that
makes that state unreachable rather than detectable.

## What the tree admits

The same chapter records the half-state the ordering does not cover: lock
acquisition can leave an empty directory behind (`09-transaction.md:355`), and
the deprecated `lock_timeout` and `redo_recovery_enabled` keys are "deprecated and
ignored" with the runtime wait fixed at zero (`09-transaction.md:389`) — a
zero-wait lock means contention surfaces as failure-and-requeue, not as delay.

## What this realization cannot do

It has no reconciler. The technique's second half — a scan that compares the
record against the lane under an age floor and reports divergence with its
predicate — is absent; the tree relies on ordering to prevent one direction of
divergence and on a `reindex` command to repair the other, and the migration
guide says migration "does not automatically call `reindex`"
(`docs/en/migration/01-user-peer-model.md:158`). A reader copying the ordering
rule should not read it as a substitute for the scan.
