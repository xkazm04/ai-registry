---
layer: technique
type: technique
subject: test-harness
technique: verification-inherits-driver-reach
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [publishing the result of a runtime verification lane, a verifier reports clean and the team concludes the code is sound, deciding what a green dynamic-analysis run is allowed to claim, pairing a coverage number with a verification result]
---

# A verifier certifies only what drove it

A dynamic verifier — a runtime checker for memory misuse, unsynchronised
access, invalid values, leaks — is **a lens on an execution, not a property of
a program**. It watches operations as they happen. Operations that do not
happen are not watched, are not reported, and are indistinguishable in the
output from operations that happened and were fine.

So the lane's reach is not the verifier's reach. It is the **driver's** reach:
whatever executed the program — a hand-written suite, a scenario script, a
recorded workload — determines the region the verifier could possibly have
looked at. Everything outside that region is unverified and renders as clean.

This is the same rule the generator-based subject states for randomised inputs:
the set of behaviours a randomized test can ever exercise is exactly the set
reachable from the inputs its generator can produce, and everything else is
untested and reports as passing — see
[test-input-generation](../../test-input-generation/test-input-generation.md).
That subject owns the case where the driver is a generator. This technique is
the identical rule where the driver is an ordinary suite somebody wrote by
hand, and it needs saying separately because a hand-written suite does not
*feel* like a sampling instrument. Nobody believes a random generator covers
everything. Everybody believes their own test suite does.

## Two numbers, published together

The claim a verification lane is entitled to make has two factors and the
report must carry both:

1. **What fraction of the subject the driving suite reaches**, by a named
   criterion over a named population.
2. **What the verifier said about that fraction.**

Either number alone overstates. A green verification run over a suite that
reaches forty percent of the code is a claim about forty percent of the code —
and it renders identically to a claim about all of it. The count travels with
its predicate or it is not a finding
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)),
and here the predicate is *the region the driver entered*, which the verifier's
own output has no way to state.

Symmetrically, a high coverage figure with no verifier behind it says the code
was reached, not that it behaved: reaching a line proves a test executed it,
not that it executed correctly. The two instruments answer complementary
questions — one finds code no test touches, the other finds misbehaviour in
code tests do touch — and neither substitutes for the other.

Practical shape:

- The verification lane's summary line states the driver and its measured
  reach, not just the verdict: *clean over the paths the unit suite reaches,
  which is N percent of the population by the stated criterion*.
- The reach figure comes from an instrumented run of **the same driver**. A
  coverage number produced by a different suite on a different lane is not the
  predicate for this verdict.
- Reach and verification are measured in **separate runs**. The instruments
  that count reach and the instruments that check behaviour both rewrite the
  artifact, and composing them in one build is the collision described in
  [isolation-lanes](./isolation-lanes.md).
- Where the driving suite deliberately excludes paths from the verification
  lane — because they are too slow under interpretation, or cross a boundary
  the verifier cannot enter — those exclusions belong in the published
  predicate, not in a configuration file nobody reads. An unstated exclusion
  turns a partial certificate into a total one at no cost to whoever wrote it
  ([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## Where the pairing understates

The rule holds for **trace-driven** verifiers — instruments that observe one
concrete execution at a time. It does not hold for the other kind.

An exhaustive checker over a bounded state space does not sample. Given a small
scenario, it enumerates every ordering the model permits — every interleaving,
every permitted observation — and its verdict covers all of them, not the one
that happened to occur. It is a model checker, not a stress test, and the
difference is categorical: the driver supplies the *scenario*, and the checker
supplies exhaustiveness over that scenario's state space.

For such a lane, pairing the verdict with the driving suite's reach
**understates the claim**, sometimes dramatically: a suite that reaches one
small module can yield a total statement about that module's behaviour under
every ordering, which is a far stronger result than "one execution of one
module was clean." Report it as what it is — exhaustive within the declared
scenario bound — and state the bound instead of the reach, because the bound is
now the predicate that limits the claim.

The two failure modes to avoid, one on each side: reading a trace-driven clean
result as exhaustive (the common error), and reading an exhaustive result as
merely one more clean run (the error that gets the expensive lane deleted for
not earning its cost).

## Decision rules

- Never publish a dynamic-verification verdict without the driver's measured
  reach beside it, and never publish reach alone as evidence of correctness.
- Measure the reach with the same driver, in a separate run from the
  verification.
- State exclusions in the published predicate, at the same altitude as the
  verdict.
- Before pairing, ask whether the verifier samples an execution or enumerates a
  bounded space. Trace-driven: pair with reach. Exhaustive: pair with the state
  bound.
- Treat a rise in the verifier's clean streak with no rise in reach as evidence
  about the driver, not about the code.
