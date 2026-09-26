---
layer: technique
type: technique
subject: candidate-archetype-routing
technique: confidence-always-returned-with-a-review-threshold
status: forged
laws: [inference-must-look-like-inference, absence-of-evidence-is-not-evidence, no-adverse-outcome-is-solely-automated]
use_when: [designing the return type of a candidate classifier, deciding when a routing result needs human review, wiring confidence into a downstream branch]
shared_with: []
---

# Confidence always returned, with a review threshold

## The concern

A classifier that returns a class and nothing else has thrown away the only information
that distinguishes its reliable answers from its guesses, and the loss is invisible: the
marginal routing and the obvious one produce identical downstream behaviour, so the
system's worst decisions are indistinguishable from its best ones until somebody
complains.

The technique has two halves, and neither works alone. The classifier **always** returns
a confidence — same field, every path, including the degraded and failed paths. And a
**published threshold** turns that number into a branch: below it, the result is flagged
for human review. A confidence with no threshold is decoration; a threshold with no
confidence is not implementable.

## The procedure

1. **Make confidence part of the return type, not an optional extra.** Every path
   produces one: the signal-scored path, the self-declaration path, the contradiction-
   capped path, the degraded path, the total-failure path. A missing confidence must be
   impossible to express rather than merely discouraged.
2. **Define the tiers before you define the values.** In practice there are three or
   four that matter: the candidate told us; the documents strongly indicate; the
   documents weakly indicate; we could not determine. Fix the ordering of the tiers
   first, then assign numbers consistent with that ordering.
3. **Set a single low-confidence review threshold, published in the same declaration as
   the weights.** One number, one place, legible to the people accountable for it. A
   threshold that lives in code is a behaviour, not a policy. **Derive it, do not pick
   it.** Walk a labelled sample of real routings. For each candidate threshold, read the
   error rate among the routings above it against the share it sends to review, and
   publish the chosen number with its measured error. The score does not need to be a
   calibrated probability, since a reject threshold only needs a score that ranks right
   answers above wrong ones. But a bare number nobody measured is the decoration this
   technique exists to replace.
4. **Assert the three ordering invariants.** The unguided-default confidence sits
   strictly below the review threshold, so a routing that no evidence produced always
   trips review. The declaration tier sits above the threshold, so answering the
   question buys the candidate something. And no inference path can reach the
   declaration tier. The first two are properties of the configuration and belong in the
   loader. The third is a property of the formula: a winner's share of mass reads 1.0 on
   a single uncontradicted signal. Pin it with a test that routes one-signal profiles and
   asserts they land below the declaration tier. All three are the kind of thing a
   well-meaning retune breaks without noticing.
5. **Place the threshold between the inference tiers and the declaration tier**, so a
   document-derived classification for a marginal career lands under review while a
   candidate's own statement does not. Getting this wrong in either direction is
   expensive: too low and the review queue is empty and the mechanism is theatre; too
   high and the queue is everything and reviewers stop reading it.
6. **Wire the threshold to real consequences.** At minimum: a visible review flag on the
   candidate's record, exclusion from any unattended optimistic action, and inclusion in
   a queue somebody actually works.
7. **Never wire it to an adverse action.** Low confidence may withhold, flag and queue.
   It may not reject, at any value. The adverse route does not exist for a machine —
   [no adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)
   — and a confidence number must not become the back door that recreates it.
8. **Distinguish "low confidence" from "did not run".** They are different states, and
   the second must not be encoded as a low number. A classification step that failed
   produces an unmeasured state, not a weak measurement
   ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
9. **Monitor the distribution, not just the individual values.** The share of routings
   below the threshold is a health metric for the classifier. A rising share means the
   population has shifted or the signal table has gone stale. It is an output-side
   warning and not the earliest one. When an upstream extractor changes what a signal
   *means*, the confidence distribution can stay flat while routings go wrong, because
   classifiers stay confident under shift. Pair it with a check on the input signals'
   own distribution, and with a periodic labelled audit of routings that were
   *confidently* auto-routed. Nothing else looks at those.

