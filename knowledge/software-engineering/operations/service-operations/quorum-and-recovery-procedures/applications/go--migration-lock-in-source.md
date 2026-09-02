---
layer: application
type: application
subject: quorum-and-recovery-procedures
technique: migration-lock-in-source
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The offline storage migrator and its boot guard (Go, source tree)

Written against the source tree of OpenBao (commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`).
`bao operator migrate` (`internal/command/operator_migrate.go`) copies every entry from
a `storage_source` backend to a `storage_destination` backend with the server stopped;
`internal/command/server.go` carries the lock helpers and the boot refusal.

## Lock in the source (confirmed)

`OperatorMigrateCommand.migrate` (`operator_migrate.go:187-240`) instantiates the source
first, checks `CheckStorageMigration(from)` (`operator_migrate.go:205-213`) and refuses
with "storage migration in progress (started: %s)" if the lock entry exists, then
takes the lock with `SetStorageMigration(from, true)` and releases it in a deferred
call that joins any release error onto the migration's own (`operator_migrate.go:220-227`).
The lock is one JSON entry at the reserved key `core/migration`
(`server.go:78`, `server.go:3100-3120`) carrying the start time; `CheckStorageMigration`
at `server.go:2485-2500` decodes it. The provenance the technique asks for is the
timestamp; the tree records no host, which is a thin spot the technique states as
preferable but does not require.

## The file-locked backend is exempt (confirmed)

`operator_migrate.go:215-219` skips the lock when the source is the integrated
consensus backend, with the reason in the comment: "Raft storage cannot be written to
when shutdown. Also the boltDB file already uses file locking to ensure two processes
are not accessing it." The exemption is a `switch` on the declared backend type, not
a runtime probe - the technique's "declared where the backend is registered".

## Reserved keys are never copied (confirmed)

`migrateAll` (`operator_migrate.go:249-252`) skips `storageMigrationLock` and
`vault.CoreLockPath` (`core/lock`, the HA leadership lock, `internal/vault/core.go:75-77`).
Both are keys that describe the source's own state; the denylist is the two the
serving process treats as its own.

## The server refuses to start (confirmed)

`ServerCommand.storageMigrationActive` (`server.go:2448-2462`) runs at boot, before
the core is created, and on a present lock prints "Storage migration in progress
(started: %s). Server startup is prevented until the migration completes. Use 'bao
operator migrate -reset' to force clear the migration lock." and returns true, which
aborts startup. The refusal names the reset path, so the operator who hits it knows
the one command that clears the marker.

## Reset clears only the lock (confirms `cancel-leaves-prior-state-valid`)

`-reset` (`operator_migrate.go:103-106`, "Reset the migration lock. No migration will
occur.") is handled at `operator_migrate.go:193-198`: it deletes the lock entry in the
source and returns before the destination is even instantiated. It does not resume,
roll back or touch data.

## Ordered traversal and the start key (upward lesson)

`dfsScan` (`operator_migrate.go:389-428`) walks the source depth-first with children
sorted (`sort.Strings(children)` at `:410`), under an errgroup whose limit is
`-max-parallel` (default 10, `operator_migrate.go:108-112`). Because the order is
lexicographic, `-start` (`operator_migrate.go:97-101`, "Only copy keys
lexicographically at or after this value") makes an interrupted run resumable from a
key the operator reads off the output; `migrateAll` skips `path < c.flagStart` at
`:251`. The draft technique had said the migrator does not resume; the tree's design
is better and rests on the boot refusal for its soundness, and the technique now
states both halves as one design.

## Where the tree is thinner than the standard

The migrator prints nothing per skipped reserved key, so the operator cannot see the
denylist act; and the lock carries no holder identity. Neither is a defect the
technique lowers itself to; both are deviations recorded here.
