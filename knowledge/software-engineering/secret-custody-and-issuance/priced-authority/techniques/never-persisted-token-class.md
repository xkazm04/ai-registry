---
layer: technique
type: technique
subject: priced-authority
technique: never-persisted-token-class
status: forged
laws: [creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [a workload logs in and discards the session within one run, login writes are the bottleneck on the replicated log, deciding which token capabilities a stateless class may keep, a leaked token must be worthless outside its request]
stage: multi-service
---

# Never-persisted token class

The default token is a row: written at login, indexed by accessor and by
parent, read on every request, extended on renewal, deleted on revocation.
This technique defines the one other class an issuing server may offer - a
token that is **never written anywhere** - and fixes what that class is
allowed to do, so that the saving is real and the loss is chosen rather
than discovered.

## The construction

The server takes the entry it would have stored - identity, policies,
creation time, time to live, the path that issued it - serialises it, and
encrypts the serialisation under a key only the server holds, with an AEAD
so the ciphertext is also tamper-evident. The token value is that
ciphertext, prefixed so the class is recognisable before any decryption is
attempted. Validation is: recognise the prefix, decrypt, check the
authentication tag, compare the embedded expiry against the clock, and use
the decrypted entry as if it had been read from the store. Nothing is
looked up, and so nothing was written.

The prefix is not decoration. The two classes have different validation
paths, different capabilities and different revocation stories, and a
consumer that cannot tell them apart from the value alone will call the
wrong path on the wrong token. The class is a closed vocabulary with one
authority - the prefix table the issuer owns
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)) -
and every other component derives from it.

## What the class forfeits, and why it is by construction

Every capability that requires finding the token again is gone, not by
policy but because there is nothing to find. When the class is defined,
state the list and the reason for each, because the next maintainer will
otherwise try to add one back:

- **No renewal.** Renewal extends a stored expiry. The expiry is inside the
  ciphertext, and rewriting it means issuing a new token, which is a login.
- **No child tokens.** A child is indexed under its parent so the parent's
  revocation reaches it. A parent with no row cannot be an index key, and a
  child of a parent that cannot be revoked is a token that outlives the
  authority that minted it.
- **No accessor.** An accessor is a second handle to the same row. There
  is no row.
- **No private store.** Per-token storage is keyed by the token's row and
  destroyed with it. A token that is never destroyed because it was never
  created would leak its store forever.
- **No individual revocation.** There is no row to mark and no index to
  walk. What replaces it is below.

What remains is the whole point: a value that authenticates, carries
policy, expires on its own, and leaves no trace that must be cleaned up.
The clock inside the ciphertext is the reaper, named at creation
([creation-names-reaper](../../../_laws.md#creation-names-reaper)); nothing
else ever has to delete it.

## Leases under the class: capped and re-parented

A lease outlives the request that created it and is normally revoked
through the token that created it. The class has no row for a lease to
hang on, and the naive conclusion is that it may not lease at all. The
better rule keeps the capability and prices it: **a lease created under a
never-persisted token is capped at the token's remaining lifetime, and is
indexed under the token's nearest persisted ancestor.** The cap means the
lease can never outlive the authority that minted it, so its expiry is the
token's expiry and needs no row of its own to enforce. The re-parenting
means the persisted ancestor's revocation reaches the lease, which is the
only revocation chain the lease can have. An orphan of the class - no
persisted ancestor - may still lease, and its leases die with its clock
and with nothing else; a deployment that needs to revoke such a lease
early has chosen the wrong class for that workload.

The lease itself is still a row, written in the expiration ledger, because
the credential it tracks lives in a remote system and must be revoked
there. The saving is the token's writes, not the lease's. Only the
degenerate member of the class - authority presented on the request and
gone with the response - has no lifetime to cap against and no ancestor
to re-parent to, which is why it cannot lease at all
([inline-auth-cannot-lease](./inline-auth-cannot-lease.md)).

## Revocation without a row

The class cannot be revoked one token at a time, and the design must say so
rather than pretend. Three levers remain, all coarser than one token.
Rotating the encryption key invalidates every token of the class at once -
the correct break-glass response to a suspected key compromise, and
useless for anything narrower. The entry carries the identity and mount
that issued it, so that revoking the *source* - disabling the auth method,
deleting the identity - fails the post-decryption check on every token
that named it. And the entry carries its persisted parent, if it has one,
and the post-decryption check looks that parent up: a token of the class
whose parent has been revoked stops working at the next request, which is
what "revoked with parent" means for a token that was never written. The
post-decryption checks are the class's whole revocation story, and they
run on every use, because there is no other moment at which the server
sees the token. None of them is "revoke this token". A deployment that
needs that answer for a workload needs the persisted class for that
workload.

## Decision rule

When a caller's session will be discarded within the run that created it,
and the caller will never need to renew it, spawn from it, or have it
revoked individually, issue the never-persisted class, because the writes
it saves are the writes every replica must apply and the capabilities it
loses are ones that caller would never exercise. When any of those three
is possible - the caller is long-lived, the caller needs leases that
outlive its own clock, an operator may need to kill exactly this session
- issue the persisted class, and pay.

The naive reading is that the stateless class is the fast path and the
persisted class is the safe path, so default to stateless and upgrade on
demand. It fails at the upgrade: a caller that started stateless and later
needs a renewal or a child has no row to extend or index under, and the
server that lets it proceed anyway has created authority outside its own
ledger. The class is chosen at login, by the role or the mount, and is not
upgraded in flight.

## When not to use it

Do not offer the class at all in a server whose replicas cannot share the
encryption key promptly - a token minted on one node must validate on
every other, and a key that lags is a token that works on the node that
issued it and nowhere else. Do not use it for an operator's own session; an
operator's session is the one a break-glass procedure most needs to find.
And do not use it for any token that will be *handed on* - a single-use
wrap token ([single-use-cubbyhole-wrap](./single-use-cubbyhole-wrap.md))
must be persisted, because its single use is enforced by deleting it.
