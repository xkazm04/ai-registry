---
layer: application
type: application
subject: campaign-anomaly-triage
technique: weekday-deseasonalised-baseline
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Weekday-de-seasonalised baseline - present-days-only ratio scoring in a metrics engine

Verified against the systedo-case workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24.x. The detector is
`detectAnomalies` in `src/lib/metrics/anomalies.ts`, pure and shared between the
dashboard and the campaign alert path (`src/lib/campaigns/anomaly-alerts.ts:37-47`
bridges the campaign series into the engine's daily shape).

## The constants, in one module

`src/lib/metrics/config.ts:23-37` declares every window as a multiple of seven with
the reason in the comment (*keep every window weekday-balanced*): anomaly baseline
28, degraded 14, floor 7, pacing sigma 56, weekday profile 84. `config.ts:41-46`
sets the coverage tiers - full at baseline + 1 = 29 days, degraded from 10 - and
`config.ts:50-53` the bars: `ANOMALY_Z = 2.5` at full coverage, `ANOMALY_Z_DEGRADED
= 3.0` under the shorter baseline. `config.ts:90-95` is the engine's one variance
estimator (sample form, Bessel), and `anomalyThreshold` at `config.ts:79-81`
rescales the bar by sqrt((n-1)/n) so switching estimators left the flagged set
unchanged; `test-unit/metrics-anomalies.test.mjs:51-85` pins that.

Footing: 2.5 / 3.0, 28 / 14 / 7, the 10-day floor and the 25% weight floor are all
convention in this tree, and the module comments say what each protects against
rather than citing a study. The multiple-of-seven rule is structural.

## The structural fact: a zero-seeded ratio baseline manufactures spikes

The raw-metric pass (`anomalies.ts:74-97`) divides each day by its floored weekday
weight (`seasonalWeight`, `src/lib/metrics/seasonality.ts:40-43`, floor
`DESEASON_WEIGHT_FLOOR = 0.25`) and scores against the preceding `window` adjusted
days; a zero standard deviation skips the day (`:84`), and the expectation is re-
seasonalised with the same floored weight (`:88-91`) so `expected` is the exact
inverse.

The ratio pass (`anomalies.ts:99-147`) is the technique's evidence. Click-through
and cost-per-click are scored on the day-ratio series, with the comment at
`:99-107` giving the two failure modes of component scoring (a day that scales
impressions and clicks together fires two spurious volume spikes; a collapse in
clicks with impressions steady is never seen). The comment at `:115-122` records
the incident the present-days-only rule came from: an absent denominator forced the
ratio to 0, *halving the true mean and inflating std, so every real launch day
reads as a spike and genuine collapses hide under the bar*. The fix is structural:
`present` predicates (`:112-113`), weekday weights over present days only (`:127`),
a baseline built only from present days (`:131-132`), a `minPresent` floor of half
the window (`:123`), and a per-point recalibration of the bar for the baseline's
actual length (`:141`).

The tests are the reconciliation. `test-unit/metrics-ratio-anomalies.test.mjs:86-97`
launches a paid channel mid-series and asserts no false ratio anomaly; `:99-109`
asserts a genuine collapse on that same mid-launch channel still fires with a
negative z; `:30-39` the click-through collapse; `:52` the scaled-together day
staying quiet; `:111` a legacy series without the pair producing nothing.

## The 29-day cliff

`test-unit/metrics-anomalies.test.mjs:95-110` names the upward lesson: a 20-day
series *below the old 29-day floor, which returned [] silently*, must still flag a
blatant revenue spike under the degraded tier. The degraded tier at
`anomalies.ts:53-63` is why a young account gets a wider bar rather than silence,
and `:127` asserts that below 10 days the answer is still nothing.

## Goal-breach needs a driver; explained is not suppressed

`anomalies.ts:149-163` reports a cost-share breach only on a day whose cost z or
negative revenue z itself cleared the bar. `src/lib/metrics/explain.ts:9-14` and
`:68-93` label an anomaly inside a calendar event's window with the event and
state it is *NEVER suppressed - the money impact still counts*. `anomalyImpact` at
`anomalies.ts:198-221` sums only adverse deviations into `net`, reports `gained`
separately, and counts distinct days (`:202-205`) because an outage fires on two
metrics for one date; `metrics-anomalies.test.mjs:112` pins the distinct-day count.

## Deviation

The weekday profile is the only seasonality the engine models; there is no fitted
trend, no holiday term and no annual component (`explain.ts:12-14` says so). For an
account with a strong non-weekly season the technique's upgrade path - a published
decomposition method - is not present, and calendar events are the manual
substitute.
