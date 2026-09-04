---
layer: technique
type: technique
subject: generator-uncertainty-scoring
technique: scorer-cost-class
status: forged
laws: [quality-apparatus-stays-unbudgeted, never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [choosing a scorer for high-volume traffic, a serving API does not return token probabilities, deciding whether scoring may run inside the serving path, judge spend is growing faster than traffic]
stage: team
---

# Scorer cost class

The concern: scorer selection is normally framed as an accuracy question,
and at production volume that framing produces a system nobody can afford
to run at the coverage it needs. The tiers available differ in marginal
cost by orders of magnitude and, more importantly, differ in *kind* — one
is free, one multiplies the generation bill, one adds a second model to the
critical path of the budget. Cost class is therefore the **first**
selection input. Accuracy is the tiebreaker among the tiers you can afford
at the coverage you require, not the criterion that picks the tier.

## The ladder

**Tier 0 — single-generation white-box.** The score is computed from the
token probabilities the serving call already returned: how low the least
confident token was, how the sequence probability reads once normalized for
length, how much entropy sat over the top few alternatives at each step.
No additional call, no additional token, no additional latency. The
marginal cost is arithmetic over data already in hand.

**Tier 1 — N-sample consistency.** The generator answers the same prompt N
times and the score is the agreement among the answers: how many distinct
meanings appeared, how often they entail or contradict one another, how
often an exact match recurred. Cost and latency multiply by N. It works
against any model that returns text, which is its whole appeal.

**Tier 2 — a judge.** A separate metered call to a second model, reading a
stored contract. It brings everything the other tiers lack — coverage of
dimensions no distribution encodes — and everything they lack the burden
of: a rubric to maintain, drift to detect, agreement with humans to earn.

## The precondition that decides whether tier 0 exists at all

Tier 0 is reachable only when **the serving API exposes its own token
probabilities**. This is binary and it is not negotiable with money. Many
providers do not return them; some return them only on some models, or only
through some client paths, and a gateway in front of the model can drop
them without saying so. A self-hosted deployment always has them; a
third-party endpoint may never.

So the precondition is a **capability check performed at configuration
time, not a hope checked per call**. A system that discovers per-request
that probabilities are missing has already committed to a scoring policy it
cannot execute, and its options at that point are all bad.

## Decision rules

- **When probabilities are available and the dimension is expressible over
  them, take tier 0.** It is the only tier whose coverage can be one
  hundred percent of traffic without a cost conversation, and full coverage
  at moderate accuracy beats a sampled fraction at high accuracy for
  anything used to *find* problems rather than to certify them.
- **When probabilities are unavailable, degrade to tier 1 and say so on the
  score.** Never silently substitute. The two tiers measure different
  things at different prices, and a fleet where half the traffic is scored
  one way and half the other, with no field recording which, has a quality
  trend that is partly a record of provider capability
  ([_laws: never-present-absence-as-an-answer_](../../../_laws.md#never-present-absence-as-an-answer)).
- **When neither tier is reachable and the budget will not carry a judge,
  record a null with a reason.** Not zero. A zero confidence is a
  measurement asserting the model was maximally unsure; a null is the
  admission that nothing measured it
  ([_laws: nullable-never-zero_](../../../_laws.md#nullable-never-zero)).
- **When choosing N at tier 1, buy the elbow, not the ceiling.** The
  discrimination of consistency scorers rises steeply and then flattens: in
  a published sweep, hallucination-detection performance on one
  generator-and-dataset pair moved from roughly 0.54–0.57 at a single
  sample to roughly 0.75–0.80 at fifteen, approximately monotonically and
  with clear diminishing returns throughout. Fifteen was chosen there to
  make the comparison across scorers robust, not because it was the
  operating point; in production the operating point is wherever the curve
  bends for your own traffic, and it must be measured on your own traffic
  before N is fixed.
- **When a tier changes, treat it as an instrument change.** A trend that
  crosses a tier boundary is a method delta wearing a quality costume, and
  it is re-baselined, not compared through.

## The serving-path invariant, restated as a consequence

The rule that quality scoring is asynchronous and read-only against the
serving path — that it observes traffic and never gates it — is stated
elsewhere in this bundle without condition, and the only justification
offered for it is price: the judge is a metered call, and scoring unbounded
traffic is a cost function with no ceiling.

That justification is exactly right and exactly bounded. The invariant is a
**consequence of the scorer's cost class**, not a property of quality
scoring. It binds absolutely at tier 2, binds economically at tier 1
wherever the samples were not going to be drawn anyway, and does not bind
at all at tier 0, where the arithmetic runs on bytes the serving call
already produced.

Naming the premise is not a licence to relax the rule; it is a licence to
know *when* it applies. And the relaxation carries its own hazard: a tier-0
scorer in the serving path is quality apparatus whose cost has been folded
into the product's own cost, the arrangement
[_the quality apparatus stays unbudgeted_](../../../_laws.md#quality-apparatus-stays-unbudgeted)
exists to forbid. It is admissible only while the marginal cost is
genuinely zero. The moment such a scorer starts drawing extra samples, it
has silently promoted itself to tier 1 and belongs back on the segregated,
never-throttled scoring path.

## Failure modes

- **The unbounded judge bill.** Full-coverage judging adopted at low volume
  and never revisited, so the scoring bill tracks traffic linearly at
  metered prices and the first response to a spike is to blind the
  instrument.
- **The invisible tier swap.** A provider change drops token
  probabilities; the system falls back to fifteen extra generations per
  request and the generation bill quadruples with no code change and no
  alert.
- **The sampled tier used for coverage.** A tier-1 scorer at N of ten,
  applied to a few percent of traffic because that is all the budget
  allows, presented as a quality picture of the whole stream.
- **N chosen by citation.** A sample count copied from a published
  experiment, where it was set high deliberately to make cross-scorer
  comparison robust, and adopted as an operating point at fifteen times the
  necessary cost.

## When not to use it

Cost class does not choose a scorer on its own. It filters the set. Where
two tiers are both affordable at the required coverage, discrimination
decides between them — the gap the scorer opens between known-good and
known-bad outputs — and that is the neighbouring calibration subject's
criterion, unchanged and still binding. A cheap scorer that cannot separate
good from bad is not cheap; it is free of information.
