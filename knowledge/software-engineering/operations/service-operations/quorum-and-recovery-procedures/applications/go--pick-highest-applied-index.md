---
layer: application
type: application
subject: quorum-and-recovery-procedures
technique: pick-highest-applied-index
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Recovery mode, applied index and the sealed-manifest restore guard (Go, source tree)

Written against the source tree of OpenBao (commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`).
The integrated consensus backend lives under `internal/physical/raft/`; recovery mode
is `bao server -recovery` (`internal/command/server.go:366-677`) documented in
`website/content/docs/concepts/recovery-mode.mdx`; snapshot restore is
`bao operator raft snapshot restore` (`internal/command/operator_raft_snapshot_restore.go`).
This application also records where the tree confirms the sibling technique
`single-node-recovery-resize`, since the recovery-mode procedure is one document.

## Applied index, read while sealed (confirmed)

The recovery-mode doc states the procedure in the technique's own order: "seal or
stop all nodes in the cluster", then "run `bao status` on each node to find the
highest-index ones (this will require they be running and sealed, as if unsealed a
new leader might be elected and writes could happen, confusing the issue)", then
restart the target in recovery mode. Under "Integrated Storage": "It is important
when choosing a node to use for recovery that it has the highest `AppliedIndex` found
in the cluster."

`RaftBackend.AppliedIndex` (`internal/physical/raft/raft.go:1232-1244`) returns the
state machine's own `LatestState().Index`, with the comment "We use the latest index
that the FSM has seen here, which may be behind raft.AppliedIndex() due to the async
nature of the raft library." That is the predicate the technique fixes - the number
names what storage holds, not what the library dispatched - and the tree's comment
is the upward lesson that put the paragraph in the technique.

## The sealed-manifest guard (confirmed; upward lesson)

The CLI's `-force` flag (`operator_raft_snapshot_restore.go:46-51`) "bypasses checks
ensuring the Autounseal or shamir keys are consistent with the snapshot data" and
routes to a separate `storage/raft/snapshot-force` path
(`internal/vault/logical_system_raft.go:178`). `handleStorageRaftSnapshotWrite`
(`logical_system_raft.go:644-672`) passes the current seal access to
`WriteSnapshotToTemp` unless forced, in which case `access = nil`. The check is a
decryption: the snapshot archive carries a `SHA256SUMS.sealed` file written under the
cutting cluster's seal (`internal/physical/raft/snapshot/archive.go:163-176`), and on
read the sealer must `Open` it before the content hashes are verified
(`archive.go:253-270`, "failed to open the sealed hashes"). The handler maps that
error to "could not verify hash file, possibly the snapshot is using a different set
of unseal keys; use the snapshot-force API to bypass this check" (or "a different
autoseal key"). The draft technique had imagined a metadata comparison; the tree's
decryption test is the stronger form and the technique now describes it.

`RaftBackend.RestoreSnapshot` (`raft.go:1622-1650`) installs the snapshot through the
library's `Restore` and then applies a log entry telling followers to run the restore
callback - the state continues from the snapshot's index, history behind it is not
rewritten. The single stable snapshot identity (`internal/physical/raft/snapshot.go:29-48`,
"Keeping the ID stable means there is only ever one bolt snapshot in the system", with
atomic rename on install) is the versioning subject's material and is cited here only
as the artifact the restore consumes.

## Recovery mode shrinks to one (confirms `single-node-recovery-resize`)

`RaftBackend.StartRecoveryCluster` (`raft.go:909-923`) builds a `raft.Configuration`
with exactly one server - the local peer - and passes it as `RecoveryModeConfig` with
`StartAsLeader`; `SetupCluster` applies it through the library's `RecoverCluster` at
`raft.go:1060-1064`. The doc says why: "Recovery mode OpenBao automatically resizes
the cluster to size 1. This is necessary because the Raft protocol won't allow
changes to be made without a quorum", and makes the exit explicit: "part of the
procedure for returning to active service must include re-forming the raft cluster"
- wipe and rejoin the other nodes, or use a peers file that `raft.go:1036-1058`
consumes and deletes on start.

`runRecoveryMode` (`server.go:366-372`) accepts exactly one seal block
(`server.go:462-465`, "Only one seal block is accepted in recovery mode"), calls
`core.InitializeRecovery` (`server.go:529-532`), and hands each listener a
`RecoveryToken: &atomic.Value{}` (`server.go:623-624`). `NewCore` returns early for
recovery mode before any subsystem beyond the barrier and seal manager is built
(`internal/vault/core.go:1104-1141`), which is the "serves nothing but repair"
property.

## The recovery credential (confirms `single-node-recovery-resize`)

`generateRecoveryToken.authenticate` (`internal/vault/generate_root_recovery.go:27-44`)
turns the combined shares into the root key and *unseals the barrier* as part of the
token ritual - the upward lesson that in recovery mode the ritual is the unseal.
`generate` (`generate_root_recovery.go:46-61`) mints a random token, stores it in the
single `atomic.Value`, and returns a cleanup that clears it; nothing is written. The
doc: "Unlike root tokens, the recovery token is not persisted, so if OpenBao is
restarted into recovery mode a new one must be generated. Only a single recovery
token can be generated. If lost, restart OpenBao and generate a new one."

## Where the tree is thinner than the standard

The tree records no decision log for a restore - which node was chosen, at which
index, whether the guard was overridden - beyond the server log lines. The technique
asks for that record; the tree leaves it to the operator's runbook.
