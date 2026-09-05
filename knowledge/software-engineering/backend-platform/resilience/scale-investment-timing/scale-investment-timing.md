---
layer: golden-path
type: golden-path
subject: scale-investment-timing
status: forged
use_when: [deciding whether a system needs to carry more load than it currently carries, a rewrite or platform migration is being proposed on growth grounds, choosing between buying headroom and changing architecture, sizing a system against the team that will operate it]
techniques:
  - ceiling-as-deadline-not-trigger
  - next-order-of-magnitude-only
  - vertical-headroom-before-distribution
  - size-the-system-to-its-maintainers
  - migration-reason-audit
  - execution-model-concurrency-threshold
---

# Scale investment timing

Every subject that touches load presupposes an answer to a question none of them
asks. Limiting a request rate presupposes a ceiling somebody chose. Sharding
presupposes that one node was not enough. Replication presupposes two stores that
must converge; shedding presupposes a capacity already fixed. Most of those
mechanisms are well understood and this bundle covers them thoroughly — rate
limiting, replication on both of its shapes, and shedding each have a subject.
**Partitioning does not**, and the omission is worth naming here rather than
leaving a reader to discover it: this subject can tell you when one node stopped
being enough, and the bundle currently hands you nothing for what to do next on
that axis. **The decision that summons these mechanisms is this subject, and it is
the stage most systems skip.**

The naive reading is that this is capacity planning, that it is arithmetic, and that
it belongs to whoever owns the infrastructure budget. The principal reading is that
it is an *investment* discipline operating under a projection nobody believes past
two years, that its output is a sequence of increments rather than a destination, and
that its dominant failure is not miscalculation but **imitation** — a system sized to
resemble a larger organisation's published architecture rather than to carry its own
observed load.

## The asymmetry that defines the subject

Under-building and over-building both fail, and the reason a discipline is needed is
that they fail on different clocks and produce wildly different amounts of signal.

Under-building fails **loudly, at a known moment**. The system saturates, latency
climbs, something pages, and afterwards everyone agrees there was a problem. The
event is dated, attributable, and it generates exactly the organisational energy
required to fix it.

Over-building fails **silently and continuously**. The bill is paid monthly, the
operational surface is staffed forever, delivery runs slower because every change
crosses more boundaries, and none of it is ever written up as an incident, because
nothing broke. There is no moment at which a team discovers it has been paying for
capacity it does not use — and no one is ever paged for a cluster that is too large.

So the feedback available to a team is asymmetric in exactly the wrong direction:
**the more expensive of the two failures is the one that generates no signal.** That
is the whole reason this subject exists as a written discipline rather than as
judgement. Judgement is calibrated by feedback, and one side of this decision returns
none.

## The unit is an increment, not a destination

Scale targets are habitually stated as destinations — build for a million users,
build for ten thousand writes a second — and the framing is itself the error. A
destination invites a single act of construction, sized against a number nobody can
defend, and it converts every subsequent conversation into a defence of that number.

The unit that survives contact is the **increment**: what is the next order of
magnitude, on the axis that will bind first, and what does it cost to get there from
where the system actually is. An increment is arguable, because both of its ends are
observable. A destination is not, because one of its ends is a story about the
future.

This has a consequence teams find uncomfortable and should state out loud anyway:
**choosing one increment is choosing a future migration on purpose.** A team that has
not said so will experience that migration as a failure of the original design rather
than as the plan executing, and will over-correct into exactly the destination
thinking this subject exists to prevent.

## The ceiling is written down before it is needed

The most valuable artefact this subject produces is a **stated ceiling**: a number,
the axis it is measured on, and the method that measures it. Not an intuition, not
"we will know when we get there" — a figure somebody can instrument and somebody else
can disagree with. A ceiling that exists only as a feeling cannot be falsified,
cannot be alerted on, and cannot be argued against, so the decision to act on it
degrades into whoever is most anxious in the room. Like every number that travels it
carries its predicate, per
[count-carries-predicate](../../../_laws.md#count-carries-predicate), and like every
derived value it names how it is recomputed, per
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation).

And the ceiling is **a deadline, not a starting gun.** This is the correction that
matters most in the whole subject, because the intuitive reading — ride the current
architecture all the way to its limit, then replace it — quietly selects the most
dangerous replacement method available. The replacement approach that actually works
is incremental substitution behind a stable interface, one capability at a time, with
both systems live. That method needs **runway**, and runway is precisely what a team
has none of at the moment the ceiling is reached. Arriving at the ceiling unprepared
forces an all-at-once cutover, under time pressure, on a second system whose scope is
inflated by everything the first one was not — a combination with a long and
well-documented record of consuming a team without shipping. The ceiling's job is to
tell you when the incremental programme must have *finished*.
[ceiling-as-deadline-not-trigger](./techniques/ceiling-as-deadline-not-trigger.md)
owns the ceiling's form, its instrumentation, and the runway calculation that turns
it into a start date.

