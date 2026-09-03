---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: snapshot-read-plus-verify-log
status: forged
laws: [gate-sees-target, verdict-survives-boundary]
shared_with: []
use_when: [a transaction must span a consensus round trip on a single-writer engine, deciding what a commit entry carries besides its writes, an in-transaction read of a key the transaction already wrote, a write lock held while waiting for a quorum]
---

# Snapshot read plus verify log

The shape of an interactive transaction over a replicated log is fixed by
one prohibition: the embedded engine's single write transaction is never
held while the cluster decides anything. Everything else in this technique
is the arithmetic of what a transaction must carry instead.

## The rule

**When a transaction's writes must pass through a consensus log, open a
read snapshot of the local engine at begin, buffer every write, and ship
one log entry at commit that lists the verifications before the writes;
settle the transaction at apply, under the single writer, by re-checking
every verification and applying the writes only if all of them hold.**
Because the writer is taken only inside apply, where it is taken for every
ordinary entry anyway, a slow quorum costs the transaction latency and
costs the store nothing.

The naive reading is that a transaction *is* an engine write transaction
kept open longer, and it produces a specific incident: a leader proposes an
entry, the quorum stalls, and the engine's only write handle sits open on
that node for the duration. Every other write on the node blocks behind it.
If the node then loses leadership the entry will never be applied, the
handle is released only by whatever timeout the caller happened to set, and
the store has been unavailable for writes for a reason no monitoring
attributes to the transaction. A design that can be taken down by its own
consensus layer has put the lock on the wrong side of the round trip.

## What happens at begin

Begin opens a read-only snapshot of the local engine and records the log
position it corresponds to (the ordering of those two steps is its own
technique). The snapshot is the transaction's whole view of the world: every
read is served from it, so a caller sees one consistent state no matter how
many entries land while it works. Nothing is proposed, nothing is locked;
the snapshot's cost is whatever the engine charges for a long-lived read
view, which for a copy-on-write engine is retained pages and for a
log-structured one is retained versions. A transaction that stays open for
minutes is paying that cost for minutes, and the cap on transaction size is
partly a cap on that.

## What a read produces

A read of a key that the transaction has not written is served from the
snapshot, and the transaction appends a verification: the key and a hash of
the value the snapshot returned, with absence hashed as a distinct value so
that "was empty, now present" is a conflict too. A read of a key the
transaction **has already written** is served from the write buffer, and it
appends nothing - the caller is reading its own pending write, and there is
nothing in storage the answer depended on. That exemption is not an
optimization to be added later; without it the second read of a written key
would append a verification whose hash the apply step cannot reproduce, and
every read-your-own-write transaction would refuse itself. The exemption is
for reads *after* the write; a key that was read and then written keeps the
verification its read produced, because the write was decided on that read.

## What a write produces

A write appends to the buffer and returns. It is invisible to every other
transaction and to every non-transactional reader until apply; the
transaction's own subsequent reads see it, which is what makes the buffer a
write set rather than a queue. A delete is a write of absence. A write of a
key already in the buffer replaces the earlier one - the log entry carries
the final value per key, not the history of the caller's changes of mind.

A write to a key the transaction has **neither read nor written** produces
a verification as well: the snapshot is read for the key's current value,
and the hash of that pre-image joins the verify list before the write joins
the buffer. This is not the caller's read - the caller never asked - but it
is the state the write is replacing, and a blind overwrite that lands after
another transaction's write to the same key has still lost the race. The
rule is what gives the conflict taxonomy its write-write half: two
transactions that never read a key and both write it conflict on the
second commit, exactly as two that read it would. An implementation that
verifies only what the caller read has snapshot isolation's lost-update
anomaly reintroduced through the one path where the caller could not
have known to read first.

## What commit ships

Commit assembles one entry in a fixed order: the verifications first, then
the writes. The order is not a convention; it is what lets the apply step
be a single pass with a single early exit. The entry is proposed like any
other write and the caller waits for it exactly as a caller waits for a
put. An entry is either accepted whole or refused whole, which is what makes
it a transaction rather than a batch: the writes carry no meaning without
the verifications that precede them, and a log that could apply half of one
has no transactions at all.

## What apply does

Apply runs on every node, inside the engine's single write transaction, in
log order. For a transactional entry it walks the verifications, re-reads
each key from the current state - the state as of the entry just before
this one, which is the only state that is the same on every node - and
compares the hash. On the first mismatch it marks the entry refused and
skips the writes; on none, it applies the writes in the same engine
transaction, so the refuse-or-apply decision and the writes it guards are
one durable unit. The verdict is recorded against the entry, and the node
that proposed it turns the verdict into the caller's commit result. A
follower reaches the same verdict from the same entry against the same
prior state; nothing about the decision is local to the leader.

Two things the apply step must observe follow from
[gate-sees-target](../../../../_laws.md#gate-sees-target). It verifies
against the engine's current state, not against any cache above the engine,
because the cache is a proxy that diverges exactly when another entry has
just changed the key. And it verifies the whole list before applying any
write, because a partially applied entry that then refuses is a torn state
the log will replay on every node.

## The verdict crosses the boundary typed

A refused entry is not an error in the log - the log accepted and applied it,
and its effect was "no writes". The refusal exists as a verdict attached to
the entry, and it has to travel from apply, through the proposal's result
channel, to the caller's commit call as a distinguishable value
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A commit that reports a conflict as a generic write failure has told the
caller nothing it can act on; the caller's retry discipline branches on the
class, and this is the one class it retries. The wire between apply and the
caller is where that classification most often dies, because it is an
internal channel nobody thinks of as an interface.

## Decision rules

When the engine admits one writer and the write path is a consensus round
trip, never take the writer before apply - the latency of the round trip is
the caller's to bear, the availability of the writer is everyone's. When a
read is served from the write buffer, append no verification; when it is
served from the snapshot, always append one, absence included. When a
transaction would carry more verifications than the entry cap allows, refuse
at commit locally rather than proposing an oversized entry the log will
reject after the round trip. And when a caller does not need a snapshot -
a single put, a single get - do not route it through a transaction: the hash
per read and the entry framing are the price of an invariant, not a default.

## When not to reach for this

Where the engine beneath the log supports concurrent writers with its own
conflict detection, the verify list duplicates what the engine already does
and the right design is to let the engine's transaction be the one that is
applied. Where the store is not replicated at all, the round trip does not
exist and holding the engine's transaction for the caller's duration is
simply the ordinary transaction that neighbour subjects describe. And where
the workload is one-shot batches with no reads between the writes, a plain
batch entry needs no verifications and should not carry the framing.
