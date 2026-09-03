---
layer: technique
type: technique
subject: dynamic-secret-lifecycle
technique: wal-per-external-side-effect
status: forged
laws: [creation-names-reaper, unknown-is-not-a-value]
shared_with: []
use_when: [a crash between a remote mutation and the local record that describes it, writing rollback for an issuer that mutates remote systems, rotating the root credential the issuer itself uses against a remote, deciding how old a write-ahead record must be before rollback may act on it]
---

# Write-ahead record per external side effect

Every remote mutation the issuer performs — creating a user, extending its
validity, rotating the credential the issuer itself uses to reach the remote
— can be interrupted between the remote's acceptance and the issuer's record
of it. The technique is the witness that survives the interruption. The rule:
**before each remote mutation, durably write a record that names the
mutation and what undoing it requires; a rollback acts on that record only
once it is older than a successful operation could take; and where the
mutation was a root-credential rotation, the rollback decides by testing
which credential the remote still accepts, not by reading the record's
age.**

## Why a witness and not a transaction

The issuer's storage and the remote system are two stores with no
transaction across them. Whatever the issuer does, there is an instant at
which the remote has changed and the issuer has not yet written that it has.
A crash at that instant leaves the two disagreeing, and on restart the issuer
has no memory of a mutation it performed. The naive readings are two. One
hopes the instant is short enough to ignore; it is, until it is not, and the
first time it is not, a database user exists with a password the issuer does
not know and a name it will never revoke. The other treats the remote call as
retryable and re-runs it from the request; a create re-run produces a second
user, and a rotation re-run locks the issuer out of the remote.

The write-ahead record replaces memory with evidence. Written before the
remote call, it survives the crash; read on restart, it tells the issuer that
a mutation of this kind, against this target, was at least attempted, and
gives the rollback what it needs to inspect the remote and reconcile. It is
the [creation-names-reaper](../../../_laws.md#creation-names-reaper)
principle applied to effects rather than resources: the record of the
attempt names what cleans it up.

## The procedure

Before the mutation, write a record carrying the kind of mutation, the
target's identity in the remote's terms, the role or connection it runs
under, the instant of writing, and everything the rollback will need to undo
the effect without consulting configuration that may have changed — for a
create, the username to drop; for a rotation, enough to test both the old and
the new credential. The write is durable before the remote call begins; if it
cannot be made, the mutation does not happen, which is
[persist-before-provision](./persist-before-provision.md) stated for every
effect rather than only creation.

Perform the remote mutation.

On success, complete the local state — the lease, the stored root credential
— and delete the record, in that order. Deleting the record before the local
state is complete reopens the gap; deleting it after is safe because a record
that describes an already-reconciled state is harmless to replay, provided
the rollback is idempotent against a remote that already matches.

On failure, delete the record if the remote reports the mutation did not
happen, and leave it if the remote's answer is ambiguous — a timeout, a
connection dropped mid-call — because ambiguous means the effect may exist.

On restart, or on a periodic sweep, read every record and hand each to the
rollback for its kind.

## The minimum age

A rollback that acts on every record it finds will roll back mutations that
are in flight. The sweep runs on a schedule; a record written a second ago
belongs to a request that is, right now, waiting for the remote's answer, and
a rollback that drops the user being created races the create and wins
sometimes. The rule: **a record is eligible for rollback only once its age
exceeds the longest a successful operation of its kind can take**, measured
with margin, and until then it is neither reconciled nor abandoned but
unknown ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value):
a young record is not evidence of an abandoned mutation, and treating it as
one is the laundering the law names). Beyond the minimum age the request that
wrote the record is gone — it has either completed and deleted the record,
which is why the record would not be there, or it has died — and the rollback
may act.

The age is per kind. A create against a database is bounded by the driver's
timeout; a root rotation may involve several remote calls and a connection
re-establishment; the minimum age for each is stated next to its rollback,
not as a single sweep-wide number.

