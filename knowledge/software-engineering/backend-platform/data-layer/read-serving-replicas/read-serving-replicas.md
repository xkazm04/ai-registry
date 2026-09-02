---
layer: golden-path
type: golden-path
subject: read-serving-replicas
status: forged
use_when: [letting standby nodes of a single-leader service answer reads, a replica keeps answering with a value the leader already changed, deciding what a follower may serve while another node holds leadership, a client reads back stale data right after its own write]
techniques:
  - forward-on-storage-error
  - preemptive-forward-for-known-writes
  - committed-write-invalidation-hook
  - evict-not-update-on-commit
  - fairshare-invalidation-queues
  - client-carried-index
---

# Read-serving replicas

A single-leader service replicates its state to standby nodes so that one of
them can take over when the leader dies. Every one of those standbys receives
every committed write, decrypts it, applies it, and then — in the default
design — does nothing with it: it answers every request with a redirect and
waits to be promoted. The system pays the full I/O and CPU cost of keeping N
copies current and uses one. This subject is the discipline of putting the
other N−1 to work: **every replica of one authority runs the full post-start
and serves reads from its own copy, while writes are refused by the storage
layer and carried to the authority.** The unit of currency is the **applied
write** — a change the authority has committed and this replica has applied to
its store *and to every derivation of its store* — and the whole problem is
that a replica knows the first half of that sentence long before the second.

Three commitments define the shape, and a principal engineer refuses to trade
any of them away:

**There is one node type.** A replica that serves reads is not a second tier
with its own flags, its own forwarding table and its own startup path; it is
an ordinary node that happens not to hold the leadership lease. It runs the
same post-start the leader runs — mounts, policies, caches, plugin
processes, the whole tree — and the leader runs one extra wrapper on top:
the periodic work only a writer may do (expiry sweeps, rotation, rollback
loops). A design that introduces a distinct "read replica" node type buys a
second startup path that drifts from the first, a second set of forwarding
special cases, and a class of bugs visible only on the tier nobody tests.

**Writes are refused at the storage layer, not classified at the edge.** The
temptation is a routing table keyed by request verb: reads local, writes
forwarded. It is wrong, and it is wrong in the direction that corrupts:
reads that write are common (a lazy migration on first read, a use-count
decrement, a last-used stamp, a response that must mint a single-use token),
and every one the table misses is a write attempted on a store that will
refuse it, after the handler has already done its side effects. The honest
gate observes the write itself: a read-only shim at the bottom of the storage
stack returns a typed sentinel on any mutation, and the request middleware
forwards the *whole original request* to the authority on that sentinel. A
short, closed list of operations whose effects precede their first write
forwards before dispatch, and that list is deliberately incomplete — the
shim catches what it misses, so it need only be right about the
irreversible.

