---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: score-source-kinds
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [a scoring contract types its dimensions by who decides them, a quality signal is needed where no rubric and no reference answer exist, deciding whether a confidence number may be aggregated with judged scores]
---

# Score source kinds

The concern: a scoring contract that recognizes only two sources of score —
a model reading a rubric, or a local check with a decidable truth condition
— has no slot for a number the generator produced about itself. Systems in
that position do one of two things, and both are wrong. They dress the
uncertainty score as a judged dimension, and it inherits rules written for
a prompt it does not have. Or they dress it as a mechanical dimension, and
it inherits an exactness claim it cannot honor. The technique adds a third
kind, with its own rule set, and states which rules from the other two do
and do not carry over.

## The three kinds, distinguished by who decides

| Kind | Decided by | Reproducible | Consults a rubric | Marginal cost |
| --- | --- | --- | --- | --- |
| Judged | a second model reading a stored contract | no | yes | a metered call |
| Mechanical | a local comparison against a target | exactly | no | none |
| **Generator uncertainty** | **the generator's own output distribution** | **no** | **no** | **zero to N generations** |

The third kind is the only one that is both stochastic and rubricless, and
that single cell is what makes it a kind rather than a variant. Every rule
in the existing contract attaches to one property or the other, so the
third kind lands on the wrong side of both:

- **The mechanical exemption does not apply.** A mechanical dimension is
  excluded from cross-sample agreement because it is exactly reproducible,
  and folding it in would drag agreement toward a flattering ceiling. A
  generator uncertainty score is a draw, not a constant. Excluding it on
  the mechanical exemption would hide real instability, which is the same
  error in the other direction.
- **The rubric rules do not apply.** Anchored levels, per-dimension
  weights, gating floors expressed against anchors, nonce fencing of
  candidate text, bias counterbalancing in prompt text — every one of them
  presupposes a prompt. This kind has none. There is no instruction channel
  for a candidate to hijack, and no anchors to describe, because nothing
  was described to anything.

What *does* carry over is the aggregation pipeline. A generator uncertainty
dimension flows through the same weighting, the same threshold and the same
overall as everything else. One pipeline, now three sources of score.

## Decision rules

- **When a dimension asks how sure the model was, use this kind. When it
  asks whether the model was right, do not.** Faithfulness to a source,
  adherence to a format, agreement with a reference — these have truth
  conditions this kind cannot see. Use it for the dimensions that are
  genuinely about commitment: answerability, hedging, whether this response
  deserves review before it ships.
- **When a dimension of this kind enters a composite, record its kind on
  the verdict.** An overall computed from a judged dimension, a mechanical
  one and an uncertainty one is three instruments in a trench coat; a
  reader who cannot decompose it will read the whole number with the
  authority of its most rigorous part
  ([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).
- **When the score is used to decide anything, record how it was produced**
  — the tier, the number of samples if any, and whether a calibration fit
  was applied. These are not provenance decorations; a score at tier one
  and a score at tier two with N of fifteen are different measurements that
  print as the same float.
- **When the generator's distribution is unavailable, return an absence,
  not a number.** No token probabilities and no budget for extra samples
  means the dimension has no verdict. A dimension that returns a null with
  a stated reason is honest; one that returns a default is a fabricated
  measurement in the one place nobody will look
  ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).
- **When the response is long-form, decompose before scoring.** A single
  paragraph can mix a true claim and a false one, and one distributional
  number over the whole of it averages them into a value that describes
  neither. Score claims, then aggregate — and if the aggregation drops
  low-confidence claims from the delivered answer, that is a rewrite of the
  product's output and belongs in the change log, not in the scorer.

## What the verdict flows through

The verdict is a scalar in the same zero-to-one convention as every other
dimension, with the same orientation: higher is better. That convention is
worth stating because the underlying quantities do not share it — entropies
and error rates rise as confidence falls, and a scorer library that emits
each in its natural direction guarantees that somewhere a threshold points
the wrong way and nobody notices, because a mis-signed confidence score
still looks like a plausible number.

Normalize at the boundary of the scorer, once, and let the sign live there.
Downstream, the contract sees a dimension.

## When not to use it

Do not use this kind where a mechanical check would decide the same
question. A format requirement, a required value, an exact match — these
are free and exact, and a probabilistic proxy for them is strictly worse on
every axis. Do not use it as a cheaper stand-in for a judged dimension the
product actually needs; it does not measure that thing at all, and a
substitution made for cost reasons will be defended later as a measurement.
And do not introduce it into a contract that has already been versioned and
whose historical verdicts are trended, without a new contract version —
adding a source of score changes what the overall means, which is a
restatement of every prior verdict if it happens in place.
