---
subject: data-access
domain: software-engineering
last_touched: 2026-08-29
dry_streak: 0
---

# data-access

First touch: [[2026-08-22-2]], external reconcile against `prisma/prisma`
@ `dd6c12b` (8.0.0-rc.4). Gained `node--transactions-and-units-of-work` —
second stack; single-stack debt cleared. Note: the batching hint was stale —
v8's restructured monorepo has no client-side dataloader.

## Open leads (banked, convergence rule applies)

- **Boundary-failure classification**: a failed commit/rollback leaves the
  connection indeterminate; evict-vs-pool is part of the boundary contract, and
  the boundary's own failure must never mask the causing error.
- Session-scoped connection state (roles, set_config) is boundary state:
  reset-or-evict on release.
- "One boundary implementation, or two that agree" — the convenience second
  wrapper is the realistic failure mode.
- Ambient-state discrimination by method presence conflates "already inside a
  transaction" with "cannot transact". SECOND SIGHTING of lifecycle-vs-health
  (with Litestream's `replicating`, same wave).
- Streaming results extend the boundary hazard past commit; mid-stream refusal
  needed, prepared-statement bridges need their own guard.

## Cross-subject proposals (for owning subjects)

- Release-vs-destroy discipline + "prove the connection round-trips before
  pooling" → connection-pooling.
- Cache writes gated on execution scope (read-inside-transaction must not
  populate a shared cache) → the caching subject.

## Applied to the technique layer

- 2026-08-22-3: **shape is not transactional state** applied to `transactions-and-units-of-work` ([[2026-08-22-3]]).
- 2026-08-23-1: **once, or twice in agreement** (one-mechanism family) applied to `transactions-and-units-of-work` ([[2026-08-23-1]]).

## 2026-08-29 — /deepen architecture batch (dry_streak 0)

7→8 techniques (read-models-and-projections, stage: team), 4→9 applications (rust
layering-rules + rust transactions from personas; node batching kp+ascent; node
read-models ascent+pof; Tree B on node transactions). Refuted: single-origin N+1 (three
origins); rollback-per-test disqualification (savepoint redirection). Landed: retryable-
closure unit of work with idempotency key outside the loop; typed-client qualification
(closes 2 of 3 rot modes); mandatory-predicates-belong-to-the-layer (answers the
entity-lifecycle inbound reference); default isolation in cross-driver parity.
Survived: bound-parameters-never-optional, single-statement atomicity,
one-suite-run-twice, mock-the-layer-not-the-engine (strengthened by the ascent negative
specimen). Banked: statement-counter hook (return: any fleet project counts queries in
tests); outbox ownership (return: kp dev_outbox grows). Forecast: applications-only
next pass.

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.
