---
layer: technique
type: technique
subject: durable-agent-operations
technique: two-cancellations-and-a-synchronous-door
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [closing a browser tab kills an agent run that should have continued, cancelling work requires somebody to still be watching it, an effect starts after cancellation was requested, deciding which calls must pass an admission check]
---

# Two cancellations and a synchronous door

Two different things are called cancellation in an agent runtime and they must
not share a mechanism. One is a **caller's** cancellation: a request
disconnects, a viewer closes a window, an invocation times out. The other is
the **operation's** cancellation: somebody has decided the work should end.
Collapsing them produces one of two systems, and both are broken. Either
closing a tab kills the run — the caller's disconnect propagated into the work
— or ending the run requires somebody to still be watching it, because the only
cancellation path runs through an observer.

The split is the first half of this technique. The second half is the door
between "may this effect start" and "the effect started", which must be **one
synchronous expression**, with all preparation finished before it.

## Two cancellations, two mechanisms

**Caller cancellation** ends that caller's observation and mutates nothing
durable. Each invocation carries its own signal; aborting it stops the caller
waiting, closes its stream, releases its resources, and leaves the operation
exactly where it was. A caller's signal must never be able to reach durable
state — not by convention but by construction: no public entry point accepts a
standalone operation signal, and a signal that arrives in a request payload is
stripped rather than honoured.

**Durable cancellation** is its own primitive. It writes a marker into the
operation's control state, and the marker is the only authority. Once the
marker is committed, the operation is cancelled whether or not anyone is
watching, whether or not the process survives, and whether or not the caller
that requested it is still connected. A repeated request against an already
cancelled operation is not an error and does not emit a second event; it reports
that cancellation was already requested.

The test for whether a design has done this: disconnect every observer of a
running operation and assert that it continues; then request cancellation from a
caller that immediately disconnects, and assert that the operation still ends.
A system that passes only one of those has one mechanism where it needs two.

## The door must be synchronous, and preparation goes before it

Between deciding an effect may start and the effect actually starting there is
a window, and if anything *awaits* inside that window, cancellation can win the
race and the effect still starts. The trace:

1. The procedure checks admission — not cancelled, proceed.
2. Inside the admitted region it awaits preparation: resolving credentials,
   loading a provider, building the request.
3. Cancellation is requested and commits.
4. Preparation completes and the effect starts — **after** cancellation.

So: **prepare first, then check and invoke in one synchronous expression with
no yield between them.** The admission check returns the started operation
directly; nothing is awaited between the check and the call.

One subtlety decides whether this actually holds. The thing admitted is the
**whole logical operation**, not an eventual low-level call. If invoking returns
a lazy object that will later resolve credentials, load a provider, or delegate
onward, all of that later work is still inside the admitted operation and must
carry the same cancellation signal. A design that admits a wrapper and lets the
real work resolve later under no signal has moved the window rather than closing
it.

## Exactly two orders, which is what makes it testable

Once the door is synchronous, every admitted effect has exactly **two** possible
orders and no third:

- **Admission first** — the check passes and the effect starts synchronously;
  cancellation then commits its marker and signals the already-started effect,
  which cooperates or is reconciled.
- **Cancellation first** — the door is closed before the check runs; the check
  refuses, the effect never starts, and the procedure enters reconciliation.

Two orders means two tests per gated integration, and *that* is why the door is
worth its awkwardness. A design with an await in the middle has an unbounded
number of interleavings and no finite test.

## The catalog is closed and enumerated

Which calls pass through the door is a **list**, not a convention
([one-validation-door](../../../../_laws.md#one-validation-door)): every hook
pipeline, each provider request, each real tool execution, each retry timer's
creation. The list is written down, each item has its pair of order tests, and
a test asserts that **no other code path calls the door at all**.

The enumeration is what makes the guard non-optional
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A door
that each new integration is supposed to remember to use is a door most
integrations will eventually skip, and the skip is silent — the effect works
fine, right up to the first cancellation nobody honoured. A closed catalog
converts "did we remember?" into a diffable list and a failing test.

Gate a **hook pipeline as one unit**, not each handler inside it. Cancelling
between the third and fourth handler of a pipeline leaves the pipeline half
applied, which is a state nobody designed.

## What is not behind the door

Over-application is the common failure and it is worse than under-application,
because it deadlocks or silently drops writes. The door does **not** wrap:

- **commits** — a transaction refused mid-operation loses the record of an
  effect that already happened, which is exactly backwards;
- **pure classification and preparation** — deciding what to do costs nothing
  and needs no permission;
- **synthetic outcomes** — a result the runtime constructs itself (an unknown
  tool, a blocked call, an interruption notice) started no effect and needs no
  admission;
- **queue, configuration and record mutations** through the public surface;
- **passive observers** — event listeners, telemetry, progress delivery;
- **an already-admitted operation** — admitting twice is where deadlock lives.

The rule of thumb: the door gates *starting something the world will notice*.
Everything else passes.

## The door is not durable state

If the process dies after the door closes but before the cancellation marker
commits, **no cancellation exists**. The gate is process-local: it disappears
with the process, and recovery trusts only the durable marker.

That is deliberate, and a gate that "remembers" across a restart would be a
second source of truth about whether the operation was cancelled — two answers
that disagree exactly when they matter. The corollary on the write side is that
the durable cancellation request must close the door **synchronously before**
committing its marker, so no new effect is admitted while the marker is in
flight; and the corollary on the read side is that a procedure resuming after a
restart checks the marker, never a remembered refusal.

A cancellation request that arrives when no process owns the operation commits
the marker and starts nothing. The next process to pick the operation up reads
the marker first and goes straight to reconciliation, invoking none of the
ordinary pipeline.

## Boundary: this is not the teardown of stop-blocking guards

The neighbouring session discipline's ordered teardown governs **control guards
that can refuse a stop** — a continuation record, a mode flag, a plan anchor —
and requires one cancel path that clears every one of them, primary first, and
wins the race against re-arming. This technique governs **in-flight effects**,
and requires that the cancel path *start nothing new*.

They compose and neither is the other. To a casual reader both are "the cancel
path", which is why the discriminator has to be written down: teardown answers
*what must be cleared so the loop is allowed to stop*; this answers *what must
not be started once stopping has been requested*. A harness needs both, and a
harness that implements one and believes it has the other will either stop and
keep working, or refuse to stop while starting nothing.

## Decision rules

- Give caller cancellation and durable cancellation separate mechanisms; let no
  public surface accept a standalone operation signal.
- Treat the committed marker as the only authority on whether an operation is
  cancelled.
- Finish all preparation, then check admission and invoke in one synchronous
  expression.
- Treat the admitted unit as the whole logical operation, including work it
  resolves lazily; pass the same signal into that work.
- Enumerate what is gated; test both orders for each item; assert nothing else
  calls the door.
- Gate a hook pipeline as one unit.
- Do not gate commits, classification, synthetic outcomes, public record
  mutations, passive observers, or an already-admitted operation.
- Close the door synchronously before committing the marker; never persist the
  door's state.
- With no live process, commit the marker and start nothing; let the next
  process reconcile.

## When not to use it

A runtime whose effects are all short, all cheap to repeat, and all
side-effect-free can end an operation by dropping it and letting recovery close
the record — there is nothing in flight worth refusing. The door earns its cost
at the first effect that is expensive or irreversible, and the split between the
two cancellations earns its cost the first time an operation is expected to
outlive the request that started it. Below both thresholds, one signal and a
best-effort stop is the honest whole design.
