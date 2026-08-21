---
layer: golden-path
type: golden-path
subject: selection-score-calibration
status: forged
use_when: [validating a screening score against real outcomes, building a calibration or reliability surface, moving a screening threshold, monitoring a deployed selection model]
techniques:
  - label-leakage-taxonomy
  - deterministic-holdout-clean-arm
  - reliability-bins-and-proper-scoring
  - base-rate-skill-score
  - outcome-axis-selection-advance-versus-hire
  - post-deployment-drift-monitoring
---

# Selection score calibration

Somewhere in every scaled hiring system there is a number attached to a person —
a match score, a fit percentage, a rank — and a cutoff that number is compared
against. Calibration is the practice of asking whether that number means
anything: whether a candidate the system scored 80 really advances more often
than one it scored 60, whether "80" corresponds to any stable rate in the world,
and whether the answer you just computed is worth believing.

The last clause carries the whole subject. Calibration in hiring is not the
textbook exercise of binning predictions against outcomes, because in hiring the
prediction usually **caused** the outcome. A screener that rejects everyone below
a floor manufactures the rejections a reliability curve would then score it
against; a recruiter who saw the score before deciding produces an outcome that
partly records the score's influence rather than its accuracy. A perfectly biased
screener, evaluated this way, draws a textbook-perfect diagram. This is the
[selective-labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels) shape of
the domain, and a calibration surface that does not confront it is not a
measurement — it is a mirror with a confidence interval.

So the practice has two halves. The statistical half is ordinary and well-known:
reliability bins, a proper scoring rule, a skill score against the right
baseline, sample gates. The hiring half is the hard one: knowing which outcomes
were contaminated by the score, engineering a clean arm that produces
uncontaminated ones, choosing which outcome the score even claims to predict,
and keeping all of it honest for years after launch rather than for one
validation report at go-live.

## The four questions a calibration surface answers

A surface that answers fewer than four is decorative. In order:

1. **How trustworthy is this measurement?** Which arm of data produced it, and
   what does that arm's contamination ceiling permit it to conclude? Answered by
   [label-leakage-taxonomy](./techniques/label-leakage-taxonomy.md) and
   [deterministic-holdout-clean-arm](./techniques/deterministic-holdout-clean-arm.md).
2. **Is the score ordered and correctly scaled?** Do higher bands advance more
   often, and does the stated probability match the observed rate? Answered by
   [reliability-bins-and-proper-scoring](./techniques/reliability-bins-and-proper-scoring.md).
3. **Does it beat knowing nothing?** A score that merely reproduces the cohort's
   base rate is an expensive coin. Answered by
   [base-rate-skill-score](./techniques/base-rate-skill-score.md).
4. **Predicting what, and is it still true?** Which outcome counts as success,
   and has the relationship decayed since the last time anyone looked? Answered
   by [outcome-axis-selection-advance-versus-hire](./techniques/outcome-axis-selection-advance-versus-hire.md)
   and [post-deployment-drift-monitoring](./techniques/post-deployment-drift-monitoring.md).

Answering (2) and (3) without (1) is the most common professional failure in this
subject, and it is worse than not measuring at all, because it produces a
defensible-looking artifact that a hiring team will cite when challenged.

Note that (1) and (4) interact rather than stacking: contamination is a property
of the arm *and* the outcome axis together, not of the arm alone. The same
production data read on the hire axis has a genuinely different causal story —
the score did not decide the interviews, the offer or the acceptance, so the
positive label was not score-caused — while the negative label still absorbs
every automatic rejection the score produced. Less circular is still circular,
and a surface that lets the better half of the story downgrade the arm's level
has quietly disabled its own strongest guarantee.

## Calibration, discrimination, and fairness are three different questions

They get conflated constantly, and the conflation costs real decisions.

**Discrimination** (in the statistical sense) is whether the score *separates*:
do advancers score higher than non-advancers. It is measured by rank statistics
and it is invariant to any monotone rescaling of the score.

**Calibration** is whether the score's *level* is meaningful: among everyone
scored near 70, does roughly 70% of the predicted event actually occur. A score
can separate beautifully and be catastrophically miscalibrated — every
recruiter-facing number that reads as a percentage but is really a rank
percentile is exactly this, and it is why a threshold chosen from the number's
face value lands somewhere nobody intended.

**Fairness** is whether either property holds *within* groups, and whether the
gate's outcomes differ across them. Calibration is a precondition, not a
substitute: a score can be perfectly calibrated overall and still gate one group
at half the rate of another. Adverse-impact analysis is a separate discipline
with its own techniques; calibration tells you whether the number deserves to be
in the decision at all, not whether the decision is fair.

State which of the three you measured. A surface labelled "accuracy" that is
really discrimination will be read as calibration by every non-specialist who
sees it, and non-specialists are who use it.

## The threshold is a policy act, not a fitted parameter

