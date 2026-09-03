---
layer: technique
type: technique
subject: priced-authority
technique: single-use-cubbyhole-wrap
status: forged
laws: [gate-sees-target, creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [delivering a first credential to a machine through a channel that logs or retries, a secret must cross an intermediary that must not be able to read it, choosing between a signed handoff token and a server-attested one, a receiver must detect that its handoff was intercepted]
stage: multi-service
---

# Single-use cubbyhole wrap

Secure introduction is the problem of giving a credential to something
that has none: the first token to a fresh machine, a database password to
a job, a bootstrap secret to a container. The channel available is never
the one you would choose - an orchestrator's environment, a provisioning
tool's log, a ticket system, a person's clipboard - and every one of them
is read by more parties than the recipient and keeps copies longer than
the secret should live. This technique is the primitive that makes the
value crossing that channel worthless to everyone but the recipient, and
tells the recipient when someone else got there first.

## The construction

Instead of returning the response, the server issues a fresh token and
stores the response in that token's private store - the per-token storage
that only the token can read and that is destroyed with it. The token is
returned in the response's place. It is an ordinary persisted token of the
issuer's own kind with four properties set at creation: a use count of
one, a short time to live, no policies beyond reading its own store, and
metadata recording the *creation path* - the request that produced the
wrapped response - and the creation time.

The recipient unwraps by presenting the token. The server reads the
private store, returns its contents, and the single use is consumed: the
token is revoked, the store destroyed. A second presentation fails.

Because the token is a real row in the ledger, everything the ledger
offers applies. It has an accessor, so an operator can revoke a wrap that
was issued by mistake without holding it. It has a parent, so the
revocation of the session that wrapped it reaches it. Its time to live is
its reaper, and a wrap that nobody unwraps destroys itself with its
contents ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
None of this is available to the never-persisted class, which is why a
wrap token is never that class.

Three details of creation are the difference between a wrap that can be
audited and one that cannot. The token is created *before* the response
is audited, so that the audit line for the wrapping request carries the
(hashed) wrap token identifier; the audit log can then answer, for any
wrap ever issued, whether it was later unwrapped and by which request,
which is the question every interception investigation asks first. If
the response cannot be stored into the private store, the token that was
just created is revoked before the error is returned, so a failed wrap
leaves no orphan row ([creation-names-reaper](../../../_laws.md#creation-names-reaper)
again). And an empty result is refused rather than wrapped: a listing
that found nothing returns not-found instead of a token that unwraps to
nothing, because a recipient that spends its single use to learn that
there was nothing to learn has been given a worse signal than the error.

## Why it is not signed

The obvious alternative is a signed token: the server signs the wrapped
payload, the recipient verifies the signature with the server's public
key, and no round trip is needed to trust it. It is rejected, and the
reason is the whole security argument of the technique.

The threat is an attacker who can redirect the recipient - control its
notion of where the server is, through the same channel that delivered
the token. Against that attacker, a signature verifies nothing: whoever
can hand the recipient a token can hand it the public key to verify that
token with, and a recipient that verifies offline has no way to notice.
The only party whose word the recipient can check against something the
attacker does not control is the server itself, reached at an address the
recipient trusted before the handoff began. So validity is decided by the
server, on presentation, by looking the token up - the gate reads the
target, not a proxy for it
([gate-sees-target](../../../_laws.md#gate-sees-target)) - and the token
carries no claim the recipient is expected to verify on its own.

## The lookup before the unwrap

A single use is what makes interception detectable, and the lookup is
what makes it detectable *before* the recipient spends its use. The server
exposes an **unauthenticated lookup**: given a wrap token, it returns the
creation path, the creation time and the time to live, and consumes
nothing. The recipient asks before unwrapping and checks two things: that
the creation path is the one it expected (a token created by "read this
credential" is not the token it was promised if it was told to expect
"log in as this role"), and that the creation time is recent enough to be
the handoff it is part of.

If the lookup fails, the token was already used, or it expired, or it was
never real. Each of those is the same event for the recipient: the
introduction failed, and the recipient must treat it as an incident, not
retry with the same token. A recipient that retries has told the attacker
nothing was noticed. The lookup is unauthenticated on purpose: the
recipient has no credential yet, that is the premise, and requiring one
would require a second introduction to secure the first.

The lookup is safe to expose because it reveals nothing the token holder
could not learn by unwrapping, and because the response it reveals about
is still sealed; an attacker who has the token can already unwrap. What
the lookup adds is a way for the *legitimate* holder to check origin at
zero cost in uses.

## What is wrapped

Anything the server would have returned. The most common contents are a
credential from a login (the recipient's first real token), a generated
secret, or a stored value; a wrap around an arbitrary caller-supplied
payload is the same mechanism and lets a person hand another person a
secret with the same single-use guarantee. The token's creation path
records which of these it was, and the record is what the lookup returns.
Because the token is identified by its own row and not by its contents,
wrapping the same value twice produces two tokens with two independent
single uses ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).

## Decision rule

When a secret must reach a recipient through a channel that logs, retries
or is readable by an intermediary, return a persisted single-use token
whose private store holds the secret, and have the recipient look the
token up for its creation path before unwrapping, because the value on
the wire is then useless to a copier, a used token is visible to the
recipient as an interception, and only the server - not a signature the
attacker could supply the key for - decides whether the token is real.

The naive reading is that a short time to live is enough: a secret that
expires in thirty seconds is safe in a log. It is safe in a log read
tomorrow, and it is not safe from the intermediary that reads it in the
thirty seconds, and it gives the recipient no way to know that happened.

## When not to use it

When the recipient already holds a credential to the server, an ordinary
authenticated read under that credential is the plainer path; wrapping
adds a round trip and a token to nothing. And a wrap is a delivery
mechanism, not a storage one: a wrap token held for its whole time to live
before use is a secret at rest, in the recipient's environment, with all
the exposure that implies. Unwrap on receipt.
