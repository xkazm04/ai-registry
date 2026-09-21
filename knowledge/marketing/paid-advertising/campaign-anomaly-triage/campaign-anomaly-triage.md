---
layer: golden-path
type: golden-path
subject: campaign-anomaly-triage
status: forged
use_when: [ranking which campaigns a paid-search manager should open first, designing badges and alerts over a paid portfolio, deciding whether a metric move is an anomaly or weekday noise, stopping an alert inbox from repeating itself]
techniques:
  - one-target-reciprocal-thresholds
  - disjoint-severity-rules-worst-first
  - weekday-deseasonalised-baseline
  - crater-vs-slow-bleed
  - spend-spike-without-return
  - hysteresis-and-cooldown-tombstones
  - severity-times-spend-attention-order
---

# Campaign anomaly triage

A paid portfolio produces a table of numbers every morning: spend, conversions,
conversion value, clicks, impressions, per campaign, per day. The manager has an
hour. Triage is the discipline that turns the table into a short list ordered by
what to open first - and, just as importantly, into a silence about everything
else. A triage layer that flags half the portfolio has not triaged; it has
re-rendered the table in red.

This subject owns **the verdict and its ordering**: what counts as critical, what
counts as worth watching, what is noise, and in which order a person should spend
their attention. It does not own what to do next. Moving money between campaigns
is `budget-reallocation-prescription`; mining the queries behind a burner is
`search-term-mining`; the causal ladder that explains a whole-account decline
(tracking gap, waste, drift, platform imbalance) is
`performance-root-cause-diagnosis`; whether two periods differ significantly at all
is `period-comparison-significance`; whether a target is being met by month-end is
`goal-pacing-and-forecast`; and whether a campaign that meets its target is
actually profitable is `profit-on-ad-spend-economics`, which this subject consults
only through one optional rule. Triage is the front door those subjects sit behind.

## What a principal practitioner holds true

