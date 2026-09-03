---
layer: technique
type: technique
subject: transactions-over-a-replicated-log
technique: live-file-is-the-snapshot
status: forged
laws: [unknown-is-not-a-value, creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [a durable single-writer engine sits beneath a consensus log and the log library wants periodic snapshots, a node replays its whole log at startup although its store was already current, installing a snapshot received from a leader onto a node whose store is a file, choosing the batch size for restoring a large snapshot into a copy-on-write engine, deciding who truncates the log when the snapshot never changes]
---

# The live file is the snapshot

A consensus library is written for a state machine that lives in memory.
Its snapshot machinery follows from that assumption: every so often the
library asks the state machine to serialize itself, writes the result to
stable storage, records the index it covers, and truncates the log behind
it; at startup it reads the newest snapshot back into the state machine and
replays the entries after it. A snapshot in this sense is not a record of
the past. It is a compaction device and a catch-up device - the thing that
lets the log be cut and lets a follower that fell too far behind be brought
level without replaying from the beginning - and nothing about it is meant
to be inspected, compared or returned to. When the state machine beneath
the log is itself a durable single-writer store, every one of the library's
assumptions is false at once, and the technique is the set of choices that
follow from noticing.

## The rule

**When the state machine under a replicated log is a durable single-writer
store, the live data file is the snapshot: the snapshot store reports
exactly one snapshot, under one constant identifier, at the index the store
has applied, and a startup never replays the log; the library's own
snapshot-driven truncation and restore-on-start are switched off; taking a
snapshot writes no data; streaming one reads straight out of a read
transaction on the live store; and installing one is an atomic rename over
the live file with the state machine locked.** The store is already the
serialized state at the applied index. Serializing it again produces a
second copy of a file that exists, and reading it back at startup replays
entries into a store that already contains their effects.

The naive reading leaves the library's defaults in place because they
work, and they do work, expensively and then wrongly. Expensively: every
snapshot interval the store is dumped in full to a second file, doubling
write traffic for a copy nobody will read. Wrongly, in two ways. The
library counts entries since the last snapshot to decide when to truncate;
the store's "last snapshot" is always the applied index, so the counter
resets on every restart and truncation fires only when more than the
threshold lands between two restarts - a log that grows without bound on a
node that restarts often. And at startup the library restores the newest
snapshot into the state machine and replays the tail of the log after it,
applying entries whose effects are already in the file; for idempotent puts
that is wasted time proportional to the log, and for anything that is not
idempotent - a counter, an append, a transactional entry whose
verifications now fail against state that already includes its writes - it
is corruption.

## What the snapshot store reports

The snapshot store's list operation is the library's view of where
compaction stands, and it answers from the store's own applied index and
configuration, not from any file on disk: one snapshot, whose identifier is
the same constant every time, whose index and term are the last the state
machine finished applying, and whose cluster configuration is the last the
state machine witnessed. The library then believes, correctly, that
everything up to the applied index is compacted, and a restart begins
applying at the entry after it.

The one case the report must not invent is the empty store. A state machine
that has applied nothing has an applied index of zero, and a snapshot "at
index zero" is a definite claim about a moment that never existed
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)); the
list returns no snapshot at all, and an open of the constant identifier
against an empty store refuses rather than streaming nothing.

## Taking a snapshot writes no data, and still writes something

When the library asks the state machine for a snapshot, the answer is an
object whose persist step copies no entries. It is not entirely a no-op. The
library hands the sink the index, term and cluster configuration it is
snapshotting at, and some of those values belong to entries the state
machine never saw - a configuration change is applied by the library, not
by the state machine - so the persist step writes that metadata into the
store and advances the applied index the store reports to match. Without
this the store's report would lag the library's on exactly the entries that
do not pass through apply, the list would name an index earlier than the
true one, and the library would replay from there at every start. A
snapshot request therefore fast-forwards the store's idea of "applied" to
the library's; it is the only path by which entries invisible to the state
machine become part of its position.

## Streaming out reads the live store

A leader that must bring a lagging follower level opens the snapshot by the
constant identifier and streams it. The stream is a read transaction on the
live store, walked once for its size and once for its contents - the
library wants the size before the bytes - inside a read lock on the state
machine so that no install replaces the file underneath the walk. Ordinary
writes proceed; a copy-on-write engine serves the read transaction from
retained pages exactly as it serves a long-lived read snapshot for an
interactive transaction, and the cost is the same retained-page cost that
the sibling techniques in this subject already pay for.

## Installing is a rename, and the store reaps to one

A snapshot arriving from a leader is written by the store's sink into a
fresh engine file in a temporary directory, entry by entry as the stream
is parsed; a successful close renames the temporary directory to its final
name and a failed one removes it. The install then closes the live store,
renames the new file over the live file, and reopens. The rename is the
whole atomicity: the live file is at every instant either the old store or
the new one, and a crash between close and reopen leaves a file that opens.

