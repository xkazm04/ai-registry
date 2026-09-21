---
subject: grounded-answer-scoring
domain: llm-observability
last_touched: 2026-09-15
touched_by: intake
dry_streak: 0
---

# grounded-answer-scoring

Created by [[2026-09-15-ragas]]. It has five techniques, forged in session by one worker against an
XL spec written in the same run:
- `decompose-then-verify`
- `the-decomposer-is-inside-the-instrument`
- `bidirectional-claim-matching`
- `per-source-attribution`
- `question-blind-relevance`

It also has five source-tree applications against the public evaluation library the run mined.

## What the gap actually was

**A missing scoring procedure, not a missing opinion.** The category's judge subjects all score an
answer holistically against anchors. None models cutting an answer into claims, and none models the
error that cutting adds. `research-map` returned no prior art at all for "faithfulness". A concept grep
for entailment and decomposition found nothing in any scoring subject; its positive control was
`score-source-ensembling` mentioning entailment.

The XL trigger fired on count. Three design-record entries shared one home-if-new: decompose-then-verify,
bidirectional claim matching, and per-passage attribution.

## The keeper

`the-decomposer-is-inside-the-instrument`. A claim-level score measures the cut as well as the answer:
- **Omission raises it.** The default low-coverage exemplar drops exactly the false attributes.
- **Addition lowers it.**
- **The denominator must be claims issued, not verdicts returned.**

It is corroborated by arXiv:2403.11903, fetched in run. Its published decomposition measure checks only
additions, so the technique requires an omission check too.

## Boundaries stated

- **vs judge-contract-design:** a contract scores against anchors; this subject breaks the answer into
  checkable things and prices the break. question-blind-relevance names the mirror with
  reference-guided-grading: one withholds the candidate, the other the question.
- **vs retrieval evaluation (other bundle, prose only):** rank-weighted usefulness over judge-produced
  labels became a golden-path paragraph, not a technique. The worker argued that the reference-free
  variant is circular.
- **vs generator-uncertainty-scoring:** truth needs a judge or a reference, and this is where the judge
  reads evidence claim by claim.

## Applied

- **decompose-then-verify on athena-everywhere** (experiment, unmeasurable). The matrix judge's prompt
  is byte-identical whether tool results support or contradict the reply, so its grounding criteria are
  scored without evidence. The instrument owed is per-turn tool-result capture.
- **tracklight direction** (evidence slot plus `grounding` dimension kind): accepted at the 7.7 gate, built as
  a `task`, and merged into tracklight main as `8d1bfa5` (gate green, +1032 lines against ~350 proposed).
- **The other three techniques are unapplied.** Their return conditions are in the source note.

## Owed

- A law candidate is banked as a lead: "a denominator counts what was asked, not what was answered".
- The first live paired kappa (holistic against per-claim, on an unsupported-claim stratum) waits for a
  labeled grounded golden set.