## The rollback decides by inspecting the remote

For a create, the rollback drops the user the record names, and treats an
absent user as success. For a validity extension, the rollback reads the
remote's current expiry and reconciles the lease to it. For a rotation of the
root credential — the one the issuer itself uses to reach the remote — the
rollback cannot decide by age at all, because the question is not whether the
mutation was attempted but which of two credentials the remote now accepts.
The rule: **the rotation rollback first compares the record to the store; if
the store already holds the new credential, the rotation completed and only
the record's deletion was lost, so the record is discarded. Otherwise it
tries the stored credential against the remote; if that still connects, the
rotation never took effect and the record is discarded; if it does not, the
rotation took effect before the store was updated, and the rollback uses the
new credential the record carries to set the remote back to the stored
one.** The direction matters: the remote is made to match the record, not
the record the remote, so that a rotation the caller saw fail is a rotation
that did not happen, and the caller's retry starts from a clean state
instead of from a store that was silently updated behind an error. A
rollback that assumes the rotation failed because the store still holds the
old value locks the issuer out of every remote where it succeeded; a
rollback that tries to reach the remote with the old credential to undo the
change fails exactly when it is needed. Where the remote refuses to change
the credential back — it does not support the operation — the rollback
reports that and leaves the record for an operator, because the issuer is
now locked out and nothing automatic will fix it.

This is why a root rotation's record carries both the old and the new
credential, sealed under the issuer's own encryption. The same holds for any
mutation whose value was generated rather than supplied: **the witness
carries the generated value, so a retry re-applies the same value rather
than generating another.** A rotation of a managed account that is retried
after a crash with a freshly generated password has now set the remote twice
and the store once, and the value the store holds is the one the remote no
longer accepts. A retry that finds its own witness reuses the witness's
value, and the remote and the store converge on it.

## Reading witnesses on restart

Restart is when the witnesses are read, and a witness read against the
current state classifies into one of three. A witness for a target the store
has never recorded as successfully mutated belongs to an attempt that never
completed its first write and is discarded. A witness older than the store's
own record of the last successful mutation of that target is a leftover from
an attempt the store has since superseded, and is discarded. Only a witness
newer than the store's record is live: it is handed back to the rotation
lane with its identity, so the lane's next attempt at that target reuses the
witness's generated value instead of writing a second witness beside the
first. Two live witnesses for one target is the one state the reader must
never produce.

Before any of that, the reader proves it can write. A node whose storage is
read-only at startup — a replica still catching up, a leader not yet elected
— cannot delete the witnesses it reconciles, and a reconciliation that
cannot delete its witness re-runs the rollback on every sweep. The honest
probe is a real witness written and deleted, retried until it succeeds; it
is [persist-before-provision](./persist-before-provision.md) applied to the
reader itself.

## The decision rules

When the sweep finds a record older than its minimum age, run its rollback
and delete the record on rollback success; on rollback failure, leave the
record and surface it, so an operator sees "unreconciled remote mutation
since T" rather than a remote that drifts silently.

When the sweep finds a record younger than its minimum age, skip it without
logging, because a request in flight is the normal case and a warning for it
trains operators to ignore the sweep.

When the rollback's inspection finds the remote already matching the local
state, delete the record and count it; a rising count of already-reconciled
records means requests are dying between the remote's success and the
record's deletion, which is a real fault the count makes visible.

When the mutation cannot be undone at all — a remote that offers no delete
for what was created — the record still gets written, and the rollback's job
is to surface the orphan with its identity rather than to fix it, because a
named orphan is an operator task and an unnamed one is a breach.

## When not to apply it

A mutation the issuer can re-run safely from the request — a read, an
idempotent set-to-value where the value is in the request — needs no witness,
because re-running it after a crash reconciles the remote without one. The
test is whether re-running from the request produces the same remote state
as the first run did; for a create with a generated password or a rotation to
a generated value, it does not, and the witness is required.
