---
layer: application
type: application
subject: data-retention
technique: time-budgeted-batch-purge
stack: sql
status: forged
verified_on: 2026-08-20
---

# SQL: a paging delete that yields at batch boundaries

The purge in `src/lib/db/retention.ts` deletes against a distributed SQL
engine that uses optimistic concurrency control rather than row locks, so
large `deleteMany`s hit serialization conflicts. That constraint pushes the
implementation toward exactly the shape this technique prescribes.

## The paging-delete skeleton

`deleteInPages(selectIds, deleteByIds, batchSize, budgetExceeded)` at
`src/lib/db/retention.ts:150-166` is the single loop both prune paths share:

1. `if (budgetExceeded?.()) break;` — the budget check happens **between
   batches only**, so interruption always lands on a committed transaction.
2. `selectIds()` — a *paged* selection, `take: batchSize`.
3. `deleteByIds(ids)` — the caller's closure, which wraps its own retry and
   accumulates counters.
4. `if (deleted === 0 || ids.length < batchSize) break;` — the short-page
   stop plus the **non-progress guard** that prevents an infinite loop when
   a delete removes nothing.

Retries route through the shared `withRetry` / `isSerializationConflictError`
from `db/client`, which recognizes the engine's native conflict codes, the
`40P01` deadlock SQLSTATE, and the ORM's own conflict code, and backs off
with full jitter. The header comment at `retention.ts:16-22` records why the
shared helper is used: the module's own local copy of that predicate missed
the engine-native codes, so conflicting batches re-collided in lockstep.

## Paging the *selection*, not just the delete

`pruneRepoScans` (`retention.ts:167-215`) selects with
`orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: max, take: batchSize`
and re-applies `skip: max` on every page — always keeping the newest `max`,
with the previous page now deleted so the skip window advances. The comment
at `retention.ts:196-205` names the bug this replaced: an unbounded
`findMany({ skip: max })` pulled every stale id into memory before the
batched delete loop, which on a long-watched repository could hit a
statement timeout and abort the whole prune — "so the table the job exists
to bound keeps growing." This is the technique's page-the-selection rule,
learned from the failure.

The same comment carries the ranking rule: rank by the database-authoritative
`createdAt` (insertion order), **not** the report-supplied `scannedAt`,
because a backdated or clock-skewed `scannedAt` could rank a live newer scan
into the stale window and delete it.

## Deletion order and transaction boundary

The declared relation mode emits no foreign-key cascades, so the delete graph
is explicit and ordered grandchildren → children → parent inside one
`$transaction` per batch (`retention.ts:186-205`): recommendation events,
then scan dimensions and recommendations, then the scans themselves. One
transaction per batch means a mid-batch timeout cannot leave a half-deleted
graph, while the batch boundary keeps the transaction small enough for the
engine's concurrency model.

`pruneAudit` (`retention.ts:218-243`) is the age-based counterpart, ordered
`at: "asc"` so the oldest rows leave first — a purge that runs out of budget
has then deleted the rows furthest past the horizon.

## Budget derivation and the pinned coupling

`PURGE_MAX_DURATION_S = 300` (`retention.ts:50`) is the single source, and
`RETENTION_DEFAULT_TIME_BUDGET_MS = PURGE_MAX_DURATION_S * 1000 -
RETENTION_BUDGET_HEADROOM_MS` (50s of headroom) derives the soft budget. The
route cannot import the constant — its `maxDuration` segment config must be
a statically analyzable literal — so `src/app/api/cron/purge/route.ts:15-21`
carries a `COUPLED CONSTANT` comment and `route.test.ts` pins
`route.maxDuration === PURGE_MAX_DURATION_S`. That test is the technique's
"single-source it and pin the relationship" rule made executable; the
comment also records the plan caveat that the declared maximum is a request
the platform honors only up to the deployment tier's real cap.

`overBudget()` (`retention.ts:386`) is threaded into the per-org loop, the
inner repo/scan/audit page loops, *and* the trailing orphan-audit and quota
sweeps — the technique's rule that a single oversized tenant must yield too,
not only the gaps between tenants.

## Fairness and honest accounting

`rotateForTick(orgs, Math.floor(startedAt / DAY_MS))` (`retention.ts:361`)
replaced a Fisher-Yates random shuffle. The comment states the reasoning the
technique adopts verbatim: a stateless random shuffle gives only
probabilistic fairness, so a large org that cannot drain within one tick has
an independent chance of landing in the unreached tail every run and can be
starved indefinitely; a deterministic round-robin rotation advances the
starting point by one org per day and bounds every org's wait.

Two accounting details complete it. The per-org counters are declared
**outside** the `try` (`retention.ts:441-446`) so that a throw in a later
batch does not discard already-committed deletions — the prior code lost
them and under-reported what was actually deleted. And `configuredRemaining`
counts only orgs that actually have a policy to enforce, so the
`orgsRemaining` resume tail reported to the operator is not inflated by orgs
the next tick would skip instantly — the count carries its real predicate.
