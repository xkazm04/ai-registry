---
layer: application
type: application
subject: concurrency-guards
technique: leadership-is-the-lock
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Leadership as the lock in OpenBao's integrated Raft backend (Go)

How a secrets server whose storage is an embedded Raft log implements its
high-availability lock as an adapter over Raft leadership, with no fencing
token. Citations are against the OpenBao tree at commit `6b5f82e1`
(`go 1.27.0`, `go.mod:12`); paths are relative to the tree root.

## 1. The interface says why no fence is needed

The storage SDK declares `FencingHABackend` for backends whose locks must
hand out a fencing token, and its doc comment carries the reasoning in full
(`sdk/physical/physical.go:102-119`): without a token "timing might allow a
lock holder not to notice it's no longer the active node for long enough for
it to write data to storage even while a new active node is writing causing
corruption"; a session-based backend submits the session on every write; and
"for raft backend this isn't needed because our in-process raft library is
unable to write if it's not the leader anyway" (`:117-119`). The Raft backend
implements `HABackend` and does not implement `FencingHABackend` — the
technique's first rule, stated by the tree in the tree's own words.

## 2. Acquisition writes through the log or waits on the election

`RaftLock` (`internal/physical/raft/raft.go:1988-1994`) holds a key, a value
and the backend; the comment says the whole design: "Vault's active duty
matches raft's leadership." `Lock` (`:2021-2087`) has exactly the two
branches the technique describes. If `l.b.raft.State() == raft.Leader`
(`:2043`) it calls `applyLog` with a single `putOp` for the lock key
(`:2044-2052`) — a replicated entry that succeeds only if the node is leader
at append time — and returns `monitorLeadership` as the loss channel
(`:2058`). Otherwise it selects on `leaderNotifyCh` (`:2062-2065`), and only
on `isLeader == true` does it perform the same `applyLog` (`:2068-2082`).
There is no read of the stored key anywhere in the acquisition path.

`monitorLeadership` (`:1996-2019`) implements the stale-notification rule:
the channel "may deliver a true value initially if this server is already the
leader prior to RaftLock.Lock call"; the goroutine ignores `true` and closes
`leaderLost` on the first `false` (`:2003-2012`). `Unlock` is
`raft.LeadershipTransfer()` (`:2091-2097`) — release is an election
operation, not a delete of the key.

## 3. The stored value proves nothing on its own — the tree says so

`Value` (`:2100-2112`) reads the lock key through the backend's ordinary
`Get` and returns `true, value` whenever an entry exists, with the comment
`// TODO: how to tell if held?` (`:2110`). That TODO is the technique's
"stored value proves nothing" section observed in the wild: the key names who
last claimed active duty, and only Raft state can say whether the claim still
stands. Recorded as a **confirmation with a wart** — the adapter returns
`held == true` for any present entry, which callers must not read as
liveness.

## 4. Applied index from the FSM, not from the log library

`AppliedIndex` (`raft.go:1231-1243`) reads `b.fsm.LatestState()` and returns
its index, with the comment "which may be behind raft.AppliedIndex() due to
the async nature of the raft library" (`:1240-1241`). `Term` (`:1269-1281`)
takes the same route for the term. `AppliedReplicationIndex` (`:1248-1250`)
publishes that FSM index as the opaque string consumers echo, and
`GreaterEqualReplicationIndex` (`:1254-1266`) compares two of them
numerically. The one place the log library's own position is used is
`LastIndex` (`:1228`), for the log's accepted tail — the two positions are
kept apart by name.

## Reconciliation summary

Confirmed: no fencing token on the log-backed lock, with the reason in the
SDK interface comment; acquisition through the log if leader, else waiting on
the election notification, never polling the key; stale initial "leader"
signals swallowed until the first loss; release as leadership transfer; the
applied index read from the state machine with the async gap named. Wart:
`Value` reports held for any present entry and carries a TODO admitting it
cannot tell. Deviation: none against the technique's rules.
