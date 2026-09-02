---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: same-value-still-conflicts
status: forged
laws: [verdict-survives-boundary, count-carries-predicate]
shared_with: []
use_when: [two transactions write the same new value to one key, a modified-since fast path proposed as the conflict check, choosing the error vocabulary a transaction interface returns, stating what a verified read costs the log]
---

# Same value still conflicts

The conflict rule of an optimistic transaction is easy to state and easy to
soften, and every softening is a lost update with a plausible story. The
technique fixes the rule, fixes the one signal allowed to narrow it, and
fixes the vocabulary a caller receives.

## The rule

**First committer wins on the key, not on the value.** A transaction whose
verified read of a key no longer matches the stored value at apply is
refused whole, regardless of whether the new stored value equals what the
transaction was about to write, regardless of whether the transaction's
own write to that key would be a no-op, regardless of whether the final
state would have been identical either way.

The naive reading is that an identical write is harmless and can be
merged: both transactions read the counter at five, both write six, the
second's verification fails on a value it would have produced anyway, and
surely refusing it is pedantry. It is not. The second transaction's
*other* writes were decided on a read set that is now stale; the identical
write is one key of a decision, and the decision as a whole was made
against a state that no longer exists. Two transactions that each read
"no lock holder" and each write "holder: me" produce the same value on the
lock key and must not both succeed. The value equality is a coincidence of
one key; the conflict is about the read. Any implementation that compares
the incoming write to the stored value to decide leniency has replaced the
read-set check with a write-set check and gets exactly the anomalies the
optimistic-concurrency literature named forty years ago.

## The fast signal narrows; only the hash decides

An apply loop can keep a bounded record of which keys each recent entry
wrote, and consult it before re-reading: a key not touched since the
transaction's index cannot have changed, and its verification can be
skipped. That is a filter, and it is worth having - most verifications in a
low-contention workload skip. It is never a verdict, in either direction. A
key that appears in the record may have been written back to the same value
it had, and the hash says so; a key absent from the record because the
record is bounded and the transaction is old has not been cleared, it has
been left unanswered, and unanswered falls through to the hash. The
division is: **the signal may say "no need to check"; only the hash may
say "conflict".** An implementation that refuses on the signal alone refuses
transactions that would have passed; one that passes on the signal alone
has a false-pass window exactly the size of the record's blind spot.

The signal has a whole-transaction form worth having: when the applied
index at apply time equals the index the transaction began at and the
entry is first in its batch, nothing has been applied since the snapshot
was taken and every verification passes without a single re-read. That is
the common case under low contention, and it is the reason a transaction
carries its begin index in the entry at all.

## The three sentinels

A transaction interface returns three distinguishable failure values, and
their meanings are fixed across every backend and wrapper that offers the
interface, because a caller branches on them and a caller that must inspect
message text has been handed no verdict
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

*Read-only* is returned when a write is attempted on a transaction opened
for reading. It is a programming error at the call site, not a state of the
store, and it is never retried.

*Commit failure* is returned when apply refused the entry because a
verification did not hold. It is the only one of the three a client may
retry, and the retry is the whole closure - reads included - because the
reads are what was wrong. It is distinct from every transport, quorum, or
leadership failure a commit can also return; those may or may not have
applied the entry, and a caller treating them as commit failure will replay
a transaction that succeeded. The neighbouring unit-of-work discipline's
idempotency rule covers that gap; this sentinel's contract is that when it
is returned, nothing was applied.

*Already finished* is returned when any operation is attempted on a
transaction that has been committed or rolled back. It exists so that a
handle reused after its end fails loud rather than reading from a released
snapshot or writing to a discarded buffer; it too is never retried.

Every other error a transaction returns is the underlying store's and
carries no transactional meaning. Collapsing the three into one "transaction
error" - or worse, into the store's generic error - is the commonest way
this design is defeated after it ships: the retry loop upstream either
retries everything or nothing.

## The cost, stated

A verified read adds one fixed-size hash plus the key to the log entry, and
a list verification adds one hash plus the query parameters; the entry
grows with the read set, and the log grows with the entry. A transaction is
capped at a fixed multiple of the store's single-entry size limit, and the
multiple is stated as a multiple rather than as a fresh number so that
raising one raises the other and the relationship is visible
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) -
the cap carries what it was derived from). The number of concurrently
open transactions is capped too, by a permit pool taken at begin, because
each open transaction holds a read snapshot and a slot in the fast-path
record; anything sized per transaction above the store - a per-transaction
cache, a tracker map - derives its size from that same cap rather than
choosing one. A transaction's writes apply under the single writer like
any entry, so a transactional write costs the same store time as a put
plus the verifications' re-reads. What a
transaction buys with that is the refusal of a stale decision; a workload
whose writes do not depend on prior reads is paying for nothing, and the
interface documentation says so rather than presenting the transaction as
the default write path.

## Decision rules

When a verification hash mismatches, refuse the entry; do not inspect the
incoming write, do not compare values, do not merge. When a fast signal is
available, use it to skip checks and never to fail them. When designing the
error surface, return the three sentinels as typed values every layer
passes through unchanged, and document that commit failure is the retryable
one and applied nothing. When stating the transaction size cap, express it
as a multiple of the entry cap. When a caller asks for a transaction around
an unconditional write, ask what read it protects.

## When not to reach for this

Where a key is genuinely a commutative accumulator - a counter that only
ever increments, a set that only ever unions - the right tool is a
store-side operation that applies the increment at apply time, not a
read-then-write transaction that will conflict under contention on a key
whose semantics never needed the read. That is a different write shape, and
using transactions for it produces retry storms that look like a bug in the
conflict rule and are a bug in the choice of primitive.
