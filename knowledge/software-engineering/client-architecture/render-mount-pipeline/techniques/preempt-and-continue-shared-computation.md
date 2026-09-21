---
layer: technique
type: technique
subject: render-mount-pipeline
technique: preempt-and-continue-shared-computation
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [the frame thread needs a layout that a background thread already started, deduplicating equivalent layout requests from callers with different deadlines, a background waiter hangs on a computation that was interrupted, a shared computation returns null and nobody can say why]
---

# Preempt and continue a shared computation

Layout for one tree is requested from more than one place: a background thread
computes it when new data arrives, and the frame thread asks for it when a host
is measured before that background work has finished. The requests are
equivalent — same description, same constraints — and computing twice wastes
exactly the time the background thread was meant to save. So equivalent
requests share one computation. What makes this a technique of its own is that
the waiters are **not equal**, and one of them cannot wait.

## One shared computation, released when nobody waits

Running computations sit in a list guarded by one lock. A new request scans it
for a running computation that is not released and is equivalent to its own,
and **registers** on it; registering increments a waiter count. If none is
found, the request registers on its own computation and adds it to the list.
When a waiter has its result it unregisters, and when the count reaches zero the
computation is **released** and removed from the list — the waiter count is the
computation's reaper
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). A computation
checks whether it was released both before it starts and after it finishes, and
a released computation answers with a released verdict, never with a result
nobody is entitled to use.

## Three waiter classes

**The deadline-bound waiter — the frame thread — never blocks on work running
elsewhere.** If the computation it joined is running on another thread, it marks
the computation **interrupted**. The running thread checks that mark at
resolution checkpoints and returns what it has as a **partial result**; the frame
thread receives it and **continues** the computation to completion itself. The
frame thread pays for the remaining work rather than for waiting on all of it,
and the background thread's finished share is not thrown away. While the frame
thread does wait for the handover, the running thread's priority is raised to the
frame thread's, and afterwards restored — but only if nobody else changed it in
the meantime; restoring over a third party's change is a priority inversion of
the product's own making.

**The background synchronous waiter needs a complete result and may block.** It
must never join a computation that can be interrupted, because an interrupted
computation hands its partial result to the frame thread and returns nothing to
anyone else — the waiter would block on a result that is never coming. So before
registering it atomically moves the computation from interruptible to
non-interruptible. If the computation is already interrupted, it does not
register there and runs its own.

**The asynchronous waiter does not wait at all** on work running on another
thread. It returns at once with a waiting verdict; the thread already running the
computation will deliver the result to the tree.

The frame thread's interruption is decided **at registration**, in the same
critical section as the join, not later when it asks for the result. Deciding it
later leaves a window in which a background waiter pins a computation
non-interruptible after the frame thread has already chosen to rely on
interrupting it.

## The precondition, and why this lives in this subject

Preempt-and-continue requires a computation that can be **resumed from a partial
result on a different thread**. That in turn requires layout to be a pure
function over an immutable description with checkpoints between stages, which is
what blueprint-then-mount produces. Without it the frame thread has two choices,
block or recompute from scratch, and this technique does not exist.

The general catalogue of second-caller policies is refuse, join, queue, coalesce
and merge. This is a sixth — **preempt and continue** — and it appears only when
waiters carry heterogeneous deadlines and the work is continuable. Both
conditions are manufactured by a render pipeline with a frame deadline, which is
why the policy is kept here, beside the thread that forces it.

## Every missing result has a name

A shared computation hands out "no result" in several situations, and each means
something different to the caller: the computation was **released** before this
waiter got to it; a non-frame thread would have **waited** on work running
elsewhere and declined to; a background thread **was interrupted** and the frame
thread is finishing the work. Each is a distinct verdict state with a
description, returned as a typed value that the caller branches on
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). A bare
null reads as "layout produced nothing", which is a different and alarming claim
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## When not to use this

- **The work cannot be resumed.** A computation with no checkpoints can only be
  cancelled; use join or refuse, and keep it off the frame thread entirely.
- **There is one waiter class.** A pipeline whose layouts are all requested from
  background threads needs plain join.
- **The work fits the frame budget.** Interrupt and handover have fixed costs;
  a layout that finishes in a fraction of a frame is cheaper computed on the frame
  thread than negotiated.

Once it ships, it should be the only mode. An opt-out that lets individual trees
exempt themselves from interruption creates trees where the frame thread blocks
and trees where it does not, and the difference surfaces as dropped frames on
screens nobody can name.

## How to test for the property

- Start a slow layout on a background thread, request the equivalent layout from
  the frame thread, and assert the frame thread's wait is bounded by one
  checkpoint interval, not by the layout's duration, and that its result equals a
  from-scratch computation.
- Interrupt a computation, then register a background synchronous waiter on it:
  it does not register there and completes its own computation.
- Register an asynchronous waiter on a computation running elsewhere: it returns
  immediately with the waiting verdict.
- Release a computation mid-run and assert its result carries the released
  verdict, never a value.
- Change the running thread's priority from a third party during a handover and
  assert the restore does not overwrite it.
