---
layer: technique
type: technique
subject: eval-harness
technique: unaided-baseline-screening
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [admitting a generated scenario into the suite, scores barely moved when the material under test was removed, a model upgrade landed and the suite quietly got easier]
---

# Unaided baseline screening

A scenario the candidate satisfies **without** the material under test is not
a weak scenario — it is not a scenario. Every score it contributes is honest
arithmetic over a question that could never have discriminated, and it enters
the suite by the front door: it was drawn from the source material, it reads
as a fair question, and it passes. The suite grows, the reported coverage
grows, and the measured quantity is the model's prior knowledge.

The screen is one comparison, run once per scenario before it is admitted:

> Run the scenario against a **deprived candidate** — same model, same
> harness, with the thing under test removed. Every scenario the deprived run
> satisfies is discarded. The residue is the suite.

Nothing else in this subject catches this.
[assertion-vs-judgment](./assertion-vs-judgment.md) polices *how* a property
is scored; [scenario-design](./scenario-design.md) polices what a scenario
contains and whether the exam drifts under it. Both assume the question is
capable of failing. A gate whose questions the candidate can answer with its
eyes closed has not seen its target
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)) — it saw the
model.

## What "deprived" means is the definition of what you claim to measure

The deprivation is not a fixed recipe; choosing it is the technique's real
work, because **whatever you withhold is exactly the claim the suite will
support.** Withhold the wrong thing and the screen certifies a different
measurement than the one being reported:

- Measuring whether *supplied context* carries knowledge → withhold the
  context, keep the question.
- Measuring whether a *tool* is being used → withhold the tool, keep
  everything else.
- Measuring whether an *instruction layer* changes behaviour → withhold that
  layer only, leaving the task envelope intact.
- Measuring whether a *retrieved passage set* is sufficient → withhold the
  passages, not the query.

Write the deprivation down next to the suite. A suite whose baseline is
undocumented cannot say what its numbers are about, and the next maintainer
will screen against a different deprivation and get a different set.

## Instructing the model to rely only on what it was given is not a control

The obvious cheap substitute — telling the candidate to answer only from the
supplied material — is worth doing and does not replace the screen. It is a
*request*, and a request reduces the leak without measuring it. A model that
already knows the answer cannot reliably tell which of its tokens came from
the context, and asking it to introspect on that produces a confident report
rather than a fact. The screen is a control because it changes an input and
observes an output; the instruction changes neither.

## When the material cannot be withheld, move the material

Some evaluations cannot deprive cleanly — the capability under test is
entangled with the task, or removing it produces a candidate so crippled that
the comparison is meaningless. The alternative is to move the *content* out
of the model's reach instead:

- **Post-cutoff material.** Facts that postdate the candidate's training.
  Cheap, representative, and self-expiring — the material stops being
  post-cutoff the moment the candidate is upgraded.
- **Synthetic material.** A fabricated system, described in ordinary
  vocabulary, with internally consistent specifics that exist nowhere. This
  is the strongest instrument available for the purpose, precisely because no
  prior can contain it, and its cost is stated rather than hidden: a
  fabricated subject is not drawn from the real distribution, so it measures
  fidelity of transfer and says nothing about whether real material is
  *typical* of it.

Both are ways of guaranteeing the deprived run would fail, rather than
checking that it does. Where the screen is affordable, prefer the screen.

## The screen expires with the candidate

A scenario's discriminating power is a property of the *pair* — scenario and
candidate — not of the scenario. A model upgrade can absorb into its prior
exactly the material a suite was built to test, and the visible symptom is a
suite that got easier without anyone changing it: scores rise, the trend line
reads as improvement, and the improvement is the instrument dissolving. This
puts the screen on the same footing as any other certificate in this subject
— it is a statement about a version and it lapses when the version changes
(see [certification-levels](./certification-levels.md)). Re-screen on
candidate upgrade, and treat a large drop in the surviving set as a finding
about the suite, not as good news.

## Report the yield, or the count is a rumour

Screening deletes scenarios, often most of them, and the deleted ones were
the ones that would have padded the number. A suite that extracted two dozen
candidate questions and admitted a handful has a handful, and every reported
figure carries which baseline it survived
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)):
"N scenarios, screened against a candidate deprived of X, on date D." The
pre-screen count is not coverage; it is intake.

The economics favour the screen without argument. One deprived run per
candidate scenario is paid once, at the cheapest tier that answers the
question, and it deletes scenarios that would otherwise be paid for on every
run of the suite forever — the same cheap-instrument-screens-the-expensive-one
logic as the rest of this subject's spend controls
([eval-economics](./eval-economics.md)).

## Boundary

Two neighbours run the same move on different unknowns, and confusing them
wastes the run. The deterministic subject's negative control breaks the
*system* to prove a *test* can fire — the instrument is the unknown. This
technique deprives the *candidate* to prove a *scenario* can fail — the
question is the unknown. The retrieval subject's lane ablation is this
technique applied to a component rather than a question: turn one lane off,
prove the lane earns its seat. All three answer "would this have gone red if
it should have?", which is why finding the third one missing is a good reason
to look for the other two.
