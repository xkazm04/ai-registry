---
subject: data-access
domain: software-engineering
last_touched: 2026-08-22
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
