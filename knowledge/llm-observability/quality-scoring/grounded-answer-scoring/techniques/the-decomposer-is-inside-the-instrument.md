---
layer: technique
type: technique
subject: grounded-answer-scoring
technique: the-decomposer-is-inside-the-instrument
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, estimation-announces-itself]
shared_with: []
use_when: [a claim-level score moved and the answers did not, choosing coverage or granularity settings for a claim decomposer, calibrating a pipeline that has a decomposer as well as a verifier]
---

# The decomposer is inside the instrument

The concern: a claim-level score measures the decomposition as well as the
answer. The score attributes the answer's support to the model that wrote
the answer, but error can also come from the step that cut the answer into
claims, and unless the pipeline measures the cutter separately that error is
charged to the generator. A published study of claim decomposition stated
the mechanism in those terms: the same generations received different
per-claim factuality scores depending only on which decomposition method
was used, because the metric attributes overall support to the generator
"even though error can also come from the metric's decomposition step". The
decomposition step "can introduce unclaimed information or omit existing
(possibly incorrect) claims". Both directions are measurement error, and
they bias the score in opposite ways.

## Omission raises the score

A claim the decomposer drops can never be marked unsupported. Take an
answer that says a person was "a French mathematician, philosopher, and
food critic", where the nationality and the third profession are false. A
low-coverage
decomposition that keeps the main nouns writes "was a mathematician and
philosopher" and sheds the nationality and the third profession. Every
surviving claim is supported, and a precision score over them reads perfect
for an answer that is half false. Coverage is therefore a correctness
setting, not a verbosity setting, and a scoring pipeline runs at full
coverage unless a stated reason says otherwise.

## Addition lowers it

A decomposer that resolves a reference wrongly, or supplies a detail from
its own knowledge to make a claim standalone, produces a claim the answer
never made. If the evidence does not support it, the answer is charged for
the decomposer's invention. The standalone requirement makes this pressure
constant: every resolved pronoun is a small act of authorship.

## Decision rules

- **Count verdicts against claims issued.** The denominator is the number of
  claims the decomposer issued, never the number of verdicts the verifier
  returned. A verifier that silently returns fewer verdicts than it was
  given (truncation, a dropped item, a merged pair) raises a
  supported-over-returned fraction. Match every verdict to its claim by
  identity; a claim with no verdict is a failed verdict, and a verdict for a
  claim that was never issued is a parse failure. The mismatch count rides
  the score, per
  [estimation-announces-itself](../../../_laws.md#estimation-announces-itself).
- **Pin granularity, and never compare across it.** One compound claim
  judged unsupported is 0 of 1; the same content cut into four atomic claims
  with one unsupported is 3 of 4. The fraction moved and the answer did not.
  Granularity is part of the scoring contract, versioned with it, stamped on
  every score, and a trend line that crosses a granularity change is two
  trend lines.
- **The exemplar set is a contract component.** Decomposers take most of
  their granularity and coverage from worked examples, not from instruction
  text. Swapping, reordering, trimming or translating the examples changes
  the instrument exactly as editing the instruction does, and gets the same
  versioning. A selector that silently falls back to a default example set
  when the requested one is missing has changed the instrument without
  saying so.
- **The decomposer does not see what would let it select.** Given the
  question, a decomposer can quietly omit claims it judges off topic, and
  those are never verified. Supply the answer; if resolving references
  needs the question, instruct resolution only and measure omission.
- **Measure the decomposer with its own labeled row.** Verdict agreement
  with humans, the calibration subject's
  [golden-set agreement](../../judge-calibration-and-drift/techniques/golden-set-agreement-measurement.md),
  says nothing about whether the claims covered the answer. A decomposition
  check needs both directions: every claim entailed by the original answer
  (catches addition), and every assertion in the original answer present in
  some claim (catches omission). The published decomposition-quality measure
  checks only the first, counting claims the original sentence supports; it
  rewards coherent claims and cannot see a dropped one. Label omission
  directly, on a stratum that includes answers with trailing lists and
  qualifiers, because that is where omission lives. This is the one new
  calibration obligation this subject adds, per
  [the-judge-is-both-untrusted-and-under-test](../../../_laws.md#the-judge-is-both-untrusted-and-under-test).
- **Changing the decomposer model is an instrument change.** Re-run the
  decomposition row and the verdict row, paired, before comparing any score
  across the change.

## When not to use it

When the answer is decomposed mechanically (one claim per extracted field
of a structured output, one per quotation), the cut is deterministic and
its error is a bug to test, not a model to calibrate. When scores are only
ever compared within one frozen pipeline configuration and never trended
across changes, the granularity and exemplar rules still hold but the
separate calibration row can wait until the first change.
