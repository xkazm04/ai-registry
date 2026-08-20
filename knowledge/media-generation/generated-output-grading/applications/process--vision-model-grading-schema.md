---
layer: application
type: application
subject: generated-output-grading
technique: vision-model-grading-schema
status: forged
stack: process
---

# A worked judge-selection guide — grading models and metrics, August 2026

The vision-model-grading-schema technique defines *what* a grader answers;
this application records *which graders* to hire per question, as of
2026-08, sourced and dated. The tier structure follows the technique's
cost logic: deterministic detectors first, cheap learned scorers second,
strong vision-language judges last.

## Tier 0 — deterministic detectors (the veto tier)

**Text-leak detection: use an OCR model, not a vision-language judge.**
PaddleOCR-class pipelines return bounding boxes + confidence at
milliseconds per image on CPU; the rule "any confident text detection in a
no-text project = unconditional fail" is deterministic, immune to judge
hallucination, and catches the small rendered text VLM judges miss.
Confidence/area thresholds filter watermark-scale noise. This upgrades the
unconditional-fail-criteria technique's veto check from a judged question
to a measured one.

## Tier 1 — cheap learned scorers (pre-filter, not verdict)

- **Preference scorers** — HPSv3 (2025, VLM-backbone, uncertainty-aware;
  current SOTA), ImageReward, PickScore. Locally runnable at ~zero cost;
  good for ranking candidates before an expensive judge. **They measure
  generic human preference, not style adherence** — a high score means
  "pleasing", never "on-brief".
- **Adherence metrics** — VQAScore (probability a VLM answers "Yes" to
  "Does this figure show {prompt}?") clearly outperforms CLIPScore on
  compositional adherence (attribute binding, spatial relations,
  negation); CLIPScore's bag-of-words encoder scores "horse eating grass"
  ≈ "grass eating horse". Use VQAScore with an open VLM backbone as the
  cheap adherence pass; keep CLIPScore for coarse dedup/retrieval only.

## Tier 2 — vision-language judges (the judged questions)

Findings that shape the protocol, regardless of which judge is hired:

- **Judges rank reliably but score unreliably.** Across frontier and open
  judges, independent scalar scoring shows high variance while pairwise
  comparison stays stable. Prefer head-to-head verdicts or coarse
  pass/fail bands over 1–10 rubrics; treat scalar-score disagreement as
  partly noise (see the two-grader-disagreement-rule's boundary note).
- **Measured biases require protocol, not trust:** position bias (order
  reversal flips verdicts — always judge both orders), verbosity bias
  (stronger than position bias in multimodal judges), self-preference
  (never let a judge grade its own family's generations), and
  text-side-only judging (judges sometimes score without truly reading
  the image — pair with a Tier-0/1 check that must agree).
- **Open-weight judges (Molmo, InternVL3, Pixtral class) miss fine-grained
  failures** — wrong counts, attribute/colour mismatch (FineGRAIN,
  NeurIPS 2025) — so counting and attribute checks need frontier judges
  or structured VQA decomposition into yes/no sub-questions.

## The open questions a local benchmark settles

No published head-to-head covers frontier judges on a studio's own failure
taxonomy, and per-judge scalar stability is unquantified for current
models. Both are cheap to measure locally: (a) same image, same rubric,
N repeats per judge — scalar variance vs pairwise flip rate; (b) fixture
pairs with known style match/mismatch — judge accuracy. See the appendix
below for one such probe run against this registry's own fixtures.

## Appendix — local probe, 2026-08-20 (smallest discriminating run)

Fixtures: an existing style-lock experiment triple (anchor / conditioned /
control) with known ground truth — the conditioned image matched the anchor
for human raters 67% vs the control's 33% in the original measured run.
Judge: one frontier VLM family (Claude-class), independent fresh-context
calls. **n=5 per probe — a protocol calibration, not a vendor ranking.**

- **Scalar probe** (one image vs a countable textual style contract, score
  1-10, 5 repeats): **5/5 identical scores (7)**, with all five judges
  independently naming the same three defects. Zero variance.
- **Pairwise probe** (two images vs the anchor *image*, no textual
  contract, order alternated, 5 repeats): the known-better image won only
  **3/5**, with wrong verdicts occurring in *both* presentation orders,
  and judges disagreeing about which image carried the drop shadows.

Read against the literature's "rank reliably, score unreliably": in this
setup the relationship **inverted**, and the probes differ in exactly one
craft-relevant way — the scalar probe had a countable rubric, the pairwise
probe a holistic similarity question. Working hypothesis, consistent with
this bundle's own unconditional-fail and countable-rubric doctrine: **the
stability lever is rubric countability, not verdict format** — a pairwise
question with no contract inherits the instability, a scalar question with
countable checks escapes it. The 3/2 pairwise split is also precisely the
case the two-grader-disagreement rule routes to a human. Confounds stated:
one judge family, one fixture triple, probes differ in image count as well
as rubric form; replicate across families and fixtures before promoting
this beyond an appendix.

## Sources (accessed 2026-08-20)

- https://linzhiqiu.github.io/papers/vqascore/ · https://arxiv.org/pdf/2404.04251 (VQAScore)
- https://arxiv.org/html/2505.00759v1 (T2IScoreScore — ranking adherence metrics)
- https://arxiv.org/pdf/2604.25235 (VLM judges can rank but cannot score)
- https://arxiv.org/pdf/2604.18164 · https://arxiv.org/pdf/2604.17768 · https://llm-judge-bias.github.io/ (judge biases)
- https://arxiv.org/pdf/2508.03789 (HPSv3) · https://github.com/p1atdev/ImageReward-PickScore
- https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/OCR.en.md
- https://arxiv.org/abs/2512.02161 (FineGRAIN)
