---
layer: application
type: application
subject: silver-medalist-rediscovery
technique: read-time-relevance-refilter
stack: node
verified_on: 2026-10-31
verified_against: node@24
---

# The standing feed's read-time filter and its bounded sweep (Node)

Silver-medalist alerts are persisted by `recordRediscoveryAlerts`
(`app/_lib/rediscovery-alert-store.ts`) when a role is published or a pool-change
sweep runs, and read later from the feed. The row therefore outlives its own
truth, and the repo treats it accordingly.

## Relevance is a read-time filter, not a stored flag

`filterRelevantAlerts` (`app/_lib/rediscovery-relevance.ts:13-19`) takes the
stored alerts plus two live-state probes and drops anything that no longer
holds:

```ts
alerts.filter((a) => isPublished(a.jobId) && !isActiveInJob(a.jobId, a.candidateId))
```

State is injected so the contract is pure and unit-testable (`:11-12`, tests in
`app/_lib/rediscover.test.ts:37-72`, `:131`). Note the deliberate narrowing in the header:
the active check is "per the alert's own `jobId`, so being active elsewhere
doesn't suppress it" — a person in process for a different role is still a
rediscovery target for this one.

The route wires it at the read boundary, not the send boundary
(`app/api/rediscovery/alerts/route.ts:25-42`): `relevantAlerts()` reads the live
job statuses and pipeline outcomes on every `GET`, and the comment states the
invariant — "an alert for a role since unpublished, or a candidate since
pipelined into it, is no longer a silver medalist even though its row persists."
The alert store's own `listRediscoveryAlerts` header (`rediscovery-alert-store.ts:313-316`)
defers to it explicitly rather than duplicating the check, which is the
standard's one-predicate rule.

Note that both reads are workspace-scoped (`route.ts:31-35`): an unscoped
`candidateOutcomes`/`listRediscoveryAlerts` would read the default tenant's
alerts and pipeline history regardless of who is signed in — the standard's
"the lookup is scoped to the population that was ranked", enforced at the feed.

## The sweep is bounded three ways, and its truncation is loud

`sweepRediscoveryAlerts` (`app/_lib/rediscover.ts:459-496`) is bounded by a
roles-per-sweep ceiling (`SWEEP_MAX_ROLES = 25`), a worker-pool concurrency cap
(`SWEEP_CONCURRENCY = 3`, via `runWithPool` at `:359-372`) and a per-role
wall-clock timeout (`SWEEP_JOB_TIMEOUT_MS = 60_000`, applied by
`raiseForJobBounded` at `:382-406`). The incident that produced them is recorded
at `:335-342`: the sweep "used to fan out one recruiter_cli subprocess per
published role, sequentially, with NO cap, NO per-subprocess timeout, and NO
ceiling — the code only ASSUMED 'the free plan caps active roles'."

The standard's real interest is the next lines (`:474-478`). Truncation is
warned with both the bound and the deferred count —

```
[rediscovery] sweep truncated: N published roles exceed the 25-role/sweep
ceiling — processing 25, deferring M to the next Refresh.
```

— and `truncated` is *returned* in the result alongside `jobsSwept` and
`newAlerts`, so the caller can state coverage rather than infer it. The comment
at `:341-342` names the discipline: "with a loud log when it truncates — never a
silent cap."

The same reporting appears one level down at the result cap: `rediscoverForJob`
slices to `REDISCOVER_LIMIT = 20` and returns `more` — documented at `:29-30` as
existing so "the cap never reads as 'this is everyone'."

A hung role degrades to zero rather than stalling the sweep: the timeout aborts
the combined signal, the ranking rejects, and `raiseRediscoveryAlertsForJob`
swallows it (`:152-176`, `:245-247`).

## Re-checked 2026-10-31

Re-checked 2026-10-31 at kp@6edf5d7. The sweep bounds, the 25/3/60 000 constants,
`REDISCOVER_LIMIT`/`more`, and `filterRelevantAlerts` itself hold as described (anchors
above updated). What changed:

- **The read boundary moved and widened.** The route no longer composes the filter; `GET`
  and `POST` call one read, `liveRediscoveryAlerts` (`app/_lib/rediscover.ts:320-331`),
  and the quoted route comment is gone. That read applies relevance against live state
  (workspace-scoped) *and then* the same eligibility predicate the rank and the write ask,
  `withheldCandidateIds` (`app/_lib/rediscovery-alert-store.ts:492`, re-exported from
  `rediscovery-eligibility.ts`) — workspace-global and fail-closed, so an erased, opted-out
  or consent-lapsed person leaves the feed and its `count` at read time. The same-role
  check also widened from "active in the role" to "has *any* entry in it", because testing
  `active` let an add-then-reject resurface the alert (`:308-311`).
- **The truncation warning grew a resume point.** Sweeps now rotate through the catalog
  (`sweepCursor`, `:431-447`), so the log reads "processing N starting at index S,
  deferring M to the next Refresh (which resumes from there)", and the result carries
  `failedJobs` alongside `truncated`.
- **A hung role no longer degrades silently to zero.** `raiseRediscoveryAlertsForJob`
  (`:260-306`) returns `{ raised: 0, failed: true }` and logs it; the sweep counts and
  warns "the feed below is incomplete". Sweeps also *reconcile* rather than insert-only
  (`reconcileRediscoveryAlerts`), retracting rows for people ranked and no longer
  qualifying or since withheld.

**This reverses the first gap below and narrows the second.** Consent, anonymisation and
erasure are now enforced in the feed's read, not only at reach-out. An un-acted-on alert
is now discarded past a horizon (`ALERT_STALE_RETENTION_DAYS = 90`,
`rediscovery-alert-store.ts:283`, pruned from the process clock in
`instrumentation-node.ts:607-608`); what remains of that gap is that the horizon is a
quarter-long retention prune rather than a recompute rule, and its age is not shown to the
reader. The third gap holds: the stored `score` is refreshed only when a sweep re-ranks
the role, never at read.

## Where the repo is short of the standard

- The read-time filter checks **only role publication and same-role activity**.
  Consent, anonymisation and erasure are enforced at the outreach gate
  (`candidateOutreachSuppression`) rather than in the feed's relevance pass, so
  an alert for a since-anonymised person can be *rendered* and is only stopped
  at reach-out — the standard requires it to disappear from the list.
- There is **no staleness horizon**. An un-dismissed alert is refiltered and
  shown indefinitely; the standard requires recomputation or discard past a
  horizon, and requires the computation time to be visible to the reader (the
  row carries `createdAt`, but the ageing rule is absent).
- Fit is **not re-checked at read time** against an edited role brief; the
  stored `score` is shown as computed at sweep time.
