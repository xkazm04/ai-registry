---
layer: technique
type: technique
subject: contested-acquisition
technique: holder-reconstructed-binding
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [storing a credential a gate handed you for reuse on the next request, reuse works for direct traffic and silently never works through an intermediary, deciding whether a stored pass may be replayed by a different transport]
---

# Holder-reconstructed binding

Passing a gate usually produces a credential, and replaying it is the cheapest
response available on the next request to that source — cheaper than any rung,
and the only one that costs the source nothing extra. The temptation is to
treat it as a bearer token: store it, send it, done.

It is not a bearer token. It was minted by an issuer that bound it to a
fingerprint of the requester — some combination of network origin, declared
client identity, and transport characteristics — and **the issuer did not tell
you what it bound**. Replaying it from a different position is not merely
useless; the mismatch is itself information about you, offered to the party
whose decision you are trying not to provoke.

The granting side of this problem is solved elsewhere and solved well: a
credential you mint is
[born bound](../../../security/identity-and-access/device-pairing/techniques/token-binding-and-transport.md),
with its constraints attached at mint, because you are the one attaching them.
This technique is the other side — the **holder's** problem, when the binding
exists, matters, and was never disclosed.

## The move: reconstruct the binding from what you can observe

You cannot read the issuer's fingerprint. You can observe your own position at
the moment the credential was granted, and record it as the credential's
identity.

1. **Capture the egress identity at harvest.** The transport route the request
   actually went out on, and the client identity you actually presented,
   recorded on the stored row at the moment of the grant — not derived later
   from configuration, which may have changed since
   ([identity-survives-reuse](../../../_laws.md#identity-survives-reuse): mint
   the identity once, at creation, and carry it).
2. **Refuse reuse on mismatch.** A credential harvested on one route is not
   valid from another. The check is a predicate over the stored identity and
   the current one, and it is composed with the other eligibility gates into a
   **single** predicate so a caller cannot reach a partial check.
3. **Run one normalization on both sides.** The route is not a raw string; it
   is reduced to an identity — credentials stripped, defaults applied, casing
   settled. The write path and the read path must run the *same* reduction, by
   calling the same function, not by implementing the same intent twice
   ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
4. **Fail closed on an unreadable expiry.** A stored expiry that will not
   parse is not "probably still fine" and not "probably stale" — it is
   unknown, and unknown must not render as a definite value
   ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). Treat
   it as expired and re-earn the credential.

## The failure this exists to prevent is silent, and it is population-shaped

Two different normalizations across write and read is the characteristic bug,
and it deserves naming because of *who* it hits. The mismatch does not produce
an error. It produces a store whose rows are never eligible, so every request
takes the expensive path, forever, while the metrics show a healthy cache that
simply never hits. And it hits exactly the population that routes through an
intermediary — the population for which reuse was worth the most, because
their expensive path is the most expensive.

Write the test as an invariant rather than a case: harvest through a route
whose raw form differs cosmetically from its stored form, then assert the row
is eligible on the next request through the same route. That single assertion
outlives every refactor of the storage layer.

## Where the refusal is hard, and where it is best-effort

The rule is not uniformly strict, and the two settings are a design decision,
not an inconsistency to be tidied away.

**Hard refusal** where the consumer re-presents the minting identity in full.
A path that renders through an engine advertising exactly one client identity
cannot present a different one; a stored credential whose client identity that
path cannot reproduce is refused outright, because presenting it is
guaranteed to mismatch and the attempt is pure signal with no upside.

**Best-effort** where the consumer attaches the credential as a bare value and
a re-validation path exists downstream. A lighter transport that simply sends
the stored value may still be re-challenged for characteristics it cannot
control; that outcome is *detectable and recoverable*, so refusing in advance
would forfeit the cases that do work. Softening the gate is only defensible
when the miss is caught — the re-validation path is what pays for the
softness, and a system without one does not get to be lenient.

**Pin the comparison to what actually ran, never to a static configuration.**
The client identity a credential is checked against must be the one the
consuming path really presents on this machine. Comparing against a pinned
default refuses every credential the path itself just minted, on any
installation whose environment differs from the pin — a self-defeating gate
that looks correct in the repository and fails everywhere else.

## The legacy row

Rows written before the identity capture existed carry no identity, and the
disposition is not "unknown, refuse everything" and not "unknown, allow
anything". Treat such a row as carrying **the only identity it could have
had** — the default route, because no other was reachable when it was
written — and let it replay on that route alone, refused from every other.

This looks like a violation of the unknown rule and is its exception in the
strict sense: the value is not unknown, it is *derivable with certainty* from
when the row was written. State that reasoning beside the constant, because
the next reader will otherwise see a default being invented and either remove
it or generalize it, and both are wrong.

## Bounded credit where the expiry is absent

Distinguish an expiry you cannot *parse* from one the issuer did not *state*.
A credential granted without a stated lifetime still proved a pass, and
discarding it outright throws away a real, cheap response. Give it a short
bounded lifetime from the moment of harvest — minutes, not the issuer's usual
horizon — so it is reusable briefly rather than not at all, and so its worst
case is one wasted cheap attempt. A malformed value gets no such credit: that
one is unknown and fails closed.

## When not to use this

If the credential you hold was minted by your own ceremony, this is the wrong
document — attach the constraints at mint and be done. If reuse is not
actually cheaper than re-earning (a source whose gate is trivial to pass, or a
credential whose lifetime is shorter than the interval between your requests),
skip the store entirely; a reuse path that never hits is a cache with negative
value, carrying eligibility rules that will be maintained forever by someone
who does not know they are dead.
