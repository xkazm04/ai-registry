---
layer: technique
type: technique
subject: serving-process-topology
technique: hot-loop-isolation
status: forged
laws: [creation-names-reaper, verdict-survives-boundary]
shared_with: []
use_when: [drawing the first process boundary in a latency-critical service, deciding whether a piece of work may run between iterations, an added feature raised inter-token or inter-frame latency, designing the message shape between a scheduler and its front end]
---

# Hot-loop isolation

The technique has one input and one output. The input is a sentence: *this loop's
period is the product's latency unit.* The output is a process that contains
nothing but the code required to produce one period, and a boundary across which
everything else runs concurrently with the loop's own waiting.

Everything below is procedure for getting from one to the other, and for keeping
the result once it exists — which is the harder half, because a thin loop
thickens one reasonable-looking commit at a time.

## Step 1: name the loop and its period, in writing

Write the sentence before drawing any boundary. It has three slots and all three
must be filled with something measurable:

- **the loop** — the code path that advances *every* in-flight unit of work by one
  increment;
- **its period** — a number, measured, at a stated load;
- **the product figure it multiplies into** — the latency the user or the contract
  actually names.

A team that cannot fill the third slot does not have a hot loop; it has a busy
one, and this technique is over-engineering for it. A team that fills the third
slot with a *throughput* figure has usually misidentified the loop: throughput is
improved by making iterations bigger, latency by making them shorter, and a loop
optimized for the wrong one of those will be defended by the wrong measurements.

The sentence is the acceptance test for every later argument. "Should the token
counter live in the scheduler?" is unanswerable in the abstract and trivial once
the sentence exists: does counting have to happen between the decision and the
dispatch? No. Out it goes.

## Step 2: classify by tempo, not by subject

Take every responsibility the current design assigns to the loop's process and
sort it with one question: **does this have to happen between deciding what runs
this iteration and dispatching it?**

Three answers, and only the first keeps work inside:

- **Yes, ordering-required.** Selection policy, admission of newly-arrived work
  into the running set, resource accounting the selection reads, dispatch,
  collection. This is the irreducible core and it is small.
- **No, but it reads loop state.** Metrics derivation, progress reporting,
  bookkeeping about what happened. It leaves. The loop *emits* the raw events it
  was already producing as part of its own operation; the derivation happens on
  the other side. The distinction that matters: an event the loop was going to
  compute anyway is free to ship, and a measurement taken specially for the
  instrument is not.
- **No, and it only touches payloads.** Protocol handling, validation, encoding
  and decoding between caller-shaped and internal representations, formatting,
  authorization. It leaves, and it is usually the largest single win, because its
  cost scales with payload size while the loop's own work does not.

The common error is to sort by subject: to keep a payload transform inside
because it is "part of the model", or to move a piece of the selection policy out
because it is "just accounting". Subject adjacency is not tempo.

## Step 3: choose the boundary the runtime actually respects

The relocation is only real if the two halves are scheduled independently.

- If the runtime serializes execution — a global interpreter lock, a
  single-threaded event loop, a collector that stops the world — then a task or a
  thread is not a boundary. The outer work still competes with the loop for the
  one execution resource, and the improvement will not appear in the iteration
  period. Use a process.
- If the runtime genuinely parallelizes and the two halves need to share a large
  mutable structure, a thread is the cheaper correct boundary, and a process
  boundary would buy isolation at the price of copying that structure on every
  crossing.

State which of those two situations holds, in the design note, with the reason.
It is the only part of this technique that is environment-specific, and a reader
in a different runtime needs to know whether your conclusion transfers or only
your method does.

## Step 4: give the boundary the three properties that make it free

A boundary drawn correctly and used carelessly returns all the latency it saved.

**Non-blocking on the loop side.** The loop drains whatever has arrived and
continues. It never waits on the outer half — not for an acknowledgement, not for
a response, not for a lock the outer half holds. Anything that would require
waiting is either loop work that should not have left, or a design error.

**One crossing per iteration.** The boundary's cost is per-message, not per-byte:
a wake-up, a serialization frame, a scheduler round trip. Send the iteration's
new work in one message and the iteration's results in one message, however many
requests they concern. A per-request crossing turns a fixed cost into a
load-proportional one, which is precisely the scaling the design was built to
avoid.

**Bounded, with depth as a signal.** Both directions of the boundary are bounded
queues. An unbounded one hides the outer half falling behind until memory runs
out; a bounded one converts the same condition into a number that admission
control can read. Queue depth here is the earliest honest indicator that the
split is no longer balanced — earlier than latency, which only moves once the
loop starts blocking.

One consequence of the non-blocking rule is easy to get wrong at the *idle* end.
A loop that never blocks spins when there is nothing to do, burning a core per
replica for no work. The correct shape is asymmetric: drain without blocking
whenever there is work in flight, and block on the input queue only when the
running set is empty — so the loop is non-blocking exactly when blocking would
cost latency, and blocking exactly when spinning would cost nothing but power.
The transition between the two states is a piece of the loop worth writing
explicitly, because a wake-up that arrives while the loop holds the queue's own
lock is the classic way this deadlocks.

