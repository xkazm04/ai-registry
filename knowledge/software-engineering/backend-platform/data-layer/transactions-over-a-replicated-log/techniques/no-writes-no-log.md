---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: no-writes-no-log
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [committing a transaction whose write buffer is empty, a read-only transaction expected to detect that its reads went stale, caches above the store invalidated by transaction commits, read traffic appearing in the replicated log]
---

# No writes, no log

A transaction's commit is the moment it proposes an entry. The entry
exists to make writes atomic with the verifications that justify them; an
entry with no writes justifies nothing. The technique states what commit
does when the write buffer is empty, because two reasonable-sounding
alternatives are both wrong.

## The rule

**When a transaction reaches commit with no buffered writes - because it
was opened read-only, or because the caller wrote nothing - commit is a
local no-op: no entry is proposed, no cache above the store is invalidated,
no other transaction can be conflicted by it, and its own verifications are
discarded unchecked, even the ones that would have failed.** The
transaction's reads were a consistent snapshot on their own; with nothing to
write, there is no stale decision for a conflict to protect, and the
cheapest correct thing is to have never been there.

## The two naive readings

The first proposes the entry anyway, verifications and all, so that commit
"tells the caller whether what it read is still true". Three things go wrong
at once. The log fills with read traffic - every read-only transaction
becomes a durable, replicated entry that every node applies and that
survives in the log until compaction, for the benefit of a verdict nobody
will act on. Reads serialize behind the single writer at apply, so a store
that could serve reads from local snapshots at every node now funnels them
through the leader's apply loop. And the caller receives a conflict error
from a read, which its retry discipline will obediently retry, re-reading
state that will go stale again while the caller holds it; the "failure" is
not a failure of anything the caller did, and reporting it as one is a
success spelled as a failure, the mirror of the empty-success law
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
the caller cannot distinguish "your read is stale" from "your write was
refused" if both arrive as the same sentinel from the same call.

The second reading skips the log but still fires the commit hooks - the
cache invalidation, the write notifier, the metrics - because "a transaction
committed". A cache invalidated on a read is a cache that never warms under
a read-heavy transactional workload; a write notifier fired with an empty
key set makes every subscriber handle a batch that changed nothing; and a
follower's invalidation stream carries phantom commits. The hooks belong to
the entry, and there was no entry.

## What the caller loses, and must be told

A read-only transaction gives the caller a consistent snapshot; it does not
give the caller a guarantee that the snapshot is current at commit. A
caller that needs to know "did anything I read change" has a write to
protect by definition - otherwise the answer changes nothing - and the
correct spelling is to make that write inside the transaction. The interface
states this: a read-only commit succeeds unconditionally, a transaction
that writes is verified, and a caller wanting a read-only assertion of
currency has misread the contract. Where an implementation exposes the
verification result of a read-only commit at all, it exposes it as
information rather than as a refusal.

## What the transaction still does

The read snapshot was opened and holds engine resources; commit releases
it, exactly as rollback does. The transaction is marked finished so that a
later operation on it fails with the already-finished sentinel. The birth
record kept for leak detection is cleared. Nothing about being read-only
exempts the transaction from being closed, and a read-only transaction left
open holds a snapshot as long as any other.

## Decision rules

When the write buffer is empty at commit, do not propose, do not
invalidate, do not notify; release the snapshot and finish. When a caller
opens a transaction to detect staleness without writing, refuse the design
in review: the write it is protecting either exists or the check is
decorative. When commit hooks are wired, wire them to the applied entry
and not to the commit call, so the empty case falls out of the structure
rather than from a guard. And when measuring transaction traffic in the
log, count entries, not commits - the two differ by exactly the read-only
population.

## When not to reach for this

Where a write-only entry with no verifications is legitimately empty - a
batch that was filtered to nothing - the same rule applies for the same
reason, and a batch put of zero keys is likewise a local no-op. Where the
transaction was explicitly opened as writable and the caller's intent was
to write but a prior error aborted the path, rollback is the correct call
and commit's no-op is a convenience the caller should not rely on for
cleanup.
