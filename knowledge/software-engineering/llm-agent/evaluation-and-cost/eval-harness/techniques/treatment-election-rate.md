---
layer: technique
type: technique
subject: eval-harness
technique: treatment-election-rate
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [the treatment in a paired run is a capability the candidate may decline, an aided arm shows no gain and nobody checked whether the aid was used, reporting a delta for a tool the model chooses on its own, a suite discards a scenario because both arms behaved identically]
---

# Treatment election rate

Every comparison mode in this subject assumes the treatment is *applied*. A
prompt variant is applied; a model swap is applied; a context window is
applied. But the most common treatment in agent evaluation is a **capability
offered to a candidate that decides for itself whether to use it** — a tool, a
retriever, a subagent, a skill. For those, the arms are not "with X" and
"without X". They are **"with X available"** and "without X", and the
difference between those two sentences is a quantity nobody measures by
default.

The quantity is the **election rate**: over the treatment arm's trials, how
many invoked the capability at all, and how often per trial. Without it, the
arm's result is ambiguous in a way that no amount of statistical care repairs.

## The ambiguity a null result hides

A treatment arm that matches its baseline supports two incompatible
diagnoses, and they prescribe opposite work:

- **The capability does not help.** It was reached for, it ran, and the
  trajectory was no better. The work is on the capability.
- **The capability was never reached for.** The candidate did not recognize
  the situation, the tool's description did not describe the situation, the
  name did not match the intent, or a cheaper habit won. The work is on the
  *affordance* — the schema, the description, the routing guidance — and the
  capability itself is untested.

A report of the delta alone cannot tell these apart, and the second is the
more common one, because a candidate's tool selection is a behaviour and
behaviours regress silently. A harness that publishes "no significant change"
over an arm that elected the treatment in a tenth of its trials has not
measured the treatment. It has measured a description.

So the election rate is a **precondition on the delta's meaning**, which makes
it part of the delta's predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
report trials-that-elected over trials-run, and calls per electing trial,
in the same table as the effect. A published paired report doing this
correctly reads `300 / 300 (100.00%)` with `989` total calls — three per
trial — and only against that line is its 37% token reduction a statement
about retrieval rather than about a tool description.

## Full election is a finding too, not a formality

The rate is worth reporting at both extremes. At the bottom it invalidates the
delta. At the top — every trial elected, every time — it says the affordance
is doing its job and the measured effect is the capability's own, which is
exactly the claim the report wants to make and cannot otherwise support.

The middle is the interesting band and the one that needs a second number:
when election is partial, the arm is a **mixture** of two populations, and its
aggregate is a weighted average of "used it" and "did not". Report the arm
split by election before reporting its mean, or the headline describes a
population that does not exist. This is the collapsed-margin defect from
[comparison-modes](./comparison-modes.md) reappearing along an axis that is
not a coordinate of the matrix — the candidate's own choice — and it is
invisible to a design that only varies what the harness controls.

## Where this corrects the deprivation screen

[unaided-baseline-screening](./unaided-baseline-screening.md) discards any
scenario the deprived candidate satisfies, on the grounds that a question the
candidate can answer with the material withheld could never have
discriminated. That rule is right, and against an electable treatment it has
one false positive worth naming: a scenario where the **aided** arm never
elected the capability produces two identical arms and is discarded as
undiscriminating — when what actually happened is that the scenario was a
perfectly good discriminator and the candidate declined to use its
instrument.

The screen cannot see the difference because it reads only the scores. The
election rate can, and it is the cheap disambiguator: a discarded scenario
whose aided arm shows zero elections is not a bad scenario, it is a routing
failure, and it belongs in a different bucket with different remedial work.
Screen on the deprived arm's success *and* the aided arm's election, and keep
the two rejection reasons apart. A suite that folds them together loses
precisely the scenarios that would have exposed a capability the candidate
cannot find.

## What this cannot do

An election rate counts invocations; it says nothing about whether they were
*good* invocations. A candidate that calls the tool on every trial with a
malformed or irrelevant query elects at 100% and still measures the
affordance rather than the capability. The rate rules out one confound — the
untested treatment — and rules in nothing. Where invocation quality is itself
in question, the trajectory is the object to read, not the count
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the
per-trial call distribution is the cheapest first look: an arm averaging one
call per trial and an arm averaging fifteen are using the same capability in
two different ways, whatever their identical election rates say.
