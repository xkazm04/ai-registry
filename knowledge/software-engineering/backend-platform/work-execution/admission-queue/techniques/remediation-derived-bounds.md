---
layer: technique
type: technique
subject: admission-queue
technique: remediation-derived-bounds
status: forged
laws: [limits-are-derived, derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [a supervisor kills or restarts a component that exceeds a threshold, a queue bound and a watchdog threshold are separate settings, tuning a limit upward without checking what punishes exceeding it, an overload remediation fires before the flow control that should have prevented it]
---

# Remediation-derived bounds

Most systems that bound a queue also run something that **punishes exceeding
it**: a supervisor that restarts a component whose backlog passes a threshold,
an orchestrator that evicts a pod over a memory limit, an out-of-memory killer,
a watchdog that terminates a process whose mailbox will not drain. Two numbers
now govern one situation — the bound at which the gate refuses, and the
threshold at which the remediator destroys — and they are almost always
configured independently, in different files, by different people, at
different times.

They are not independent. They are two points on one axis, and their order is
the entire behaviour of the system under overload:

- **Bound below threshold.** The gate refuses; producers see backpressure; the
  remediator never fires. Overload is a refusal rate.
- **Bound above threshold.** The gate is still admitting when the remediator
  fires. Overload is a *kill*, and everything in flight — including the
  refusals that would have shed the load — dies with the component. The flow
  control is dead code in exactly the condition it was written for.

The second configuration is not exotic. It is what you get by raising the
bound under pressure and not knowing the threshold exists, which is the
ordinary way both numbers get their values.

> **A bound whose breach triggers a destructive remediation elsewhere is
> derived from that remediation's threshold, not configured beside it.**

## Derive, and derive in code

[limits-are-derived](../../../../_laws.md#limits-are-derived) already says a
capacity limit may be derived *from another limit*, and that the derivation
must be computed rather than written in a comment. This technique names the
other limit, and the naming is the contribution: of all the numbers a bound
could be derived from, the threshold that destroys the component is the one
where an inversion is unrecoverable.

The derivation is usually the simplest one available:

```
effective_bound = min(configured_bound, remediation_threshold)
```

with margin where the remediator's measurement lags the gate's — a sampled
watchdog needs headroom for one sampling interval of arrivals, so the margin
is a rate times a period, not a percentage picked for feeling safe.

Three properties make this a derivation rather than documentation:

- **It is evaluated, not asserted.** A comment reading "keep this under the
  watchdog threshold" is the failure in its most convincing disguise: it is
  true when written, unenforced forever after, and read as reassurance by the
  next person raising the number.
- **It is evaluated where the bound is used**, not copied at startup into a
  third variable that can then drift from both parents
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
- **The configured value stays visible.** `min` means an operator who raises
  the bound past the threshold gets the threshold, silently — so the
  *effective* number is what appears in logs and metrics, next to the
  configured one and the reason it was clamped
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
  A clamp nobody can see is a configuration setting that does not do what it
  says.

## The test is that the two cannot disagree

The property is structural and therefore cheaply asserted: **there is no
configuration under which the gate admits past the point the remediator
fires.** Written as a test, it is one assertion over the derivation rather
than a scenario:

- Set the configured bound above the remediation threshold and assert the
  effective bound equals the threshold.
- Set it below and assert the configured value survives.
- Where the remediator's threshold is itself configurable, assert the
  relationship holds after *its* value changes, not only after the bound's —
  the inversion is reachable from both sides, and the side nobody tests is the
  remediator's.

That third case is the one worth naming, because the coupling is usually
written in only one direction. A team that derives the bound from the
threshold and then makes the threshold tunable has restored the two-knob
problem with an extra step.

## Where else the pattern applies

The shape generalizes past queues to any pair of *shape it* and *destroy it*
limits governing one resource, and the discipline is the same in each:

- A connection pool's ceiling against the database's `max_connections`,
  summed over every replica that holds a pool. The sum is the derivation, and
  it is the one people get wrong, because each service's number looks
  reasonable alone.
- A request body cap against the buffer budget the process is allowed.
- A retry budget against the circuit breaker's trip count — retry policy that
  can, by arithmetic, open the breaker it was meant to avoid.
- A batch size against the transport's maximum message size.

In every pair the same question is the test: **from the configured number, can
you reach the number that punishes exceeding it, by a path the program
actually evaluates?** If the answer is no, they are two knobs that will
eventually disagree, and the disagreement will surface as the remediator
firing during normal operation — which reads as instability in the component
being killed, and sends the investigation to the wrong place entirely.

## When the numbers should stay separate — and the debt that remains

Where the remediation is not destructive — a warning, a metric, an autoscaling
signal — **clamping** them is wrong, because the whole point of a soft
threshold is to fire *before* the hard one and say so. Clamp only where
crossing the remediator's line destroys work the gate was responsible for; the
discriminator is whether anything in flight is lost when the remediation runs.

But not clamping is not the same as owing nothing, and the case that proves it
is the one that looks most innocent: **a bound and a controller that reads the
bounded quantity as its input.**

When a queue depth is both capped at `D` and used as the error signal for an
autoscaler targeting `T` per instance, the cap **saturates the signal**. The
controller can never observe a per-instance value above `D`, so the largest
ratio it can compute in one evaluation is `D / T`, and that fraction is its
**per-interval gain** — the most it can multiply the fleet by in one step.

State the consequence precisely, because the tempting overstatement is wrong:
this does **not** put the replica ceiling out of reach. A controller that
re-evaluates converges geometrically — a fleet needing to grow by `G` reaches
it in about `log(G) / log(D/T)` intervals, because each step re-saturates and
asks again. What the clipped signal costs is **time**, not range:

```
intervals to converge  ≈  log(max_replicas / min_replicas) / log(D / T)
```

A gain of 2 with a polling interval of 15 s turns a 6× scale-out into three
evaluations and roughly 45 seconds of continued shedding; an unclipped signal
would have asked for the whole thing at once. Under exactly the burst the
ceiling exists for, the fleet arrives late — and it arrives late *quietly*,
because every individual scaling decision was correct and the queue was doing
its job.

So the rule generalizes past clamping: **wherever a limiter bounds a quantity
a controller reads, the limiter has set the controller's gain, and the pair is
owed a written derivation even though it must not be enforced by clamping.**
The failure is a convergence-time budget nobody stated, and the number to
derive is the interval count above — not a reachability claim, which is the
error this section was first written with.

The cheapest discharge is not an assertion that refuses a configuration; the
configuration is legal. It is to **write the derived convergence time beside
the ceiling**, so that raising the replica maximum or tightening the queue cap
shows its cost in intervals at the moment somebody does it. A ceiling whose
time-to-reach is undocumented gets raised for free and pays at the next burst.
