---
layer: technique
type: technique
subject: invariant-placement
technique: repairing-check-erases-its-evidence
status: forged
laws: [failure-not-empty-success, count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [a guard repairs a value instead of refusing it, deciding what a test may assert about a clamped or saturating output, a defensive clamp has never fired and nobody can prove it, an assertion is written over the range a value is coerced into, choosing between refusing and coercing at the call-site altitude]
---

# A repairing check erases its own evidence

## The concern

The call-site altitude has two postures, and this subject's table describes only
one of them. A check at the point of use can **refuse** - raise, return an error,
stop - and then a violation looks like a failure at run time, which is what makes
that altitude expensive to hold but at least legible. Or it can **repair**: clamp
the value into range, saturate it at a bound, coerce it to a default, swallow the
odd case and continue.

A repairing check is not a weaker refusal. It has a different failure signature,
and the difference is the whole technique:

> A refusing check converts an invalid state into a signal. A repairing check
> converts an invalid state into a **valid** one - and in doing so destroys the
> only evidence that the state occurred.

Everything downstream then sees a legal value. Every assertion written over the
legal range passes. Every type holds. The repair is simultaneously the fix and
the erasure of the fact that a fix was needed, which is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
with the instrument present and looking directly at it.

## The assertion cannot be written over the repaired range

This is where the class actually bites, and it is a one-character defect.

A routine documents a half-open contract - a fraction in `[0, 1)`, a count below
a ceiling, an identifier under a length - and repairs out-of-contract inputs by
clamping to the bound. The test that guards it then asserts the output is *in
range*. If that assertion is written with the bound **included**, it is not a
weaker test than the contract; it is a test the contract's own violation
satisfies. The clamp produces exactly the bound, the assertion admits exactly the
bound, and the suite is green for the one output the documentation forbids.

The tell is mechanical and worth grepping for: **a contract stated as half-open
and an assertion stated as closed, over the same quantity.** Where the two
disagree, the assertion is describing the clamp rather than the contract.

The second tell is a clamp that has never fired. A repair placed against a
condition that cannot currently occur is dead code that looks like caution, and
it stays dead until an unrelated change upstream of it makes the condition
reachable. At that moment the clamp starts absorbing the change silently -
which is the behaviour it was added for, and also the reason nobody notices the
change happened.

## What to assert instead

The repair needs an observable that is not the repaired value, because the
repaired value is by construction indistinguishable from a correct one. In
descending order of strength:

- **Assert the pre-repair value against the contract.** The guard keeps
  repairing in production; the test checks the value that arrived at it. This is
  the only form that tests the contract rather than the clamp, and it usually
  costs one extra return or one test-visible seam.
- **Assert the repair did not fire**, by counting firings and asserting the count
  is zero over a deterministic input set. A count with no stated population is
  not a measurement ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
  so the assertion names the input set it swept.
- **Assert the strict contract on the output** - the half-open bound, not the
  closed one. Weakest of the three, because it only catches the repair when the
  repair lands exactly on the bound, but it is free and it is the one most often
  written wrongly.
- **Emit the firing rate as a metric** where the repair is legitimately expected
  to fire in production. A rate that moves is the signal; a rate that nobody
  emits is the state this technique is about.

## What makes the sweep necessary

A repairing check is usually placed against a *derived* quantity - a rounded
value, a ratio, a width computed from something two layers away - and whether it
fires is decided by that derivation, not by the input the test varies. So the
input set a test sweeps and the value space the repair partitions are different
spaces, and covering the first says nothing about the second.

The discipline: identify the quantity the repair actually compares, and sweep
*that*. Where it cannot be reached directly, sweep the configuration axis it is
derived from, across every value - not a representative one, because
"representative" is chosen from the same intuition that missed the case.

## Decision rules

- Treat repair and refusal as different placements, not as strong and weak
  versions of one. Choosing repair is choosing to have no failure signal, and
  that choice needs the observable below rather than being made by default.
- Never let a test assert the range the value is repaired *into*. Assert the
  contract, the pre-repair value, or the firing count.
- Where the contract is half-open, write the assertion half-open. A closed
  assertion over a half-open contract is the defect, not a rounding of it.
- A repair that has never fired is unproven, not safe. Prove it with a seeded
  violation the way a gate is proven alive
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), or delete it
  and let the condition refuse.
- Sweep the quantity the repair compares, not the parameter the caller varies.

## The neighbouring rule in another bundle, and the discriminator

A different bundle carries a cap technique whose law requires every cap to
publish the population that hit it. That rule and this one look identical and are
not, and the discriminator is **whether the bound is the intent**:

- Where the cap **is** the designed rule - a score component deliberately
  saturated so more activity stops paying - firing is correct behaviour, the
  population is published so a reader can see the metric saturated, and nothing
  is wrong when the number is large.
- Where the clamp is a **defensive repair**, firing means an upstream contract
  was violated. The population is not context for a reader, it is a defect count,
  and the correct expectation in a deterministic test is **zero**.

Same mechanism, opposite reading of a non-zero number. State which one a given
bound is, beside it, because the code looks the same either way.

## When not to use it

Where the repair is the specified behaviour of the interface - a saturating
arithmetic type, a parser that documents its coercions, a renderer that clips -
the coercion is the contract and there is no erased evidence, because nothing was
violated. The technique applies to a bound placed *defensively*, against a state
the surrounding code believes cannot occur. If nobody can say which state the
repair defends against, that question is the finding, and it is upstream of any
assertion.
