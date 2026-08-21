---
layer: application
type: application
subject: silver-medalist-rediscovery
technique: read-time-relevance-refilter
stack: node
---

# The standing feed's read-time filter and its bounded sweep (Node)

Silver-medalist alerts are persisted by `recordRediscoveryAlerts`
(`app/_lib/rediscovery-alert-store.ts`) when a role is published or a pool-change
sweep runs, and read later from the feed. The row therefore outlives its own
truth, and the repo treats it accordingly.

## Relevance is a read-time filter, not a stored flag

`filterRelevantAlerts` (`app/_lib/rediscovery-relevance.ts:12-19`) takes the
stored alerts plus two live-state probes and drops anything that no longer
holds:

```ts
alerts.filter((a) => isPublished(a.jobId) && !isActiveInJob(a.jobId, a.candidateId))
```

State is injected so the contract is pure and unit-testable (`:10-11`, tests in
`app/_lib/rediscover.test.ts:32-80`). Note the deliberate narrowing in the header:
the active check is "per the alert's own `jobId`, so being active elsewhere
doesn't suppress it" — a person in process for a different role is still a
rediscovery target for this one.

The route wires it at the read boundary, not the send boundary
(`app/api/rediscovery/alerts/route.ts:25-42`): `relevantAlerts()` reads the live
job statuses and pipeline outcomes on every `GET`, and the comment states the
invariant — "an alert for a role since unpublished, or a candidate since
pipelined into it, is no longer a silver medalist even though its row persists."
The alert store's own `listRediscoveryAlerts` header (`rediscovery-alert-store.ts:142-146`)
defers to it explicitly rather than duplicating the check, which is the
standard's one-predicate rule.

Note that both reads are workspace-scoped (`route.ts:31-35`): an unscoped
`candidateOutcomes`/`listRediscoveryAlerts` would read the default tenant's
alerts and pipeline history regardless of who is signed in — the standard's
"the lookup is scoped to the population that was ranked", enforced at the feed.

## The sweep is bounded three ways, and its truncation is loud

`sweepRediscoveryAlerts` (`app/_lib/rediscover.ts:281-302`) is bounded by a
roles-per-sweep ceiling (`SWEEP_MAX_ROLES = 25`), a worker-pool concurrency cap
(`SWEEP_CONCURRENCY = 3`, via `runWithPool` at `:204-217`) and a per-role
wall-clock timeout (`SWEEP_JOB_TIMEOUT_MS = 60_000`, applied by
`raiseForJobBounded` at `:225-250`). The incident that produced them is recorded
at `:233-241`: the sweep "used to fan out one recruiter_cli subprocess per
published role, sequentially, with NO cap, NO per-subprocess timeout, and NO
ceiling — the code only ASSUMED 'the free plan caps active roles'."

The standard's real interest is the next three lines (`:285-291`). Truncation is
warned with both the bound and the deferred count —

```
[rediscovery] sweep truncated: N published roles exceed the 25-role/sweep
ceiling — processing 25, deferring M to the next Refresh.
```

— and `truncated` is *returned* in the result alongside `jobsSwept` and
`newAlerts`, so the caller can state coverage rather than infer it. The comment
at `:264-266` names the discipline: "with a loud log when it truncates — never a
silent cap."

The same reporting appears one level down at the result cap: `rediscoverForJob`
slices to `REDISCOVER_LIMIT = 20` and returns `more` — documented at `:27-28` as
existing so "the cap never reads as 'this is everyone'."

A hung role degrades to zero rather than stalling the sweep: the timeout aborts
the combined signal, the ranking rejects, and `raiseRediscoveryAlertsForJob`
swallows it (`:152-176`, `:245-247`).

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
