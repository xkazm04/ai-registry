---
layer: application
type: application
subject: content-drift-and-revision
technique: batch-lease-on-a-non-reentrant-resource
stack: node
status: forged
---

# The drain lease over a non-reentrant UE editor (PoF)

PoF's test-gate drain boots an Unreal editor to resolve deferred L3/L4 gates. The editor is a
single shared instance, so `POST /api/pipeline-artifacts/drain` guards it with a lease held in
`src/lib/test-gate-runner/drain-lease.ts`. The route header states the failure being defended
against: *"The drain talks to a shared, non-reentrant UE editor — overlapping requests would
clobber each other and produce garbage verdicts."*

## All-or-nothing, acquired before any work

```ts
const keys = leaseKeysForFilter(filter);
const acquired = acquireLeases(keys);
if (!acquired.ok) {
  return apiError(`drain already in flight for ${scopeFromKey(acquired.conflict)} — refusing
    to overlap (UE editor is non-reentrant)`, 409);
}
try { … await drainAll(executors, filter, …) } finally { releaseLeases(keys); }
```

A catalog-level batch (`entityIds` + `catalogId`) is *"ONE collection + ONE availability probe
+ ONE grouped boot"* for the whole set, and the lease is explicitly all-or-nothing: it acquires
the per-entity key for every requested entity up front and, if **any** is held, refuses the
whole batch with 409. The refusal names the scope that holds it, not just "busy" — the same
string `scopeFromKey` renders for the status route.

## Conflict is containment, not key equality

`conflictingHeldKey` (`drain-lease.ts:~52`) is the part most implementations get wrong. Keys
are `catalog|entity` with `*` for an unscoped side, and:

- a catalog-wide lease `c|*` conflicts with **any** held lease in catalog `c`, and an
  entity-scoped `c|e1` conflicts with a held `c|*` — *"because the wide drain sweeps the member
  entity's rows and boots the SAME non-reentrant editor — so `c|*` and `c|e1` must be mutually
  exclusive even though the keys differ";*
- the global key `*|*` is exclusive with everything, and acquiring it requires an empty
  registry;
- scoped-versus-scoped across different entities stays concurrent — disjoint rows, no overlap.

## One key derivation, every contender

`leaseKeysForFilter` is *"the SINGLE source both the POST route AND the always-on worker use to
key their lease, so they contend on the same registry"* — deliberately kept in the lease module
rather than the route so `worker.runDrainTick` can reuse it without importing an app route.

The rule extends to a path that drives nothing: `POST /api/pipeline-artifacts/drain/settle-test`
runs no editor and no executor — it maps a caller-supplied UE automation payload onto deferred
gates — but it *writes back* through the same `applyVerdict`, so it takes the same lease and
409s when a drain holds it, *"so a settle can never clobber a drain that is mid-flight against
those rows."* A no-match settle reports success and says it changed nothing, rather than
implying a flip.

## The lease is readable

`getLeaseState()` returns `{ held, scope, since, scopes }` — the oldest holder as the
representative, plus every held scope — and `GET /api/pipeline-artifacts/drain/status` serves
it to the lab's runner chip. The module header gives the reason: *"A held lease used to be
invisible until a concurrent drain failed post-hoc; exposing this registry through a GET status
route lets the lab surface a 'runner busy' chip so concurrent sessions SEE the lease instead of
discovering it via a surprise 409."*

## Per-item failures do not end the batch

`src/lib/catalog/batch.ts` `runBatch` dispatches one entity at a time and records each result;
*"a failure (returned or thrown) does not abort the rest."* `batchDrainModel.ts` rolls the
single aggregate `DrainSummary` into `entitiesRun` / `entitiesLocked` / `entitiesErrored` plus
per-gate `BatchGateNote`s carrying the runner's own reason — *"no silent fails, and no silent
deferrals either"* — and models a still-held lease after a retry as `{ kind: 'locked' }` for
the **whole** set.

## Deviation from the standard, not lowered

The registry is an in-process `Map` with an acquisition timestamp and no expiry or heartbeat,
released in a `finally`. That is sufficient for a single-process local operator tool, but it
does not satisfy the technique's rule that a lease carry both an expiry and a heartbeat: a
process killed mid-drain loses the registry entirely rather than expiring a lease, and a
multi-process deployment would need the registry moved out of memory. The standard stands; this
realization meets the containment, all-or-nothing, single-derivation and observability rules,
and not the liveness ones.
