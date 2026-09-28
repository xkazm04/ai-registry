---
layer: technique
type: technique
subject: test-input-generation
technique: proof-cost-follows-the-circuit
status: forged
laws: [count-carries-predicate, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a solver-backed check is being considered for a function whose input space is far too large to enumerate, deciding which functions a symbolic proof campaign should take on first, a symbolic proof returned no verdict and the next move is being chosen, a symbolic equivalence proof between two ports passed in milliseconds, a timeout from a prover is about to be recorded as a pass or a fail]
---

# Proof cost follows the circuit

[Exhaustive when bounded](./exhaustive-when-bounded.md) decides between
enumerating and sampling by writing down the size of the input space. That is
the right variable for a loop that visits every case. It is the wrong variable
for a **symbolic** check, where a solver takes the function as a formula and
covers every input at once. In a symbolic check, covering 2^64 or 2^512 inputs
costs nothing extra. The cost comes from the structure of the arithmetic that
the property makes the solver reason through.

The two cost models disagree in both directions, and each disagreement is
expensive:

- **A huge space can be free.** A property over 64-bit seeds, and an
  equivalence between two ports of a hash over 64 input bytes (2^512 inputs),
  were each proved in about 10 milliseconds. The written bound would have
  written them off and sent them to sampling.
- **A tiny space can be a wall.** A date round trip (civil date to day number
  and back) over a real domain of about 3.6 million dates (2^22) returned no
  verdict in 60 seconds. It returned none with the domain assumed to be 2^41
  wide either. A plain loop over the same 3.6 million dates finished in 35
  milliseconds. The size model would have called the proof cheap because the
  space was small.

Across nine real functions, the size model predicted which proofs would return
a verdict within the budget for 2 of the 9. Reading the arithmetic got 5 of the
9 right.

## Read the body, not the signature

Triage a proof target by the operations its property makes the solver relate.
The types of its inputs do not decide the cost.

- **Usually cheap:** comparisons, branches, xor, shifts, additions, one
  symbolic value multiplied by a constant, and loops of fixed length. The
  cheapest case of all is **two copies of the same circuit**. An equivalence
  proof between a faithful port and its original can collapse before any
  search starts.
- **Usually a wall:** a chain of divisions or remainders by large constants
  whose quotients the property has to relate to one another, as a round trip
  does. Inverting a mixing function is another wall: proving that a
  multiply-xorshift finisher is injective returned no verdict. So is a long
  chain of multiplies where each multiplicand carries every earlier input.

**This list is a starting prior, and it does not carry over between
engines.** A class table measured on one engine and applied unchanged to
another misjudged 4 of 9 targets:

- A remainder chain on a full 64-bit dividend proved in 11 seconds, because
  the property only bounded its outputs and never related its quotients.
- A false property built from a symbolic-times-symbolic product and a symbolic
  remainder produced a counterexample in 3 seconds.
- Narrowing the operands to literal narrow widths did not rescue the round
  trip, although the source engine reports that narrowing works there.
- Proving a finisher of constant multiplies injective walled, although
  multiplying by a constant is on the cheap list.

Treat any class table as a prior, and calibrate it on your own engine and
solver before a campaign relies on it. The rule that transfers is the negative
one: **the size of the space is not the cost variable.**

## Proving and refuting cost different amounts

The cost of reaching a verdict depends on the verdict's polarity as well as on
the circuit, in both directions:

- The faithful port's equivalence proved in 2 ms. The same port with the
  multiplier replaced by the textbook constant (the exact mistake the port's
  own comment warns about) was not refuted within 60 seconds at 16 input
  bytes. The same mutant was refuted in 0.4 s at 1 or 2 bytes and in 33 s at
  4 bytes, and it walled at 8.
- A false property went the other way: its counterexample arrived in 3 s,
  where a proof of a true property of the same shape would have been expected
  to wall.

So a millisecond proof between two ports is a **vacuity smell** until the
harness has also gone red. The positive control needs its own shape and its
own budget. It does not need the proof's full symbolic width. A mutant that
disagrees everywhere is refuted by one or two symbolic bytes, or by one
concrete input from an existing fixture list. That makes the concrete contract
fixtures the natural positive control, and the symbolic proof covers what
fixtures cannot. Name which instrument can fail before you report what the
other one proved
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Route each target by class

1. **Cheap on your engine:** prove it symbolically over the full domain,
   whatever its size. Add a mutant that the harness must refute, sized so that
   refuting it fits the budget.
2. **A wall, over a real domain small enough to enumerate:** enumerate that
   domain. This is [exhaustive when bounded](./exhaustive-when-bounded.md) doing
   its job, and here it beats the proof by more than three orders of magnitude
   on the same property.
3. **A wall, over a domain too wide to enumerate:** use symbolic spot proofs
   at the boundaries, plus a native differential run over millions of inputs.
   Record the result as *tested* and never as *proved*.

A verdict has to carry what it is modulo: the domain, the unwind or length
bound, any seams that were stubbed, the engine and the cap
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
wall is relative to its cap, so record the cap beside the wall: a retry with
more memory or another solver can turn a wall into a proof. **A timeout is
neither a pass nor a fail.** Record it as unknown, never as a green by default
or as a divergence
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## When not to use it

- **When no symbolic engine is in the toolchain.** Then enumeration and
  sampling are the only options, and the written bound decides between them.
- **When the property is about behaviour over time or across processes.**
  Solver cost for scheduling and state-space checks is a different question.
- **When a cost figure from one engine is about to be quoted for another.**
  Measure it again on the engine that will actually run the proof.
