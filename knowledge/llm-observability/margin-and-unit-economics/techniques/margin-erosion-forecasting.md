---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: margin-erosion-forecasting
status: forged
laws: [no-retroactive-restatement, estimation-announces-itself]
shared_with: []
use_when:
  - watching whether a customer's margin is trending toward loss
  - deciding when a repricing conversation must happen
---

# Margin erosion forecasting

A snapshot P&L answers "who is unprofitable"; the more valuable question is
"who is on the way there". Inference-backed products erode structurally:
serving cost scales with usage while flat-priced revenue does not, and field
benchmarks show inference cost's share of spend *growing* as products mature —
usage deepens faster than prices rise. A customer at 60% margin whose usage
compounds a few percent weekly crosses zero on a schedule you can read months
in advance, if you build the surface that shows it.

## The instrument: a per-day margin series

The base instrument is a daily series per dimension key: for each UTC day,
recognized revenue, attributed cost, and their difference — plus window totals
per key and an all-keys totals series. Three construction rules:

1. **Recognize revenue per day with the same rule as the rollup.** A daily
   point is the recognition function evaluated over a one-day window — a
   subscription contributes its daily slice, a refund lands on its day, a
   point-in-time charge spikes its day. Reusing the rollup's function is what
   makes the trend *sum* to the rollup; a second implementation guarantees the
   monthly view and the daily view eventually disagree, and history that
   changes depending on which surface you ask is restatement by accident.
2. **Dense series, explicit zeros.** Missing days are real zeros (no traffic,
   no recognized revenue that day), not gaps — a charting consumer that
   interpolates over gaps invents revenue. This is the one place zero is a
   measurement, because the ingest pipeline's presence makes "no events" an
   observation; a day the pipeline was down is instead a disclosure problem.
3. **Cap keys by absolute total margin, disclose the cut** — per loss-first
   ordering; the totals series is computed over all keys before capping.

## Reading erosion off the series

Erosion is a shape, not a threshold. The patterns worth alerting on, roughly
in order of urgency:

- **Cost curve converging on flat revenue.** Revenue steps monthly;
  cost climbs daily. The gap between them is runway; its slope gives the
  crossing date. When the projected crossing lands inside the customer's
  current commitment period, the repricing conversation is already late.
- **Thin-band residence.** A customer whose margin percentage sits under the
  thin threshold (around twenty percent for inference-heavy products) for
  consecutive windows is not "profitable"; they are one usage spike from a
  loss. Duration in the band is the signal, not a single reading.
- **Post-event divergence.** After a price change, a model swap, or a feature
  launch, compare each key's slope before and after. The trend series is the
  natural instrument for verifying that a repricing predicted by a what-if
  simulation actually materialized.

Any extrapolated crossing date is an estimate and presents itself as one — a
projection drawn from a fitted slope, labeled as projection, never rendered in
the same visual voice as measured history.

## Decision rules

- Window length: default a trailing 30 days, allow up to a year; below two
  weeks the daily noise of batch jobs and weekends swamps the slope.
- Fit slopes on cost and revenue *separately*, not on margin — margin mixes a
  step function with a curve, and fitting the mixture hides the mechanism.
- The unattributed key gets a trend like any other; its cost slope rising
  while attributed slopes are flat means the *linkage* is eroding, not the
  economics — fix instrumentation before drawing business conclusions.
- Do not smooth the stored series; smooth at render time if at all. Stored
  smoothing is quiet restatement.

## When not to use it

Erosion forecasting presumes attribution coverage good enough that per-key
cost curves mean something; with a large unattributed share, invest there
first. And do not automate repricing off the forecast — the series identifies
*who to talk to and when*, and feeds a what-if simulation for *what to
charge*; the decision stays human because the forecast cannot see churn risk.
