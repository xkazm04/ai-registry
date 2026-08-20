---
layer: application
type: application
subject: analytics-time-windows
technique: calendar-arithmetic
stack: node
---

# Calendar arithmetic across four surfaces of one product

The interesting thing about this codebase's calendar handling is that it is
not in one place — it appears in scheduling, in allowance metering, in trend
bucketing and in week alignment, and each site independently arrived at part
of the same rule. That convergence is the argument for the shared vocabulary.

## Monthly cadence: calendar step with day-of-month clamping

`nextScanFor` (`src/lib/db/org-watch.ts:28-42`) implements "monthly" as same
day-of-month next month, and its comment states the cost of the alternative
precisely: a flat 30-day step walks the date backwards through the calendar
(31st → 30th → 29th …) so a monthly report drifts off its slot and fires
**12.2 times a year instead of 12**. Overflow clamps to the target month's
last day (Jan 31 → Feb 28/29) via the day-0-of-next-month trick
(`src/lib/db/org-watch.ts:37-39`).

Two further details the technique now carries as rules:

- **The mixed policy is deliberate and declared.** `daily` and `weekly` stay
  exact-duration steps (`src/lib/db/org-watch.ts:41`), on the stated reasoning
  that a clock shift moving a scan by an hour is irrelevant and a fixed step
  is cheaper and more predictable. Only month-and-longer cadences take the
  calendar.
- **The cadence table is keyed on the canonical vocabulary.** `SCHEDULE_DAYS`
  (`src/lib/db/org-watch.ts:11`) is a `Record<Schedule, number>` over the
  shared `Schedule` type, so a missing or extra cadence is a compile error
  here rather than a divergence between the route validator and the scheduler.
  Anchoring the step on the *intended* slot rather than the wall clock
  (`nextSlotFrom`, same file) is the neighbouring scheduling subject's
  concern, not this one's.

## Allowance metering: the calendar month, with its trade-offs named

`countMeteredScansThisMonth` (`src/lib/db/credits.ts:275-289`) is the best
example in the repo of the technique's "name the trade-off *and* what else
must change" rule. The window is the universal-time calendar month, resetting
at 00:00 on the 1st, and the comment enumerates the accepted costs: users west
of the canonical zone see the reset mid-evening on the month's last day, and
the window is not anchored to the billing anniversary, so an org subscribing
mid-month gets a bounded first-month double allowance. Then the load-bearing
sentence:

> User-facing copy (the allowance line, the pricing page) says "resets on the
> 1st (UTC)" to match. Anyone "fixing" this to billing-cycle anchoring must
> also update that copy and the reconciliation surfaces that assume calendar
> months.

That is a boundary decision that has enumerated its own dependents. It is also
the enforcement-boundary rule in action: the displayed period is the enforced
period, even though a local-time month would read more naturally.

## Rolling-window starts are calendar days, not millisecond offsets

`resolveWindow`'s `30d`/`90d` branches (`src/lib/window.ts:113-126`) snap to
canonical-zone midnight N *calendar* days back via `addDaysInZone`. The
comment records two successive fixes: a raw `N × 86.4M ms` offset made the
baseline an arbitrary wall-clock instant that flickered within a calendar day,
so a boundary-day scan landed on either side of `start` depending on the hour
the page rendered; and the intermediate `startOfDay(now − N×DAY)` still had a
clock-shift seam where a flat 90 nominal days could snap to the adjacent
calendar day.

## Week alignment: floor to the weekday, then index

`weekIndex` (`src/lib/db/org-signals.ts:318-327`) is the phase problem solved
exactly as the technique prescribes. An upstream provider emits Sunday-aligned
weekly series; a naive `floor(ms / WEEK_MS)` bins on the epoch grid, which is
Thursday-anchored, so two entities' observations on opposite sides of a
Thursday boundary *within the same provider week* land one bucket apart and
their series sum out of phase. The fix floors the instant to its Sunday
midnight first and indexes after; `weekStartMs`
(`src/lib/db/org-signals.ts:333-337`) is the exact inverse via the 3-day
epoch offset.

The horizon rule sits beside it: `ACTIVITY_HORIZON_WEEKS = 26`
(`src/lib/db/org-signals.ts:316`) bounds the zero-filled grid **anchored at the
newest scan week**, not at the present, so one entity last scanned a year ago
cannot stretch the grid back and dilute the trend to ~90% zeros.

## Labels interpolated from the constants that bucket

`DUE_BUCKET_LABEL` (`src/lib/db/org-insights.ts:347-355`) renders
`Due within ${DUE_SOON_DAYS} days` / `Due within ${DUE_MONTH_DAYS} days`
rather than the words "this week" / "this month". The comment records the
defect: "Due this month" read as calendar-aligned and mis-bucketed a July-29
against an Aug-1 item on July 1, when the cutoff was in fact a rolling 31
days. The vaguer "within a month" is gone because a month is 28-31 days and
the cutoff is exactly 31 — the label and the arithmetic now cannot disagree,
because one is derived from the other.

## Deviation

`src/lib/db/org-signals.ts` performs its week arithmetic in universal time
(`Date.UTC`, `getUTCDay`) while the dashboard window snaps in the canonical
org zone. Both are declared, and the canonical zone defaults to universal
time, so no split brain exists today — but the coupling is by coincidence of
configuration rather than by construction. If the canonical zone is ever
overridden, this grid keeps its universal-time weeks while the window moves,
which is precisely the split-brain signature the
[canonical-zone](../techniques/canonical-zone-single-source.md) technique
describes.
