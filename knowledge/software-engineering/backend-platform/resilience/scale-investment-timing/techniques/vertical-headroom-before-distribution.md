---
layer: technique
type: technique
subject: scale-investment-timing
technique: vertical-headroom-before-distribution
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a proposal would distribute a workload that currently runs on one node, deciding between a larger machine and more machines, justifying a partitioned or clustered design]
---

# Establish the single-node baseline before distributing

**Before a workload is distributed, state the configuration at which the distributed
version would beat a competent single-node implementation of the same job.** That
figure is the decision. A team that cannot produce it is not choosing between two
designs; it is choosing one and describing the other.

## The entry fee, and why it is usually invisible

Distribution is not a multiplier applied to capacity. It is a different system with
costs the single-node version does not have: serialising data to cross a boundary,
coordinating to agree what happened, handling the partial failures that only exist
once there is more than one participant, and operating the whole arrangement forever
afterwards. Those costs are paid on every unit of work, and they are paid first —
before any of the added capacity is available.

The consequence is measurable and it has been measured repeatedly. Surveys of
published data-parallel systems have found the configuration needed to beat one
competent thread frequently running into the **hundreds of cores**, and in a
meaningful number of the cases examined, no reported configuration beat a single
thread at all. Some of the single-threaded implementations were more than an order of
magnitude faster than the published results for systems running on hundreds of cores.

The conclusion to draw is not that distributed systems do not work. It is narrower and
more useful: **a scalability curve says nothing about whether a system is fast.** A
design that scales beautifully from thirty-two nodes to sixty-four may still be losing
to one machine, and the scaling curve is exactly the artefact that hides it, because
it is drawn with the distributed system's own smallest configuration as its origin.
The origin is the question.

## The baseline must be competent, and that word is load-bearing

The entire technique collapses if the single-node baseline is a strawman. It is easy —
and common, and rarely deliberate — to compare a tuned distributed system against a
naive single-node implementation written in an afternoon, and to conclude that
distribution bought a factor of twenty. What it bought was the difference between an
optimised implementation and an unoptimised one, and that difference was available
without distributing anything.

A competent baseline means: the obvious algorithmic choice rather than the first one,
indexes where the access pattern needs them, the data laid out for how it is read,
and the work done in one pass where one pass is possible. That is a day or two of
effort for most workloads. It is also the cheapest experiment in this subject, because
whichever way it resolves the team wins — either distribution is unnecessary, or it is
justified against a number instead of an intuition.

Measure it against the real workload, per
[gate-sees-target](../../../../_laws.md#gate-sees-target). A baseline established on
synthetic uniform data measures the synthesis, and real workloads are not uniform:
they skew, they have hot keys, and their access patterns correlate in ways that
generated data does not reproduce. The gap between a synthetic benchmark and the
production access pattern is precisely where the distribution decision lives.

Whatever number comes out travels with its predicate, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) — the workload,
the data volume, the concurrency, the hardware, the date. A baseline quoted two years
later against different hardware is not evidence.

## Vertical headroom is larger than assumed, and it runs out sideways

Single machines available today carry core counts in the hundreds and memory in the
terabytes, and a great many workloads that are described as requiring a cluster fit
inside one of them with room to spare. The practical ceiling on a single node is
usually much further away than the team's mental model of it, which was formed on
hardware a generation or two back.

But vertical headroom does not run out on the axis people watch. The axes that
saturate first are, in rough order of how often they bind:

- **Memory bandwidth**, long before core count. Adding cores to a
  bandwidth-saturated workload adds contention rather than throughput.
- **Storage IO**, particularly random reads and the fsync path.
- **Serial sections.** A workload with a meaningful non-parallel fraction is bounded
  by single-core speed, which has been roughly flat for years while core counts rose.
  This is the one that most often makes a large machine behave like a small one.
- **Lock and cache-line contention**, which gets *worse* with more cores rather than
  better.
- **Memory locality.** Past a certain size a single machine is internally several
  machines with a fast link, and a workload that ignores this pays remote-access
  costs while believing it is running locally.

So "we still have cores free" is not evidence of headroom. The measurement has to be
on the axis that is actually saturating, which is frequently not the one the default
dashboard displays.

## The reasons to distribute that this technique does not override

Throughput is the reason this technique interrogates. Several others are legitimate at
any size, and a proposal resting on one of them should not be sent back for a
single-node baseline:

- **Availability.** One node is one failure domain, and no amount of headroom changes
  what happens when it stops. A system with an availability requirement that exceeds
  what one machine plus a restart can deliver needs redundancy, and that is a
  distribution decision made on different evidence.
- **Blast radius.** Isolating tenants, workload classes or trust boundaries from each
  other is a containment argument, not a capacity one.
- **Locality.** Data residency obligations and user-facing latency across regions are
  requirements, not projections.
- **Independent operability.** Where separate teams must deploy and operate on
  separate schedules, the split is an organisational boundary that happens to be
  implemented as a distribution boundary —
  [size-the-system-to-its-maintainers](./size-the-system-to-its-maintainers.md) owns
  that argument.

The honest form of this technique is therefore: distribution for capacity is the case
that requires the baseline. Distribution for a property one node cannot have is a
different decision with different evidence, and conflating the two is how a capacity
argument gets won with an availability justification.

## When not to apply it

**When the workload plainly exceeds any single machine.** If the working set is
larger than the largest available memory or the ingest rate exceeds any single node's
IO, the baseline is a formality. Run it anyway if it is cheap, skip it without guilt
if it is not.

**When the system is already distributed and working.** This technique governs the
decision to distribute. Re-litigating a functioning distributed system on these
grounds is a rewrite proposal and belongs to
[ceiling-as-deadline-not-trigger](./ceiling-as-deadline-not-trigger.md) and
[migration-reason-audit](./migration-reason-audit.md), where the cost of the change
gets weighed rather than assumed away.

**When the single-node option is not operationally available.** A platform that only
offers small instances, or an environment where a large machine cannot be procured or
maintained, makes the baseline academic. Note this as a constraint imposed by the
environment rather than a property of the workload, because environments change and
the note is what lets the decision be revisited.

**Do not use this technique to argue against redundancy.** The most common misuse is
quoting the baseline to justify a single node for a system that has an availability
requirement. Capacity and availability are separate questions, and this technique
answers only the first.
