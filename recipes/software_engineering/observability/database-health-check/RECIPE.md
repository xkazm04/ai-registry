---
name: database-health-check
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Database health check

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A connection pool filling up, a bloating table, a replica falling behind or a
counter walking toward an engine limit is visible for days before it is an outage, and
the reports that would have shown it are usually too long to read, so nobody looks until
it is the outage.

**Input.** Read only health queries against one database, the record of what those same
queries returned on earlier passes, and the findings from earlier passes that are still
open.

**Core action.** Judge each signal by how much headroom is left to a limit that will
actually be enforced and how fast that headroom is closing, then rank the findings so a
short list of them can be acted on rather than a long list read.

**Output.** A ranked account naming what is wrong, why it matters and what closes it,
with checks that could not run named as unchecked, an unreachable database raised as its
own critical, and a clean pass recorded as a clean pass.

## Activities

1. Run the read only checks this engine actually supports *(observe)*
2. Measure each signal's distance to the limit it is heading toward and its rate of
approach *(decide)*
3. Rank findings by what happens next and how soon, not by how many there are *(decide)*
4. Set aside findings already filed and still open, and note how long they have stood
*(act)*
5. Report the ranked account, naming unchecked signals and raising unreachability as its
own critical *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A degrading pool, a growing table, a lagging replica or a counter approaching an
engine limit is known while it is still a trend, not after it becomes an outage.**

- Every finding states what is wrong, why it matters and what would close it, rather
  than reporting a number
- A signal with a hard engine limit behind it is judged on remaining headroom and rate
  of approach, not on deviation from its own history
- Database unreachability is surfaced as its own critical, never folded into a generic
  failure

**The account distinguishes what was checked and found clean from what could not be
checked at all.**

- A check that failed on a missing permission or an absent extension is reported as
  unchecked, with what it would need, and is never counted as a pass
- A pass in which every check ran and nothing was found says so, so the next pass knows
  the look already happened
- A read that returned no rows because the credential cannot see them is distinguishable
  from a read that returned no rows because there are none

**A finding that keeps coming back is escalated as a decision somebody owes rather than
reported again identically.**

- A finding already open is carried with its age rather than filed a second time
- A finding that has survived several passes unchanged is raised differently from a new
  one

## Guidance

A check that reports everything is a data dump, not a health check. Rank by consequence:
how much headroom is left to a limit this engine will actually enforce, and how fast it
is closing. Bloat and an unused index rarely deserve the same line as a counter walking
toward a hard ceiling. A check that could not run for want of a permission is unchecked,
never passed. A finding raised on three consecutive passes has stopped being a finding
and is a decision somebody owes.

## Where this is worth adopting

- A team whose database is managed by the application developers because there is no
  DBA, where nobody currently knows whether the last backup restored or whether
  autovacuum has kept up.
- A service that has been running well for two years and has never been looked at since
  launch, where the slow accumulations are exactly the ones that build silently over
  that timescale.
- The handover when a database changes owner, and the new owner needs a short ranked
  list of what is actually wrong rather than the previous owner's assurance that it is
  fine.
- A production incident review where the question is which of the signals were visible
  beforehand, and the honest answer depends on whether anyone had a repeatable read to
  compare against.
- An operator who already runs a monitoring tool but gets a two hundred line report from
  it, has stopped opening it, and needs a handful of findings with consequences attached
  instead.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Nothing outside obliges this pass and no baseline depends on its
regularity, unlike the sampling that feeds performance monitoring. The signals here move
over days and weeks, so look when the database has changed enough to be worth re
reading, or when a finding reported last time should now be verifiably better or worse.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which database and which engine, because the checks that exist at all differ per
  engine and a check absent from one engine must not be reported as passing there
- Which read only credential this work holds and what it is permitted to see, because a
  health check must never be able to write and a credential that cannot read a catalogue
  view produces silence that looks like health
- What the adopter already knows to be abnormal by design, such as a table that grows
  fast on purpose, so it is not reported as a finding every pass
- What the adopter can actually act on, since a finding that needs a maintenance window
  they cannot get is a different conversation from one they can close this afternoon

## Dependencies

None.
