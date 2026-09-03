---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: score-source-ensembling
status: forged
laws: [estimation-announces-itself, statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [combining a judge score with a judge-free confidence score, weights for a composite confidence score need to be chosen, a scorer that worked on one workload is carried to another, deciding whether a scoring configuration transfers across a model upgrade]
stage: team
---

# Score source ensembling

The concern: once a system has three sources of score that fail on
different inputs, the obvious move is to combine them — and the combination
is where an unlabelled, ground-truth-free scoring pipeline quietly acquires
a **label dependency and a scope condition** that nothing else in it has.
A weighted average looks like arithmetic. It is a fitted model, and a
fitted model has a training set, a validity region, and an expiry.

## Why combining works at all

The three sources are wrong about different things. A judge fails where its
rubric does not cover the failure mode. A consistency scorer fails where
the model is stably, repeatably wrong. A token-probability scorer fails
where fluency and correctness come apart, which is exactly what a
well-trained model is good at. Because their errors are less than perfectly
correlated, averaging recovers signal that none of them carries alone.

The measured version is decisive and worth stating in full, because it is
also the evidence against the story people expect. Across two dozen
generator-and-dataset scenarios, a tuned weighted combination beat every
one of its own components in **twenty of twenty-four** on a
threshold-agnostic metric and led on a threshold-dependent one in
**seventeen of twenty-four**. In the same experiment, among the individual
non-ensemble scorers, the best performer was a **model judge in eleven
scenarios**, a consistency scorer in seven, and a token-probability scorer
in six.

Read that second sentence carefully before designing anything. The judges
won the plurality of scenarios outright. The correct reading of the whole
result is **complementarity, not replacement**: the cheap judge-free
sources are worth having because they are cheap and because they fail
differently, not because they are better. A design that drops the judge on
the strength of this evidence has read it backwards.

## The label dependency

Weights cannot be chosen from the scores. They are fitted against a set of
responses that have been **graded** — a binary correct/incorrect label per
response — which reintroduces exactly the ground truth this subject exists
to operate without. That is not a contradiction; it is a boundary. The
scoring path needs no labels at inference time. The *configuration* of the
scoring path needs them once, and again whenever it is revalidated.

Where the labels come from decides how much the fit is worth:

- **Automatable grading** — short answers, arithmetic, multiple choice,
  anything with a recognizable correct answer — lets the label set be built
  by sampling prompts, generating responses and comparing mechanically. The
  labels are cheap and the fit can be large.
- **Non-automatable grading** — open-ended or long-form output — needs
  human labels. A few hundred is a workable start, extended incrementally
  from production traffic.
- **The generator grading its own answer key** is the configuration to
  refuse. Where no grader is supplied, the convenient default is to let the
  same model that produced the responses decide whether they were correct —
  which fits the ensemble's weights against that model's own opinion of
  itself and then reports the result as a measure of that model's
  reliability. The circularity is complete and invisible: every number
  produced afterwards is internally consistent and externally unanchored.
  If the labels are model-generated, the fit is a lead and not a
  measurement, and it says so on its face
  ([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).

## The scope condition

Scorer performance depends on both the dataset and the generator, so the
weights are fitted **per generator and per task** and are valid for
in-domain deployment. The published work that establishes the ensemble's
advantage tunes exactly this way and states plainly that it did not
evaluate out-of-distribution generalization or cross-task transfer of
learned weights.

That is a limitation to inherit, not to route around. A fitted ensemble is
a claim about one generator on one workload. Carrying it across a model
upgrade, a prompt rewrite, or a new customer's traffic is an untested
extrapolation, and the failure is silent — the scores keep printing, in
range, plausibly ordered.

## Decision rules

- **When combining sources, prefer sources from different families.**
  Two consistency scorers built on the same entailment machinery are nearly
  one scorer; a consistency scorer plus a probability scorer plus a judge
  are three. Diversity of failure, not count of inputs, is what the average
  is buying.
- **When fitting, fix the objective before looking at the result.** A
  threshold-agnostic objective fits weights alone; a threshold-dependent
  one fits weights and cutoff jointly. Choosing the objective after seeing
  which one flatters the configuration is the same tuning-until-green
  failure a gate's fixed confidence level exists to prevent
  ([_laws: statistical-verdicts-or-no-verdict_](../../../_laws.md#statistical-verdicts-or-no-verdict)).
- **When the fit produces a threshold, it produces an absolute-level claim,
  and that claim is subject to the calibration rules** — a fitted cutoff is
  not a calibrated score, and a cutoff chosen to maximize a classification
  metric says nothing about whether the number under it means what it says.
- **When any component is unavailable for a given response, do not
  renormalize silently.** A weighted average missing its highest-weighted
  term is a different estimator; either record the composite as
  unavailable, or record which components entered it
  ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).
- **When the generator or the workload changes, the fit is stale until
  re-earned** — the same posture the neighbouring calibration subject takes
  toward a judge's trust verdict, applied to a fitted composite.
- **When the graded set is small, prefer fewer components.** Weights fitted
  on a few hundred labels over six scorers is an overfitting story with a
  respectable-looking cross-validated number attached.

## Failure modes

- **The self-graded ensemble.** Weights fitted against labels the generator
  wrote about itself, reported as an external reliability measure.
- **The travelling configuration.** A tuned ensemble carried to a new model
  or workload on the strength of a number measured somewhere else.
- **The redundant committee.** Four scorers, three of them variations on
  one mechanism, presented as an ensemble and delivering one mechanism's
  accuracy at four times the cost.
- **The objective chosen last.** Two fits run, the better-looking one
  reported, and the selection step omitted from the artifact.
- **The judge dropped for the wrong reason.** A cost decision taken as if
  the evidence supported an accuracy decision, on evidence that in fact put
  judges first among individual scorers.

## When not to use it

Do not ensemble before a single source has been shown insufficient — the
combination adds a label set, a refit obligation, a scope condition and an
extra failure surface, and one adequate scorer beats three combined ones
that nobody can revalidate on schedule. And this technique does not reach
into the neighbouring benchmark-operations discipline: choosing which
provider or model *serves* a workload, running a target matrix, freezing
the case set and reading the three-axis scorecard all stay there. What is
fitted here is the weighting of scorers over one already-chosen generator's
output; the benchmark subject chooses the generator. Two different objects,
and a run that confuses them will tune a scorer on a dataset that is still
moving.
