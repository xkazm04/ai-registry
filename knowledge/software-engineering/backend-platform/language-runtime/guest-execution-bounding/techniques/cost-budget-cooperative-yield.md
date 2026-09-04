---
layer: technique
type: technique
subject: guest-execution-bounding
technique: cost-budget-cooperative-yield
status: forged
laws: [limits-are-derived]
shared_with: []
use_when: [a guest evaluation runs inside a host's single-threaded executor beside timers and other tasks, one long script must not starve the host's other work and threads are not available, the blocking evaluation path must stay as fast as it was before yielding existed, choosing the unit a yield budget is measured in]
---

# Cost-budget cooperative yield

## The concern

An embedded interpreter is usually driven from a host executor that owns one thread
and many tasks: the guest's own evaluation, the jobs the guest enqueued, the host's
timers, the host's own work. Nothing pre-empts a task on that executor; a task runs
until it returns. A guest script that runs for a second has therefore held every
other task for a second, and a guest loop that never ends has ended the executor. The
technique makes the interpreter a cooperative citizen of that executor: it yields, on
its own, at a point it chooses, often enough that no other task waits long, and
without the guest observing that anything happened.

## A static cost per instruction, a budget per run

Every instruction the interpreter defines declares a **cost** - a small integer, fixed
at build time, that ranks instructions by how much work they do relative to each
other. A register move costs little; a call, a property lookup through a prototype
chain, an iterator step cost more. The number is a weight, not a cycle count, and the
design says so: nobody can state how many processor cycles an instruction takes on a
machine they have not seen, but everyone can say that a call is more than a move.

The yielding run loop takes a **budget** - an integer in the same units - and on every
dispatch subtracts the instruction's cost from it, saturating at zero. When the budget
reaches zero the loop refills it to its starting value and yields once to the
executor. Yielding is a single suspension: the loop registers itself as ready to
resume and returns control; the executor runs whatever else is ready and comes back.
The guest's state is untouched - frame, registers, program counter all sit where they
were - and resumption is the next iteration of the same loop. Nothing is thrown,
nothing is caught, nothing is visible from the guest.

The reason the budget is measured in cost rather than in time is determinism. A yield
that arrives after the same instructions on every machine can be tested: a harness can
assert that a given script yields a given number of times. A yield driven by a wall
clock arrives at different instructions on different machines and never at the same one
twice, and the first flaky test blames the scheduler. Cost also composes with the other
counters this subject owns: it is the same unit an instruction budget for termination
would use, and an embedder that has benchmarked one has a number for the other.

## Two dispatch tables, so the blocking path pays nothing

The interpreter has two run loops: the blocking loop the host calls when it wants a
result now, and the yielding loop the host calls from inside its executor. Only the
second decrements a budget. The naive implementation gives the loop one dispatch table
and one branch - *is there a budget? then decrement* - on every instruction; the branch
is cheap and predictable and it is still a cost paid by every instruction of every
blocking evaluation for a feature that evaluation does not use, and on a hot dispatch
loop "cheap" is measured in percent.

The rule is to generate **two dispatch tables from the one instruction definition**.
The first table's handlers decode operands, advance the program counter and execute.
The second table's handlers subtract the cost from a budget passed by reference and
then do exactly the same work, and the generator that emits both is the same macro or
template that defines the instruction, so the two cannot drift. The blocking loop
indexes the first table; the yielding loop indexes the second; the choice is made once
per evaluation, outside the loop, and not once per instruction. The cost of the whole
mechanism on the blocking path is one more table in the binary.

## The default is a starting point, and the caveat travels with it

The budget has a default so that the host can call the yielding loop without thinking,
and the default is a number in the low hundreds of cost units - small enough that a
script yields many times per millisecond, large enough that the yield itself is not
the dominant cost. Two things must be said beside it. The first is that it is
derived: from a cost model whose weights were set by judgment and refined by benchmark,
and a host with different latency needs is expected to benchmark its own budget rather
than trust the default ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
The second is the caveat that the unit is not a clock cycle, restated wherever the
budget is exposed, because an embedder who reads "256 cycles" will set it to a number
meant for a different unit.

## Decision rules

- When a host drives the interpreter from a single-threaded executor, evaluate through
  the yielding loop, because a blocking evaluation on that executor is a stall of every
  other task for the script's whole duration.
- When the host wants a result now and owns the thread, evaluate through the blocking
  loop, because the yielding loop's budget arithmetic is a cost with no consumer there.
- Measure the budget in instruction cost, never in wall time, because a cost budget
  yields at the same instruction on every machine and a clock does not.
- Generate the budgeted handlers from the same definition as the unbudgeted ones, so
  that adding an instruction adds it to both tables or to neither.
- Ship a default budget and say beside it that the unit is a relative weight, and that
  the embedder should benchmark; never present the number as a time.
- Never let the yield budget terminate: at zero it refills and continues. Termination
  is a different counter with a different outcome.

## When not to use it

A host that runs the interpreter on its own dedicated thread and blocks on the result
has no executor to yield to; the blocking loop is the whole design. A host whose
executor is pre-emptive - real threads, a scheduler that interrupts - does not need the
guest's cooperation and should not pay for the budget. And a host that wants the guest
to *stop*, not to share, wants the instruction budget or a runtime limit: this
technique guarantees that other tasks run, and guarantees nothing about when the guest
finishes.
