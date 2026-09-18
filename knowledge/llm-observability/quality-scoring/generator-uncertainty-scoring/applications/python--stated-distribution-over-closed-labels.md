---
layer: application
type: application
subject: generator-uncertainty-scoring
technique: stated-distribution-over-closed-labels
stack: python
verified_on: 2026-09-18
verified_against: python@3.14
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A vendor's open adapter, and two paired runs on a memory evaluation

The version witness is the adapter tree's `.python-version` file (`3.14`);
its package metadata allows 3.10 and up. The tree is
`typesafe-ai/system-one-adapter-python` at commit `adffc2ea`, read on
2026-09-18. It exists to let a caller run the vendor's typed-decision
request shape — a shared state, a map of questions, each a choice, an
ordered score or a yes-probability — against a general chat model, so the
two can be compared. That makes it the one place the vendor's
distribution-to-confidence arithmetic is published: the hosted model's
documentation describes the confidence only as "a statistic computed from
the probability distribution".

## What the tree decides

- **Two statistics, chosen by answer shape.** The nominal one rescales the
  peak between uniform and certainty; the ordinal one measures mass by its
  distance from the mode, against the same quantity under a uniform spread.
  `src/system_one_adapter/_utils/confidence_metrics.py:24 "(max(normalized_probs) - uniform_probability) / (1.0 - uniform_probability)"`
  `src/system_one_adapter/_utils/confidence_metrics.py:14 "1.0 - distance_from_mode / uniform_mean_absolute_deviation"`
- **The yes-probability carries no confidence at all**, and the reference
  response in the tests shows it: the binary answer is a bare number while
  the other two carry a confidence field.
- **The sum error is kept, not repaired silently.** Normalization is a
  switch, the tolerance is declared, and the original distribution travels
  in the debug record whenever rescaling changed it.
  `src/system_one_adapter/_utils/probability_normalization.py:9 "PROBABILITY_TOLERANCE = 1e-6"`
- **Ordinal levels index from zero**, enforced in the output type.
  `src/system_one_adapter/_schema.py:177 "Field(ge=0, lt=len(question.criteria))"`
- **Discrete mode is a degenerate distribution** — one on the named label,
  zero elsewhere — so a caller comparing modes compares a confidence that
  is always 1.0 against one that is not.

## The paired runs

Both ran on a public desktop agent app's simulated-year memory evaluation,
through its own cached model wrapper, changing no product code.

**Admission verdict, ceiling seam.** 80 cases built from the world
generator (first mention, restatement, replacement; true neighbour withheld
in 35%; same-key items from other projects as distractors). Target: wrong
destructive verdicts. Floor: exact-label accuracy within two points.
Discrete 80/80, distribution 80/80, zero destructive errors in both,
output tokens 338 against 795, 49 of 80 confidences saturated. Verdict for
that seam: **not better** — nothing to rank, 2.35× the output.

**Fix-applied grader, noisy seam.** 120 recorded pairs the evaluation had
graded with a strict yes-or-no model call. Borderline label: the
evaluation's own strict and lenient wordings disagree (7 pairs). Target:
AUROC of `1 − |2p − 1|` against that label. Floor: `p ≥ 0.5` agrees with
the strict verdict on at least 95%. Result: AUROC **0.82**, band 0.2–0.8
flags 7.5% of pairs and holds 4 of 7, floor **97.5%**. Verdict: **better**.
The same run found the strict call reproducing its own recorded verdict on
100 of 120 pairs, 19 of 20 flips in one direction, at stated probabilities
of 0.90–0.97 — time drift the stated probability did not flag.

## What this realization cannot do

Both arms are one draw each; neither number carries a repeatability band of
its own. The borderline label is disagreement between two wordings, which
is a proxy for a hard case and not a measure of grader error. Nothing here
measured the hosted decision model itself: its calibration claim rests on a
benchmark whose reference is an average of general models' probabilities,
and no key was available to run it on these cases.
