---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: lower-is-better-inverts-verdict-not-number
status: forged
laws: [one-target-one-threshold]
shared_with: []
use_when: [rendering a delta badge for a cost metric, deriving a profit change for a report, a colour and a number on the same tile disagree]
---

# Lower-is-better inverts the verdict, not the number

Half of a marketing report is cost: cost per click, cost per lead, cost per
acquisition, the cost-to-revenue ratio. When cost per lead rises from 400 to 448 the
change is +12 %, the direction is bad, and the client's invoice is higher. A report
has to say all three: the number, the direction, and the verdict. The failure this
technique names is collapsing them - negating the number so that "good" is always
positive, or deriving a money figure by flipping the sign of a ratio - and it is
common because it makes the colour logic one line.

## The rule

A metric carries a **good direction**, declared once in the tile preset. The delta is
computed as the arithmetic change and displayed as the arithmetic change. The verdict
- the colour, the arrow, the word - is the delta's sign combined with the good
direction. Nothing else is inverted. Stated as
[one target, one threshold](../../../_laws.md#one-target-one-threshold): the same
direction table drives every badge, cell, sort and sentence, and the number is the
number everywhere.

So a cost per lead that rose 12 % renders as **+12 %, red, "worse"**. A cost-to-revenue
ratio that fell from 25 % to 22 % renders as **-3 pp, green, "better"**. A client who
reads either against the platform's own console sees the same sign in both places,
which is the entire point: the report is reconcilable with the invoice.

## The derived-figure trap

The subtler failure is in derived money figures. A report that shows revenue, cost
and net profit has three numbers, and net profit is revenue minus cost. When the
cost-to-revenue ratio improves, the temptation is to narrate "profit improved" from
the ratio's sign. It is often false: a ratio can fall while revenue and cost both
fall, and net profit with them. The change in net profit is **recomputed from the
component deltas**, never inferred from a ratio move, and when the components are not
both available the profit delta is absent, not derived.

The same trap appears in the narrative. "Efficiency improved by 12 %" from a cost
metric that fell 12 % is a different claim from "cost per lead fell 12 %" - the first
has invented a metric by inverting the second - and the narrative uses the metric's
own name and its own signed change.

## Procedure

1. **Declare the good direction per metric in the preset** - up, down, or none.
   Spend has none: more spend is not good or bad, and a spend tile shows its delta
   with no colour.
2. **Compute the delta as `current - prior`** (absolute) and `(current - prior) /
   prior` (relative), guarded for a zero prior, which is absent, not infinite - with
   one exception below.
3. **Compute the verdict as `sign(delta) x direction`**, where direction is +1 for
   up-is-good, -1 for down-is-good, 0 for none; positive is "better", negative is
   "worse", zero is unverdicted.
4. **Render the delta with its own sign and the verdict's colour.** The arrow points
   the way the number moved; the colour says whether that was good.
5. **Recompute derived money figures from components.** Net profit delta is
   `(revenue_now - cost_now) - (revenue_prior - cost_prior)`; break-even and margin
   arithmetic belong to `profit-on-ad-spend-economics` and are consumed, not
   re-derived, here.
6. **Test the four quadrants**: up-is-good rising and falling, down-is-good rising
   and falling. Every implementation that has this bug passes the first two.

## Decision rules

- When a lower-is-better metric rises, show the positive delta in the "worse" colour;
  never negate it to make the colour logic simpler.
- When the prior value is zero and the metric is a cost ratio over conversions -
  spend with no return - the honest render is not a delta at all but the state
  itself: "spent, no return", distinct from "paused" (no spend), because a
  campaign that spent and returned nothing is the worst state on the page and a
  dash hides it among the idle ones.
- When a derived money figure's components are not both measured for both windows,
  the derived delta is absent; a report never shows a profit change it computed from
  one side.
- When a metric has a target, the verdict against the target uses the same direction
  table as the verdict against the prior; a cost ratio "under target" and "improved"
  are two verdicts from one direction, and a report where they disagree has two
  tables.
- When a delta is below the significance band another subject sets, the number is
  still shown with its true sign and the colour is muted; muting is not inversion,
  and a muted +12 % is still +12 %.

## When not to use this

Do not apply a direction to a metric that has none. Spend, impressions and sessions
are context, not outcomes; colouring them trains the reader that more of everything
is good and produces a green arrow on a spend overrun.

Do not use a direction table to decide whether a change is *real*. Direction turns a
sign into a verdict word; whether the sign clears noise is the significance question,
owned elsewhere, and a technique that starts adjusting direction by magnitude is doing
two jobs.

Do not invert the number for an internal "score" and then show the score. A composite
health score that folds inverted cost deltas into a single number is a legitimate
operator tool; it is not a report tile, because the client cannot reconcile it with
anything.
