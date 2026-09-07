---
name: database-performance-baseline-monitoring
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Database performance baseline monitoring

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A database degrades against its own normal long before it crosses any generic
threshold, so a team watching fixed numbers either misses the degradation or is trained
by false alarms to ignore the ones that matter.

**Input.** Metric samples read from one database at a regular interval, the baseline
learned from earlier samples for this metric at this hour and weekday, and the
operator's past verdicts on which patterns turned out to be nothing.

**Core action.** Judge each sample against what this database actually does at this hour
of this weekday, require a move to persist before calling it anything, and decide
whether it is worth a glance, worth waking someone, or worth nothing at all.

**Output.** A per metric baseline that survives a restart and states how much history it
rests on, and alerts that name the baseline they departed from, by how far, and for how
long.

## Activities

1. Read the configured metrics at the interval the baseline depends on *(observe)*
2. Extend the baseline for each metric at this hour and weekday *(act)*
3. Judge each sample against its own learned normal rather than a fixed threshold
*(decide)*
4. Require a move to persist across a second window before calling it a breach
*(decide)*
5. Raise the breach naming the baseline it left, the distance, and the duration
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Deviation is judged against what this database actually does at this hour of this
weekday, not against a generic threshold.**

- An alert names the baseline it deviated from, by how much, and over how long a window
- A metric whose baseline does not yet hold a full weekly cycle is reported as unjudged,
  with the history it does hold stated, rather than alerted on
- A spike that has already ended by the confirming window does not produce an alert
- A pattern the operator repeatedly calls a false positive gets quieter without being
  switched off
- The verdicts that quieten a pattern are held with the baseline bucket they apply to
  and stay reversible, so a pattern damped as noise can be raised again once it turns
  real instead of staying quiet because somebody dismissed it a month ago

**Losing sight of the database is itself reported, and a quiet pass is recorded as
measured rather than left as an absence.**

- Repeated collection failures produce a message rather than silence
- A gap in sampling is visible in the record, and the buckets it left thin are marked as
  thin rather than averaged over
- A pass that found nothing writes that it looked and found nothing, so quiet is
  distinguishable from unmeasured

## Guidance

The question is whether this database behaves like itself. A mean and a standard
deviation are the wrong shape for latency: it is right skewed, and its outliers inflate
the bar meant to catch them. Prefer a median and a robust spread for the same hour and
weekday. Nothing is a breach until it has persisted. A database metric is a cause, not a
symptom, so it earns an interruption only when it is already reaching users or reliably
precedes that; everything else is a report.

## Where this is worth adopting

- A small team running one production database with no dedicated DBA, whose only
  alerting is a fixed CPU threshold that fires every night during the batch window and
  has therefore been muted for months.
- A product with a strong weekly shape, where weekday load is several times the
  weekend's and any single global threshold is either deaf on Tuesday or screaming on
  Sunday.
- A managed database the team cannot see inside, where the provider's dashboard shows
  absolute numbers and nobody can say whether today's connection count is unusual for a
  Thursday afternoon.
- The weeks after a migration or an instance resize, when the old normal no longer
  applies and every threshold inherited from before it is quietly wrong in both
  directions.
- An on-call rotation that has stopped believing database alerts, where the real cost of
  the next degradation is that somebody looks at it forty minutes late.

## Connector types

`database`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[postgres](examples/postgres.md) for `database`, [mysql](examples/mysql.md) for
`database`.

## Recommended trigger

`time`. A baseline exists only if the same metrics are sampled at a regular interval, so
a gap in sampling is a hole in the baseline rather than a missed report. The interval
should match how fast this database can actually degrade, and it also sets the shortest
move the work can ever see.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which database, which engine, and which read only credential, because the metrics
  worth collecting differ per engine and this work must never hold a write credential
- What user visible harm looks like here, because that is what decides whether a
  departed metric is an interruption or a line in a report, and it is a judgement about
  this operator's users rather than a statistical fact
- Which periods are known to be abnormal by design, such as a nightly batch or a month
  end close, because otherwise the baseline learns them as anomalies and alerts on them
  forever
- How long this database's own history has to run before its shape is trustworthy, since
  a baseline keyed on hour and weekday holds one observation per bucket after a single
  week and needs several before its spread means anything

## Dependencies

None.
