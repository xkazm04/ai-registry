---
layer: golden-path
type: golden-path
subject: product-feed-and-catalog-spine
status: forged
use_when: [designing the offering model an ad or feed pipeline reads from, deciding what a shopping or price-comparison feed may say about availability, choosing feed labels for bidding, pausing or scaling ads on stock cover, reconciling a product feed with a warehouse export]
techniques:
  - product-plan-service-routing
  - paused-sku-never-advertised
  - usps-become-ad-benefits
  - dispatch-delay-truth-per-feed
  - custom-labels-as-bidding-buckets
  - days-of-cover-pacing-rules
---

# Product feed and catalog spine

A business sells something, and every marketing surface it runs is a description of
that something: an ad headline, a shopping listing, a price-comparison row, a bidding
rule, a "pause this before it sells out" alert. When each of those surfaces keeps its
own copy of the offering - a fixture here, a spreadsheet there, a hand-typed benefit in
the ad tool - they drift, and the drift is what the customer sees: an ad for a product
that was paused last week, a listing that says "in stock" beside a checkout that says
"four weeks", a bid raised on an item whose margin the bidder never knew.

The discipline of this subject is that **one offering model is the spine, and every
marketing surface reads from it rather than beside it.** The model knows what kind of
thing each offering is, whether it is currently for sale, what it costs the business,
how fast it sells, how much is on the shelf, and which short selling points the owner
actually stated. Ad copy, feeds, labels, margin arithmetic and stock pacing are
projections of that one record. When the record changes, the projections change; when
the projections disagree with each other, the record is where the bug lives.

This subject owns the model and its projections into feeds, labels and pacing. It does
not own the writing of the ad itself - `responsive-search-ad-craft` decides how a
benefit becomes a headline and how many of what length - and it does not own the
anti-fabrication contract that keeps a generated sentence from inventing a review or a
guarantee; that is `grounded-marketing-generation`, and this subject only hands it
facts. Whether a channel is profitable once margin is known belongs to
`profit-on-ad-spend-economics`; the moves that shift spend between campaigns belong to
`budget-reallocation-prescription`. The plan-comparison pages that a plan-kind offering
seeds belong to `positioning-and-pricing-transparency`.

## Three kinds, three routes

An offering is a product, a plan or a service, and the kind is a discriminator, not a
tag. The distinction earns its keep because each kind has properties the others lack
and routes to marketing the others cannot use:

- A **product** has a stock count, a sales velocity, a restock date and usually a
  barcode. It is the only kind that belongs in a shopping or price-comparison feed,
  the only kind with a days-of-cover figure, and the only kind whose ads a stockout
  can invalidate.
- A **plan** has a billing interval, named rivals and differentiators. It seeds
  comparison and alternative pages and the "versus" queries around them; it has no
  stock and no dispatch delay, and a feed that carries it is lying about both.
- A **service** has a price model - from, fixed, or quote - and the localities it is
  offered in. Services times localities is the local-coverage matrix; a service never
  reaches a product feed and never has a stock label.

