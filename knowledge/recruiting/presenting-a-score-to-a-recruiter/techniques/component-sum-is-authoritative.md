---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: component-sum-is-authoritative
status: forged
laws: [say-only-what-the-record-holds, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a headline score sits above a component breakdown, a total and its parts disagree, designing a weighted scoring contract]
---

# The component sum is authoritative

The named concern: **a headline figure and the breakdown beneath it are two
renderings of one claim, and the viewer will check one against the other.**
Not with a calculator — by eye, in about two seconds, from the bar lengths.
When those two readings disagree, the screen is telling two stories about a
person with no signal which is right, and the damage is not confined to the
one wrong figure. A report caught contradicting itself once is discounted
wholesale afterwards.

So the invariant is definitional, not aspirational: **the total is defined as
the sum of its parts.** Not "should equal". Is.

## Why divergence happens even when the maths is right

Totals and components usually arrive by different paths. A generated analysis
emits a headline figure *and* per-dimension figures as separate fields; a
cache holds a total computed under a previous weighting; a partial run fills
some dimensions and not others; a schema change renames a dimension and the
total keeps counting it while the breakdown stops showing it. In every case
the pipeline mints the total from the producer's own number rather than
recomputing it, and a single bad generation yields a headline reading 82 above
bars that visibly add to 74.

None of these are arithmetic bugs. They are **contract** bugs, and they are
only detectable at the boundary where both representations meet — which is
the formatter, not the model.

## The contract

Put the whole breakdown on **one scale** so that the sum is meaningful:

- each dimension carries its **percent** (how well the candidate did on that
  dimension, 0–100 of that dimension alone),
- its **weight** (the dimension's share of the whole, in the same units as
  every other weight),
- and its **contribution** (percent × weight, expressed in points of the
  final score);
- **weights sum to the whole** — a fixed total, checked, not assumed;
- **contributions sum to the headline** — this is the invariant.

Mixing scales inside one breakdown is the quiet version of the same failure: a
row whose "score" is out of 5 beside rows out of 100 produces a bar chart that
is visually a lie even when every number in it is correct.

## The procedure

1. **Compute the sum of contributions at format time**, in the same function
   that produces the display total.
2. **Compare against the producer's headline with a tolerance stated in
   displayed units** — typically half of the smallest unit you render. A
   tolerance expressed in floating-point epsilon is not a tolerance, it is a
   guarantee of false positives.
3. **On divergence, recompute: pin the displayed total to the component sum.**
   The parts are the evidence; the headline is the claim. Where they conflict,
   [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)
   resolves it — the record holds the components.
4. **Emit a diagnostic on every recompute**, carrying both figures and the
   producer identity. Silent correction hides a producer that is drifting, and
   the recompute is a patch on the display, not a fix of the cause. Route the
   diagnostic where it reaches an engineer and not a recruiter: loud in
   development and in tests, quiet in production, and de-duplicated per record
   so one bad generation cannot flood a session.
5. **Run the check once per record on load, not on the render of a panel.**
   If the assertion lives inside the breakdown component, it only fires when
   someone opens that tab — and the case you most need to catch is the one
   where nobody opened it and the headline figure was acted on alone.
6. **Have the rubric owner emit the breakdown render-ready**, already on one
   scale, with percent, weight and contribution all computed. Every arithmetic
   step the display layer performs is an opportunity to produce a second,
   divergent version of the total using a slightly different rule.
7. **Round once, at the end, with a remainder rule.** Round each contribution
   for display and the total independently and you will re-introduce the
   divergence you just fixed. Round the parts, then assign the rounding
   residue to the largest component (largest-remainder), so the displayed
   parts sum exactly to the displayed total.

## Fix it at the producer, and keep the display check anyway

Pinning the display to the sum is a patch. The durable fix is at the source:
the persisted total is *computed* as the component sum and the generator's own
claimed total is never trusted for it. Two things follow that are easy to get
wrong.

**Do not delete the generator's claimed total — demote it to a sanity
signal.** Once the persisted figure is derived, the model's own headline
number is free to be what it always was: a statement about the generator's
coherence. Comparing the two, past a stated tolerance, turns a quiet
generation defect into a reviewable observation. A model that regularly
contradicts its own breakdown is drifting on more than the total.

**Keep the display-side reconciliation after the producer is fixed.** It is
cheap, it covers records written before the fix, and it covers the next
producer nobody told you about. Guard it against non-finite components — a
malformed value counts as zero in the sum rather than poisoning the total with
a non-number, so a bad record degrades to a wrong figure you can see instead
of a blank card.

## Decision rules

- **When the breakdown is incomplete, do not scale the remainder up to
  compensate.** A run that assessed four of six dimensions produces a partial
  score over the weight actually assessed, labelled as partial — not a
  full-looking total. Renormalizing silently converts missing evidence into
  average performance.
- **When a dimension is unmeasured, it is a null row, not a zero
  contribution**, and it is removed from the weight base with the base stated.
  See absent-score-is-its-own-tier.
- **When the producer's headline is the one you trust more**, you have a
  design problem, not a display problem: either publish the components that
  actually produce it, or stop showing a breakdown. Showing a decorative
  breakdown beside an authoritative total is the worst of the three options —
  it invites verification it cannot survive.
- **Never resolve divergence by hiding the parts.** Collapsing the breakdown
  makes the contradiction unfalsifiable rather than absent, and it removes the
  only material a recruiter had for challenging the number.

## Verification you should actually have

A property test over generated breakdowns: for any set of dimensions with
weights summing to the whole, the formatted contributions sum to the formatted
total, at every rounding precision the interface uses. And a fixture built
from a *real* bad generation — a captured payload where the model's headline
disagreed with its own components — asserting that the display shows the sum.
A verdict is bound to what it judged
([a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged));
the components are what was judged.

## When not to use this

- **When the total is not a weighted composition.** A calibrated model output,
  a percentile against a population, or a threshold distance is not the sum of
  the factors displayed near it. Do not fake an additive breakdown for such a
  figure — show the drivers as *influences* with their own grammar, and never
  render them as bars that look addable.
- **When the components are illustrative excerpts** of a much larger factor
  set. Then either show the whole set or state the coverage; a partial
  breakdown presented as complete fails the eye test the same way.
