---
layer: golden-path
type: golden-path
subject: engine-host-contract
status: forged
use_when: [embedding a language engine in a host that already owns an event loop, deciding which engine behaviours a host may override and what each override must keep true, a promise job or timer captured a value the collector then freed, an import loader can read a file the sandbox was not meant to reach, an engine needs time and the host has two clocks]
techniques:
  - spec-mirrored-hook-surface
  - null-and-blocking-executors
  - untraceable-jobs-as-roots
  - idle-aware-job-loop
  - contained-async-module-loader
  - monotonic-and-wall-clock-split
---

# Engine-host contract

A language engine that is meant to be embedded is not a program. It is a library that
evaluates source text on behalf of a host, and the language it implements was specified
with that split written in: the specification names, one by one, the operations it
declines to define — when a queued job runs, how an import specifier becomes a module,
whether a promise rejected with nobody listening is worth reporting, what the current
time is — and hands each of them to "the host". Those named operations are the
**host hooks**, and the surface of them is the engine's real public contract. Everything
else the host can call is convenience. This subject is the design of that contract from
the engine's side: how the seams are cut, what each one obliges its implementor to keep
true, what fills a seam when the host brings nothing, and which resources the engine
refuses to own because a host already owns them.

The stance a principal holds is this: **the engine owns no event loop, no filesystem and
no clock of its own, and every behaviour that varies by host is a named seam with the
specification's obligations stated on it, the specification's default in it, and exactly
one implementor filling it.** The naive reading, which treats the engine as a program
that happens to be linkable, gets each half wrong. It ships an internal loop that the
host's loop then has to be scheduled around; it reads files itself and becomes the one
component in a sandboxed process that can reach the disk; it calls the system clock and
makes every test that touches time flaky. And it exposes overrides as a flat struct of
optional callbacks, so an embedder learns what a callback must not do from a conformance
failure six months later.

## Where this subject starts and stops

[Agent-runtime-assembly](../../../llm-agent/runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md)
owns a registry of *contributed* callbacks — many contributors per event, each bounded
by a timeout, each failing in its own lane — and its honest-hook-registry says what such
a registry may promise; here there is one implementor per hook, the obligations were
authored by a standards body rather than by the host, and a timeout is meaningless
because the engine cannot continue without the hook's answer. The rule a reader uses:
if several parties register against a name and the host decides their order, go there;
if one host fills a seam the specification cut, it is here.

[Untrusted-extension-host](../../../security/extension-trust/untrusted-extension-host/untrusted-extension-host.md)
owns whether an in-process runtime is an isolation tier at all, what reach an
administrator-installed bundle may be granted, and the honest statement of what such a
sandbox cannot contain; here the host is trusted, the seams are filled by the operator's
own code, and the single touch point is the module loader — the one hook that can reach
the filesystem — whose containment this subject owns because the loader is engine-shipped
code, not a security policy.

[Job-coordination](../../work-execution/job-coordination/job-coordination.md) owns jobs
that are durable records first and running processes second, with leases, positions and
terminal verdicts that survive their executor's death; the jobs here are the opposite
animal — in-memory, run at most once, unobservable from storage, and by design unable to
live in the engine's heap — and the executor that drains them is the host's loop, not a
worker fleet. If the question is what survives a restart, go there; if it is who runs a
promise reaction and when, it is here.

## The hook surface is the specification, restated where it is overridden

The specification carries a summary table of host hooks, each with a short list of
requirements: this one must be deterministic for a given source; that one must complete
normally and never throw into the engine; this pair must produce the same result for the
same referrer and specifier every time they are asked. An engine cannot check any of
these. They are obligations the host keeps or fails to keep, and the engine's correctness
— not merely its behaviour — depends on them being kept. So the first design decision is
where those obligations live, and the answer is: *on the override point itself*. One
method per specification hook, named so a reader with the specification open finds it in
one lookup, with the specification's requirements restated in that method's own
documentation and the specification's default behaviour as its body.

