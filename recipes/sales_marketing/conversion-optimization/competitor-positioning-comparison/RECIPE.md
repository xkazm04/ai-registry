---
name: competitor-positioning-comparison
version: 0.4.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Competitor conversion and positioning comparison

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A snapshot of where competitors stand today says nothing about which direction
anyone is moving, a comparison scored on a different yardstick than the home site means
nothing at all, and a page read once is treated as a position when it may have been one
variant of an experiment the competitor was running that week.

**Input.** The named competitors that actually compete for the same decision, the ledger
of what each has claimed before with the date each claim was first observed, and the
same scoring categories used on the operator's own property.

**Core action.** Establish what changed since the last look, separate a change that has
persisted from a page that was being tested, and score it on the identical categories
used at home so the comparison can be trusted when it says the operator is behind.

**Output.** A comparison reporting movement rather than current state, separating what
was observed from what was inferred, saying plainly where a competitor is simply better,
naming who has stopped moving and naming who could not be reached.

## Activities

1. Read each named competitor's current public position and record what could not be
reached *(observe)*
2. Establish what changed since the last look and when it was first observed *(decide)*
3. Separate a change that has persisted from a page that may have been under test
*(decide)*
4. Score on the identical categories used on the operator's own property *(act)*
5. Report the movement, who has stopped moving and where a competitor is simply better
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The operator knows what competitors have actually shipped since the last look, rather
than what their pages happen to say today.**

- Every claim carries the date it was first observed, labelled as when it was seen
  rather than when it appeared, because the ledger records the watcher's history and not
  the competitor's.
- A comparison reports what changed since the previous comparison, not only current
  state.
- A change seen once is reported as unconfirmed until it survives another look, since
  many sites test their own pages and a single fetch samples whichever variant was
  served.
- A competitor that has stopped moving is reported as having stopped rather than being
  listed again with unchanged scores and no comment.
- Each reported change names the internal artifact it makes out of date, the positioning
  page, the pricing sheet, the battle card or a roadmap item, and a change that makes
  nothing out of date is dropped rather than reported, because what somebody would have
  to revise is the same test as whether the change mattered.

**The comparison separates what it saw from what it inferred, and never presents a gap
in coverage as a finding.**

- What was observed, what was inferred and what was judged are kept apart, and a
  judgment names what would change it.
- A competitor that could not be reached is named as unreached, never silently omitted,
  and a run that reached none of them says so instead of producing a comparison anyway.
- A visible price is reported as the listed price, since what is actually paid is
  negotiated, regional or bundled and a public page cannot say which.
- The first comparison says it is establishing the ledger rather than reporting
  movement, because on a first look everything is newly seen and nothing has moved.

**The comparison is one the operator would still believe on the day it says a competitor
is ahead.**

- Scoring uses the same categories and the same yardstick that were applied to the
  operator's own property, and a category scored only on one side is dropped rather than
  estimated.
- A score the operator overturns is corrected against the category rather than against
  the competitor, since a yardstick that was wrong on one side was wrong on both, and
  the next comparison rescores the operator's own property on the revised category and
  marks the scores taken under the old one as no longer comparable.
- Where a competitor is simply better it is said plainly, and a comparison containing no
  such finding says explicitly that there was none rather than leaving the absence to
  read as a lead.

## Guidance

A page is a claim, not a product, and it is cheap to change and cheap to reverse. What
matters is what survives: a claim still there three looks later is a commitment, one
that vanished was a test. Make each change name what it forces you to revise, and drop
the one that forces nothing. Finding no competitor is a reading about the need rather
than the market, and it is cheap to falsify, so falsify before treating emptiness as an
opening. Say plainly where somebody is ahead.

## Where this is worth adopting

- An operator asked in every investor conversation how he is positioned against three
  named companies, who answers from whatever he last happened to read.
- A market where two of the four tracked competitors have changed nothing in a year,
  which is the most useful thing in the report and is currently invisible because they
  appear every time with the same scores and no comment.
- A team that rewrote its homepage in response to a competitor's new headline, which the
  competitor had reverted inside a fortnight.
- A comparison table maintained by hand in a document, where nobody can now say when any
  row was last checked and half of them are eighteen months old.
- A pricing decision about to treat published list prices as what customers actually
  pay, where the difference between the two is the entire argument.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. Competitors ship on their own schedule and mostly do not, so a fixed clock
spends most of its runs confirming that nothing changed. Look when there is evidence
something moved, a changed page, a release note, a pricing announcement, or when a
competitor has gone long enough unobserved that the ledger's silence about them is no
longer informative.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which competitors actually compete for the same decision and why the operator chose
  them, because a list assembled by market category tracks the wrong companies and
  produces confident irrelevance.
- Which features or claims the operator considers his ground to defend, since movement
  only matters relative to what he is trying to win and everything else is trivia.
- How the operator wants a competitor who is genuinely ahead described, because a
  comparison nobody trusts to say so is not read a second time.
- How often the competitor list itself should be re-justified, since a company that
  stopped moving may have left the market rather than stalled, and the two look
  identical in a ledger.

## Dependencies

None.
