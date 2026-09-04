---
layer: technique
type: technique
subject: engine-host-contract
technique: untraceable-jobs-as-roots
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [a promise reaction ran against a value the collector had already freed, deciding whether a job type should participate in heap tracing, a synthetic module or native continuation needs to hold a guest value until the host calls back, an executor is torn down with jobs still queued]
---

# Untraceable jobs as roots

An engine with a tracing collector and a host-run job queue has two owners of liveness
that do not know about each other. The collector walks the heap from roots it knows;
the executor holds jobs in a queue the collector never sees. Every job captures heap
values — the promise it will settle, the reaction it will call, a receiver, an argument
list — and the question of who keeps those alive between enqueue and execution is the
question this technique answers. The obvious design answers it wrong.

## The obvious design and its hole

The obvious design makes a job a heap object like any other: it implements tracing, its
captures are traced through it, and the collector frees it when nothing references it.
It is tidy, it is uniform, and it has a hole exactly where the executor is. The executor's
queue lives outside the heap — it is host memory, a vector or a channel or a task
scheduler's inbox — so a job referenced only by the queue has no path from any root the
collector walks. The collector frees the job's captures, the executor runs the job, and
the job settles a promise that no longer exists. The failure is intermittent because it
needs a collection to fall between enqueue and run, which makes it the kind of bug that
survives a test suite and appears under load.

Patching the hole by registering the queue as a root works until the second executor, or
the host's own scheduler, or a job handed to a native future — each is a new place jobs
can be held that the collector must be taught about, and the one nobody teaches it about
is the one that frees a live capture.

## The rule: a job is not a heap value

Invert it. **Jobs do not implement tracing.** A job holds its captures as strong
references — the same handle type the host uses to hold a guest value from outside the
heap — and those references are roots for as long as the job exists. The collector does
not need to know about queues because nothing a queue holds is a heap object; the job's
captures are rooted by construction, from every place a job can be held, including
places that do not exist yet.

The rule has a second half that makes it enforceable: because a job does not trace, **a
job can never be stored inside the heap**. The type system says so — a job is not a
traceable type, so it cannot be a field of one — and the consequence is that no guest
object, no closure environment and no promise can hold a job. Jobs are held by executors
and by host code, and by nothing else. An engine that lets a job be stored in a heap
object has re-opened the hole in the other direction: now a job's captures are rooted,
but the job itself can be freed under the queue that would run it.

The line is drawn by *holder*, not by purpose, and two engine-internal cases show where
it falls. A promise reaction stores a callback record — the function to call and a
host-defined slot beside it — inside the promise, which is a heap object; that record
traces, because the heap holds it and the collector must see through it. The job that
later carries that record to the executor does not trace, because the executor holds it.
Same function, two containers, two rules. On the other side, a native continuation — a
host future whose completion settles a promise — is a job, captures the promise's
resolving functions as strong handles, and keeps them alive across however many host
polls the future takes. And a host-supplied initializer for a synthetic module is *not* a
job: the module is a heap object and holds the initializer, so the initializer traces,
and what it may capture is the interop sibling's question — copyable closures, or
captures spelled as traced — not this one's. The test for any new type is one question:
can a heap object hold it? If yes it traces; if it is held only by executors and host
code, it does not, and the type system should refuse to let a heap object hold it.

## The cost, and its reaper

Roots are not free. A job that is never run holds its captures for as long as the job
exists, and an executor that accepts jobs and never drains them is a leak with the shape
of a queue. Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), the
answer is decided at design time: a job's captures are released when the job is dropped,
and a job is dropped in exactly two places — after it runs, and when the executor that
holds it is torn down. Executor teardown must therefore drop its queues, and the
engine's own context drop must drop its executor, so that discarding a context releases
every job's captures with it. A host that swaps executors mid-life inherits the same
duty for the outgoing one.

The other cost is a long-lived job. A timer scheduled a day out holds its callback and
its receiver for a day, and nothing the guest does — dropping every other reference,
clearing the timer's own handle without cancelling it — will free them, because the job
is the root. That is the correct behaviour and it should be documented as such: a
scheduled job is a promise to run, and a promise to run needs its arguments.

## Decision rules

- When designing an engine's job type, do not implement tracing for it, because any
  place a job can be held outside the heap becomes a place the collector does not walk.
- When a job captures a guest value, hold it as a strong external handle, because the
  capture must be a root from every holder, present and future.
- When the type system can express it, make a job untraceable so it cannot be a field of
  a heap type, because a job stored in the heap can be freed under its own queue.
- When an executor is torn down, drop every queued job, because the job is the reaper of
  its captures and nothing else will release them.
- When a host holds a job for a long time by design, say in the job's documentation
  that its captures live as long as it does, because the embedder will otherwise read
  the retention as a leak.

## When not to use it

An engine whose heap is reference-counted rather than traced has no root set and no
tracing to opt out of; its jobs hold counted references and the question does not
arise. An engine that runs jobs synchronously at enqueue time — no queue, no executor —
never has a job outstanding across a collection and can let jobs be ordinary values.
The technique applies exactly where there is a traced heap, a queue outside it, and a
window between the two; that window is what an embedded engine with a host-run loop is
made of.
