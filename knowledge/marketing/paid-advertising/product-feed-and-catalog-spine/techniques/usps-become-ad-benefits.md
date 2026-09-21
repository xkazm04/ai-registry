---
layer: technique
type: technique
subject: product-feed-and-catalog-spine
technique: usps-become-ad-benefits
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [building the ad request for a catalog item, writing a deterministic ad fallback, deriving a brand context from a catalog]
---

# Selling points become ad benefits

The owner's short selling points on an offering are the only benefit vocabulary a
generated ad may use. The request handed to an ad generator for a product is built
from the record alone: the product is the name, the benefits are the selling points
joined, the audience is derived from the category. When the selling points are empty,
the benefits fall back to the category or the name - a description of what the thing
is, never a claim about how good it is.

The line this technique draws is between a **benefit** (something the owner said is
true of the offering) and a **proof** (a number, rating, guarantee or promise that
makes it credible). Selling points are benefits and may be restated; proofs must be
supplied as values or omitted, per [never invent proof](../../../_laws.md#never-invent-proof).
The two are easy to blur in a hurry: "free shipping" is a benefit if the owner listed
it and a fabricated promise if a template added it.

## Procedure

1. **Read benefits from the record.** Build the ad request from name, selling points
   and category by one pure function, so the interactive generator and the batch
   export send byte-identical requests and cannot drift.
2. **Fall back to description, not to praise.** An empty selling-point list becomes
   the category or the name. It does not become "quality you can trust". A validator
   that requires a non-empty benefit is satisfied by a description.
3. **Carry proofs as typed slots.** A deterministic fallback ad - the copy produced
   without a model - takes a claims object: a free-shipping threshold, a published
   rating, a return window, a dispatch commitment. Each line is emitted only when its
   value is present. A missing value omits the line; it never paraphrases into a
   vaguer promise.
4. **Filter blanks.** A feed-imported product often carries no selling points, or
   blank ones. Every fragment that joins them is built conditionally so an empty list
   never reaches copy as a dangling separator or an empty clause.
5. **Roll up for the brand context.** The context given to any generator is derived
   from the live catalog: top categories, item count, price band in the single
   dominant currency, the most frequent selling points and differentiators, the
   channels. It ends with an instruction to stay within this catalog - and the
   instruction is the weakest part of the mechanism, because the structure (only
   catalog facts are present) is what actually holds.

## Decision rules

- When a headline slot would be empty because the owner supplied fewer selling points
  than the slot count, leave it empty or fill it with a descriptive fact (category,
  price), because a filler such as "customers' favourite" is a review nobody wrote.
- When a proof value exists but is stale - a rating from a year ago - it is still the
  owner's to supply; the generator does not decide freshness, the record's provenance
  does, and the label sits beside the value per
  [provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled).
- When two currencies appear in the catalog, the price band is computed within the
  dominant one and the others are omitted from the band, because a band across
  currencies is not a range.
- When the source of a selling-point field is a feed, its first entry is often the
  manufacturer, not a benefit; read it as the importer wrote it, and do not advertise
  a brand name as a selling point.

## The availability line

Availability copy is a proof, not a benefit. "In stock" may be asserted when the
record says the item is available; "ships within N hours" only when the owner
committed to N; and an item that is not available gets no availability line at all
rather than "preorder now" or "back soon", because those are promises about a future
the record does not know. The availability truth per feed is its own technique; the
ad follows the same fact.

## When NOT to use

A hand-written ad by the owner is not bound by the record - they may say what they
know. This technique governs generated and templated copy. It also does not decide
how a benefit is phrased for length, pinning or variant count; that is the
responsive-ad craft, which takes the benefit list this technique produces as its
input.
