---
layer: application
type: application
subject: recruiting-funnel-metrics
technique: forecast-signal-floor
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Two estimators, one observed leg, a two-part floor, and a band that is too narrow

`app/_lib/analytics-forecast.ts` is the only forward-looking figure on a
surface where every other figure is backward-looking (`:1-6`). It is built as the
technique prescribes: pure, import-free, and fed from inputs the analytics
payload already produced. Re-read on 2026-09-26 at one pinned commit of the
consumer, whose engines field and CI both pin Node 24.

## The two independent sources

Both estimators are present and separately typed (`:8-14`):

- **Inflow**: `weeklyVelocity` is the mean of the momentum `added` series
  (`:108`), projected over `DEFAULT_HORIZONS = [4, 8, 12]` weeks (`:87`) and
  multiplied by the funnel's end-to-end conversion `hiredReached / firstReached`
  (`:113`).
- **In-flight**: every active candidate is credited the forward conversion from
  **their own** stage, `hiredReached / row.reached` (`:143-148`). The hire stage
  is skipped as already hired, not in flight.

They surface as two payload fields, `inFlightExpectedHires` (`:149`) and
`projected[]`, and are never averaged. The briefing uses the in-flight figure
for its claim sentence and the inflow figures for the horizon tiles.

## The observed leg replaces the implied one, and only when it can

When a measured `offerAcceptRate` is supplied, the offer-to-hire leg is rebuilt
from it: `projectionConversion = (offerReached / firstReached) × observedAccept`
(`:135-136`). Candidates already at the offer stage are credited the measured rate
directly (`:146`), so one leg is never priced two ways. A null rate leaves the
projection "byte-identical to its pre-offer behaviour" (`:116-121`). Since the
first reading the guard also requires `funnel.length >= 3` (`:131`). On a legal
two-column board the "offer row" was the entry row, and the substitution read
every arrival as having reached an offer. The tree's own comment gives the
figure: 72 projected hires at twelve weeks from 10 leads a week.

## The floor, now on two inputs

`hasSignal` (`:157-158`) now requires `hiredReached >= MIN_FORECAST_HIRES` (3,
`:47`) **and** `inflowWeeks >= MIN_FORECAST_INFLOW_WEEKS` (4 weeks that actually
received candidates, `:55`). At the first reading it was `hiredReached > 0`. The
comments give the reasons the technique lists: a 1-of-40 funnel had licensed
"+7.5 hires over 12 weeks" to one decimal place, and a mean over one burst week
is "a burst, not a rate". The refusal names its own distance from the floor (`signal`,
`:183-188`), and the briefing prints "needs at least 3 hires and 4 weeks… So
far: N hires across M such weeks".

The refusal is still carried by a flag, not the value: `projected[].hires` is the
literal `0` when `hasSignal` is false (`:165-166`), typed `number`. The one
consumer hides the horizons behind the flag, so no zero renders. A second
consumer reading `projected` alone would still read "no hires coming".

## The band: named, and far too narrow

The same change added `low`/`high` per horizon: the same arithmetic at
velocity ∓ one population standard deviation of the weekly buckets (`:60`,
`:165-172`). It is exposed as `weeklyVelocityStdDev`, and the method sentence
names it ("the range is one standard deviation of weekly inflow"). That is
better than the old technique asked for, which was to present the gap between the
two estimators as the interval. Both fall short of an interval.

**Experiment, 2026-09-26.** The tree's own `forecastHires` was fed pipelines with
known transition probabilities: pass rates 0.5 / 0.4 / 0.5 / 0.5 on the fixture
funnel's five stages, Poisson inflow, eight weeks of history, and the fixture's
in-flight shape scaled. The truth was the hires that actually came out of
the in-flight population plus the next *h* weeks' arrivals. Lag within the horizon
was ignored on every arm, as the tree ignores it. Each case and horizon ran 600
trials, and only the runs that cleared the tree's own floor were scored (n in
brackets).

| Case | h | Spread of the two estimators | Tree's ±1 SD band (plus in-flight) | Posterior simulation, 80% |
| --- | --- | --- | --- | --- |
| sparse, 3/week (66 runs cleared the floor) | 4 | 27% | 15% | 89% |
| sparse | 12 | 49% | 32% | 81% |
| fixture-sized, 8/week (377) | 4 | 16% | 18% | 88% |
| fixture-sized | 12 | 17% | 36% | 89% |
| large, 30/week (600) | 4 | 2% | 13% | 81% |
| large | 12 | 5% | 22% | 82% |

Cells are coverage: how often the interval contained the truth. The simulation arm
(Beta posteriors per leg, a Gamma posterior on inflow, 300 draws) lands near its
nominal 80% in every case. That calibrates the harness itself. The estimators'
spread gets *worse* as volume grows, because both estimators are partial and
their gap shrinks relative to the total they both miss. The tree's band misses
the conversion uncertainty, which dominates on a thin funnel. Verdict for the
flipped rule: **better**. What would falsify it: a pipeline where the inflow
variance dominates the conversion uncertainty and the ±1 SD band reaches
nominal coverage. None of the three cases came close.

## Neighbouring floors on the same surface

- `app/_lib/analytics-bottleneck.ts:14`: `BOTTLENECK_MIN_SAMPLE = 3`;
  `pickBottleneck()` (`:22`) returns `null` when no stage clears it.
- `app/_lib/metric-pack.ts:13-15`, `:227`: the three-state contract (`measured` /
  `thin` / `not_measurable`). `:232`: no "% improvement vs before". `:266-273`:
  hours saved are sampled in actions, not hires.

## One deviation still standing

The forecast is still handed the **mean** time to hire as its realization lag:
the briefing passes `avgTimeToHireDays` (`PerformanceBriefing.tsx:117`), and the
module returns it as `etaDays` (`:181`). `medianTimeToHireDays` is computed beside
it (`app/_lib/db/analytics.ts:441`) and never read there. A "typical lag" is a
typical-case question, so it wants the median. The tile labels it "Expected lag"
with no statistic named.
