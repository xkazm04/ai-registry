---
layer: golden-path
type: golden-path
subject: dynamic-secret-lifecycle
status: forged
use_when: [designing an issuer that creates credentials on demand in a remote system, choosing how long a minted credential lives and who kills it, building revoke and cleanup for credentials the system itself created, deciding whether every issued artifact needs its own lease record]
techniques:
  - persist-before-provision
  - expiry-buffer-beyond-lease
  - idempotent-revoke-and-give-up
  - ttl-ladder-derivation
  - wal-per-external-side-effect
  - lease-vs-native-tracking
---

# Dynamic secret lifecycle

A dynamic secret is a credential that did not exist until somebody asked for
it. The issuer creates a user in a database, a role binding in a cloud
account, an account on a message broker, a certificate under a private
authority, hands the caller the result, and now owes the world its
destruction. That last clause is the subject. Minting is a single remote call
and any system can do it; the craft is everything the issuer must hold true
*between* the mint and the moment the credential is gone from the remote
system, and the way every one of those obligations is a record the issuer
keeps rather than a hope it entertains.

The primitive that carries the obligation is the **lease**: a durable record,
owned by the issuer, that names the credential (by identity, never by value),
names the code that revokes it, and names the instant at which that code runs.
A dynamic secret therefore lives two lives at once. The lease is the issuer's
life, kept in the issuer's storage, ending when the issuer's clock says so. The
remote artifact is the effect's life, kept in a system the issuer does not
operate, ending when that system's clock or the issuer's revoke call says so.
Every failure in this subject is a disagreement between those two lives, and
every technique below is a rule for which one is allowed to be longer, which
one is written first, and what happens when the issuer can no longer see one
of them.

## The stance: the ledger precedes the effect, and the ledger dies first

A principal engineer holds two inequalities and refuses every design that
violates either.

**The record is written before the effect exists.** The issuer creates the
remote credential only after it has proven it can persist the lease that will
revoke it. The naive order is the reverse, because it reads naturally: call the
remote, get the credential, then write the lease. The failure that order buys
is the one this subject exists to prevent: the remote user is created, the
lease write fails because storage is read-only or full or partitioned, the
caller receives a credential nobody will ever revoke, and the issuer has no
record that it happened. A credential with no lease is an unreaped resource
whose reaper was never named, and unlike a temp file it authenticates. The
rule and its exceptions are [persist-before-provision](./techniques/persist-before-provision.md);
its generalisation to every remote mutation, not only creation, is
[wal-per-external-side-effect](./techniques/wal-per-external-side-effect.md).

**The lease expires before the remote artifact does.** Where the remote system
can enforce its own expiry, the issuer sets that expiry to the lease's
lifetime plus a buffer, so the lease is always the earlier death and the
remote expiry is a backstop the issuer never depends on. The naive reading
sets them equal, and equal is a race: the remote system's clock, the
network's latency and the issuer's revocation queue all sit between the two
deadlines, and whichever wins produces either a revoke against a credential
that has already vanished or a credential that outlives the record that was
supposed to kill it. The buffer, and what renewal does to it, is
[expiry-buffer-beyond-lease](./techniques/expiry-buffer-beyond-lease.md).

Everything else follows from holding those two inequalities under failure.

## Revocation is a verb the issuer must be able to repeat

Because the lease dies first and the remote may die on its own, the issuer's
revoke will regularly meet a target that is already gone, and it must count
that as success. A revoke that errors on "not found" turns every expired
backstop into a stuck lease that retries until it is declared irrevocable,
and the operator's queue fills with credentials that are not a risk to
anyone. Idempotent revocation is the entry cost. The second cost is ordering:
the issuer's own record of revocation lands first, and the publication of that
fact to the world (a revocation list, a status responder, a broadcast) is
best effort afterwards, because a revocation the issuer has recorded is
enforceable at the issuer's next decision and a revocation the issuer failed
to record is not enforceable anywhere. The third cost is honesty in the
cleanup: records of revocation and of issued artifacts are removed only after
the artifact could no longer be presented, and the key that signed a
revocation artifact outlives the issuer it belongs to. The three together are
[idempotent-revoke-and-give-up](./techniques/idempotent-revoke-and-give-up.md).

