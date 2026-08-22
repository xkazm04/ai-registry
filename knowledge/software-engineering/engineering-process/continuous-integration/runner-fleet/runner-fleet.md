---
layer: golden-path
type: golden-path
subject: runner-fleet
status: forged
use_when: [builds pass on one machine and fail on another, deciding between hosted and self-run execution capacity, a deploy ran twice concurrently, a cache made a build wrong]
techniques:
  - capability-typed-queues
  - fleet-isolation-boundaries
  - ephemeral-versus-warm-runners
  - shared-cache-integrity
  - queue-depth-elasticity
  - shared-resource-serialization
---

# Runner fleet

The machines that execute delivery work are infrastructure, and for a long time nobody treats
them as such. They begin as an implementation detail — a default the delivery system provides,
named once in a configuration file and never thought about again — and they stay invisible
until the day a build passes on one and fails on another. From that day forward they are a
first-class system with a capacity model, an isolation model, a state model and a cost model,
and the team is designing all four retroactively.

This subject is those four models. It sits beside
[ci-execution-trust](../ci-execution-trust/ci-execution-trust.md), which asks what a runner may
be *told* to do; here the question is what a runner *is*.

The distinction that organizes it:

> A runner is not a machine that runs your build. It is a **shared, stateful, credentialed
> position in your network** that runs arbitrary code on request, repeatedly, for many
> different callers.

Every clause is load-bearing. *Shared* means one caller's leftovers are another caller's
starting conditions. *Stateful* means "it worked yesterday" is evidence about the machine and
not about the code. *Credentialed* and *in your network* mean it is a valuable target that
executes untrusted-ish code by design. *Repeatedly, for many callers* means every property
above compounds.

## Runners are typed, and jobs target the type

A job needs things from its execution environment: an operating system, an architecture, a
toolchain, sometimes a hardware capability, sometimes a network position. The naive arrangement
names a specific pool and hard-codes the requirement; the correct one has runners **declare
what they are** and jobs **request what they need**, matched by the delivery system.

The failure the typed form prevents is not scheduling inefficiency, it is the silent wrong
answer: a job that requires a capability, lands somewhere lacking it, and produces a result
that is wrong rather than absent — a test suite that skips the tests it cannot run and reports
green, per [failure-not-empty-success](../../../_laws.md#failure-not-empty-success). And the
type vocabulary is a vocabulary: one authority, one place a capability name is defined, per
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary). A toolchain
version declared in eight places is eight places to update and seven places to forget. The
declaration contract, the unsatisfiable-request rule, and the version-authority problem are
[capability-typed-queues](./techniques/capability-typed-queues.md).

## Isolation is a boundary you draw, not one you have

A fleet serving more than one repository is a shared execution environment, and the sharing is
transitive in ways nobody intends: through the filesystem, through a cache, through a daemon
socket, through a package registry credential on the machine, through network reachability.
Two repositories that have no relationship in anyone's mental model can have a direct
relationship through a runner.

