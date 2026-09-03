---
layer: technique
type: technique
subject: engine-host-contract
technique: null-and-blocking-executors
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [choosing which job executors an engine ships and which one a fresh context gets, promises never settle in an embedding and nothing reports why, an embedder wants to evaluate a script synchronously and has no event loop, a job failed mid-drain and the executor kept going]
---

# Null and blocking executors

An engine that refuses to own an event loop still has to answer what runs its jobs when
the host has not said. The answer cannot be an internal loop — that is the thing being
refused — and it cannot be nothing, because a context with no executor cannot enqueue a
promise reaction. So the engine ships executors, and the discipline is in which ones and
in what each one admits about itself.

## The pair

Two executors cover the honest cases. The **null executor** accepts every job and drops
it. It exists for hosts that evaluate scripts with no asynchrony at all and want the
enqueue path to succeed without allocating a queue, and for tests that assert on the
synchronous half of an evaluation. Its documentation says, in those words, that it
*disables promises*: a promise created under it will never settle, its reactions will
never run, an awaited value will never resume. That phrasing is deliberate. "Discards
jobs" describes the mechanism; "disables promises" describes what the embedder will
observe, and the embedder who reads the second will not spend an afternoon wondering
why a callback never fired.

The **blocking executor** is a drain over every job kind. Run every enqueued job in
order; dispatch every timer that has come due on the engine's clock before deciding
whether anything is left; when a job is a native future, block the thread until it
resolves and then run its continuation; poll the cleanup jobs only when everything else
is empty; when nothing remains, return. It is fully correct with respect to
the specification's ordering, it needs no host cooperation, and it is the executor every
embedding starts with — a command-line runner, a test harness, a script evaluated once
at startup. What it cannot do is share a thread: a host with a socket to serve or a
frame to render cannot hand its thread to a drain that blocks on the first native wait.

The engine ships nothing else. In particular it does not ship a "real" loop that tries
to interleave with an unknown host, because the shape of that loop depends entirely on
the host's own runtime and any engine-shipped version would be the internal loop by
another name. The host brings the loop; [idle-aware-job-loop](./idle-aware-job-loop.md)
says what shape it should have.

## The default is the one that runs jobs

A context builder that does not receive an executor installs one, and the one it
installs is the blocking drain, never the null. Per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud), a default that
silently disables promises is a guard configured off for every embedder who did not
know to configure it, and a deployed population converges on the default. The null
executor is opt-in, requested by name, and its request is the loud, deliberate choice
the law asks for. The corollary is a documentation rule: the executor module's own text
must name the actual default, because a comment that says "the null executor is the
default" beside a builder that installs the blocking one is the confident wrong answer
an embedder acts on.

## Bail on the first error

A drain that meets a job whose execution throws has two options: swallow the failure and
continue, or stop and return it. The blocking executor stops. The reason is that a job
queue's ordering is a correctness property — the specification guarantees reactions run
in enqueue order — and a drain that continues past a failure has run a later job in a
world where an earlier one did not complete, which is a state the guest program cannot
have anticipated. The failure is handed back to the caller, who decides — and the drain
*clears* its remaining queues before it returns, because a job left behind would be run
by the next drain in a world where an earlier job failed, which is the same out-of-order
execution deferred rather than avoided. The same clear-then-return applies to a stop
request delivered through a token, so that a stopped drain and a failed drain leave the
executor in the same empty state. This is not the same as the *host's* loop, where an unhandled failure in one guest job should be
reported and the loop kept alive, because the host's loop has other work to protect; the
blocking drain has none, and its caller is the only party that can decide what a
mid-drain failure means.

Per [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), the
drain's return distinguishes "queue empty, all jobs ran" from "stopped on a failure" as
two typed outcomes, never as an empty result with a logged line.

## Decision rules

- When shipping executors with an engine, ship a null one and a blocking drain and no
  third, because any interleaving loop is host-shaped and an engine-shipped one is the
  internal loop the design refuses.
- When documenting the null executor, say that it disables promises, because the
  embedder observes unsettled promises and not discarded jobs.
- When a builder installs a default executor, install the one that runs jobs, because a
  silent null default is a guard configured off for everyone who did not know to
  configure it.
- When documenting the default, name the one the builder actually installs and keep the
  two in one place, because a stale claim beside a different default is acted on.
- When a job fails inside the blocking drain, clear the remaining queues and return the
  failure, because a later job run after an earlier one failed has been run out of order,
  now or on the next drain.
- When timers are queued, dispatch every due timer before the emptiness check, because a
  timer due now that is checked after the exit decision is a callback dropped on the
  floor.
- When the host has anything else to do on the thread, do not use the blocking drain,
  because it owns the thread for the length of the longest native wait.

## When not to use it

An engine embedded in exactly one host, built together with it and never published,
does not need a shipped executor pair: the host's loop is the only executor there will
ever be, and a null executor is a test fixture rather than a product. The pair earns its
place when the engine is a library many hosts will pick up, because each of those hosts
will evaluate its first script before it has a loop, and what the engine does at that
moment is the embedder's first impression of whether the engine is honest.
