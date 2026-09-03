---
layer: technique
type: technique
subject: read-serving-replicas
technique: evict-not-update-on-commit
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [choosing what a cache does when it hears a commit, a cache entry is stale until the next write to the same key, deciding which log index a replica reports as its position, a freshness check passes while the cache still holds the old value]
---

# Evict, not update, on commit

A cache that hears about a commit has two moves: write the new value into
the entry, or remove the entry and let the next read refill it. Under a
global lock — one writer, all readers excluded during the commit — either
works. Read-serving replicas have no such lock: readers on the replica run
concurrently with the log applying batches and with the invalidation hook
dispatching keys, and under that concurrency only removal is correct, and
even removal needs a guard. The second half of the technique is about what
the replica *says* its position is, because the cache's honesty and the
reported index are the same fact seen from two sides.

## Update loses a race it cannot see

Take a lookaside cache: reader misses, reads the store, fills the entry.
Now interleave a commit. Reader R reads the store at a moment the old
value is current. The batch applies; the hook fires; the cache *updates*
the entry to the new value. R, which has been holding the old value since
before the commit, now fills the entry — and the new value is overwritten
with the old one, indefinitely, because no further commit to that key is
coming. The update path has no way to detect this: it saw the new value
and wrote it; R saw the old value and wrote it; the cache holds whichever
came last, and "last" was decided by scheduler timing. Updating on commit
also demands that the invalidation stream carry values, which the hook
technique refuses for its own reasons.

Eviction narrows the race but does not close it. Same interleaving: R
reads old; commit; hook evicts (nothing to evict yet, or evicts a
previous fill); R fills with old. The entry is stale until the next write
to that key. The difference from update is that eviction cannot *create*
the stale entry from the invalidation's own data — but a concurrent reader
still can. So eviction is the only correct move of the two, and it is
correct only with a **fill fence**, which takes one of two shapes. The
epoch shape: the cache records, at the start of a miss, the invalidation
epoch (a per-cache counter the hook bumps, or the invalidated index), and
a fill whose epoch is older than the current one is discarded rather than
stored; R's fill, begun before the commit, carries a stale epoch and is
dropped. The lock shape: the miss holds a per-key reader lock across
read-and-fill, and the eviction takes the same key's writer lock, so an
eviction that arrives mid-miss waits for the fill to land and then removes
it. Both close the race; the lock shape costs nothing to reason about but
serialises evictions behind slow misses on the same key, and the epoch
shape lets the eviction proceed and wastes the fill instead. Either way
the next reader misses, reads the new value, and fills clean.

The rule: **on hearing a commit, remove the entry and never write the
new value into it; fence every fill with the epoch at which its read
began, and drop a fill whose epoch has moved, because a reader that
started before the commit can otherwise repave the eviction with the value
the commit replaced.** The naive reading's failure mode is the one that
looks like success: an update-on-commit cache is correct on every test
that does not race, and the stale entry it eventually produces is
attributed to "the cache" in general rather than to the one interleaving
that produces it.

## Which index the replica reports

The consensus layer has a number for the last log entry it received and
acknowledged. The state machine has a number for the last entry it applied
to the store. The dispatcher has a number for the last entry whose keys it
finished routing. These advance in that order, and the gaps between them
are the windows in which the replica's store, or its cache, is behind what
the cluster has decided.

A replica that reports the first number as its position is claiming
freshness it does not have: a client asking "are you at least at index N"
gets *yes* while the store has not applied N and the cache has not heard
of it, and the request the check existed to catch sails through
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Reporting the
accepted index is also a subtler error: it renders "I do not yet know the
effect of N" as "N is in effect", which is the unknown laundered into a
definite value at the exact boundary where the definite value is trusted
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The rule: **a replica reports as its position the index after which every
derivation has been invalidated — the dispatcher's number, never the
consensus layer's — and any consistency check a client can make compares
against that number.** In a design where the hook runs synchronously at
the end of apply, the applied and invalidated indexes coincide and the
state machine's number is the honest one. In a design where the hook
enqueues and a dispatcher drains, they do not, and the drained index is
what the replica advertises. Either way the log library's own counter is
never the answer, and a metric or header that exposes it under the name
"index" is the bug that produces stale reads with a green consistency
check.

## The refill is a read, and reads are the replica's

After eviction the next read of that key is a miss, and the miss goes to
the replica's own store — not to the authority. This is what makes the
whole subject worth having: invalidation costs a key-sized message and a
local refill, where update-on-commit would cost a value-sized message per
replica per write. A cache that "refreshes from the leader" on eviction
has turned every invalidation into a cross-node read and every write into
N of them, which is the write-amplification of a replicated cache with the
consistency of a lookaside one. Refill locally, from the store the log
keeps current, and let the client-carried index handle the one case where
local is not fresh enough.
