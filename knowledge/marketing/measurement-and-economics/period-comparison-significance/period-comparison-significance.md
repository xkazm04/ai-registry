---
layer: golden-path
type: golden-path
subject: period-comparison-significance
status: forged
use_when: [rendering a period-over-period delta on a dashboard or in a report, choosing a comparison window or a year-over-year baseline, deciding whether a KPI move deserves a colour or a story, grounding a model that will narrate what changed]
techniques:
  - significance-tier-per-metric-class
  - yoy-364-day-shift
  - equal-windows-and-truncated-flag
  - partial-buckets-flagged-not-compared
  - funnel-decomposition-only-when-strong
  - noise-muted-not-coloured
---

# Period comparison significance

Every marketing surface a client sees is built from the same primitive: a number for
this window, a number for a comparison window, and a coloured arrow between them.
Revenue up 18 %. Conversion rate down 0.4 points. Cost per click up 9 %. The arrow is
the verdict, and the client reads it as one - the agency did well or badly this month.
Almost nothing in the pipeline that produced the arrow asked whether the move was
real. Daily marketing data is noisy, weekday-shaped, gappy at the edges and truncated
at the start of every account's history, and a delta computed naively over it is
wrong in a way that is invisible to the reader, because a fabricated +18 % is typeset
identically to a measured one.

This subject owns **the decision of which period-over-period deltas are real enough
to show, and how the ones that are not are rendered**. It does not own the daily
anomaly - a single day's spike or an outage against a de-seasonalised baseline
belongs to `campaign-anomaly-triage`. It does not own the forecast - the month-end
projection and the goal probability belong to `goal-pacing-and-forecast`. It does
not own the narrative - what a client report may claim, with what provenance and
with what dead-band before a trend word is used, belongs to
`client-reporting-and-data-provenance`. What a delta *means* once it is real - which
channel, which cause - belongs to `performance-root-cause-diagnosis`, and whether
the move was *caused* by anything the agency did belongs to
`attribution-and-incrementality`. This subject sits before all of them: it decides
whether there is a move to explain at all.

## The move is a claim, and a claim has a footing

A principal practitioner holds three things about a period delta that a dashboard
builder usually does not.

First, **a delta is a comparison of two samples, and its footing depends on what
kind of quantity is being compared.** Additive metrics - visits, cost, conversions,
revenue, profit - are sums of daily values, and two equal windows of daily values
can be compared as two samples with a mean and a spread. Rate metrics - click-through
rate, conversion rate - are proportions over counts, and two proportions have a
textbook test on the underlying trials. Value ratios - return on ad spend, cost-to-
revenue ratio, average order value, cost per click - are ratios of sums or per-unit
means, and **a ratio of sums is not a proportion**: it has no trial count, its daily
values are not additive samples, and averaging daily ratios weights a quiet Sunday
the same as a peak Monday. The honest position is that value ratios get a direction
and no confidence claim. A surface that badges a return-on-ad-spend move as
"significant" has manufactured the badge. This is the first technique and the
subject's centre of gravity.