The naive model gives every offering every field and lets zeros stand in for "does not
apply". That is the origin of the service with zero stock that a pacing rule then
pauses, and of the plan the feed serializer emits as "in stock". Kind-routing exists so
that a surface asks "is this a product?" once, at its entrance, and never sees a field
that has no meaning for the thing it holds. Absence is typed by kind, which is
[not measured is not zero](../../_laws.md#not-measured-is-not-zero) applied to the model
rather than to a metric.

## One active flag, enforced at one seam

Every offering carries a single "for sale now" flag. The owner pauses an item with it;
an availability import sets it from what the feed reported; nothing else writes it.
Downstream, the rule is absolute: **a paused offering never reaches creative
generation, an export, or a feed.** Not as a greyed-out row, not as a warning beside an
ad, not as a listing marked unavailable in a channel that has no unavailable value. It
is filtered out at the one seam where the model becomes a list of things to market.

The reason the filter lives at the seam and not in each consumer is that consumers
proliferate. The batch ad exporter, the single-item ad generator, three feed
serializers, the pacing table and the brand context each read products; the first time
one of them forgets to check the flag, a deliberately paused item is advertised, and
the owner who paused it is the one who finds out. Filtering once, where the model is
adapted for consumption, makes forgetting impossible rather than unlikely. This is the
model-side half of [a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy):
the human's pause is the approval that was withdrawn, and no downstream surface may
override it by omission.

## Fields have owners

The record is fed by several sources that each know different things, and a re-import
is only safe if each field has exactly one owner. A product feed - the shop's own
export, or a marketplace listing - knows name, price, category, availability and
barcode; it does not know margin, sales velocity or an exact stock count, though it
often carries a zero where a count would be. A warehouse or ERP export knows stock,
velocity and cost, and is authoritative for them. So a feed overwrites what it owns and
preserves what it does not; a warehouse source overwrites both. A feed that reports
stock zero has said "unknown", and unknown never wipes a real count. A feed that
carries no availability field at all has said nothing, and nothing never flips a
product the owner paused back to live. Hand-entered fields - selling points, channels,
the online-or-local nature - belong to the owner and survive every import.

The corollary is a ledger. Every import and sync that changes a price, a stock count,
an active flag or a margin appends an event with what changed, from what to what, and
which write path did it. Two weeks later, when someone asks why efficiency fell on the
fourteenth, the answer is in the ledger - the feed dropped the price, or the warehouse
sync reported a stockout - rather than in a guess. A catalog with no change history is
a catalog whose marketing performance cannot be explained.

## Selling points become benefits, and nothing else does

The owner's short selling points on each offering are the only benefit vocabulary a
generated ad may use. The ad request for a product reads product from the name,
benefits from the selling points, and audience from the category; when the selling
points are empty, the fallback is the category or the name - a description, not a
claim. What the model must never do is fill the gap with a plausible benefit: "trusted
quality", "customers' favourite", "fast delivery". Those are proofs nobody supplied,
and [never invent proof](../../_laws.md#never-invent-proof) forbids them at the point of
use, structurally. A deterministic ad floor - the copy produced when no model is
available - follows the same rule: a shipping threshold, a rating, a return window, a
dispatch commitment each appear only when the business supplied the value, and a line
whose value is absent is omitted rather than paraphrased.

Selling points also roll up. The brand context handed to any generator is derived from
the live catalog: the top categories, the item count, the price band in the single
dominant currency, the most frequent differentiators, the channels the offerings are
listed on. A price band across two currencies is not a band; offerings in a minority
currency are left out of it rather than merged. The "nature" of the business - sells
online, serves locally, both - is the consensus of the active offerings, never the
first one's value.

## Availability is told in each feed's own vocabulary

A shopping feed and a price-comparison feed do not share a notion of availability, and
the honest serializer speaks each one's language rather than translating a boolean.
The dominant shopping platform's specification carries an enumerated availability with
in-stock, out-of-stock, preorder and backorder values, and requires an availability
date for the last two. A central-European price-comparison marketplace carries no
boolean at all: its delivery field is a **dispatch delay** - zero for "ships now", a
small integer for days to dispatch, a date for "orders ship from". The marketplace
treats short delays as in stock; a longer delay is a slower listing, not a missing
one.

So the same product tells two truths. On the shopping feed, an item that cannot ship
is listed as out of stock, because the vocabulary has a true value for it. On the
comparison feed, that item is **omitted**, because the only thing the serializer could
write is a delay it does not know, and a fabricated "30" is a delivery promise the
shop never made. Conversely, an item the shop's own feed reported as available but with
no count is "in stock" on both, because the sentinel zero means unknown, not empty, and
reading it as a preorder would be the opposite lie. On the way in, the same rule
reads a delivery integer as a delay and not as an in-stock flag; the serializer that
once treated "3" as sold out paused everything that shipped in three days.

## Labels are bidding buckets, not numbers

Feeds carry a handful of free-form label slots, and their purpose is to let a bidding
rule inside the channel's own tool see something the channel does not know: the
margin of the item and the state of its stock. A label is deliberately coarse. A
merchant writes one rule per label value, so three margin bands and four stock states
are the most that stays actionable; a label carrying the margin to two decimals is a
number nobody can write a rule against. The label values are derived from the same
margin ladder and the same pacing verdict the owner sees on the stock screen - never
recomputed in the feed module - so a label can never disagree with the screen the
merchant is looking at while they write the rule. The same two label names go to every
channel, in each channel's own label mechanism, so one rule set spans all of them.
The band cutoffs are convention and say so; that a bid should differ by margin at all
is [efficiency is not profitability](../../_laws.md#efficiency-is-not-profitability)
pushed into the channel.

## Stock cover paces spend before the shelf empties

Days of cover is stock divided by daily velocity, and it is the one figure that lets an
ad be paused before a customer clicks on something that cannot ship. The pacing ladder
reads it into a verdict - run, trim, pause - with an early-warning band above the pause
line and a "resuming" state for a pause whose restock lands within a planning horizon,
so the recommendation is "pause until the fourteenth, then resume" rather than an
open-ended stop. Every threshold on that ladder is a practitioner convention and is
labelled as one; what is not convention is the shape: a pause line, a trim line above
it, an early warning between, and a horizon that converts a pause into a scheduled
resume when incoming stock is known.

Cover also weights money. Value at risk on a shelf is stock times price times margin -
the profit a stockout would strand - and a seasonal budget plan is capped for months
the current cover cannot sustain, because spending into a shelf that will be empty buys
clicks and refunds. A proposed reallocation moves a fraction of a donor's spend to the
fastest-selling healthy item in the same category and is a proposal table, never a
write; the gate between the table and the account is the same one every money change
passes. The blended margin that anchors those economics is revenue-weighted across
product offerings and is null - rendered as nothing - when no product carries revenue,
never a fake zero and never a guessed round number.

## Failure modes of the naive reading

- **The universal row.** Every kind has every field; a service acquires a stock of zero
  and a pacing rule pauses its ads.
- **The flag carried downstream.** Paused is a column each consumer must remember to
  check; the fourth consumer does not.
- **The fabricated delay.** An out-of-stock item on a comparison feed with a delivery
  value invented to satisfy the schema.
- **The boolean read of a delay field.** A three-day dispatch parsed as "sold out",
  pausing the most orderable items in the catalog.
- **The precise label.** A margin to two decimals in a bucket slot; no rule fits it.
- **The wiped count.** A feed's unknown-zero overwriting a warehouse count, so cover
  collapses to zero and every ad pauses at once.
- **The unexplained dip.** A price the feed changed silently, and a week of
  diagnosing an ad account for a catalog event.
- **The blank benefit filled.** A generated ad awarding "trusted quality" to a product
  whose owner typed nothing.

## Seams with neighbouring subjects

The ad's text - headline lengths, pinning, the number of variants - is
`responsive-search-ad-craft`; this subject supplies the benefit list and the
availability line. The structural anti-fabrication contract is
`grounded-marketing-generation`; this subject is one of its fact sources. Margin-aware
profitability judgements are `profit-on-ad-spend-economics`; the reallocation proposal
described here hands its table to `budget-reallocation-prescription`. Local coverage
for service offerings continues in `local-visibility-and-reputation`; plan comparison
pages in `positioning-and-pricing-transparency`.
