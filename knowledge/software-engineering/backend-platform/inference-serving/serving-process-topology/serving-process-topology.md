---
layer: golden-path
type: golden-path
subject: serving-process-topology
status: forged
use_when: [decomposing a latency-critical service into processes, deciding what may run between iterations of a hot loop, sizing a deployment whose process count has several independent inputs, choosing a process-creation strategy the operator cannot be asked about, configuration is being threaded through a deep class hierarchy, putting a load balancer in front of a service that reuses state between related requests]
techniques:
  - hot-loop-isolation
  - process-count-as-a-formula
  - probe-the-runtime-not-the-config
  - one-config-object-as-engine-state
  - cache-residency-sets-the-balancing-unit
---

# Serving process topology

Most services are decomposed by **subject**: the request handler here, the
business logic there, storage behind it. That decomposition is a convenience for
readers, and it is the wrong one for a service whose product promise is a
latency number. Such a service has a loop in it — one loop — whose period *is*
the promise. Everything the system does is either inside that loop, where it is
paid once per iteration per in-flight request, or outside it, where it is paid
somewhere the user does not experience.

So the axis of decomposition is **tempo, not subject**. Find the loop whose
period is the budget; make it as thin as it can be made; push everything else
across a boundary that lets it run *while* the loop is waiting. Every other
question in this subject — how many processes, how they are created, how they
are configured, what dies with what — is downstream of that one cut, and gets
answered wrongly if the cut was made on module lines instead.

## Find the loop before you draw any boundary

The load-bearing artifact is a single sentence a team must be able to write
before it designs anything: *the inner loop is X, its period is Y, and the
product's latency figure is a multiple of Y.* Until that sentence exists there
is no way to argue about where a piece of work belongs, because "hot path" is
otherwise a matter of taste.

The inner loop is rarely the request loop. In a service that advances many
concurrent requests in lockstep steps, a request has no loop of its own — it has
a *residency* in a loop that belongs to the machine. The inner loop is the one
that advances every in-flight request by one increment: decide what runs this
iteration, run it, collect what came back. Its period is what a user experiences
as the gap between one piece of progress and the next, and it is the only place
in the system where a hundred microseconds is a product regression.

Once that sentence exists, classifying any piece of work is mechanical: does it
have to happen *between* the decision and the dispatch of one iteration? If no,
it does not belong in the loop, however conceptually adjacent it is to what the
loop does.

## Two altitudes, and the second one is nearly free

| | **Inner loop** | **Outer loop** |
| --- | --- | --- |
| Period | the latency budget | one iteration or slower, and it may lag |
| Runs | decide, dispatch, collect | everything else |
| Cost model | paid per iteration per request | overlapped with the inner loop's device wait |
| Correct size | as small as it can be made | as large as it needs to be |
| Failure meaning | the product is slow | a queue grows, and the growth is observable |

The asymmetry is the whole prize. The inner loop spends most of its wall time
*waiting* for something else to finish — an accelerator kernel, a remote batch, a
device queue drain — and that wait is dead time in the process that owns the
loop. Work relocated to the outer loop runs inside that dead time and is
therefore close to free. Work that stays in the inner loop is not merely slow: it
serializes against every request in flight simultaneously, because they all share
the iteration.

This is why "make it concurrent" is not the same answer. Restructuring hot-loop
work as concurrent tasks *inside the same runtime* leaves it competing for the
same execution resource on the same schedule; if the runtime serializes
execution at all — an interpreter lock, a single-threaded event loop, a
stop-the-world collector — the relocation was cosmetic. The boundary has to be
one the operating system schedules independently. That is the argument for a
process, and it is an argument about the *runtime's* concurrency model, not about
isolation or crash safety, which are consequences and not the reason.

## What leaves, and why each one leaves

The list is longer than teams expect, and each item has the same shape: it is
per-request work whose cost scales with payload size rather than with the
decision the loop makes.

- **Protocol and transport.** Parsing, validation, content negotiation,
  streaming-response bookkeeping. Their cost is a function of request size, which
  is unrelated to the loop's job.
- **Encoding and decoding at the edges of the domain.** Turning caller-shaped
  input into the internal representation and back out again. Frequently the
  single largest per-request processor cost in the system, and it has no ordering
  relationship with the iteration.
