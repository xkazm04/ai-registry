---
layer: technique
type: technique
subject: priced-authority
technique: inline-auth-cannot-lease
status: forged
laws: [gate-sees-target, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a caller authenticates and acts in one request and never wants the token back, deciding what an unpersisted authority may create, sizing the quota exposure of an endpoint that accepts inline credentials, a request under inline authority would mint a lease]
---

# Inline authentication cannot lease

The cheapest authority a server issues is the one it never issues at all:
the caller presents its login material *on* the request it wants to make,
the server authenticates it, runs the request under the resulting
authority, and discards that authority with the response. No token is
returned, nothing is stored, and the token store and expiration ledger
each end the request with exactly as many rows as they started with. This
technique is the guard that keeps that true.

## The shape

An inline-authenticated request carries two things: the login (a path and
its parameters, exactly as a standalone login would send them) and the
main operation. The server performs the login first, against the same
auth method and the same policy evaluation as a standalone login, and
obtains an entry it holds only in memory for the remainder of the request.
The main operation is then dispatched with that entry as its caller. When
the response is built, the entry is dropped. If the login produced a
persisted token - because the auth method or role does not issue the
never-persisted class - the server revokes it before responding, and the
caller is not told its value, because a value the caller cannot use is not
worth the write it took to return.

A leaked inline credential is worthless outside the request it was
presented with in exactly the way a never-persisted token is: there is no
row to find, no renewal to call, no accessor to name. The saving is the
same too, and the constraint is the same, sharpened.

Two guards sit at the entry. Inline authority is refused when the request
also carries a token: layering the two would give one request two
callers, and the audit line, the policy evaluation and the quota would
each have to pick one. And when the login step fails, its failure is
returned in place of the main operation's response, marked as the login's
- a header or a typed field the caller can read - so that a caller can
tell "your credential was rejected" from "your operation was rejected"
without parsing message text. Two steps in one request are two distinct
failures, and the response says which
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## The rule

**A request under inline authority may not create anything that must
outlive the request.** A lease is the canonical thing: a generated
credential with a time to live, tracked in the expiration ledger, revoked
through the token that created it. Under inline authority that token is
gone when the response is sent, and a lease indexed under a token that no
longer exists is a lease nothing will ever revoke on the operator's
behalf. The same holds for a child token, a private-store entry, and a
wrapped response whose wrap token would be parented to the vanished
entry.

So the gate looks at what the handler *produced*, not at what the caller
*asked for*: after the main operation returns and before the response is
released, if the result carries a lease, a child token or any artifact
that names the inline entry as its parent, the server revokes what was
created and returns an error that says why. The verb, the path and the
role are not the predicate; the presence of an artifact with a lifetime is
([gate-sees-target](../../../_laws.md#gate-sees-target)). A design that
enumerates "endpoints that lease" and blocks inline authority on those is
a list that is wrong the day a new engine ships.

The alternative to refusal is routing: a deployment may choose to let the
request proceed on the persisted path - issue a real token, parent the
lease to it, return the token so the caller can revoke it. That is a valid
design, and it is a different one; the request is no longer inline and the
caller is told so, by receiving a token. What is never valid is the third
option, silently creating the lease and dropping the parent.

## The error is a distinct outcome

The refusal must be spelled differently from a failed login and from a
failed main operation
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
A caller that receives "permission denied" retries with more permission;
one that receives "this operation creates a lease and cannot run under
inline authority" changes the shape of the call. The revocation of the
half-created artifact is part of the error path and must complete before
the error is returned; an error that leaves the lease standing has done
the opposite of its job.

## Quota, and the amplification you are accepting

An inline request is two operations - a login and a main call - and the
server's rate limiter sees it as one, at the outer path. This is a choice
with a stated cost: an unauthenticated caller can cause up to twice the
work per counted request that a standalone caller can, because the login
is counted at the outer path rather than the auth path. Counting it twice
is possible and wrong in a different way - the same caller doing the same
work as two requests would be charged the same as one inline request, and
the inline form would be penalised for being efficient. Count once, at the
outer path, and write the factor down beside the limit so the number
carries its predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)):
a quota of N on an endpoint that accepts inline login is a quota of up to
2N logins, and the auth method's own lockout and rate rules still apply
underneath.

## Decision rule

When a caller wants to authenticate and act in one round trip and has no
use for the token afterwards, accept inline authority, run the login and
the operation under one entry that lives only in the request, and after
the handler returns refuse - by revoking what was created and erroring -
any result that carries a lease or a child, because a lease under a
vanished parent is authority outside the ledger. Never decide by the path
whether inline authority is allowed; decide by what the handler produced.

The naive reading is that inline authority is a convenience feature and
the lease question is a corner case for a later release. It fails
quietly: the first engine that issues a credential under inline authority
issues one that no revocation walk will find, and the operator who
revokes the compromised mount's prefix believes it is done.

## When not to use it

Do not accept inline authority on a listener that cannot revoke: a
read-serving replica that forwards writes would have to forward the
login, the operation and the revocation as one unit or not at all. Do not
accept it where the auth method's login is itself expensive and
externally rate-limited - an identity provider that charges per
verification turns "count once" into a cost the server is not paying.
