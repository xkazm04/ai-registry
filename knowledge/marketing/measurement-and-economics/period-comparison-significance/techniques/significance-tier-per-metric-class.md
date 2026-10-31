---
layer: technique
type: technique
subject: period-comparison-significance
technique: significance-tier-per-metric-class
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [grading a period-over-period delta as real or noise, adding a new metric to a comparison surface, reviewing a dashboard that badges ratio moves as significant]
---

# Significance tier per metric class

A period-over-period delta gets a confidence tier, and the test that produces the
tier is chosen by the **class of the metric**, not applied uniformly. Three classes,
three footings.

| Class | Examples | Test | Tiers it can produce |
| --- | --- | --- | --- |
| Additive | visits, cost, conversions, revenue, profit | two-sample z on the daily values of two equal windows | strong, weak, noise |
| Rate (proportion over trials) | click-through rate, conversion rate | ratio test on day-level counts (successes and trials summed per day, days as units); the pooled two-proportion z only as an upper bound on confidence | strong, weak, noise |
| Value ratio (ratio of sums, per-unit mean) | return on ad spend, cost-to-revenue ratio, average order value, cost per click | delta-method ratio test on day-level numerator and denominator sums where implemented; never a z on daily ratios | strong, weak, noise with the test; orientational without it |

## Why the third class has no shortcut test

A ratio of sums is not a proportion. Return on ad spend is revenue over cost; average
order value is revenue over orders; cost per click is cost over clicks. None has a
trial count, so the proportion test does not apply. And the daily values of a ratio
are not additive samples: a daily return-on-ad-spend of 8 on a day with one order
and 3 on a day with two hundred are not two draws from one population, and a
two-sample z over the daily series treats them as if they were. Every value-ratio
delta that has been badged "significant" by a daily z was oversold.

What is sound is the linearised test the online-experimentation literature uses for
ratio metrics: treat each day as a unit carrying a numerator sum and a denominator
sum, estimate the variance of the ratio of their means by the delta method (the
numerator's variance, the denominator's variance and their covariance), and compare
the two windows' ratios with that standard error (Deng, Knoblich and Lu, "Applying
the Delta Method in Metric Analytics", KDD 2018, which also shows it nearly matching
the older Fieller interval). It weights a peak day by its volume, as the ratio of
sums does, and it rests on exactly the days-as-units assumption the additive test
already makes - no weaker, no stronger. Where the surface implements it, a value
ratio is graded like any other metric. Where it does not, the honest tier is
**orientational**: the direction and magnitude are shown, and the surface says
explicitly that no significance test sits behind them.

## Why the rate test is the quiet oversell

The pooled two-proportion z is the textbook test, and on a period comparison it is
usually the most overconfident badge on the grid. It treats every impression or
visit as an independent Bernoulli trial; real trials cluster - by day, by audience,
by auction - so the day-to-day spread of a click-through rate is far wider than the
binomial spread of a million impressions, and almost any move clears two standard
errors. The same paper measures the shape of the error: treating correlated
observations inside a unit as independent understated the standard deviation by
roughly 40 % in its simulation. The fix is the same unit discipline as for value
ratios - days carry summed successes and trials, and the ratio test runs over days -
which makes rates and value ratios one test with two inputs.

Orientational is a class label, not a fourth confidence level. It does not mean
"weaker than weak"; it means "untested". The ranking rule places it below weak and
above noise - an untested directional move on a money ratio is still worth more of
the reader's attention than a move the engine knows is within variance - and the
rendering rule colours it with a "no significance test" note rather than muting it.

## Procedure

1. Classify every metric on the surface once, in one place, into additive, rate or
   value ratio. A metric added later is classified before it renders.
2. For additive metrics, compute the mean and sample variance of the daily values in
   each window; with fewer than two days on either side return noise; with zero
   pooled standard error return noise when the means agree and strong when they
   differ (a flat series that moved is a real move); otherwise z = |difference of
   means| / standard error.
3. For rate metrics, sum successes and trials per day and run the ratio test over
   days - never a z on averaged daily rates. A dependency-free engine that keeps the
   pooled two-proportion z must label its tier as an upper bound on confidence,
   because the pooled test assumes independent trials. A window with zero trials
   cannot be compared and returns noise.
4. For value ratios, run the same day-level ratio test on numerator and denominator
   sums where it is implemented; otherwise return orientational without computing
   anything.
5. Map z to a tier: strong at two or more standard errors, weak at one or more,
   noise below. **These cuts are practitioner convention** - roughly p < 0.05 and
   p < 0.32 under a normal approximation - and the technique labels them so.
6. Carry the tier beside the delta into every consumer: badge, ranking, chart
   auto-colour, narrative grounding. One computation, many readers.

## Decision rules

- When a metric is a ratio of two sums, test it only by the day-level delta-method
  ratio test, and return orientational when that test is absent, because a z on
  daily ratios is unsound and a manufactured badge is worse than an honest direction.
- When a rate metric is available as counts, test the counts with days as units,
  because averaging daily rates weights a quiet day equal to a peak day and pooling
  every trial as independent oversells on any real volume.
- When either window has fewer than two days, return noise rather than strong,
  because a single day has no spread and the z would be undefined or infinite.
- When the daily series is strongly weekday-shaped, de-seasonalise by the weekday
  weights before the additive test where those weights exist, because the published
  treatment of autocorrelated series is that an uncorrected two-sample test inflates
  its false-positive rate - the days are not independent draws.
- When the tier is strong, still narrate it as "probably not daily variance", never
  as "caused by", because the tier is a heuristic and says nothing about cause.

## What the tier is and is not

It is a dependency-free "real or noise?" badge for a dashboard. It is not a rigorous
p-value: it oversells on very short windows, ignores autocorrelation beyond the
weekday correction, and applies no multiple-comparison correction across the dozen
metrics on a card grid - at a one-standard-error cut roughly a third of pure-noise
metrics clear the weak tier, so a reader who scans twelve badges sees about three
spurious weak signals per grid on noise alone, and a spurious strong one on about
every other grid. The technique's honesty comes from saying this, not
from pretending the normal approximation is exact.

## When NOT to use

Do not use the tier to decide an experiment. An A/B or geo test has its own sample
plan, its own test on independent units and its own multiple-comparison correction;
a period delta tier is a descriptive read of an observational series and must not be
promoted into a verdict on an arm.

Do not compute a tier over a truncated or partial window and render it without the
cut being visible; the tier inherits the window's honesty.

Do not manufacture a value-ratio test by bootstrapping daily ratios "to be safe". The
bootstrap over dependent, unequally-weighted daily ratios is the same oversell in a
more expensive costume; a bootstrap that resamples whole days (in blocks, for the
autocorrelation) and recomputes the ratio of sums is the legitimate cousin of the
delta-method test, not of the daily-ratio z. If a client needs a confident read on a
money ratio, the answer is the day-level ratio test, a longer window, or a designed
experiment - not a badge computed over daily ratios.