Second, **the confidence a daily two-sample test reports is optimistic, and the
practitioner says so.** Daily marketing series are autocorrelated - yesterday
predicts today - and the published treatment of comparing autocorrelated series is
that an uncorrected test inflates its false-positive rate substantially, because the
effective number of independent observations is smaller than the number of days.
Weekday shape is the strongest form of this. The disciplined response is threefold:
de-seasonalise by weekday before testing where the anomaly machinery already
provides the weights; state plainly that the tier is a heuristic for "real or
noise?" and not a p-value; and never let the strong tier alone license a causal
sentence. Two, one and zero standard errors as the strong/weak/noise cuts are a
practitioner convention and every technique that uses them says so, per
[label convention as convention](../../_laws.md#label-convention-as-convention).

Third, **the comparison window is part of the claim.** A move against the wrong
baseline is not a weaker finding, it is a different finding. December against the
autumn quarter reads pure seasonality as agency performance; a 30-day window against
a 19-day remainder reads the account's age as a collapse; a half-finished month
against a full one reads the calendar as a 60 % loss. The window rules of this
subject - same weekday a year back, equal length or flagged as cut, partial buckets
excluded from every comparison - are not presentation polish. They are what makes
the delta refer to the thing the client thinks it refers to. This is
[statistical honesty before a verdict](../../_laws.md#statistical-honesty-before-a-verdict)
applied to the most common verdict in the domain.

## The four tiers, and why the fourth is not a fifth level of weak

A delta carries one of four tiers: **strong**, **weak**, **noise**, and
**orientational**. The first three are a confidence ladder. The fourth is not on the
ladder - it is the tier of a metric class for which no sound two-window test exists,
and it says "direction only, no confidence claimed". The mistake to design against
is folding orientational into weak. A weak signal is a tested move that did not clear
the strong cut; an orientational read is an untested move. They render differently
(a weak move is coloured with a "weak signal" note; an orientational move is coloured
with a "no significance test" note), they rank differently (strong, weak, then
orientational, then noise - because an untested directional move on a money ratio
still outranks a move the engine *knows* is within variance), and they are narrated
differently (a report may say a ratio "moved", never that it "significantly moved").

Noise, in turn, is not absence. A window with no trials - zero impressions, zero
visits, a single day on one side - cannot be tested, and the honest tier for it is
noise-by-default rather than a computed strong, but the surface must not paint that
as "we measured and found nothing". Where the underlying count is genuinely absent
the delta itself is absent, per
[not measured is not zero](../../_laws.md#not-measured-is-not-zero); the tier only
grades deltas that exist.

## Windows: same weekday, equal length, whole buckets

Three window rules recur across every surface and are worth holding as one
discipline.

**Year-over-year lands on the same weekday.** A 365-day shift moves the year-ago
twin by one weekday every year and two across a leap year, so a Monday is compared
with a Sunday and the weekday gap is read as a year-over-year move. A 364-day shift -
exactly 52 weeks - lands on the same weekday and trades one calendar day of drift for
weekday parity. Retail calendars institutionalise the same choice with a 52/53-week
year; the practitioner's version is simply "shift by 364, restate every seven years
when the drift accumulates". A year-over-year request that cannot fit even one day a
year back falls back to the adjacent window and *says it did*, so neither the
interface nor a model grounded on the result claims a comparison that never happened.

**Windows are equal in length or the cut is visible.** The comparison window is the
equal-length span immediately before the current one. When the series is too short
for that - an account synced 45 days ago asked for "last 30 days" - the current window
is capped to half the series so the two spans stay equal, and the result carries a
truncation flag with the actual span. The flag is not decoration: a narrative layer
consumes it to refuse a trend word, because a halved series has a fabricated
"previous". "12 months, shortened to 22 days" is an honest label; "12 months" over
22 days is a lie the reader cannot detect.

**Partial buckets are flagged and never compared.** Monthly buckets keyed by calendar
month are partial at both ends - the trailing month until month-end, the leading
month when the series does not start on the first. Weekly fixed windows counted back
from the anchor are partial at the start. An unflagged trailing partial fakes a
collapse for the first half of every month; an unflagged leading partial opens every
chart with a near-zero cliff that reads as dramatic growth. The rule is that a bucket
carries a completeness flag, a chart draws a partial bucket distinguishably, and the
last-two-buckets delta is computed over complete buckets only. A partial bucket is
shown - it is real data - but it is never one side of a comparison.

## Explanation is earned, not automatic

Once a revenue move is real, the funnel identity - revenue equals visits times
conversion rate times average order value - splits the log of the move exactly into
three additive driver contributions whose shares sum to one. This is the two-point
case of the log-mean Divisia decomposition used in energy and emissions accounting,
and it is exact and residual-free for a pure multiplicative identity. It is also the
easiest way to explain noise with confidence: a +2 % move within variance decomposes
just as cleanly as a +30 % one, and the reader is handed "70 % of the move came from
conversion rate" about a move that did not happen. The rule is that decomposition runs
only when the top-line move is strong, is undefined (and returns nothing, not zeros)
when any factor endpoint is zero or the move is negligible, and is narrated as a
descriptive split, never as a cause - the drivers co-move, and
[platform-reported is not causal](../../_laws.md#platform-reported-is-not-causal)
applies to the arithmetic of one's own funnel as much as to an ad platform's count.

## Rendering: noise is muted, not coloured, and never hidden

The surface is where the discipline either holds or evaporates. A noise-tier delta
is rendered in the muted tone with its sign and magnitude intact and a hover that says
"within normal variance"; it is not coloured green or red, and it is not removed. A
sub-rounding delta - one that would print as 0.0 % - renders as "no change" rather
than as a signed zero. A weak or orientational delta is coloured (the direction is
real enough to show) with a suffix that tells the reader what kind of confidence sits
behind it. The colour itself follows the metric's good direction - a falling cost
ratio is green - so the tier and the direction are two independent channels and
neither is overloaded to carry the other, in the spirit of
[one target, one threshold](../../_laws.md#one-target-one-threshold): the badge, the
insight ranking, the chart auto-colour and the report sentence all read the same
tier from the same computation.

The corollary that surprises builders: **a delta that is identical on every row is
not a per-row delta.** When channel breakdowns are projected as a static share of the
period totals, every channel's revenue delta algebraically equals the aggregate, and
printing it per row reads as fake data - because it is. Render it once on the total
row and show per-channel deltas only where each channel is summed from its own daily
series.

## Failure modes of the naive reading

- *One test for every metric.* A daily z on a return-on-ad-spend series oversells a
  money ratio; the fix is a tier per class, not a better universal test.
- *Bigger is truer.* Magnitude is a tiebreak inside a tier, never a substitute for it;
  a +40 % on three days of data is noise.
- *The comparison window is whatever is left.* The remainder of a short series is not
  a baseline; cap and flag.
- *Explaining before verifying.* Funnel decomposition on a weak move manufactures a
  story from variance.
- *Hiding noise.* Removing insignificant deltas teaches the client that the dashboard
  only shows wins; muting them keeps the number and removes the verdict.
- *Confidence as cause.* A strong tier says the move is probably not daily variance.
  It says nothing about why. That sentence belongs to the attribution subject and is
  never written here.
