---
name: infrastructure-metrics-scan
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Infrastructure metrics scan

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Infrastructure usually fails by drifting away from its own recent normal
rather than by crossing a memorable round number, and the signal everybody watches is
the one that hides it: a resource averaging eighty percent can have been fully saturated
for seconds at a time, which is what the users felt and what the average erased.

**Input.** Latency, traffic, error rate and saturation signals read from the monitoring
provider at the resolution it actually stores them, the rolling baseline for each, and
what earlier triage decided about which deviations were noise.

**Core action.** Compare each signal against its own normal for this hour and weekday
rather than a shared static threshold, weigh work that is queueing ahead of a resource
that is merely busy, and be explicit about what the provider's own resolution makes it
possible to see.

**Output.** An infrastructure account naming which signals left their own normal and at
what resolution that was read, with any signal that could not be fetched stated plainly
rather than shown as an absence of findings.

## Activities

1. Pull the configured signals at the resolution the provider actually stores them
*(observe)*
2. Compare each signal against its own normal for this hour and weekday, like window
against like *(decide)*
3. Weigh work that is queueing ahead of a resource that is merely busy *(decide)*
4. Damp the deviations past triage has already called noise, and record that they were
damped *(act)*
5. Contribute the account, naming what could not be read and the resolution the readings
rest on *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An infrastructure signal drifting from its own normal is caught even when it never
crosses some universal red line.**

- Latency, traffic, errors and saturation are each compared against their own rolling
  baseline for a comparable window, not a shared static threshold
- A saturation signal moving while utilization stays flat is reported as a finding
  rather than dismissed because the resource was not busy
- A corrupted or unreadable baseline is regenerated and the affected signal reported as
  unjudged, rather than left to produce false anomalies

**What the scan could have seen is stated alongside what it saw.**

- The account names the resolution the provider's series was read at, so a reader knows
  the shortest event that could have shown up in it
- A percentile is compared only against a percentile computed over a window of the same
  length, and never derived by combining shorter windows
- A pass with no findings records that it looked and found nothing, so quiet is
  distinguishable from unread

**An unreachable provider is reported as an unreachable provider, never as a clean
scan.**

- A section that could not be fetched appears in the account with the reason, rather
  than being omitted
- Repeated failures to reach the provider escalate rather than accumulating as quiet
  passes

## Guidance

Utilization is the weakest of these signals and it is the one everybody watches. A
resource averaging eighty percent over five minutes can have been fully saturated for
seconds at a time, so read queue depth and wait time ahead of CPU and memory.
Percentiles the provider computed over one window cannot be recombined into a longer
one; compare like window against like. When a signal could not be read, say so in the
account rather than letting its absence read as calm.

## Where this is worth adopting

- A team whose only infrastructure alerting is a CPU threshold inherited from a previous
  architecture, which now fires during every deploy and has never once caught a real
  incident.
- A service that keeps having brief unexplained slowdowns nobody can reproduce
  afterwards, where the five minute rollups everyone is looking at cannot resolve an
  event that lasted forty seconds.
- An operator running several environments where one is quietly the sick one, and a
  baseline computed across all of them has been averaging the sick one back into health
  for months.
- The weeks after an autoscaling or instance type change, when every threshold inherited
  from the old shape is wrong in both directions and nobody has re-derived what normal
  means.
- A team that pays for a monitoring provider, opens it only during incidents, and has no
  standing read that would tell them something moved before a user did.

## Connector types

`monitoring`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. The provider is already sampling continuously, so this work is a read of
someone else's series rather than the sampler itself, and its own regularity buys the
baseline nothing. Look when the last read has aged past the rate at which this
infrastructure changes, or when another signal suggests something moved.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which services or hosts count, because a baseline computed over everything averages
  the drift of the one thing that matters back into health
- Which of the provider's signals are saturation and which are utilization here, since
  the naming differs per provider and the distinction is what decides the ordering of
  the account
- What the adopter has already decided is noise, such as a CPU band that is normal in
  this operation, because the same deviation is a finding in one place and background in
  another
- At what resolution the provider retains each series and for how long, because that
  sets both the shortest event this scan can ever see and the longest baseline it can
  honestly hold
- Where the account is read, since an infrastructure section that reaches nobody is the
  same as no scan

## Dependencies

None.