## Step 4b: let the two halves scale independently

Once the boundary is a message queue rather than a call, the number of processes
on each side stops being coupled — and that freedom is worth taking deliberately
rather than discovering.

Connect the outer pool to the inner processes **many-to-many**: any outer process
can address any loop, and any loop can return results to the outer process that
submitted them. The outer half is then sized by its own bottleneck (payload
transformation, connection count) and the inner half by the hardware it drives,
and neither resize touches the other. A one-to-one pairing looks tidier on a
diagram and forces the two independent bottlenecks to share one knob.

Give the outer pool's size a *derived default* — a value computed from the inner
count, overridable by the operator — rather than a constant. A constant default
is wrong at every scale but one; a derived one tracks the deployment, and its
derivation is a line an operator can read.

## Step 5: keep the verdicts typed across the crossing

The loop makes classified decisions that callers must act on differently:
admitted, preempted, aborted, refused for capacity, finished normally. Every one
of those has to arrive at the outermost consumer as something it can branch on
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

Serialization is where this is lost, and it is lost the same way every time: the
outer half catches whatever came across, wraps it in the generic error its own
callers expect, and the classification survives only in a message string. The
caller then retries a refusal it should have surrendered, or surrenders a
preemption it should have waited out.

Put the classification in the message schema as a value, not in a rendered
string, and make the outer half's translation table exhaustive — an unrecognized
class is a loud failure, not a fallback to "internal error".

The death of the loop itself is the case that most often escapes this rule, and
it is the one that matters most. When the loop process dies, the outer half is
sitting on a queue that has simply stopped producing, which is indistinguishable
from a slow iteration for as long as anyone is willing to wait. Give death its
own sentinel value on the same channel as ordinary results, emitted on the way
out, so the outer half learns of it through the mechanism it is already reading
rather than through a timeout. Every consumer waiting on an in-flight request
then fails immediately with the real reason instead of hanging.

## Step 6: name the reaper for every process, at the point of creation

The loop's process spawns workers; the front end spawns the loop. Each of those
creations states what destroys it and under what conditions
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

The concrete hazard in this topology is worse than a leaked handle. Workers hold
scarce, exclusive, machine-level resources — a device context, a large pinned
allocation, a lease on a shared accelerator — that outlive an ordinary process
exit long enough to break the *next* start. An orphan does not merely waste
memory; it makes the restart fail with an error message about resource
availability that points at nothing.

So the topology's shutdown path is written at the same time as its startup path,
and it covers the ugly case: the parent died without running any of it. Practical
requirements, in the order they matter:

1. A child dies when its parent dies, enforced by something that survives the
   parent being killed uncleanly rather than by a handler the parent may never
   reach. Where the platform offers a parent-death signal, use it. Where it does
   not, the portable construction is a pipe held open across the boundary: the
   parent keeps the write end and never writes, the child watches the read end,
   and the read returns end-of-file the moment the parent's descriptors are
   reclaimed — by exit, by a fatal signal, by anything. The same handle doubles
   as the graceful stop, since closing the write end deliberately is
   indistinguishable to the child from the parent dying, and both mean the same
   thing.
2. Shutdown is idempotent and reachable from a signal, a normal exit, and an
   exception in the middle of startup — the third is the one that gets skipped.
3. The wait for children is bounded and escalates. A graceful stop that never
   escalates to a forced one is an outage that looks like a hang.

## When to fate-share, and when to supervise

Do not reach for supervision because it sounds more robust. The rule is about
what the child holds:

- Workers holding **shards of one live state** — a partitioned cache, a split
  model, participants in a collective operation — must be fate-shared. A
  surviving subset holds a fraction of a thing that has no meaning in fractions,
  and every remaining participant will block forever on a step the dead one never
  enters. Kill the group, restart from empty, and report it as one failure.
- Workers whose state is **derivable from the parent's** may be supervised and
  restarted. This is the minority case in this topology; claim it only after
  writing down where the state comes from.

## When not to isolate

- **No sentence.** If nobody can name the loop's period and the product figure it
  multiplies into, there is no hot loop to isolate and the split adds a
  serialization hop for nothing.
- **The loop is not device-bound.** The relocation is free because the loop is
  already waiting on something else. A loop that is genuinely processor-bound end
  to end has no dead time to hide the outer work in, and the boundary's cost is
  then a real regression rather than an accounting move.
- **The crossing is bigger than the work.** If the state the outer half needs is
  large and mutable, serializing it per iteration can cost more than the work
  saved. Measure the message, not the intention.
- **Single-tenant, low concurrency.** The whole argument is that hot-loop cost is
  multiplied by every in-flight request. With one request in flight there is
  nothing to multiply and a simpler process is worth more.
