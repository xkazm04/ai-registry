---
layer: technique
type: technique
subject: browser-credential-boundary
technique: broker-proxy-attaches-secret
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [a browser feature needs a privileged upstream, deciding which request headers may be forwarded, a client library wants the upstream key to work]
---

# The broker route attaches the secret

When a dependency's credential must not ship in the bundle, the browser gets a
**same-origin route** instead of an address. Every call to that upstream goes
through the route; the route attaches the credential server-side, forwards a
constrained version of the request, and returns a constrained version of the
response. The browser carries only its own session token — a proof of who the
user is, issued by your application, revocable by your application, worthless
against the upstream.

One route, not one per feature. This is
[one-validation-door](../../../_laws.md#one-validation-door) applied to egress
from the browser tier: with a single door, "which of our calls reach the
upstream, with what credential, having checked what" has an answer that is read
rather than reconstructed. With a door per feature, the properties below are
conventions, and the fourth feature is written by someone who read the third.

## The contract, stated at the route

Write the route's contract at the top of the route, as prose the next
contributor cannot avoid reading: what this route is for, which credential it
attaches, what it refuses to forward, and what a caller may conclude from each
status it returns. A broker with an undocumented contract acquires a second
purpose within two quarters — a "just this once" passthrough for a different
upstream — and the second purpose is always the one with the incident.

The contract has four clauses that carry weight:

**The credential is attached here and only here.** The caller submits intent —
a path under the upstream, a method, a body — and never a credential. It cannot
leak what it never held, and that closes the whole class of client-side
disclosure by shape rather than by review.

**Callers are authenticated before the credential is spent.** A same-origin
route is exactly as reachable as the bundle that calls it; "only our UI calls
it" describes intent, not access control. The route verifies the caller's own
session before it forwards anything, and the identity it verifies is the one it
will attribute the call to. Where the upstream charges per call, this clause is
also the cost control.

**The forward set is an allowlist.** Enumerate the request headers the route
will pass upstream, and drop everything else. Enumerate the methods. Constrain
the path — a wildcard path segment is the point where a broker becomes an open
relay, so the segments are validated and re-encoded rather than concatenated.
A denylist fails the same way it always fails: the header added to the protocol
next year is forwarded by default, and nobody who added it knew about your
route.

**No upstream detail crosses back.** Hostnames, upstream status text, upstream
error bodies, and stack traces stay on the server side; the caller gets a
closed vocabulary. That clause is large enough to be its own technique —
[opaque-upstream-errors](./opaque-upstream-errors.md).

## Path handling is where relays are born

The tempting implementation joins the caller's path fragments onto the upstream
base and issues the request. Two failures live in that one line. A fragment
containing a traversal sequence or an absolute scheme can redirect the call
somewhere the credential was never meant to go — the credential is then
attached to an attacker-chosen destination, which is the confused deputy in its
purest form. And a fragment with unencoded characters produces a request the
upstream interprets differently from what the route validated.

So: split the caller's path into segments, validate each against what the
upstream actually exposes, encode each segment individually, and rebuild the
path from the encoded parts. Rejecting an unrecognized segment is cheaper than
proving that forwarding it is safe. If the upstream's surface is small enough
to enumerate — and it usually is — enumerate it, and let the route reject
anything not on the list.

Redirects deserve the same suspicion: a redirect the route follows
automatically can move the request to a host the credential should never reach.
Either do not follow redirects, or re-validate the destination before you do.

**The configured base is an input too.** The upstream's address comes from the
deployment environment, and a route that trusts it blindly attaches your
credential to whatever that value happens to say — an empty string that
resolves against your own origin, a value with a scheme that turns the request
into something other than an outbound call, a stray trailing fragment. Validate
it on the way in: present, absolute, and one of the schemes you expect. Do it
in one shared place rather than per handler, and give the failure its own
outcome — a deployment that never configured the upstream is a different
condition from an upstream that is down, and telling them apart saves the
operator the one diagnosis they would otherwise repeat.

## The route is a security surface, so instrument it as one

The broker is the one place where a session identity, a privileged credential
and an outbound request meet. Record, per call: the authenticated caller, the
operation class, the outcome, and the timing. Do not record the credential, and
write every log line in the route as though it will be read publicly — this is
the one file where a careless interpolation puts a secret in a log.

The gate here must observe the real forwarded request
([gate-sees-target](../../../_laws.md#gate-sees-target)). A test that asserts
the route's *handler* filters headers, while the deployed configuration adds a
middleware that re-attaches them, is a green check over a proxy. Assert against
what the upstream would actually receive.

## When not to broker

**When the dependency is already public by design.** A store whose anonymous
role is deliberately published and governed by row-level policies does not need
a broker in front of it; adding one gives you an extra hop, a second place for
the policy to be misunderstood, and no security gain. The enforcement for that
dependency lives in its policy engine.

**When the call must not leave the browser at all.** Some data should never
reach your server — a broker that "just forwards" content you did not want
custody of has made you the custodian. Decide what the route is allowed to see
before you decide what it forwards.

**When a single route would serve unrelated upstreams.** One door per trust
boundary, not one door for everything: a route that brokers two upstreams with
different credentials and different allowlists is two routes sharing a bug
surface. Split them, and let each one's contract stay small enough to read.
