---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: linear-projection-with-confidence-cap
status: forged
laws: [label-convention-as-convention, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [projecting the portfolio after a set of moves, labelling how sure a projection is, deciding whether a move is small enough for a linear read]
---

# Linear projection with a confidence cap

The projection answers one question on the approval screen: if these moves are
applied, what does the portfolio look like? The honest first-cut model is linear
and it is honest only while the moves are small. This technique states the model,
states where it stops being honest, and turns that boundary into an enforced label
rather than a caption nobody reads.

## The model

For each move, spend leaves the donor and its conversions and value leave with it
at the donor's *own* current efficiency; spend arrives at the recipient and buys
conversions and value at the recipient's own current efficiency. The portfolio
totals are then re-derived with the identical aggregate arithmetic the live table
uses, so the projected ratio and the live ratio are computed the same way and can
be placed side by side without a reconciliation footnote.

A pause is the donor half of a shift with no recipient: spend leaves, and whatever
it was buying leaves, which for a burner is zero. A keyword move - a negative or a
promotion - moves no budget at all and is skipped before the donor lookup, so a
prescription made only of keyword moves projects an exact identity. Blocking a
query saves spend the campaign-level linear model has no way to attribute; putting
a fabricated lift on the approval screen would be worse than putting none.

## Why linear is optimistic

A recipient's current ratio is an average over the spend it already has. The next
unit of spend competes in the same auctions at a worse position or a broader
match, so the marginal return is at or below the average - the equimarginal
reasoning behind the economics neighbour's response-curve solver, where the
average ratio is the ceiling of the marginal one. A linear projection therefore
over-states the recipient's gain by an amount that grows with the moved share, and
under-states nothing on the donor side, where the loss is arithmetic.

The practitioner reading of platform behaviour adds a second reason: automated
bidding re-learns after a large budget change, and the widely repeated rule that a
step beyond roughly a fifth of a budget risks a one-to-two-week learning period
with degraded efficiency is convention, not documented behaviour. Both reasons
point the same way. Small moves, linear read; large moves, degraded label.

## The confidence cap

Confidence is a property of the whole set, decided by its largest shift. The
measure is the share of the donor's own period spend a shift re-points:

    share = amount / donorPeriodSpend

A pause's share is zero (it extrapolates nothing). A keyword move's share is zero.
A move with unknown donor spend reads as zero and full confidence, because a record
that predates the field is not evidence of a large move. The set is labelled
low-confidence as soon as any shift's share exceeds the cap.

The cap is convention. Half is the value this subject was reconciled against,
placed comfortably above the recommender's own default fraction so that every
auto-recommendation reads high-confidence and only a manually enlarged or unusually
large move degrades. The recommender's fraction and the cap are two constants that
must be reasoned about together: a fraction raised above the cap would make every
recommendation low-confidence, which is not a bug but a message the reader should
receive.

## Procedure

1. Store each move's donor period spend with the move, so a set read back later
   can compute its own share without reloading the account.
2. Simulate with the linear model; apply the calibration multiplier to the
   recipient half only (see the calibration technique).
3. Compute the set's confidence from its moves; render the projection's label from
   it - "estimate" at high, "rough estimate, large reallocation" at low.
4. Say on the screen that the projection is linear and what that means: the
   recipient is assumed to keep converting at its current rate on the extra spend.

## Decision rules

- When any shift re-points more than the cap share of its donor, label the whole
  set low-confidence, because a single optimistic move makes the total optimistic.
- When a fitted response curve exists for the recipient, project along it instead
  of linearly, because the curve is evidence about the marginal unit and the
  average is not; the neighbour owns the curve and its evidence bar.
- When the projected gain is zero or negative, do not compute a lift percentage,
  because a ratio against nothing is a number wearing a measurement's clothes.
- When the moves include only pauses, present the projection as arithmetic
  ("spend saved"), not as an estimate, because nothing in it is a forecast.

## When NOT to use

- To size a move: the projection describes a move already sized by the ranking
  and the floor; a move sized to maximise a linear projection is a move sized to
  maximise the model's optimism.
- On a portfolio whose recipient is not budget-capped: the linear model assumes
  the recipient will spend the money; a recipient constrained by its auction will
  not, and the projection is about spend that never happens.
- As a forecast of the month: that is pacing's job. The projection is a comparison
  of two portfolio states at one moment, not a trajectory.
