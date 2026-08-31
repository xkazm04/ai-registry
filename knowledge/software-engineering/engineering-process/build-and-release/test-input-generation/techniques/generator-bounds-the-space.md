---
layer: technique
type: technique
subject: test-input-generation
technique: generator-bounds-the-space
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a randomized test has run a long time without finding anything, a defect escaped the suite and was found elsewhere, reviewing a generator that produces realistic structured inputs]
---

# The generator bounds the space

A randomized test makes a claim of the form "this behaviour held across many
inputs." The claim is true and it is not the claim anyone reads it as. What it
actually says is *this behaviour held across many inputs **that this generator
can produce***, and the second clause is where the coverage lives. The
generator is not test scaffolding; it is the specification of what the suite is
allowed to discover, and it is usually the least-reviewed file in the tree.

## Why the failure is silent

Passing is spelled identically in two very different states: the path was
exercised heavily and held, or the path was never reached. Nothing in the
report separates them, which is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
in its input-side form — and the check only ever observed what the generator
handed it, never the system entire
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The trap has an unintuitive gradient: **the risk rises with the sophistication
of the generator.** A crude generator is obviously crude, and nobody extends
much trust to it. A generator that builds well-formed, schema-respecting,
realistic scenarios earns real confidence — and every constraint it applies to
achieve that realism removes a dimension from the reachable space, permanently
and invisibly. Realism and reach are in tension, and the tension is never
recorded anywhere a reader would look.

The canonical shape, worth holding in mind because it recurs: a generator
emitted structured queries whose target fields shared a common prefix. That was
a reasonable choice for realism. It also meant the objects matching any query
were contiguous in every index, which meant the indexes were always in sync,
which meant the reconciliation path that runs when they are *not* in sync was
never once executed. The suite ran continuously for months and reported green.
The defect was found by an external checker with an independent model, and the
repair to the generator was to make it **less** clever: emit unstructured
random objects and unstructured random queries. The bug then reproduced
immediately.

## The procedure

The discipline is a question asked of the generator rather than of the code,
and it is answered by enumeration rather than by reasoning.

1. **Write down what the generator cannot produce.** Read it as an adversary
   would, listing the constraints it imposes: fields it always correlates,
   orderings it never emits, magnitudes it caps, sequences it never
   interleaves, states it can only reach in one order. Every entry is a
   behaviour the suite has never tested. This list is the artifact; produce it
   in writing, because "the generator is fairly thorough" is exactly the belief
   that survives a month of green.
2. **Map each constraint to the code it hides.** Not every deleted dimension
   matters. A constraint is dangerous when a real code path is conditioned on
   the thing it removes — most often a reconciliation, repair, retry, eviction
   or resize path, since those are precisely the paths that only run when
   something is *not* in its usual state.
3. **Attack the constraints, not the runtime.** The reflex on a fruitless
   fuzzer is to run it longer or on more machines. That buys more samples from
   the same space and cannot reach what the generator excludes. Adding a
   dimension back is worth more than any multiple of runtime.
4. **Instrument reachability rather than inferring it.** Assert that the
   interesting states actually occur — count how often the generator produced
   an out-of-sync pair, an empty batch, a maximum-size record — and fail the
   run when a required state was never reached. A generator that stops
   producing an important shape after a refactor is otherwise indistinguishable
   from a generator that still does.

## The signal that should trigger this

**A long-running randomized test that has stopped finding defects is evidence
about the generator at least as much as about the code.** The comfortable
reading is that the system is now correct; the competing reading is that the
generator saturated its reachable space weeks ago and has been resampling it
since. The two are distinguished only by step 1, and the comfortable reading is
the one that gets adopted by default because it requires no work.

The second trigger is any defect found by something other than the suite — a
production incident, an external checker, a different team's tooling. Before
fixing the defect, ask why the generator could not produce the input that
caused it. The answer is usually a constraint nobody knew was there, and it is
almost never unique to that one bug.

## When a constrained generator is correct

This technique argues against *unexamined* constraints, not against all of
them, and applying it as "generators should be dumb" is a misreading that costs
real coverage.

- **A deliberately narrow generator, scoped and named**, is a good instrument.
  A generator that only produces inputs near a boundary is doing its job;
  the requirement is that its narrowness is stated and that some *other*
  generator covers what it excludes.
- **Where the valid space is structured, construction is mandatory** and the
  resulting constraints are unavoidable — see
  [negative-space-generation](./negative-space-generation.md). The answer there
  is a portfolio of generators with complementary blind spots, not one
  unconstrained generator, which would produce nothing usable.
- **Constraints that encode a genuine invariant of the domain** — an identifier
  that truly cannot be negative — cost nothing, because the excluded inputs
  correspond to no reachable state.

The distinction throughout is between a constraint that is *known and paid
for* and one that is *inherited from a convenience nobody revisited*. The first
is design; the second is the whole failure.
