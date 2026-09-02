---
layer: technique
type: technique
subject: priced-authority
technique: secondary-index-before-primary
status: forged
laws: [creation-names-reaper, deletion-is-not-repair]
shared_with: []
use_when: [ordering the writes that create a token or lease, a crash between writes must not leave a valid unreachable record, choosing what a dangling index entry means on read, designing a tree revocation that must be complete]
---

# Secondary index before primary

Creating a persisted token is several writes, and a server can die between
any two of them. This technique fixes the order so that every partial
outcome is one the system already tolerates, and it names the one outcome
no order may produce: a record that authenticates and that no revocation
walk can reach.

## The writes

A token entry is written under its own identifier - the primary record,
the one a request lookup reads. Around it are the secondary indexes: the
**accessor** entry, a second identifier that maps to the token's
identifier so an operator can revoke or inspect the token without ever
holding it; the **parent** entry, a key under the parent token's
identifier that lists this token as a child so the parent's revocation
finds it; and, where the design has them, per-path and per-role indexes
that make revoke-by-prefix a walk instead of a scan. Each index is a
pointer to the primary, and each exists so that some later operation can
find the primary without knowing its identifier.

## The order

Write every secondary index first. Write the primary record last.

The argument is what a crash leaves behind. If the primary is written
first and the process dies, the store holds a token that validates on
lookup, has no accessor, and is not in its parent's child list. Revoking
the parent - the operator's reflex when a login is found to be compromised
- walks the child list and misses it. Revoking by accessor cannot name it.
It expires when its clock says so and not one moment sooner, and until
then it is authority the ledger does not know it issued. If instead the
indexes are written first and the process dies, the store holds an
accessor that points at nothing and a child-list entry for a token that
does not exist. Every lookup through an index already has to handle
"pointer resolves to no record", because deletion produces the same state
transiently; the dangling entry is noise that a sweep removes, and until
the sweep it authenticates nothing.

The entry, in other words, names its revoker before it exists
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): the
parent link and the accessor are the reaper's handles, and the record is
not allowed to come into being until the handles are durable. A store that
offers atomic multi-key writes makes the question moot for that store, and
the order should still be kept, because the next store may not, and
because the read side's tolerance for a dangling index is a property worth
keeping tested.

## The read side

Because the order guarantees only that a dangling pointer is possible, the
read side treats one as ordinary. A lookup through an accessor that
resolves to no record answers "no such token", not "corrupt index"; a
parent's child list is filtered against the records that exist, and a
child that does not resolve is removed from the list as part of the walk,
not reported as an error. Tidying the indexes is a maintenance sweep with
a clear predicate - an index entry whose target has been absent for longer
than any write could take - and the sweep removes the pointer only. It
never "repairs" by deleting a record it finds without an index; a record
without an index is exactly the escaped token this technique exists to
prevent, and finding one is a finding to report, not an artifact to tidy
([deletion-is-not-repair](../../../_laws.md#deletion-is-not-repair)).

## The way out depends on whether the record is already dead

Deletion is governed by the same invariant - at no instant may a record
authenticate while its revocation handles are gone - and the invariant
yields two orders depending on one fact. Where the record is deleted
outright, the primary goes first and the indexes after: between the two,
a lookup by accessor resolves to nothing, the tolerated state, and a
lookup by identifier fails, which is the intent; the reverse order would
leave, on a crash, a record that still authenticates with its handles
already gone, the escaped token reached from the other side. Where the
record has been **marked** as being revoked before the teardown begins
([write-ahead-revocation-marker](./write-ahead-revocation-marker.md)), it
already authenticates nothing, and the order inverts for a different
reason: the indexes are removed as the teardown proceeds and the primary
is deleted last, as the commit of the whole teardown, so that a teardown
that fails halfway still has a record to resume from. The rule beneath
both orders is the same: the last write of a deletion is the one that
makes the record unrecoverable, and it happens only when nothing else
depends on the record.

## Decision rule

When a record can be reached by more than one key and one of those keys is
how it will be revoked, write the revocation keys before the record and
delete the record before the keys, because a pointer to nothing is a state
every reader already tolerates and a record with no pointer is authority
outside the ledger. Apply the rule to leases as well as tokens: a lease's
entry under its parent token is written before the lease itself, for the
same reason.

The naive reading orders the writes by dependency - the index points at
the record, so the record must exist first - and it is the wrong
dependency. The record depends on the index for its *revocability*, and
revocability is the property a crash must not be able to remove.

## When not to use it

Where every write to the token store already goes through one transaction
that commits all keys or none, the order is a habit rather than a
guarantee, and the technique's real contribution there is the read-side
tolerance and the sweep. Where a record has no secondary key at all - the
never-persisted class has none, and a private-store entry is keyed only by
its owner - there is nothing to order.
