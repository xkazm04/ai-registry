---
name: cloud-spend-threshold-watch
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/spend-and-budget
---

# Cloud spend threshold watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A budget is breached in the middle of a billing period and nobody finds out
until reconciliation, by which point the spend is already committed. A watch on the
running total does not fix this on its own, because the total only crosses once most of
the money is gone: what has to be watched is the rate, early enough that there is still
period left to change.

**Input.** Spend so far in the period on one stated cost basis, the trailing run rate
behind it, how much of the period has elapsed, the configured threshold, and which
breach windows are already open.

**Core action.** Project the likely end of period total from a trailing rate rather than
from today's number, refuse to project while too little of the period has elapsed for
the projection to carry information, and speak only when a crossing still leaves time to
act.

**Output.** One alert per breach window, naming what is driving the trajectory and how
much of the period remains, and silence the rest of the time backed by a readable record
of when the last sample was taken.

## Activities

1. Sample spend so far and the trailing run rate on the stated cost basis *(observe)*
2. Project the end of period total, and decline to project while too little of the
period has elapsed for the projection to mean anything *(decide)*
3. Judge whether actual or projected spend crosses the threshold, whether enough of the
period remains to act on it, and whether this window is already open *(decide)*
4. Raise one alert naming the services driving the trajectory and how much of the period
is left *(act)*
5. Hold the breach window open so the same breach is not reported again *(deliver)*
6. Record the sample and the time it was taken, so a quiet period is verifiable without
a message *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Whoever owns the cloud bill learns about a budget breach while there is still enough
of the period left to do something about it.**

- A single alert fires the first time spend so far or projected spend crosses the
  threshold
- Every alert states how much of the period remains, because a crossing announced on the
  last day is a notification and should not be dressed as an alert
- No alert fires on a day already covered by an unresolved breach window
- A threshold crossing is reported with the driver named, not the number alone
- A step change in the rate is raised on its own, rather than waiting for the total it
  will eventually move

**A quiet period produces no message and no doubt that the watch is still running.**

- No message is produced merely to prove the watch is alive
- The time of the last successful sample is readable on demand, so silence can be
  checked rather than trusted
- A sample that could not be taken degrades the projection and is said out loud rather
  than silently skipped

**The watch does not spend its credibility on crossings that were never real.**

- No projection is published from a fraction of the period too small to support one,
  because a single busy day early in a period projects into an emergency
- The projection is stated as an estimate built on figures the provider has not
  finalised, rather than as a measurement
- A one time charge that raises the running total without raising the rate is recognised
  as such rather than reported as a trajectory

## Guidance

A threshold crossed on the running total is news about money already spent, so the only
alert worth sending is one that leaves enough of the period to change the outcome. Early
in a period a projection is mostly noise: a single busy day multiplied by the whole
month. Wait until enough has elapsed, project from a trailing rate rather than the
period average, and say the projection is an estimate built on estimates. One alert per
breach window. Repeating it is how a watch stops being read.

## Where this is worth adopting

- A team on a fixed monthly budget where a runaway job can consume the month in three
  days, and where the useful question is never what has been spent but what the current
  rate ends the month at.
- An operation whose bill has been stable for a year, where the whole value of the watch
  is that it says nothing until the day the rate changes, and where a weekly summary
  would have trained everyone to stop opening it.
- A small company that has already tried the provider's own budget alert and found it
  fires at the end of the month on money it is too late to not spend.
- An account where a committed purchase or an annual charge lands mid period, and a
  naive watch on the running total will call it a breach on the day the operation
  actually got cheaper.
- Anyone who has recently been surprised by a bill and is now inclined to set the
  threshold low, where the recipe's job is as much to stay quiet as to speak.

## Connector types

`cloud`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`time`. One of the few genuine calendar obligations in this lane. Spend so far only
means anything against a billing period, and a run rate projection does not exist
without regular samples inside that period. The cadence is set by the provider's billing
cycle and by how often it publishes, not by a working rhythm: sampling faster than the
provider updates produces repeated readings of the same number.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The threshold and the billing period it applies to, because a projection is
  meaningless without the period boundary it projects toward
- How much of the period must elapse before a projection is worth publishing, because
  that number is the whole difference between an early warning and a false alarm
- What size of move in the rate counts as a step change worth breaking silence for,
  because the source hard-coded a fixed percentage that is noise in one account and a
  crisis in another
- Which charges are known one time events, because a watch that cannot recognise one
  will report the cheapest decision the adopter made all year as a breach
- Whether a breach should be raised once or re-raised as it worsens, because the answer
  changes whether the alert stays trusted

## Dependencies

- Billing read access on the cloud account, verified against a real cost query rather
  than a general identity check, because a credential can be valid and still be unable
  to read cost
