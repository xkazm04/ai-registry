---
layer: technique
type: technique
subject: test-input-generation
technique: exhaustive-when-bounded
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [reaching for a randomized test by reflex, the input space may be small enough to enumerate, a suite cannot say whether it has finished covering a space]
---

# Exhaustive when bounded

Randomized generation is a **concession**. It is what you do when the input
space is too large to cover, accepting partial coverage and an unbounded
schedule in exchange for reach. The concession is frequently made against
spaces that did not require it, because "write a fuzzer" has become the reflex
for "test this thoroughly" and the size of the space is almost never computed
before the choice is made.

When the space is small enough to enumerate, enumeration dominates sampling on
every axis that matters:

- **It finds everything findable**, not most of it, and not the fraction the
  distribution happened to favour.
- **It terminates**, so the suite can assert that the space is *covered*. A
  randomized suite can only ever report that nothing turned up, which is the
  ambiguous result
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
  no defect found and no defect reachable look identical.
- **It has no seed**, so there is no reproduction problem, no flaky
  intermittent failure that appears once a fortnight, and no configuration to
  record alongside the failure.
- **Its result is a number with a predicate** — *n* cases, being the complete
  cross product of these dimensions
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
  rather than a runtime.

## Compute the bound before choosing

The rule is that the choice between enumerating and sampling is made against a
**written bound**, produced before either generator exists. This is a two-line
calculation and it is skipped almost universally.

1. **Enumerate the dimensions** — the operations, the variants, the bounded
   sequence lengths, the configuration flags that select paths.
2. **Write the product**, with the *real* limits rather than the type's limits.
   This is where the surprise lives: a sequence of up to six operations from a
   set of five is 19,530 cases, not an intractable space, and the factorial
   that reads as alarming at ten elements is trivial at the six the system
   actually supports. Systems have far smaller effective spaces than their
   types suggest, because the types are wide and the configurations are not.
3. **Compare against the lane's budget** — what the suite may spend per commit,
   per night, per release. The bound is not "small"; it is "small relative to
   the lane that will run it."
4. **Write the answer down beside the generator**, because it decays. A bound
   computed when the operation set had five members is wrong once it has nine,
   and nothing fails when it becomes wrong — the enumeration simply gets slower
   until somebody deletes it for being slow.

## The middle ground: bounded exhaustive generation

Most interesting spaces are unbounded in one dimension and small in the others,
and the answer is not to give up on enumeration but to **bound the large
dimension explicitly and enumerate everything within it**. Enumerate all
operation sequences up to length six rather than sampling sequences up to
length a thousand.

This trades an unbounded shallow search for a bounded complete one, and it is
usually the better trade, for a reason worth stating: defects that require a
long sequence to manifest are rarer than defects that require a *specific*
short one, and a sampled long sequence is overwhelmingly likely to be one of
the uninteresting ones. Completeness at small sizes is a strong result and it
is checkable.

It also produces the most useful failure a suite can hand a human: the
**smallest** input exhibiting the defect, found first, because the enumeration
proceeds in order of size. A randomized suite has to implement shrinking to
recover what enumeration gives away.

## Keeping both

Enumerating a bounded space and sampling beyond it are complements, and the
mature configuration runs both in different lanes: the exhaustive suite on
every commit, where its determinism and its termination are exactly what a fast
lane needs, and the randomized generator on a long lane where its unbounded
schedule is affordable. The exhaustive lane then serves a second purpose — it
is a control on the randomized one, since a defect the enumeration finds and
the fuzzer has been missing for a month is a direct measurement of the
generator's constraints.

## When not to use it

- **When the bound comes back large**, which the calculation will tell you
  honestly. Sampling is then the correct concession, made knowingly.
- **When the dimensions are continuous** — timings, sizes over a wide range,
  arbitrary payloads. Enumerate the structural dimensions and sample the
  continuous ones, rather than abandoning the technique for the whole input.
- **When the space is bounded but each case is expensive.** The product of
  cases and per-case cost is what must fit the lane; twenty thousand cases at
  ten milliseconds is a fast suite, and at four seconds it is not a suite at
  all.
- **When the enumeration would be over inputs the system never receives.** A
  complete cross product of a configuration space that only ever takes three
  real combinations is precision spent where nothing lives.
