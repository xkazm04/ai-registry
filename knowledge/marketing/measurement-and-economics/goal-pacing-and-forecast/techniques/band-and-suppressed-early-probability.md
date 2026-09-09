---
layer: technique
type: technique
subject: goal-pacing-and-forecast
technique: band-and-suppressed-early-probability
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention]
shared_with: []
use_when: [showing a confidence band on a month-end forecast, deciding whether to print a probability of hitting a goal, sizing daily noise for a forecast]
---

# Band and suppressed early probability

A month-end projection is a point; a reader needs to know how wide the point is. This
technique sizes a band on the uncertain part of the month only, and withholds the
probability of hitting the goal until enough of the month has elapsed for that
probability to mean something.

## Procedure

1. **Separate banked from uncertain.** The month-to-date is certain. The band applies to
   the remainder, so the lower edge can never fall below the banked amount and the band
   collapses to nothing on the last day. A band drawn on the whole projection is wrong
   from the first day and absurd on the last.
2. **Estimate the daily noise once, de-seasonalised.** Divide each trailing day's value
   by its weekday weight, take the sample standard deviation of those adjusted values
   over a trailing window (eight weeks is the workspace convention), and use the same
   variance estimator every other detector in the surface uses. One estimator, declared
   once, so the band and the anomaly detector speak the same statistical language.
3. **Grow with the square root of remaining days.** Under the simplest defensible
   model - remaining de-seasonalised days as independent draws with that noise - the
   standard deviation of the remaining sum is the daily noise times the square root of
   the days remaining. The remaining-day count for the band may include interior gaps,
   because a missing day is an uncertain day.
4. **Choose the quantiles and say which.** A P10-P90 band (1.2816 standard deviations)
   is the usual choice on a goal card because it reads as "probable range" without the
   false comfort of a 95 percent interval on a model this simple. Label the quantiles on
   the surface.
5. **Turn the band into a probability - then decide whether to show it.** The
   probability that the month ends at or above goal is the normal tail of (projection
   minus goal) over the remaining standard deviation. It is computed every day and
   printed only when the elapsed-day gate opens.

## The gate on the probability

Very early in the month the remaining standard deviation is at its largest, the
projection is scaled from one or two days, and the probability is a near-coin-flip
dressed as a hard percentage; it also swings by tens of points between consecutive
days, which teaches the owner that the number is noise. The rule: withhold the printed
probability until a minimum number of days have elapsed, or the month is complete.
Five elapsed days is the workspace convention; the right value is where day-to-day
swings in the printed probability fall below what a reader would act on, and a surface
can measure that on its own history. While withheld, the card says the forecast is
still settling and shows the band, because a wide band on day two is honest where a
precise percentage is not
([statistical honesty before a verdict](../../../_laws.md#statistical-honesty-before-a-verdict)).

## Decision rules

- When fewer than two trailing days exist, the noise is zero by construction; treat
  the band as absent and the probability as unprintable, never as certainty.
- When the remaining standard deviation is zero because the month is complete, the
  probability is one or zero by comparison, and the card shows "final", not "100%".
- When the daily errors are visibly autocorrelated - a promotion that ran a week, a
  tracking outage of several days - the square-root band understates the truth. The
  standard forecasting textbooks say so for any sum of correlated errors. Widen by
  reporting the band as the honest minimum, and prefer an empirical band once there
  are six or more closed months to backtest against.
- When an empirical band is available - the projection's own error at the same day of
  month across closed months - prefer it to the theoretical one and label it as such,
  because it carries the autocorrelation and the event structure the model omits.
- When the band and the probability disagree with the pace badge (the band spans the
  goal but the badge says "behind plan"), both are right: the badge compares to a flat
  plan line, the band to the seasonal forecast. Show both with their labels rather than
  reconciling them by hiding one.

## Convention, measured, documented

The five-day gate, the eight-week noise window and the P10-P90 choice are conventions
and are labelled as such on any surface that shows them
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
The square-root growth of the remaining sum's deviation under independence is
arithmetic; that independence understates correlated error is a documented property in
the forecasting literature, not an opinion of this bundle.

## When NOT to use this

- On a metric that is a ratio: the band on an efficiency figure comes from the bands
  on its projected components, not from the noise of daily ratios.
- On a series with fewer than two weeks of history: there is no noise estimate worth
  the name; show the projection as a run-rate with no band and no probability.
- As a significance claim. The band says how uncertain the forecast is; it does not
  say whether this month differs from last month. That question belongs to the
  period-comparison lane, and a band should never be read as a test.
- On sample or illustrative data, where a band would lend a fake series the
  appearance of a measured one.