## One order of magnitude, on a named axis

Design for the next order of magnitude and no further, and be specific about the axis,
because *ten times the scale* is not a specification until it says ten times of what.
Requests, tenants, stored bytes, concurrent editors, items in the largest single
collection, fan-out per write, and the budget of a shared downstream that every
instance draws on are different axes with different constants, and systems rarely
bind on the axis their owners quote. The axis that binds is usually the
one with the worst constant, not the one with the largest number.

Confidence in a growth projection decays sharply with horizon, and the decay is the
argument for the increment: two orders of magnitude out, a projection is not a plan,
it is a mood. Drawing that curve honestly — the fit, the confidence, whether it may be
shown at all — belongs to
[metric-forecasting](../../../engineering-assessment/measurement-method/metric-forecasting/metric-forecasting.md)
and this subject consumes its output rather than re-deriving it.
[next-order-of-magnitude-only](./techniques/next-order-of-magnitude-only.md) owns axis
selection, the increment's sizing, and the irreversibility test that says where the
rule stops applying.

## The distribution decision has a baseline, and it is rarely computed

Before a system is distributed there is a question with a real, measurable answer:
**what configuration would the distributed version need in order to beat a competent
single-node implementation of the same job?** Published surveys of data-parallel
systems have repeatedly put that answer in the hundreds of cores, and in a number of
measured cases no reported configuration beat one well-written thread at all.

The lesson is not that distribution is wrong. It is that distribution charges an
**entry fee** — coordination, serialisation, partial failure, and the operational
surface that comes with all three — and that the fee is frequently larger than the
workload being distributed. A team that has never measured the single-node baseline
does not know whether it is paying that fee for capacity or for the appearance of it.

Vertical headroom is also much larger than most teams assume, and it runs out on axes
they do not usually check: memory bandwidth and IO saturate long before core count
does, and a machine that is nominally huge can be effectively small for a workload
that thrashes one of those. The reasons to distribute that survive this analysis are
mostly *not* about throughput — availability, blast radius, and locality are real and
they justify distribution at any size.
[vertical-headroom-before-distribution](./techniques/vertical-headroom-before-distribution.md)
owns the baseline measurement, the axes that actually saturate, and the
non-throughput reasons that override the rule.

## The system is sized to whoever operates it, not to whoever built it

An architecture's real constraint is the cognitive capacity of the team responsible
for it. A well-established line of ownership practice states this as a rule about
growth — a subsystem should not be allowed to exceed what its owning team can hold in
their heads — and this subject adds the half that gets missed: **that team's size is
not a constant, and the direction that breaks a design is down.** Headcount tracks
funding, funding moves on a quarterly clock, and architecture moves on a multi-year
one. A system built by
thirty people and operated by eight has not become more complex; it has become
under-staffed, and every symptom it produces — slow delivery, unowned services, alert
fatigue, an on-call rotation nobody survives — will be reported as a people problem
by people who are correct that it feels like one.

The corrective is to write the maintaining headcount down as an explicit design input
at design time, next to the load figures, and to treat a fall in it as a design
event rather than a staffing event. The structural half of this — what makes a
boundary cheap or expensive to hold — belongs to
[module-design](../../../engineering-process/codebase-stewardship/module-design/module-design.md);
what this subject contributes is the count, and the discipline of revisiting it.
[size-the-system-to-its-maintainers](./techniques/size-the-system-to-its-maintainers.md)
owns the input, the recomputation trigger, and the diagnostic that separates an
over-built system from an under-staffed one.

## The axis inside the process: concurrent in-flight operations

Node count is not the only axis this discipline has to arbitrate. A system also
chooses an **execution model** — one worker per unit of work drawn from a pool, or a
cooperative model where many units share few workers by yielding at explicit
suspension points — and that choice is made overwhelmingly by default, taste or
fashion rather than against a figure. It belongs here because it has every property
the subject was built for: a threshold on a named axis, a per-unit cost model that
sets it, and the asymmetry that the wrong answer generates no incident.

The threshold is not exotic. Cooperative multiplexing earns its complexity at roughly
a thousand to ten thousand concurrent, mostly idle operations; most services are
below that, and below about ten concurrent input/output operations the simple model
should be assumed faster until profiled. What makes the decision go wrong is that the
cost usually quoted for a dedicated worker is its *reserved address space* rather
than its resident memory — an overstatement of two orders of magnitude — and that
teams measure throughput when the binding axis is occupancy.
[execution-model-concurrency-threshold](./techniques/execution-model-concurrency-threshold.md)
owns the axis, the cost model, and the three inversions that override it outright.

## A migration's stated reasons are evidence

When a platform migration is proposed on growth grounds, the cheapest available check
is to enumerate its stated reasons and sort them. Reasons that name a measured
constraint go in one list; reasons that name a technology, a peer organisation, or a
capability the team would like to have go in the other. A proposal whose first list is
empty is buying something other than capacity, and it will be paid for in delivery
velocity for as long as it takes.

