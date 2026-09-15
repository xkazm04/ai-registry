---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: golden-set-agreement-measurement
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [establishing whether a judge agrees with humans, building or refreshing a human-labeled calibration set, interpreting kappa vs correlation vs bias, a judge draws several samples per item and reports agreement across them]
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
  with an honest human label. Include verbosity-inflation fixtures — a
  candidate padded with rephrased duplicates of its own content, adding
  nothing — which the founding measurements showed fooling weaker judges
  on most attempts while a strong judge held. A judge calibrated only against honest
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
- **Condition agreement on difficulty, or it flatters the judge.** Agreement
  over a set dominated by clear-cut items is at ceiling by construction:
  the founding pairwise measurements watched judge-human agreement climb
  from around seventy percent toward near-perfect as the quality gap
  between compared candidates widened. Stamp each item's stratum on the
  result and read agreement per stratum - the borderline stratum is the
  number the trust verdict should weigh, because the clear strata were
  never the cases a gate could get wrong.

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

## Self-consistency is a spread only where the draws can differ

The bullet above holds on one condition it does not state: the samples
have to be able to disagree. Two ways of losing that condition have been
found in working judges, and in both the scoring code was correct and the
number was empty.

- **The request pins the draw.** A judge that asks for deterministic
  sampling on every call - temperature zero, one fixed seed - and then
  draws N samples of one prompt has drawn one sample N times. Its agreement
  across samples reads perfect however ambiguous the item is, and the spend
  is N times a single verdict. Reproducibility and self-consistency pull
  opposite ways on the same knob, and a judge cannot have both from one
  request. Pin a single verdict, and draw several samples unpinned and
  stamp them as sampled. A pinned multi-sample run is a single verdict
  with an invoice.
- **The machinery never receives more than one draw.** An ensemble step
  that takes a majority vote over N responses is inert when the caller
  hands it one response, or when the client beneath it returns one
  generation whatever N asked for. The vote returns its only input, the
  configuration still says N, and the documentation still says the knob
  maintains consistency. Nothing fails; the knob simply does nothing.

Both are invisible to the aggregation tests, because a canned-reply fixture
disagrees with itself because the fixture says so. The check is on the
**draws**: record how many samples were requested, how many distinct
responses came back, and under which sampling request, and report the
effective count beside the agreement figure
([statistical-verdicts-or-no-verdict](../../../_laws.md#statistical-verdicts-or-no-verdict)).
An agreement read over one effective draw is not a measurement of the
judge's stability. It is the absence of one, printed as its best case.

Measured on a small local seeded model scoring four deliberately ambiguous
grounding items at five samples each, three runs per arm: pinned samples
disagreed on 3 of 12 item-runs, and all three were the same item at the
same values, reproducibly, stamped as exactly reproducible. That is a
provider artifact, not the item's ambiguity, and it is the second finding:
**a reproducibility stamp derived from what the request asked for
overstates what the provider delivered.** The same item's score also moved
between a cold run and a warm one under that stamp. Unpinned samples
disagreed on 7 of 12 item-runs across three items. The price is visible
and belongs in the output: an unpinned multi-sample score moves between
runs, so it is stamped as sampled rather than as reproducible.

## When not to use this

Agreement measurement presumes a scalar or pass/fail quality notion a
human can label consistently. For preference-shaped questions ("which of
these two is better?") use pairwise comparison with randomized position
instead — calibrating a scalar judge on a task humans themselves can only
answer comparatively produces noisy labels and an unearned kappa. And do
not calibrate against labels produced by the same model family that is
judging: self-preference contaminates the ground truth exactly where the
measurement was supposed to be independent.