- **Metric derivation.** Rates, histograms, percentile buckets, label
  cardinality. The loop emits the raw events it was already producing; nothing is
  derived at the top of an iteration.
- **Logging and formatting.** A formatted string is per-request work in service
  of a human.
- **Authorization, quota, tenancy.** Decisions that must happen before admission
  and never again.

What stays is the irreducible core: the queue of admitted work, the policy that
selects from it, the dispatch, and the collection of results. If a candidate for
staying cannot be described in that vocabulary, it is outer-loop work wearing an
inner-loop justification.

## The boundary is a queue, and the queue has three rules

Once the cut exists, the two halves have to talk. How they talk decides whether
the relocation bought anything at all.

1. **The inner loop never blocks on the outer one.** It drains what has arrived
   and proceeds; nothing happening outside may extend an iteration. A blocking
   hand-off re-imports the outer loop's latency into the budget, and is the most
   common way this design is built and then silently undone.
2. **One crossing per iteration, not one per request.** The boundary has a fixed
   cost — a serialization, a copy, a wake-up — and paying it per request makes
   the boundary itself scale with load. Batch the iteration's inputs and the
   iteration's outputs into one message each.
3. **The queue is bounded, and its fullness is a signal, not an error.** An
   unbounded queue between two loops of different speeds is a memory leak with
   good manners. Bounded, its depth is the cleanest available measure of whether
   the outer half is keeping up, and back-pressure at admission is the correct
   response to it.

There is a fourth rule that is really a law: a classified outcome from inside the
loop must reach the caller *as a classification*. Crossing a process boundary is
where typed failures go to die — a refusal becomes a generic error, a preemption
becomes a timeout — and the caller then cannot branch on the thing the loop
actually decided.

## What dies with what

A topology is not specified until fate is. There are two shapes, and choosing
between them is not a matter of taste:

- **Fate-shared.** The loop process and its workers live and die together;
  losing any one is fatal for the whole group, and recovery is a restart from a
  known-empty state. This is correct whenever the workers hold *shards of one
  live state* — a partitioned cache, a split model, a collective step every
  participant must enter — because a surviving subset holds a fraction of
  something that has no meaning in fractions. Partial survival there is not
  resilience; it is a corrupt system that has not noticed yet.
- **Supervised.** Children are restartable and the parent reconstructs their
  state. Correct only when a child's state is derivable from what the parent
  still holds.

Whichever is chosen, every process that gets created names what destroys it, on
the same page where it is created. The failure this prevents is specific and
common: the front half exits cleanly, the workers keep holding the device, and
the next start fails on a resource nobody can see being held.

## Sizing is arithmetic, not advice

Before any of this arithmetic means anything, one property has to be checked
rather than assumed: **that any replica can serve any request.** It is a
property of what the replicas cache, not of the service, and where it does not
hold the width is a correctness decision wearing a capacity decision's clothes
— see
[cache-residency-sets-the-balancing-unit](./techniques/cache-residency-sets-the-balancing-unit.md).

A deployment's process count is almost never one number. It is a product and a
sum over several knobs that were designed independently — a front-end pool, a
replication width, a per-replica worker count, sometimes a coordinator that
exists only under certain shapes. An operator with a fixed host has to answer one
question: *how many of these will there be, and how much memory and how many
cores does that need?*

Publishing "tune to taste", or a table of three recommended shapes, does not
answer it. The obligation is to publish **the formula** — each term named, its
input identified, and at least two fully worked deployments where a reader can
check the arithmetic against a real number. A count a reader cannot derive is
raised later by feel, and its consequences are not recomputed when it is.
[process-count-as-a-formula](./techniques/process-count-as-a-formula.md) carries
the discipline.

## Some choices cannot be delegated to the operator

A serving runtime makes decisions whose inputs are invisible to the person
deploying it — chief among them **how a child process is created**. The available
strategies differ in cost and in what they are compatible with: the cheap one
inherits the parent's address space and is therefore poisoned by anything already
initialized in it (a device context, a thread pool, a library holding a lock);
the safe one re-executes the program from the top, which is correct for a runtime
and catastrophic for an embedding program that did not guard its own entry point,
because re-execution re-runs that program's startup.

