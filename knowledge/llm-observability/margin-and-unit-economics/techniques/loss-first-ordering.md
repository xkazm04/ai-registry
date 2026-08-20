---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: loss-first-ordering
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when:
  - presenting a margin rollup to an operator
  - capping a per-key series to a displayable count
---

# Loss-first ordering

A margin table's sort order is not presentation polish; it decides what the
operator acts on. The technique: **sort by margin ascending — most
unprofitable first — in dollars, and when a surface must cap its rows, cap by
absolute margin.** The default view is a work queue whose first item is the
biggest problem.

## Why dollars, not percentage

Percentage ranking looks principled and is wrong twice. A tiny customer at
−400% margin (paid one unit, cost five) outranks a flagship at −8% who is
losing a thousand times more money. And rows with no revenue have *no*
percentage at all — a percentage sort must either exclude them (hiding pure
cost sinks) or fabricate a value for them. Dollars order every row, including
the revenueless ones, by exactly the quantity the business loses. Percentage
belongs in the row as a severity signal — loss / thin / healthy — not in the
sort key. A workable banding: negative margin is a loss; positive but under
roughly twenty percent is thin, worth marking because inference-backed
products live structurally closer to breakeven than classic software and a
thin band today is next quarter's loss; above that, healthy. Tune the
threshold to your own cost structure; keep the three-band shape.

## Ascending everywhere the question is "who"

Apply the same order to derived surfaces so the operator's eye never
recalibrates: the actuals rollup ascending by margin, the what-if simulation
ascending by *simulated* margin (the key that would still lose money under the
new price surfaces first — that is the simulation's headline finding), a
per-customer drilldown's cost buckets descending by cost (there the question
is "what drives it", so biggest driver first).

## Capping: absolute value, totals first

A trend surface with hundreds of keys must cap to a top-N to stay readable.
Two rules keep the cap honest:

1. **Rank by |margin|, not margin.** A large loss is exactly as interesting as
   a large gain; ranking by signed margin descending shows only winners, and
   ascending only losers. The absolute value surfaces the biggest *movers* of
   the business total in either direction.
2. **Compute totals before truncating, and disclose the cut.** The all-keys
   total series is built from the full key set, then the display set is
   truncated; the response carries both the cap and the pre-cap key count so
   the reader sees "showing 20 of 143" and knows the rows shown do not sum to
   the total shown. A truncated list whose rows are silently expected to sum
   to the total is a bug report waiting in a spreadsheet.

## Decision rules

- Tie-break equal margins deterministically (by key) so two pulls of the same
  report agree row-for-row.
- The unattributed bucket sorts by its numbers like any other row. Pinning it
  to the bottom "because it isn't a customer" hides what is often the largest
  single loss line.
- If a consumer needs a different order (alphabetical export, cost-descending
  audit), let them re-sort client-side; the canonical payload order stays
  loss-first so every default rendering agrees.

## When not to use it

Accounting exports and reconciliation feeds should be ordered by stable
identifier, not by a value that changes between pulls — loss-first is for
surfaces a human triages. And do not loss-first-order a list the operator has
explicitly filtered to winners; honor the question asked.