## Lifetime is derived from a ladder stated once

How long a lease lasts is never a single number and never a single caller's
choice. A periodic credential renews to a fixed period; a request carries an
increment; the issuing backend has a default; the system has a default; and
above all of those sit three ceilings — the mount's, the role's, and an
explicit maximum — of which the smallest wins. The naive reading takes the
caller's number and clamps it to one ceiling; the result is a lifetime that
depends on which endpoint the caller happened to use. The ladder is stated
once, applied at creation and again at every renewal, capped visibly with a
warning rather than silently, and a renewal that would carry the lease past
its maximum is refused rather than trimmed to fit. That derivation is
[ttl-ladder-derivation](./techniques/ttl-ladder-derivation.md).

## A lease is a priced artifact; not every artifact earns one

A lease costs a durable write at creation, a durable write at renewal, an
entry in an in-memory expiry index, and a revocation job at the end. For a
database user or a broker account that price is the point: those artifacts do
not die on their own and nothing but the lease will kill them. A certificate
is different. It carries its own expiry, every relying party enforces that
expiry without consulting the issuer, and there may be a million of them per
issuer. A lease per certificate is a million expiry-index entries and a
million revocation jobs that do nothing an already-expired certificate did
not do for itself. The rule is that a self-revoking artifact is tracked
natively — in the issuer's own store, keyed by serial, with a sweep that
prunes what has expired — and is leased only when an operator opts in and
accepts the price. Which artifacts self-revoke, what native tracking must
still record, and why the lease-less store is the default rather than the
exception are [lease-vs-native-tracking](./techniques/lease-vs-native-tracking.md).

## Where this subject ends

**Against the credential vault.** The vault holds credentials the application
*consumes*: minted by an external authority, on loan, refreshed and rotated
and retired by a custodian who cannot re-mint them. This subject is the
*issuer's* seat at the same table: the system that creates the credential in a
remote system it does administer, and owes that system the credential's
destruction. The two share vocabulary — lease, renew, revoke, TTL — and read
each word from opposite sides. The vault's refresh technique decides when a
consumer asks for more time; this subject's ladder decides what the issuer
answers. The vault's rotation technique replaces a long-lived grant with a
successor while the incumbent still works; this subject's root-credential
rotation is the same overlap discipline applied to the one credential the
issuer itself holds against the remote system, and it appears here only for
the write-ahead record and rollback decision it needs. The rule a reader uses:
if your system was *handed* the credential and cannot mint another, read the
vault; if your system *created* the credential and a remote user or
certificate exists because your code ran, read this. A system that does both
— an issuer whose root credential is itself a vaulted secret — reads the
vault for the root and this subject for everything the root mints.

**Against delivery guarantees.** That subject owns work: an accepted event
that must be processed approximately once, the atomic claim, the reaper for
claimed-then-died items, the bounded retry that becomes a dead letter. It
uses leases and write-ahead records as instruments for work items. This
subject uses the same instruments for a different object: a credential that
must exist in a remote system for exactly as long as a local record says it
should, and no longer. The write-ahead record here is not a queue entry and
its rollback is not a retry; it is a witness that a remote mutation was
attempted, consulted after a crash to decide whether the remote state matches
the local one. The rule: if the question is "was this effect applied, and how
many times", read delivery guarantees; if the question is "does a credential
exist out there that my records no longer account for", read this. An
issuer's revocation queue *is* a work lane and borrows that subject's retry
and dead-letter discipline wholesale — the irrevocable lease is that lane's
dead letter — and this subject does not restate it.

## What done looks like

An issuer meets the bar when no code path can create a remote credential
without first having durably written the lease or write-ahead record that
will destroy it; when every remote expiry the issuer sets is strictly later
than the lease that governs it, at creation and after every renewal; when
revoke on an absent target is success, local revocation is recorded before
publication is attempted, and cleanup keys on expiry-plus-buffer rather than
on revocation time; when the effective lifetime of any lease can be
recomputed from one stated ladder and a capped request says so; when every
remote mutation leaves a witness that a rollback can read and a rollback
never acts on a witness younger than a successful operation takes; and when
the operator can answer, for every artifact class the issuer mints, whether it
is leased or natively tracked and why.
