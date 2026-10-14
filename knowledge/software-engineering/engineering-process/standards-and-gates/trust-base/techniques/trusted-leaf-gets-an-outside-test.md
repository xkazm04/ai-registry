---
layer: technique
type: technique
subject: trust-base
technique: trusted-leaf-gets-an-outside-test
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [a function body is marked as trusted while its stated contract is consumed by proofs, a proof suite is green and the question is what would turn it red if a leaf changed, writing the test for a one-line trusted body]
---

# A trusted leaf gets an outside test

A body the checker is told to trust is the one place a change keeps every proof
green while altering what the model means. The checker consumes the leaf's
*stated contract* and never reads its body, so editing the body to filter on the
wrong value, key on the wrong field or shift a bound by one leaves every
downstream proof valid. This is worse than an ordinary untested function in
two ways. The leaf is usually an axiom: the definition of a term the whole
argument is built from, so one wrong line miscolours every theorem. And the
failure is invisible by construction, because the thing that would have noticed
was switched off for this body.

The remedy is not more proof, since proof is exactly what cannot reach it. It is
an **executable witness from outside the checker**: a property test that runs
the real body over generated input and compares it to an independent account of
the contract.

## The test, step by step

1. **Read the contract the checker consumes**, not the body and not the
   description. If the contract is two implications (every member of the input
   with property P appears in the result; everything in the result has property P),
   the test has two assertions, one per implication.
2. **Generate inputs in a form the body does not consume.** If the body walks a
   map, generate a list of entries and build the map in the test. Duplicate keys,
   empty input and all-one-class input must all be reachable by the generator.
3. **Assert each direction explicitly**, before any equality check. A forward
   violation (a member missing) and a backward violation (a stray member) are
   different bugs with different messages, and an equality assertion alone
   reports both as "not equal". Name the direction in the failure text.
4. **Add the whole-result comparison to an oracle** as the third assertion, not
   the first. It catches a defect in a part of the contract the two directions
   do not mention, such as multiplicity or order.
5. **Tie the test to the requirement the leaf grounds.** The leaf exists to make
   some stated property of the larger model true. Link the test to that
   requirement in whatever traceability mechanism the project has, so that
   deleting the test is a visible coverage loss and the reviewer of a change to
   the leaf is shown the requirement it carries.

## What makes the oracle independent

The tempting test asserts that the leaf's output equals the leaf's output run
again, or equals a second copy of the same loop. That test passes under every
mutation of the body, because the oracle and the subject move together. The
rule is that **a mutation of the body must be able to fail the test without a
matching mutation of the test.** Three conditions follow, from strongest to the
floor.

- **Different mechanism.** The oracle computes the answer another way: a
  brute-force filter against a sorted merge, a closed form against a loop, a
  reference model written from the specification. This is the target when the
  leaf is nontrivial.
- **Same data, different code.** When the leaf is one line and any other
  mechanism is a restatement of it, the oracle may traverse the same data
  structure, provided it shares no code with the body, calls none of its helpers
  and is written from the contract's wording rather than from the body's
  expression. A filter over the same map is acceptable at this level, because the
  body's possible mistakes (the wrong predicate, the wrong key, an off-by-one)
  are mistakes of *expression*, and a separately written expression will not
  repeat them.
- **The floor: the oracle is built from the generator's input, not from the
  structure under test.** The weakest oracle still derived from the input
  records is stronger than one derived from the output container, because the
  container is where the body's semantics live. Where the test's own setup applies
  a semantics (a later entry for a key wins), say so in a comment and, if the
  semantics matter, assert it once on a named example rather than hiding it in the
  generator.

Below the floor the test is a tautology. A test the author cannot imagine
failing is not evidence ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
so run it once against a deliberately wrong body to see it fail, and write the
mutation down or keep it as a named negative case.

## Decision rules

- **Every trusted body with an executable form gets this test**, unless it is
  wrapped around a foreign call whose result cannot be generated. For those, the
  outside witness is a recorded fixture, not a property.
- **Test the strongest contract the checker consumes**, not the one in the
  comment. The two diverge exactly when the contract was weakened for the proof's
  sake.
- **Scale the budget to the leaf's role.** The one leaf that defines a term for
  the whole model gets the explicit two-direction assertions and a named
  requirement. A leaf that merely converts one container to another may get an
  equality check against an oracle, because its contract is weaker and
  [what its callers read](./leaf-spec-states-what-callers-read.md) is smaller.
- **Keep the test in the ordinary test run, not the verifier's run.** The point
  is an observation made by a different instrument; folding it into the checker's
  lane loses the independence.

## When not to use it

- **When the body is proved.** A body the checker reads does not need an outside
  witness for the same property. Testing it anyway spends budget that belongs on
  the members the checker cannot read.
- **When the leaf has no executable form in the test environment**, such as a body
  depending on hardware or a service. Record it as trusted and unobserved, and
  document it with the discipline in
  [soundness-argument-names-its-dependencies](./soundness-argument-names-its-dependencies.md).
- **When the test is the only evidence offered for a property the contract states
  over unbounded input.** The test samples; it narrows doubt and proves nothing.
  Record the member as *tested*, never as *proved*.
