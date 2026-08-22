---
subject: sync-replication
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# sync-replication

First touch: [[2026-08-22-2]], external reconcile against
`benbjohnson/litestream` @ `63225f1` (v0.5.16 era). Gained
`go--sync-observability` (an uncovered technique) — second stack; single-stack
debt cleared. Note: the change-tracking hint was stale — v0.5.x replaced
shadow-WAL generations with LTX/TXIDs.

## Open leads (banked, convergence rule applies)

- Progress-under-backlog is health: a pass truncated by a batch cap must record
  sync success or the alarm inverts on catch-up.
- **The dead-instrument failure mode** — the lag pair computed in one function
  nothing but tests call; every status quantity must bind to an operator
  surface or it does not exist.
- **Lifecycle state is not health state** — `replicating` from IsOpen alone.
  SECOND SIGHTING in Prisma's shape-discriminated ambient join, same wave.
- Dead-man's switch as the named gap-alarm pattern, with its known cost: an AND
  across streams cannot attribute the failure.
- Divergence detected then silently repaired destroys the only evidence a
  two-writer incident occurred — distinct from silent failure.

## Cross-subject proposals (for owning subjects)

- Per-failure-domain backoff + recovery-announcement-with-count + log
  rate-limiting decoupled from backoff → a clean go application for
  retry-backoff's observability side.
- tmp-fsync-rename done right (`WriteTXIDFile`) and inverted (`Restore`) in one
  file → an atomic-file-replacement home.
