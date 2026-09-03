---
layer: technique
type: technique
subject: priced-authority
technique: write-ahead-revocation-marker
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [revoking a token whose leases and children take time to tear down, a token must stop authenticating the instant revocation begins, a second revocation of the same token arrives mid-teardown, deciding what a lookup returns for a record being destroyed]
---

# Write-ahead revocation marker

Revoking a persisted token is not one delete. Its leases must be revoked -
each one a call to the engine that issued the credential, each one able to
fail and retry - and its children must be revoked, recursively, before
the record itself can go. The work is deferred, it runs in the background,
and it can take minutes. This technique settles what the token *is* during
those minutes.

## The window

Between "revocation requested" and "record deleted" there is a window, and
the naive designs put the token on the wrong side of it. Delete the record
first and the teardown loses the record's contents - the list of leases,
the parent, the creation path - that it needs to finish; a crash mid-way
leaves leases with no token to find them from. Delete the record last and
the token keeps authenticating requests for the whole teardown; a caller
holding a token an operator has just revoked can still issue leases under
it, each of which the teardown may or may not see depending on timing, and
a second operator who revokes the same token starts a second teardown over
the same tree.

## The marker

Before the deferred work begins, the record is rewritten with a sentinel -
a field that says *this token is being revoked* - and only then is the
teardown enqueued. The marker is the first write of the revocation, ahead
of everything, in the sense a write-ahead log gives the phrase: whatever
happens afterwards, the store already says what is happening.

Three behaviours follow from the marker, and each is the reason for it:

**Lookups fail immediately.** A request authenticating with a marked token
is refused with a verdict that names the state - being revoked, not
expired, not unknown - so the caller can branch on it and the audit line
carries it ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
The record still exists and still decrypts, and the marker is the field
the gate reads; a gate that consulted only "does the record exist" would
pass exactly the tokens the operator just revoked
([gate-sees-target](../../../_laws.md#gate-sees-target)).

**Re-entrant revocation is refused.** A second revocation of a marked
token returns success without starting a second teardown, or returns
"already in progress" - a deployment picks one and keeps it - but it does
not enqueue. Two teardowns over one tree race each other on every lease,
and the losing one's failures are indistinguishable from real failures.

**The teardown keeps what it needs.** The record survives, marked, for as
long as the leases and children need a parent to be found from. Nothing
reads it for authority any more; everything reads it for structure. The
teardown then proceeds in the order of what is most dangerous to leave
behind: the token's private store first, because it may hold a secret and
its destruction depends on nothing else; then the leases, each a remote
revocation that can fail; then the child tree; then the parent and
accessor indexes; and the primary record last, as the commit - the
variant [secondary-index-before-primary](./secondary-index-before-primary.md)
gives for a record that is already dead. A teardown that fails at any
step leaves the marked record in place, records that the attempt failed,
and lets the next attempt resume from the marker rather than from a
half-deleted tree.

The marker has an in-memory shadow. A process-local set of identifiers
whose revocation is in progress lets a second revocation of the same
token in the same process return immediately, without a store read; the
persisted marker is what makes the same answer hold across a restart and
across replicas. The two are not alternatives - the set is a fast path,
the record is the truth - and a failed teardown clears the set entry so
that the retry is not refused as already running.

## What the marker must not become

A marked record is not "a token with a flag". It must never be returned
from a lookup as a valid entry with a property the caller may or may not
inspect; the lookup itself fails. The unknown state - "is this token
valid?" during teardown - has a definite answer, *no*, and the marker is
what keeps it from being rendered as *yes* by any reader that did not
check ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).
For the same reason the marker is not a separate key beside the record,
which a lookup could miss; it is in the record, on the path every lookup
already takes.

Renewal on a marked token fails, with the same verdict. Creating a child
under it fails. Issuing a lease under it fails. Wrapping a response under
it fails. Each of these is a "may I extend or spawn from this authority"
and the answer during teardown is no, because anything created now is
created inside a tree that is being deleted and may or may not be reached
by the walk that is already running.

## Crash recovery

The marker is also the recovery hint. A server that starts and finds
marked records knows their teardowns were interrupted, and resumes them:
enqueue the deferred work again for each. Without the marker, recovery
would have to distinguish a healthy token from one whose revocation was
half-done by inspecting its leases, and it cannot - a token with three
live leases looks the same in both cases. With the marker the store
carries the intent, and intent is what recovery replays.

## Decision rule

When revocation is deferred and its work can fail or be interrupted, mark
the record as being revoked before enqueueing the work, because a lookup
must fail from the first instant, a second revocation must not start a
second teardown, and the teardown must be able to read the record until it
is done. Delete only when the tree below is empty.

The naive reading treats revocation as a delete with some cleanup
afterwards. It fails in the window: the deleted record's leases are
orphaned on a crash, or the undeleted record keeps authenticating - and
which failure a deployment gets depends on which order it picked, so both
deployments believe they are correct.

## When not to use it

The never-persisted class has no record to mark; its revocation is key
rotation or source removal ([never-persisted-token-class](./never-persisted-token-class.md)).
A token with no leases and no children can be deleted directly, and a
deployment that can prove that at revocation time may skip the marker for
that token; the proof is the empty child list and the empty lease list,
read under the same lock the teardown would take.
