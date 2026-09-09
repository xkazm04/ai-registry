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
| Rate (proportion over trials) | click-through rate, conversion rate | two-proportion z on the pooled underlying counts | strong, weak, noise |
| Value ratio (ratio of sums, per-unit mean) | return on ad spend, cost-to-revenue ratio, average order value, cost per click | none that is sound over two windows | orientational only |

## Why the third class refuses a test

A ratio of sums is not a proportion. Return on ad spend is revenue over cost; average
order value is revenue over orders; cost per click is cost over clicks. None has a
trial count, so the proportion test does not apply. And the daily values of a ratio
are not additive samples: a daily return-on-ad-spend of 8 on a day with one order
and 3 on a day with two hundred are not two draws from one population, and a
two-sample z over the daily series treats them as if they were. Every value-ratio
delta that has been badged "significant" by a daily z was oversold. The honest tier
for the class is **orientational**: the direction and magnitude are shown, and the
surface says explicitly that no significance test sits behind them.

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
3. For rate metrics, sum successes and trials per window, pool the proportion, and
   compute the two-proportion z on the counts - never on averaged daily rates. A
   window with zero trials cannot be compared and returns noise.
4. For value ratios, return orientational without computing anything.
5. Map z to a tier: strong at two or more standard errors, weak at one or more,
   noise below. **These cuts are practitioner convention** - roughly p < 0.05 and
   p < 0.32 under a normal approximation - and the technique labels them so.
6. Carry the tier beside the delta into every consumer: badge, ranking, chart
   auto-colour, narrative grounding. One computation, many readers.

## Decision rules

- When a metric is a ratio of two sums, return orientational, because no two-window
  test is sound and a manufactured badge is worse than an honest direction.
- When a rate metric is available as counts, test the counts, because averaging daily
  rates weights a quiet day equal to a peak day and the pooled test is the textbook
  one.
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
metrics on a card grid - a reader who scans twelve badges will see one spurious weak
signal per grid on noise alone. The technique's honesty comes from saying this, not
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
more expensive costume. If a client needs a confident read on a money ratio, the
answer is a longer window and a direction, or a designed experiment - not a badge.
