---
layer: application
type: application
subject: metric-forecasting
technique: projection-presentability-gates
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1.96.1
---

# The honesty gate in front of LightTrack's spend forecast (Rust)

LightTrack projects daily spend, calls and tokens forward to answer "which
budget breaches, and when". The fit itself lives in the pure core
(`crates/core/src/forecast.rs`); the question this subject cares about,
*may this projection be shown to anyone*, has its own module
(`crates/core/src/forecast_gate.rs`), and the module doc opens with that sentence
(`forecast_gate.rs:1`). The breach arithmetic (daily versus cumulative windows,
the margin crossover) belongs to the LLM-cost bundle's pre-breach forecasting
application; this one reads the same tree for the gate.

## The defect the gate exists for is a dense series, not a sparse one

This subject's techniques mostly defend against short, irregular histories.
LightTrack's input is the opposite shape: a **dense daily counter**, with
absent days filled with zero because no traffic means no spend. The module doc
names what that does to a young project: "a project that started spending
three days ago inside a fourteen-day window is fitted over eleven zeros and
three real points — steeply 'rising' by construction. The arithmetic is right
and the conclusion is nonsense" (`forecast_gate.rs:3-6`). The test
`a_young_project_padded_with_leading_zeros_no_longer_reads_as_rising`
(`:122-137`) pins it: a flat 5.0 after eleven zeros fits a positive slope,
and the gate refuses it.

It is fixed twice, at two layers:

- **At the series.** `densify` omits the days before `first_observed` rather
  than zero-filling them (`crates/api/src/forecast.rs:402-419`). The first
  observed day is the earlier of the tenant's creation date and its first
  traffic, because "traffic is itself proof the project existed, so a row
  whose `created_at` was backfilled after the fact must not erase history that
  plainly happened. The seam is 'first evidence of existence', and evidence
  beats bookkeeping" (`:397-399`). This is the technique's definition seam in
  another form: the days before the project existed are the calendar, not the
  metric.
- **At the gate.** The evidence floor counts **non-zero** days, not days
  (`Trend::n_nonzero`, `forecast.rs:33-35`: "A window of zero-fill is not
  evidence, however long it is"). The span runs from the first non-zero day to
  the last (`nonzero_span`, `forecast.rs:287-296`).

## Two dimensions, and a refusal written for a person

`MIN_OBSERVED_DAYS = 4` and `MIN_SPAN_DAYS = 4` (`forecast_gate.rs:24-31`) are
the technique's count and calendar dimensions. The count is justified as "the
smallest number at which a linear fit has any residual left to be wrong about";
the span as "four points crowded into two adjacent days describe a spike, not
a trend". `Trend::presentability` (`:56-74`) returns a `Refusal` whose `reason`
is "copy-ready prose ... rendered straight into the API's `refused[]` and into
an operator's terminal" (`:38-39`): `"4 observed days needed, 2 seen"`,
`"observations span 3 days, 4 needed"`. The response carries every refusal as
a `{ subject, reason }` row (`forecast.rs:69-73`, assembled at `:185-230`), and
the same list covers projections the surface declines for structural reasons:
a scoped rule, or a revenue-share threshold with no fixed figure to cross. The
comment at `:201-204` records why. Such a rule used to publish a row with
"`threshold: null`, no ETA and no refusal — the one shape this surface
promises never to emit".

The lookback parameter is clamped to the floor (`MIN_LOOKBACK_DAYS =
MIN_OBSERVED_DAYS`, `forecast.rs:38-41`): "accepting `lookback=2` would only
mean answering every projection with a refusal — clamping says the same thing
without pretending to try". The handler and the scheduled sweep clamp the same
way (`:153-155`).

## Confidence is withheld under the floor, all the way to the pager

`Trend::r2` is an `Option`, set only when the fit is presentable
(`forecast.rs:39-42`, `:92-96`): "a confidence attached to a projection we
would refuse to show is the lie in smaller type". The alert text honours it:
`confidence_note` prints "(confidence r²=0.87 over 12 days)" or nothing at all
(`crates/api/src/forecast_alerts.rs:62-69`). That is the
[fit-confidence-honesty](../techniques/fit-confidence-honesty.md) suppression
contract holding across the trip into a notification.

## A flat band sized to the level

`FLAT_BAND = 0.05` is a fraction of the level, not a fixed slope
(`forecast_gate.rs:33-36`): "a spend that would take three weeks to double is
not called a trend". `effective_slope` zeroes anything inside the band
(`:82-89`), and the crossing solvers read only the banded slope. For an
unbounded counter whose noise grows with its size, that is the band's correct
form; the maturity-score application of this subject uses an absolute band
because its metric is bounded.

## Two places it departs from this subject's defaults

- **The origin is a smoothed level, not the last day.** `value(t) = level +
  slope·t`, with `level` an EWMA at alpha 0.5 (`forecast.rs:6-8`, `:17`,
  `:75-79`). For daily spend, where a single day is mostly noise, this is the
  "series dominated by day-to-day noise" branch of
  [trend-fitting-and-anchoring](../techniques/trend-fitting-and-anchoring.md).
- **A rising projection must be corroborated before it pages.** `may_page` is
  `is_presentable() && corroborated()` (`forecast_alerts.rs:48-60`), where
  corroboration means the last three days' mean is above the whole window's
  mean (`forecast_gate.rs:91-101`). The comparison is deliberately against the
  window mean and not the EWMA, "which is itself weighted toward the newest
  points". Comparing against the EWMA would suppress exactly the alerts worth
  sending. The test `an_old_spike_that_has_since_cooled_is_not_corroborated`
  (`forecast_alerts.rs:246-253`) is a six-day series that clears the evidence
  floor and still does not page. This guard has no counterpart in the
  subject's techniques; one tree is not enough to promote it.

## What the gate does not cover

A refused spend projection still ships its numbers. `projected_daily_cost_usd`
and the 7- and 30-day totals are filled unconditionally
(`forecast.rs:193-199`), with `confidence: null` and a `refused[]` row beside
them. A consumer that reads the figures and ignores `refused[]` gets the
projection the gate declined. The pager path cannot make that mistake,
because it calls the gate itself. The technique's "gate first, fit second"
holds for alerts, not for the JSON payload.
