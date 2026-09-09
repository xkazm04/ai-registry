---
layer: golden-path
type: golden-path
subject: goal-pacing-and-forecast
status: forged
use_when: [turning a monthly revenue or efficiency goal into a month-end forecast, stating a probability of hitting a goal, prescribing a required daily pace or extra spend mid-month, scoring past months against a goal that has changed]
techniques:
  - weekday-weighted-month-end-projection
  - band-and-suppressed-early-probability
  - required-pace-divides-by-future-days
  - implied-extra-spend-capped
  - goal-in-force-per-month
---

# Goal pacing and forecast

This subject owns the arithmetic between a monthly goal and the days of the month:
where the month stands against its goal today, where it will land, how sure that is,
what the remaining days must average, what that would cost in extra spend, and how a
month that has closed is judged when the goal has since moved. It does not own whether
a change between two periods is real - `period-comparison-significance` owns that. It
does not own the diagnosis of a single campaign that has run into its budget cap -
`campaign-anomaly-triage` owns budget-capped-winner detection at campaign level. It does
not own the response curve or the profit doctrine that price the next unit of spend -
`profit-on-ad-spend-economics` owns those; this subject only borrows the marginal return
when one is available. It does not own the decision to move budget between campaigns -
`budget-reallocation-prescription` owns that. Pacing turns a passive gauge into a daily
operating target; everything downstream of that target belongs to a neighbour.

## What a principal practitioner holds true

**A goal is a month-end number; a dashboard shows a day.** The question the owner asks
on the fourteenth is not "how much have we made" but "will we make it", and the honest
answer has four parts that must be kept apart: the banked month-to-date, a projection
of the remainder, a band around that projection, and a prescription for what the
remaining days must do. Collapse any two of these and the surface lies. Show the
projection without a band and a coin flip reads as a fact; show a required pace without
the current pace and nobody knows whether it is easy or impossible; show the
month-to-date against a flat prorated target and a business that sells on Fridays is
"behind plan" every Wednesday.

**Days are not interchangeable.** Almost every commercial series carries a weekday
shape - a business-to-business shop earns on weekdays, a consumer shop on weekends and
paydays, a service business on Mondays after the weekend's browsing. The naive run-rate
(month-to-date divided by elapsed days, times days in month) assumes every day is the
same day, and it is wrong by the weekday mix of the remaining days: a month whose first
half held three weekends is under-projected, a month whose second half holds them is
over-projected. The projection scales the banked amount by the ratio of the whole
month's expected weekday weight to the elapsed days' weight, and it does so with weights
learned from the business's own trailing weeks, not a borrowed profile. When the month is
complete the ratio is one and the projection is the actual, by construction.

**The band is on the remainder, never on the whole.** What is banked is certain. Only
the days still to come are uncertain, so the band widens with the square root of the
days remaining under the simplest defensible model - remaining de-seasonalised days as
independent draws with the trailing daily noise - and narrows to nothing on the last
day. This is the model a standard forecasting textbook gives for the sum of independent
errors, and the same textbook warns that it understates the truth whenever the daily
errors are positively correlated, which in a marketing series they usually are: a
promotion, a stock-out or a broken tracking tag lasts more than a day. The band is
therefore the honest minimum, said as such, and a surface that has six or more closed
months should prefer the empirical error of its own projection at the same day of month
over the theoretical one.

