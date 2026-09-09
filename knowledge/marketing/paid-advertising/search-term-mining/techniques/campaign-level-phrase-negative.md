---
layer: technique
type: technique
subject: search-term-mining
technique: campaign-level-phrase-negative
status: forged
laws: [a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [choosing the scope and match type of a mined negative, the same wasteful query reappears after a negative was added, deciding when a negative theme graduates to a shared list]
---

# Campaign-level phrase negative

A negative keyword has a scope (account list, campaign, ad group) and a match type
(broad, phrase, exact), and a mining pass that emits one has decided both whether it
meant to or not. The default that survives most accounts, and the one a recommender
emits unless a stated reason overrides it, is **campaign scope, phrase match**.

## Why campaign scope

A wasteful query is wasteful for the whole campaign. If ad group A matched it this
week, ad group B with an overlapping keyword will match it next week, and an ad-group
negative on A moves the leak rather than stopping it. Campaign scope closes every
group at once, and - which matters as much for a governed change - one campaign-level
criterion is **one thing to revert**. A negative added to six ad groups is six ledger
entries, six removals, and six chances for a partial revert to leave the account in a
state nobody approved.

Ad-group scope has one legitimate job that is not waste removal: **routing**. When
two ad groups can both match a query and the wrong one wins the internal auction, an
ad-group negative on the loser sends the query to the group whose ad and landing page
fit it. That is a structure decision made by a person looking at both groups, not a
mining output, and a recommender should not emit it.

## Why phrase match

- An **exact** negative blocks one literal string. Every longer query containing it
  - the same wasteful intent with one more word - comes straight back through, and the
  operator, who sees the same waste next period, concludes the mining did nothing.
- A **broad** negative, on the dominant platform, blocks any query containing all the
  words in any order. It reaches into queries the operator never saw and never
  approved blocking, which is the wrong failure direction for a permanent, silent
  change.
- A **phrase** negative blocks queries containing the words in that order, with
  anything before or after. It is wide enough to catch the variants that share the
  wasteful intent and narrow enough that the operator can predict from the row what
  it will block.

This is platform-documented behaviour for the dominant platform's negative match
types as of 2026; a second national platform may define its negative match types
differently, and the application layer states which.

## Negatives do not expand to close variants

The documented behaviour that most often surprises a team: positive keywords match
plurals, misspellings and same-intent rewrites; negative keywords match their literal
text and **nothing else**. A negative on one spelling leaves the misspelling serving.
A negative on the singular leaves the plural serving. The procedural consequence is
that a mined negative is added with the variants the report actually shows, and the
next mining pass is expected to surface the ones it did not.

## Procedure

1. Emit the negative at campaign scope, phrase match, with the query text exactly as
   reported (trimmed, original casing irrelevant on most platforms).
2. De-duplicate on term and campaign before emitting. The report can list the same
   query under several ad groups of one campaign; a campaign-level negative added
   twice is one useful criterion plus one platform error.
3. Include in the same change-set the observed variants of the same term that also
   clear the gate; do not synthesize variants the report did not show.
4. Record the created criterion's identity in the ledger so the revert is a removal
   by identity, never a text search.
5. When the same negative theme clears the gate in three or more campaigns, or is a
   cross-account exclusion by policy (job-seekers, free, a competitor the business
   will not bid against), move it to a **shared negative list** attached to those
   campaigns and remove the per-campaign copies, so the theme is maintained once.
   The "three campaigns" trigger is convention.

## Decision rules

- When a mined negative is emitted, emit it at campaign scope, because a leak is a
  campaign's, and one criterion is one revert.
- When a mined negative is emitted, use phrase match, because exact leaks the
  variants and broad overreaches into unseen queries.
- When a negative is added, add its observed variants too, because negatives do not
  expand to close variants on the dominant platform.
- When one theme recurs across campaigns, promote it to a shared list, because a
  theme maintained in six places drifts in five of them.
- When the mining source was a campaign-type that does not expose per-query
  negatives (an automated shopping or asset-based campaign whose exclusions live at
  account level), route the negative to the account-level mechanism the platform
  offers and say that its scope is wider than the finding.

## When NOT to use

- Not for **routing** between ad groups; that is an ad-group negative chosen by a
  person.
- Not for a query the operator wants blocked **only in one ad group** while other
  groups should keep it; that is a structure decision, and a campaign negative would
  overreach.
- Not for **brand protection** against a competitor's name where the platform's
  policy or the business's strategy differs from waste removal; those are list-level
  policy negatives set once, not mined.
- Not as a broad negative to "catch everything"; the overreach is invisible until a
  converting query stops serving.
