---
layer: technique
type: technique
subject: period-comparison-significance
technique: funnel-decomposition-only-when-strong
status: forged
laws: [statistical-honesty-before-a-verdict, platform-reported-is-not-causal, not-measured-is-not-zero]
shared_with: []
use_when: [a revenue move needs a "why" line on a dashboard or in a recap, attributing a KPI change across multiplicative drivers, a model is asked to explain a period delta]
---

# Funnel decomposition only when the move is strong

An e-commerce revenue move splits exactly into three drivers through the identity
revenue = visits × conversion rate × average order value. Taking logs turns the
product into a sum, so the log of the revenue ratio between two windows is exactly
the sum of the three factors' log ratios, each driver's share is its log term over
the total, and the shares sum to one with no residual. This is the two-point case of
the log-mean Divisia index decomposition that energy and emissions accounting has
used for three decades; for a pure multiplicative identity between two periods it
is exact, and the log-mean weighting only matters when aggregating over categories
(channels, products) whose sums do not factor cleanly.

The technique is not the arithmetic. It is the **gate in front of the arithmetic**:
decompose only when the top-line move is strong, return nothing (not zeros) when
the decomposition is undefined, and narrate the result as a split, never as a
cause.

## Why the gate

The decomposition is indifferent to whether the move is real. A +2 % revenue move
within daily variance decomposes as cleanly as a +30 % one, and the reader is then
handed "70 % of the move came from conversion rate" about a move that did not
happen. Worse, a small total makes the shares unstable: as the log of the total
tends to zero, every driver's share tends to infinity in one direction or the other,
and the "dominant driver" is whichever factor happened to be noisiest. Explaining
noise with confident percentages is the single most effective way to fabricate a
narrative from a dashboard, and it is fabricated in the reader's favour or against
the agency at random.

## Procedure

1. Compute the revenue delta's significance tier by the metric-class rule. If the
   tier is not strong, do not decompose; the funnel line is absent from the surface.
2. Check the domain: every factor endpoint - visits, conversions, revenue in both
   windows - must be strictly positive, because a log of zero is undefined. If any
   is zero, return nothing.
3. Check the total: if the log of the revenue ratio is negligible (a flat period),
   return nothing - there is nothing to attribute.
4. Compute the three log terms, the three shares (term over total), and the
   dominant driver as the largest absolute log term.
5. Render each driver's own relative change alongside its share - "traffic +12 %,
   explaining 64 % of the move" - so the reader sees both the size of the driver and
   its weight in the total.
6. Keep the funnel line adjacent to the revenue line it explains in any ranked
   insight list; a stable sort with authoring order as the final tiebreak does this.

## Decision rules

- When the revenue tier is weak, orientational or noise, do not decompose, because
  a split of variance is a story about nothing.
- When any factor endpoint is zero or the total is negligible, return nothing rather
  than zero shares, because zero shares assert "no driver moved" and the truth is
  "undefined".
- When the decomposition is rendered, phrase it as "came from" or "is explained by",
  never as "was caused by" or "was driven by the campaign", because the three factors
  co-move - a traffic-quality change moves visits and conversion rate together - and
  the split cannot separate a cause from its correlate.
- When a driver's share exceeds one (two drivers moved in opposite directions), show
  it as such with the offsetting driver's negative share visible, because a capped
  share would hide that the move was a net of two larger moves.

## Extending the identity

The same gate applies to any multiplicative KPI identity: cost = clicks × cost per
click; conversions = impressions × click-through rate × conversion rate; profit per
order = average order value × margin. Two rules carry over. First, the gate is on the
top-line tier, and the top line must be an additive or rate metric with a real tier -
a value-ratio top line (return on ad spend) is orientational and therefore never
decomposed. Second, aggregating across channels requires the log-mean weights rather
than a naive sum of per-channel shares; without them the residual reappears and the
shares no longer sum to one.

## When NOT to use

Do not decompose a value-ratio move. Return on ad spend has no strong tier to gate
on, so it has no funnel line; a reader who wants to know why the ratio moved gets the
revenue and cost decompositions separately.

Do not decompose across a truncated or year-over-year-fallback comparison without
carrying the window flags into the funnel line; the split inherits the honesty of
the windows.

Do not let the decomposition stand in for attribution. It says which arithmetic
factor moved; it says nothing about which channel, campaign or change moved it.
That question belongs to root-cause diagnosis and, for causal claims, to the
incrementality discipline.