Calibration produces evidence about where a cutoff *could* sit. It never chooses
one. A cutoff decides who is seen by a human and who is not, and it is therefore
a decision about people — it names an actor, it is sealed, and it is reversible.
The correct shape is: the system recommends a band with its supporting numbers;
a named person adopts it; the adoption is re-derived server-side from current
data at the moment of commit and refused if the evidence moved underneath the
recommendation. A threshold that a slider writes directly to production is an
[unattributed adverse decision](../../../_laws.md#every-decision-names-its-actor) with
a UI in front of it.

Three rules make recommendations honest rather than tuning theatre. A band with
too few outcomes behind it is not a candidate at all — it is a gap, and it says
so. When two bands are statistically indistinguishable, the recommendation goes
to the lower cutoff, because
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
and the asymmetry is not close: a wrongly-passed candidate costs a review, a
wrongly-rejected one costs them the role. And a recommendation carries the arm
it came from — a threshold justified by contaminated outcomes is a threshold
justified by the previous threshold.

And a move that is never measured is a hope. A recommendation that is applied and
then forgotten leaves the organisation with a changed gate and no evidence about
it; the loop closes only when the targeted band's outcomes are split at the
moment of the change and the before-and-after mix is compared under the same
sample floor that licensed the recommendation.

There is a second, subtler hazard. If the clean-arm membership is recomputed
whenever the threshold changes, then dragging the threshold reshuffles who was
spared — and the control that was supposed to set policy has become a device for
re-rolling one specific person's fate until they land on the right side. Holdout
membership must be a fixed function of candidate identity and nothing else.

## Choose the outcome axis before you compute anything

"Did the score work?" is unanswerable until someone says what *worked* means. The
two defensible axes measure different things and disagree in useful ways:

- **Advancement** — the candidate got past the gate the score guards. This is
  the axis the score actually claims: a screening score predicts screening
  success, not tenure. It has volume, it arrives in days, and it is the axis
  most exposed to leakage, because the gate is where the score acts.
- **Hire** — the candidate was actually hired. Far more meaningful, far scarcer,
  arriving months later, and shaped by everything downstream that the score never
  saw: interview panels, offer negotiation, competing offers.

Report the axis on every claim. A score that separates advancement well and hire
poorly is not broken; it is telling you that the screen is doing its job and the
interview loop is doing something else, which is a finding about the process, not
the model.

The label mapping is where this technique lives or dies, and the rules are
unglamorous: candidates still in flight are *pending* and excluded, never counted
as failures; terminals that carry no merit judgment — the candidate withdrew, the
role closed, they were moved to another opening — are excluded, because scoring
them as failures charges the model for a hiring freeze; and a positive label is
derived from the structural role of the stage the candidate reached, never from
its display string, because
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)
and a team that renames a column must not silently redefine what the model is
being graded on.

## Honesty gates come before beauty

Every claim in this subject
[carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis).
Concretely:

- **A whole-surface floor.** Below a few dozen resolved outcomes, no reliability
  curve, no skill score, no threshold recommendation. The surface renders the
  count and the words *insufficient sample* — a distinct verdict, never a pass
  and never a blank.
- **A per-bin floor.** A bin with three candidates in it draws a point that
  swings 30 points on one person's outcome. Bins under the floor render as gaps,
  and merging bins to escape the floor is only honest if the merge is stated.
- **A drift-window floor.** A monitor that alarms on a thin week will be muted
  within a month, after which it protects nobody. A refusal to evaluate is a
  first-class monitor result.
- **A degenerate cohort has no answer.** When every outcome went the same way
  there is nothing to discriminate, and the honest output is *cannot tell you* —
  not a weak verdict, not a zero. A verdict vocabulary needs a state for "the
  data cannot support any verdict" distinct from every state that grades the
  model.
- **Unscored candidates are never fabricated.** If a candidate has no stored
  score, they are absent from the analysis, not imputed as zero or as the mean —
  [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence),
  and a fabricated zero both defames the candidate and flatters the model.

The gates fail *toward silence*. The instinct to show something rather than
nothing is the instinct that produces the artifact a tribunal reads back to you.

## What the naive readings get wrong

**"We validated it at launch."** Validation is a snapshot; deployment is a
process. The applicant mix changes with the market, the role changes under the
same title, the model gets swapped, the recruiters learn to work around the
score. Any of these dissolves the relationship without touching the code. A
selection system used for consequential decisions about people carries an
ongoing monitoring duty in most modern regulatory regimes, and the practice
predates the regulation because the failure predates it too.

**"Accuracy is 87%."** Against what base rate? If 85% of screened candidates
advance, 87% accuracy is worse than a rubber stamp. Report skill against the
cohort's own base rate, not against a coin — and if the skill is negative, say
so loudly, because a negative skill score means the number in front of
recruiters is actively worse than the prior they already hold.

**"Human review breaks the circularity."** Only if the human did not see the
score. A reviewer shown a number before deciding is anchored to it; their
agreement measures anchoring, not independence. That is a real improvement over a
purely automatic gate and it is still not independence, and the surface must
distinguish the two rather than collapsing both into "human-reviewed".

**"We'll just re-randomize the holdout each cycle."** Then the set a human
approved yesterday is not the set that exists today, every sealed approval over
it is void, and the drift monitor compares populations that were constituted
differently. Determinism is what makes the arm an arm.

## Where this subject ends

Calibration owns the question *does this number predict the thing it claims*.
It does not own how the score is computed or how it is shown. How much of a
number to show a recruiter, and in what grammar, belongs to the presentation
practice — and note that a well-calibrated score presented as a bare percentage
still misleads, because
[inference must look like inference](../../../_laws.md#inference-must-look-like-inference).
Whether the gate's outcomes differ across protected groups belongs to
adverse-impact analysis. Who may pull the trigger on a bulk rejection, and how
that set is sealed, belongs to adverse-action governance; calibration only
supplies the evidence that the cutoff is defensible.

Two seams run outside the hiring domain entirely. Instrumenting model calls —
latency, cost, routing, evaluation scaffolding — belongs to the observability
discipline, and calibration consumes its telemetry rather than reimplementing it;
what calibration adds is that here the "ground truth" is not a held-out test set
but a record of things that happened to people. And the storage, scheduling and
access-control mechanics of the analysis job are ordinary engineering, special
only because the rows bind a person's identity to a hiring outcome.

The final posture: a calibration surface exists to make it possible to say "we do
not know", precisely, with a number attached. Systems that cannot say that end up
saying the opposite by default.