The honest version of this check is not a purity test, and stating it as one is how it
gets ignored. Hiring, ecosystem direction, vendor concentration risk and operational
familiarity are **legitimate** reasons to move, and a migration justified entirely by
one of them can be correct. What the audit demands is that the reason be *stated*,
because an unstated reason cannot be weighed against its cost — and the cost of a
platform migration is not underestimated in the way people expect. Measured across
large samples of information-system projects the *typical* overrun is modest, around a
quarter; the damage sits in a fat tail, where roughly one project in six runs several
times over its budget and most of a year over its schedule. A point estimate is right
about the middle and silent about the case that ends a team, which is why the audit
asks for a range whose upper end is the tail.
[migration-reason-audit](./techniques/migration-reason-audit.md) owns the
enumeration, the sorting rule, and the counter-case where a non-technical reason
carries the decision on its own.

## What this subject does not own

The mechanisms it decides to invoke belong elsewhere and are covered well:
[rate-limiting](../rate-limiting/rate-limiting.md) for the ceiling's enforcement,
[admission-queue](../../work-execution/admission-queue/admission-queue.md) for what
happens to load above capacity,
[sync-replication](../../data-layer/sync-replication/sync-replication.md) for
convergence between stores, and
[runner-fleet](../../../engineering-process/continuous-integration/runner-fleet/runner-fleet.md)
for build execution capacity specifically. Instrumenting the ceiling once it is
stated is
[observability-telemetry](../../platform-observability/observability-telemetry/observability-telemetry.md).
Drawing and disclosing the growth projection is
[metric-forecasting](../../../engineering-assessment/measurement-method/metric-forecasting/metric-forecasting.md).
Structural decisions inside the codebase, including which of them an agent may make,
are
[module-design](../../../engineering-process/codebase-stewardship/module-design/module-design.md).

Two exclusions are worth stating because they look like they belong here and do not.
**Arguing the investment to people who do not build software** — the business case,
its framing, its numbers — is a communication discipline; this subject decides whether
the investment is warranted, which is a different act performed by different evidence.
And **team topology and hiring** are out of scope entirely: technique four takes the
maintaining headcount as an *input* it reads, never as a recommendation it makes.

## Failure modes this standard exists to prevent

- **The imitated architecture** — a system shaped like a much larger organisation's
  published design, adopted for the shape rather than for any load the team has
  observed.
- **The unstated ceiling** — every engineer holds a different number for when the
  current design runs out, none of them written down, so the moment to act is
  discovered rather than scheduled.
- **The ceiling ridden to the wall** — the limit correctly identified and correctly
  measured, then used as a start signal, leaving only the all-at-once replacement
  method and no runway for the incremental one.
- **The unmeasured distribution** — a system distributed without anyone establishing
  what a single competent node would have done, so the entry fee is paid without
  anyone knowing whether it bought anything.
- **The wrong axis** — a system built for ten times the requests that falls over on
  the largest single collection, because the quoted axis was not the binding one.
- **The orphaned architecture** — a design that was correct for the team that built
  it and is unoperatable by the team that has it now, diagnosed forever as a staffing
  shortfall.
- **The status migration** — a platform change whose stated reasons contain no
  measured constraint, discovered only after delivery has stopped.
- **The destination** — a single number, far away, defended for years, against which
  every increment is judged inadequate.

## The techniques

- [ceiling-as-deadline-not-trigger](./techniques/ceiling-as-deadline-not-trigger.md)
  — the ceiling's three parts, the difference between a ceiling in utilisation and one
  in headroom and whether arrivals are open or bounded, why an uninstrumented ceiling
  is an absent guard, the runway calculation that converts a limit into a start date,
  and the hysteresis that replaces runway where the remediation is cheap and
  repeatable.
- [next-order-of-magnitude-only](./techniques/next-order-of-magnitude-only.md) — axis
  selection and the worst-constant rule, sizing the increment, horizon decay, and the
  irreversibility test that says when to build further than one increment.
- [vertical-headroom-before-distribution](./techniques/vertical-headroom-before-distribution.md)
  — the single-node baseline as a stated figure, the axes that saturate first, and
  the non-throughput reasons that override the rule outright.
- [size-the-system-to-its-maintainers](./techniques/size-the-system-to-its-maintainers.md)
  — maintaining headcount as a written design input, the fall in it as a design
  event, and the diagnostic separating over-built from under-staffed.
- [execution-model-concurrency-threshold](./techniques/execution-model-concurrency-threshold.md)
  — concurrent in-flight operations as a sized axis, the per-worker cost model that
  derives the threshold, occupancy versus throughput as the instrument, and the
  platforms and ecosystems where the trade does not exist.
- [migration-reason-audit](./techniques/migration-reason-audit.md) — the enumeration,
  the two-list sort, the cost figure that is reliably underestimated, and the
  legitimate non-technical reasons that can carry a migration alone.
