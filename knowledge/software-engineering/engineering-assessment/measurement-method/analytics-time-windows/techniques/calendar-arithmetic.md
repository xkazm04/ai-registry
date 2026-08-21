---
layer: technique
type: technique
subject: analytics-time-windows
technique: calendar-arithmetic
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [implementing a monthly or quarterly period, aligning weekly bins, defining a renewal or allowance boundary]
---

# Calendar arithmetic

Named periods — day, week, month, quarter, year — are calendar constructs of
irregular length. This technique is the discipline of computing them with
calendar operations (add one month to a month; snap to the first instant of a
day in a zone) rather than fixed-length substitutes (add 30 × 86,400 seconds;
divide an epoch timestamp by a week).

The substitutes are attractive because they are one line, dependency-free, and
correct most of the time. Their errors are systematic rather than random,
which means they do not average out — they accumulate in one direction, and
nobody attributes the resulting drift to the arithmetic.

## The three irregularities

1. **Months differ in length** — 28 to 31 days. A "monthly" period built as a
   rolling 30 days completes **12.17 times per year**. On a usage allowance
   that is roughly a 1.4% overspend, permanently, invisible on every dashboard
   because every individual period looks right. It also detaches the renewal
   date from the calendar, so the renewal walks backwards through the month and
   the user cannot predict it.
2. **Weeks have a phase.** Epoch-relative binning (`floor(t / one_week)`)
   anchors every bin on whichever weekday the epoch happened to be — for the
   common Unix epoch, a Thursday. Two entities whose observations fall on
   opposite sides of that Thursday boundary but inside the *same* business
   week land one bin apart, and summing their series adds values that are out
   of phase. Weeks must be floored to a *named* weekday boundary first and
   indexed after: floor the instant to its week-start weekday, then divide.
   Consecutive week-starts are exactly seven days apart, so the index stays a
   clean incrementing integer that entities on different observation cadences
   can be summed by.
3. **Days are not all 86,400 seconds.** In any zone that observes a seasonal
   shift, one day is 23 hours and another is 25. Loops that step a cursor
   forward by a fixed day drift by an hour across the shift and mis-assign
   every observation in that hour; over a long range the cursor eventually
   crosses a midnight and the drift becomes a whole misplaced bucket.

## Procedure

1. **Express period arithmetic in the unit of the period.** A month-based
   window advances by adding one to the month component and letting the
   calendar normalize (31 January + 1 month is a February date, not 3 March).
   A quarter is three such additions or one snap to a quarter boundary — never
   90 days.
2. **Snap before you step.** Compute the period's start by snapping to the
   first instant of the day, week, month or quarter in the canonical zone;
   then compute the end by adding one period unit to the *snapped* start. Never
   subtract a duration from "now" and call the result a period start.
3. **Generate bucket edges by repeated calendar stepping, not by multiplying.**
   The k-th boundary is start advanced k times, not start + k × length.
4. **Clamp day-of-month overflow to the target month's last day.** The 31st
   plus one month is the 28th, 29th or 30th, and then the *next* step returns
   to the 31st — anchored on the original day-of-month, not on the clamped
   one. Clamping without re-anchoring walks the date backwards through the
   calendar exactly as a fixed 30-day step does, which defeats the point of
   using calendar arithmetic at all.
5. **Align weeks to a declared weekday**, and put that weekday next to the zone
   constant — the two decisions are read together and changed together.
6. **Bound a recency grid at the newest observation, not at now.** A
   zero-filled trailing grid anchored on the present stretches back to include
   every entity's oldest data, so one long-dormant entity dilutes a trend to
   mostly zeros and a single stale spike anchors the axis. Anchor the horizon
   at the newest observation and cut a fixed number of periods back from
   there; entities whose latest activity falls outside the horizon drop out
   rather than distort.
7. **Handle the short first period explicitly.** Calendar periods mean that
   an entity created mid-period gets a partial first one. Decide — prorate,
   grant in full, or start at the next boundary — and write the decision where
   the boundary is computed.

## Decision rules

- **When the period is user-facing and tied to a renewal, use the calendar.**
  Predictability of the date beats uniformity of the length: users plan around
  "the 1st", not around "30 days from whenever I signed up".
- **A mixed policy within one cadence vocabulary is legitimate, if declared.**
  Sub-month cadences ("every day", "every week") may stay exact-duration steps
  — a seasonal shift moving a job by an hour is irrelevant, and a fixed step
  is cheaper and more predictable — while month-and-longer cadences use the
  calendar, because those are the ones whose drift a human notices as a date
  walking backwards. State the split where the cadence table lives, and key
  that table on the one canonical cadence vocabulary so a new cadence cannot
  be added on one side only.
- **When the period is a technical horizon** — retention, staleness, a recency
  cutoff, a retry budget — **a fixed duration is correct and simpler.** "Active
  in the last 90 days" does not need calendar semantics and gains nothing from
  them. The test is whether a human ever reads the boundary as a date.
- **When a fixed-length choice is deliberate, name the trade-off at the site
  and name what else must change with it.** A calendar-month allowance means a
  variable period length and a short first period; a rolling window means more
  than twelve renewals a year and an unpredictable date. Whichever is chosen,
  the note must also state that the user-facing copy describing renewal is part
  of the decision — otherwise the next engineer "fixes" the boundary and leaves
  the copy asserting something the code no longer does.
- **When labels describe boundaries, interpolate them from the constants that
  do the bucketing.** A bucket labelled "0-30 days" beside arithmetic that
  actually cuts at 28 is a defect no test catches, because one side is a string
  and the other is a number. Derive the label from the constant and
  disagreement becomes structurally impossible — the smallest useful instance
  of [one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary).
- **When a period name is used by more than one subsystem** — a report covering
  "this month" and a job regenerating data "monthly" — **they must resolve the
  same boundary from the same code.** Divergence here produces a report over a
  period nothing regenerated.

## When not to use it

- Pure duration measurement (elapsed time, latency, age) is seconds
  arithmetic and should stay that way; calendar operations there add cost and
  ambiguity for nothing.
- Machine scheduling intervals — poll every five minutes, lease for two hours
  — are durations. Only cadences a human describes in calendar words ("every
  month on the 1st") belong here.
- High-frequency sub-day bucketing in universal time has no calendar
  irregularity to model below the day boundary; keep it simple, but let the
  *day* boundary above it still come from the calendar.

## Smells

- The literals 30, 86400, 604800, or 90 in code that computes a named period.
- A renewal date that changes month to month.
- A weekly series whose bins start on a different weekday than the product's
  week.
- Bucket-boundary labels typed as strings anywhere near the constants they
  describe.
- A cursor loop that adds a fixed day increment while iterating a range in a
  zone with seasonal shifts.