## Decision rules

- **When the confidence is below the threshold, a human reviews before the routing has
  any irreversible consequence.** Not "eventually" — before. A review that arrives after
  the rubric ran and the shortlist was drawn is a record, not a control.
- **When a self-declaration is present, use the declaration tier and not the derived
  one**, unless a contradiction rule caps it. The provenance of the classification, not
  the strength of the signals, determines the tier.
- **When a run is degraded — a parse failed, a source was unavailable — return the class
  you can and a confidence that says the evidence was incomplete.** Do not emit a
  confident answer computed over a partial view; the missing evidence is exactly what
  would have changed it.
- **When confidence is displayed, display it as a property of the classifier.**
  [Inference must look like inference](../../../_laws.md#inference-must-look-like-inference):
  a self-reported certainty is evidence about the model, not about the person, and it
  must not be rendered in the visual grammar reserved for measurement — no score band,
  no percentage badge that reads like an assessment of the candidate.
- **When you are asked to lower the threshold because the queue is too big, do not do
  it quietly.** Lowering is the direction that shrinks a below-threshold queue. The
  queue size is a statement about the classifier or about intake volume, and moving
  the threshold changes only who stops being looked at. But "never" is the wrong answer
  too. A queue larger than the reviewers can read is not oversight. Workload is a
  measured driver of automation bias, and an overloaded reviewer rubber-stamps. Treat
  reviewer capacity as an input. Fix the signal table, add the intake question, or staff
  the queue first. If none of that closes the gap, re-derive the threshold from the
  labelled sample at the coverage the team can actually read, and publish the error rate
  that buys.
- **When a routing goes to review, show the reviewer the signals, not the verdict.**
  A reviewer who sees the machine's class first tends to confirm it, and more strongly
  when the class fits a stereotype. Present what fired, what contradicted, and what is
  missing. Record the reviewer's own reading before the machine's class is revealed. A
  near-zero override rate is evidence about the review, not about the classifier.
- **When two archetypes tie exactly, a deterministic tiebreak is fine for the class and
  fatal for the confidence.** Break the tie by a stable declaration order rather than by
  whatever the runtime's ordering happens to be — reproducibility matters — but the
  confidence must reflect the tie and trip the review threshold. The forbidden
  combination is a tiebreak that yields a confident answer.
- **When the fallback fires because no signal matched at all, mark that distinctly.** It
  carries the same low number as a contested routing and means the opposite thing: not a
  hard career to read, but an absent input — usually an upstream extraction failure. A
  marker in the returned reasons is enough, and it is what lets a monitor separate "our
  population got harder" from "the parser broke".

## What confidence must not become

Confidence is the most-abused number in a hiring system, because it looks like a
universal knob. Three uses to refuse outright:

- **As a score input.** Multiplying a fit score by a routing confidence produces a
  number that means nothing: it conflates "how well does this person match" with "how
  sure are we what kind of career they are having". Two different uncertainties, one
  meaningless product.
- **As a ranking key.** Sorting a shortlist by classification confidence ranks
  candidates by how conventional their career looks, which is a bias engine with a
  neutral name.
- **As a rejection trigger.** "We were not confident enough about them" is not a reason
  to end an application; it is a reason to look. This is the one that must be
  structurally impossible rather than merely forbidden — the adverse route should not
  accept a confidence argument at all.

## When NOT to use it

- **Not where the classification came from a documentary fact with a correct answer.** A
  verified qualification does not carry a confidence; it carries a verification. Adding
  a confidence to a fact invites a branch that treats a known thing as uncertain.
- **Not as the system's only uncertainty mechanism.** Confidence expresses "how sure am
  I of this class". It cannot express "I have no class at all" — that needs the unrouted
  state, which is a class, not a number. See the sibling technique on the conservative
  default.
- **Not aggregated into a fairness metric.** An average routing confidence is not a
  measurement of anything; a metric over a cohort needs its sample and its basis, and a
  mean of self-reported certainties has neither.
