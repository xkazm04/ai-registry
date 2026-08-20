---
layer: application
type: application
subject: metric-forecasting
technique: trend-fitting-and-anchoring
stack: node
status: forged
---

# Anchoring the ray, and measuring the ETA from now

The doctrine block at the head of `src/lib/maturity/forecast.ts:1-12` states
the technique's two hard rules in three sentences, and the module's tests hold
it to them.

## The fit

`forecastTrajectory` (`forecast.ts:119-183`) runs ordinary least squares over
`(dayOffset, score)`:

- **Elapsed time, not sample index.** `forecast.ts:127-131` computes
  `firstT` and keys every observation by `Math.floor((p.t - firstT) / DAY_MS)`,
  so x is whole days from the first observation. Irregular sampling is
  therefore represented, not flattened.
- **Same-day collapse before fitting.** `meanPerDayKey` (`forecast.ts:87-99`)
  accumulates `{ sum, n }` per key and returns the mean at full precision —
  explicitly single-sourced so the forecast (keyed by day-offset) and
  `plan.ts`'s `dailyAvg` (keyed by ISO date) share one definition of "one
  value per day". `forecast.ts:130` then bails with `null` when every
  observation landed on a single day: *"no slope to read"*.
- **Zero-variance guard.** `forecast.ts:147` computes R² as
  `syy === 0 ? 1 : clamp(1 - ssRes / syy, 0, 1)` — the flat-series degenerate
  case named in the technique, resolved to a perfect fit and then defused by
  the flat trajectory check at `forecast.ts:155-156` that returns no ETA at
  all.

## The anchor

`forecast.ts:151-152` is the rule in two lines:

```
const lastT = parsed[parsed.length - 1]!.t;
const current = parsed[parsed.length - 1]!.value; // anchor on the latest actual value
```

`current` is the **observed** value, not `intercept + perDay * spanDays`, and
the projection at `forecast.ts:158` is `current + perDay * horizonDays`. The
interface comment (`forecast.ts:47`) calls it *"the trajectory's anchor ('you
are here')"* — the fit contributes direction, the series contributes position.
The projection is clamped to the 0–100 score domain on render, while
`etaToNextLevel` solves on the unclamped line, exactly the split the technique
prescribes.

## The ETA is re-measured from the present

`etaToNextLevel` (`forecast.ts:189-247`) solves the crossing in the ray's own
space and then translates:

```
const crossingMs = lastT + exactDaysFromLast * DAY_MS;
const daysFromNow = (crossingMs - nowMs) / DAY_MS;
if (!Number.isFinite(daysFromNow) || daysFromNow <= 0 || daysFromNow > MAX_ETA_DAYS) return null;
```

(`forecast.ts:237-241`.) The comment above it states the failure this prevents:
a stale scan gap otherwise *"prints a crossing date that has already
elapsed"*. Note the `daysFromNow <= 0` branch — a crossing the ray places
behind the present returns null rather than a past date.

`nowMs` is a parameter with a `Date.now()` default (`forecast.ts:119`), and the
head comment (`forecast.ts:3-5`) makes the reasoning explicit: the OLS fit
reads no clock, so the only clock-dependent output is the ETA's absolute date,
which keeps the module deterministic under test and safe inside server
queries. `projectGoal` (`forecast.ts:283`) passes its own injected `nowMs`
down for the same reason.

## The rounding-consistency lesson

`forecast.ts:190-195` carries an incident comment worth reading in full: band
bucketing must use *"the SAME rounded+clamped score `levelForScore`/
`currentLevel` use"*, because a fractional `current` of 64.7 matched no
contiguous integer band, fell through `findIndex` to −1, defaulted to the
first level, and produced *"a null/contradictory ETA whose `fromLevel`
disagreed with `currentLevel`"* — a card reading "currently level 3" beside
"level 1 → level 2". This is where the technique's "bucket the anchor exactly
as the rest of the system does" rule comes from.

## Display clamps stay away from the fit

`src/lib/db/plan.ts:298-301` clamps a goal's returned trend series to the
plan's retention floor for display, and the comment states the boundary:
*"The projector keeps fitting the full series — clamping what feeds pace/ETA
would silently change verdicts."* Two viewers on different retention tiers see
different history and the **same** forecast, which is the correct split.
