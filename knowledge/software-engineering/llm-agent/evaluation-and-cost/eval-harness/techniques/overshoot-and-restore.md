---
layer: technique
type: technique
subject: eval-harness
technique: overshoot-and-restore
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [an agent is reducing something under a test gate, a cleanup or compression run finished all-green, deciding when an optimization loop is allowed to stop]
---

# Overshoot and restore

Point an agent at a resource and tell it to shrink that resource without
breaking the suite, and you have posed a problem whose scoring is asymmetric:
**doing nothing is always green.** The null change passes every scenario,
costs nothing, and satisfies the brief as literally written. Every increment
of real reduction adds risk of a red run and adds no reward the gate can see.
A rational optimizer under those incentives stops early, reports success, and
is telling the truth.

So an all-green optimization run carries no information about how far it got.
It says the system stayed inside the boundary; it does not say the boundary
was anywhere near. "Stopped early" and "reached the bound" are spelled
identically in the report, which is the failure this technique exists to
prevent ([_laws:
failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

The corrective is to make the boundary a required observation:

> The run may not finish until at least one scenario has **failed**. Then
> restore the minimum that clears it, re-run to green, and keep both states.

The failing attempt is not an accident to be cleaned up. It is the only
coordinate the run produces. Without it, the result is "somewhere inside";
with it, the result is "the boundary is between these two states," which is
the measurement that was wanted.

## Restoration is cheap because the failure is specific

The overshoot is affordable precisely because the failure names its own
repair. A scenario that went red identifies which removed material was
load-bearing, so the restore is targeted rather than a wholesale revert — put
back what that scenario needed, leave the rest of the reduction standing. The
loop is therefore: cut past the edge, read which question broke, restore only
for that question, re-run. Each cycle raises the floor and narrows the
interval; a run that reverts to its last green state instead has thrown away
the information it just paid for.

## The result is a pair, not a state

Report the last-failing state alongside the first-passing one. The passing
state alone is what every other tool already produces and is exactly the
artifact that cannot distinguish a hard-won bound from a timid one. The pair
is also what makes the reduction figure meaningful: a "half the size" claim
carries the suite it was bounded against and the screen that suite survived
([_laws:
count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

## Screen the suite first — the order is not optional

This technique inherits its entire authority from the suite it pushes
against, which makes it dangerous in exactly one way: run against
undiscriminating scenarios, the overshoot finds a **phantom bound**. The
agent deletes nearly everything, the questions still pass — because the
candidate could always answer them unaided — and the run reports a
spectacular reduction that destroyed the material and measured nothing. The
failure is loud in the numbers and silent in the verdict, which is the worst
combination available.

Run [unaided-baseline-screening](./unaided-baseline-screening.md) first,
always. A screened suite makes the bound real; an unscreened one makes it
theatre, and the more aggressive the optimizer the more convincing the
theatre.

## An unreachable failure is itself a finding

A run that cannot make anything fail, however hard it pushes, has learned
something and must not report it as completion. Two causes, and they are
distinguished by one cheap probe: seed a change known to be destructive and
re-run. If the suite still passes, the suite is inert and the optimization
result is void. If it goes red, the input was already at or near minimal and
the run is honestly finished — which is a legitimate and reportable outcome,
distinct from a run that simply never tried.

## Where it applies, and where the overshoot must not happen in place

The shape fits any reduction whose objective is monotone in a resource and
whose only frontier detector is the suite: shrinking a standing context
layer, pruning a dependency set, tightening a permission scope, lowering a
latency or spend ceiling, cutting a retained history window. It fits badly
wherever a failure has cost outside the run. A deliberate red against
production traffic, a destructive migration, or anything with an external
side effect is not an experiment, and there the overshoot is performed
against a shadow copy or a mocked lane
([eval-economics](./eval-economics.md)) with only the restored state ever
reaching the live system.

## Boundary

The deterministic subject's negative control is the same move with the
unknowns swapped, and the two are worth holding apart. There, the system is
broken deliberately to prove a *test* is alive, and the system is restored
completely — the mutation is disposable and the test is the deliverable.
Here, the test is assumed alive (it was screened), the *reduction* is the
deliverable, and the restore is partial by design. One validates an
instrument; the other locates a frontier.
