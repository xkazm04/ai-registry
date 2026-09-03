---
layer: technique
type: technique
subject: module-design
technique: declarative-or-sequential
status: forged
laws: []
shared_with: []
use_when: [a reviewer is arguing that a loop should be a pipeline, choosing a form for code that produces several outputs in one pass, a declarative rewrite came out longer than what it replaced, a call chain interleaves pure steps with steps that touch the outside world]
---

# Declarative or sequential

Two forms are available for almost every unit of code that processes a
collection: a **declarative composition** — a chain of transformations, each
naming what it produces rather than how the iteration proceeds — and **explicit
sequential code**, a loop with named intermediate state. Teams treat the choice
as taste, which means it is settled by whoever cares most, and the result is a
codebase where the form varies by author rather than by problem.

It is not taste. The choice has a stated boundary, and the boundary is a
property of the computation.

## The rule

**Declarative composition wins for transformations through a pipeline**: one
input sequence, one output, each step a total function of the element in front
of it. The form is genuinely better there — it names the operations instead of
the bookkeeping, it composes, and the reader checks each step against its
neighbours rather than simulating an iteration in their head.

**Explicit sequential code wins in three conditions**, and each is a fact about
the computation rather than a preference:

1. **Multiple outputs being built in parallel.** One pass that fills several
   collections, or several collections and a running tally.
2. **Side effects mixed into the logic.** A branch that must notify, persist,
   or escalate as it classifies.
3. **Branch bodies are statements, not expressions.** The arms do genuinely
   different work rather than each producing a value of the same shape.

Where any of these holds, the declarative rewrite is available and is worse.
The measured judgment, from a rewrite done specifically to test the claim: the
declarative version was **longer**, **harder to read**, and **had mutation
anyway** — the accumulator had to be destructured and reassembled on every
step, so the form's headline benefit was surrendered while its costs were
kept. That is the shape to expect. A rewrite that satisfies a style preference
while reintroducing the thing the style forbids has bought nothing.

## The state machine is the sharpest case

Where the code advances an explicit state and each step's meaning depends on
which state it is in — a parser, a protocol handler, a negotiation — **no
declarative equivalent is cleaner, because the loop over an explicit state *is*
the natural expression of a state machine.** The sequence of states is the
algorithm, not an implementation detail of iterating over something.

This is worth stating because it is the case most likely to be attacked in
review: the loop is long, it mutates a variable, and it trips every heuristic a
reviewer has learned. The correct answer is that the heuristics were derived
from pipelines and do not transfer. What can be improved is whether the state
is *explicit* — a named value with an enumerated set of possibilities rather
than three booleans that encode it between them — and that is the review
comment worth making.

## The same discipline one level down: effects belong at the ends

The rule above places a whole unit. There is a smaller, fractal version of it
inside a single call chain, and it has a detector cheap enough to apply at
review speed.

**Within one chain, the steps that touch the outside world belong at the ends,
never interleaved with the pure ones.** A chain that loads, transforms,
persists, transforms again and notifies reads as one uniform sequence of
operations while behaving as five things of two different kinds: the reader
cannot tell which calls can fail, which have effects, or where the actual
transformation happens. Split it — the effectful bookends explicit and
sequential, the transformation a chain in the middle.

The detection signal, and it is mechanical: **read down the chain and mark each
step as touching the outside world or not; wherever two adjacent steps differ
on that mark and the chain continues past the change, the chain is doing two
jobs.** One transition (all pure, then all effectful, or the reverse) is a
normal shape. Two or more is the smell.

[io-free-core](./io-free-core.md) owns this discipline at *module* scale — the
logic as a transition function with one driver at the edge doing all the I/O —
and everything it says about why that separation pays applies here unchanged.
This technique adds only the scale and the detector: the same separation
holds inside a single expression, where no module boundary exists to enforce
it, and the review-time signal above is what finds it there.

## What this is not an argument about

Not performance. On a competent toolchain the two forms compile to
substantially the same work for the pipeline case, so "the loop is faster" is
not a reason to prefer it and "the chain allocates" is not a reason to prefer
the loop. If performance is genuinely the question, it is a measurement
question and it belongs with
[scoreable-designs-are-built-not-argued](./scoreable-designs-are-built-not-argued.md),
not with a style rule. The choice here is about what a reader must reconstruct.

## When not to use it

The rule inverts wherever **every step is effectful and the sequence is the
job** — a deployment routine, a migration, a shutdown path. There is no pure
core to separate out, the "effects at the ends" rule has nothing to sort, and
the honest form is a plain sequence of statements in order, with the ordering
constraints stated. Trying to impose a pipeline shape there produces a chain of
steps that all return the same context object, which is a loop wearing a
chain's clothes and strictly harder to read than the loop.

And do not read the three conditions as a licence to keep any loop that has one
of them incidentally. A loop that builds two outputs because somebody merged
two passes to save a traversal has *chosen* condition one, and splitting it back
into two pipelines is usually right. The conditions justify the form when they
are properties of the problem; when they are properties of a previous
optimisation, remove the optimisation first and then ask again.
