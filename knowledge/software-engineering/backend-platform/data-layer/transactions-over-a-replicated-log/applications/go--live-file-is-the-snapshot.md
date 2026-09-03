---
layer: application
type: application
subject: transactions-over-a-replicated-log
technique: live-file-is-the-snapshot
status: forged
stack: go
verified_on: 2026-09-02
verified_against: go@1.27
---

# The bbolt file as the Raft snapshot (OpenBao, Go source tree)

OpenBao at `6b5f82e1` runs hashicorp/raft above a bbolt file that is the
FSM, and `internal/physical/raft/snapshot.go` is the snapshot store that
tells the library the file is the snapshot. This application records where
the tree confirms the technique, where it went further than the dispatch
described, and the one place it deviates.

## One constant identifier, one snapshot, none at index zero

`boltSnapshotID = "bolt-snapshot"` (`snapshot.go:29-31`), with the comment
"Keeping the ID stable means there is only ever one bolt snapshot in the
system". The type comment at `:36-48` is the technique's argument in the
tree's words: "Since we always have an up to date FSM we use a special
snapshot ID to indicate that the snapshot can be pulled from the BoltDB
file that is currently backing the FSM ... Then, we can simply rename the
snapshot to the FSM's filename ... Older snapshots are reaped on startup
and before each subsequent snapshot write."

`List` (`:137-149`) builds its one `SnapshotMeta` from
`fsm.LatestState()` (`:152-166`; `fsm.go:462-467`, two atomics and a
stored configuration) and returns `nil, nil` when `meta.Index == 0`
(`:143-146`) - the empty store reports no snapshot rather than a snapshot
at zero. `Open` (`:169-175`) routes the constant identifier to
`openFromFSM` (`:177-207`), which refuses with "no snapshot data" at index
zero (`:183-185`) and otherwise pipes `fsm.writeTo` twice - once into a
discarded reader to compute `meta.Size` (`:194-203`), once to the caller.
`writeTo` (`fsm.go:946-987`) takes the FSM read lock and one `db.View`,
walks the data bucket for the metadata pass and again for the copy pass
(`:961-982`) - the stream is a read transaction on the live file.

## The no-op snapshot that still persists metadata

`FSM.Snapshot` (`fsm.go:989-994`) returns a `noopSnapshotter`, and
`Persist` (`:1086-1096`) writes no entries. It calls `witnessSnapshot`
(`:444-458`), which writes the sink's index, term and configuration into
the config bucket and stores them into the atomics `LatestState` reads.
The comment at `:1082-1085` supplies the reason the dispatch's "taking a
snapshot is a no-op" understated: "it does persist the raft metadata. This
is necessary so we can be sure to capture indexes for operation types that
are not sent to the FSM." That is the technique's fast-forward paragraph,
an upward lesson from the tree.

## Truncation and restore-on-start, switched off - and truncation re-owned

`applyConfigSettings` (`raft.go:821-890`) saves the library's snapshot
threshold, trailing-log count and interval into the backend (`:836-838`),
then sets the library's own to `math.MaxUint64`, `math.MaxInt64 / 2` and
`math.MaxUint64` (`:846-848`) under a comment that names the failure
exactly (`:840-845`): the library "counts entries since the last snapshot
to decide when to truncate, but BoltSnapshotStore.List() must report a
snapshot at the last applied index, otherwise Raft replays the log at
startup. This resets the counter and prevents truncation from triggering
if fewer than snapshot_threshold entries are written before next restart."
The operator's `snapshot_threshold`, `trailing_logs` and `snapshot_interval`
still parse (`:850-878`, with a floor of 5 ms on the interval) into the
backend's copies. `config.NoSnapshotRestoreOnStart = true` at `:880`.

What the dispatch did not carry is where truncation went.
`startLogTruncationWorker` (`raft.go:1893-1910`) truncates once at startup
and then on a jittered timer of `snapshotInterval` plus a random extra;
`truncateLog` (`:1914-1936`) reads the log store's first index and the
FSM's applied index, computes `entryCount = applied.Index - minLog + 1`,
returns unless it exceeds `snapshotThreshold + trailingLogs` (`:1926`), and
otherwise deletes `[minLog, applied.Index - trailingLogs]` (`:1930-1931`).
The counter's basis is the log store and the applied index, both of which
survive restart. This is the technique's "truncation moves to the
application" section, and it is the second upward lesson.

