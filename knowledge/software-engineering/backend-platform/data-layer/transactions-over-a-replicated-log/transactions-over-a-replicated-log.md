---
layer: golden-path
type: golden-path
subject: transactions-over-a-replicated-log
status: forged
use_when: [building interactive transactions on a store whose writes go through a consensus log, a single-writer embedded engine sits beneath a replicated state machine, read-then-write handlers race and the last writer silently wins, choosing where optimistic conflicts are detected when only one node ever writes]
techniques:
  - snapshot-read-plus-verify-log
  - capture-index-before-snapshot
  - list-verification-by-present-keys
  - no-writes-no-log
  - same-value-still-conflicts
  - compose-then-conform
  - live-file-is-the-snapshot
---

# Transactions over a replicated log

A replicated state machine gives every node the same store by giving every
node the same sequence of writes. That sequence is a log; a consensus
protocol decides its order; each node applies entries in that order to an
embedded engine it owns. The arrangement is the standard way to make a
key-value store survive a node, and it has one property that decides
everything in this subject: **the only writer is the log.** A node never
mutates its engine directly. It proposes an entry, waits for a quorum to
accept it, and then applies it - on the leader and on every follower alike
- inside the one write transaction the embedded engine allows at a time.

The subject exists because callers want more than one-shot puts. A handler
that reads a record, decides, and writes back is the commonest shape in any
server, and over a replicated log it is broken by default: the read happens
on a local snapshot at some log position, the write is proposed later, and
between them any number of entries may have landed on the same key. The
last writer wins and nothing says so. Application code answers this with a
transaction - several reads and writes that either all happened against one
consistent state or did not happen - and this subject is how to build that
transaction when the engine underneath admits one writer, the write path is
a consensus round trip, and both facts are non-negotiable.

## The stance: verify at apply, never lock across the round trip

A principal engineer holds three things true here, and the first rules out
the obvious design. The obvious design is to open the engine's write
transaction when the caller begins, hold it while the caller reads and
writes, propose the batch, and commit the engine transaction when consensus
returns. It gives serializability for free, because the single writer *is*
a global lock. It is also the design that turns every consensus hiccup into
a store-wide outage: a slow quorum, a leader election, a partition - each
one leaves the engine's only write transaction open for as long as the
round trip takes, and every other write on the node queues behind it. Worse,
the lock is held on one node while the decision is made by a majority of
others; a transaction that loses leadership mid-flight holds a lock that no
committed entry will ever release. **The single writer is never held across
a consensus round trip.** That sentence is the whole subject's first law,
and every technique below is a consequence of respecting it.

The second truth follows: if the writer is not held, the transaction's reads
are optimistic, and something must decide at commit whether they are still
true. The place to decide is the one point where the whole cluster agrees on
state - the apply step. A transaction opens a read snapshot of the local
engine at begin, buffers its writes, and at commit ships a single log entry
that carries two lists: what it read, as hashes, and what it writes. When
the entry reaches the state machine, the apply step re-reads every verified
key under the single writer, compares hashes, and either applies the writes
or refuses the entry as a whole. This is backward validation from the
optimistic-concurrency literature with one twist the literature does not
need: the validation runs inside the replicated apply, so it is executed
identically on every node from the same entry, and the verdict is part of
the log rather than a local decision one node made. The mechanism is
[snapshot-read-plus-verify-log](./techniques/snapshot-read-plus-verify-log.md).

The third truth is that only one node writes cluster-wide. That is what
makes the design cheap. There is no distributed lock to take, no
two-phase commit across participants, no timestamp oracle: the log's order
is the serialization order, and the apply step on the leader is the only
place a conflict can be detected, because it is the only place where "the
current state" is unambiguous. A follower applying the same entry reaches
the same verdict by construction. Systems that treat the replicated store
as a remote database and reach for the distributed-transaction toolkit have
paid for a problem they do not have.

## What a conflict is, and what it is not

The verify list is a set of (key, hash-of-what-I-read) pairs. At apply, a
pair whose hash no longer matches the stored value is a conflict, and a
conflict refuses the whole entry. Three distinctions keep this honest.

A conflict is on the **key, not on the value**. A transaction that read a
record and now finds it changed has lost, even if the change is to the
value it was about to write itself, even if the two transactions would
have produced the same final state. Its other writes were decided on the
stale read; letting one write through because it happens to be idempotent
is how a "harmless merge" corrupts an invariant nobody was looking at.
First committer wins on the key - and a write to a key the transaction
never read is verified against the value it replaces, so the rule covers
two blind writers as fully as two readers. The rule and the error vocabulary that
carries it - three sentinels, exactly one of them client-retryable - are
[same-value-still-conflicts](./techniques/same-value-still-conflicts.md).

