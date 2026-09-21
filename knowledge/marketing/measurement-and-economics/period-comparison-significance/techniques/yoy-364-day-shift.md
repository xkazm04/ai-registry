---
layer: technique
type: technique
subject: period-comparison-significance
technique: yoy-364-day-shift
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [offering a year-over-year comparison baseline, a seasonal business compares a peak month against the preceding quarter, a report narrates "versus last year"]
---

# Year-over-year on a 364-day shift

The like-for-like baseline for a seasonal business is the same window one year
earlier, and "one year earlier" is **364 days, not 365**. Three hundred and
sixty-four is exactly fifty-two weeks, so the year-ago twin of every day lands on
the same weekday; 365 slides the twin by one weekday each year and by two across a
leap year, and the weekday gap - a Sunday trough against a Monday peak - is then
read as a year-over-year move.

## Why weekday parity beats calendar parity

A business with strong day-of-week shape (weekend lows, a Monday peak, a Friday
paid-search dip) has a weekday amplitude that routinely exceeds its genuine
year-over-year change. Aligning the calendar date and misaligning the weekday puts
the larger effect on the wrong side of the comparison. Aligning the weekday and
letting the calendar date drift by one day puts a negligible effect there instead -
one day of seasonal drift inside a 30-day window is immaterial next to seven days of
weekday shape. Retail accounting reached the same conclusion with the 52/53-week
fiscal year and its periodic 53rd-week restatement; the practitioner's version is
the 364 shift and a note that after six or seven years the accumulated drift is worth
a 371-day (53-week) correction. That correction horizon is convention.

## Procedure

1. Compute the current window as the last N days of the daily series.
2. Compute the comparison window as the same span shifted back exactly 364 days.
3. Cap the current window so its year-ago twin still fits inside the series: the
   usable span is the smaller of N and (series length minus 364).
4. If the usable span is below one day, the year-over-year comparison is not
   available. Fall back to the adjacent equal-length window **and record the
   fallback in the result** - the comparison baseline actually used is a field the
   interface, the report and any model grounding read, so none of them claims a
   year-over-year comparison that did not happen.
5. Where the baseline is a selector on a surface, disable the year-over-year choice
   when it cannot fit, with a hover that says the history is missing, rather than
   silently substituting.
6. Every delta badge under a year-over-year baseline changes its wording from
   "versus previous period" to "versus the same period last year" - the number is
   the same shape and the reader must be told which comparison it is.

## Decision rules

- When the business has a visible weekday profile, shift by 364, because the weekday
  amplitude is larger than the one-day calendar drift being traded away.
- When the metric is dominated by a fixed calendar date (a public-holiday spike, a
  month-end billing run), align on the calendar date for that metric only and say
  so, because for it the date effect exceeds the weekday effect; this is the rare
  exception and it is labelled.
- When the series cannot fit a year-ago twin, fall back to the adjacent window and
  surface the fallback, because a silent substitution is the same lie as a silent
  truncation.
- When a report narrates a twelve-month total plus a year-over-year delta, require
  roughly two full years of history (a full current year and a full prior year); a
  sync that caps at 400 days cannot support it and the sentence is withheld.

## The seasonality argument, stated once

Comparing a peak month against the preceding quarter reads seasonality as
performance in both directions: the pre-peak comparison flatters the agency in the
peak month and indicts it in the trough that follows. The adjacent window remains
the right default for a non-seasonal account and for a short-window operational
read ("last 7 days versus the 7 before"); year-over-year is the right default for
any monthly or quarterly client narrative on a business with a seasonal calendar.
Offer both, name which is in force, and never blend them.

## When NOT to use

Do not use year-over-year for an account younger than a year plus the window; there
is nothing to compare, and the fallback is the adjacent window with the fallback
recorded.

Do not use year-over-year to grade a change the agency made three weeks ago; the
adjacent window is the operational baseline, and even that is a description, not an
experiment.

Do not apply the 364 shift to a monthly-bucketed series by shifting month labels; the
shift is defined on days, and a month-keyed twin is the calendar-aligned comparison
that this technique exists to avoid. Bucket after shifting, not before.
