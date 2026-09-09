---
layer: technique
type: technique
subject: product-feed-and-catalog-spine
technique: dispatch-delay-truth-per-feed
status: forged
laws: [never-invent-proof, not-measured-is-not-zero]
shared_with: []
use_when: [serializing a catalog into a shopping or price-comparison feed, parsing a marketplace feed's delivery field, deciding what to do with an unavailable item per channel]
---

# Dispatch delay told truthfully per feed

Feeds do not share a vocabulary for "can the customer have this". The dominant
shopping platform's specification carries an enumerated availability - in stock, out
of stock, preorder, backorder - and requires an availability date on the last two,
disapproving the listing without one. A central-European price-comparison marketplace
carries no boolean at all: its delivery field is a dispatch delay in days - zero for
"ships now", a small integer for days until dispatch, a date for "orders ship from" -
and the marketplace's own catalog treats a short delay as in stock. A serializer that
maps a boolean onto both is wrong on at least one of them.

The rule is that **each feed says what its vocabulary can say truthfully, and says
nothing where it cannot.** The same product can be "out of stock" on one feed and
absent from another, and both are the honest rendering.

## Procedure

1. **Decide availability once, from the record.** A paused item is never available.
   A feed-sourced item trusts the feed's own availability past a sentinel zero count.
   Everything else trusts the warehouse count. One function; every serializer calls
   it.
2. **Where the feed has a true value, use it.** On the enumerated-availability feed,
   an unavailable item is emitted as out of stock. Preorder and backorder are used only
   when the record carries the date they require; without a date they are not
   "roughly right", they are a disapproval.
3. **Where the feed has only a delay, omit what you cannot state.** On the dispatch-
   delay feed, an available item ships now (delay zero) or ships in the delay the
   record knows. An unavailable item has no truthful delay - inventing "30" is a
   delivery promise the shop never made - so the item is left out of that feed. This
   is also the marketplace's own rule for an unsellable item.
4. **Read delays as delays on the way in.** A delivery integer is days to dispatch,
   not an in-stock flag. A cutoff decides which delays count as orderable; the cutoff
   is the marketplace's documented behaviour where it publishes one and a convention
   otherwise, and the technique says which. A date in the field is a future ship date
   and reads as not orderable now.
5. **Preserve tri-state on the way in.** A feed with no availability field has said
   nothing; the parsed item carries undefined, not false, so the merge keeps the
   owner's flag. A feed that says available with no count carries stock zero as
   "unknown", and the record keeps the feed's own availability so the sentinel does
   not read as a preorder.
6. **Always emit a valid document.** An empty catalog produces an empty, well-formed
   feed. A channel robot that receives an error or a broken body de-lists the shop,
   and a transiently empty catalog must not cost a merchant their listings.

## Decision rules

- When a feed's schema demands a value the record does not have, omit the item from
  that feed rather than fabricate the value, because
  [never invent proof](../../../_laws.md#never-invent-proof) covers a delivery date as
  much as a review.
- When a feed-imported item lands with stock zero and availability in stock, it is in
  stock on every outbound feed and in every ad; the zero is
  [not measured](../../../_laws.md#not-measured-is-not-zero), not empty.
- When the record knows a restock date and incoming quantity for an unavailable item,
  the enumerated feed may say backorder with that date; the delay feed may state the
  delay only if the date is firm enough to be a promise, and otherwise still omits.
- When a marketplace also offers a fast availability feed - polled far more often than
  the product feed - the availability truth goes there and the product feed's delay is
  the slower fallback; do not let the two disagree.

## What the feed leaves out, honestly

A per-item link and image are required by shopping feeds, and a catalog that carries
neither must not substitute the shop's homepage - a wrong URL is worse than a missing
one, because the channel will send a shopper to a page that is not the product. A
sale price, a condition, a category hierarchy in the platform's taxonomy each raise a
listing's quality; a serializer that lacks them says so in its contract rather than
guessing. The standard is a complete feed; a partial one is a labelled deviation.

## When NOT to use

Not for offerings that are not products: a plan or a service has no availability and
no dispatch delay, and belongs in neither feed. Not as a substitute for a channel's
own availability polling where one exists - the technique governs what the serializer
may claim, not the channel's refresh cadence.
