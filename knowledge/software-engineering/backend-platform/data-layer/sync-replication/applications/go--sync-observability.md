---
layer: application
type: application
subject: sync-replication
technique: sync-observability
stack: go
verified_on: 2026-08-22
---

# Sync observability in Litestream

How Litestream — streaming SQLite replication to object storage — realizes the
[sync-observability](../techniques/sync-observability.md) technique. Citations are
against `benbjohnson/litestream` (still the canonical `full_name` per the GitHub
API) at commit `63225f1` (2026-08-19), just past release `v0.5.16` (2026-08-05),
Go 1.25 — an external tree, not the consumer repo the sibling `rust--`
applications cite, so the pin lives in prose, not `verified_against`. A **stream**
here is one `DB` and its one `Replica`.

## 1. The snapshot is richer than the technique asks — on the wrong axis

`SyncDiagnostic` (`db.go:286-304`) is a 17-field JSON snapshot written by the loop
itself as it works, not derived by a second system watching it: `beginSyncDiag`
stamps `startedAt`/`walSize` and clears the previous error (`db.go:431-449`),
`setSyncDiagPhase` advances phase and `updatedAt` (`:451-462`), `finishSyncDiag`
records `err.Error()` verbatim (`:464-475`). Its phase vocabulary is closed and
fine-grained — 24 constants (`:241-264`), two operations (`:234-235`), plus
lock-queue depth (`:477-494`).

**But every field describes the current or last operation, not the stream's
health.** None is `state` from the closed vocabulary (idle / syncing / degraded /
failed / disabled), and `Active: false` with a non-empty `Error` cannot separate
"failed once an hour ago" from "failing every second for a week" — the next good
`beginSyncDiag` clears `err` (`:447`), and the verdict survives only in the loop's
local `consecutiveErrs` (`:3160`), which nothing exposes.

## 2. Cursor and tail: the pair exists exactly once, and nothing calls it

Progress is meaningful only as the **pair**: a still cursor beside a still tail is
health, the same cursor beside a moving tail is lag. Both exist — the tail is
`DB.Pos()`, max TXID of local L0 LTX files (`db.go:610-641`); the cursor is
`Replica.Pos()`, the TXID last uploaded (`replica.go:303-307`, recomputed by
`calcPos`, `:274-281`) — and `DB.SyncStatus` (`db.go:692-714`) pairs them, its
`InSync` requiring `localPos.TXID > 0` so "never replicated" cannot pass for
agreement. **That function is dead code**, called only from `db_test.go:1548-1712`,
so lag is never computed, counted, or named.
`litestream status` prints tail and no cursor (`cmd/litestream/status.go:72-79`),
its usage text admitting the gap: "To see replica TXID and sync status, inspect
daemon diagnostics or logs while the replication daemon is running" (`:161-162`).
`litestream_txid` (`db.go:3364-3367`) is the tail too (`:1330`) and no
replica-position gauge exists (`db.go:3348-3408`, `internal/internal.go:164-190`),
so the dashboard also plots only the tail
(`grafana/litestream-dashboard.json:641`). The pair surfaces once, as prose: an
`Info` line per pass carrying both TXIDs (`replica.go:200-205`).

## 3. Empty passes, failed passes, and isolation

`errReplicaWaitForData` (`replica.go:30`) is returned when the database has no LTX
position yet (`:197`); the monitor matches it and `continue`s *before* touching
`consecutiveErrs` or backoff (`:441-443`), so an empty pass and a failed pass differ
in backoff, error log, and recovery message. Sharper still, a pass stopped by the
`MaxSyncLTXFiles` batch cap still calls `RecordSuccessfulSync()` (`:210-217`):
"a sustained backlog reads as unhealthy while progressing" otherwise.

Isolation is a goroutine boundary, not a loop discipline: each `DB` runs its own
`monitor()` (`db.go:804`, `:3153-3237`) and each `Replica` its own
(`replica.go:118`, `:392-516`), so one stream's failure cannot abort another's pass.
Each holds its own `backoff`/`lastLogTime`/`consecutiveErrs`, doubling from the tick
interval to `DefaultSyncBackoffMax` of 5 minutes (`db.go:44`, `:3189-3196`;
`replica.go:449-456`) and resetting on first success, announced with the prior error
count (`db.go:3230-3232`, `replica.go:510-513`). Errors keep a recovery `Hint`
(`litestream.go:41-49`, `:87-91`); `SyncErrorLogInterval = 30s` (`db.go:45`)
rate-limits the repeat *log* only (`:3199`, `replica.go:463`, `:497`).

## 4. The alarm fires on the gap — via a dead-man's switch

`Store.sendHeartbeatIfNeeded` (`store.go:715-742`) pings an external URL only when
every open database has a `LastSuccessfulSyncAt` non-zero and no older than the
heartbeat interval (`:747-765`). No error count enters the predicate — only the gap:
a stream erroring loudly but still succeeding is fine, a stream that has silently
stopped stops the ping and the monitor fires. It is fail-safe, not fail-open
(`enabledCount > 0`), with the interval floored at 1m (`heartbeat.go:14`,
`:29-31`). **Deviation:** the predicate is one AND returning a bool, so "streams
A–F healthy, G failed with X" is what the alarm cannot say.

## 5. Divergence, silent repair, and a status field that lies

`checkDatabaseBehindReplica` (`db.go:1589-1666`) detects the one condition that in a
one-way mirror means something went badly wrong — the *local* database behind the
*remote* replica, i.e. a restore from the wrong side or a second writer — then
deletes local L0 and re-fetches, logging both steps at `Info` (`:1609-1611`,
`:1661-1663`). No status field, counter, or gauge records the divergence — same in
the `AutoRecoverEnabled` reset (`replica.go:485-492`, correctly gated at
`:481-484`) and in `monitorValidation`, whose errors are `Warn` lines only
(`store.go:894-927`).

Worse is the field a dashboard will bind to: `handleList` reports each database as
`replicating` / `open` / `stopped`, from `db.IsOpen()` and
`Replica.MonitorEnabled` alone (`server.go:483-492`) — a *lifecycle* state wearing a
*health* state's name, so a database failing every sync for a week still reports
`replicating`. `LastSyncAt` is present (`:498-501`), so the gap is computable; the
field that looks like health is the one that lies.

## Reconciliation summary

**Confirmed:** loop-written snapshot with a closed phase vocabulary and verbatim
error text; empty pass distinguished from failed pass by sentinel, and
progress-under-backlog counted as health; per-stream isolation and backoff by
goroutine boundary; rate-limiting the log, not the record; gap alarms via a
dead-man's switch.

**Deviations:** the cursor/tail pair is computed in one function (`DB.SyncStatus`)
no non-test code calls, so no surface shows lag and lag is never quantified; the
snapshot carries phase but no health state and clears the last error on the next
successful pass; the daemon's `status` is a lifecycle value reading `replicating`
for a stream failing continuously; the heartbeat cannot name the failing stream;
divergence, auto-recovery, and validation failures appear only in logs; `Restore`
integrity-checks *after* its rename (`replica.go:728-765`, `:770-778`).

**Not present by scope:** staged inbound review and "mark consumed, don't delete";
a one-way mirror has no inbound merge lane, so review-before-apply lands on the
consumer, not here.
