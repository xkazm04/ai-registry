---
layer: technique
type: technique
subject: native-guest-interop
technique: async-native-as-promise
status: forged
laws: [verdict-survives-boundary, creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [a host function that returns a future must be callable from guest code as a promise-returning function, deciding where the future's output is converted to a guest value and where a host error becomes a guest rejection, a promise created for a pending host operation must survive collection until the operation settles]
---

# Async native as promise

## The concern

A host operation that returns a future — a network call, a file read, a
database query — is exposed to guest code, and the guest expects a promise:
something it can await, chain, and race. The naive bridge blocks the calling
frame until the future completes and returns the value; it stalls the whole
guest thread, deadlocks against any host executor that needed the same thread,
and is not a promise at all. The second naive bridge creates a promise and
spawns the future on a host executor with the resolvers captured — and now a
host task on a foreign thread holds guest handles the runtime's threading
model may not allow it to touch, and settles them from a thread that has no
guest context to convert the result with.

## The procedure

The crossing has three parts and one ordering.

First, the promise and its two resolving functions are created **synchronously**,
in the calling frame, with the context in hand, and the promise is returned to
the guest before any host work runs. The guest sees a pending promise
immediately, which is what its concurrency model requires.

Second, the host future is wrapped in a **native asynchronous job** — a unit of
work the runtime's job queue knows how to hold and the host's executor knows
how to drive — and that job, not the calling frame and not a foreign thread,
owns the future. The job carries the resolving functions. When the executor
polls the job to completion, the job settles the promise: resolution on
success, rejection on failure. The job is the one place with both the future's
output and a live context.

Third, the future's output is **converted inside the job**, at the moment of
settlement, using the context the executor handed to the job. The host result
becomes a guest value there; the host error becomes a guest error there, with
a typed reason the script can inspect — a name, a message, a category the
script author can branch on. A host error that escapes the job as a panic or
as a raw host failure is a crash where the guest expected a rejection.

The resolving functions are guest objects and the promise is a guest object.
While the future is pending, nothing in the guest program necessarily
references the resolvers — the script holds the promise, not its settlers —
and a collector that does not know about the job would free them. The job
holds them, and the job is held by the queue until it settles. That is the
mechanism that keeps the promise from being freed while nothing yet
references its outcome, and it is not incidental: the job's lifetime *is* the
resolvers' lifetime. It works because the job is deliberately *not* a traced
cell — it is a root the queue owns — so everything the future captured is
alive for exactly as long as the job is, and the future itself needs no
capture bound.

The bridge comes in two entry points that differ in where the closure lives.
A promise-level entry takes a one-shot future and enqueues it directly; the
future is only ever inside the rooted job, so it may capture anything. A
function-level entry produces a guest-callable function whose every call
creates a promise; that closure is stored in a heap function object, and it
therefore carries the copyable-closure bound the function constructor
demands, with the call's receiver and arguments cloned into each job rather
than captured by the closure. Choosing the promise-level entry when a single
future is in hand avoids paying a bound the storage does not require.

## Decision rules

When a host error crosses into a rejection, convert it into a guest error
value with a stable name and a bounded message inside the job, never as a
generic failure string, because the script that catches it is the outermost
consumer and must be able to branch on which kind of host failure occurred
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

When the job is created, state what settles it and what drops it: the job
settles the promise on completion, and the executor drops the job once it has
settled; a job that can be dropped without settling has created a promise
that stays pending forever, which is a leak the guest cannot observe and the
host cannot reclaim ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).

When the executor is cancelled or shut down with jobs pending, reject every
pending promise with a cancellation reason before the context is torn down,
because a promise that is simply dropped has an outcome nobody recorded.

When the host future must run on a foreign thread — a blocking call, a
thread-bound library — run the *host* part there and send its output back to
the job through a channel the job awaits; the guest handles never leave the
job's thread, and the conversion still happens inside the job with the
context.

When the guest program has no executor configured — the runtime's default is
one that accepts every job and runs none — the promise will never settle; the
runtime must say so at the point the job is enqueued, not accept the job into
a method whose body is empty, because an executor that is documented as doing
nothing is still an absent guard at every call site that did not read the
documentation ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## When not to use it

A host operation that completes immediately and cannot fail — a lookup in an
in-memory table — should return a resolved promise directly, or a plain value
if the interface allows, rather than paying for a job.

A host callback that guest code *registers* for later invocation — an event
subscription — is the opposite direction of control flow: the host calls the
guest, and the machinery is the job queue's, not this bridge's. The technique
is for a guest calling a host and waiting.
