---
layer: technique
type: technique
subject: goal-pacing-and-forecast
technique: required-pace-divides-by-future-days
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold, efficiency-is-not-profitability]
shared_with: []
use_when: [prescribing what the remaining days must average to hit a goal, showing required versus current pace, pacing an efficiency target rather than a revenue one]
---

# Required pace divides by future days

The prescription behind "behind plan": the daily figure the remaining days must
average for the month to still hit its goal, and the daily figure they are on course to
deliver. The whole technique rests on one denominator being right.

## Procedure

1. **Compute the gap.** Required total for the remainder = max(0, goal minus
   month-to-date). Negative gaps are zero: a banked goal has no required pace.
2. **Count the days genuinely ahead.** Future days = days in month minus the
   day-of-month of the latest data point. Not "days in month minus days present": a
   month with missing interior days would count those already-past days as future,
   dividing the gap by phantom days and understating the required pace, so a barely
   recoverable month reads as comfortable. The projection may use the present-count
   denominator for its weighting; the prescription never does.
3. **Required daily = gap / future days.** Zero when there are no future days.
4. **Recent daily = (projection minus month-to-date) / future days.** The pace the
   remaining days are expected to deliver, implied by the seasonality-weighted
   projection, so it already carries the weekday shape of the recent past rather than a
   flat run-rate of the last seven days.
5. **The ratio required / recent** is the steering number: above one the remaining days
   must accelerate, at or below one the current pace suffices. Zero when recent is zero,
   never infinity in a cell.
6. **Show the pair, not the single.** A required pace without the recent pace beside it
   tells the reader nothing about difficulty. A tile that reads "required 1 530 / day
   versus 1 000 / day now" is a decision; "required 1 530 / day" is a number.

## Decision rules

- When the goal is banked mid-month, the required tile disappears rather than showing
  zero, because a zero in that slot reads as "no pace needed" for the wrong reason and
  invites the reader to relax spend.
- When interior days are missing, the surface tells the reader how many, because the
  projection and the prescription now use different denominators and a reader who
  divides the gap by the displayed "days remaining" will get a different answer than
  the tile shows.
- When the series stopped before today, the future-day count is from the last data
  point, not from the wall clock; a stale series prescribes from its own last day and
  the staleness is labelled beside it
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- When a required pace exceeds the recent pace by more than the account has ever
  delivered in a week, say so; the implied-spend technique will price it, and the price
  will be the cap.

## Pacing an efficiency goal

Revenue is the goal most surfaces pace, and the only one the workspace this bundle was
reconciled against paces. The standard extends to a lower-is-better efficiency target
(cost over revenue, or its inverse) with these rules:

- Project cost and revenue separately, each with its own weekday weights, and form the
  month-end efficiency as the ratio of the two projected sums.
- The required pace is a ceiling on remaining cost given the projected remaining
  revenue: allowed remaining cost = target ratio x projected month revenue minus cost
  to date, divided by future days. Equivalently a floor on remaining revenue given
  committed cost. State which form the card shows.
- "Behind plan" inverts the verdict for a lower-is-better metric, never the number: the
  cell shows the ratio as it is and colours it by the inverted comparison
  ([one target, one threshold](../../../_laws.md#one-target-one-threshold)).
- The target's scope is labelled - paid portfolio versus blended business - because a
  paid target is often deliberately looser and must not read as a contradiction with
  the blended one on the neighbouring card.
- Without a margin the efficiency pace is an efficiency pace; it says nothing about
  profit, and the card does not imply it does
  ([efficiency is not profitability](../../../_laws.md#efficiency-is-not-profitability)).
  With a margin, the same arithmetic paces contribution profit, and the required pace
  becomes a profit floor.

## When NOT to use this

- On a complete month: every prescription field settles to zero and the card shows the
  final figure; a required pace on a closed month is a bug.
- As a spend instruction. The required pace is a revenue target for the remaining days;
  translating it to spend is the implied-spend technique, and executing that spend is a
  gated change in the reallocation lane.
- On a goal whose scope differs from the series (a paid target paced on blended
  revenue): the pace is meaningless and the mismatch is the finding.
- On sample data, where a prescription would tell the owner to chase a number that was
  never theirs.

## Convention, measured, documented

The future-day denominator is arithmetic, and the failure of the present-count
denominator on a gappy month is a reproducible fact, not a preference. The choice to
hide the required tile once the goal is banked is a surface convention. The efficiency
extension is the standard of the craft; that the workspace lacks it is a recorded
deviation, not a reason to lower the bar.
