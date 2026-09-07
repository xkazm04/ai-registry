---
name: content-metrics-anomaly-check
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/web-analytics
---

# Content metrics anomaly check

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A move is only actionable while the period is still running, but a check that
compares the period so far against a flat percentage fires every Monday and on every
page with forty views, and once a team has learned to ignore it the early warning is
worth less than no check at all.

**Input.** The metrics accumulated so far in the current period, how much of the period
has elapsed and how much of its data has finished landing, the expectation the
property's own history gives for this point in a period, and the deviations already
raised and still open.

**Core action.** Build the expectation for this point in the period out of the weekly
shape the history actually has, judge the gap against how much variance a page of this
volume produces on its own, and stay silent when the gap sits inside it.

**Output.** Silence on a period that is tracking, a named deviation carrying its size
and the band it fell outside when it is not, and in both cases a record that the check
ran, so silence is never confused with a watch that stopped.

## Activities

1. Read the period so far and how complete its data is *(observe)*
2. Derive the expectation for this point in the period from the property's weekly shape
*(decide)*
3. Judge the gap against the variance a page of this volume produces on its own
*(decide)*
4. Raise only the deviations that clear that variance and are not already open *(act)*
5. Record that the check ran and what window it read, including when it found nothing
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The adopter hears from this check only when something has moved off the trajectory
their own history predicted.**

- The expectation a gap is measured against carries the period's weekly shape, so an
  ordinary Monday is not a deviation.
- The band a gap must clear widens as volume falls, rather than one percentage governing
  a page with forty views and a page with forty thousand.
- A deviation already open is not raised a second time on the next look.
- A first run raises nothing and says it established the baseline, rather than reporting
  a delta against no history.

**Hearing nothing from this check is evidence that the period is normal, not evidence
that the check has stopped running.**

- Every run leaves a durable record of the window it read and the verdict it reached,
  and a run that found nothing records that it found nothing.
- A source that could not be reached, or a window whose data has not finished landing,
  is recorded as not judged rather than reported as normal.

## Guidance

Restraint is the value here, and restraint is only credible when silence is written
down. Build the expectation from the shape the history actually has, weekday against
weekday, and let the band widen as volume falls: a quarter of forty views is counting
noise and a quarter of forty thousand is an event. A gap that appears only because the
period's data is still arriving is a freshness problem rather than a deviation, and
saying which of the two you found is most of the work.

## Where this is worth adopting

- A product team that ships on a Tuesday and reads its numbers on a Friday, where a
  regression introduced on the Tuesday has three days to run before anyone opens the
  period that contains it.
- A site with a hard weekly shape, where the alerting that already exists fires every
  Monday morning and every Saturday night and has quietly been muted by everyone it was
  built for.
- A long tail of content where most pages see a few dozen views a week, and a percentage
  rule flags forty of them every run because a page that went from six views to nine
  moved fifty percent.
- An operator running one property alone, who needs the check trustworthy enough that
  hearing nothing is a reason to spend the afternoon on something else rather than a
  reason to go and look anyway.
- A redesign or migration week, when a drop is expected and the only useful question is
  whether it is the size that was expected.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[postgres](examples/postgres.md) for `database`.

## Recommended trigger

`self_paced`. The check is worth running when enough new data has landed to change a
verdict, which is a property of the traffic rather than of a calendar. A fixed clock
runs the same look twice on a quiet property and misses the day the volume actually
arrived. Look when the period has accumulated enough to be judged, and less often once
it is plainly tracking.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How long this adopter's data takes to finish landing, because a check that reads a
  window before it is complete produces a drop on every single run and cannot tell that
  from a real one.
- What a normal period looks like for this property including its weekly shape, since
  the entire check is a comparison against an expectation only the adopter's own history
  can supply.
- How much deviation is worth interrupting someone for, because a check people have
  learned to ignore is worse than no check and the threshold is the only thing standing
  between the two.
- Where the record of a quiet run goes and how the adopter wants to be reached when it
  is not quiet, given that the normal outcome of this recipe is silence and silence
  still has to be observable.

## Dependencies

None.