That rule does three things at once. It makes the hook set a closed vocabulary with one
authority, so an engine never grows a second, "convenient" override that quietly
duplicates a spec hook with looser rules. It puts the contract where the override is
written, so the embedder who reads only the method they are replacing still reads what
they must keep true. And it makes "do nothing" the correct default for every host that
has no opinion, because the default is the specification's own. The mirror is one
override per host *decision*, not per specification paragraph: where the specification
spreads one decision across several operations — five ways to enqueue a job that differ
only in the job's kind, a get-properties step followed by a finalize step on the same
object — the engine exposes one method that names every operation it stands for and
carries a closed variant type for the difference, because two methods for one decision
are two places for the host to be inconsistent. And the engine may add hooks of its own where the language leaves a gap the specification does not name — a stack-depth
reader, a buffer ceiling — but each is added the same way, obligations first.
[Spec-mirrored-hook-surface](./techniques/spec-mirrored-hook-surface.md) owns the
mapping rule, the documentation shape, and the test that an override is a conformance
claim.

## Jobs are the host's to run, and the engine ships only the two honest executors

Every promise reaction, every timer, every finalization cleanup and every native
continuation is a **job**: a closure the engine enqueues and something else runs. The
specification says the host runs them, in order per queue, after the current evaluation
completes. It does not say what the queue is, what runs it, or how it relates to the
host's other work — and that is the whole reason an embedded engine must not own an event
loop. A host that already has one (a server, a game, a command line waiting on a socket)
cannot schedule around an engine that insists on its own; the engine's loop either
starves the host or is starved by it, and neither party can see the other's queue.

So the engine exposes a job executor as a seam, and ships exactly two implementations
that are honest about what they are. One does nothing: it accepts every job and drops it,
which is to say it *disables promises*, and its documentation says so in those words,
because an executor that silently swallows continuations is the most convincing form of
empty success. The other is a blocking drain: run every job of every kind in order, timers
included on the engine's own clock, block on the ones that must wait for a native future,
and on the first failure clear what remains and hand the failure back. It is correct, it
is single-threaded, and it is unusable inside a host that has anything else to do — which
is exactly the host that should have brought its own.
[Null-and-blocking-executors](./techniques/null-and-blocking-executors.md) owns the pair,
the rule that the default the builder installs must be the one that runs jobs, and why a
blocking executor bails on the first error instead of draining past it.

The host's real executor is a loop, and a loop that drains four job kinds — promise
reactions, timers, native futures, cleanup — into one process that also serves the host's
own work has a shape that is easy to get wrong in the direction of a spinning core. The
shape that works gives each job kind one task with one wake signal, exits when every
foreground task is idle rather than when a queue is empty, runs cleanup only in idle gaps,
lets a stop request outrank every queue, and drains the whole microtask queue between any
two macrotasks. [Idle-aware-job-loop](./techniques/idle-aware-job-loop.md) owns that shape
and the two constants it needs — a minimum timer resolution and the one-macrotask-per-drain
ratio — with the reasons they are what they are.

## A job is a root, because a job cannot be reached from the heap

The subtle rule sits between the executor and the collector. A job captures values —
the promise it will settle, the callback it will invoke, the receiver it was bound to —
and those values live in a traced heap. The obvious design lets the job be a heap object
too, traced like everything else, so the collector can free it when nothing references it.
That design has a hole the size of the executor: the executor holds jobs outside the heap,
in a queue the collector does not walk, so a job reachable only from the queue looks
unreachable and its captures are freed under a job that has not yet run. The correct rule
is the inversion — **jobs do not implement tracing, so every value a job captures is a
root for the job's lifetime, and a job can never be stored inside the heap**. The collector
does not need to know about jobs because jobs are, by construction, outside its world; the
captured values are released when the job is dropped, and the job is dropped when it has
run or the executor was torn down. The line is drawn by holder, not by purpose: the
callback *record* a promise reaction stores in the heap traces like any heap value, and
the job that carries that record to the executor does not.
[Untraceable-jobs-as-roots](./techniques/untraceable-jobs-as-roots.md) owns the rule,
the holder line, and the cost it accepts: a job that is never run holds its captures
forever, so the executor's teardown is the reaper and must be written as one.

