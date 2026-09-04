---
layer: technique
type: technique
subject: engine-host-contract
technique: idle-aware-job-loop
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [writing the host event loop that drains an embedded engine's job queues, a runner burns a core while waiting on a timer, deciding when a script runner is allowed to exit, finalization cleanup jobs are starving foreground work or being starved by it, a stop request has to win against queued jobs]
---

# Idle-aware job loop

The engine hands the host four queues and no loop. Promise reactions arrive as
microtasks and must run to exhaustion before anything else. Timers arrive with a due
time. Native continuations arrive as futures the host's runtime must poll. Cleanup jobs
— the ones a finalization registry schedules when a collected object had a handler —
arrive whenever a collection ran. The host's loop drains all four into one thread that
usually has its own work too, and the three questions a loop must answer are when to
run what, when it is allowed to exit, and how it avoids spinning while it waits. The
naive loop answers all three with "poll every queue in a cycle, exit when they are all
empty", and burns a core doing it.

## One task per kind, one wake signal each

Give each job kind its own task with its own wake event. The microtask drainer wakes
when a job is enqueued; the timer task wakes when a timer is added or its earliest
deadline passes; the native task wakes when a future completes; the cleanup task wakes
when the collector reports work. A task with nothing to do parks on its event and costs
nothing. The alternative — one loop that checks every queue in turn — has to choose
between spinning and sleeping for a fixed interval, and both are wrong: spinning is a
core, sleeping is latency on every job. Waking is what the host's runtime is for, and a
loop that does not use it is reimplementing a scheduler badly inside one that exists.

## Exit on idleness, not emptiness

The loop must exit — a script runner returns to the shell when the script is done — and
the naive condition is "all queues empty". It is wrong twice. A queue can be empty while
a timer is pending, so an early exit drops a scheduled callback; and a queue can be empty
between two native polls, so an early exit drops a continuation. The correct condition is
**every foreground task is idle**: the microtask queue drained, no timer pending, no
native future outstanding. Cleanup is not a foreground task — an exit with cleanup jobs
pending is correct, because cleanup is the collector's convenience and not the program's
work, and a program that finished should not be held open to run handlers for objects
nobody will observe. That is the first half of the cleanup rule; the second half is that
cleanup runs *only in idle gaps*, when every foreground task is parked, because a cleanup
handler is guest code and letting it interleave with foreground reactions gives it an
ordering position the specification never promised it.

The count of foreground tasks is the loop's one constant, and it must be derived from
the tasks the loop actually spawned, not written as a literal beside the comparison. A
loop that spawns three tasks and exits when "three are idle" is correct until the fourth
kind of job arrives, and the literal is the last thing anyone updates.

The synchronous entry point — "run every job and return" — is the asynchronous loop
blocked on, never a second loop. Two loops with one queue set are two exit conditions and
two stop paths, and the one the tests do not exercise is the one that spins.

## Stop outranks everything

A host that asks the loop to stop — a signal, a shutdown, an operator's interrupt — must
win against every queue immediately, not after the current drain. Structurally that means
the stop signal is checked before each job rather than after each queue, and it means the
stop is not a job: a job can be delayed behind other jobs, and the point of stop is that
it cannot. Stop also *clears* the queues before it signals, so a task that wakes on the
stop finds nothing to run, and a job enqueued after the stop cannot resurrect the loop. Where the engine itself raises an uncatchable termination — a limit exceeded,
a host-side cancellation — the loop treats it the same way, as an outcome that ends the
loop rather than a failure to log and continue past. This is the loop-side half of a rule
the sibling subject on execution bounding owns from the engine side: a stop decided
outside guest code must reach the host without passing through any guest handler.

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), every task the
loop spawns names the condition that ends it — the stop signal, or the idleness of every
foreground task — at the point it is spawned, so a task that outlives the loop is a
defect with a location and not a mystery in a process that will not exit.

## Two constants, with reasons

**A minimum timer resolution.** A timer due in zero milliseconds, or in the past, or in a
sub-millisecond interval, is clamped to a floor of one millisecond before it is armed.
Without the floor, an interval of zero re-arms the moment it fires and the timer task
becomes a spin loop that the wake-signal design was meant to eliminate; the floor turns it
back into a yield. One millisecond is the floor most host schedulers can honour and the
one the web platform's own timer semantics settled on; an engine that chooses a different
value should write down why.

**One macrotask per microtask drain.** Between any two macrotasks — a timer callback, a
native continuation, a host event — the loop drains the *entire* microtask queue,
including microtasks enqueued by microtasks. The ratio is one to all, not one to one, and
not one to a budget. This is the ordering the specification promises to guest code:
every reaction to a settled promise runs before the next timer fires. A loop that runs
one microtask per macrotask, or caps the drain, produces programs whose promise ordering
depends on the host, which is the one thing a host-run loop must not introduce.

## Decision rules

- When draining an engine's queues, give each job kind one task with one wake signal,
  because a polling cycle must either spin or sleep and both are wrong.
- When deciding whether the loop may exit, exit when every foreground task is idle,
  never when every queue is empty, because a pending timer or an outstanding native
  future is invisible to an emptiness check.
- When cleanup jobs are pending, run them only when every foreground task is parked and
  do not hold the loop open for them, because cleanup is the collector's convenience and
  a guest handler must not gain an ordering position the specification never gave it.
- When a stop is requested, check it before each job and let it end the loop, because a
  stop that waits behind a queue is not a stop.
- When arming a timer, clamp its delay to a one-millisecond floor, because a zero
  interval is a spin loop wearing a timer's clothes.
- When running a macrotask, drain the whole microtask queue before the next one, because
  promise ordering is a specification promise and the loop is where it is kept or broken.
- When spawning a loop task, name at the spawn site what ends it, because a task without
  a reaper holds the process open.
- When comparing idle tasks against the foreground count, derive the count from the
  spawned tasks, because a literal beside the comparison is wrong from the next job kind
  onward.
- When offering a synchronous run, block on the asynchronous loop rather than writing a
  second one, because two loops are two stop paths and two exit conditions.

## When not to use it

A host that evaluates a script once, with no timers and no native futures, needs the
blocking drain the engine ships and not a loop. A host whose own runtime already
provides an event loop with the ordering semantics the specification needs — a browser
engine embedding, a runtime built around this exact language — implements the executor
as a thin adapter onto that loop and inherits its idleness and stop semantics rather
than re-deriving them. This technique is for the host in between: one with its own
work on the thread and no loop that already speaks the specification's ordering.
