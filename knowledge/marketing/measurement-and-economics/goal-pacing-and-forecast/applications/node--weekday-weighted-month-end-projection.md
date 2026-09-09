---
layer: application
type: application
subject: goal-pacing-and-forecast
technique: weekday-weighted-month-end-projection
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Month-end projection with band, suppressed probability and a future-day prescription - a pure pacing module in a Czech adtech workspace

Verified against `C:\Users\kazda\kiro\systedo-case` at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), `package.json` engines
`node: 24.x`. The whole subject's forecast half lives in one pure function,
`monthlyPacing()` in `src/lib/metrics/pacing.ts:121-225`, with its statistical inputs
in `src/lib/metrics/seasonality.ts` and its windows in `src/lib/metrics/config.ts:23-53`.
It is exercised under `node --test` by `test-unit/metrics-pacing-runrate.test.mjs` and
`test-unit/metrics-pacing-curve.test.mjs` without a database or a framework, which is
why every rule below is a tested rule rather than a comment.

## The projection is the technique, line for line

- **Anchor on the last data point.** `pacing.ts:134-137` derives "today", the month and
  `daysInMonth` from `daily[daily.length - 1].date`, never from the wall clock.
- **Weights from twelve whole weeks, mean-normalised, flat fallback.**
  `seasonality.ts:58-76` averages per weekday over `WINDOWS.weekday` (84 days,
  `config.ts:34`), normalises so the mean present weekday is 1, and returns seven
  ones when the mean is not positive. An unobserved weekday gets weight 1, not 0
  (`seasonality.ts:75`).
- **Present days, not day-of-month.** `pacing.ts:141-146` counts `daysElapsed` as
  the number of points in the month, with the incident written into the comment: a
  gappy month "would otherwise assume more of the month has elapsed than the data
  covers and read artificially behind pace".
- **Scale by whole-month weight over elapsed weight.** `pacing.ts:161-168`: the
  whole-month weight sums every calendar day's weekday weight, the elapsed weight sums
  the present days', and `projection = mtd * weightMonth / weightElapsed`, falling back
  to `mtd` when the elapsed weight is zero. The test at
  `metrics-pacing-runrate.test.mjs:23-40` fixes a flat series so the projection reduces
  to `1000 x 31 = 31 000` and the arithmetic is auditable by hand.
- **The flat plan line is separate.** `proratedTarget = goal * daysElapsed / daysInMonth`
  (`pacing.ts:156`) feeds `pace` and `onPace` (`pacing.ts:210-211`); the card shows it as
  a thin tick beside the seasonal projection (`src/components/dashboard/GoalPacing.tsx:217-225`).

## The band sits on the remainder and the probability is gated

`pacing.ts:170-179` implements the band technique exactly: `dailyRevenueSigma()`
(`seasonality.ts:14-20`) de-seasonalises the trailing 56 days (`WINDOWS.sigma`,
`config.ts:32`) by weekday weight and takes the engine's one sample-variance
estimator; the remaining standard deviation is `sigma * sqrt(daysRemaining)`; the band
is `+-1.2816` of it with the lower edge clamped at `mtd`; the goal probability is the
normal tail via a dependency-free CDF (`seasonality.ts:23-28`).

The gate is a named constant with its reason beside it: `MIN_ELAPSED_DAYS_FOR_PROBABILITY
= 5` at `pacing.ts:14-16`, "below this the i.i.d.-normal forecast is too volatile to
state a precise %". `probabilityReliable` (`pacing.ts:216`) is true only when the month is
complete or five days have elapsed, and the card branches on it
(`GoalPacing.tsx:182-189`): a "chance of hitting goal" span when reliable, "forecast
settles after a few days" otherwise. The band is drawn regardless
(`GoalPacing.tsx:235-260`) - wide and honest on day two, as the technique prescribes.
The interface comment at `pacing.ts:51-56` states the reason in the practitioner's
words: "a near-coin-flip dressed as a hard percentage".

## The structural fact: the prescription divides by future days, never phantom gaps

This is the fact the tree proves rather than merely hosts. `pacing.ts:147-152` computes
a second denominator, `futureDays = daysInMonth - dayOfMonth(last)`, distinct from
`daysRemaining = daysInMonth - daysElapsed`, and the comment names the failure:
"dividing the shortfall by phantom past days understates the required daily pace,
making a barely-recoverable month read as comfortable". `requiredDailyRevenue` and
`recentDailyRevenue` (`pacing.ts:183-184`) divide by `futureDays`; the band
(`pacing.ts:174`) and the projection weights keep `daysRemaining`.

`metrics-pacing-runrate.test.mjs:76-106` is the proof: a May with five missing interior
days and a latest point on the 25th has `daysElapsed = 20`, `daysRemaining = 11`, but
`requiredDailyRevenue = 20 000 / 6`, and the test asserts it is strictly greater than
`20 000 / 11` "not diluted by the 5 phantom interior days". Two denominators, one
function, and a test that would fail if anyone unified them.

The surrounding rules are tested too: a banked goal gives `requiredDailyRevenue = 0`,
never negative (`test:53-60`); a complete month settles every prescription field to 0
(`test:62-74`); a zero-spend series yields `impliedExtraDailySpend = 0` rather than a
division by an unknown return (`test:108-115`). The card hides the required tile once
the goal is banked (`GoalPacing.tsx:147-149`, "the tile would be noise").

## Extra spend: basis chosen, capped, labelled

`pacing.ts:186-199` prices the shortfall at the trailing 28-day return (`WINDOWS.roas`,
`config.ts:36`) unless a fitted response curve and a positive daily spend are supplied,
in which case `extraSpendForRevenue()` (`pacing.ts:96-109`) bisects along the curve
inside `[0, 3 x currentDailySpend]` and returns the ceiling itself when the curve cannot
close the gap within it - "so the UI shows 'at least this much' rather than an invented
number". `metrics-pacing-curve.test.mjs:80-87` pins the cap at exactly `300` for a
`100/day` account against an unreachable goal. The basis travels in `impliedBasis`
(`pacing.ts:223`) and every label on the card reads it (`GoalPacing.tsx:331-343`);
the comment at `GoalPacing.tsx:329-330` records the incident the technique warns of -
the hover once said "at current ROAS" for a number solved along the curve.

## Deviation: revenue only

Nothing in this module paces the efficiency target. `src/lib/targets.ts:11` defines the
paid-portfolio target (`PAID_PORTFOLIO_TARGET_PNO = 0.18`, labelled as looser than the
blended goal and scoped to the campaign console), but no function projects cost and
revenue separately and forms a month-end ratio of projected sums, and no card shows a
required cost ceiling. The standard in the required-pace technique stands; this is the
gap the measurement scout recorded as its fourth "worse than standard" item, and the
`GoalPacing` card's "This month" scope chip (`GoalPacing.tsx:158-162`) is the only scope
labelling the pacing surface carries.

## Neighbours, named not restated

Whether this month's revenue differs from last month's is answered by the significance
tiers in `src/lib/metrics/series.ts`, owned by `period-comparison-significance`. The
campaign-level budget-capped winner (`src/lib/campaigns/types.ts:320-381`, pacing =
cost over active days times daily budget, capped at 0.95 and target return) is owned by
`campaign-anomaly-triage` and is a different pacing altogether - of a budget, not of a
goal.
