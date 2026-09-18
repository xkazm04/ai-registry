---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: stated-distribution-over-closed-labels
status: forged
laws: [estimation-announces-itself, statistical-verdicts-or-no-verdict, never-present-absence-as-an-answer]
shared_with: []
use_when: [a model makes a closed-set decision and code acts on it without a confidence, a serving API exposes no token probabilities but a confidence is still wanted, deciding whether to replace a discrete verdict with a probability per label, a yes-or-no grader has borderline cases nobody can see, choosing a threshold below which a destructive verdict is downgraded]
stage: team
---

# Stated distribution over closed labels

The concern: most decisions a model makes inside software are not prose.
They are a pick from a list the caller wrote — a route, a verdict, a level
on a rubric, a yes or a no — and the caller receives the pick and nothing
else. The two uncertainty sources this subject already owns do not reach
that seam cheaply: token probabilities are not exposed by most serving
paths, and drawing N samples multiplies the call. A third source is
available on every serving path: **ask for a probability per label instead
of a label**, take the argmax as the decision, and compute a confidence
from the *shape* of what came back.

It belongs to this subject because the number is still the generator's own
account of how firmly it committed, with no channel to the world. It earns
its own technique because it breaks one sentence the subject's kinds table
relies on: this source **has a prompt**. There is an instruction channel,
so candidate text inside the state can argue with it, and the fencing
rules the judged kind carries apply here although the rubric rules do not.

## The three answer shapes and their shape statistics

The label set decides the statistic. Using one formula for all three is the
first mistake, because "how peaked" means different things over an
unordered set and an ordered one.

| Answer shape | Decision | Confidence from shape | Why this statistic |
| --- | --- | --- | --- |
| **Nominal** — k unordered labels | argmax | `(p_max − 1/k) / (1 − 1/k)` | rescales the peak so that uniform reads 0 and certainty reads 1 at every k; a raw `p_max` of 0.5 is near-certain at k=20 and a coin flip at k=2 |
| **Ordinal** — k ordered levels, indexed from 0 | the probability-weighted mean, which may land *between* levels | `1 − E|i − mode| / MAD_uniform` | mass on a neighbouring level costs little, mass at the far end costs a lot; the nominal formula would score both the same |
| **Binary** — one proposition | none; the probability of yes *is* the answer | none — do not mint one | a second number derived from a single p carries no information the p did not; borderline-ness is `1 − |2p − 1|` and is read directly |

Two properties of the ordinal row are worth stating because both surprise
consumers. The returned score is an expectation, so a three-level rubric
returns values such as 1.4, and code that compares it with `==` to a level
is wrong by construction. And levels index from zero, so three levels are
0–2.

## Decision rules

1. **The threshold lives in code, and the model never grants a capability.**
   The distribution is an input to a policy the caller wrote. A high
   confidence may let the policy *offer* an action; the policy still checks
   everything it would have checked without the model.
2. **Gate the destructive labels, not all of them.** Name which labels
   cannot be undone — invalidate, delete, send, supersede — and downgrade
   only those to the conservative label below the threshold. Gating every
   label turns a classifier into a queue.
3. **Give every nominal set an explicit none-of-the-above.** A closed set
   with no exit forces mass onto the least-wrong label, and the shape
   statistic then reports confidence in a label that was never right.
4. **Record the sum error before normalizing.** A stated distribution need
   not sum to one, and need not name every label. Rescale so downstream
   statistics are defined, but keep `|Σp − 1|` and the missing-label count
   per answer. They are a free validity signal: a reply that is 0.3 off a
   distribution was not reasoning about a distribution.
5. **Count saturation.** A source that returns exactly 1.0 on most answers
   has no resolution in the region where the threshold would sit. Report
   the share of saturated answers beside any threshold; when it is the
   majority, the confidence is a two-valued flag and should be described as
   one.
6. **Fit the threshold on one set of cases and report it on another**, and
   only against labels that did not come from the model being scored
   ([probability-calibration-is-not-agreement](./probability-calibration-is-not-agreement.md)).
   A vendor benchmark whose reference probabilities are the average of
   other models' answers measures agreement with those models. It is the
   circularity this subject already names, at benchmark scale.
7. **Measure the seam's error rate first.** A confidence ranks errors. A
   seam with no errors gives it nothing to rank.

## The measured boundary: two seams, opposite verdicts

Both measurements used real cases from a simulated-year memory evaluation,
gold or borderline labels derived from a layer no model touched, and one
call per arm per case.

**A ceiling seam — not better.** A memory-admission gate rules whether a
new message creates, repeats or replaces a stored item, choosing among the
nearest stored items, with cross-project distractors of the same key shown
and the true neighbour withheld in 35% of cases. Eighty cases, sixteen per
class, gold from the world generator. The discrete arm and the distribution
arm both scored **80 of 80**, with **0** wrong destructive verdicts in
either. The distribution arm cost **2.35× the output tokens** (795 against
338 per case) and **1.5× the latency**, returned a saturated confidence on
**49 of 80** answers, and broke its own format once (one sum error, one
missing label). The fitted threshold was 0.0: there was nothing to gate. At
this seam the mechanism is pure cost.

**A noisy binary grader — better.** A yes-or-no model grader decides
whether a reply applied a required fix. The evaluation ships a strict and a
lenient wording of the rubric, and its own findings attribute several
between-arm differences to grader strictness. On 120 recorded pairs the two
wordings disagreed on 7. One call returning the probability of yes under
the strict wording ranked those pairs with an **AUROC of 0.82** on
borderline-ness; a review band of 0.2–0.8 flagged **7.5%** of pairs and
held **4 of the 7**, and 0.1–0.9 flagged 22.5% and held 6 of 7. The floor
held: thresholded at one half, the probability agreed with the discrete
strict verdict on **97.5%** of pairs. One call bought most of what a second
differently-worded call was buying.

**What the second seam also showed, and the band could not see.** The
identical strict prompt, on the identical pairs, through the same model
identifier, reproduced the recorded verdict on only **100 of 120** — and 19
of the 20 flips ran the same direction, wrong to correct. The flipped pairs
sat at stated probabilities of 0.90–0.97, outside any useful band. A
stated distribution describes the model's commitment *now*; it carries no
information about whether the same model will be as committed next week.
That is the repeatability floor's job and the drift subject's, and neither
is replaced by this number.

## Failure modes

- **The exit-less set.** No none-of-the-above, and high confidence in a
  wrong label for every input the list did not anticipate.
- **The shape statistic read as accuracy.** It is a rank until labels make
  it a level, exactly as for the other two sources.
- **The equality comparison on an ordinal score.** The score is a mean.
- **The hijackable state.** The state is untrusted text sitting beside an
  instruction; fence it as a judged prompt would be fenced.
- **The cardinality wall.** A label set too large to state a probability
  for is ranked in two stages — a coarse pick, then a pick within it — and
  the second stage's confidence is conditional on the first being right.
- **Paying for shape at a ceiling.** Output tokens scale with the number of
  labels, not with the difficulty of the case.

## When not to use it

Where the serving path returns token probabilities, read those: they cost
nothing and are not a second act of generation. Where the seam's measured
error rate is near zero, keep the discrete answer. Where the decision is a
claim about the world with a reference to check against, a mechanical
dimension answers it exactly. And where a purpose-built decision model
returns a native distribution, this technique's rules still govern what
the caller does with it — the threshold in code, the gated destructive
labels, the disjoint fit — but its calibration is that model's claim to
prove on the caller's own cases, not a property the shape statistic
confers.
