---
layer: technique
type: technique
subject: goal-pacing-and-forecast
technique: weekday-weighted-month-end-projection
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [projecting a month-end total from a partial month, replacing a flat run-rate on a goal card, deciding how much history a projection needs]
---

# Weekday-weighted month-end projection

A month-end projection that scales the banked month-to-date by the ratio of the whole
month's expected weekday weight to the weight of the days already present. The naive
run-rate - month-to-date over elapsed days, times days in month - assumes every day is
the same day; this technique assumes each day is its weekday, with weights learned from
the business's own trailing weeks.

## Procedure

1. **Anchor on the latest data point, not the wall clock.** "Today" for the projection
   is the last day in the series. A series that stopped syncing three days ago projects
   from three days ago and says so; projecting from the calendar date would count the
   silent days as zero revenue.
2. **Learn the weekday weights from a trailing window of whole weeks.** For each of the
   seven weekdays, average the metric over the window, then normalise so the mean
   weekday weight is one. Twelve whole weeks is the convention the workspace this
   bundle was reconciled against uses; fewer than two whole weeks is too few to know a
   weekday from noise, and the weights fall back to flat (all ones), which reduces the
   projection to the plain run-rate - a graceful degradation, not a failure.
3. **Weight the calendar.** Sum the weight of every calendar day of the month for the
   whole-month weight; sum the weight of every day PRESENT in the series for the
   elapsed weight. Present days, not the day-of-month of the latest point: a month with
   interior gaps has less banked than its calendar position suggests, and counting the
   gaps as elapsed would read the month as artificially behind.
4. **Project.** Projection = month-to-date x (whole-month weight / elapsed weight).
   When the elapsed weight is zero the projection is the month-to-date. When the month
   is complete the ratio is one and the projection equals the actual.
5. **Derive the flat prorated target separately.** "Where we should be today" is the
   goal times elapsed days over days in month; it is a plan line, not a forecast, and
   the card shows both so the reader sees the gap between the plan's flat assumption and
   the seasonal reality.

## Decision rules

- When the trailing window holds fewer than two whole weeks, use flat weights and
  label the projection as a run-rate, because a weekday learned from one Tuesday is a
  Tuesday's noise.
- When a weekday has no observations in the window, its weight is one (the mean), not
  zero, because an unobserved weekday is unmeasured, not dead
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- When the metric is a ratio (an efficiency figure, a conversion rate), never project
  it directly: project numerator and denominator with their own weights and form the
  ratio of the projected sums, because an average of daily ratios weights a quiet Sunday
  the same as a heavy Monday.
- When the projection is for a metric whose weekday shape differs from revenue's - cost
  under a smoothed budget is flatter, sessions are peakier - learn that metric's own
  weights rather than borrowing revenue's.
- When the month contains a known calendar event (a national holiday, a planned
  promotion), the weekday weight is wrong for that day and the projection says so;
  adjusting for events is a neighbouring concern and the projection does not
  silently do it.
- When the series is a sample or a demo, the projection is illustrative and never
  reaches a goal card without the label.

## What the projection is not

It is not a trend model. A weekday-weighted scale-up carries no drift term, so a
business that is growing ten percent month over month is under-projected and a
business that is bleeding is over-projected. This is deliberate: a drift term fitted on
a partial month is a coin flip, and the cost of the omission is a wider honest band
rather than a confident wrong number. Where a slow bleed or a strong period-over-period
move has been established by the significance lane, the reader is told; the projection
does not fold it in. It is also not an experiment or a causal read; it describes what
the month is on course to do if the recent past continues
([statistical honesty before a verdict](../../../_laws.md#statistical-honesty-before-a-verdict)).

## When NOT to use this

- Fewer than two whole weeks of history: the weights are noise, use the flat run-rate
  and say so.
- A metric that is not additive over days. Averages, medians and ratios do not scale
  by weekday weights; project their components.
- A month dominated by a single event (a launch day that is forty percent of the
  month): the weekday shape is irrelevant and the honest projection is "banked plus an
  event-free remainder", stated in words.
- A series known to be gappy for more than a handful of days: the projection remains
  valid for the total, but the reader must be told how many days are missing, because
  the band and the pace prescription treat those gaps differently.

## Convention, measured, documented

The twelve-week weight window, the two-week minimum, and the flat-weight fallback are
practitioner conventions. The mean-normalisation of weights is arithmetic. That a
weekday shape exists in commercial series is a measured fact of nearly every account,
and the size of the shape is measured per account by the weights themselves.
