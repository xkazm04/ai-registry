---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: update-order-and-frame-coherence
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a generated system reads state another system writes in the same step, a defect reproduces only sometimes and only after an unrelated change, deciding whether a behaviour needs a read copy and a write copy, making a simulation reproducible for replay or regression]
---

# Update order and frame coherence

The named concern: make a step's result independent of the order its participants happened
to be visited in, and make each quantity's value at any point in the step unambiguous. The
defect this prevents is the one that passes every test, survives review, and appears in the
field after somebody adds an entry to a collection — because the addition changed an
iteration order that the behaviour was silently depending on.

## The phase discipline

A step is a declared sequence of phases, and every participant runs the same phase before
any participant runs the next. The minimal useful sequence is three: gather inputs and
sense the world, decide and compute, then apply. Within a phase, one quantity has exactly
one writer; readers of that quantity in the same phase read its value from the *previous*
step, not from whatever the writer has managed so far.

Two rules keep that from decaying.

**Structural mutation is deferred to a drain.** Spawning, destroying, re-parenting and
re-registering do not happen inside the iteration that provoked them. They are appended to
a pending list and applied at a drain point after the iteration completes. This costs one
list and removes an entire family of defects: iterator invalidation, a participant visited
twice, a participant that was destroyed but is still visited, and behaviour that differs
depending on whether the spawn landed before or after the visit cursor.

**Cross-participant reads are declared.** When a behaviour reads another participant's
mutable state during a step, the read either targets the previous step's value explicitly
or the two participants have a stated ordering relationship. What is forbidden is the
implicit read — reaching for a neighbour's current value and taking whatever is there,
which is order-dependent by construction and correct by luck.

## Read copy and write copy, and its price

When two participants genuinely depend on each other's previous value within one step, the
shape that buys correctness is two copies of the quantity: everyone reads the read copy,
everyone writes the write copy, and the two are swapped once at the end of the step. The
result is order-independent by construction, which is exactly the property that was
missing.

It is not free and the price is worth stating, because it is the reason this is not the
default for everything. It doubles the storage for the quantity. It introduces a
one-step-stale read, which is correct here and is a bug anywhere the semantics wanted
*current*. And the swap is a single point that, if missed on one code path, produces a
value that is permanently one step behind — a symptom that reads as sluggishness or as
input lag and almost never as the memory-management defect it is.

Adopt it where mutual dependence is real. Where the dependency is one-directional, an
ordered phase is cheaper and clearer, and a declared order is easier to read than a swap.

## Recompute, or cache with an invalidation flag

The other coherence question is a value that is expensive to derive and read more often
than its inputs change. Caching it buys the saved work and costs exactly one obligation:
every path that mutates an input marks the cached value dirty. The obligation is total, and
the one mutation path that forgets is the bug — a stale value that is correct almost all the
time, which is the hardest kind to notice.

The rule that keeps this honest is that the flag is set by the *setter*, structurally, not
by convention. When every write to an input goes through one accessor that marks the flag,
the obligation is discharged once. When writes go directly to fields and each site is
expected to remember, the obligation is discharged never. If the design cannot route the
writes through one place, recompute instead and take the cost — a slow correct value beats
a fast one that is sometimes a lie.

## Two clocks, and the basis a quantity carries

A simulation step and a displayed frame are different clocks and must not be conflated.
Simulation advanced by whatever interval the last frame happened to take will produce
different outcomes on different hardware, and the difference is not subtle: integration
error, collision tunnelling at low frame rates, and tuning values that quietly mean
something else on a faster machine.

The discipline is to advance the simulation in fixed increments, accumulating elapsed real
time and consuming it in whole steps, and to interpolate for display between the last two
simulated states. Every rate a designer tunes then carries its basis explicitly: per second
of simulated time, per step, or per frame — three different things that are numerically
identical only at one frame rate and diverge everywhere else. A rate handed across a
boundary without that basis is not a number, and the failure is silent because it looks
correct on the machine it was tuned on.

Cap the number of steps consumed per frame. Without a cap, a machine that falls behind
consumes more steps to catch up, which takes longer, which puts it further behind — the
spiral is a hang, and it appears first on exactly the low-end hardware nobody is testing on.

## Reproducibility as an acceptance condition

A system intended to be replayed, networked deterministically or regression-tested must
produce identical output from identical input. Three things break that, and all three are
things a generator emits without noticing: reading a wall clock inside the update path,
drawing from an unseeded random source, and iterating a container whose order is not
guaranteed — a hash-ordered collection is the usual culprit, and its order can change
between runs, between builds and between platforms.

The check is a procedure rather than an inspection: run the same input twice, compare the
resulting state, and treat any difference as a defect with a locatable cause. A system that
has never been run twice on the same input has not been shown to be deterministic, however
carefully it was written.

## Decision rules

- **When two systems write the same quantity, that is the defect — fix the ownership, not
  the order.** Ordering around a shared writer produces a rule nobody can state and every
  future change breaks. One quantity, one owning writer, everything else adapts into it.
- **When a behaviour reads a neighbour's mutable state in the same step, either declare the
  ordering or read the previous value.** Never take the current value implicitly.
- **When a mutation is provoked during an iteration, defer it to a drain.** No exceptions for
  "this one is safe": the safety is a property of today's container, not of the code.
- **When a cached value's inputs cannot all be routed through one setter, do not cache.**
- **When a tuned rate crosses a boundary, it carries its time basis.** Per-step and
  per-second are not interchangeable and the mistake is invisible at the tuning frame rate.
- **When a system claims determinism, prove it by running it twice and diffing.** An
  unrepeated run is an anecdote about one execution.

## When not to use this

- **On behaviour with no cross-participant reads and no span.** A self-contained per-instance
  update that touches nothing else is already order-independent, and adding phases to it is
  ceremony.
- **On presentation-only state.** Visual smoothing, cosmetic timers and interpolation live on
  the frame clock deliberately and are supposed to vary with it. Applying fixed-step
  discipline there produces motion that is technically reproducible and looks worse.
- **As a substitute for an ownership decision.** Elaborate phase ordering imposed on a design
  where two systems both believe they own a value hides the real defect and makes it more
  expensive to find later.
