---
layer: technique
type: technique
subject: product-feed-and-catalog-spine
technique: custom-labels-as-bidding-buckets
status: forged
laws: [efficiency-is-not-profitability, label-convention-as-convention]
shared_with: []
use_when: [choosing what a feed's custom label slots carry, letting a merchant bid by margin or stock inside the channel, keeping feed labels consistent with the stock screen]
---

# Feed labels as bidding buckets

Shopping and comparison feeds carry a small number of free-form label slots - the
dominant shopping platform offers five - whose only purpose is to let a rule in the
channel's own tool see something the channel does not know about the item. The two
things a channel most needs and never knows are the item's margin and the state of its
stock. Practitioner convention segments by margin band, stock level, performance tier
and seasonality; this technique takes the first two, because they are derivable from
the record without a campaign read-back.

The design rule is that **a label is a bidding bucket, not a number.** A merchant
writes one rule per label value: a target per margin band, a bid adjustment or a
pause per stock state. Three margin bands and four stock states is close to the
maximum that stays actionable; a label carrying margin to two decimals is a number
nobody can write a rule against, and a label with twelve values is a ladder nobody
will maintain.

## Procedure

1. **Name two labels and fix their slots.** Slot zero is the margin band; slot one is
   the stock state. The same two names go to every channel, in each channel's own
   label mechanism - a labelled attribute on one, a parameter pair on another - so a
   merchant writes one rule set across all of them.
2. **Derive, never recompute.** The margin band reads the same margin ladder (own
   margin, else category margin, else fallback) that the stock screen uses; the stock
   state reads the same pacing verdict. Calling the ladder again inside the feed
   module is a second implementation that can silently disagree with the screen the
   merchant is looking at while writing the rule. One call answers both.
3. **Make the bands coarse and named.** High, mid, low on margin; ok, low, pause,
   resuming on stock. The band cutoffs are convention - say so where they live, per
   [label convention as convention](../../../_laws.md#label-convention-as-convention) -
   and the number of bands is the actionability argument above.
4. **Keep the labels deterministic.** The caller supplies the reference instant; a feed
   served twice in the same second is byte-identical, and a test can pin a fixture.
5. **Resolve duplicates deterministically.** When two rows share an identity, the
   label is taken from the worst-cover row, so the pick is stable rather than
   "whichever the catalog listed last".

## Decision rules

- When a merchant wants to bid on profit, give them a margin band, not a return
  target, because a return of six on a fifteen-percent margin and a return of six on a
  sixty-percent margin are not the same outcome -
  [efficiency is not profitability](../../../_laws.md#efficiency-is-not-profitability).
- When stock is low, the label says so and the channel rule reduces or pauses the
  bid; the feed does not omit the item, because on the enumerated-availability feed
  the item is still truthfully in stock. Omission is an availability decision, not a
  pacing one.
- When a label value would change on every serve because it sits on a threshold, the
  threshold is too fine for a bucket; widen the band rather than add hysteresis in the
  feed, because the channel's own rule engine already debounces.
- When a third label is wanted - performance tier, seasonality - it must come from a
  measured source (a campaign read-back, a seasonality index) and never from a guess,
  and the source is named beside the label.

## Cutoffs

A band cutoff of forty-five percent for high margin and twenty-five for mid is a
convention that fits a mid-margin retail catalog; a fashion or a grocery catalog moves
both. The cutoffs are exported from one place so the panel, the tests and the feed
name the same numbers, and a merchant who changes them changes them once.

## When NOT to use

Not for offerings without a margin ladder and a stock verdict - a plan or a service
gets no feed and no label. Not as a reporting dimension the merchant never bids on: a
label that only decorates a report is a slot spent, and the slot count is small. And
not as a substitute for the channel's own availability value - a "pause" label on an
item still marked in stock is a bid instruction, and the item remains listed.
