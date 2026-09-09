---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: dispatch-delay-truth-per-feed
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Omitted from the delay feed, out of stock on the enumerated one

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08)
serializes one catalog into three outbound feeds - Google Merchant RSS 2.0, Heureka
and Zboží.cz `SHOPITEM` - from `src/lib/catalog/feed-out.ts`, and parses the same three
shapes on the way in from `src/lib/catalog/feed.ts`. The two files together prove the
technique's structural claim: an unavailable item is not translated into each feed's
vocabulary, it is emitted where a true value exists and dropped where none does.

## Availability decided once

`feedAvailable` (`feed-out.ts:117-121`) is the single rule every serializer calls: a
paused offering is never available; a feed-sourced offering (`source` of `feed` or
`merchant-center`) trusts the feed's own availability; everything else trusts
`stock > 0`. It is the same rule `toProduct` applies at `offering.ts:130`, where a
feed-sourced row carries `available: o.active` past the sentinel `stock: 0` that
`feedItemsToOfferings` writes for a feed with no count (`feed.ts:329`). The
in-stock-with-unknown-count case therefore reads "in stock" on both the feed and the
ad, which is the technique's "not measured is not empty" rule in code.

## Two feeds, two truths

The Google serializer emits `g:availability` as `in stock` or `out of stock`
(`feed-out.ts:166-167`) for every live product row. The Heureka/Zboží serializer
filters to `r.available` first (`:218`) and writes `DELIVERY_DATE` as the constant
`DISPATCH_NOW = "0"` (`:207`, `:231`) for the rows that remain. The header comment at
`:24-29` states the reason in the technique's terms: those two channels carry no
in/out-of-stock boolean, the delivery field is a dispatch delay in working days, "an
unavailable SKU has no truthful delay to state, and inventing one ('30') would be a
fabricated promise, so it is OMITTED from those two feeds - which is also both channels'
own rule for an unsellable item. Google keeps it, because `g:availability` has a real
`out of stock` value to tell the truth with."

Both readings match the platforms' own documentation as of this verification: the
shopping platform's specification enumerates `in_stock`, `out_of_stock`, `preorder`
and `backorder` (the last two requiring `availability_date`, else disapproval), and the
Czech comparison marketplace documents `DELIVERY_DATE` as the number of days until
dispatch, with `0` meaning in stock and values `0-3` shown as in-stock in its catalog.
That `0-3` rule is documented platform behaviour, which is why the parser's cutoff is
a fact and not a convention.

## The inbound parser reads a delay as a delay

`heurekaInStock` (`feed.ts:130-137`) maps a plain integer to
`Number(d) <= HEUREKA_MAX_DISPATCH_DAYS` with the constant at `:123` set to 3, a date
to `false`, and an absent or blank value to `undefined`. The comment at `:119-122`
records the incident that produced it: the earlier test `delivery === "0"` treated a
bare `"3"` as unavailable and paused products that ship in three days. Tri-state
survives into the offering at `feed.ts:318` (`active: it.inStock as boolean`, with the
comment that undefined must not flip a manually paused product), and the merge honours
it at `import.ts:61` (`active: incoming.active ?? existing.active`).

## Always a valid document

`feedOut` (`feed-out.ts:258-262`) returns an empty-but-well-formed feed for an empty
catalog, with the comment that a channel robot receiving a 404 or a broken body
de-lists the shop. The acceptance oracle in the spec header of `docs/specs/wp-W2-D.md`
is the round trip `parseFeed(feedOut(x, f))` through the repository's own importer,
rather than a fixture that agrees by construction.

## Deviations

The feeds omit per-item `link` and `image_link` on purpose (`feed-out.ts:18-22`): the
catalog carries neither, and the homepage would be a wrong URL rather than a missing
one. They also emit no `sale_price`, no `condition`, and `product_type` as the flat
category string rather than a hierarchy. The technique's standard is a complete feed;
the tree records the gap in its own header and leaves the slot for a per-offering URL
seam.

The deterministic ad floor in `src/lib/catalog/generate.ts` contradicts the tree's own
availability rule for the unavailable branch: `stockLine` falls to `"Předobjednejte
ihned"` ("preorder now", `:111`) and the description clause to `"Naskladnění brzy."`
("restocking soon", `:150`) when `inStock` is false, and two headline slots fall to
`"Ověřená kvalita"` / `"Oblíbená volba zákazníků"` (`:122-123`) when the owner supplied
fewer than two selling points. Each is a promise or a proof the record does not carry.
The standard stands: an unavailable item gets no availability line, and an empty
benefit slot is filled with a descriptive fact or left empty.
