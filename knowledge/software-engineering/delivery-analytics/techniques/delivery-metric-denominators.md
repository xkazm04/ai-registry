---
layer: technique
type: technique
subject: delivery-analytics
technique: delivery-metric-denominators
status: forged
laws: [count-carries-predicate, failure-not-empty-success, derivation-names-recomputation]
shared_with: []
use_when: [defining any delivery rate, plotting a delivery trend, deciding whether a rate has enough samples to publish, reviewing a metric someone else defined]
---

# Delivery metric denominators

Every metric in this subject is a rate, and a rate is two decisions: what is
counted, and what it is counted *out of*. The second decision is where delivery
metrics are honest or dishonest, and it is almost always made by accident —
inherited from whatever the query happened to return.

The recurring errors are specific:

- **Merges are not changes.** A denominator of merge commits counts a
  squash-merged proposal once and a merge-commit workflow's proposal twice.
- **Changes are not work.** A team that splits aggressively produces more
  changes for the same delivered value; every per-change rate moves without any
  behaviour changing.
- **A day is not a census.** A daily point over a repository is a sample of
  whatever happened to land that day, and a weekend is not a productivity
  collapse.
- **The window's edges truncate.** Any duration metric — time to merge, time to
  revert — systematically under-reports near the end of a window, because the
  long-running items have not finished yet. This is the cycle-time denominator
  problem that published delivery-metric critiques keep returning to: measuring
  only completed items makes a backlog of stuck work *improve* the number.
- **Exclusions are invisible.** Two teams excluding different automation from
  the same metric are reporting different metrics.

## Every published rate carries five things

1. **The numerator predicate** — what counted, stated precisely enough to
   re-derive.
2. **The denominator population** — merged changes to production branches,
   proposals opened, deploy events; and *which* of those, since they differ by
   large factors.
3. **The window**, with its boundary convention and time zone.
4. **The exclusions**, named rather than implied.
5. **The sample size**, travelling with the number rather than living in a
   tooltip.

This is [count-carries-predicate](../../_laws.md#count-carries-predicate) as an
interface rule: any delivery number that will be quoted, sorted into a ranking,
or compared across quarters carries all five, or it will be reused for a claim
it does not support — and delivery numbers get reused constantly, because they
are short, memorable, and about people's teams.

## One predicate serves the rate and the evidence

A delivery report almost always ships two things about the same population: the
rate, and the list of example changes behind it. When the rate and the evidence
list are computed by two predicates written at two times, they disagree — the
report claims 18% and lists rows that do not add up to 18%, and the reader
believes whichever they checked. **The membership predicate is written once and
consumed by both**, so the population cannot disagree with its own percentage.
The same rule governs any threshold quoted in prose or in a chart caption: the
analyzer's boundary and the copy's boundary are one declared value, or the
caption becomes a lie the first time the boundary is tuned.

## A minimum-sample floor on every derived rate

A rate over three changes is not a small measurement; it is noise formatted as a
percentage, and it is *more* dangerous than no measurement because it renders
identically to a rate over three hundred. So: **every derived rate declares a
minimum sample size, and below it the output is not a low number — it is no
number**, with the reason stated.

The floor is per-metric, not global, because the metrics have different
variance. A revert rate needs a larger population than a review coverage rate
to say anything, because revert events are rarer. Declare each floor beside its
metric definition and version it with the metric.

Two properties keep the floor honest:

- **Absent must be representable end to end.** If the pipeline's type can only
  carry a number, "insufficient sample" becomes zero at the first hop, and a
  quiet repository is reported as a failing one
  ([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).
- **Suppression is not concealment.** The suppressed metric still appears in
  the report, as a named row saying it was not computed and why. A silently
  omitted row is read as nothing, and nothing draws no attention.

## A point on a delivery trend is a sample, not a census — say it, don't imply it

Delivery trends are the most-misread artifact this subject produces, because a
line chart implies a continuous, comparable, complete series and a delivery
trend is none of the three. State the semantics of a point explicitly, in the
data model and in the rendering:

- Each point **carries its own sample size**. Points built on three changes and
  on three hundred cannot be rendered identically; the reader has no other way
  to know which is which.
- **A gap is a gap.** A period with no qualifying changes is absent, not zero.
  Interpolating across it, or plotting zero, invents a delivery collapse.
- **The window is the unit.** Rolling and calendar windows answer different
  questions and must not be mixed within one series.
- **Where points are weighted, a null contributes nowhere and stays null.** A
  volume-weighted point over a day when no contributing scope produced a
  measurable rate is null, not zero; the weighting must not launder absence
  into a measured value on its way through the sum.
- **A point produced by a different instrument is drawn differently.** A period
  whose inputs came from a deterministic or placeholder engine rather than a
  live measurement is not comparable to a measured one, and the series marks it
  as such rather than asserting it. The same applies to a value that arrived as
  a crashed detector's placeholder: an instrument that failed emits a value
  that must never be blended with real evidence, because the blend makes the
  failure look like a scored, evidenced result.
- **A trend does not license a projection.** If the series cannot support a
  forecast — too few points, unstable population, changed instrument — then no
  consumer may render one, and the way to guarantee that is to make the
  forecast unrepresentable in the series' own type rather than to ask consumers
  not to draw it. Type-level narrowing is the only enforcement that survives a
  new surface being written by someone who never read the caveat. The concrete
  trap: a general trend-fitting helper returns slope *plus* projected level and
  an estimated arrival date, whose semantics come from a banded maturity scale.
  Reusing it on a coverage rate yields "reaches the next band in six weeks" —
  a category error dressed as a forecast. Narrow the returned type at the
  producer so only the slope survives.

Aggregation mechanics themselves — how points roll up across scopes, how
windows compose, how partial periods are handled — belong to the
[metrics-rollups](../../metrics-rollups/metrics-rollups.md) subject; what this
technique owns is what a *delivery* point is allowed to claim.

## Decision rules

- **When a rate's denominator could plausibly be two populations, publish the
  one the reader will assume and name it.** Cleverness in denominator choice is
  indistinguishable from manipulation to anyone who did not choose it.
- **When comparing two scopes, require identical predicate, window, and
  exclusions, or refuse the comparison.** A ranking assembled from
  heterogeneous definitions ranks the definitions.
- **When a duration metric is computed near a window edge, either exclude the
  unfinished tail from both numerator and denominator or report the censoring
  explicitly.** Never let unfinished work silently improve a duration.
- **When a stored rate is recomputed, the recomputation path is named and
  invokable** ([derivation-names-recomputation](../../_laws.md#derivation-names-recomputation)).
  Stored delivery rates outlive the definitions that produced them, and a
  historical series nobody can regenerate cannot be corrected when a definition
  is found to be wrong — only abandoned.
- **When a metric would be published with an unstated denominator, do not
  publish it.** This is the technique's only absolute rule, and it is worth
  holding: an unlabelled delivery rate is not a weak finding, it is an
  unfalsifiable one.

## When not to use this

There is no delivery rate this technique does not apply to. What *is* optional
is the ceremony: an exploratory query run by the analyst who wrote it, for
their own eyes, does not need the five-part label. The rule binds the moment a
number travels — into a document, a dashboard, a score, a conversation with
someone who did not run the query — and teams discover that the moment of
travel is impossible to predict, which is why the label belongs on the metric
at definition time rather than at publication time.
