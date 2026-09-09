---
layer: technique
type: technique
subject: product-feed-and-catalog-spine
technique: days-of-cover-pacing-rules
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy, not-measured-is-not-zero]
shared_with: []
use_when: [pausing or trimming product ads on stock, planning seasonal budget against available stock, proposing a budget move away from a stockout]
---

# Days-of-cover pacing rules

Days of cover is stock divided by daily velocity: how long the shelf lasts at the
current selling rate. It is the one figure that lets a product ad be paused before a
shopper clicks on something that cannot ship, and it is derived from two fields the
record already owns, so it costs nothing to compute and everything to ignore.

The pacing ladder reads cover into a verdict with a budget action attached. The
shape is fixed; the thresholds are convention:

| cover | status | action |
|---|---|---|
| below the pause line | pause | stop the ads; the shelf empties within the week |
| pause line to trim line | low | reduce budget; stock is thin |
| pause line to warning line | at risk | early warning, no action yet |
| pause, with a restock inside the horizon | resuming | pause until the restock date, then resume |
| above the trim line | ok | run at full budget |

A common convention is a pause line at seven days, a trim line at twenty-one, an
early-warning line at fourteen and a restock horizon of forty-five; all four are
practitioner numbers for a catalog with weekly replenishment, and a business with a
monthly purchasing cycle moves every one of them. The technique says so, per
[label convention as convention](../../../_laws.md#label-convention-as-convention), and
a surface that renders a verdict from them says which footing it stands on.

## Procedure

1. **Compute cover per item, with an infinite case.** Velocity zero means the item does
   not sell, so cover is infinite and there is no stockout risk - not a zero, and not a
   pause. Cover is [not measured](../../../_laws.md#not-measured-is-not-zero) when
   velocity is unknown, and that is a different state from "sells nothing".
2. **Project the date.** Round cover to whole days and add it to a server-supplied
   reference instant; the caller supplies the instant so the projection is
   deterministic and testable.
3. **Convert a pause to a resume when incoming stock is known.** A pause with a
   scheduled restock date inside the horizon, and a positive incoming quantity,
   becomes "pause until the date, then resume". Without both, it is an open-ended
   pause. A restock date in the past is ignored, not treated as arrived.
4. **Weight by money.** Value at risk on the shelf is stock times price times margin -
   the profit a stockout strands. Guard against the algebra that cancels velocity into
   a unit count and renders it as currency; the formula is stated once and pinned.
5. **Cap seasonal spend by cover.** A seasonal plan scales a flat monthly baseline by a
   seasonality index; upcoming months past what the aggregate cover can sustain are
   capped at the flat figure, because spending an uplift into an empty shelf buys
   clicks and refunds.
6. **Propose, never write.** A reallocation takes a fraction of a donor's spend -
   donors are pause, resuming and low items - and routes it to the fastest-selling ok
   item in the same category. It is a proposal table with a total; a donor with no
   healthy recipient in its category is skipped. The table goes through the same
   simulate-approve-ledger gate as every money change,
   [a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy).

## Decision rules

- When a feed-imported item carries stock zero and no velocity, its cover is not
  computed, because the zero is the feed's "unknown"; only a warehouse source
  supplies a count that pacing may trust.
- When a pause verdict is issued on an item whose warehouse count was just wiped by an
  import, the bug is in field ownership, not in pacing; check the ledger before
  moving budget.
- When cover is thin on one item and its category has no healthy sibling, do not move
  the spend across categories automatically, because the category is the proxy for
  "the same shopper", and a move outside it is a strategy decision for a person.
- When the stock verdict is also emitted as a feed label, both read the same ladder
  from the same call; a screen that says "low" beside a feed that says "ok" is the
  disagreement the single call exists to prevent.

## When NOT to use

Not for plans or services - there is no shelf. Not for an item with fewer than a
handful of days of velocity history, where a daily rate is one sale divided by one
day; state that cover is not yet measurable rather than pausing on a rate computed from
a single order. And not as an automatic writer of bids or budgets: the ladder produces
a verdict and a proposal, and the account changes only after the gate.
