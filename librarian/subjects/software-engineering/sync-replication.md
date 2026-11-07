---
subject: sync-replication
domain: software-engineering
last_touched: 2026-11-06
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

## Applied to the technique layer

- 2026-08-22-3: **lifecycle state is not health state** applied to `sync-observability` ([[2026-08-22-3]]).


## 2026-09-02 - /intake openbao (run intake-openbao-0902)

One amendment, one application.

- `topology-declaration` gained "The mirror's derived state": a
  read-serving replica's caches, indexes and counters are where the
  read-only promise breaks from the inside, and the failure arrives as a
  series of one-per-cache bugs (the source paid twelve over a year on its
  read-serving standbys). Three obligations - enumerate derivations with a
  keyed invalidation; declare a staleness bound only against the most
  sensitive fact the cache holds (a revocation is not reference data); an
  unroutable invalidation fails loud - plus forward-by-default for what the
  replica cannot serve. The corpus had no standby material before this
  (one grep hit across the bundle).
- Applied to a desktop app's per-process connector cache
  (`rust--topology-declaration`, `simulation`, `better`): in-process
  invalidation beside a 30 s cross-process TTL, which is the half-built
  form the amendment now names; the deleted-connector case is the
  revocation the bound was not sized for.

Home was contested: the corpus reads sync as client data sync, and a hot
standby is infrastructure. It landed here because the one-way mirror's
definition ("same data in more than one place, on purpose") already covers
it and the failure is a topology fact, not a cache fact.

## 2026-11-06 - shift-product ([[2026-11-06-product-codebase-craft]])

Application `react--conflict-detection-and-policy--excalidraw`: a live room choosing the across-users rule the technique forbids, and three departures read against this subject. **The "silent destruction" sentences are unchanged.** Narrowing them scored 4/2/2 and is a rewrite, so it is a proposal, with a co-editing subject (zero corpus hits for CRDTs or OT) as its home. Do not land the register technique alone: it would make that sentence false. `merge-function-proof` is banked at net 2, narrowed: an id-only compare misses a wrong winner where keys match and catches it where they differ.
