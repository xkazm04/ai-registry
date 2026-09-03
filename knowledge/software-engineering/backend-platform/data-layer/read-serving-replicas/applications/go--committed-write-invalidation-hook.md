---
layer: application
type: application
subject: read-serving-replicas
technique: committed-write-invalidation-hook
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The invalidation path in OpenBao: hook, eviction, queues

How OpenBao (Go, `go 1.27.0`, commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`)
realizes [committed-write-invalidation-hook](../techniques/committed-write-invalidation-hook.md),
and with it [evict-not-update-on-commit](../techniques/evict-not-update-on-commit.md)
and [fairshare-invalidation-queues](../techniques/fairshare-invalidation-queues.md),
which share one code path. Paths are relative to the tree root. The design
documents are `website/content/community/rfcs/invalidation.mdx` (the Raft-side
hook) and `grpc-invalidation.mdx` (the application-level stream for backends
with no log the server owns).

## 1. The hook: keys only, after commit, before the index advances

`physical.CacheInvalidationBackend` (`sdk/physical/physical.go:64-72`) is the
optional interface: `HookInvalidate(hook InvalidateFunc)`, with
`InvalidateFunc func(key ...string)` — keys, no values, no context. The Raft
backend implements it by handing the hook to its state machine
(`internal/physical/raft/raft.go:230-233`). In `FSM.ApplyBatch`
(`internal/physical/raft/fsm.go:731`), the hook fires after the embedded store's
write transaction has committed and *before* the in-memory latest index is
stored (`fsm.go:889-909`): the loop collects every `putOp` and `deleteOp` key
across the batch's commands and calls `f.invalidateHook(keys...)` once
(`fsm.go:903`); only then does `f.latestIndex.Store(lastLog.Index)` run
(`fsm.go:909`). The order is the standard's rule for which index a replica may
report: `RaftBackend.AppliedReplicationIndex` (`raft.go:1248-1250`) returns
`b.AppliedIndex()`, and that function (`raft.go:1232-1243`) reads the FSM's own
latest index with the comment "which may be behind `raft.AppliedIndex()` due
to the async nature of the raft library" — the state machine's number, never the
log library's. **Confirmed** on both counts.

The deliberate no-op is `sdk/physical/write_notifier.go:45-50`: the write-notifier
layer that feeds the application-level stream implements `HookInvalidate` as an
empty method with a comment explaining that "this particular layer is not
replicated in any way and thus nothing would be able to call this hook on a
standby." **Confirmed**: named and registered, not absent. The same layer is the
authority's side of the stream: `Put` and `Delete` call `notifyWrite` only on a
nil error (`write_notifier.go:52-72`), and a transaction batches its keys and
notifies once at `Commit` (`write_notifier.go:136-145`) — after the underlying
commit returns, with the whole key set.

`Core.Invalidate` (`internal/vault/invalidation.go:34-36`) appends to a pending
slice; `invalidationManager.Add` (`invalidation.go:589-611`) drops the call on the
active node with the comment that "the active is expected to invalidate itself
in the course of writing the data" — which it does through the transactional
cache's commit path (section 2). **Deviation from the letter, not the spirit**:
the technique says the hook fires on every node; here it fires on every node but
is consumed only on standbys, because the leader's caches are already evicted at
commit time by the layer that wrote.

## 2. Eviction, the fill fence, and the negative entry

`cacheTransaction.Commit` (`sdk/physical/cache.go:362-383`) is the standard's
argument in the tree's own words:

```go
// Make sure we invalidate any modified entries in the parent cache. Note
// that because we don't hold a global lock on the parent, we cannot tell
// if another modification to our key has occurred between when we
// committed the underlying storage transaction (above) and when we go to
// update this cache. Thus, removing the value from the cache is the most
// optimal strategy (incurring one additional read) without causing
// incorrect behavior.
```

`cache.Invalidate` (`cache.go:402-408`) is `lru.Remove` under the key's write
lock, and `cache.Get` (`cache.go:203-234`) holds the same key's *read* lock
across miss, backend read and `lru.Add` — the lock-shaped fill fence the
technique describes: an eviction arriving mid-miss waits for the fill and then
removes it. `Get` also caches a nil result ("Cache the result, even if nil",
`cache.go:230-231`), so the negative entry the TTL argument turns on is real
here and is evicted by the same `Remove`. Each invalidation job calls
`physicalCache.Invalidate` first, before routing to any subsystem
(`invalidation.go:344-348`), with the request context marked to bypass the cache
on any read it performs (`invalidation.go:342`). **Confirmed** throughout.

## 3. The dispatcher table, and how loud the default is

`invalidationJob.Execute` (`invalidation.go:289`) routes by key prefix to the
namespace store, policy store, token store, quotas, audit, login MFA, identity,
and finally the plugin router (`invalidation.go:466-469`, `router.Invalidate`).
Two branches carry the technique's "unknown key" rule and they differ.
A key under `sys/` with no handler logs at error level with the comment "treat it
as fatal and restart" (`invalidation.go:459-465`); a fatal job triggers
`core.Restart()` from `OnFailure` (`invalidation.go:575-587`). The catch-all
`default:` (`invalidation.go:478-479`) logs a *warning* and returns nil.
**Deviation**: for a non-system key the default branch is quiet in effect — the
key is logged and the node keeps serving — where the technique asks for a
dropped derived state or a restart. The tree's mitigation is `isMissedMountKey`
(`invalidation.go:470-477`), which explains why an unroutable mount-prefixed key
is safe to ignore (a later key under the same mount loads it); that argument
does not extend to the unqualified default.

## 4. Fair-share queues, per tenant, core lane, per peer

`buildInvalidateJobForKey` (`invalidation.go:191-230`) is the queue assignment,
with the three goals stated in its comment — total memory, not starving any one
namespace, prioritising core — and the resulting shape: a root-namespace `core/`
key gets its own queue keyed by the key itself, a child namespace's `core/` keys
share a `<ns>-core` queue, namespace-store keys share one ordered `namespaces`
queue (a "dense tree" where ordering matters), and everything else queues per
namespace. The dispatcher is a fair-share job manager with `maxDispatchers =
128` (`invalidation.go:31`, `:102-104`). **Confirmed.**

The application-level stream is per peer. On the active node
`invalidationPeers.SendInvalidation` (`internal/vault/grpc_invalidation.go:146-188`)
adds one job per started peer to a job manager keyed by peer UUID, with the
reason in the comment (`grpc_invalidation.go:170-173`): "using a job manager with
per-peer queues ensures that a slow peer does not starve other peers from their
invalidations." A send failure deletes the peer (`grpc_invalidation.go:364-375`).
Peers live in a cache with a lifetime of sixteen heartbeat intervals whose
eviction closes the peer's stop channel (`grpc_invalidation.go:72-76`), and each
successful send touches the entry (`:360`). **Confirmed**: ejection by silence.

The restart-after-gap rule is on the standby side, in
`internal/vault/forwarding/request_forwarding_rpc.go:475-490`: when the stream
goes away the cleanup calls `core.Restart()`, with the argument the technique
makes — "we'd have lost any invalidations the server has generated in the
meantime. We'd also have no way of catching back up to the current state as we
don't track read data versus indices. Thus a restart is the cleanest solution."
**Confirmed**, and it is the source of the upward lesson that a peer cannot
resume, only rejoin.

## 5. The join protocol, subscribe-before-load

`runReadEnabledStandby` (`internal/vault/ha.go:1073`) performs the four steps in
the technique's order: `c.invalidations.Track()` starts queueing before anything
loads (`ha.go:1040-1047`, with the comment that events arriving before the
read-only unseal "will be silently ignored otherwise"); the stream is opened and
the active returns a checkpoint index (`MarkPeerStarted`,
`grpc_invalidation.go:234-246`); `AwaitReplication` (`grpc_invalidation.go:299-317`)
waits for the local storage index to reach that checkpoint; then
`readonlyUnsealStrategy.unseal` (`internal/vault/core.go:2245-2262`) runs the
shared post-unseal and calls `c.invalidations.Start(ctx)` last, "any
invalidations that occurred during startup will now be processed." The licence
rule is `StandbyReadsEnabled` (`ha.go:1577-1581`): reads are enabled only if the
backend has a log-level hook, or has a replication index *and* the forwarding
client is connected. **Confirmed**, and this is where the technique's "Joining"
section came from.

## 6. What the tree does not do

The queue-age step-down — a connected replica that stops serving reads when its
oldest undispatched invalidation is older than a bound — is described in
`grpc-invalidation.mdx` ("if queue pressure grows too large ... we'll consider
the node stale and step down from read-enabled status") and is not implemented
at this commit: the per-job wait is time-boxed at sixty seconds
(`internal/vault/storage_index.go:90`) and a failed wait restarts the node
(`grpc_invalidation.go:404-410` calling the cleanup above), which is the coarser
of the two responses. The standard keeps the step-down as the bound, and records
here that the tree's only lever today is restart.
