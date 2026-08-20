---
layer: application
type: application
subject: breach-alerting-and-attribution
technique: pre-breach-forecasting
stack: rust
status: forged
verified_on: 2026-08-20
---

# Pre-breach forecasting in LightTrack (Rust)

LightTrack's forward look lives in a pure, I/O-free core
(`crates/core/src/forecast.rs`) with the alert mapping split into its own
module (`crates/api/src/forecast_alerts.rs`) — the projection is testable
arithmetic, and the sweep and the on-demand endpoint provably share one
forecast-to-alert function "rather than two that could drift"
(`forecast_alerts.rs:2-6`).

## The eyeball model, literally

The module doc commits to the explainability posture verbatim: "deliberately
small and explainable: an **EWMA level** … plus a **least-squares linear
slope** … No hidden state, no training — just the same arithmetic an operator
would do by eye, made precise. Forecasts are advisory; the alerts they drive
say 'about N days', not a guarantee" (`forecast.rs:5-10`). `Trend::fit_with`
(`:39-58`) folds the daily series into an EWMA (default alpha 0.5, `:17`) and
a least-squares slope; `project` floors at zero because spend cannot go
negative (`:62-64`).

## Window-aware projection semantics

`forecast_budget` (`forecast.rs:127-151`) is the technique's window table in a
single match: a **Day**-window rule breaches when the projected *daily* value
reaches the threshold (`days_until_daily`, `:74-83`); a **Month**-window rule
when *cumulative* projected spend exhausts the remaining headroom
`threshold − current` (`days_until_cumulative`, `:89-103` — scanned
day-by-day with linear interpolation inside the crossing day), documented as
"a conservative roll-off-free estimate that errs early" (`:123-126`); an
**Hour** window is refused — "sub-daily, so a daily trend can't forecast
them" (`eta = None`). The `.filter(|&d| d > 0.0)` at `:139-140` drops
eta-zero: "an already-breached rule is the live-alert path's job, not a
forecast" (`:118-120`).

## Margin crossover, with the asymmetric zero

`forecast_margin` (`forecast.rs:178-212`) holds revenue flat
("subscriptions are recurring and steady", `:153-155`), fits the trend on the
cost series, and forecasts the day projected daily cost overtakes daily
revenue — only for a still-profitable dimension. The comment at `:193-195`
carries the asymmetry the technique demands: here `Some(0.0)` "is a real
signal … the customer is still net-positive but has begun bleeding day-to-day
— so it is *not* dropped", the exact opposite of the budget path's zero
filter. The already-unprofitable case surfaces in `build_alerts`
(`forecast_alerts.rs:85-97`) as a present-fact alert — "already unprofitable
(margin $…) and cost is still rising" — emitted only while
`cost_trend.slope > 0.0`, so a recovering customer is not re-paged.

## Advisory phrasing and the methodology-free key

`build_alerts` (`forecast_alerts.rs:39-100`) phrases every message as
projection — "is on track to breach … {about N days} — projected ~X/day,
current rolling Y" — while severity is tiered mechanically (`severity`,
`:102-108`: high within 3 days). The dedup key (`dedup_key`, `:26-37`) is
`forecast:{project}:{kind}:{subject}` and its doc comment states the
discipline outright: it "deliberately carries no trace of *how* the forecast
was produced: a scheduled sweep and a hand-made `GET /v1/forecast` for the
same project share this key, so turning the sweep on cannot double the volume
an operator receives." Forecast alerts then ride the same cooldown sink and
channels as live breaches (`docs/ALERTS.md:94-96`), so the operator tunes one
delivery surface, not two.
