---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: non-overlapping-event-to-series-mapping
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# Four momentum series as a first-match partition

`app/_lib/analytics-momentum.ts` buckets pipeline events into four weekly
series. Its header states the invariant before any code: the mapping is "kept
NON-OVERLAPPING so a week's bars never double-count one transition" (`:5-6`).
Re-read on 2026-09-26 at one pinned commit (Node 24).

## The arms, and the events deliberately excluded

`weeklyMomentum()` classifies with an ordered if/else chain (`:76-79`). That is
the first-match discipline made structural: the chain stops at the first arm, so
no event can land in two.

| Series | Kinds | Note |
| --- | --- | --- |
| `added` | `added`, `intake_degraded` | every entry creation records exactly one of these |
| `hired` | `advanced` / `auto_advanced` **with** `toStage === terminalStage` | checked *before* `advanced` |
| `advanced` | `advanced`, `auto_advanced` | the remainder: non-terminal forward moves |
| `rejected` | `rejected`, `auto_rejected` | one per reject, chosen by the actor option |

The exclusions are the interesting half. The apply route's extra `applied` event
and the seed's `matched` event both accompany an entry creation. Counting them
"would double-count inflow, so neither is used" (`:7-9`). The `hired` arm is
tested first because a hire *is* an `advanced` event: the overlap the technique
names, resolved by precedence written down once. `rejected` and `auto_rejected`
are exclusive at the write path, which records exactly one per rejection
(`:12-14`).

`MOMENTUM_EVENT_KINDS` (`:29`) is exported for the SQL `IN` list
(`app/_lib/db/analytics.ts:548-553`), so the fetch set and the classification set
are one declaration.

## Role, not label: the default is gone

At the first reading `terminalStage` was a parameter with a `"Hired"` default.
It is now **required** (`:49-56`), and the comment says why the default had to
go: on a board whose final column is called "Signed", "every completed hire landed
in the `advanced` bars and the hire series read flat zero forever, with nothing
on screen saying so". The caller resolves it by role, falling back to the axis's
own last column, never to a shipped name (`app/_lib/db/analytics.ts:562-565`).
This is the technique's label rule applied to a default: a literal default is a
label the code chose for the team.

## Rolling windows, and the label that proves the pinning rule

Buckets are rolling 7-day windows ending at `now`, not calendar weeks (`:19-23`).
The comment gives three reasons: no timezone anchor needed, no partial current-week
bar "reading as a collapse", and "the last 7 days" is the question the panel
answers. The panel is operational activity, which is where the conditioned
technique puts rolling windows.

`momentumWeekLabel()` (`:36-45`) is the scar behind the technique's pinning rule.
The bucket date is produced in UTC (`:63`), but the UI used to parse it as local
midnight, "shifting the label back a day for users west of UTC". The fix pins
both the parse and the format to UTC.

## What still falls short

- **Skipped rows are not counted.** Malformed timestamps and out-of-span events
  are skipped rather than thrown (`:71-73`), as the technique asks, but no counter
  records them. A skip count that grows is exactly what would reveal a data problem.
- **The chart does not say it is rolling.** Each bar carries only its start day
  (`AnalyticsMomentumPanel.tsx:76`). "Rolling 7 days ending now, UTC" appears
  only in the page header.
- **One surface, two window lengths.** The span is `ceil(windowDays / 7)` weeks
  (`app/_lib/db/analytics.ts:546`), so a 30-day view draws 35 days of momentum
  beside offer and cohort figures that cover 30.

## Downstream

The `added` series is the forecast's only inflow input (`PerformanceBriefing.tsx`,
`weeklyAdded: data.momentum.map(w => w.added)`). That is why the double-count
exclusions matter beyond the chart: an inflated `added` inflates every projected
hire. The panel and the briefing band above it share one emptiness predicate
(`momentumIsQuiet()`, `performanceBands.ts:44`), so a claim about momentum cannot
render over an empty chart.