The install runs with the state machine's lock held exclusively - no read
or write reaches the store while the file is swapped - and it carries three
obligations that the naive rename forgets. Node-local state that lives in
the file but belongs to this node and not to the cluster (the node's own
desired voting status is the canonical case) is read out before the file is
closed and written back after the new file is opened, because the snapshot
came from another node and carries that node's local state, not this one's.
An install whose rename fails reopens the *old* file regardless, so that a
node which could not take the snapshot keeps serving what it had rather
than sitting with no store at all; the error is returned, the store is not
lost. And the snapshot directory names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the
store deletes every snapshot directory it finds at startup and again before
each new sink begins writing, warning about any that carry the temporary
suffix because those are the residue of a failed install, so that at most
one snapshot file exists on disk at a time and a disk that was sized for
one store does not fill with two.

## Restore into the engine commits in bounded batches

The sink writes a streamed snapshot into a fresh engine file, and the
engine is the same single-writer copy-on-write store as the live one. Such
an engine holds every dirty page of an open write transaction in memory and
splits pages only at commit; a restore that puts every entry inside one
write transaction holds the whole snapshot's worth of dirty pages until the
end, and a snapshot larger than memory fails at the moment it is nearly
complete. So the sink commits every N entries and opens a new write
transaction for the next N. N is derived from that behaviour, not chosen:
it is the number of entries whose dirty pages the process is willing to
hold at once, and it is stated in the code with the reason - "the engine
holds all data in memory until commit" - so that a reader who moves to an
engine that streams pages to disk knows the batch can go, and a reader who
raises it knows what they are trading
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
Tens of thousands of entries per batch is the working range for the
engines this shape is built on; the number is less important than its
sentence.

## Truncation moves to the application

Switching off the library's snapshot-driven truncation - threshold,
interval and trailing-log count all set to their maximum, so its counter
can never trigger - does not make the log finite. Something must still cut
it, and the thing that cuts it must count from a fact that survives
restart. The application keeps its own truncation loop on a jittered timer
and at startup, and it counts the entries actually present in the log store
against the store's applied index: when the span from the first retained
entry to the applied index exceeds the threshold plus the trailing count,
it deletes the range up to the applied index minus the trailing count. The
trailing entries are kept for followers that are only slightly behind; a
follower behind by more than that receives the streamed snapshot instead.
The threshold and interval the operator configures are the same knobs the
library offered, read into the application's loop rather than the library's,
so the operator's vocabulary does not change while the counter's basis does.

## Restore-on-start is off, in two places

The library's flag that skips snapshot restore at startup is one guard; the
state machine's own restore method refusing while the node is being
constructed is the other, and both are set. They cover different paths: the
flag governs the ordinary start, while a cluster-recovery start - a
rewritten peer set installed from a file the operator placed - calls
restore through the recovery routine whatever the flag says, and would
install the constant-identifier snapshot over the live file, which is the
live file. The state machine's flag is raised before either path and lowered
once construction returns; a restore that arrives in between is a no-op
that returns success, because the file is already what a restore would
produce.

## The boundary this technique does not cross

A snapshot here is compaction and catch-up with no history: there is only
ever one, it has no identity beyond a constant, and it is overwritten by
the next install. The durable version that a reader can inspect, compare
and return to later belongs to the versioning-snapshots subject, whose
doctrine - mint identity once, never overwrite live state, keep a thin
history - is the opposite of every choice above; the operator-facing
snapshot archive with its integrity check and its refusal to install a
snapshot sealed under a different configuration is the
quorum-and-recovery-procedures subject's guard, applied before this
technique's install is reached.

## Decision rules

When the state machine is a durable store, report its applied index as
the one snapshot and never serialize the store for the library's benefit.
When the applied index is zero, report no snapshot, not a snapshot at
zero. When the library asks for a snapshot, write the metadata it hands
you and no entries, and advance the store's reported index to match. When
installing, lock the state machine, cache node-local state, rename over
the live file, reopen whichever file is there, and re-persist the local
state. When restoring into a copy-on-write engine, commit in batches and
write the batch size next to the reason. When switching off the library's
truncation, own truncation yourself and count from the log store and the
applied index, never from "entries since the last snapshot". And when a
recovery path can reach restore during construction, guard restore in the
state machine and not only in the library's configuration.

## When not to reach for this

Where the state machine really is in memory - a small configuration map, a
membership table - the library's snapshot model is the right one and this
technique is a way to lose the crash recovery it provides. Where the
durable engine supports concurrent writers and its own incremental backup,
streaming a snapshot may be cheaper through that facility than through a
full read-transaction walk, and the install may be a restore rather than a
rename; the rule that the live store reports as the one snapshot still
holds, and the rest is engine-specific.
