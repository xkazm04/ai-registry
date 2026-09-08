---
layer: technique
type: technique
subject: guest-execution-bounding
technique: terminate-from-outside-when-you-cannot-count
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [the host embeds an engine whose dispatch loop it does not own and cannot instrument, a cooperative timeout returns while the work it was supposed to bound keeps running, deciding whether an unbounded guest is acceptable because no counter can be inserted, an engine vendor ships a termination entry point and the host has not wired it]
---

# Terminate from outside when you cannot count

## The concern

Every other technique in this subject rests on one precondition: the host owns the
dispatch loop, so it can place a counter in it. That precondition is not always
available, and its absence is not a minor variation. A host that embeds a **third-party**
engine - a script engine, a query engine, a regular-expression engine, a media decoder,
any component shipped as a binary or as a library whose inner loop is not the host's
code - can count nothing. There is no back-edge to instrument, no dispatch table to
duplicate, no frame push to intercept. The counted set is empty, and it stays empty for
as long as the host does not fork the engine.

The subject's own principle - *a ceiling is enforceable exactly where something is
counted, and nowhere else* - is true, and read carelessly it says this host has no
ceiling available. Two conclusions follow from that reading and both are wrong. The
first is to publish the whole engine as uncounted and move on, which leaves one guest
able to hold the host forever. The second is to wrap the call in the host's asynchronous
timeout and believe the problem solved. The second is worse, because it looks solved.

## The cooperative timeout does not stop the work

An asynchronous timeout in a task runtime is a race between two futures, and the thing
it cancels when it wins is **the await, not the work**. If the guest's execution is a
synchronous call into foreign code, the runtime never regains control to cancel
anything: the timeout cannot even fire until that call returns, because the task that
would observe it is the task blocked inside it. If the guest's execution is a child
process or a connection the host handed off, the timeout fires on schedule and the host
returns an error while the work continues - still executing, still holding its
resources, still spending whatever it spends, with nobody left waiting for it.

The second shape is the dangerous one, because the host's own logs say the bound worked.
The operator sees a clean timeout error. What actually happened is that the host stopped
*observing* an unbounded task. A timeout that a reader would describe as "we cap it at
thirty seconds", and that in fact caps only the caller's patience, is an absent guard
wearing the word "timeout"
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The test that separates the two, and the one to run before believing any timeout in a
codebase: **when this bound fires, what happens to the work?** If the answer is "the
future is dropped", ask what dropping that future does to the thing on the other end. If
the answer is "nothing", the ceiling is decorative. This is a question a reader can
answer from the code in about a minute, and a question a codebase can be swept for
mechanically, because the two halves - a bound here, a handoff there - are usually
written by different people in different years.

## What an external terminator is, and why it is not the naive watchdog

The remedy is a separate thread of control that holds a **handle the engine published
for exactly this purpose** and calls it when a deadline passes. The distinction from the
naive watchdog - kill the guest's thread on a timer - is the whole technique, and it
rests entirely on what the terminator is allowed to touch.

A thread killer touches the guest's thread while that thread holds the host's data
mid-mutation, which is why it cannot be made safe. An external terminator touches
**nothing but a thread-safe termination handle the engine itself exposes**. The engine
then unwinds its own execution at its own next safe point, through its own machinery, to
the host's entry point - which is precisely the unwind that
[uncatchable-limit-errors](./uncatchable-limit-errors.md) describes, driven from outside
instead of from a counter. The guest cannot catch it, for the same reason it cannot
catch a counted breach: it is raised in a class the guest's handlers do not participate
in. The verdict arrives at the host as a typed outcome it can branch on
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

An engine that publishes such a handle has already decided this question for its
embedders, and the host's job is to notice and wire it. An engine that publishes none
has declared itself unbounded, and the honest host runs it in a process it can kill
rather than in its own.

The three objections that make a watchdog naive for an instrumentable engine are each
answered by that change in what is touched:

- *It cannot be killed without corrupting the host's data.* Nothing is killed. The
  engine unwinds itself, and its invariants hold because it chose the point.
- *A timer is not deterministic.* Conceded, and reframed below: this ceiling is not a
  correctness limit and does not need determinism.
- *A single-threaded host does not have a thread.* It does. The constraint is that
  **guest execution** is single-threaded; a thread that only sleeps on a deadline and
  calls one thread-safe function never touches that constraint, and costs one idle
  thread for the life of the process.

## A liveness ceiling, not a correctness limit

The counted ceilings in this subject are correctness limits: they must land at the same
instruction on every machine, or the same program passes here and fails there. That is
why they are counted in instructions rather than measured in time.

An external terminator cannot be deterministic and must not pretend to be. What it
promises is different and weaker, and stating the weaker promise precisely is what makes
it useful: **no single unit of guest work holds the host indefinitely.** That is a
liveness property. It does not say which programs succeed - a program near the boundary
succeeds on a fast machine and fails on a slow one - and a design that lets a guest's
*result* depend on it has used it for the wrong job.

Two consequences follow. The deadline is set far above the slowest legitimate work, not
near it, because every unit of margin buys back determinism for real programs and costs
only the runaway case a few extra seconds. And the outcome is reported as its own
class - *this exceeded its liveness ceiling* - never merged with the guest's own errors,
so an operator reading the failures can tell a slow machine from a broken program.

## Decision rules

- When the host cannot instrument the engine's loop, do not conclude the guest is
  unboundable; ask whether the engine publishes a thread-safe termination handle, and
  wire it before accepting an unbounded ceiling.
- Never present an asynchronous timeout around foreign work as a ceiling until you have
  named what cancelling that future does to the work. If dropping it detaches the work
  rather than stopping it, the timeout bounds the caller and nothing else.
- Have the terminator touch only the engine's published handle, never the thread, the
  memory or the process. The engine unwinds where its invariants hold; an external
  killer picks the point at random.
- Set the deadline far above the slowest legitimate unit of work, because this ceiling
  trades determinism for liveness, and margin is what buys the determinism back.
- Report a liveness breach as its own outcome class, distinct from every guest error, so
  that "too slow here" is never read as "wrong".
- When the engine publishes no termination handle at all, move it out of the host's
  process into one the operating system can kill, and say in the ceiling list that this
  is why.

## When not to use it

An engine the host owns and can instrument should be counted, not terminated from
outside: counting is deterministic, thread-free, and stops the guest where every
invariant is known to hold. Reach for external termination when the counted set is empty
and cannot be filled, or as the outer backstop over counters that already exist - never
as a replacement for a counter you could have written. A host that already runs each
unit of guest work in its own killable process has an external terminator with better
isolation than this one and should use that. And a host whose guest work is a pure
computation it can simply stop waiting for - a cache warm, a speculative fetch - needs no
ceiling here at all; it needs to stop treating the result as required.
