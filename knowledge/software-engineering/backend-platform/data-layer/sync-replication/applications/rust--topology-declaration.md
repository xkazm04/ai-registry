---
layer: application
type: application
subject: sync-replication
technique: topology-declaration
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.97
applied: simulation
ab_verdict: better
proof: structural-only
---

# A per-process cache over one shared store, in Personas (Rust)

The desktop app and its daemon binary run as separate processes against
one local database. The database is the authority; each process is, for
the purpose of the amendment on derived state, a read-serving replica that
happens to write through the same file. The tree holds exactly the
half-built form the amendment names.

## The seam

`src-tauri/src/engine/api_proxy.rs` keeps the connector list in a
process-global cache with a 30 s time-to-live (`CONNECTOR_CACHE_TTL_SECS`,
`api_proxy.rs:34`), because every proxied API request needs the list and
should not hit the store. Connector CRUD in `commands/credentials/connectors.rs`
calls `invalidate_connector_cache()` after a create and a delete
(`connectors.rs:49,58`) — so the *writing* process's copy is exact the
instant the write lands. No other process is told. The daemon's copy is
stale for up to 30 s after the UI's write, and the UI's copy after the
daemon's.

## Three cases from the tree, under both policies

Policy A is the tree: in-process invalidation plus a 30 s TTL for every
other process. Policy B is the amendment's second obligation applied to
this cache: the bound sized to the most sensitive fact it holds, with an
invalidation path for that fact where the bound is unacceptable.

1. **A connector is created in the UI, and an agent run in the daemon
   calls it within the same half-minute.** A: the daemon's proxy answers
   "unknown connector" until its TTL lapses; the agent's first attempt
   fails and its retry, if any, succeeds. B: identical, and acceptable —
   a not-yet-visible *addition* costs one retry. Falsifier: an agent
   loop that treats "unknown connector" as terminal rather than retryable.
2. **A connector is deleted in the UI — the user revoked a credential —
   while the daemon is mid-run.** A: the daemon's proxy keeps routing
   requests to the deleted connector for up to 30 s, with whatever
   credential it had loaded. That is the amendment's revocation case: the
   mirror has become a grace period nobody granted. B: the delete bumps a
   version the proxy reads per request (one integer, cheaper than the list
   it replaces), so the daemon's next proxied call sees the deletion.
   Falsifier: the proxied-request rate is high enough that one indexed
   read per request is measurable — in which case the version is cached
   for a second, not thirty.
3. **The cache mutex is poisoned by a panic in another thread**
   (`api_proxy.rs:52-62`). A: the tree already handles this the loud way
   — clears the entry, recovers the lock, surfaces an internal error
   rather than serving stale data. B: unchanged. This is the amendment's
   third obligation, already built, for the one failure the authors
   anticipated.

Verdict: **better**, on case 2 alone. The tree's TTL was sized to the
average fact (a list that rarely changes) and the cache also holds the
sensitive one (a revoked credential still routable), which is exactly the
sizing error the amendment warns about. Cases 1 and 3 do not move.

## What the tree said about the technique

The structural fact is the shape the amendment now names as the common
half-built form: **an in-process invalidation beside a cross-process TTL.**
Nobody designed it that way; the invalidation was added for the process
that writes, and the TTL was the pre-existing answer for everyone else. The
topology table for this app would say "one store, N readers, no
replication" and be correct, and the stale-revocation window would still be
there — which is the reason the amendment lives in the mirror's section
rather than in a cache technique.

## What this realization cannot do

It is a single-user desktop application: the credential the daemon keeps
routing to for 30 s is the user's own, revoked by the user, on the user's
machine. The verdict is about the shape, not the blast radius. The
falsifier on case 2 is the instrument that would turn this simulation into
an experiment: a counter of proxied requests per second on the daemon.