## Restore guarded twice

`SetNoopRestore` (`fsm.go:996-1003`) exists because "we are using
persistent storage in our FSM we do not need to issue a restore on
startup". `SetupCluster` raises it at `raft.go:1033` before the `peers.json`
recovery path (`:1037-1058`, `raft.RecoverCluster` at `:1048`), before the
recovery-mode path (`:1060-1065`), and before `raft.NewRaft` at `:1068`,
and lowers it at `:1069` immediately after. `Restore` returns nil while the
flag is up (`fsm.go:1011-1013`). Both recovery paths call the library's
`RecoverCluster`, which restores the newest snapshot regardless of
`NoSnapshotRestoreOnStart` - the FSM-side flag is what protects them.

## Install: locked, cached, renamed, reopened either way

`Restore` (`fsm.go:1008-1074`) unwraps the reader to a
`boltSnapshotInstaller` (`:1015-1026`), takes the FSM write lock (`:1028`),
caches `localNodeConfig()` (`:1031-1035`), closes the database (`:1038`),
calls `Install` (`:1049`) - `safeio.Rename` of the snapshot file onto the
FSM path (`snapshot.go:514-529`) - and then, in the comment's words at
`:1056-1057`, opens the file "regardless of if the above install worked. If
the install failed we should try to open the old DB file." The cached
local node configuration is re-persisted through `persistDesiredSuffrage`
(`:1065-1071`; `fsm.go:433-442`). Errors accumulate into a multierror
rather than short-circuiting, so a failed install still reopens and still
re-persists.

The sink side: `Create` (`snapshot.go:110-132`) refuses any snapshot
version but 1 and seeds the meta with the constant identifier; the first
`Write` (`:417-435`) reaps (`:424-427`) and then creates the temporary
directory `<term>-<index>-<msec>.tmp` (`:321-354`), a fresh bbolt file
with the metadata written first (`:341`), and a goroutine that parses
delimited protobuf entries off a pipe (`:362-410`). `Close` (`:438-476`)
waits for the goroutine, removes the directory on a write error
(`:452-457`) and otherwise renames it to its final name (`:459-472`);
`Cancel` (`:479-498`) removes it. `ReapSnapshots` (`:277-310`) deletes every
directory under the snapshot path, warning on the `.tmp` suffix as "a
previously failed snapshot attempt" (`:294-299`), and is called from the
constructor (`:101-104`) and from the first write.

## The batch, with its reason

`snapshot.go:381-383`: "Commit in batches of 50k. Bolt holds all the data
in memory and doesn't split the pages until commit so we do incremental
writes." The loop is `for range 50000` inside one `boltDB.Update`
(`:375-401`), repeated until the reader returns `io.EOF` (`:386-389`); a
write error is stored on the sink (`:402-406`) and surfaces at `Close`. The
number and its sentence are the technique's rule as written.

## One deviation, one platform note

The rename that installs the snapshot is `safeio.Rename` - rename plus
directory fsync - everywhere except Windows, where it falls back to
`os.Rename` (`snapshot.go:463-467`, `:524-528`). On that platform the swap
is still a single rename but the directory entry is not fsynced, so a
power loss immediately after install can lose the rename while the old
file is already gone. The technique's "at every instant either the old
store or the new one" holds on every platform the product deploys to; the
fallback is recorded here as a deviation, not lowered into the standard.

The operator-facing archive path (`raft.go:1575-1592` for writing,
`WriteSnapshotToTemp` at `:1599` for reading with the seal-access check
its comment describes, `RestoreSnapshot` at `:1622-1656` calling
`raft.Restore` and then proposing a `restoreCallbackOp` so followers run
their restore hooks after the quorum has the snapshot) sits above this
technique and belongs to the quorum-and-recovery-procedures subject's
seal-mismatch guard.
