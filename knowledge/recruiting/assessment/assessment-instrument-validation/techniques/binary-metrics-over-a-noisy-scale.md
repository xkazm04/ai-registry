---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: binary-metrics-over-a-noisy-scale
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [tracking assessment quality across runs, a scoring metric moves without a scoring change, choosing what a validation harness should report]
---

# Binary metrics over a noisy scale

Ask a model judge to score a submission out of a hundred and it will give you a
number. Ask it again, unchanged, and it will give you a different one. The
run-to-run spread on an absolute quality score routinely exceeds the difference
a validation run is trying to detect — which means a dashboard tracking mean
score across runs is a dashboard tracking the judge's mood, and every decision
made from it is a decision about noise.

The lesson, learned the same way everywhere it is learned: **absolute scores
from a model judge are too noisy to compare across runs.** It is usually learned
by trying to measure an improvement: a rubric change is made, the instrument is
re-judged, and one dimension's mean moves by most of a point *with the scoring
logic unchanged* — a drift of about a point on a five-point scale, swamping the
fraction-of-a-point effect the change was supposed to produce. The correct
conclusion is not "the change failed" and not "the change worked"; it is that
the measurement was never capable of resolving the question, and every earlier
conclusion drawn from that dashboard is void. The escape is not a
better prompt or a lower temperature — both shrink the spread without removing
it, and neither makes the number comparable to last month's. The escape is to
stop tracking the scale and start tracking **binary facts derived from it**.

## Why the derived binary is stable when the score is not

A judge asked "score this out of a hundred" is being asked to place a point on a
scale it holds no fixed reference for; the anchor drifts between runs, between
prompts, and between submissions in the same batch. A judge asked "did this
submission demonstrate the verification step, yes or no?" is being asked a
question with a fact behind it, and the answer is stable across runs where the
scored value is not.

The same logic applies one level up. "Did the strong persona outrank the weak
one?" is a binary derived from two unstable numbers, and it is far more stable
than either — because a shared upward or downward drift in the judge's calibration
moves both scores together and cancels in the comparison. This is why comparative
and margin-based validation survives judge noise that absolute scoring does not.

Binary facts have two further properties that matter operationally:

- **They aggregate into rates with real confidence intervals.** Twelve of
  fifteen runs separated the personas correctly is a claim you can attach a
  sample to and reason about
  ([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
  A mean of 71.4 across fifteen runs is a number with no interval anyone can
  compute.
- **They are auditable.** A person can look at a submission and check whether
  the verification step was demonstrated. Nobody can audit an 81.

## What to derive

Pick facts that are checkable by a person reading the same material:

- **Ordering facts.** Did the strong persona outrank each named comparator? Did
  the gaming persona fail to reach the top band?
- **Presence facts.** Did the submission contain the load-bearing artifact? Was
  the required check executed? Was the alternative approach acknowledged?
- **Gate facts.** Did each threshold in the gate clear? Was the run independent?
  Was the cohort above the floor?
- **Band facts, where a coarse ordinal is genuinely meaningful.** A three- or
  four-state verdict — strong, adequate, weak, absent — is not a hundred-point
  scale and behaves much better, provided each state has a written definition
  the judge is given. Never invent bands by cutting a noisy continuous score
  into ranges; that inherits the noise and hides it behind a label.

Keep the raw score, but demote it. Print it in the report as supporting detail
so a human reading a surprising binary can see the underlying numbers. Do not
gate on it, do not chart it over time, and do not put it in a summary where it
will be read as a measurement
([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).

## Procedure

1. **Establish the noise floor once.** Run the same submission through the same
   scoring path several times and record the spread of the absolute score. This
   number is the argument for everything that follows and it is worth having on
   paper.
2. **Rewrite each quality question as a checkable proposition** with a written
   definition of what satisfies it.
3. **Have the judge answer the propositions**, and derive ordering facts from
   comparisons rather than asking for a ranking directly.
4. **Aggregate binaries into rates, with sample sizes attached**, and track
   those across runs.
5. **Keep the raw score visible but ungated**, tagged as supporting detail.
6. **When a binary rate moves, investigate the instrument.** Unlike a mean
   score, it does not move on its own.

## Decision rules

- **When someone proposes a target for mean judge score, refuse and offer a
  binary rate instead.** A target on a noisy scale becomes an optimisation
  against noise, and the fastest way to hit it is to make the judge more
  generous.
- **When a binary is unstable across reruns, the proposition is underspecified,
  not the judge.** Rewrite it until two people reading the same submission agree.
- **When a continuous score is genuinely required** — a recruiter-facing ranking,
  say — compute it deterministically from the binaries rather than asking the
  judge for it. A weighted count of satisfied propositions is reproducible; a
  holistic number is not.
- **When comparing across instrument versions, compare binaries only.** Absolute
  scores are not comparable across rubric versions even with a perfect judge,
  because the scale itself changed.
- **When a binary rate is computed over fewer runs than its threshold requires,
  report it as inconclusive**, exactly as any other undersampled claim.
- **When comparing a change against a baseline, compare paired measurements on
  the same submissions in the same run.** Two independent runs, one before and
  one after, differ by the change *plus* the judge's sampling variance, and
  attributing the whole delta to the change is the standard way a rubric tweak
  gets credited with an effect it did not have.
- **When a rubric is tuned against the validation cast, hold submissions out.**
  A rule fitted on exactly the cases it is then scored on always improves, and
  the improvement transfers to nobody. This is the same coupling that makes
  post-deployment calibration hard, arriving early
  ([a-predictor-cannot-grade-its-own-labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels)).

## When not to use it

Binaries lose information, and where the magnitude genuinely matters —
estimating how far apart two candidate populations sit, modelling a score
distribution before setting a cutoff — you need the quantity, and you get it
from a deterministic scoring rule rather than from a judge. Deterministic scores
computed by code are not subject to this problem at all and should be tracked as
numbers. And a single high-stakes judgment read by a human does not need
binarising: the point of this technique is comparability across runs, and a
one-off read that a person will interpret in full has no comparability problem
to solve.