A conflict is decided by the **hash, never by a cheaper signal**. An engine
that tracks which keys were touched since a given log position can say
"possibly modified" fast; that signal is a filter that lets most entries
skip the re-read, and it is never a verdict, because a key touched and
restored to its old value is not a conflict and a key the filter missed is
still one. The position the filter is keyed on has to be captured before
the read snapshot opens, not after, or the transaction claims to have seen
entries it did not; that ordering rule, and why the safe direction of error
is conservative, is
[capture-index-before-snapshot](./techniques/capture-index-before-snapshot.md).

A **list** is read state too, and the naive hash of a list is the one thing
that does not survive the apply step. The caller sees a list after the
transaction's own buffered writes have been reconciled into it - keys it
added appear, keys it deleted vanish. The apply step has no write buffer; it
can only re-execute the list against storage. So the verification hashes
what storage returned, with the bounds storage was actually asked for, and
the reconciled view the caller saw is never hashed at all. That rule, and
the limit arithmetic it forces, is
[list-verification-by-present-keys](./techniques/list-verification-by-present-keys.md).

## The transaction that touches nothing leaves no trace

A transaction whose write buffer is empty at commit - because it was opened
read-only, or because the caller decided not to write - never enters the
log. It does not propose an entry, it does not invalidate any cache above
it, it cannot conflict another transaction and no other transaction can
conflict it. This holds even when a verification would have failed had it
been shipped: with nothing to write, there is nothing the stale read could
corrupt, and the reads were already a consistent snapshot on their own. The
reason this needs stating is that the opposite instinct is strong - "commit
should tell me if what I read has changed" - and acting on it turns every
read into a log entry, serializes reads behind the single writer, and
makes the read path fail with a conflict error that has nothing to retry.
[no-writes-no-log](./techniques/no-writes-no-log.md) draws the line, including
the one thing a caller loses and must be told about.

## The cost is stated, and the shape is stated with it

Every verified read adds one hash to the log entry, so the log grows with
the transaction's read set; every list adds one hash per list call. The
transaction's total size is capped, and the cap is stated as a multiple of
the store's single-entry limit rather than chosen fresh. Write transactions
serialize behind the global writer at apply time exactly as single puts do,
so a transaction that does a great deal of work between begin and commit
does not hold anything, but a system that routes every write through a
transaction has bought a hash per read for nothing. The honest guidance is
the one a principal engineer gives about any optimistic scheme: interactive
transactions are for the read-then-write invariants that would otherwise be
lost updates, not for every write, and a store that offers them says so at
the interface.

## Wrappers compose, and the composition is proven, not assumed

A storage interface in a real server is never one implementation. It is a
stack: a cache above the engine, an encoding layer that prefixes or
transforms keys, a view that scopes a caller to a prefix, a fault injector
in tests, and several engines beneath - the replicated one, a relational
one, an in-memory one, a file one. Each layer that offers a transaction
handle must offer it in a way that composes: a transaction opened through
the cache must see the cache's contract, a transaction through a view must
stay inside its prefix, and every one of them must behave identically to
the same operations run outside a transaction. Nothing in a compiler checks
this. What checks it is a differential conformance suite - one set of
operation sequences, some scripted and some random, run on every backend
and through every wrapper, in and out of a transaction, diffed at the first
divergence. The one divergence the suite tolerates is declared by name; a
transaction that is neither committed nor rolled back is caught by a
finalizer that logs where it was born. That discipline is
[compose-then-conform](./techniques/compose-then-conform.md).

## The store beneath the log is its own snapshot

The same fact that makes the read snapshot cheap - the engine is a durable
file the node already owns - makes the consensus library's snapshot model
wrong for it. That model assumes a state machine in memory, serialized to
disk every so often so the log can be truncated behind it and a lagging
follower can be brought level, then read back and replayed over at
startup. Here the file is already the serialized state at the applied
index, so the store reports it as the one snapshot under one constant
identifier, writes no data when asked to snapshot, streams straight out
of a read transaction, installs a received snapshot by renaming over the
live file under the state machine's lock, and owns log truncation itself,
counting from the log store and the applied index rather than from
"entries since the last snapshot". A consensus snapshot is compaction and
catch-up with no history, which is what keeps it in this subject rather
than with the durable versions a reader can inspect, compare and return
to. [live-file-is-the-snapshot](./techniques/live-file-is-the-snapshot.md)
carries the choices and the two guards - restore-on-start and batched
restore - that a naive rename forgets.