The naive answer is a configuration knob. It is wrong for the reason every
optional guard is wrong: the default is what the fleet gets, and the operator who
needs the non-default is precisely the one who does not know they need it. The
correct answer is that the runtime **probes its own environment** and decides,
and where a case is known-bad and undetectable it says so loudly at the moment it
is about to fail, rather than letting the underlying error surface with no fix
attached.
[probe-the-runtime-not-the-config](./techniques/probe-the-runtime-not-the-config.md)
states the procedure.

## Configuration reaches the bottom without becoming a parameter list

A topology like this produces a deep hierarchy: front end, engine, executor,
worker, model runner, and whatever sits under that. In a field where options
arrive weekly, the naive shape — each layer takes the parameters it needs and
passes the rest along — makes every new option an edit to every constructor
between the top and the one class that reads it. The churn is not the real cost.
The real cost is that the option's *meaning* is now spread across a dozen
signatures, so nobody can state what the system is configured to do without
reading all of them.

The alternative is to treat the whole configuration as one engine-level value:
constructed and validated once, at the outermost edge, then carried intact down
the hierarchy. Adding a feature then touches the configuration type and the one
class that reads the new field. This has a real cost, which must be stated rather
than discovered: no component can be constructed in a test without a whole
configuration object, so the design owes a factory that produces a valid,
everything-defaulted one.
[one-config-object-as-engine-state](./techniques/one-config-object-as-engine-state.md)
carries both halves.

## Failure modes this subject exists to prevent

- **The cosmetic relocation.** Work moved off the loop into a task in the same
  runtime, where it still competes for the same serialized execution. Measured by
  iteration period, nothing changed.
- **Decomposition by subject.** Boundaries drawn on module lines, so the hot loop
  keeps a per-request transform because it is "part of the model", and the split
  buys nothing.
- **The blocking hand-off.** A correctly drawn boundary crossed synchronously, so
  the outer loop's latency is back inside the budget while the topology diagram
  still looks right.
- **The per-request crossing.** The boundary paid once per request rather than
  once per iteration, so throughput degrades in exactly the regime the design
  existed for.
- **The unowned child.** Processes created with no stated reaper, surviving the
  parent, holding devices, and failing the next start with an error that names
  none of this.
- **"Tune to taste."** A process count with several inputs and no published
  arithmetic, so every operator derives it once, privately, and wrongly.
- **The strategy knob.** A start method exposed as configuration, defaulting to
  whichever option is wrong for half the callers, with the failure surfacing as
  an unbounded recursion or a device-context error inside somebody else's stack.
- **Parameter threading.** A new option added to nine constructors so the tenth
  can read it, after which nobody can state the effective configuration.
- **The width that is really a router change.** Replicas added in front of a
  service whose members accumulate per-caller state, so a span's later requests
  reach a replica that never saw its earlier ones. Nothing errors; the answers
  are wrong only in the tail, only at width, and the balancer is the last place
  anyone looks.
- **The verdict lost at the boundary.** A typed decision inside the loop —
  refused, preempted, aborted — flattened into a generic failure on the way out,
  so the caller retries what it should have surrendered.

## The techniques

- [hot-loop-isolation](./techniques/hot-loop-isolation.md) — naming the loop
  whose period is the budget, deciding what may run inside it, and building the
  boundary that makes the outer half nearly free.
- [process-count-as-a-formula](./techniques/process-count-as-a-formula.md) —
  publishing a deployment's process count as derivable arithmetic with worked
  examples, so capacity planning is a check rather than an experiment.
- [probe-the-runtime-not-the-config](./techniques/probe-the-runtime-not-the-config.md)
  — choosing a process-creation strategy from observed environment facts, and
  what to do about the case that is known-bad and undetectable.
- [one-config-object-as-engine-state](./techniques/one-config-object-as-engine-state.md)
  — one validated configuration value carried intact through a deep hierarchy,
  what that buys, what it costs, and the factory that pays the cost back.
- [cache-residency-sets-the-balancing-unit](./techniques/cache-residency-sets-the-balancing-unit.md)
  — when replicas stop being interchangeable, why the failure is a wrong answer
  rather than an error, and the topology that follows.
