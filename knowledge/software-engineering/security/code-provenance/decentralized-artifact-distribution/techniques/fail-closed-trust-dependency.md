---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: fail-closed-trust-dependency
status: forged
laws: [absent-guard-is-loud, limits-are-derived, failure-not-empty-success]
shared_with: []
use_when: [a required trust signal's source is unreachable and you are deciding what to serve, choosing the timeout that declares a statement source unhealthy, a malformed trust policy is falling back to a previous or default value, arguing about whether stale approvals may be served during an outage]
---

# Fail-closed trust dependency

Every required statement source in a distribution system is a live dependency
that can go away, and the choice of what happens then is usually made as an
availability trade-off. It is not one. It is a security decision, and the
tempting answers — serve the last known state, treat an unreachable source as
passing, keep the listings that were approved before the outage — each hand an
adversary the same primitive: **make the source unreachable, and every refusal
it was issuing disappears.**

That inverts the economics of the whole system. The cheapest path to publishing
something that would be rejected stops being "evade the check" and becomes
"take down the checker" — a target that is typically smaller, less defended, and
operated by someone with no stake in your registry. Availability of a trust
signal is therefore part of the trust model, not part of the operations budget.

The resilience neighbour's
[refusal-is-not-failure](../../../../backend-platform/resilience/optional-dependency-degradation/techniques/refusal-is-not-failure.md)
establishes the general shape — an extension that objects must not be overridden
by a host that cannot tell objection from breakage — and is not restated. This
technique adds the case that subject does not carry: the dependency is *required
by policy*, the party that benefits from its absence is an attacker, and
degrading open is therefore not a kindness with a cost but a capability handed
to a stranger.

## Demotion, not fallback

The rule has one shape and it is subtractive:

**An unhealthy required source is dropped from the trusted set, and every
listing that depended on its positive statement disappears with it.**

Not "its statements go stale". Not "its last verdicts continue to apply". The
source's authority is withdrawn, its statements stop counting, and because it
held the admission grant, every listing whose visibility rested on its approval
becomes invisible. That is loud, it is unmistakable, and it is the correct blast
radius: the population that vanishes is exactly the population whose safety
claim can no longer be substantiated.

Three properties make the demotion survivable rather than merely correct:

- **It is a state transition, recorded.** The moment of demotion, the failure
  count, and the first failure's timestamp are written, so an operator can tell a
  five-minute blip from a source that has been gone since Tuesday, and so the
  event is attributable during the incident review that follows.
- **Recovery requires replay, not just reconnection.** A source that comes back
  has a gap in its statement history. Restoring its authority without replaying
  the missed interval reinstates a trusted party with a stale view — including
  approvals for revisions it would now block. Mark the source as owing a replay,
  bump a generation counter, and restore authority only when the replay
  completes.
- **The withdrawal propagates to statements already stored.** Marking the source
  untrusted while leaving its previously ingested statements marked trusted
  leaves the demotion decorative in exactly the queries that matter. One
  transaction, both tables.

## The timeout is derived from the source's own budget

The number that separates "briefly quiet" from "unhealthy" is where this
technique is usually botched, and a round number is the signature of the botch.
Too short and a routine reconnection wipes the catalogue; too long and the
attack window is whatever was picked.

Derive it ([limits-are-derived](../../../../_laws.md#limits-are-derived)). The
input is the source's *own* budget for being briefly absent: how long its
scheduled maintenance takes, how long its reconnect and catch-up cycle needs,
how long its identity or session credential is cached. A defensible derivation
is something like *two scheduled-maintenance intervals plus twice the identity
cache lifetime*, so a healthy but idle subscription is guaranteed at least one
reconnect-and-catch-up opportunity before its authority is withdrawn — and the
sentence stating that derivation lives beside the constant, because the constant
will be raised by someone who only sees the alert it fired.

Two corollaries:

- **Health is measured on the connection, not inferred from traffic.** A source
  that legitimately has nothing to say is silent, and silence must not read as
  failure — otherwise the quietest and most careful source is the first demoted.
- **Health and trust are separate columns.** "Reachable" and "authoritative" are
  two facts, and a dashboard showing only their conjunction cannot answer why a
  population of listings disappeared.

## A policy that will not parse denies everything

The same rule applies one level up, to the trust configuration itself, and this
is the case teams get wrong after getting the first one right.

When the policy document — the lists of parties and their grants — fails to
parse or fails validation, the intuitive fallbacks are to keep the previously
loaded policy or to fall back to a compiled-in default. Both are wrong for the
same reason: **a partially-parsed policy is a partially-enforced one**, and the
operator who just deployed a broken policy is the operator least able to tell
that the system is now running someone else's. The previous policy may have been
looser; the default almost certainly is.

Degrade to **deny-all**: an empty required-source list *in the named
deny-everything mode*, an empty state list, an empty redaction list, and a policy
identity that says explicitly that the policy is invalid rather than reporting a
hash of nothing. An empty list must never be reachable by any path other than
this one, or the deny-all state becomes indistinguishable from an open registry
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

The one carve-out worth making is for an explicitly configured emergency
allowlist: an operator response to a total outage that is deliberate, narrow, and
loudly abnormal. It is not a fallback, because nothing selects it automatically —
and an emergency mode that a parse failure can select is not an emergency mode
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Decision rules

- **Never serve a stale positive from an unhealthy required source.** The stale
  positive is the thing the attacker is buying.
- **Demote the source; do not stale its statements.** Withdrawn authority is a
  cleaner concept than aging data, and it propagates to stored rows in one place.
- **Derive the health timeout from the source's own reconnect and maintenance
  budget**, and write the derivation beside the number.
- **A source that comes back owes a replay.** Restore authority after the gap is
  filled, not on reconnection.
- **A trust policy that fails to parse denies everything**, in a mode named for
  that, never by falling back to a previous or default value.
- **An empty required-source list must be reachable only from the deny-all
  path.** Assert it in a test.
- **Count and alert on demotions.** A demotion is a security event; a demotion
  that only appears as a drop in listing count is an incident discovered by a
  publisher.

## When not to use it

- **When the signal is genuinely advisory.** A source whose statements only
  decorate a listing — a badge, a rating — should not be able to empty the
  catalogue by going offline. Advisory sources hold no admission grant, and this
  technique applies only to sources that do.
- **When unavailability of the registry is itself the greater harm.** A system
  distributing an emergency update, or one whose consumers cannot function
  without a fresh catalogue, may correctly choose availability — but the choice
  must be written down with the primitive it concedes, and paired with a
  compensating control the attacker cannot also disable.
- **When there is no third-party source at all.** With one party making all
  statements, its unavailability is an ordinary outage of the system itself, and
  the ordinary resilience discipline applies.
</content>
