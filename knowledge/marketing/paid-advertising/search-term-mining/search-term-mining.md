---
layer: golden-path
type: golden-path
subject: search-term-mining
status: forged
use_when: [turning a search-terms report into negative keywords, deciding whether a query has earned its own exact keyword, designing or reviewing an automated negative/promote recommender, auditing why a converting query stopped serving]
techniques:
  - zero-conversions-on-unrounded-count
  - spend-and-click-floors-before-negation
  - campaign-level-phrase-negative
  - exact-promote-into-serving-ad-group
  - negatives-before-promotes
  - never-mine-demo-data
---

# Search-term mining

This subject owns the reading of the queries a paid-search account actually matched and
the two permanent changes that reading produces: a **negative** that stops a leak, and an
**exact-match promotion** that protects what converts. It owns the eligibility rules
for each, the one invariant that no threshold may violate, where each criterion lives
and at which match type, the order they are emitted and applied in, and the rule that
a demo or degraded read never mines anything. It does not own what is wrong with a
campaign - `campaign-anomaly-triage` owns severity and the ordering of attention - and
it does not own the envelope a change rides in: `budget-reallocation-prescription` owns
the simulate, guardrail, approval and ledger gate that a term move is fed into. Which
keywords to bid on in the first place is `search-intent-classification` and
`keyword-metric-reliability`; the copy the promoted keyword will serve is
`responsive-search-ad-craft`; whether a platform's conversion count is the truth is
`attribution-and-incrementality`.

## The report is where the account confesses

A keyword is what the advertiser asked for. A search term is what the platform sold
them. Under the matching regimes every major platform has moved to - broad match as the
default under automated bidding, "exact" match that includes plurals, misspellings and
same-intent rewrites, close variants that sweep in synonyms - the gap between the two is
the largest controllable source of waste in a search account, and the search-terms
report is the only place it is visible. Every query in it is a purchase the account
made without being asked. Mining is the discipline of reading that ledger and deciding,
query by query, which purchases to refuse in future and which to make deliberately.

Two facts about the report shape everything downstream. It is partial: the dominant
platform aggregates queries below a privacy threshold into an opaque bucket, and
practitioner measurements put the hidden share around 40% of clicks and spend, above
80% on some broad-match keywords - so a pass that orders by cost and stops after a
bounded number of rows is reading what exists in the order that matters. And its
conversion column is **fractional**: data-driven attribution splits one order across
the clicks that led to it, and consent-driven modelling fills gaps with estimates, so a
query that helped close a sale shows 0.4, never a clean integer. That single fact is
why the subject has an invariant rather than a threshold.

## The one invariant

**A query with any conversions is never negated.** Not "few conversions", not "below
the account's rate", not "rounds to zero": any. The test is `conversions === 0` on the
number the report gave, read without rounding, and every other rule in the subject is
subordinate to it. The reason is asymmetric cost. A negative keyword is permanent,
silent and - at campaign or list level - broad: it does not fire an alert, it does not
show as a dropped keyword, it simply removes a query from every future auction. Blocking
a converting query destroys revenue that nobody will attribute to the negative for
weeks, because the symptom is an absence. A false positive on the negative side is
therefore an incident; a false negative (a wasteful query left alone one more period)
is a rounding error in the budget. The gate is built for that asymmetry.

