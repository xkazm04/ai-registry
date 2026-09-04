---
layer: technique
type: technique
subject: guest-execution-bounding
technique: nested-liveness-ceilings
status: forged
laws: [limits-are-derived, absent-guard-is-loud]
shared_with: []
use_when: [one deadline is being asked to bound work at several different granularities at once, an inner bound can be defeated by work that never reaches its check, deciding the relationship between a per-item budget and a per-request ceiling, an operator raised one timeout and a different one now fires first]
---

# Nested liveness ceilings

## The concern

A host that bounds foreign work from outside is tempted to write one number: the
deadline. One number is wrong, and the reason is not caution - it is that the work has
several nested granularities and each one can defeat the bound at the granularity below
it.

Take a unit of guest work that loads and evaluates several independent sub-units. A
per-sub-unit budget bounds each one, and a guest that presents a thousand sub-units,
each finishing just inside its budget, has run for a thousand budgets while never
breaching one. Add a bound over the whole phase and that guest is stopped - but the
phase bound is itself inside a request the host answered, and a guest that gets the
phase to end and then schedules more work has escaped again. Each escape is closed by a
bound at the granularity above, and there is no single granularity at which one number
closes all of them.

So the design is a **ladder**: several ceilings at increasing granularity, each one
existing specifically because the one below it can be defeated, and each one derived
from the one below rather than picked
([limits-are-derived](../../../../_laws.md#limits-are-derived)).

## Write down what defeats each rung

The ladder is only maintainable if every rung records the escape it closes. Without
that, the numbers read as redundant caution, and the first person to simplify deletes
the rung whose escape they could not see. A representative ladder, innermost first:

- **The per-sub-unit budget.** Closes: one non-essential sub-unit stalling the whole
  unit. Defeated by: many sub-units, each inside budget.
- **The phase ceiling** over all sub-units together. Closes: the accumulation above.
  Defeated by: work scheduled after the phase ends, or work that never reaches a check
  because it is one synchronous call.
- **The per-request ceiling**, armed by the dispatcher around the whole request.
  Closes: everything inside the request, including the synchronous call the phase
  ceiling could not observe. Defeated by: nothing inside the request - but it is a
  bound the host arms, so it fails if the host's own bounding path is what wedged.
- **The process deadline**, as an absolute backstop. Closes: the host's own bounding
  path failing. Defeated by: nothing short of the machine.

Each rung is a strictly larger scope than the one below and therefore must be a strictly
larger number. The ordering is a real invariant, and getting it backwards is the common
misconfiguration: an operator who raises the inner budget to accommodate a heavy
workload, and does not raise the outer ceiling, has produced a system where the outer
ceiling always fires first, the inner budget never does, and the diagnostic that told
them *which* sub-unit was slow is gone. Where the rungs are operator-tunable, either
derive the outer from the inner at startup, or check the ordering at startup and refuse
to run - a ladder whose ordering is a documentation convention is a ladder that will be
inverted ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The outermost rung is armed by whoever the guest cannot reach

The rungs differ in one property beyond scope, and it decides where the outermost one
lives: **who arms it.** An inner budget is armed by the code running the work, which
means a guest that wedges that code has also disabled its own bound. The outermost rung
must therefore be armed by a component the guest's execution cannot reach - a dispatcher
that hands work off and returns, a supervisor process, the operating system.

This is why the ladder does not collapse into "just use the biggest number". The biggest
number arms in the same place as the smallest one, and inherits the same single point of
failure. The ladder's value is partly the granularity and partly the fact that its top
rung is armed somewhere else.

## Report which rung fired

Every rung produces the same observable - work stopped early - and merging them into one
error class throws away the only information that makes the ladder actionable. A phase
ceiling firing means the guest is doing too much in aggregate; a per-sub-unit budget
firing names the sub-unit; a process deadline firing means the host's own bounding is
broken and is an operational emergency, not a guest problem. Name the rung in the
outcome, and the operator's next move follows from the name.

## Decision rules

- Build a ladder, not a number, whenever the guest's work has nested granularities the
  host can distinguish; one ceiling closes exactly one escape.
- Beside every rung, write the escape it closes and what defeats it. A rung with no
  recorded escape will be deleted as redundant by the next reader, correctly, because
  nobody can tell it is not.
- Keep the rungs strictly ordered by scope and enforce the ordering at startup, deriving
  the outer from the inner where you can. An inverted ladder still bounds the work and
  silently destroys the diagnostic.
- Arm the outermost rung from a component the guest cannot wedge. A ceiling armed by the
  code the guest is hanging is not a backstop.
- Put the rung's name in the outcome, because the operator's response differs completely
  by rung, and a shared error class erases the difference.

## When not to use it

Work with one granularity needs one ceiling, and a ladder over it is ceremony: a single
foreign call that either returns or does not has no inner rung to defeat. A host whose
guest work is already isolated per unit in its own killable process has the process
boundary as its outer rung and rarely needs more than one rung inside it. And where
every rung would be armed in the same place by the same code, the ladder has no top and
is better replaced by one honest number plus the admission that the host cannot bound
its own bounding path.
