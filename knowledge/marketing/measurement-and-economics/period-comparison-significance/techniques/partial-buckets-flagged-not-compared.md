---
layer: technique
type: technique
subject: period-comparison-significance
technique: partial-buckets-flagged-not-compared
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero]
shared_with: []
use_when: [bucketing a daily series into weeks or months for a chart, computing a last-two-buckets delta, a monthly chart opens with a cliff or ends with a collapse]
---

# Partial buckets are flagged, not compared

A bucket that holds fewer days than its calendar or window length is **partial**.
It is shown - the days in it are real - but it carries a completeness flag, it is
drawn distinguishably, and it is never one side of a bucket-to-bucket comparison.

## Where partial buckets come from

- **The trailing calendar month.** Monthly buckets keyed by calendar month are partial
  from the first of the month until month-end. Compared against the previous full
  month, the trailing bucket fakes a collapse whose size is the fraction of the month
  not yet elapsed - about 60 % on the twelfth - and the fake collapse repeats at the
  start of every month.
- **The leading calendar month.** When the series does not begin on the first, the
  first monthly bucket is partial and the chart opens with a near-zero cliff that
  reads as dramatic growth into the second month.
- **The leading fixed window.** Weekly buckets counted back from the anchor are always
  full at the newest end and truncate at the series start; the oldest bucket holds
  fewer than seven days.
- **Gaps inside a month.** A month whose days are not all present - a sync outage, a
  platform that reported nothing for a week - holds fewer points than its calendar
  length. Its total is a sum over the days that exist, not an estimate of the month.

## Procedure

1. Bucket the daily points by the chosen granularity.
2. For each bucket, compare the number of days present with the expected length:
   the calendar length of that month, or the fixed window size.
3. Set the completeness flag: partial when present < expected. For the trailing
   month, partial unless the anchor date is the last day of its month. For the
   leading bucket, partial when the month does not begin on the first or the window
   holds fewer than its fixed length. Day buckets are never partial.
4. Render partial buckets with a distinct treatment (hatched, hollow, muted) and a
   label that says how many of the expected days are present.
5. Compute any last-two-buckets delta over **complete buckets only**: filter to
   complete, take the last two, refuse (return no delta, not zero) when fewer than
   two remain.
6. Never rescale a partial bucket to a full-length estimate on the chart. Scaling
   the trailing month is a forecast, and the forecast belongs to the pacing
   discipline with its own band and its own early-days suppression.

## Decision rules

- When a bucket holds fewer days than its length, flag it, because a reader cannot
  tell a half-month bar from a collapse.
- When a delta is computed between buckets, use the last two complete ones, because
  a partial bucket on either side fakes a move whose size is the missing fraction.
- When fewer than two complete buckets exist, refuse the delta rather than return
  zero, because zero is a verdict of "no change" and the truth is "not comparable".
- When a month is gappy rather than merely trailing, flag it the same way, because
  a sum over 20 present days is not a month's total and the missing days are absent,
  not zero.

## The chart and the number disagree on purpose

A bar chart may show the partial trailing month because a client wants to see the
month so far; the delta badge beside the chart must not use it. This is the
intended asymmetry: display is generous, comparison is strict. A surface that makes
the two agree by hiding the partial bar loses the "so far" the client asked for; a
surface that makes them agree by comparing it manufactures a monthly collapse.

## When NOT to use

Do not flag a day bucket. A day is either present or absent; there is no partial
day in a daily series, and a missing day is a gap in the line, not a partial point.

Do not treat "partial" as "invalid" for totals over the whole period. The period
total is a sum over the days present regardless of bucket boundaries; only the
bucket-to-bucket comparison is gated.

Do not use the partial flag to suppress an anomaly read. Daily anomaly detection
operates on the daily series against a de-seasonalised baseline and never sees a
bucket; that discipline is a neighbouring subject and has its own coverage tiers.
