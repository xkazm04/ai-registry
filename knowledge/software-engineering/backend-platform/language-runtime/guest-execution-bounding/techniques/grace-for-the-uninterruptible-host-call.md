---
layer: technique
type: technique
subject: guest-execution-bounding
technique: grace-for-the-uninterruptible-host-call
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a deadline fires while the guest is inside a host-provided call that the engine cannot preempt, deciding whether to abandon or complete work already begun on the host side when a ceiling breaches, a terminated guest leaves host-side state half-built, distinguishing a bounded host call from an unbounded one at the boundary]
---

# Grace for the uninterruptible host call

## The concern

A guest bounded from outside spends part of its time inside calls the *host* provided -
a layout flush, a serialization, a hash, a synchronous read. Those calls run host code,
not guest code, and the engine's termination machinery cannot reach into them: the
engine can raise a flag, but it regains control only when the host call returns. The
flag is therefore observed late, and the question the design must answer is what happens
in the interval.

Two naive answers, both wrong in the same way. The first is to treat the overrun as
immediate and abandon the host call - which is not actually available, because the
engine cannot preempt host code either, so "abandon" means the host call finishes anyway
and its result is discarded. The host paid the whole cost and threw away the product.
The second is to tighten the guest's ceiling so the host call is inside it, which
converts every guest that happens to call an expensive host routine near the deadline
into a breach, and makes the ceiling a function of host performance rather than of guest
behaviour.

This is the mirror image of the accounting problem in
[count-host-reentry-in-recursion-depth](./count-host-reentry-in-recursion-depth.md).
There, the host's frames were invisible to a counter that only saw guest frames, so the
depth undercounted. Here the host's *time* is inside a bound that only the guest can be
stopped for, so the ceiling overcounts: it charges the guest for a duration the guest did
not control. Both come from the same source - a boundary the accounting crosses without
saying so - and both are fixed by naming the boundary rather than by moving the number.

## Let the begun call finish, once, within a stated bound

The rule: when a deadline fires while control is inside a host call that is **known to
terminate**, allow that call to complete under a *separate, explicitly stated* grace,
and take the breach at the boundary when it returns.

Three words carry the weight. **Known to terminate** is a property of the host call, not
a hope: a layout flush over a finite tree, a serialization of a bounded structure, a
hash of a fixed buffer. The host is the author of these routines and can say which of
them are finite. A host call that can itself loop indefinitely - a network read with no
timeout, a lock acquisition with no bound - is not eligible, and the honest response
there is to bound *that* call at its own site rather than to grant it grace.

**Once** means the grace covers the call in progress and does not renew. The guest does
not get a fresh grace for the next host call; the deadline has already fired and the
next boundary is where the breach lands.

**Explicitly stated** means the grace is its own configured quantity with its own name,
not slack folded into the main ceiling. A ceiling of thirty seconds with five seconds of
hidden grace is a thirty-five-second ceiling that measurement will discover and nobody
can explain. Two numbers with two meanings can each be derived and each be reported; one
number carrying two meanings can be neither
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## The grace is zero when the tier was pinned

Where the budget tier was chosen by observation
([budget-tier-from-observed-output](./budget-tier-from-observed-output.md)), an explicit
override exists so tests can pin it - and the grace must be **zero under that override**.
A test that pins a one-millisecond budget in order to assert the breach, and then waits
five seconds of grace, is not testing the mechanism it named. The grace serves production
work with real host calls; a pinned budget means somebody is asserting the boundary, and
the boundary is what they should get.

## What the host must not do with the grace

Grace is permission to *finish* work already begun. It is not permission to start more,
and the distinction is what stops it becoming a second ceiling. Concretely: the host call
in progress completes and its result is used, because discarding it wastes work already
paid for and can leave host state half-built. Nothing new is dispatched to the guest, and
the outcome is still a breach - reported as a breach, in the class the ceiling defines,
not downgraded to success because the last call happened to finish
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). A guest
that overran and produced a usable partial result overran; the host may keep the partial
result and must still say what happened.

## Decision rules

- When a deadline fires inside a host call the engine cannot preempt, let the call
  finish under a separate named grace and take the breach at the boundary, because
  abandoning it discards work the host will pay for regardless.
- Grant grace only to host calls known to terminate. A host call that can loop
  indefinitely is bounded at its own site or it is the real ceiling, whatever the guest's
  ceiling says.
- Configure the grace as its own quantity with its own name. Slack folded into the main
  ceiling makes the published limit a number no measurement will reproduce.
- Do not renew the grace at the next host call. It covers the call in progress; the
  deadline has already fired.
- Set the grace to zero whenever the budget was explicitly pinned, so a test asserting
  the boundary gets the boundary.
- Keep the result of the graced call and still report the breach. Grace changes what is
  salvaged, never what is reported.

## When not to use it

A host whose calls into the guest's execution are all short relative to the ceiling does
not need a grace: the overshoot is within the ceiling's own noise, and a second number
buys nothing. A host that can make its expensive routines interruptible - checking a flag
at a coarse internal boundary - should do that instead, because a call that can observe
the deadline needs no grace and gives a tighter bound. And where the ceiling is a
correctness limit rather than a liveness one, grace is not available at all: a
deterministic limit that sometimes admits five extra seconds of host work is not
deterministic.