The naive implementation breaks the invariant at the mapper, not at the rule. A parser
that casts the conversion column to an integer, a spreadsheet that formats it to zero
decimals, a rule that says "fewer than one conversion" - each turns 0.4 into 0 and hands
a converting query to the negative branch with the rule itself apparently intact.
[Not measured is not zero](../../_laws.md#not-measured-is-not-zero) has a twin here:
*rounded to zero is not zero*. The unrounded count is kept, the gate is an exact
comparison, and a property test over random fixtures asserts that no emitted negative
carries a conversion above zero - a case table pins the threshold as written, only the
property pins the invariant as meant.

The mirror case is the promotion. Fractional conversions cut the other way there: 0.4
conversions is not proof that a query deserves its own keyword, and a promote is also a
permanent change. A promotion floor of two conversions is the practitioner convention
because one conversion on a broad match is regularly a coincidence; the floor is
convention and is labelled so.

## Floors before negation, and what they are relative to

Zero conversions is only evidence once the query has been given a chance to convert.
Three clicks and no order is not a leak; it is a query nobody has looked at yet. So the
negative gate takes two floors before the zero means anything: a **click floor**,
below which the absence of a conversion is noise, and a **spend floor**, below which a
permanent criterion costs more operator attention than it recovers. Both are read on
the same window as the conversion count, and both sit *after* the invariant, never in
place of it.

The principal's version of the floors is relative, not absolute. The click floor is the
number of clicks at which zero conversions would be surprising given the account's own
conversion rate: at a 2% rate, a query needs on the order of 150 clicks before zero
conversions is more than one-in-twenty unlucky; at 10%, about 30. The spend floor is
stated in units of the account's target cost per acquisition - a query that has spent
one or two target CPAs without converting has earned its negative; one that has spent a
tenth of a CPA has not. An absolute floor - a fixed currency amount, a fixed click
count - is what a team writes on day one, and it is a legitimate starting convention
for a small account whose rate and target are not yet known. It stays labelled as a
convention, and it is replaced by the relative form as soon as the account has a
measured rate and an agreed target, because a fixed floor is simultaneously too strict
for a high-converting account and too loose for a low-converting one.

The window itself needs a **lag allowance**. Conversions arrive after clicks, sometimes
days after; a report pulled to today counts the last few days' clicks in full and their
conversions not at all. A mining window ends before the account's conversion lag, or
the rule excludes queries whose clicks are concentrated in the tail of the window. This
is [statistical honesty before a verdict](../../_laws.md#statistical-honesty-before-a-verdict)
applied to a single row.

## Where a negative lives, and at which match type

A negative has a scope and a match type, and both are decisions. The default that
survives most accounts is **campaign level, phrase match**. Campaign level because a
query that wastes money in one ad group wastes it in every ad group of that campaign
that could match it, and because one campaign-level criterion is one thing to revert
rather than one per ad group. Phrase because an exact negative blocks one literal
string and lets every longer query containing it straight back in, which reads to the
operator as "the tool did nothing"; and because a broad negative, on the dominant
platform, blocks any query containing the words in any order, which overreaches into
queries the operator never saw.

The documented behaviour that governs the rest is that **negatives do not expand to
close variants**: a positive keyword matches its plurals and misspellings; a negative
matches its literal text and nothing else. The same waste under a variant spelling
next period is the commonest finding of a second pass. So a negative is added with its
observed variants, and a theme recurring across campaigns graduates to a **shared
negative list** so it is maintained in one place.

An ad-group-level negative has its own job - routing a query to the group whose ad and
page fit it - which is a structure decision, not waste removal, and never a mined
default.

## Where a promote lands

A query that converts under a broad or phrase keyword is paying a broad match's price
for an exact match's certainty. The promotion adds the query as an **exact keyword in
the ad group that was already serving it** - not a new ad group, not the campaign's
best-performing group - because that group's ad and landing page are the ones the query
already converted through, and moving it would discard the evidence that justified the
move. The criterion is created enabled and explicitly so; a keyword created in whatever
state the platform defaults to is not what the operator approved.

Three exclusions guard the promote. A query whose matched keyword is already exact is
not promoted: the result is a duplicate criterion the platform rejects, and nothing
would change if it did not. A query whose match type the report could not classify is
**not eligible** either: the gate is "not already exact", and coercing an unknown into
a real match type would make an unclassifiable row eligible to become a keyword, so
unknown maps to its own value that fails the gate. And where the platform does not
prefer an identical exact keyword over the broad one it came from, the promote needs a
counter-negative on the originating keyword - a per-platform fact for the application
layer.

## The order, and why it is pinned

Negatives are emitted first, costliest first; promotes second, highest realized value
first; the blast-radius cap of the governance envelope bites at the end. The order
decides what survives the cap, and a stopped leak is the move an operator can judge
from the row alone, whereas a promote asks them to believe a value projection. The
apply loop walks the same order, so the account stops leaking before anything is added
to it. Every query is spoken for at most once, keyed on term and campaign, and the
promote branch is tested before the negative branch so that no future change to either
threshold can produce a change-set that blocks and promotes the same query in one
approval.

The value semantics are stated, not implied. A negative's saved cost is **not value**;
a promote's value is what the query **already produced** - "keep this", not "gain
this"; neither moves budget, so a spend simulation over a terms-sourced set is an
identity. Anything else puts a fabricated lift on the approval screen, which is
[a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy) failing at
the step it exists for.

## Demo data never mines

A connector that fell back to sample data, a degraded fetch, a demonstration tenant -
none of these produce a mining pass, and none overwrite stored real terms, because
mining fabricated queries puts a fabricated term one approval click from a live
account. The rule is structural, not a label: the step is skipped outright when the
source is degraded, and the sample source answers with nothing so it cannot replace
real rows even if the skip were bypassed. A labelled recommendation on demo data is
still a recommendation, and
[provenance is binary and labelled](../../_laws.md#provenance-is-binary-and-labelled)
forbids illustrative data from ever being diagnosed as the client's.

## Beyond single rows: n-gram mining

Row-by-row mining catches the expensive individual query. The principal's second pass
aggregates: split every visible query into its one-, two- and three-word tokens, sum
clicks, cost, conversions and value per token, and apply the same invariant and floors
to the **aggregate**. A token spread across forty queries each too cheap to clear the
row floor, with three target CPAs spent and zero conversions between them, is a phrase
negative the row pass could never see. The invariant holds unchanged: a token with any
conversions across its queries is not negated as a token. The same aggregation finds
themes worth their own ad group rather than one exact keyword.

## Failure modes of the naive reading

- **The integer conversion column.** The invariant intact in the rule, broken in the
  parser; found only by a property test or by a converting query that went dark.
- **The floor without the invariant.** "Under one conversion and over the spend floor"
  reads sensibly and negates 0.4-conversion queries every period.
- **The exact negative, and the variant never added.** One string blocked, every
  variant leaking; negatives do not expand, so the misspelling keeps serving.
- **The promote into the wrong group, or from an unknown match type.** A new ad group
  without the converting ad and page; an unclassifiable row made eligible for a keyword.
- **Saved cost booked as gain.** Every projection with a negative in it inflates.
- **The fixed floor kept forever, and the lag-blind window.** A day-one constant never
  replaced by the CPA-relative form; yesterday's clicks negated before their
  conversions arrive.
- **The demo mine.** A fixture query as a real criterion, one click from live.

## Seams

Severity and the ordering of attention across campaigns belong to
`campaign-anomaly-triage`; this subject emits query-level moves and ranks no campaign.
The simulate, guardrail, cap, approval and reversible ledger a term move rides through
belong to `budget-reallocation-prescription`; this subject states only that its moves
ride that envelope and what their values mean inside it. Whether a fractional
conversion is causally true is `attribution-and-incrementality`; here the platform's
count is the eligibility signal because it is the only per-query one, under the caveat
that [platform-reported is not causal](../../_laws.md#platform-reported-is-not-causal).
Illustrative-versus-real data as a product discipline is
`honest-proof-and-illustrative-data`; the refusal to mine it is restated here because
the consequence is a permanent account write.
