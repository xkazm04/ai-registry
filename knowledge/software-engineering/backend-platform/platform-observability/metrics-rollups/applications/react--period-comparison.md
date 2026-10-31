---
layer: application
type: application
subject: metrics-rollups
technique: period-comparison
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Period comparison in the Overview dashboard

The Overview comparison pipeline is a faithful instance of the one-doubled-
read discipline on the fetch side, with one precondition violation on the
split side that the technique now names explicitly.

## The confirmed pattern

- **One 2×-window fetch** — when compare mode is on,
  `useExecutionMetrics` (`src/features/overview/sub_activity/libs/useExecutionMetrics.ts:42`)
  fetches `previousPeriodDays` (the doubled window) in a single
  `fetchExecutionDashboard` call. There is no second request for the prior
  period anywhere in the pipeline — one filter interpretation, one snapshot,
  one failure domain.

- **Split locally, render as ghost series** — `mergePreviousPeriod`
  (`src/features/overview/sub_usage/libs/periodComparison.ts:50-89`) splits
  the returned array and merges the previous half onto the current rows as
  `prev_*` keys for ghost lines.

- **Null over fabrication** — `splitComparisonPeriods`
  (`src/features/overview/libs/computeTrends.ts:39-79`) is documented as "the
  single source of period-over-period splitting used across Overview" and
  returns `null` unless compare mode is active AND a non-empty prior half
  exists; its docstring names the defect it retired (a front-half/back-half
  heuristic that fabricated a trend from a single loaded window on the Home
  "Runs" tile). `computeSeriesTrendPct` returns `null` when the prior period
  summed to zero. `makeTrend` (`computeTrends.ts:113-127`) branches before
  dividing: 0→0 is `stable`, and for average-shaped metrics a zero baseline
  is treated as "no samples", suppressing the delta instead of printing a
  fabricated +100%.

- **Derived-object output** — `computePeriodTrends` returns one
  `MetricTrends` structure (value + direction per metric) consumed by the
  KPI cards, rather than letting each tile do its own `(a-b)/b`.

## The two divergences from the standard

1. **Ordinal split over a sparse feed.** Both splitters cut at
   `points.length - periodDays` (`periodComparison.ts:30`,
   `computeTrends.ts:43`) — a positional boundary that presumes a dense
   series. The feed is not dense: `get_execution_dashboard`
   (`src-tauri/db/src/repos/execution/metrics.rs:1181-1196`) emits
   `daily_points` from a `GROUP BY DATE(...)` with **no zero-fill step**, so
   any day with zero executions shifts the split boundary by one. On a
   quiet install the "previous half" is the first N surplus points — not the
   previous period. The technique's dense-series precondition ("the split
   point is a moment in time, not a position in an array") is this finding,
   generalized. Fix shape: densify over the effective window before
   splitting, or split on the bucket date.

   Re-checked 2026-10-31 at personas@22260d77c9: **this divergence is
   resolved for both cited splitters, by the second fix shape.**
   `mergePreviousPeriod` now aligns each row with the day exactly
   `periodDays` earlier by calendar date (`periodComparison.ts:30-49` states
   the old ordinal defect), and `splitComparisonPeriods` takes an optional
   `isoDay` accessor and splits on the calendar (`computeTrends.ts:43-72`),
   which `computePeriodTrends` supplies (`rawDate`, `:143`). The ordinal cut
   survives only as the fallback for plain `number[]` series (`:74-78`),
   which `computeSeriesTrendPct` still uses for the Mission Control Runs tile
   (`sub_missionControl/VitalsConsole.tsx:42`). The feed itself is still
   sparse: `get_execution_dashboard_in_window` buckets rows into a date map
   (`metrics.rs:1479`) and emits `daily_points` only for dates present
   (`:1544-1549`), with no zero-fill; the `:1181-1196` range above no longer
   points at it.

2. **Previous = 0 on sum metrics renders +100%.** `makeTrend` deliberately
   maps "no activity → some activity" to `+100% up` for cost/executions
   (`computeTrends.ts:115-123`, with rationale in the comment). The standard
   prefers a categorical **new** rendering; this is a declared, documented
   variant rather than a collapsed branch — the branch exists, only the
   final rendering differs.

Also worth noting against [aggregate-honesty](../techniques/aggregate-honesty.md):
`avgField` (`computeTrends.ts:107-111`) compares unweighted means of per-day
`successRate` and per-day `p50` — a mean of daily means (weight-blind) and a
mean of daily percentiles (percentiles do not compose by averaging). The
composable parts exist server-side; the trend layer flattens them.
