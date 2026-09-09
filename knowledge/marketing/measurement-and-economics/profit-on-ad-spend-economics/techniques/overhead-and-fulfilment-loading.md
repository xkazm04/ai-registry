---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: overhead-and-fulfilment-loading
status: forged
laws: [label-convention-as-convention, never-invent-proof, not-measured-is-not-zero]
shared_with: []
use_when: [moving from gross-margin to contribution-margin economics, choosing how to split fixed costs across channels, a cost-model input arrives from a form]
---

# Overhead and fulfilment loading

Gross profit after ad spend answers "does this channel pay for its own advertising".
It does not answer "does the business make money", because between gross profit and
the bottom line sit the costs of fulfilling the orders and of keeping the doors open.
Loading those onto the ad economics produces a contribution view, and the craft of
the technique is in keeping the two views distinct, choosing an allocation key
honestly, and refusing bad inputs rather than defaulting them.

## Two kinds of cost, two attachments

**Fulfilment** is variable: pick-pack-ship, payment fees, returns, packaging. It
attaches per order, so the window's fulfilment cost is per-order cost times the
window's conversions. A channel with more orders carries more fulfilment, which is
correct - it caused them.

**Overhead** is fixed: rent, salaries, tooling, the agency retainer. It attaches per
period, so a monthly figure is prorated to the analysed window (thirty days is one
month, ninety is three, a year is twelve; an arbitrary span is days over thirty). It
does not scale with any channel's activity, which is exactly why splitting it across
channels needs a key that is not a fact.

Net profit after both is gross profit minus ad cost minus overhead minus fulfilment.
Profit on ad spend stays margin-aware (gross profit over ad cost) so the raw and the
contribution figure sit side by side on the same scale; the contribution ratio is
contribution profit over ad cost with the same guard.

## Whole versus split

The portfolio profit-and-loss charges the whole overhead once against blended net
profit. The per-channel view splits the same total across channels and charges each
its share. Same total, different incidence; a surface that shows both must reconcile to
the same figure at the bottom, and it must name which view a number belongs to.

The split needs a key. Revenue share is the default because it needs no extra data,
and it carries a known distortion: it hands the most overhead to the channel that
earns the most revenue, so a business's best channel can read as its worst
contributor. Activity keys (orders, shipments, tickets) track the cause of some
overhead more closely and need data most small businesses do not have. A further
circularity appears when product-level ad cost is itself allocated by revenue share
and then a category's profit on ad spend is computed from it - the ratio is partly
its own input. Every key is convention; the rule is **when overhead is split, name the
key on the surface, keep the whole-portfolio figure as the profit-and-loss of record,
and never treat an allocated overhead loss as grounds to cut a channel whose
contribution before allocation is positive, because cutting it removes the
contribution and leaves the overhead.**

## Input hygiene

A cost model arrives from a form: a margin fraction, a monthly overhead, a per-order
cost. Each is validated by the same policy - reject, never coerce. A margin outside
(0, 1] is rejected (zero rejected because a zero-margin model earns nothing and would
mean "no model" better said plainly; exactly one accepted). An overhead or per-order
cost that is not a finite non-negative number is rejected. The policy is uniform
because it was once not: a thousands-separated figure parsed to not-a-number, was
quietly replaced by zero, and the report showed a rosier "true net profit" that
omitted precisely the overhead the model existed to capture. A rejected model returns
an error to the person; a coerced one returns a lie to the client.

The same degrade-to-zero rule that is wrong at the boundary is right inside the
arithmetic: a disabled or blank model collapses overhead and fulfilment to zero so the
view degrades to the gross-margin one, and negative inputs cannot reach the
primitives because the boundary already refused them.

## Reconciling two margin bases

A per-channel engine blends live-editable channel margins over the channel mix; a
report runs on one persisted blended margin. They describe the same business. When
they diverge, the same merchant reads two profits in two tabs. Convention: at or above
two percentage points of margin the gap is material and the surface says so, pointing
at which figure to apply to the other; below it the gap is rounding and mix noise.
Round to the displayed precision before comparing, so a boundary case is not tipped
under the threshold by binary floating-point error. Two points is convention, chosen
as the smallest gap that visibly moves a mid-six-figure revenue's net profit while
staying above per-channel rounding jitter.

## Decision rules

- When the business supplies no overhead, show the gross view and label it gross;
  do not estimate an overhead.
- When a real per-product margin can be rolled up from a catalogue, offer the
  revenue-weighted blend as the default margin and return absent - never zero percent
  - when nothing revenue-bearing resolves.
- When the loaded break-even is undefined (no spend, no margin), omit it rather than
  serialise a non-finite value.

## When not to use

Do not load overhead onto a single campaign or ad group; the allocation noise at that
grain exceeds the signal, and the decision at that grain is efficiency against the
agreed target. Do not use the contribution view to compare channels of different
business types - a lead-generation channel's "order" is a lead and its fulfilment is a
sales call. And do not present a contribution figure as the business's accounting
profit; it omits taxes, financing and whatever the accountant knows that the
marketing surface does not.
