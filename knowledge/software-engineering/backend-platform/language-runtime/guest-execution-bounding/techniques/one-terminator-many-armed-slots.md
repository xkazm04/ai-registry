---
layer: technique
type: technique
subject: guest-execution-bounding
technique: one-terminator-many-armed-slots
status: forged
laws: [count-carries-predicate, creation-names-reaper]
shared_with: []
use_when: [arming a deadline around every request on a hot dispatch path, several connections each hold their own engine instance and each needs its own bound, a per-call thread spawn shows up in the latency profile of a small command, a second armed deadline silently replaces the first and leaves that work unbounded]
---

# One terminator, many armed slots

## The concern

Once a host decides to bound foreign work from outside
([terminate-from-outside-when-you-cannot-count](./terminate-from-outside-when-you-cannot-count.md)),
the obvious implementation is a thread per bounded call: spawn, sleep until the
deadline, terminate if the work has not finished, join. It is correct and it is easy to
read, and it fails on two axes that only appear once the mechanism is applied to
*every* call rather than to the few slow ones.

The first is cost. Spawning and joining a thread is on the order of a couple of hundred
microseconds. On a dispatch path that also handles commands taking a few hundred
microseconds, arming the bound has doubled the cost of the cheap half of the traffic to
protect against the rare runaway in the slow half. A ceiling that is too expensive to
arm everywhere gets armed selectively, and a selectively armed ceiling protects the
calls somebody predicted would be slow - which is the complement of the set that
actually hangs.

The second is correctness under concurrency, and it is the one that bites silently. The
natural correction to the cost problem is a single long-lived terminator thread with a
slot holding the current deadline and handle. That works exactly as long as one bounded
call is in flight at a time. The moment two are - two connections, each with its own
engine instance on its own thread - the second call's arm overwrites the first's, and
the first call is now running with **no bound at all**. Nothing reports this. The
overwritten call either finishes normally, which is the common case and hides the
defect, or it hangs forever, which is the case the ceiling existed for.

## One thread, a set of slots, a generation key

The shape that solves both: **one long-lived terminator thread, and a set of armed
slots rather than a single slot.**

Each slot holds a deadline, the termination handle for the work it bounds, and a flag
recording whether it fired. Arming inserts a slot and returns its key; disarming removes
the slot by key. The key is a **monotonic generation counter**, not the identity of the
connection, the thread, or the engine instance - because those are all reusable, and a
key that can repeat is a key that can address the wrong slot after a reuse
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) is the same
hazard one layer down). The counter only ever increases, so a stale key from a call that
already disarmed matches nothing.

Arm and disarm are then a lock acquisition, a map insert or remove, and a condition-variable
notify: low single-digit microseconds, cheap enough to arm unconditionally on every
call, which is what makes the guard non-optional
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The thread sleeps
until the earliest deadline in the set, wakes, terminates every slot that has overrun -
plural, because several may have expired while it slept - and sleeps again. It is
created once, and its lifetime is the process
([creation-names-reaper](../../../../_laws.md#creation-names-reaper) is satisfied
trivially: nothing reaps it, because nothing else outlives it).

## Firing is a fact the disarming side must observe

A slot that fired has left a mark: the engine it terminated is now carrying a
termination flag that must be cleared before that engine runs anything else, or the
next unit of work on it dies instantly for a deadline that belonged to its predecessor.

So the fired flag lives *in the slot*, and disarm returns it. The disarming side - the
one that owns the engine and is about to hand it the next unit of work - reads that
flag, and clears the engine's termination state if it is set. Putting the flag anywhere
else, or letting the terminator thread clear the state itself, reintroduces the race
the design just removed: the terminator would be touching engine state from outside,
which is precisely what the whole approach exists to avoid.

## What the set makes countable

A set of armed slots is also the only honest source for the two numbers an operator
needs and a single slot cannot produce: how many units of work are currently bounded,
and how many have been terminated. Both come free from the structure. Report the second
one broken out by whatever the host uses to identify a caller, because a ceiling firing
uniformly across traffic is a ceiling set too low, while a ceiling firing on one caller
is that caller's bug - and a single scalar cannot tell them apart
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Decision rules

- Use one long-lived terminator for the process, not a thread per bounded call, once the
  bound is armed on a path where the cheap calls outnumber the slow ones.
- Never let a single global slot hold the current deadline. If two units of work can be
  in flight at once - and any per-connection engine instance means they can - a set is
  required, and a single slot silently unbounds every call but the newest.
- Key slots by a monotonic generation, never by connection, thread or instance identity,
  so a stale disarm cannot address a live slot after a reuse.
- Keep arm and disarm to a lock, a map operation and a notify, because a ceiling
  expensive enough to be worth skipping will be skipped exactly where it was needed.
- Wake the terminator on the earliest deadline in the set and fire every slot that has
  overrun, not just the first: several can expire during one sleep.
- Record firing in the slot and have disarm return it, so the side that owns the engine
  clears the engine's termination state before reusing it. The terminator touches
  nothing but the handle.
- Export the armed count and the fired count broken out by caller, because a uniform
  fire rate and a concentrated one call for opposite fixes.

## When not to use it

A host that bounds one unit of work at a time, and does so rarely - a build step, a
nightly job, a one-shot command - should spawn the thread per call and keep the simpler
code; the slot set earns its complexity only against concurrency or against a hot path.
A host whose engine offers a deadline the engine itself enforces should use that instead
and skip this machinery entirely. And where each unit of work already runs in its own
process, the operating system is the terminator and the set of armed slots is the
process table.
