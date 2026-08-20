---
layer: application
type: application
subject: metric-forecasting
technique: projection-presentability-gates
stack: node
status: forged
---

# The shared presentability gate in the maturity forecast module

`src/lib/maturity/forecast.ts` is this repo's fullest realization of the
technique: one gate, two dimensions, a copy-ready refusal, and four unrelated
surfaces that all refuse identically because they call it rather than
re-deriving it.

## The two thresholds and the reason each exists

- `MIN_FORECAST_POINTS = 3` (`forecast.ts:335`) — "distinct scan days a fit
  needs before its ETA may be shown (below this, R² is 1 by construction)".
  The count dimension is tied explicitly to the degenerate-fit problem, not to
  a general sense of "enough data".
- `MIN_FORECAST_SPAN_DAYS = 14` (`forecast.ts:338`) — the calendar dimension.
  The block comment above both (`forecast.ts:323-333`) states the failure the
  span check exists for, and states it better than most standards documents
  manage: *"`forecastTrajectory` will happily fit a line through two scans a
  day apart and hand back an ETA: the maths is sound, the claim is not. A
  slope read off a 1-day span extrapolated to a promotion date is noise
  wearing a lab coat. `lowData` catches the degenerate n < 3 case (R² = 1 by
  construction), but n alone is not enough — five scans inside one busy
  afternoon are still one afternoon."*

That last sentence is the whole argument for the second dimension, and it is
the source of the "point count is necessary and badly insufficient" section in
the technique.

## The gate reads what the fit actually consumed

`forecastInsufficiency(f)` (`forecast.ts:341-348`) takes the `Forecast` object
itself, not the raw series, and tests `f.points` and `f.spanDays` — fields the
fit populates from the data it really used. Those two numbers come out of the
same-day collapse at `forecast.ts:128`: `meanPerDayKey` folds all observations
sharing a day-offset into one mean, so `points` is *distinct calendar days*
(`forecast.ts:135`, `n = xs.length`) and `spanDays` is the last day-offset
(`forecast.ts:153`). A forty-row afternoon reaches the gate as one point.
This is the `gate-sees-target` law satisfied structurally rather than by
convention — there is no row count for the gate to accidentally read.

## The refusal is prose, rendered verbatim

Each branch of `forecastInsufficiency` returns a finished sentence carrying
the missing evidence and the requirement — `"Not enough history to project:
this fit spans 5 days; a trajectory needs at least 14."` — and the null-fit
branch (`forecast.ts:342`) covers the case where no fit exists at all, so
callers never distinguish "no forecast object" from "insufficient forecast".
`isProjectable` (`forecast.ts:351-352`) is the boolean derived *from* the
prose, not beside it, so the two can never disagree.

The verbatim-rendering contract is documented at the consuming surfaces:
`src/features/bought/delivery/DeliveryFitReadout.tsx:19` notes the copy "is
rendered verbatim — the same sentence the trends page and [the rollup] use",
and `src/app/trends/TrajectoryPanel.tsx:10-18, 41` calls the same function
before rendering anything. `src/lib/db/org-delivery-trend.ts:31` imports it
for the org-level surface. Four surfaces, one door.

## The gate is tested as a shared gate, not as a function

`src/lib/db/org-delivery-trend.test.ts:400-410` is the notable assertion: *"is
EXACTLY the shared gate — the same verdict `forecastInsufficiency` gives the
same series"*. It compares the org-rollup path's decision against a direct
call on the same input, which is the only test shape that catches a second
surface quietly growing its own threshold. `src/app/trends/forecast.test.ts:85-112`
covers the branches themselves, including the span-passes-count-fails and
count-passes-span-fails cases.

## Where this repo goes further than the technique requires

`Forecast.lowData` (`forecast.ts:56-61`) is a separate flag from the gate, and
its doc comment instructs consumers *not* to render `fitQuality` as a hard
confidence percentage when it is set. `src/lib/org/briefing.ts:356-361` honours
it at the point of serialization — `forecastConfidence` is emitted only when
`!rollup.forecast.lowData`, and the comment names the exact failure prevented:
a two-scan forecast otherwise showing "trend confidence 100%" in a board PDF.
That is the suppression-survives-downstream rule from
[fit-confidence-honesty](../techniques/fit-confidence-honesty.md) implemented
as field absence rather than a sentinel, at the last boundary before the
number leaves the system.