## Boundaries

The [data-access](../data-access/data-access.md) neighbour owns the unit of
work: who opens the boundary, how repository operations compose inside it,
why side effects wait for commit, and how a caller retries a closure that
lost a serialization verdict. Its
[transactions-and-units-of-work](../data-access/techniques/transactions-and-units-of-work.md)
assumes an engine that already has transactions and asks how application
code should use them. This subject sits one layer down and asks how the
engine gets them when it is an embedded single-writer store beneath a
consensus log - the snapshot, the verify list, the apply-time verdict, the
conflict taxonomy. The rule a reader uses to pick: if the question is *how
should my handler use a transaction*, go there; if the question is *why does
commit return a conflict, what was hashed, and what does the apply step
re-check*, it is here. The commit-failure sentinel this subject defines is
exactly the classified verdict that neighbour's retry rule expects to
branch on; the two documents meet at that value.

The same neighbour's
[cross-driver-invariant-parity](../data-access/techniques/cross-driver-invariant-parity.md)
owns the general problem of two engines behind one interface - naming
invariants above the drivers, substituting a derived identity where a
constraint cannot exist, running one parity suite twice. This subject's
conformance suite is that discipline specialized to a storage interface
with transactions and a wrapper stack: the parity axis is the operation
sequence itself, the drivers are every backend and every wrapper, and the
suite is differential rather than assertion-based because the invariant
being held equal is "the same trace produces the same state" rather than a
short list of named properties. When the question is which invariants to
name, read theirs; when the question is how to prove a transaction behaves
the same through a cache as through the bare engine, read this.

[embedded-db](../embedded-db/embedded-db.md) owns operating the engine
itself - its journal contract, its pool, its single-writer directory
discipline across processes, its maintenance windows. This subject takes
the single-writer fact from there as a given and builds above it; the
reason the writer must not be held across the round trip is the same
reason that neighbour gives for keeping the writer's holder short, applied
to a caller that happens to be a consensus protocol. When the store misbehaves,
their diagnosis order applies first; when the store is healthy and commit
refuses, the reason is here.

[versioning-snapshots](../../../operations/governance-and-records/versioning-snapshots/versioning-snapshots.md)
owns the snapshot that is a promise about the past - identity minted
once, live state never overwritten, a thin history a reader can inspect,
compare and return to later. The consensus snapshot in this subject is
none of those things: one constant identifier, overwritten by every
install, kept so the log can be truncated and a follower can catch up.
The rule a reader uses: if the artifact can be inspected, compared or
returned to later, it is theirs; if it exists so the log can be cut and
a follower brought level, it is here.

## The techniques

- [snapshot-read-plus-verify-log](./techniques/snapshot-read-plus-verify-log.md)
  - the read snapshot at begin, the buffered writes, the verify-then-write
  entry settled at apply, and why the single writer is never held across
  the round trip.
- [capture-index-before-snapshot](./techniques/capture-index-before-snapshot.md)
  - the log position a transaction claims to have seen is taken before the
  snapshot opens, never after.
- [list-verification-by-present-keys](./techniques/list-verification-by-present-keys.md)
  - hash what storage returned for a list, never the reconciled view, and
  the limit arithmetic that makes the two differ.
- [no-writes-no-log](./techniques/no-writes-no-log.md) - a transaction with
  an empty write buffer never enters the log, invalidates nothing, and
  conflicts nothing.
- [same-value-still-conflicts](./techniques/same-value-still-conflicts.md) -
  first committer wins on the key; the fast signal narrows and the hash
  decides; three sentinels and the one that is retryable; the cost stated.
- [compose-then-conform](./techniques/compose-then-conform.md) - every wrapper
  re-enters the differential suite in and out of a transaction, random
  sequences diffed at first divergence, the tolerated divergence declared,
  the leaked transaction caught at its finalizer.
- [live-file-is-the-snapshot](./techniques/live-file-is-the-snapshot.md) -
  the durable store reports itself as the one snapshot at the applied
  index; the library's truncation and restore-on-start are off and
  truncation is re-owned; install is a locked atomic rename that caches
  node-local state and reopens the old file on failure; restore commits in
  batches derived from the engine's dirty-page behaviour.
