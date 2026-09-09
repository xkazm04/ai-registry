---
layer: technique
type: technique
subject: search-term-mining
technique: exact-promote-into-serving-ad-group
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [a query converts repeatedly under a broad or phrase keyword, designing the promote half of a search-term recommender, deciding what to do with a row whose match type is unknown]
---

# Exact promote into the serving ad group

A query that converts under a broad or phrase keyword is paying a broad match's price
for a certainty the account already has. The promotion gives it its own **exact**
keyword, placed in the **ad group that was already serving it**, so it stops competing
for a broad match's budget and inherits the ad and landing page it already converted
through. The move is permanent and, like a negative, rides the governance envelope
rather than being a second way to change an account.

## Eligibility

Three conditions, all required:

- **Conversions at or above the promote floor.** Two is the practitioner convention:
  one conversion on a broad match is regularly a coincidence, and a promote is a
  permanent criterion. The floor sits above any fractional count deliberately; a
  0.6-conversion assist does not earn a keyword.
- **Not already exact.** If the keyword that matched the query is itself exact, the
  promotion creates a duplicate criterion the platform rejects, and even where it did
  not, nothing changes. This is the promote gate's structural half.
- **A classifiable match type.** A row whose match type is absent, unspecified or a
  value the mapper has never seen does **not** pass "not already exact". The mapper
  maps unknown to its own distinct value, and the gate treats that value as
  ineligible. Coercing unknown to a real match type would make an unclassifiable row
  eligible for a permanent keyword; the safe default is the one that loses.

## Where it lands, and why not somewhere better

The destination is the ad group that served the query, identified from the report
row, not chosen. A new ad group has no ad and no page; the campaign's best group has
the wrong ones. The evidence that justified the promotion is that *this* ad and
*this* page converted *this* query, and moving the keyword discards it. Restructuring
a winning query into its own ad group with tailored copy is a later, human decision
made in `responsive-search-ad-craft` terms, after the exact keyword has shown its own
numbers.

The keyword is created **enabled**, explicitly. A criterion created in whatever state
the platform defaults to is not what the operator approved, and a paused promotion
silently does nothing while the ledger says it happened.

## Value semantics

The promote's value figure is the conversion value the query **already produced** on
the window. It is not a forecast of extra value; the honest reading is "keep this",
not "gain this". A promote moves no budget, so a spend simulation over it is an
identity. Any projection that books a promote as incremental lift has invented a
number, and the invented number will be compared against a realized one later and
found wanting.

## The counter-negative question

On the dominant platform, an identical exact keyword in the same account is preferred
over a broad match for that query, so the promote alone redirects traffic. On a
platform without that preference rule, the promotion needs a matching negative on the
originating broad keyword's ad group, or the broad keyword keeps winning the query at
its own bid. Whether the counter-negative is required is a per-platform fact and
belongs in the application layer; the recommender emits it where the platform needs
it and omits it where it does not.

## Procedure

1. Read conversions, match type, ad group and campaign from the row.
2. Test the promote predicate before the negative predicate for every row.
3. Skip rows already spoken for by term and campaign.
4. Emit an exact keyword into the serving ad group, enabled, with the query text as
   reported.
5. Carry the ad group as the destination *name* in the move, and never in a field a
   downstream pass reads as a campaign identifier; a realized-impact pass that
   dereferences a campaign id and finds an ad group has been lied to.
6. Sort promotes by realized value descending, after all negatives.

## Decision rules

- When a query has at least two conversions and is not already exact, promote it into
  the serving ad group, because that group's ad and page are the evidence.
- When the match type is unknown, do not promote, because unknown is not "not exact".
- When the platform does not prefer exact over broad within an account, add the
  counter-negative in the same change-set, because otherwise the promote changes
  nothing.
- When the promote's value is stated, state the realized value and say it is
  realized, because a forecast here is fabricated.
- When the exact keyword has served for a full window on its own, revisit it in
  ad-copy and structure terms; the promote is the beginning of its life, not the
  end.

## When NOT to use

- Not for a query that converted **once**; wait a window.
- Not into a **new** ad group; that is restructuring, not promotion.
- Not for queries under an automated campaign type that does not accept keyword
  criteria; the platform's equivalent is a different mechanism with a different
  owner.
- Not when the account's keyword count in that ad group is already at the point
  where another exact keyword fragments the data below the floors this subject uses
  to judge it; a promote that can never be evaluated is a criterion for its own sake.