The standard is to make the boundary explicit and enforced rather than assumed: which
repositories may reach which pools, which pools may reach which environments, and what may
cross between them. That is one door per boundary, per
[one-validation-door](../../../_laws.md#one-validation-door) — not a convention, because a
convention is not enforced by anything and the exception is added by someone who did not know
it was a convention. The boundary shapes, the practical grouping choices, and the honest
statement of what shared runners cost are
[fleet-isolation-boundaries](./techniques/fleet-isolation-boundaries.md).

## Clean or fast — pick per lane, and know which you picked

A runner starting from a known-clean state gives reproducible, uncontaminated results and pays
for the environment every time. A runner reusing its previous state starts fast and carries
everything the last job left. This is a genuine trade with no universally correct answer, and
the failure is not choosing wrong — it is not choosing, then debugging a machine-dependent
failure for two days without the vocabulary to describe it.

The default is clean, because contamination failures are expensive to diagnose and cheap to
prevent, and because a warm runner is also a persistence mechanism for anything an attacker
leaves. Where warm is chosen for speed, what may persist is enumerated and everything else is
reaped, per [creation-names-reaper](../../../_laws.md#creation-names-reaper). The two models,
the middle grounds, and the tell that identifies a contamination failure are
[ephemeral-versus-warm-runners](./techniques/ephemeral-versus-warm-runners.md).

## A cache is a correctness surface

Caching is presented as an optimization, which is how it gets adopted without a correctness
review. It is not an optimization: it is a stored derived value, and every stored derived value
needs its key to name exactly what it derives from, per
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation). A key that
under-specifies produces a build that used the wrong inputs and reported success — a wrong
answer, arrived at faster.

Three rules carry most of the value: the key covers everything the content depends on
(including the toolchain version, which is the one everybody forgets), restoring a cache never
makes a build pass that would otherwise fail, and a cache is a suggestion the build must be
able to proceed without. Add the shared-fleet concern — a cache is a write channel between
repositories, and the untrusted lane must not hold one — and the surface is complete. See
[shared-cache-integrity](./techniques/shared-cache-integrity.md).

## Capacity is elastic, and the signal is queue depth

Fleet size is a control loop, and the input is how much work is waiting, not how busy the
machines are. Utilization is the wrong signal: a fully-utilized fleet with an empty queue is
correctly sized, and a fully-utilized fleet with an hour of backlog is not, and utilization
cannot tell them apart.

Scaling has three costs that make the loop non-trivial — the time to acquire a runner, the
per-runner cost of a cold environment, and the money — so the loop scales up faster than it
scales down and every scaled-up runner names what removes it. Any published number carries its
window and its denominator, per
[count-carries-predicate](../../../_laws.md#count-carries-predicate). The signal, the asymmetric
loop, the floor and ceiling, and the drain-before-terminate rule are
[queue-depth-elasticity](./techniques/queue-depth-elasticity.md).

## Some work must not run twice at once, and the fleet is where that is enforced

Deployments to one environment, migrations against one database, publishing one version,
anything touching a resource that does not tolerate concurrency. Parallelism is the fleet's
entire purpose, which makes the fleet the right place to hold the exception — a mutual
exclusion expressed as a property of the work, identified by a name, enforced by the delivery
system.

Doing it anywhere else fails in a specific way: a lock taken inside a job is not held by the
job's *queue position*, so two runs proceed to the lock, one waits holding a runner, and the
timeout produces a partial deployment rather than a refused one. The name is the identity and
it must be stable, per
[identity-survives-reuse](../../../_laws.md#identity-survives-reuse). Ordering, the
supersession rule that matters most at machine pace, and what belongs in a serialized lane are
[shared-resource-serialization](./techniques/shared-resource-serialization.md).

## What this subject does not own

Application-level concurrency control is
[concurrency-guards](../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md);
distributed work coordination generally is
[job-coordination](../../../backend-platform/work-execution/job-coordination/job-coordination.md).
Whether a runner may be told to run something is
[ci-execution-trust](../ci-execution-trust/ci-execution-trust.md). How long the queue is allowed
to get before it is a delivery problem rather than a fleet problem is
[machine-paced-delivery](../machine-paced-delivery/machine-paced-delivery.md).

## The techniques

- [capability-typed-queues](./techniques/capability-typed-queues.md) — runners declare, jobs
  request, unsatisfiable requests fail loudly, one authority per capability name.
- [fleet-isolation-boundaries](./techniques/fleet-isolation-boundaries.md) — explicit
  repository-to-pool and pool-to-environment boundaries, and the transitive channels between
  them.
- [ephemeral-versus-warm-runners](./techniques/ephemeral-versus-warm-runners.md) — clean by
  default, enumerated persistence where warm is chosen, and the contamination tell.
- [shared-cache-integrity](./techniques/shared-cache-integrity.md) — the key names every
  input, a restore never changes a verdict, and the cache as a cross-repository write channel.
- [queue-depth-elasticity](./techniques/queue-depth-elasticity.md) — depth not utilization,
  asymmetric scaling, floor and ceiling, drain before terminate.
- [shared-resource-serialization](./techniques/shared-resource-serialization.md) — named mutual
  exclusion held at the queue, ordering, supersession, and what belongs in a serial lane.