## The loader is one async seam, and the shipped one is contained

Importing a module is the only hook that, in the common host, reaches the filesystem.
The specification cuts it as a single asynchronous operation — given a referrer and a
specifier, produce a module or a failure, and produce the same answer for the same pair
every time — and the engine exposes exactly that. Synchronous loading is refused on
principle, because a host that fetches from the network or a database has no synchronous
answer, and an engine that offered both would have two loaders with different semantics.

The engine still ships a loader, because every embedder's first program imports a file,
and the shipped one is where containment lives. It normalises the specifier lexically —
collapse the dot segments, resolve against the referrer's directory — without touching the
filesystem, because the file need not exist yet to be named, and canonicalising a path
that does not exist fails on the wrong axis. It canonicalises its **root** once, at
construction, and refuses any resolved path that does not sit under that root. And it
comes in two other shapes for hosts that have no filesystem: an idle loader that fails
every import, so the seam is filled and the failure is a module error rather than a
missing hook, and an embedded loader that carries its sources in the binary under a byte
budget. [Contained-async-module-loader](./techniques/contained-async-module-loader.md)
owns the normalise-without-canonicalise rule, the root check, and the three shapes.

## Time is two clocks, and the engine assumes only one of them

An engine needs time twice, for two purposes that share nothing. Timers and intervals need
a **monotonic** clock: a value that never goes backwards, whose differences are durations,
whose absolute reading means nothing. Dates need a **wall** clock: the civil time a user
would recognise, which the operating system may step forwards or back at any moment. An
engine that reads one system clock for both has bound its timer arithmetic to daylight
saving and its date output to boot time, and has made every test that touches either
non-deterministic. So the clock is a seam like the others, the engine assumes
monotonicity only where it schedules, uses the wall clock only where it formats, and ships
a fixed clock whose reading is set by the test and moves only forward. The same
seam carries the one thread check this subject insists on: the specification says an
agent that may suspend its thread — block in a wait primitive until another agent wakes
it — must be the only agent on that thread, and the engine enforces it where it can,
at context construction, by counting the contexts alive on the thread and refusing to
build a suspendable one beside any other.
[Monotonic-and-wall-clock-split](./techniques/monotonic-and-wall-clock-split.md) owns
the split, the fixed clock, and that check.

## Failure modes this standard exists to prevent

- **The obligation in the conformance suite** — an override whose requirements are
  discoverable only by running the language's test suite against it.
- **The silent null** — a do-nothing executor installed as the default, so promises never
  settle and nothing says why.
- **The trusting root** — a root compared as a string against a resolved path, so a
  sibling directory with the same prefix passes.
- **The traced job** — a job stored in the heap, collected out from under its queue.

## The techniques

- [spec-mirrored-hook-surface](./techniques/spec-mirrored-hook-surface.md) — one override
  per host decision, named after the hook; the specification's requirements in the
  override's own documentation and its default as the body.
- [null-and-blocking-executors](./techniques/null-and-blocking-executors.md) — a no-op
  executor that says it disables promises, a blocking drain that clears and bails on the
  first error; the builder's default is the one that runs jobs.
- [untraceable-jobs-as-roots](./techniques/untraceable-jobs-as-roots.md) — jobs do not
  trace, so captures are roots for the job's life and a job can never live in the heap.
- [idle-aware-job-loop](./techniques/idle-aware-job-loop.md) — one task per job kind;
  exit on idleness; cleanup only in idle gaps; stop outranks everything; a minimum timer
  resolution; one macrotask per microtask drain.
- [contained-async-module-loader](./techniques/contained-async-module-loader.md) — one
  async hook with idempotency stated; normalise without canonicalising; refuse anything
  outside a root canonicalised once; idle and embedded loaders.
- [monotonic-and-wall-clock-split](./techniques/monotonic-and-wall-clock-split.md) — a
  monotonic clock for timers, a wall clock for dates, a forward-only fixed clock; a
  construction-time count that keeps a suspendable agent alone on its thread.
