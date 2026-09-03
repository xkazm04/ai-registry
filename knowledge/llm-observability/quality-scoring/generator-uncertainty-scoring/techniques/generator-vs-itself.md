---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: generator-vs-itself
status: forged
laws: [statistical-verdicts-or-no-verdict, estimation-announces-itself]
shared_with: []
use_when: [the same prompt returns different answers on different runs, deciding whether generator variance is noise or signal, choosing how many samples a consistency score should draw, a gate and a scorer disagree about the same spread]
---

# Generator vs itself

The concern: this bundle already re-runs a frozen input N times under
identical conditions and reads the spread. It does it to the **judge**, and
calls the result the repeatability floor — an instrument caveat that bounds
every drift threshold above it. The identical apparatus pointed at the
**generator** is not a caveat at all. It is the product signal: a prompt
the model answers five different ways is a prompt the model does not know.

Same rig, other model in the room, opposite meaning. Getting that
distinction into the open is most of the technique, because a system that
runs the rig without naming its subject produces numbers whose meaning
depends on who is reading them.

## The four quantities

The calibration subject enumerates three. This is the fourth, and the
enumeration is only useful complete:

| Measurement | Compares | Answers |
| --- | --- | --- |
| Agreement | judge vs. human | is the judge right? |
| Drift | judge now vs. judge then | has the judge changed? |
| Repeatability | judge vs. itself | is the judge a measurement? |
| **Generator variance** | **generator vs. itself** | **does the model know this?** |

The first three are properties of the instrument. The fourth is a property
of the thing being measured, arrived at with the instrument switched off
entirely — no rubric, no judge, no reference. That is what makes it belong
in this subject rather than next door.

## The frame discriminator

The same physical fact — the generator returns different text on different
draws — is read in two incompatible ways by two mechanisms in the same
system, and both readings are correct in their own frame.

**The gate's frame.** A quality gate wants a per-case point estimate so it
can ask whether this run is worse than the last one. Generator
sample-to-sample variance is one of three stacked noises around the
quantity of interest, and stripping it — by pairing on cases, by averaging
draws, by pinning the sampling — is exactly right there. A gate that reads
generator spread as signal fires on dice.

**The scorer's frame.** A generator uncertainty scorer wants the spread
itself. The disagreement *is* the measurement; averaging it away destroys
the only thing being computed. A scorer that strips generator variance
returns a constant.

So the rule is not "pick the right frame." It is: **every number derived
from repeated generation declares which frame produced it, on the number.**
The failure mode is not choosing wrongly, it is failing to say — and then
two mechanisms in one system report the same underlying spread with
opposite signs and no reader can reconcile them
([_laws: estimation-announces-itself_](../../../_laws.md#estimation-announces-itself)).

## Decision rules

- **When the question is "is this build worse than the last one", you are
  in the gate's frame.** Strip the variance, pin what can be pinned, pair
  on cases, and treat the residual spread as the error bar it is.
- **When the question is "should a human look at this response", you are in
  the scorer's frame.** Keep the spread. It is the answer.
- **When both mechanisms consume the same repeated generations, compute
  once and derive twice, with each derivation labelled.** Drawing the
  samples is the expensive part; there is no reason to pay for it twice,
  and every reason to make the two readings visibly share an origin.
- **When choosing N, measure the curve on your own traffic and buy the
  elbow.** Discrimination rises steeply with the first few samples and
  flattens: a published sweep over a generator-and-dataset pair moved from
  roughly 0.54–0.57 at a single sample to roughly 0.75–0.80 at fifteen,
  approximately monotonically with clear diminishing returns. Fifteen was
  chosen there to make cross-scorer comparison robust, not as an operating
  point, and treating it as one buys the flat part of somebody else's
  curve at full price.
- **When N is one, there is no spread and the score does not exist.**
  Return an absence, not a confident zero-variance one. A single draw
  cannot disagree with itself.
- **When the spread gates anything, aggregate over draws and declare the
  aggregation** — the same rule the repeatability floor imposes on the
  judge, for the same reason
  ([_laws: statistical-verdicts-or-no-verdict_](../../../_laws.md#statistical-verdicts-or-no-verdict)).

## Consistency is not correctness, and the failure is systematic

The measurement's blind spot is not random. A model that has memorized a
wrong fact answers the same wrong thing every time, at maximum consistency,
and this scorer reports maximum confidence. Where the wrongness is
systematic — a stale fact, a misread convention, a plausible
misgeneralization — the spread is small precisely because the error is
reliable.

So generator variance finds one class of failure well and another class not
at all. It finds the cases where the model is *guessing*, and those are
common and worth finding. It cannot find the cases where the model is
*mistaken with conviction*, and those are the expensive ones. A monitoring
programme that runs only this scorer has bought good coverage of the first
class and none of the second, and should know which one it has.

The corollary for what the spread may be computed over: sample-to-sample
agreement on a long-form answer that mixes a true claim with a false one
averages two different states into a number describing neither. Where
responses are long, decompose to claims, score claims, then aggregate.

## When not to use it

Do not run this rig where the generation is pinned to be deterministic —
there is no spread to read, and a near-zero variance under pinning is an
artifact of the pinning, not a statement about the model's knowledge. Do
not use it where correctness has a decidable condition and a reference
exists; a mechanical check answers that exactly and for free. And do not
substitute it for the judge's repeatability floor, which is a different
measurement about a different model and still owed: an instrument's spread
and a subject's spread are both needed, and neither bounds the other.
