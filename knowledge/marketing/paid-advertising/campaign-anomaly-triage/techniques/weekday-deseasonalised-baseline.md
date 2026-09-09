---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: weekday-deseasonalised-baseline
status: forged
laws: [statistical-honesty-before-a-verdict, not-measured-is-not-zero, label-convention-as-convention]
shared_with: []
use_when: [flagging a day as a spike, drop or outage, scoring click-through or cost-per-click as an anomaly, deciding how much history a daily detector needs before it may speak]
---

# Weekday-de-seasonalised baseline

Paid metrics have a weekly pulse. Spend, clicks and revenue on a Sunday are not
the same phenomenon as on a Tuesday, and a detector that compares a day to a
flat trailing mean flags the pulse itself. The technique is to divide each day by
its weekday's typical weight before standardising, to use baselines that hold
every weekday equally often, and to score ratio metrics as ratios on the days
the ratio exists.

## Procedure

1. **Estimate weekday weights from the series itself.** For each weekday, the mean
   of that weekday's values divided by the overall mean, over a trailing window of
   whole weeks. Normalised around one: "Sunday runs 35% below average".
2. **Floor the weight.** A weight near zero is almost always a sparse-weekday
   artefact rather than seasonality, and dividing by it multiplies an ordinary day
   many times over into a fake spike. Clamp genuine weights below a floor up to
   the floor; leave non-positive weights at one (an absent weekday has no
   shape). Weights at or above the floor are untouched, so a well-behaved series
   is unchanged.
3. **De-seasonalise, then standardise.** Adjusted value = value / weight. For each
   scored day, the baseline is the preceding window of adjusted values; z =
   (adjusted - mean) / standard deviation, using one variance estimator shared by
   every detector in the system - the sample form, since daily points are a
   sample of the account, not its population.
4. **Use whole-week windows.** A baseline of 28 days holds each weekday four times;
   a baseline of 30 holds two of them five times and the rest four, and the mean
   tilts toward whichever weekdays are over-represented.
5. **Re-seasonalise the expectation with the same floored weight** so the
   "expected" number shown beside the observed one is the exact inverse of the
   adjustment, and a reader can reproduce it.
6. **Classify the flagged day.** Negative z with the observed at or below a small
   fraction of expected is an outage; other negative z is a drop; positive z is a
   spike. A cost-share breach on a day is reported only when it is driven by a
   cost spike or a revenue collapse that itself cleared the bar - ordinary daily
   variance in the ratio is not a breach.

## Ratios are scored as ratios, on present days only

Click-through and cost-per-click are ratios, and scoring their components
separately produces the wrong answers in both directions: a day that scales
impressions and clicks together fires two volume spikes though the ratio is
normal, and a collapse in clicks with impressions steady fires nothing on the
ratio that actually collapsed. Score the day-ratio series.

A day whose denominator is absent - no impressions, no clicks - has no ratio that
day. It is not a ratio of zero. Seeding the baseline with zeros for such days
halves the mean and inflates the deviation, so a channel launched mid-series
reads every real day as a spike and hides a genuine collapse under the bar.
Build the baseline only from days where the denominator exists, weight weekdays
over present days too, and require at least half the window in present days
before scoring. When the baseline is shorter than the window, recalibrate the
bar for its actual length.

## Coverage tiers

Declare three tiers by series length and make the detector refuse below the
lowest. As this technique's convention: full confidence needs a baseline plus at
least one day to score (29 days for a 28-day baseline); a degraded tier from 10
days runs a shorter whole-week baseline (14, or 7 as the floor) with a wider bar;
below 10 days nothing is scored. A cliff at the full-tier boundary - 28 days of
data flagging nothing, 29 flagging plenty - is what the degraded tier exists to
remove.

## Decision rules

- When a day's weekday weight is below the floor, clamp it; when it is
  non-positive, use one; never divide by a raw small weight.
- When the baseline's standard deviation is zero, skip the day: a flat baseline
  cannot score anything, and a legacy series that never carried a field yields
  exactly this and stays silent rather than false.
- When a ratio's denominator is absent on a day, that day is neither scored nor
  part of any baseline.
- When the series is below the coverage floor, return no anomalies and render
  "insufficient history"; never widen the window by padding.
- When a flagged day falls inside a known calendar event, label it explained and
  keep it; suppression hides real damage behind a coincident promotion.
- When pricing the impact of flagged days, sum only adverse deviations into the
  headline and report windfalls separately; count distinct days, not records,
  because an outage fires on two metrics for one day.

## What is convention here

The deviation bars - 2.5 standard deviations at full coverage, 3.0 under a
degraded baseline - are practitioner convention. Three is the number most
general-purpose statistical guidance quotes; two and a half is a common
loosening for series a manager wants to be told about. The 28/14/7 windows are
convention constrained by the multiple-of-seven rule; the 10-day floor, the 25%
weight floor, the half-window presence requirement and the 10%-of-expected outage
bar are all convention. None is documented platform behaviour. A published
seasonal-decomposition method with a fitted trend and holiday terms is a
legitimate upgrade when an account has strong non-weekly seasonality; this
technique is the honest minimum, not the ceiling.

## When not to use this

Do not use a daily deviation detector to find a slow slide. A drift of a few
percent a week never clears a daily bar; that is the crater-versus-slow-bleed
technique's job.

Do not de-seasonalise a series shorter than the weight window can support. With
fewer than a couple of weeks, the weekday weights are noise, and a flat profile
(all ones) is more honest than a fitted one.

Do not apply weekday weights across accounts or borrow them from a template.
The weekly shape of a business-to-business account and a weekend-heavy retailer
are opposite; the weights come from the series being scored.
