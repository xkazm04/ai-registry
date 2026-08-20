---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: golden-set-agreement-measurement
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [establishing whether a judge agrees with humans, building or refreshing a human-labeled calibration set, interpreting kappa vs correlation vs bias]
---

# Golden-set agreement measurement

The concern: quantify how well the judge agrees with a human on the same
outputs, with metrics whose failure modes you understand. This is the ground
truth everything else in the subject stands on — the trust verdict binarizes
it, the drift sentinel repeats it, judge selection compares it across
candidates.

## The golden set

A calibration case is a real input, the already-produced output being
judged, optional context, and a **human ground-truth score** on the same
scale the judge uses. Rules that make the set an instrument rather than a
pile of examples:

- **Judge-only.** Calibration re-scores stored outputs; it never generates.
  Generation would entangle candidate variance with judge variance and the
  measurement would answer neither question.
- **Frozen.** The set is pinned. Every cycle judges the same items, so a
  change in kappa is a change in the *judge*, not in the paper it was
  graded on. Refreshing the set is a versioned event that re-baselines all
  history — never a rolling substitution.
- **Stratified, not sampled by convenience.** Include known-good, known-bad,
  and the expensive middle: half-answers, confident wrong answers, polite
  deflections. A set of only clear cases calibrates the judge on the cases
  that never mattered.
- **Hostile items are a stratum, not a separate exercise.** The judged text
  is attacker-influenced by construction, so the set includes adversarial
  fixtures — candidates carrying verdict-steering instructions aimed at the
  judge itself, boundary imitations, flattery and appeal-to-authority — each
  with an honest human label. A judge calibrated only against honest
  disagreement holds a verdict that says nothing about the inputs most
  likely to be mis-scored; agreement on the attack stratum is measured and
  reported per stratum, because a healthy overall kappa can hide a judge
  that folds exactly where folding is induced.
- **Human labels have their own error.** Where feasible, label with more
  than one annotator and record inter-annotator agreement; it is the
  ceiling against which the judge's kappa is read. A judge cannot agree
  with humans more than humans agree with each other.
- **Sized for its question.** For a roughly balanced pass/fail criterion, a
  few dozen stratified items pin kappa to a usable band; skewed or
  heavy-tailed criteria need low hundreds. Below that, treat every kappa
  as an interval, not a point.

## The metric family — four questions, four numbers

No single number captures agreement. Compute the family over the paired
(human, judge) scores:

| Metric | Question it answers | Blind spot |
|---|---|---|
| Correlation | does the judge *rank* quality like the human? | insensitive to scale compression and constant offset |
| Mean absolute error / RMSE | how far do individual verdicts sit from the human's? | averages away systematic direction |
| Bias (mean judge − mean human) | is the judge generous or harsh overall? | a zero bias can hide symmetric large errors |
| Cohen's kappa on binarized pass/fail | does the judge make the same *decision* a gate would, beyond chance? | depends on the chosen threshold; degenerate under extreme class imbalance |

Kappa carries the trust verdict because it is the decision-shaped,
chance-corrected one. Raw agreement rate is reported but never trusted
alone: on a set where 90% of items pass, a judge that passes everything
posts 90% agreement and kappa near zero — which is the correct reading.
Handle the degenerate case explicitly: when both raters put every item in
one class, expected agreement is total and the kappa formula divides by
zero; define it as perfect only under full agreement, else zero, and say so
in the output rather than emitting a NaN downstream code will compare
against a bar.

Two thresholds parameterize the whole measurement and must travel with
every result: the **pass threshold** that binarizes scores (it drives
kappa) and the **kappa bar** the verdict compares against. A kappa quoted
without its threshold is a number without units.

## Power honesty

Golden sets are small because human labels are expensive, and small paired
samples are underpowered by construction. The decision rules:

- **Lead with effect size.** A large shift at marginal significance is a
  finding; report the magnitude first and the p-value as qualification.
- **Never read an underpowered null as safety.** When a verdict rests on
  *not* detecting a shift and the sample is small (a few dozen items),
  attach the low-power caveat to the verdict itself — in the output, not
  in documentation the reader will never open.
- **Self-consistency sampling is cheap variance reduction.** Judging each
  item several times and averaging tightens the judge's own noise floor
  before it reaches the agreement math; use it when single-judgment
  variance is visibly wide.

## When not to use this

Agreement measurement presumes a scalar or pass/fail quality notion a
human can label consistently. For preference-shaped questions ("which of
these two is better?") use pairwise comparison with randomized position
instead — calibrating a scalar judge on a task humans themselves can only
answer comparatively produces noisy labels and an unearned kappa. And do
not calibrate against labels produced by the same model family that is
judging: self-preference contaminates the ground truth exactly where the
measurement was supposed to be independent.
