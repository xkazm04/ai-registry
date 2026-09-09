---
layer: application
type: application
subject: product-feed-and-catalog-spine
technique: custom-labels-as-bidding-buckets
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Two labels, one ladder, three channels

At commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08) the workspace's
outbound feed carries exactly two custom labels - a margin band and a stock status -
and derives both from the modules the merchant's stock screen already reads. The tree
proves the technique's structural point: a feed label that is re-derived in the feed
module can disagree with the screen, and the way to make disagreement impossible is
to have no second implementation.

## The labels and the buckets

`src/lib/catalog/feed-labels.ts` declares `label0` as one of `marze-vysoka |
marze-stredni | marze-nizka` and `label1` as `sklad-${StockStatus}` over the four
pacing states `ok | low | pause | resuming`. The cutoffs `MARGIN_BAND_HIGH = 0.45` and
`MARGIN_BAND_MID = 0.25` (`:24-25`) are exported so the panel and the tests name the
same numbers the feed does; the comment at `:20-23` gives the design rule verbatim:
"a feed label is a BIDDING BUCKET, not a number - a merchant writes one rule per band,
so three bands is the most that stays actionable." The cutoffs themselves are
convention, and the module does not claim otherwise.

## Derived, never recomputed

The header at `:8-16` states that the module "RE-EXPOSES what the app already
computes; it derives nothing of its own." `feedLabels` and `feedLabelsBySku` (`:53-68`)
call `stockRows` from `src/lib/inventory/compute.ts:107` once and read two fields off
each row: `margin`, which is `marginOf(product)` (`compute.ts:69-74`, the ladder own
margin, else `CATEGORY_MARGINS[category]`, else `CATEGORY_FALLBACK_MARGIN` from
`src/lib/margins.ts`), and `status`, the pacing verdict. The stated reason is the
technique's: a second call to the ladder "could silently disagree with the Sklad screen
the merchant is looking at, so the one call answers both."

Duplicates resolve deterministically at `:64`: `stockRows` sorts worst cover first,
and the first row per SKU wins, so a duplicate SKU's label is the pessimistic one
rather than whichever the catalog listed last.

## One rule set across channels

`src/lib/catalog/feed-out.ts` writes the same two names to every feed in each channel's
own mechanism: `g:custom_label_0` / `g:custom_label_1` on the Google item, and a
`<PARAM><PARAM_NAME>custom_label_0</PARAM_NAME><VAL>...</VAL></PARAM>` pair on the
Heureka and Zboží items through `param` (`:212-214`), with the comment that the shared
names let "a merchant write one rule set across all three channels." `buildRows`
(`:147-158`) computes labels in one `feedLabelsBySku` pass with the caller-supplied
`now`, so a feed served twice in the same second is byte-identical.

The five-slot custom-label mechanism and the practice of segmenting by margin and
stock are the shopping platform's documented feature and practitioner convention
respectively; the tree uses two of the five slots and leaves performance and
seasonality labels unfilled, which is correct for a catalog with no campaign read-back
wired into the feed.

## The blended margin beside the labels

`src/lib/catalog/blended-margin.ts:32-43` computes the catalog's revenue-weighted
margin - weight per SKU is `price * dailyVelocity`, margin from the same `skuMargin`
ladder - and returns `null` when no product SKU carries revenue, with the comment "the
caller renders nothing, never a fake 0 %." That is the margin figure the profit model
offers as a real default instead of a guessed forty-five percent, and it is the
economics the labels push into the channel.

## Deviations

`src/lib/margins.ts:1-20` records that the category margin table is an assumption keyed
to the demo catalog's taxonomy and that a mismatch "silently collapses every SKU" to the
fallback; the label ladder is therefore only as honest as the margin source, and the
tree names the ERP or merchant-center cost pull as the seam that would replace it. The
`docs/specs/wp-W2-D.md` header also scopes the work to "labels only - no bid changes, no
channel API pushes": the buckets exist, and the rules that read them are written by
the merchant inside the channel, which is the technique's intended division.
