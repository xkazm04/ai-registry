---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: party-club-vs-electoral-list
status: forged
laws: [one-definition-one-import, non-partisan-symmetry]
shared_with: []
use_when: [attributing a member to a party, computing party-level metrics, handling defections and coalition lists]
---

# Party club vs electoral list

"Which party is this member in?" is two different questions wearing one
sentence, and a parliamentary model must keep both answers, because they
diverge routinely and each is correct for a different consumer:

- **The electoral list** — the candidacy the person was elected on. Fixed
  at election, immutable for the life of the mandate, recorded on the
  mandate row. It answers "how did this person get here" and everything
  about the election itself (regional results, list order, coalition
  arithmetic).
- **The parliamentary club** (group, caucus, fraction) — the body the
  member sits with *inside the chamber*. A dated membership window like any
  other, opened at the constitutive session and closable at any time. It
  answers "whose discipline applies to this vote", and it is the only
  correct denominator for cohesion, rebellion, and every whip-line metric.

## Why they diverge

The divergence is not an edge case; it is the political system working as
designed. Coalition lists elect members of several parties into one list
but several clubs — or one club spanning parties. Members defect, are
expelled, go independent, or found a new club mid-term. Small parties'
members join a larger club to gain procedural rights. In many chambers a
club is a body with a legal identity and a president, formed *after* the
election — it simply is not the party, even when it shares the name.

Consequences for the model:

- The list is a **body row of kind electoral-list**, referenced by the
  mandate. The club is a **body row of kind club**, referenced by dated
  membership windows. Same registry, two kinds, two link shapes.
- A "party" node in any derived graph should be the *club*, because nearly
  every behavioral metric is club-relative; the list stays reachable
  through the mandate for electoral questions.
- Club-relative metrics must be computed against the member's club **on the
  day of each vote**, resolved through the membership window — not against
  the club at ingest time. A defector's pre-defection votes are measured
  against the old club's line; anything else retroactively manufactures
  either loyalty or rebellion.

## The misattribution stakes

This distinction is where modeling error turns directly into false claims
about named people. Attributing a defector's history to their new club
fabricates a rebellion streak; using the list where the club belongs scores
a member against a whip that never applied to them. Per
[one-definition-one-import](../../_laws.md#one-definition-one-import), the
resolution rule — *which* affiliation a metric uses, and *as of when* — is
written once and imported by every metric; each consumer restating "join
member to party" in its own words is how the same person ends up with three
different affiliations across one site. And per
[non-partisan-symmetry](../../_laws.md#non-partisan-symmetry) the same
resolution runs for every member identically: independents and members of
dissolved clubs are first-class outcomes ("no club on this date" is an
answer), not rows to drop — dropping them deletes exactly the politically
interesting cases.

## Decision rules

- When a consumer says "party", make it say which one: list for electoral
  context, club-as-of-date for chamber behavior, current club only for
  "today" displays that say "current".
- When aggregating seats per party, count mandates via club windows on a
  stated reference date and print the date; a seat count without a date is
  wrong within the month.
- When the publisher provides only one affiliation stream, model what it
  actually is (usually the club) and record that the other is absent —
  do not synthesize the missing one from names.
- When list and club happen to coincide for most members (a calm term),
  resist the merge anyway; the model cost is one body kind, and the first
  defection converts the shortcut into published errors.

## When not to split

Chambers elected by pure single-member district with no group system, or
datasets covering only elections and no chamber behavior, genuinely have
one affiliation stream — model the one that exists and name it precisely
rather than importing a distinction the institution does not have.
