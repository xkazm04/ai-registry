---
layer: application
type: application
subject: alerting
technique: count-spike-rule
stack: process
status: forged
verified_on: 2026-11-06
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Process: a daily cost anomaly rule against a robust replacement

Source rule: a customer-feedback product judges daily volume per slice against the same weekday over
eight weeks, as median and scaled absolute deviation with a square-root floor and a floor of 1, firing
on z at or above 2.5 and an observation at or above the larger of a minimum count and twice the median.
Its document says the guard absorbs growth and does not mention what else it absorbs. That product is
not an agent factory, and it counts for nothing as evidence about factories.

The first evidence for this technique was one miner's own simulation. It was re-run here from the
formula, in fresh code with a different generator, on two seeds at 20,000 trials a cell.

## Re-run: counts

Percent of slice-days that fire. Ranges span the two seeds' cells where they differ.

| Case | Mean/sd | Deviation alone | + floor | + min count 10 | + 2x guard | 1.35x guard |
|---|---|---|---|---|---|---|
| No event, rate 1 | 5.4-5.5 | 14.7-15.0 | 3.1-3.4 | 0 | 0 | 0 |
| No event, rate 10 | 3.0-3.3 | 6.5 | 1.6-1.8 | 1.6-1.8 | 1.2 | 1.6-1.8 |
| No event, rate 1000 | 2.5-2.7 | 5.4-5.5 | 0.8 | 0.8 | 0 | 0 |
| Wander 10 %, rate 1000 | 2.6 | 5.2-5.4 | 5.1-5.3 | 5.1-5.3 | 0 | 0.1 |
| Growth 5 %/week, rate 50 | 15.0-15.4 | 24.4-24.5 | 17.5-17.7 | 17.5-17.7 | 0 | 16 |
| Growth 5 %/week, rate 200 | 15.7-15.8 | 23.3-23.4 | 23.1-23.2 | 23.1-23.2 | 0 | 7.3-7.6 |
| Growth 5 %/week, rate 1000 | 5.9-6.0 | 6.6-7.0 | 6.6-7.0 | 6.6-7.0 | 0 | 0.4 |
| 1.5x event, rate 200 | 99.9 | 99.8-99.9 | 99.8 | 99.8 | **0** | 94 |
| 1.5x event, rate 5000 | 100 | 100 | 100 | 100 | **0** | 100 |
| 2x event, rate 1000 | 100 | 100 | 100 | 100 | 50-51 | 100 |
| 3x event, rate 1000 | 100 | 100 | 100 | 100 | 100 | 100 |
| Past 5x spike, 2x event, rate 10 | 0 | 57-58 | 50 | 50 | 41 | 50 |
| Past 5x spike, 2x event, rate 50 | 0 | 98.5-98.6 | 98.4-98.6 | 98.4-98.6 | 43-44 | 98.4-98.6 |
| Half the baseline idle, active day, rate 50 | - | - | - | - | **36** | - |

The miner's table reproduced in shape. Its bursty row used a different overdispersion, so its figures
are not comparable with the wander row, and the two agree only on the direction: the floor stops
helping. **The last row is new.** Neither the source's document nor the miner tried a series idle on
many days. Requiring a baseline median of at least 5 took it to 0 %.

## Paired proof: a money series in a managed project

A desktop product judges daily spend by mean and standard deviation over up to seven preceding days at
2 sigma, needing three points, and it skips when the deviation is zero. So a flat series that then
jumps never reports, and one earlier spike raises the next bar. Another reader of "cost spike" in the
same product already uses a median, for that reason. The formula was read at one commit and rewritten
in a scratch script. No product code ran, and no real spend data was read: the series are synthetic.

Declared before running. Arm A: as read. Arm B: median of the same window, scale the larger of the
scaled deviation and a minimum, z above 2 and at least twice the median. Both a 50-cent floor and a
10 % floor were tried, with identical results. Target: fires on a true 3x day after a flat run and
after an earlier 5x spike. Floor: false alerts per simulated year, B at most A plus 1. 4,000 trials on
two seeds, ordinary days around 5 dollars.

| Reading | A | B | B with no verdict at median zero (post hoc) |
|---|---|---|---|
| 3x after a flat run, % fired | **0** | 100 | 100 |
| 3x after an earlier 5x spike, % fired | **0** | 100 | 100 |
| False alerts a year, lognormal noise | 33 | 6.4 | 6.4 |
| False alerts a year, weekly shape | 8.5 | 0.8 | 0.8 |
| False alerts a year, idle half the days | 26 | **92** | 1.7 |
| 3x, idle half the days, % fired | 99 | not read | about 50 |

The seam was picked because it could fail, and it did. **The target moved and the floor fell**, 92 a
year against 26, on the kind of series an occasional user produces. So the verdict is `not-better` and
the arm is not proposed as written. The third column was written after seeing that failure, so it is a
hypothesis for the next proof and not a result: it holds the false-alert floor and gives up about half
of the real spikes on an idle series, where the current rule catches nearly all of them.

Return when the product decides what an idle day means for spend. That choice decides the arm: judge
active days only, or report no verdict. Then replay real daily series, with their owner's permission.

## After this run

The formula above is as read at that commit. Later on 2026-11-06 the product fixed the flat-series half
alone and kept the mean, because arm B had failed this floor. A flat baseline now reads half its mean as
one sigma, so the rule fires above double, and a baseline that cost nothing gives no reading. Column A's
earlier-spike row still describes it, since the mean is what an earlier spike moves.
