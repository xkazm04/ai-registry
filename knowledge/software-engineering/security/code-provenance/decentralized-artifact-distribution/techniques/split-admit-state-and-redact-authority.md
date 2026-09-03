---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: split-admit-state-and-redact-authority
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [a config has a trusted-moderator boolean and an operator wants to accept takedowns but not approvals, two parties have both issued a terminal state for the same revision, deciding which third parties an index listens to and for what, designing the trust configuration for a registry that federates moderation]
---

# Split admit, state and redact authority

"Moderator" is not one power, and modelling it as one — a party in a trusted
list, a `trusted: true` column, a role name — makes the most common real policy
inexpressible. An operator very often wants to honour a party's **takedowns**
without honouring its **approvals**: a regional authority whose legal notices
must be respected but whose editorial judgement the operator does not delegate;
a safety organization whose blocks are valuable and whose silence should not
mean admission. A single boolean forces that operator to accept everything or
nothing, and the choice they actually make is nothing, which is how a system
with a moderation feature ends up with no moderation.

## The three grants

Separate them in the configuration, in the evaluation, and in the audit trail.

- **Admission** — this party's positive statement is *required* before a listing
  is visible at all. A required source is a veto by silence: absent a positive
  statement from it, nothing is shown. This is the strongest grant in the system
  and the only one whose *absence* changes an outcome.
- **State** — this party's statements are accepted as the listing's status:
  pending, under review, error, passed, overridden. Accepting state means
  believing this party's account of where a listing is in its lifecycle, without
  granting it the power to be the reason a listing appears.
- **Redaction** — this party may take a listing down. It is the grant most often
  wanted in isolation, it is the one with legal weight behind it, and it must be
  configurable without any of the others.

A party may hold any subset. The configuration is three lists, not one list with
a role column, because a role column is a closed vocabulary that will be extended
by whoever needs the fourth case and will then mean different things in the two
places it is read ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

Two structural rules keep the split honest:

- **The admission list may not be empty.** An empty required-source list means
  "no positive statement is required", which is an open registry — a legitimate
  configuration, but one that must be reached by an explicitly named mode rather
  than by a list that happens to have nothing in it. An empty list arrived at by
  accident is the guard that switched itself off
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- **The state list is the union of the state grant and the admission grant.** A
  party whose positive statement is required is necessarily a party whose
  statements about status are believed; deriving that union in one place stops
  the two lists from disagreeing about a party added to only one of them.

## Evaluation order, and why it is not arbitrary

The grants interact, and the order in which they are consulted is a policy
statement. The order that survives review:

1. **Publisher deletion** — the record is gone from its origin. Nothing else is
   consulted; there is no listing to have a status.
2. **Redaction** — a takedown from a party holding the redaction grant. It
   outranks every positive statement, including a required source's approval,
   because the redaction grant exists precisely for the case where something
   approved must nonetheless come down.
3. **Conflict** — see below.
4. **Required positives** — every party holding the admission grant must have a
   current, applicable positive statement. The result names *which* were present
   and *which* were missing, because "not visible" without that pair is
   unactionable.
5. **Status** — from parties holding the state grant, for display only.

Redaction before required-positives is the load-bearing edge. The inverse order
produces a system where a listing that never got approved cannot be *taken down*
— it is merely invisible — and the distinction matters the moment anyone asks
whether a notice was complied with.

## The collision rule: two terminal states fail closed

Terminal states — blocked, passed, overridden, deleted — are mutually exclusive
claims about the same revision. In a system with several independent parties,
two of them can be live at once: a party issues a block, another issues a pass,
both are applicable, both are within their grants. Also possible is one party
issuing two contradictory statements for the same revision, which the ingestion
path must preserve rather than reconcile.

**Two live terminal states resolve to a distinct conflict outcome that is not
visible, and never to a pick.** Picking — most recent wins, most severe wins,
first configured wins — encodes a policy nobody wrote, and the "most severe
wins" variant, which sounds safe, is an admission channel in disguise the moment
severity ordering is inverted anywhere. Conflict is its own state precisely
because it is not a value on the visible/invisible axis
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): the system
does not know what the answer is, and rendering that as either answer is a lie
in one direction or the other.

The conflict state needs three things to be usable: it must be **queryable**, so
an operator can find every listing currently in it; it must **carry the
statements that collided**, so the resolution is a decision rather than an
investigation; and it must be **counted**, because a rising conflict count is
the earliest signal that two configured parties have diverging policies and the
operator's trust configuration no longer expresses what they meant.

## Decision rules

- **Never ship a single trusted-moderator flag.** If the configuration cannot
  express "accept this party's takedowns, ignore its approvals", it does not
  express the policy operators actually hold.
- **Grants are per party and per kind, and both are recorded with the decision.**
  A listing's state must be attributable to a grant that was configured at the
  time, not to the current configuration.
- **Redaction outranks approval; deletion outranks everything.**
- **Two terminal states never pick a winner.** Fail to a named conflict state,
  invisible, queryable, counted.
- **Required-positive results name the missing sources**, not just the count. The
  set is what an operator acts on; the count is what a dashboard displays.
- **Adding a party to any list is a reviewed change with a version and a hash.**
  The trust configuration is the highest-privilege object in the system and it
  usually lives in an environment variable, which is the least reviewed place in
  the deployment.

## When not to use it

- **When there is exactly one moderating party and there will only ever be one.**
  Then the three grants are the same list and the split is ceremony. Note that
  "there will only ever be one" is a claim about the future that federated
  systems falsify quickly; the migration from a boolean to three lists requires
  re-deriving every operator's intent from a value that never carried it.
- **When statements are advisory and nothing branches on them.** A display badge
  that no admission path reads needs no grant model — and needs to be honest
  that it is decoration.
- **When the redaction obligation is legal and non-delegable.** If the operator
  must action notices itself, the redaction grant is held by the operator alone,
  and the configuration should say so rather than modelling a delegation that
  policy forbids.
</content>