**Derived state is invalidated from the committed-write stream, never by
time.** A replica's store is exact by construction — it is the authority's
log, replayed — and everything above the store is a derivation: a lookaside
cache, an in-memory table of mounts or policies, a parsed key ring, a
negative-lookup cache, a rate-limit bucket. The store learns of a write when
the log applies it; the derivations learn nothing unless something tells
them. That something is a hook the store fires with the keys of each
committed batch, on every node, after the batch is durable. A time-to-live
is the rejected answer, and the rejection is specific: a bound on staleness
cannot invalidate a list (the write is to a child key; the cached key is the
prefix), cannot represent an addition or a deletion (the negative entry "not
present" has no key the write would touch), and turns a cached "this
credential is valid" into a grace period the authority never granted.

## What a replica knows, and when

The applied write has three clocks on every replica, and confusing them is
the root of most stale reads. The **accepted index** is the last log entry
the consensus layer has received and acknowledged; it says nothing about
whether the entry's effects are visible. The **applied index** is the last
entry the state machine has written to the store. The **invalidated index**
is the last entry whose keys have been dispatched to every derivation. A
replica may advertise its freshness to a client only in the third currency:
a check that compares a client's expectation against the accepted index
passes while the cache still holds the old value, which is precisely the
request the check existed to catch
([gate-sees-target](../../../_laws.md#gate-sees-target)). The
[evict-not-update-on-commit](./techniques/evict-not-update-on-commit.md)
technique owns the reporting rule and the one move a cache may make on a
commit; the
[committed-write-invalidation-hook](./techniques/committed-write-invalidation-hook.md)
technique owns the stream that advances the third clock.

That third clock is also the replica's licence to serve. Leadership is a
lease held by one node — how it is renewed and lost is
[lease-renewal](../../work-execution/job-coordination/techniques/lease-renewal.md)'s
ground — and a non-leader's right to answer reads is a second, softer lease
that depends not on the leadership lease but on the invalidation stream's
freshness. A replica whose oldest undispatched invalidation is older than a
bound has a cache it cannot vouch for, and it **steps down from
read-serving** — forwards everything, keeps its place in the cluster,
resumes when the queue drains. The step-down is per replica and it is
automatic, because the alternative is an operator noticing a stale read
after a user did. The
[fairshare-invalidation-queues](./techniques/fairshare-invalidation-queues.md)
technique owns the queues, the bound, and what happens to a peer that stops
answering heartbeats.

## Consistency is the client's, and the server never waits

A client that writes to the authority and immediately reads from a replica
can observe its own write missing. Two designs make that impossible on the
server: wait, after each write, until every replica acknowledges it (the
write path is now as slow as the slowest replica, and one dead replica halts
all writes), or route every request from one session to one node (the
scaling this subject exists for is gone). Neither is acceptable. The
session-guarantees formulation names the properties actually wanted —
read-your-writes and monotonic reads — as properties of a *session*, and a
session is a client-side thing. So the server returns an **opaque monotone
index** with every response, the client echoes the latest one it holds, and
a replica behind that index refuses, forwards, or waits, per a policy the
listener declares. The writer is never blocked on a replica. Strict
consistency is an appearance one client buys for one request by paying
latency on a lagging node; the system underneath is eventually consistent
and says so. The
[client-carried-index](./techniques/client-carried-index.md) technique owns
the index, the echo, and the three behaviours.

## The failure that arrives as a series

The naive reading of this subject — "the standbys have the data, let them
answer" — does not fail once. It fails as a *series* of unrelated-looking
bugs, one per derivation: leases still cached on a replica after the
authority revoked them, a salt cache outliving a rotation, per-tenant
policies missing after a failover, a mount table upgraded by a node that had
no business writing, quotas counted per node. Each is found by a user, fixed
by hand, and closed as its own incident, and the series continues for as
long as derivations exist that the invalidation dispatcher does not know
about. The series ends when the dispatcher becomes a table — every key
prefix that can arrive named alongside the derivation it feeds
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation))
— and an unknown prefix is treated as the next bug arriving early: drop all
derived state, or restart, and log the key. A replica that receives an
invalidation it cannot route and ignores it has a cache that is stale
forever, and nothing on any dashboard says so.

## Boundaries

**Against sync & replication.** That subject models the replicated record:
a durable row that has a life on both sides of a boundary, where each side
keeps operating independently, disagreement is possible, and the machinery
exists to detect and resolve it — a working set mirrored between a device
and a hosted store, peers exchanging changes with no distinguished
authority. This subject models replicas of *one* authority: the copy's only
writes are the authority's log replayed in the authority's order,
disagreement between copies is impossible by construction, and the entire
problem is the gap between a replica's store and its derivations, and the
gap between a replica and the authority in time. The rule a reader uses to
pick: *if the copy can accept a write of its own that the authority must
later reconcile, it is sync-replication; if the copy's only job is to apply
the authority's log and answer reads from it, it is this subject.* The
neighbour's topology-declaration technique carries a section on "the
mirror's derived state" — the failure seen from the outside, as a topology
whose read-only promise breaks from within; it names the obligation and
points here for the mechanism. Their golden path's own rule holds: a copy
repaired by invalidation and refetch from a single authority is a cache,
not a peer, and belongs to this subject, not theirs.

**Against lease renewal.** That technique owns how leadership is held:
the lease deadline, the renewal cadence, the two-way channel that tells an
executor it is no longer the holder, and the fencing that turns a zombie
into a no-op. This subject owns what a node may do while the lease is
someone else's — serve reads from its applied state, refuse writes at the
store, forward what it cannot serve — and the second lease described above,
the read-serving licence that a replica grants itself only while its
invalidation stream is fresh. The rule: *the leadership lease decides who
may write; the invalidation stream's age decides who may read locally; a
node that confuses the two either writes as a follower or serves stale reads
as a leader-in-waiting.*

## The techniques

- [forward-on-storage-error](./techniques/forward-on-storage-error.md) — a
  read-only shim at the bottom of the storage stack returns a typed
  sentinel; the request middleware forwards the whole request on that
  sentinel and never on the verb; why the edge cannot classify writes.
- [preemptive-forward-for-known-writes](./techniques/preemptive-forward-for-known-writes.md)
  — the short closed list of operations that forward before dispatch:
  effects that precede the first write, single-use consumption, anything
  that must observe the authority's state at this instant.
- [committed-write-invalidation-hook](./techniques/committed-write-invalidation-hook.md)
  — the store fires a hook with a batch's put and delete keys after the
  batch commits; a non-replicated layer's hook is a deliberate no-op; why
  a time-to-live is rejected; the queue-age step-down.
- [evict-not-update-on-commit](./techniques/evict-not-update-on-commit.md)
  — under no global lock, removal plus a fill fence is the only correct
  cache move; the three indexes and which one a replica may report.
- [fairshare-invalidation-queues](./techniques/fairshare-invalidation-queues.md)
  — the core path on its own queue, per tenant otherwise, per peer always;
  a slow replica starves nobody; a silent peer is ejected and restarts.
- [client-carried-index](./techniques/client-carried-index.md) — the opaque
  monotone index the client echoes; fail, forward or await per listener;
  the writer is never blocked on the slowest replica.