**There is one target, and every surface reads it.** A portfolio has one agreed
efficiency target per scope - typically stated as a cost share of revenue or as its
reciprocal, a return on spend - and the badge, the cell colour, the sort, the alert
and the prompt all derive from that one number. Where a threshold is expressed in
the lower-is-better form, it is the reciprocal of the higher-is-better form by
construction, never typed by hand. The subject exists partly because a hand-typed
sibling threshold once left a band where the cost-share cell went red while the
return cell and the badge stayed neutral - a disagreement no user could explain.
See [one target, one threshold](../../_laws.md#one-target-one-threshold).

**Rules are disjoint and ordered worst-first.** A campaign matches exactly one band
per axis, and the bands are listed from the most damaging state downward: paused
but still spending, spending with zero conversions, return far below target,
return below target, and - only when a margin is known - return above target but
below break-even. Disjointness is what keeps the badge honest; the ordering is what
makes the first reason the right reason.

**Two kinds of movement, two detectors.** A step change between one sync and the
next - a crater - is caught by a two-point comparison with a "was healthy before"
guard. A slide of a few percent a week never trips a step rule and never breaches a
daily deviation threshold; it is caught only by bucketing into whole weeks and
asking whether the recent moves all point the same way and each clear the series'
own noise. A triage layer with only the first detector is blind to the most
expensive failure an account has.

**A daily anomaly is a deviation from what that weekday usually does.** Paid
metrics carry a strong weekly shape; a Sunday that looks like a drop against a
seven-day mean is often a normal Sunday. Detection divides by a weekday weight
before standardising, uses baselines that are whole multiples of seven days so
every weekday appears equally, and refuses to score at all below a coverage floor
rather than scoring with a lie. Ratio metrics are scored as ratios, on days the
denominator exists, against baselines built only from such days -
[not measured is not zero](../../_laws.md#not-measured-is-not-zero).

**Spend can rise without anything being wrong, and rise while something is.** A
spend spike is an anomaly only when the value did not follow: cost up by a large
fraction while conversion value grew less than half as much. The absolute return
may still look acceptable; the marginal return is what is being diluted.

**An alert fires once per episode.** Hysteresis keeps a campaign in its episode
until it recovers past a band, not merely past the threshold it breached; a
per-key cooldown groups a relapse instead of re-alerting it; a discrete past-day
anomaly is told once and never reminded. The alert inbox is a list of episodes,
not a log of syncs.

**Attention is ordered by severity, then by money.** Within a severity, the more
expensive problem floats up, because the cost of being slow scales with spend and
because a manager's hour is the scarcest resource in the account.

## The load-bearing distinctions

**Threshold versus target.** The target is the business's agreed number. A
threshold is a derived multiple of it - "below sixty percent of target" - and the
multiple is practitioner convention, labelled as such wherever it appears. The
target moves when the business changes its mind; the multiple moves only when a
practitioner argues for it.

**Snapshot versus change versus history.** Snapshot rules read one period's
metrics and can run on any stored sync, including historic ones, so a
portfolio-health timeline is free. Change rules need the diff against the prior
sync and fire only when it is supplied. History rules need the daily series.
A caller without a diff or a series gets the snapshot verdict unchanged - never a
weaker verdict dressed as the same one. This is what lets triage be pure and
shared by a table cell, a badge, a banner and a timeline without four
implementations drifting apart.

**A verdict versus a description.** Triage says "this campaign lost forty percent
of its return since the last sync." It does not say why, and it does not say the
manager's last change caused it: [platform-reported is not causal](../../_laws.md#platform-reported-is-not-causal).
The badge is an invitation to look, and the reason line quotes the campaign's own
numbers so the manager can check it in one glance.

**Adverse impact versus net impact.** When anomalies are priced, only shortfalls
and overspend feed the damage headline; windfalls are reported separately. A
"this cost us" number that nets a good day against a bad one understates the bad
day, and the manager reads the headline, not the components.

**Explained versus suppressed.** A flagged day that falls inside a known calendar
event - a promotion, an outage, a holiday - is labelled with the event and its
money still counts. It is never dropped. Labelling lets the surface render a calm
line instead of an alarm; suppression would let a real problem hide behind a
coincident promotion.

## Coverage, and the honesty floor

Every detector has a minimum history below which it stays silent, and silence is
rendered as "insufficient history", never as "healthy". The daily-deviation
detector needs a baseline plus at least one day to score; below a lower floor it
runs a shorter baseline with a wider bar, and below that it refuses. The slow-bleed
detector needs a minimum number of whole weeks and refuses on any week with no
spend, because a return over zero spend is undefined and guessing a direction is
worse than saying nothing. These are applications of
[statistical honesty before a verdict](../../_laws.md#statistical-honesty-before-a-verdict):
windows are weekday-balanced, partial buckets are dropped, and a thin series earns
a wider bar rather than a confident flag.

The practical consequence is that a young account gets fewer badges, not softer
ones. Resist the instinct to lower a floor because a client's account is new; the
floor exists for that client.

## Failure modes of the naive reading

- **The colour-only triage.** Cells go red on a threshold each surface typed for
  itself. Two cells disagree about one campaign, and the manager trusts neither.
- **The overlapping rule set.** A campaign matches "far below target" and "below
  target" at once; the badge shows whichever rule was written first, and a later
  reorder silently changes verdicts across the portfolio.
- **The seven-day mean as baseline.** Weekends read as drops, Mondays as spikes,
  and the inbox trains the manager to ignore it within a fortnight.
- **The zero-seeded ratio baseline.** A channel launched mid-series has its
  click-through baseline half-filled with zeros; every real day reads as a spike
  and a genuine collapse hides under the inflated deviation.
- **The step-only detector.** A campaign loses three percent a week for two months
  and never earns a badge, because no single sync moved it far enough.
- **The crude slide rule.** "Down twenty-five percent over four weeks" fires on a
  weekday-mix artefact and misses a real slide with one within-noise rebound;
  the fix is a variance gate on each weekly move, not a rebound tolerance.
- **The alert that fires every sync.** No episode memory: the same critical
  campaign lands in the inbox six times a day, and a zero-anomaly sync wipes the
  memory so yesterday's anomaly re-alerts tomorrow.
- **The alert written after the state.** Delivery fails, the state says "already
  alerted", and the problem is never told at all. The durable inbox row is written
  first.
- **The severity-only sort.** Twelve warnings in name order; the one that spends
  half the budget sits ninth.
- **The margin-blind "healthy".** A campaign at target reads green while the
  business loses money on every order - a verdict this subject can only give when
  a margin is supplied, and refuses to fake when it is not:
  [efficiency is not profitability](../../_laws.md#efficiency-is-not-profitability).

## What triage hands to its neighbours

The ordered list is an input, not an outcome. The first critical row is what a
reallocation prescription pre-loads its donor scope with; the burner rows are
what search-term mining opens; the counts of critical and warning are what a
health timeline plots per sync; and the deterministic reasons are what a
generated evaluation is constrained by, so a model cannot call a portfolio healthy
while a rule says otherwise. None of those actions happen inside triage, and none
of them touch spend without their own gate -
[a gate before money and copy](../../_laws.md#a-gate-before-money-and-copy).
Triage's whole contract is that its verdict is cheap, deterministic, explainable
from the campaign's own numbers, and identical on every surface that shows it.
