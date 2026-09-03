---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: transient-upgrade-entry
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [replicas must survive a key rotation without being re-unsealed, a replica holds a stale keyring or a stale root after the leader rotated, deciding how long a key-under-old-key entry may live, a leadership failover inside a rotation window]
stage: multi-service
---

# Transient upgrade entry

A replica holds, in memory, the keys it had when it unsealed: the root it
recovered from its seal and the keyring it read under that root. The leader
rotates without asking it. After a data-key rotation the replica lacks term
N+1 and cannot read anything written since; after a root rotation it cannot
read the keyring at all. It is still unsealed, still serving reads from the
keys it has, and unable to lead, because leading means writing under the
current term. Re-unsealing every replica after every rotation puts the seal
custody, a key service or a room of share holders, into a path that must be
automatic and must not wait. The technique is a bridge from the keys a
replica already holds to the keys it lacks, written by the leader, read by
the replica on a short periodic check, and shaped by which key the bridge is
encrypted under.

## The entry: term N+1 under term N

When the leader installs term N+1, it writes one extra object: the new term's
key, serialized, encrypted under the key of term N, stored under a name that
carries N. A replica at term N checks for an entry addressed to its active
term; on finding one it decrypts the new key with the term key it has,
appends it to its in-memory keyring, and is current without any custody
having been consulted. The check loops: two rotations inside one window
leave N+1 under N and N+2 under N+1, and a replica that installs one entry
per check is deleted out from under before it reaches the second. Loop until
no entry is addressed to the term now held.

This is the seal door opening once more, under the old key, for a bounded
window, and the property that makes it dangerous is exactly its usefulness:
term N's key, which the rotation has just retired from writing, can now reach
term N+1's data. If term N was rotated because it was suspected, the entry
extends the suspect key's reach to everything written after it. So the entry
is **transient**, and its lifetime is declared when it is written
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): the
leader schedules its deletion at a fixed grace period, minutes not hours,
long enough for every replica's check interval to elapse more than once and
short enough that a retired key's reach ends before anyone thinks to use it.
The decision rule: when the replica check interval is I, the grace period is
a small multiple of I, because a replica that misses one check must catch
the next, and one that misses several is partitioned from storage and will
not be elected anyway. The naive reading leaves the entry until the next
rotation "for late replicas"; a late replica has a correct path, which is to
unseal, and a permanent entry makes every retired term a permanent way into
the current one.

A leader that dies inside the window leaves the entry behind. The next
leader, on taking leadership, lists the upgrade entries that exist and
schedules their deletion at the same grace period, so a failover mid-window
delays the reaping by one window and never cancels it. Deletion is
idempotent; the replica that installed the entry and the leader that reaps it
need no agreement.

## The bridge for the root: new root under the latest term

The root rotates less often and the bridge for it is a different shape. The
leader stores the new root encrypted under the **latest keyring term**, and
keeps that entry permanently. A replica that holds the keyring, which it does
if it has followed the term upgrades, decrypts the new root with a term key
it already has, installs it, and re-reads the keyring under it. The entry is
not transient because it discloses nothing: the keyring is wrapped by the
root and the serialized keyring carries the root inside it, so any party
holding the keyring already holds the root, and encrypting the root under the
keyring's newest term gives that party nothing it lacked. What the entry
buys is ordering. A replica performs its periodic check in a fixed sequence:
term upgrades first, so it holds the newest term; then the root under that
term, so it holds the newest root; then the keyring under that root, so it
holds everything. Run out of order, the sequence fails at whichever key is
stale, and the failure is not corruption but a replica that reports itself
as needing unseal.

The two bridges together are the rule of the technique. When a key must be
handed to a party that holds an older key of the **same layer**, the entry
is transient, because it extends a retired key's reach; when a key is
handed under a key of the layer **beneath** it, which that key already
protects, the entry may be permanent, because it extends no reach at all. A
design that makes the term upgrade permanent has weakened rotation; a design
that makes the root bridge transient has replicas that cannot follow a root
rotation performed while they were briefly unreachable.

## What the entries are not

Neither is a way for a node that never unsealed to become unsealed: a node
holding no term and no root has nothing to decrypt either entry with, and an
entry readable without a key would be a key in plaintext. Neither is
catch-up storage of unbounded age: a replica down longer than the grace
period has missed the transient entry and is re-unsealed, and the technique
is honest that the automatic path has a bound. And neither is a mechanism
for the seal layer: a seal that was offline during a root rotation still
holds an encryption of the old root, and bringing it current is the seal
plurality's problem, solved by per-seal copies of the keyring and the latest
root rather than by a shared transient entry.
