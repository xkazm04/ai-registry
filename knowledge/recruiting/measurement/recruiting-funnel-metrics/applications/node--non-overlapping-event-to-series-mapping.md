---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: non-overlapping-event-to-series-mapping
stack: node
status: forged
verified_on: 2026-08-20
---

# Four momentum series as a first-match partition

`app/_lib/analytics-momentum.ts` buckets pipeline events into four weekly
series, and its header comment states the invariant before any code: the
mapping is "kept NON-OVERLAPPING so a week's bars never double-count one
transition" (`:5-6`).

## The arms, and the events deliberately excluded

`weeklyMomentum()` classifies with an ordered if/else chain (`:73-76`), which
is the first-match discipline made structural — no event can satisfy two arms
because the chain stops:

| Series | Kinds | Note |
| --- | --- | --- |
| `added` | `added`, `intake_degraded` | every entry creation records exactly one of these |
| `hired` | `advanced` / `auto_advanced` **with** `toStage === terminalStage` | checked *before* `advanced` |
| `advanced` | `advanced`, `auto_advanced` | the remainder, i.e. non-terminal forward moves |
| `rejected` | `rejected`, `auto_rejected` | one per reject, chosen by the actor option |

The exclusions are the interesting half. The apply route's extra `applied`
event and the seed's `matched` event both accompany an entry creation, so
counting them "would double-count inflow, so neither is used" (`:8-9`). The
`hired` arm is tested first because a hire *is* an `advanced` event — the exact
overlap the standard names as the classic leak, resolved by precedence written
down once. And `rejected` / `auto_rejected` are "non-overlapping for real now"
(`:13`) because `actOnPipelineEntry` writes exactly one of them per rejection,
selected by the actor: the partition is enforced at the write path, not
patched at read time.

`MOMENTUM_EVENT_KINDS` (`:29`) is exported for the SQL `IN` list in
`app/_lib/db/analytics.ts:397`, with the comment "so the SQL IN-list and this
module's classification can never drift" — the fetch set and the classification
set are one declaration.

## Role, not label

`terminalStage` is a parameter, not a constant (`:49-53`): "passed in rather
than hardcoded so a renamed terminal column still fills the `hired` series".
The same discipline runs through the surrounding module — `hiresClosedInWindow`
resolves terminal stages through `stagesWithRole("terminal", axis)`
(`analytics.ts:638`), never the literal string. The hardcoded `"Hired"`
survives only as a default for callers that cannot resolve an axis (`:58`),
which is the correct place for it and the only place it appears.

## Rolling windows, and the label bug that proves the pinning rule

Buckets are rolling 7-day windows ending at `now`, not calendar weeks
(`:19-23`), for the three reasons the standard gives, stated in the same
order: no timezone anchor needed, every bucket the same width so "no partial
current-week bar reading as a collapse", and "the last 7 days is the question
the panel answers".

`momentumWeekLabel()` (`:36-45`) is the repo's own scar and the source of the
standard's pinning rule. The bucket date is produced in UTC (`:60`,
`toISOString().slice(0,10)`), but the UI previously parsed that string as
*local* midnight, "shifting the label back a day for users west of UTC (a
Jul-14 bucket read as '13 Jul')". The fix pins **both** the parse
(`` `${weekStart}T00:00:00Z` ``) and the format (`timeZone: "UTC"`), so the
rendered day equals the server's bucket date in every client timezone. The bar
was always right; the caption under it was wrong, and the caption is what a
reader believes.

Malformed timestamps and out-of-span events are skipped rather than thrown
(`:68-70`): "one legacy row must not blank the whole panel". The skips are not
counted anywhere, which is the one place the standard asks for more than the
module does.

## Downstream, and the honest empty state

The `added` series is the sole input to the forecast's inflow estimator
(`PerformanceBriefing.tsx:100`, `weeklyAdded: data.momentum.map(w => w.added)`),
which is why the double-count exclusions matter beyond the chart: an inflated
`added` would inflate every projected hire figure. The panel and the briefing
band above it share one emptiness predicate (`momentumIsQuiet()` in
`performanceBands.ts`) so the heading and the figure beneath it cannot
disagree — a claim about momentum cannot render over a chart that has none.
