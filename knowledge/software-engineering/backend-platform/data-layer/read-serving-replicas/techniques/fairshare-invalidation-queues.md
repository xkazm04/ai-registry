---
layer: technique
type: technique
subject: read-serving-replicas
technique: fairshare-invalidation-queues
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [one slow replica delays invalidations to every other replica, a tenant's bulk write delays a revocation on the core path, a replica reconnects after missing invalidations, sizing and bounding the invalidation stream]
---

# Fair-share invalidation queues

Where the storage backend does not replicate through a log the service
owns, the committed-write stream is something the authority has to build:
after each write its store confirms, it sends the batch's keys and a
storage index to every read-serving replica. The naive transport is one
queue, one worker, one send per peer in turn. It fails the first time
one peer is slow: every invalidation behind that peer's send waits, on
every other peer, and a single wedged replica has made the whole cluster
stale. This technique gives the stream three axes of isolation — per peer,
per tenant, and a reserved lane for the core path — and states what happens
to a peer that stops answering.

## Per peer, always

Each connected replica gets its own queue and its own drain. A slow peer
fills its own queue and delays its own invalidations; nobody else's. The
queue is bounded, because an unbounded one turns a slow peer into an
out-of-memory on the authority, and what happens at the bound is the
technique's first hard rule: **the queue is never silently truncated.** A
dropped invalidation is a derivation on that replica that will never be
told, which is indistinguishable, from the replica's side, from a
derivation that was never cached. So when a peer's queue reaches its bound
the authority marks the peer as *gapped* — the peer's next receipt tells
it so — and a gapped peer drops all derived state or restarts before it
serves another read. The failure is spelled differently from the empty
queue ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
a drained queue and a discarded one both leave the queue empty, and only
one of them left the replica correct.

## The core path on its own lane

Some keys feed derivations every request depends on — mount tables,
policies, tokens, the key ring, tenant metadata — and some feed one
tenant's own data. A tenant's bulk import that emits ten thousand keys
must not delay the revocation queued behind it, because the revocation is
the case the entire invalidation design exists for. So within each peer's
stream, invalidations for the core path go on a reserved queue with its
own drain, and everything else is partitioned **per tenant** and drained
fair-share: a worker pool that rotates across tenant queues rather than
draining one to empty before starting the next. The pool's size is
derived, not chosen — a fraction of the available workers divided across
the live queues, floored at one per queue — so a tenant count that grows
does not silently starve the last tenant added.

The rule: **when the invalidation stream carries keys from more than one
source of load, partition it so that the core path has a reserved drain,
each tenant has its own queue, and each peer has its own copy of that
structure; because a single queue makes every consumer's latency the
slowest producer's, and the slowest producer is always a bulk write in a
tenant nobody was watching.** The naive reading — one queue is simpler,
and invalidations are small — is true right up to the first tenant that
scripts a migration, and the symptom it produces (a revocation honoured
seconds late on one replica) is reported as a security incident, not a
queueing one.

## Heartbeats, ejection, and the restart

A peer that holds a queue on the authority is a created resource, and it
names its reaper ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
the peer heartbeats over the same channel it receives on, and a peer whose
last heartbeat is older than a bound is ejected — its queues released, its
entry removed from the set of connected peers. Ejection is not a pause.
The peer has, by construction, missed whatever was queued after the
authority stopped hearing from it, and a reconnect that resumed from the
old queue would either replay a queue the authority no longer holds or
skip the gap. So a reconnecting peer starts as a new peer: it drops all
derived state (or restarts the process, which is the same thing done
reliably), rejoins, and only then enables read-serving. The cost is a cold
cache per reconnection; the alternative is a warm cache with a hole in it
that nothing will ever fill.

Two numbers govern this, and both carry their predicate. The heartbeat
bound decides how long a silent peer keeps its queue alive and is sized to
detection latency, not to expected pauses: seconds, so a partitioned
replica is ejected before its queue reaches the bound above. The queue-age
bound, from the hook technique, decides when a *connected* peer steps
down from read-serving because its own drain is behind: it is measured at
the replica, on the oldest undispatched entry, and it fires long before
ejection would. A replica can therefore be in one of three states with
respect to the stream — serving, stepped down and draining, ejected and
restarting — and a status surface that reports only "connected" collapses
the first two, which is the collapse that lets a stale replica look
healthy.

## What the stream does not carry

Values, ever — the hook technique's rule, restated here because the
per-tenant partition makes it tempting to "just send the policy along"
for the core path. And ordering guarantees across queues: the core-path
lane can and will run ahead of a tenant lane, so a derivation that spans
both (a tenant's policy referencing a core-path mount) is invalidated on
whichever key arrives first and refilled from the store, which is current
for both. The store is the ordering authority; the queues only carry the
news that something changed.