**A probability is withheld until there is enough month to read.** The probability of
hitting the goal is the band turned into a number, and on day two it is a near-coin-flip
dressed as a percentage. The surface withholds it - "the forecast settles after a few
days" - rather than printing "48% chance" on the second of the month and "91%" on the
third. The number of elapsed days that unlocks the probability is a practitioner
convention; the workspace this bundle was reconciled against uses five. The band itself
is shown from the first day, because a wide band is honest where a precise probability is
not ([statistical honesty before a verdict](../../_laws.md#statistical-honesty-before-a-verdict)).

**The prescription divides by the days that are actually ahead.** Required daily pace is
the remaining gap divided by the calendar days still in front of the latest data point.
It is not divided by "days in month minus days present", because a month with missing
interior days - a sync outage, a late import - would count those past days as future
ones and dilute the required pace, making a barely recoverable month read as
comfortable. The projection may count interior gaps as remaining weight, because a
missing day contributes nothing to the banked amount and something to the expected
total; the prescription may not. Two different denominators, one for the forecast and
one for the operating target, and the difference between them is the number of days the
data lost. When there are no future days, or the goal is already banked, the required
pace is zero, never negative and never "not applicable" in a cell that arithmetic feeds.

**The gap is priced in spend, and the price is honest about saturation.** A shortfall in
revenue per day becomes extra spend per day by dividing by a return - and which return is
the whole question. Dividing by the trailing average return assumes the next unit of
spend performs like the last twenty-eight days did, which is the optimistic answer for
an account already spending near its ceiling. When a fitted response curve exists, the
gap is solved along it at today's daily spend, so the next unit is priced at its marginal
return and a saturated account is told the truth. Either way the answer is capped - the
workspace bounds the search at three times today's daily spend, a convention - and when
even the cap cannot close the gap, the cap itself is returned and labelled "at least
this much" rather than an invented number. The surface always says which basis produced
the figure, because "at current return" and "along the response curve" are different
promises. Pricing a shortfall is not spending it: the implied figure is a steering number,
and any change to spend goes through simulate, guardrail and approval
([a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy)).

**A goal has a timeline.** The monthly goal is not a constant; it is raised in June
after a good spring and lowered in January after a stock problem. A track record that
scores every closed month against today's goal retroactively re-judges March as a miss
because June was ambitious. The goal is an append-only list of dated changes, each
effective from a calendar month, and every month is scored against the goal in force
that month. Months before the first recorded change fall back to the standing goal, so a
business that never changed its goal sees exactly what it saw before the timeline
existed. A same-value save adds nothing; a same-month correction replaces rather than
appends; malformed entries are dropped before use.

**Only complete months enter the track record.** A month counts when every calendar day
is present in the series. A partial leading month, an in-progress current month, or a
month with a hole in it would otherwise read as a fake miss, and one fake miss on a
track record of six is a sixth of the owner's confidence
([not measured is not zero](../../_laws.md#not-measured-is-not-zero)).

## Efficiency goals pace too

Most pacing surfaces pace revenue and stop, and the workspace this bundle was forged
against is one of them: its pacing is a revenue projection, and its efficiency target
(cost over revenue for the paid portfolio, with a looser scope than the blended goal)
is judged only at period end. That is the deviation to record; the standard is that an
efficiency goal paces the same way with one extra rule. Project cost and revenue
separately, each with its own weekday weights - cost has a flatter weekday shape than
revenue because budgets smooth delivery - and form the month-end ratio as the ratio of
the two projected sums, never as an average of daily ratios and never by projecting the
ratio itself. The required pace for an efficiency goal is then a ceiling on remaining
cost given projected remaining revenue (or a floor on remaining revenue given committed
cost), and "behind plan" for a lower-is-better metric inverts the verdict, not the
number. The scope of the target - paid portfolio versus blended business - is labelled on
the pacing card exactly as it is labelled everywhere else, because a paid target that is
deliberately looser than the blended one must never read as a contradiction
([one target, one threshold](../../_laws.md#one-target-one-threshold)). A margin
turns an efficiency pace into a profit pace; without one the card speaks of efficiency
and refuses to speak of profitability
([efficiency is not profitability](../../_laws.md#efficiency-is-not-profitability)).

## Two paces, one card

The practitioner convention from paid-media budget pacing - a velocity index of the
last seven days' average against the target daily figure - is the same idea as the
"required versus recent" pair, and the pair is the more honest form of it: the recent
pace is implied by the seasonality-weighted projection ((projection minus banked) over
future days), so it already carries the weekday shape of the recent past rather than a
flat seven-day mean. The ratio of required to recent is the single number that tells the
owner whether the remaining days need a nudge or a miracle. Practitioner guides put
tolerance bands on pace variance - roughly ten percent as early-month noise, a
persistent twenty percent as a call to act, thirty as critical - and every one of those
is a convention, stated as one wherever a surface colours a cell by it
([label convention as convention](../../_laws.md#label-convention-as-convention)).

## Failure modes of the naive reading

- **Flat run-rate.** Wrong by the weekday mix of the remaining days; systematically
  pessimistic or optimistic depending on where the weekends fall.
- **A point forecast without a band.** The owner reads "projected 412 000" as a
  promise; the band was 340 000 to 480 000 and nobody said so.
- **A probability on day one.** The single most reproduced false precision on a goal
  card. Suppress it until enough days have elapsed; show the band instead.
- **Required pace diluted by phantom days.** Interior gaps in the data counted as
  future days; the month reads recoverable when it is not.
- **Extra spend at the trailing average.** An account near its ceiling is told the gap
  costs a third of what it will; the curve, when fitted, is the honest basis, and the
  cap plus the "at least" label is the honest fallback.
- **The goal re-judges the past.** A raised goal turns a hit into a miss six months
  after the month closed; the timeline fixes it and the fallback preserves the past.
- **A partial month on the track record.** A fake miss, and a fake baseline for every
  average that reads the record.
- **Revenue only.** The efficiency goal is left to the month-end reckoning, which is
  when it is too late to steer.
- **The pace becomes a spend change.** The implied extra spend is a steering number.
  The moment it turns into a budget edit, it belongs to the gated reallocation lane.

## How the techniques divide the work

The projection technique builds the month-end number from banked revenue and learned
weekday weights. The band technique sizes the uncertainty on the remainder and decides
when a probability may be printed. The required-pace technique turns the gap into a
daily operating target with the right denominator and extends it to efficiency goals.
The implied-spend technique prices that target in spend, at trailing or marginal return,
capped and labelled by basis. The goal-timeline technique keeps the scoring of closed
months honest when the goal itself moves. Each states which of its numbers are convention.
