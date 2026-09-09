---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: break-even-roas-is-inverse-margin
status: forged
laws: [efficiency-is-not-profitability, one-target-one-threshold, label-convention-as-convention]
shared_with: []
use_when: [a surface needs a break-even target, a break-even was typed by hand, overhead or fulfilment must be folded into a target]
---

# Break-even return on ad spend is the inverse of margin

Break-even is the return at which gross profit exactly covers ad spend. Gross profit
is revenue times margin; at break-even it equals spend; so revenue over spend equals
one over margin. Break-even return on ad spend is 1 / margin, break-even cost share of
revenue is the margin itself, and the two are reciprocals by construction. A
forty-two percent margin breaks even at about 2.4x; a thirty percent margin at 3.3x;
a fifty-eight percent margin at 1.7x. These are not benchmarks, and there is nothing
to agree about once the margin is known.

## The rule

**When a margin exists, derive break-even from it in one place and let every surface
read the derived value, because a break-even typed by hand is a second threshold that
disagrees with the first the day the margin changes.** The ratio target the business
agreed for its paid portfolio is a separate, margin-blind number that says "this is
the efficiency we run at"; break-even says "below this, this channel's margin does not
cover its spend". A surface shows both, labelled, and never substitutes one for the
other.

## Degenerate margins

A margin of zero or below has no break-even. The channel cannot cover spend from gross
profit at any return, and the honest value is "never": infinity in the arithmetic,
rendered as "never breaks even" on a surface, and omitted rather than serialised as
null or a large number where a numeric field is expected. A margin above one is an
input error and is rejected at the boundary, not clamped.

## The loaded variant

Gross break-even asks whether the channel pays for its own advertising. The loaded
variant asks whether it pays for its advertising and its share of fixed overhead and
per-order fulfilment. Solving revenue x margin = ad cost + overhead + fulfilment for
revenue over ad cost, holding ad cost fixed:

    loaded break-even = (ad cost + overhead + fulfilment) / (ad cost x margin)

It is defined only when there is ad cost to divide by and a positive margin; it is
period-dependent, because overhead is a monthly figure prorated to the window and
fulfilment scales with the window's orders; and it collapses to the gross figure when
overhead and fulfilment are both zero, in which case it is omitted rather than shown
as a duplicate. The gross figure is period-independent and is the one a campaign table
shows beside every row; the loaded figure belongs on a profit-and-loss surface with
the window it was computed for named beside it.

## Decision rules

- **When a channel's return is above the portfolio target but below its own
  break-even**, say the channel is efficient by the agreed target and unprofitable by
  its margin, because the two claims are both true and only the second is about money.
- **When a channel's margin differs from the blended margin**, judge it by its own
  break-even, because the blended figure is a revenue-weighted average that flatters
  low-margin channels and punishes high-margin ones.
- **When the margin changes**, re-derive; never edit a break-even.
- **When serialising a break-even across a boundary that types the field as a
  number**, map the infinite case to absent, because a JSON encoder writes infinity as
  null and a consumer reading null as zero would call a never-profitable channel
  profitable at any return.

## Procedure

1. Obtain a margin per scope: per channel where the business knows it, blended where
   it does not, with the basis labelled.
2. Compute gross break-even return and cost share from the margin, in one shared
   primitive both the report and the per-channel engine call.
3. Where overhead or fulfilment are modelled, compute the loaded variant for a named
   reference window and show it as a second line, not a replacement.
4. Show the agreed portfolio target beside the derived break-even with both labelled;
   a reader who sees one number will assume it is the other.

## Footing

The formula is arithmetic, not convention. What is convention is the choice to hold ad
cost fixed when solving the loaded variant (rather than solving for the spend at which
a channel with a fixed return breaks even), the choice of window for overhead
proration, and the choice of allocation key when overhead is split across channels.
Each is stated where it is used.

## When not to use

Do not derive a break-even when no margin has been supplied. A guessed forty-five
percent produces a break-even of 2.2x that looks authoritative and is a fabricated
proof; the surface says "no margin - efficiency only" and moves on. Do not apply the
gross break-even to a zero-cost channel: with no spend there is no return to compare,
and the profitability verdict comes from net profit, not from the ratio test. And do
not use break-even as the reallocation criterion; the move prescription ranks by
marginal profit, which the reallocation subject owns.
