---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: capture-index-before-snapshot
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [a transaction records the log position it observed, a fast modified-since check keyed on a log index, a snapshot and an index read in the wrong order, deciding which direction of ordering error is safe]
---

# Capture the index before the snapshot

A transaction over a replicated log carries a claim about time: *my reads
are as of log position N.* The claim is used by whatever narrows
verification later - a filter that says which keys were touched after N -
and a claim that overstates N is a claim the store cannot check and will
believe. The technique is about which of two adjacent operations comes
first, and it exists because the wrong order is the natural one.

## The rule

**When a transaction records the log index it observed, read the index
before opening the read snapshot, never after.** The snapshot then reflects
every entry up to at least that index, and possibly more; the claim is a
floor on what the transaction saw, which is the direction that stays safe.

The naive reading opens the snapshot first, because the snapshot is the
thing the transaction is about, and then asks the log "where are we" to
label it. Between the two steps the apply loop may land an entry. The label
is now N+1 while the snapshot's contents are as of N. Any later reasoning
that uses the label - "this key was last modified at N+1, which is not
after my index, so my read of it is current" - concludes that the
transaction saw a write it did not see. The verification hash still catches
the mismatch if the key is verified in full, which is why the fast path
must never be the only path; but a filter that skips the full check on the
strength of the index has just skipped it for exactly the key that changed.

## Why the safe error is the conservative one

With the index captured first, the failure is symmetric and harmless. An
entry may land between reading the index and opening the snapshot, so the
snapshot may contain writes at N+1 that the transaction claims not to have
seen. A modified-since filter keyed on N will then flag those keys as
possibly modified and send them to the full hash check, which finds the
hash matches - the transaction did see the write after all - and passes.
The cost is one unnecessary re-read at apply. The other order's cost is a
lost update with no error. When an ordering can only be wrong in one of two
directions, choose the direction whose wrongness produces extra work rather
than silent acceptance; this is the same reasoning that makes a clock skew
tolerable when it makes leases expire early and fatal when it makes them
expire late.

## The index is a fact about the apply loop, not about the log

The position to record is the last index the local apply loop has finished
applying to the engine - the applied index - not the last index the node
has received or the last the leader has committed. A follower may have
entries in its log that it has not yet applied, and the engine snapshot
reflects only applied entries. Recording the committed index instead of
the applied one is the same overstatement as the wrong order, made
permanent. The reading has to come from the component that owns the
snapshot's contents, and it has to be the value that component last
finished, not the one it is working on.

This is where [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
applies. A node that cannot say what it has applied - because the apply
loop's counter is not yet initialized, or because a restore is in progress
and the counter is stale - must not report zero and must not report the
log's tail; both are definite values standing in for "unknown", and a
transaction opened against either will label its reads with a time that is
a fiction. The correct behaviour is to refuse to open the transaction until
the applied index is known.

## How the index is used, and the limit of its authority

The recorded index is the key of the fast path. At apply, the state machine
may keep a bounded record of which keys each recent entry touched; for a
transactional entry it asks, for every verification, whether the key
appears in any entry after the transaction's index. If not, the key cannot
have changed and the full hash check is skipped. If so, or if the record
does not reach back far enough to answer, the full check runs. The index
therefore decides how much work verification does, never whether a
verification passes - that authority stays with the hash alone, and
[same-value-still-conflicts](./same-value-still-conflicts.md) is where the
division is stated as a rule.

The record is bounded by the transactions that can still use it: it is
pruned below the lowest begin index among open transactions, which each
transaction registers at begin and releases at commit or rollback. That
floor has its own ordering hazard, the mirror of this technique's: a
transaction that begins between the floor's computation and its use has
an index the pruning did not see. The floor is therefore capped by the
applied index at the moment it is computed, so a concurrent begin can
only sit at or above it. A transaction that stays open long enough for
its index to fall below whatever the record retains loses the fast path
entirely and every verification runs in full. That is correct, and it is
the second reason transaction lifetime is capped.

## Decision rules

When two adjacent reads label the same moment, order them so the label is a
floor, not a ceiling, on what the labelled thing contains. When the fast
path cannot answer - index unknown, record too short, index older than the
record - fall through to the full check rather than to a pass. When the
component that owns the snapshot cannot state its applied index, refuse
begin rather than substituting any number. And when reviewing a transaction
implementation, find the two lines - the index read and the snapshot open -
and check their order; the defect is one line long and survives every test
that does not race the apply loop.

## When not to reach for this

Where no fast path is keyed on the index and every verification runs in
full, the order is still the correct one but nothing depends on it, and the
technique is a hygiene rule rather than a correctness one. Where the
transaction is read-only and never commits, the index is recorded and never
consulted.
