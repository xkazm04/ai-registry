---
layer: technique
type: technique
subject: read-serving-replicas
technique: committed-write-invalidation-hook
status: forged
laws: [derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [a cache on a replica outlives the write that changed its source, choosing between a time-to-live and an invalidation stream, a list endpoint on a replica omits an entry the leader shows, wiring a new storage backend into a replicated service]
---

# Committed-write invalidation hook

A replica's store is current the moment the log applies a batch. Nothing
above the store is, unless told. This technique is the telling: the storage
backend fires a hook, on every node, with the keys of each committed batch,
and every derivation the node holds — caches, in-memory tables, parsed
configuration, negative lookups — subscribes to the key prefixes it depends
on and drops what those keys feed. The hook is the only source of
invalidation the design admits; a time-to-live is rejected for reasons this
technique states, and a hook that does not exist is stated to not exist.

## Where the hook fires

The hook fires **after the batch is durable and applied**, never before:
an invalidation that arrives while the old value is still what the store
returns causes a refill with the old value, which is the stale read the
hook exists to prevent, now with a fresh timestamp. It fires with the
batch's **put and delete keys, and no values**: values would make the
invalidation stream a second replication channel racing the first, and the
store already carries them. And it fires **once per batch**, with the whole
key set, so a derivation that depends on two keys written together is
invalidated for both in one call rather than observing a half-applied
batch between two.

Where the backend is itself replicated — a consensus log with a state
machine on every node — the hook is a call the state machine makes at the
end of applying a batch, and every node fires it locally from its own
apply. Where the backend replicates below the service's view — a shared
database the replicas all read — the service builds the stream itself: the
authority, after its own store confirms the write, sends the key set to
each connected replica over the cluster's internal channel, tagged with a
storage index the replica records as it dispatches. The second shape needs
[fairshare-invalidation-queues](./fairshare-invalidation-queues.md); the
first gets ordering from the log for free.

A layer with nobody to inform — an in-memory backend, a single-file store,
a test double — implements the hook as a **deliberate no-op, registered and
named**, not as an absent method. The distinction is the difference between
"this backend cannot replicate, so there are no peers to invalidate" and
"nobody wired invalidation for this backend", and a system that cannot tell
them apart at startup has made its most important decision silently
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A
replica that comes up on a backend whose hook is absent — rather than
no-op — refuses to enable read-serving and says why.

## Joining: subscribe before you load

A replica that loads its derivations and *then* subscribes to the stream has
a hole exactly the width of its own startup: any write committed between
the load and the subscription changed a derivation the replica just built
and will never be told about. The order is therefore inverted, and it has
four steps. The replica **starts queueing** invalidations first, before it
loads anything, discarding nothing that arrives. It **subscribes** to the
authority and receives a checkpoint — the authority's position at the
moment of subscription, after which every write will be sent. It **awaits**
its own store reaching that checkpoint, so that nothing it is about to load
predates a write it will not hear about. Only then does it **load** its
derivations, and only after the load does it **start dispatching** the
queue, which now holds every write since the checkpoint, some of them
redundant with what was just loaded and none of them missing. The
redundancy is the price of the guarantee and it is paid once per join.

The subscription is also the licence. A replica with no live channel to
the stream — because the backend offers no log-level hook and the
application-level stream is not connected — has no way to hear about
writes, and it does not serve reads: it is an ordinary cold standby until
the channel exists, whatever its store says. Read-serving is a property of
the invalidation path, not of the data.

## Why a time-to-live is the wrong answer

A bound on staleness looks like the cheap alternative: no hook, no stream,
every cache entry expires after a while. It fails on three counts, and each
is a shape of data, not a tuning problem.

A **list** is cached under its prefix; the write that changes it lands on a
child key. No expiry on the list entry is triggered by the child's write,
so the list is stale for the full bound after every addition and deletion
beneath it, and a client that creates an item and lists the collection on
a replica does not see the item. The hook handles this because the
dispatcher maps a child key to the prefix-derivations it invalidates.

An **addition or deletion** has no cache entry to expire. The negative
result — "no such key" — is cached under a key that the addition writes,
so a negative cache under a time-to-live returns "absent" for a present
key until the bound elapses; a deletion under the same regime returns the
deleted value. The hook delivers the delete key as a first-class event.

A **revocation** is the case that decides the argument. A cache holding
"this credential is valid" past the moment the authority revoked it has
converted a replica into a grace period nobody granted, sized to the
average entry's freshness rather than the most sensitive fact the cache
can hold. There is no bound short enough for that fact and long enough to
be worth caching under.

The rule: **when a derivation's staleness can change what a request is
allowed to do, invalidate it from the committed-write stream; a
time-to-live is admissible only for reference data whose worst-case
staleness has been sized against the most sensitive fact the cache can
hold, and the two regimes never share a cache.** The naive reading's
failure is the half-built form: the writer's own node invalidates its
cache in-process and exactly, every other node expires on a timer, and
the system is correct on one node and stale-up-to-the-bound on the rest.

## The dispatcher is a table

Every derivation a node holds is named next to the key prefix that feeds
it ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
the hook's consumer is a dispatcher that, for each prefix that can arrive,
knows which derivation to drop or reload. A derivation absent from the
table is not "uncached"; it is cached forever, and it is the next incident
in the series the golden path describes. A prefix that arrives with no row
in the table is that incident arriving early, and the dispatcher's default
branch — the one every dispatcher has and every author leaves empty —
does the loud thing: drops all derived state, or restarts the node, and
logs the key. Where dropping everything is too expensive to be the routine
answer, that is a reason to fill the table, never a reason to make the
default branch quiet.

## The queue, and stepping down

Between the store applying a batch and the dispatcher finishing with its
keys, the replica holds stale derivations, and the window is the depth of
the invalidation queue. A replica whose **oldest undispatched invalidation
is older than a bound** has a window it cannot vouch for, and it stops
serving reads — forwards everything to the authority — until the queue
drains below the bound, then resumes. The bound is a number with a
predicate (the age of the oldest queued invalidation, measured at the
dispatcher), it is observable per replica, and the step-down is
automatic. A cluster whose replicas can be arbitrarily behind and still
serve has no consistency story at all, whatever the client-carried index
claims, because the index compares against the store's clock and the
cache is behind the store.
