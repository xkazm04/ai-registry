---
layer: application
type: application
subject: retry-backoff
technique: jittered-revocation-with-irrevocable-terminal
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Lease revocation in OpenBao's expiration manager (Go, source tree)

How the OpenBao server tree at commit `6b5f82e1` realizes the
jittered-revocation-with-irrevocable-terminal technique in
`internal/vault/expiration.go` and `internal/helper/fairshare/jobmanager.go`,
and where it deviates from the standard. Every line below was re-read at the
pinned commit; `go.mod` declares `go 1.27.0`.

## 1. The ladder: six attempts, base ten seconds, plus or minus half

The constants sit together at `internal/vault/expiration.go:51-55`:
`maxRevokeAttempts = 6` and `revokeRetryBase = 10 * time.Second`. The delay
function `revokeExponentialBackoff` (`expiration.go:306-313`) computes
`exp = (1 << attempt) * revokeRetryBase`, then `randomDelta = 0.5 * exp` and
draws uniformly from `[exp - randomDelta, exp + randomDelta]` — the
proportional band the technique describes, verbatim. The attempt counter is a
`uint8` (`expiration.go:93`, field `revokesAttempted` on `pendingInfo`), which
with the cap of six cannot reach the wrap the backoff-design technique warns
about, but note the shift `1 << attempt` is unclamped: the cap on attempts is
what keeps the arithmetic sane, not the arithmetic itself.

The retry is scheduled in `revocationJob.OnFailure` (`expiration.go:244-290`):
the pending entry is loaded, `revokesAttempted` is incremented, the next delay
computed, and — if the ladder has rungs left — the pending timer is reset to
it and the entry stored back. The error log line carries `attempts` and
`next_attempt` (`expiration.go:282-283`), which is the retry-observability
narrative in one line.

## 2. The terminal state: `RevokeErr` set, persisted, counted, listed

`OnFailure` transitions at `expiration.go:259-279`: when
`revokesAttempted >= maxRevokeAttempts` **or** `errIsUnrecoverable(err)`,
the lease is loaded from storage and `markLeaseIrrevocable` is called under
the pending lock. The transition function (`expiration.go:2565-2591`) writes
the error string onto the lease entry's `RevokeErr` field — truncated to
`maxIrrevocableErrorLength = 240` characters and defaulting to `"unknown"`
when empty (`expiration.go:74-78`) — then `persistEntry` writes the lease
back to storage, stores an in-memory copy in the `irrevocable` map,
increments `irrevocableLeaseCount`, and removes the lease from `pending`.
The struct comment on `RevokeErr` (`expiration.go:2778-2782`) is the
technique's stance in the tree's own words: "From there, it must be manually
removed (force revoked)." Persisting the state on the lease is what makes it
survive a leadership change; the in-memory map is a cache of it.

The three obligations land as follows. **Counted**: a gauge
`expire.num_irrevocable_leases` is emitted from the metrics loop
(`expiration.go:2406-2411`), and `getIrrevocableLeaseCounts`
(`expiration.go:2635`) groups the count by mount — the per-source predicate
the technique asks for. **Listed**: `listIrrevocableLeases`
(`expiration.go:2688-2720`) returns the set, capped at
`MaxIrrevocableLeasesToReturn = 10000` with a warning string telling the
operator to re-run with `force` (`expiration.go:82-86`); the system backend
exposes both under a `type=irrevocable` parameter
(`internal/vault/logical_system.go:272, 321`). **Manually resolvable**: force
revocation is the operator verb, and `renewable()` refuses a renewal against
an irrevocable lease with the state named in the error
(`expiration.go:2796-2797`). The transition is one-way by construction: the
lease-loading path asserts that a lease is either in `pending` or in
`irrevocable` and moves it only from the first to the second
(`expiration.go:1933-1949`).

## 3. Permanent errors short-circuit the ladder

`errIsUnrecoverable` (`expiration.go:195-206`) matches the backend's typed
sentinel errors — unrecoverable, unsupported operation, unsupported path,
invalid request — and `OnFailure` treats a match exactly like exhaustion,
with `reason = "unrecoverable error"` in the trace line. This is the
golden path's reclassification rule applied at the boundary adapter, and it
was an upward lesson for the draft: the technique's first version carried
only the attempt cap as the way into the terminal state.

## 4. Losing leadership is not an error

Two sites. `revocationJob.Execute` (`expiration.go:209-242`) checks the
manager's `quitCh` and `quitContext` *before* the remote call and returns
`nil` — not an error — when either has fired, so `OnFailure` never runs and
no attempt is charged; the log line says "not attempting further revocation",
which is the technique's cheap pre-call abort. In the restore path, the error
switch at `expiration.go:678-681` matches a wrapped `context.Canceled` with
the comment "Don't run error func because we lost leadership", downgrades it
to a warning, and clears the error. The state change that revoked leadership
is what restarts the manager on the new leader.

## 5. One queue per mount, capped by fair share

`expireLeaseStrategyFairsharing` (`expiration.go:292-302`) resolves the
lease's mount accessor and calls `jobManager.AddJob(job, mountAccessor)`, so
the queue key is the mount. In the job manager, `getNextQueue`
(`internal/helper/fairshare/jobmanager.go:205-227`) walks queues round-robin
from the last one accessed and picks the first that is not saturated;
`queueWorkersSaturated` (`jobmanager.go:235-245`) derives the per-queue cap as
`ceil(0.9 × totalWorkers / activeQueues)`. `addQueue`
(`jobmanager.go:321-337`) creates the queue on first job for a key and
deliberately preserves a worker count that survived a pruned queue, so a
mount whose queue emptied and refilled is not miscounted. The cap's
derivation belongs to the rate-limiting subject; this technique confirms only
that the cap is per source and that draining is fair.

## 6. The slow sweep over the terminal set

A goroutine started with the manager (`expiration.go:420-436`) runs a
24-hour timer and, on each tick, submits `attemptIrrevocableLeasesRevoke` as a
single job on its own queue named for the function. The sweep
(`expiration.go:998-1020`) ranges the `irrevocable` map, skips leases less
than an hour past expiry, and attempts one revocation each, continuing past
per-lease errors. The function comment — "should be run on a schedule.
something like once a day, maybe once a week" — is the tree's own statement
that this is a probe cadence, not a ladder. This was the second upward
lesson: the draft had irrevocable as terminal outright, and the tree showed
the honest qualifier, terminal for the ladder.

## Deviations from the standard

- **The attempt count is in memory only.** `revokesAttempted` lives on
  `pendingInfo` (`expiration.go:89-93`), which is rebuilt on restore, so a
  leadership change resets every in-flight ladder to rung zero. The lease's
  terminal state persists (`RevokeErr` on the stored entry) but its progress
  toward that state does not; a cluster that fails over every few minutes
  will retry an unreachable remote from the top of the ladder each time. The
  standard asks that the choice be stated; the tree makes it silently.
- **The sweep's grace is one hour past expiry, fixed.** The technique asks
  for a grace period; the tree hard-codes it (`expiration.go:1007`).

## What to copy

The `RevokeErr`-on-the-entry shape: the terminal state is a field on the
persisted record with the last error bounded to a fixed length, so listing
the terminal set needs no second table and the state survives failover. The
`errIsUnrecoverable` switch over typed sentinels as the one place permanence
is decided. The pre-call quit check returning `nil` rather than an error. The
mount-accessor as the queue key, with queue creation on first job.
