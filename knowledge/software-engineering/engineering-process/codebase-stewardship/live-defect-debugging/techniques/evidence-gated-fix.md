---
layer: technique
type: technique
subject: live-defect-debugging
technique: evidence-gated-fix
status: forged
laws: [silent-state-is-ungoverned, gate-sees-target]
shared_with: []
use_when: [an explanation of a defect feels certain and a patch is ready, deciding whether a read of the code is enough to act on, verifying that a fix worked, a first fix did not work]
---

# Evidence-gated fix

The rule is short: **a fix is applied only when evidence captured from the running
system confirms exactly one hypothesis.** Everything else in this technique is about
what that sentence excludes, what it admits, and why it is cheaper than it sounds.

## Why code alone does not clear the gate

A reader of source builds a model of what the program does and then reasons inside the
model. When the model is wrong, which is the situation in every defect nobody can see,
the reasoning is valid and the conclusion is false, and nothing inside the reasoning
reveals it. Worse, confidence does not track correctness: the explanation that is
wrong arrives with the same certainty as the one that is right, so a feeling of
certainty cannot be the gate
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)). An
agent's stated confidence is a property of its state, not a measurement of the system,
and it is admitted as nothing.

What clears the gate is a datum the system produced while it misbehaved, attributed to a
hypothesis by a probe that could have shown otherwise, and read against the verdict
rule in [hypothesis-mapped-probes](./hypothesis-mapped-probes.md). Exactly one
hypothesis confirmed means the others are rejected or inconclusive; two confirmed means
the evidence did not separate them, and the next move is a probe that does.

## Where a read counts as evidence

Some hypotheses are settled by looking, and insisting on a run for them is theatre. The
line is between a read of the artifact and a simulation of its execution.

- **A read is evidence when it observes a fact that no reasoning can change.** The type
  a field is declared with, the constant a limit is set to, the value a configuration
  file holds, the schema a table has, the version a dependency resolves to, the
  signature a function actually has. The question "does this say X" has a yes or no that
  the artifact itself provides, and a second reader gets the same answer.
- **A read is code-only reasoning when the conclusion needs the reader to execute the
  program in their head.** Which branch is taken, in what order callbacks fire, what the
  value is after three transformations, whether two paths can interleave. The artifact
  does not state the answer; the reader derives it, and the derivation is where the
  model errs.

The test to apply: if you could be wrong about this conclusion while reading every
character correctly, it is a simulation, and it takes a probe. A constant read
correctly is correct. A control flow read correctly can still be mispredicted. When in
doubt, instrument: the probe is nearly free, and a read misclassified as evidence is
the expensive mistake.

## Fixes fail often, and that is the design

The first fix of an unseen defect fails more often than it works, and the technique
does not try to prevent that; it prices it. A fix applied on evidence and found
insufficient costs a labelled run and teaches something definite: the confirmed
hypothesis was a contributing cause, or the evidence was incomplete. A fix applied on
a feeling and found insufficient costs the run and adds a guard that nothing proved, which
[revert-rejected-fixes](./revert-rejected-fixes.md) then has to find and remove. Iteration is
cheap, and an unproven fix is not. Taking another round with more data is the
expected, preferred route, and a loop that treats a failed fix as an embarrassment
will start skipping the gate to avoid having one.

## Verify on the same instrument

The fix is verified by the probes that diagnosed it. Run the confirmed reproduction
again into a fresh labelled sink ([run-scoped-evidence](./run-scoped-evidence.md)), and
cite lines from both runs: the value that was wrong, the value that is now right, and
the probes that should not have moved. A verification done by a different instrument,
or by "it seems to work now", checks a proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Where the verification
passes, the explanation to the owner is short: what the cause was, what changed, which
lines show it. The probes then come out by [the marker sweep](./marked-temporary-probes.md).

## What a fix may not be

A delay, a sleep, a retry loop wrapped round the symptom, or a timeout widened until the
failure stops happening is not a fix; it moves the failure in time and removes the
evidence of where it was. If the evidence says the cause is an ordering problem, the
repair is in the ordering: an event, a lifecycle hook, an explicit dependency. Keep the
change as small as the cause allows, and prefer the code's own existing patterns over a
new mechanism.

Once the defect is understood, a regression check that fails without the fix and
passes with it turns this one-time proof into a permanent one; see
[negative-control-tests](../../../build-and-release/test-harness/techniques/negative-control-tests.md)
for what makes such a check worth keeping.

## When not to use it

Not for a defect whose cause is visible in a single captured trace; there the trace is
the evidence and the loop adds nothing. Not for a cosmetic change whose effect you can
see directly on the artifact. The gate is for causes that must be inferred.
