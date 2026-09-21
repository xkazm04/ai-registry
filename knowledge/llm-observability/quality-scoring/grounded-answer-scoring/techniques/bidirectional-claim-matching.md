---
layer: technique
type: technique
subject: grounded-answer-scoring
technique: bidirectional-claim-matching
status: forged
laws: [estimation-announces-itself, nullable-never-zero]
shared_with: []
use_when: [a written reference answer exists for the case, a score must penalize both invented and missing content, a short safe answer is outscoring a complete one]
---

# Bidirectional claim matching

The concern: when a reference answer exists, checking the answer's claims
against it in one direction rewards a failure mode. Answer claims verified
against the reference measure precision, and precision alone rewards the
short, safe answer that says one true thing and stops. Reference claims
verified against the answer measure recall, and recall alone rewards
padding: the answer that says everything, including things that are wrong,
covers the reference. Check claims in both directions and combine the two
under a declared weighting.

## The procedure

1. Decompose the answer into claims; verify each against the reference.
   Supported answer claims over answer claims issued is **precision**.
2. Decompose the reference into claims with the same decomposer settings;
   verify each against the answer. Reference claims the answer supports over
   reference claims issued is **recall**.
3. Combine with a weighted harmonic mean whose weight is declared: equal
   weight when invention and omission cost the same, recall weighted up
   when a missing step is the expensive failure (instructions, safety
   caveats), precision weighted up when a wrong statement is (medical,
   financial, legal facts).

The reference decomposition can be computed once per case and reused across
every system and run scored against that case, which halves the recurring
cost and, more usefully, freezes the recall denominator: every run is
measured against the same reference claims.

## Decision rules

- **Compute each fraction within its own claim set.** Precision's numerator
  and denominator both count answer claims; recall's both count reference
  claims. Do not assemble recall from supported answer claims plus
  unsupported reference claims: the two decompositions have different
  sizes, and mixing their counts makes recall track how finely the answer
  was cut rather than how much of the reference it covered. An answer cut
  into ten supported claims that covers one of two reference claims has
  recall 0.5, not ten over eleven.
- **The weighting is part of the number's predicate.** A combined score
  quoted without its weight, its mode (precision only, recall only, or
  combined) and the decomposer's granularity is a number without units. All
  three ride the score, per
  [estimation-announces-itself](../../../_laws.md#estimation-announces-itself),
  and scores under two weightings are never trended together.
- **A precision-only mode may skip the reverse decomposition, and must say
  so.** It is a legitimate cost saving. It is also a different metric, and a
  dashboard that shows it beside combined scores under one name is
  comparing two instruments.
- **Empty sides are unscored, not zero.** An answer with no claims has
  undefined precision; a reference with no claims has undefined recall.
  Returning zero through a tiny added epsilon in the denominator converts an
  admission into a measurement, per
  [nullable-never-zero](../../../_laws.md#nullable-never-zero).
- **Know which failure each yardstick sees.** Checking against evidence the
  system retrieved (the decompose-then-verify technique) catches
  unsupported claims; checking against a reference someone wrote catches
  incorrect and missing ones. A system can pass one and fail the other: an
  answer faithfully restating a stale passage is supported and incorrect,
  and an answer correct from the generator's own knowledge is correct and
  unsupported. Report both where both inputs exist; neither substitutes for
  the other.
- **The reference is an answer, not the truth.** A reference that omits a
  correct detail makes the answer's correct extra claim read as unsupported.
  Where a reference is known to be partial, weight toward recall and read
  low precision as a lead to review, not a fault.

## When not to use it

When there is no reference, there is no second direction; use
decompose-then-verify against evidence and state that correctness was not
measured. When the reference is a single short fact, a mechanical match is
exact and free. When many different answers are equally correct (open-ended
advice, creative text), recall against one reference penalizes valid
alternatives, and a rubric dimension is the honest instrument.
