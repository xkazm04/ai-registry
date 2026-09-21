---
layer: technique
type: technique
subject: product-feed-and-catalog-spine
technique: product-plan-service-routing
status: forged
laws: [not-measured-is-not-zero]
shared_with: []
use_when: [designing the offering model for a mixed business, deciding which offerings a feed or a pacing rule may read, adding a marketing module that reads the catalog]
---

# Product, plan and service routing

An offering model is a discriminated union: every record declares whether it is a
product, a plan or a service, and each kind carries only the fields that mean
something for it. A marketing surface then routes by kind at its entrance - it asks
once, and it never sees an offering whose fields it cannot honestly use.

The alternative, one wide row with every field and zeros where a field does not apply,
is cheaper to write and expensive forever after. A zero stock on a service is not a
stockout; a missing interval on a product is not a one-off plan; a plan in a shopping
feed has neither the availability nor the dispatch delay the feed demands. The wide row
turns "does not apply" into a number, and every consumer downstream has to remember
that the number is not real.

## What each kind carries

- **Product** - a stock count, a daily velocity, an optional restock date and incoming
  quantity, usually a barcode. It is the only kind with a days-of-cover figure, the
  only kind a shopping or price-comparison feed may contain, and the only kind whose
  ads a stockout invalidates. Its route: feeds, stock pacing, seasonality, product ads.
- **Plan** - a billing interval (monthly, yearly, one-off), a list of named rivals,
  and differentiators. Its route: comparison, alternative and "versus" pages, pricing
  transparency, the brand context's differentiator list. No feed, no stock label.
- **Service** - a price model (from, fixed, or quote) and the localities it is offered
  in. Its route: the local-coverage matrix (services times localities), local pages,
  business-profile categories. No feed, no stock label, no velocity.

All three share a base: name, category, the active flag, a price and its currency, an
optional cost and margin, the channels the item is listed on, and the owner's short
selling points. Shared fields are what the brand context and the ad benefits read;
kind-specific fields are what each specialised module reads.

## Procedure

1. **Discriminate at the type.** The kind is a field with a closed set of values, and
   the kind-specific fields exist only on that variant. A reader that has not checked
   the kind cannot address a stock count.
2. **Route at the entrance of every consumer.** A feed serializer, a pacing table, a
   comparison-page seeder each filter to their kind first, then work. A consumer that
   handles "all offerings" and branches inside is the wide row in disguise.
3. **Adapt, do not flatten.** When an older module reads a narrower shape - a product
   record without the kind - adapt the product variant into it through one function,
   and make that function the seam where the active filter also lives.
4. **Type the absences.** A service has no days of cover; render nothing, not zero.
   A plan has no availability; it is not in the feed at all rather than marked
   available. This is [not measured is not zero](../../../_laws.md#not-measured-is-not-zero)
   applied to a model field.
5. **Derive whole-catalog facts by consensus.** The business's nature - online, local,
   or both - is the single shared value when every active offering agrees and "hybrid"
   otherwise; never the first record's value.

## Decision rules

- When a new module needs the catalog, ask which kind it can honestly act on, and read
  only that kind, because a module that "handles everything" will eventually pause a
  service for lacking stock.
- When a source can only produce one kind - a product feed produces products - the
  import touches only that kind and leaves the others untouched, because a re-import
  that deletes the plans is a data loss disguised as a sync.
- When a field is meaningful for two kinds but computed differently - the headline
  price of a plan is a "from" price, a product's is its selling price - keep it on the
  base and let the kind say how to read it, rather than duplicating it per variant.
- When a business has offerings of more than one kind, its marketing surfaces are a
  union of routes, not a single generic one; a shop that also offers installation has
  a feed for the products and a coverage matrix for the service.

## When NOT to use

A business with one kind of offering and one consumer does not need a union; a flat
product table with an active flag is the right size. Introduce the discriminator when
the second kind appears or when the second consumer starts reading fields it should
not. Do not use kind-routing to model variants of a product (size, colour) - those are
attributes of one product, not kinds, and belong in the feed's own variant grouping.
