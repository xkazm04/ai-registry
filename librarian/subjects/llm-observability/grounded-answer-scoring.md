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

## Architecture review - 2026-10-31

First architecture review, against `b3879e1d2`. The five techniques hold against
their primary sources: the FActScore, claim-decomposition and Ragas papers were
re-opened, and their quotations and figures match. The applications' code citations
were spot-checked against the pinned legacy ragas files, and every one checked matched.
One defect was found: the question-blind-relevance application quotes the Ragas paper
as generating questions "based only on the answer", and those words are not in the
paper. The private second tree is not reopened, so that application stays `reverify`.
No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/grounded-answer-scoring",
  "date": "2026-10-31",
  "baseline": "b3879e1d2",
  "digest": "sha256-b2:091141c8a6b3a7cb",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full. Primary sources opened this run: the FActScore abstract, the Ragas paper PDF (Section 3 and Table 1) and arXiv:2403.11903 (abstract, plus HTML Sections 3 and 3.2). The four legacy ragas metric files at commit 298b6827 were fetched and the cited lines compared. Not evaluated: the ragas `collections/` rewrites, the docs pages, the quoted-spans files, and the private second tree in the decompose-then-verify application. Nothing was executed and no verification date was refreshed.",
  "counterexamples": [
    "A verifier that returns three verdicts for five issued claims raises a supported-over-returned fraction even though no claim's support changed (ragas faithfulness divides by returned verdicts).",
    "A low-coverage decomposition of 'a French mathematician, philosopher, and food critic' keeps only the true nouns, so precision reads 1.0 for a half-false answer.",
    "Three sampled reconstructions where two flag the answer noncommittal: under an all-must-agree rule the answer keeps its full similarity.",
    "A passage carrying a correct detail the reference omitted is labelled irrelevant, so a claim drawn from it is filed as misled by noise rather than as correct."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2305.14251",
      "result": "FActScore abstract: generations mix supported and unsupported pieces, 'making binary judgments of quality inadequate'; the automated estimator works 'with less than a 2% error rate'. Supports the golden path and decompose-then-verify."
    },
    {
      "url": "https://arxiv.org/html/2403.11903",
      "result": "Verbatim: metrics 'attribute overall textual support to the model that generated the text' 'even though error can also come from the metric's decomposition step'; Section 3: 'the decomposition step can introduce unclaimed information or omit existing (possibly incorrect) claims'. DecompScore counts supported subclaims judged against the original sentence and does not check omission directly. Supports the-decomposer-is-inside-the-instrument."
    },
    {
      "url": "https://arxiv.org/pdf/2309.15217",
      "result": "Table 1: answer relevance 0.78 (Ragas), 0.52 (GPT Score), 0.40 (GPT Ranking). WikiEval: '50 Wikipedia pages'. Annotators agreed 'in around 90% of the cases' for answer relevance. Method: 'we prompt the LLM to generate n potential questions qi based on as(q)', prompt 'Generate a question for the given answer.', then mean cosine. The phrase 'based only on the answer' does not appear: this refutes the application's quotation, not its substance."
    },
    {
      "url": "https://github.com/vibrantlabsai/ragas/tree/298b68274234c060deacab3cf5fb52aa3a20e885/src/ragas/metrics",
      "result": "Fetched _answer_relevance.py, _factual_correctness.py, _faithfulness.py and _noise_sensitivity.py at the pinned commit. Every spot-checked cited line matches the applications. Source read, not executed."
    }
  ],
  "documents": {
    "grounded-answer-scoring.md": {
      "disposition": "keep",
      "reason": "Boundaries against the contract, calibration, generator-uncertainty and production-trace subjects are explicit and consistent with the techniques. The atomic-fact claim (binary judgment inadequate, estimator under a 2% error rate) matches the FActScore abstract. The judged-usefulness paragraph correctly names the answer-referenced variant as circular."
    },
    "techniques/decompose-then-verify.md": {
      "disposition": "keep",
      "reason": "Procedure, the zero-claims-unscored rule and the quotation normalization boundaries are sound. The FActScore figures ('less than a 2% error rate', binary judgments 'inadequate') match the primary abstract, and the one-domain caveat is stated."
    },
    "techniques/the-decomposer-is-inside-the-instrument.md": {
      "disposition": "keep",
      "reason": "Both quotations from arXiv:2403.11903 are verbatim ('even though error can also come from the metric's decomposition step'; 'can introduce unclaimed information or omit existing (possibly incorrect) claims'). Its reading of DecompScore as counting supported subclaims against the original sentence, with no direct omission check, matches the paper's Section 3.2. The granularity arithmetic (0 of 1 against 3 of 4) holds."
    },
    "techniques/bidirectional-claim-matching.md": {
      "disposition": "keep",
      "reason": "The own-claim-set rule and its example (ten supported answer claims covering one of two reference claims: recall 0.5, not 10/11) are arithmetically correct. The weighting, mode and empty-side rules are consistent with the golden path."
    },
    "techniques/per-source-attribution.md": {
      "disposition": "keep",
      "reason": "Bucket precedence makes the buckets exclusive and summing to one. The cost example ((10+10) x 5 = 100, plus 10 against the reference) supports 'about a hundred'. The reference-defined-relevance caveat is stated."
    },
    "techniques/question-blind-relevance.md": {
      "disposition": "keep",
      "reason": "The Ragas paper's figures are reproduced correctly: Table 1 answer relevance 0.78 for Ragas against 0.52 for GPT Score, WikiEval built from 50 Wikipedia pages, and annotators agreeing 'in around 90% of the cases' for answer relevance. It is properly scoped as an authors' own ranking result."
    },
    "applications/python--decompose-then-verify.md": {
      "disposition": "reverify",
      "reason": "Spot-checked at the pinned commit: faithfulness `_compute_score` divides by returned verdicts and returns NaN when empty (`_faithfulness.py:182-194`); factual correctness precision is `tp / (tp + fp + 1e-8)` (`_factual_correctness.py:290`). Rewrite (`collections/`) and quoted-spans citations were not reopened. The second-tree experiment rests on a private tree that was not re-read. verified_on unchanged."
    },
    "applications/python--the-decomposer-is-inside-the-instrument.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit. The Babbage exemplar keyed low/low drops 'French' and 'food critic' (`_factual_correctness.py:48-61`), and atomicity and coverage both default to 'low' (`:194-195`). On an exemplar-key mismatch the examples list is emptied and a warning is logged (`:208-218`). Faithfulness divides by `len(answers.statements)`. Rewrite paths were not reopened, so verified_on is unchanged."
    },
    "applications/python--bidirectional-claim-matching.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: `tp`, `fp` and `fn` are assembled as described (`_factual_correctness.py:282-287`). Precision mode substitutes an empty bool array for the reverse task, the score returns as `np.round(score, 2)`, and mode and beta are declared literals. Recomputed: tp=10, fp=0, fn=1 gives recall 0.909 and F1 0.952, against 0.50 and 0.67 within each claim's own set. Rewrite paths were not reopened, so verified_on is unchanged."
    },
    "applications/python--per-source-attribution.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit. `_compute_score` (`_noise_sensitivity.py:87-111`) gives precedence to relevant passages via `irrelevant_faithful &= ~relevant_faithful`. The per-passage loop issues two calls per passage plus one against the reference (`:154-173`). Recomputed the worked example: 0.25 / 0.25 / 0.75 / 0.25 residual. The docs page and rewrite were not reopened, so verified_on is unchanged."
    },
    "applications/python--question-blind-relevance.md": {
      "disposition": "clarify",
      "reason": "Code claims hold at the pinned commit: the prompt input model has only `response`, the score is `cosine_sim.mean() * int(not all_noncommittal)` with `np.all`, and NaN appears only when every question is empty (`_answer_relevance.py:115-127`). The paper figures are right too (0.78 against 0.52, 50 pages). But the quotation 'based only on the answer' is not in the paper. It says the LLM is prompted 'to generate n potential questions qi based on' the answer, with the prompt 'Generate a question for the given answer.' Replace the misquote."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

The misquotation in the question-blind-relevance application was replaced with the
paper's own wording. That application's substance (the question is withheld, mean
cosine, the 0.78 against 0.52 figure) was already correct. The remaining `reverify`,
on the decompose-then-verify application's private tree, is now the overall
disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/grounded-answer-scoring",
  "date": "2026-10-31",
  "baseline": "b3879e1d2",
  "digest": "sha256-b2:9db3554a2d81b4a5",
  "disposition": "reverify",
  "coverage": "The single clarify item from the first 2026-10-31 record (the python--question-blind-relevance misquote) was applied and the edited paragraph re-read. The other 10 documents are byte-unchanged and keep their dispositions. Same evidence boundary as the first record: the rewrites, docs pages, quoted-spans files and private tree were not reopened, and no verification date was refreshed.",
  "counterexamples": [
    "A verifier that returns three verdicts for five issued claims raises a supported-over-returned fraction even though no claim's support changed (ragas faithfulness divides by returned verdicts).",
    "A low-coverage decomposition of 'a French mathematician, philosopher, and food critic' keeps only the true nouns, so precision reads 1.0 for a half-false answer.",
    "Three sampled reconstructions where two flag the answer noncommittal: under an all-must-agree rule the answer keeps its full similarity.",
    "A passage carrying a correct detail the reference omitted is labelled irrelevant, so a claim drawn from it is filed as misled by noise rather than as correct."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2305.14251",
      "result": "FActScore abstract: generations mix supported and unsupported pieces, 'making binary judgments of quality inadequate'; the automated estimator works 'with less than a 2% error rate'. Supports the golden path and decompose-then-verify."
    },
    {
      "url": "https://arxiv.org/html/2403.11903",
      "result": "Verbatim: metrics 'attribute overall textual support to the model that generated the text' 'even though error can also come from the metric's decomposition step'; Section 3: 'the decomposition step can introduce unclaimed information or omit existing (possibly incorrect) claims'. DecompScore counts supported subclaims judged against the original sentence and does not check omission directly. Supports the-decomposer-is-inside-the-instrument."
    },
    {
      "url": "https://arxiv.org/pdf/2309.15217",
      "result": "Table 1: answer relevance 0.78 (Ragas), 0.52 (GPT Score), 0.40 (GPT Ranking). WikiEval: '50 Wikipedia pages'. Annotators agreed 'in around 90% of the cases' for answer relevance. Method: 'we prompt the LLM to generate n potential questions qi based on as(q)', prompt 'Generate a question for the given answer.', then mean cosine. The phrase 'based only on the answer' does not appear: this refutes the application's quotation, not its substance."
    },
    {
      "url": "https://github.com/vibrantlabsai/ragas/tree/298b68274234c060deacab3cf5fb52aa3a20e885/src/ragas/metrics",
      "result": "Fetched _answer_relevance.py, _factual_correctness.py, _faithfulness.py and _noise_sensitivity.py at the pinned commit. Every spot-checked cited line matches the applications. Source read, not executed."
    }
  ],
  "documents": {
    "grounded-answer-scoring.md": {
      "disposition": "keep",
      "reason": "Boundaries against the contract, calibration, generator-uncertainty and production-trace subjects are explicit and consistent with the techniques. The atomic-fact claim (binary judgment inadequate, estimator under a 2% error rate) matches the FActScore abstract. The judged-usefulness paragraph correctly names the answer-referenced variant as circular."
    },
    "techniques/decompose-then-verify.md": {
      "disposition": "keep",
      "reason": "Procedure, the zero-claims-unscored rule and the quotation normalization boundaries are sound. The FActScore figures ('less than a 2% error rate', binary judgments 'inadequate') match the primary abstract, and the one-domain caveat is stated."
    },
    "techniques/the-decomposer-is-inside-the-instrument.md": {
      "disposition": "keep",
      "reason": "Both quotations from arXiv:2403.11903 are verbatim ('even though error can also come from the metric's decomposition step'; 'can introduce unclaimed information or omit existing (possibly incorrect) claims'). Its reading of DecompScore as counting supported subclaims against the original sentence, with no direct omission check, matches the paper's Section 3.2. The granularity arithmetic (0 of 1 against 3 of 4) holds."
    },
    "techniques/bidirectional-claim-matching.md": {
      "disposition": "keep",
      "reason": "The own-claim-set rule and its example (ten supported answer claims covering one of two reference claims: recall 0.5, not 10/11) are arithmetically correct. The weighting, mode and empty-side rules are consistent with the golden path."
    },
    "techniques/per-source-attribution.md": {
      "disposition": "keep",
      "reason": "Bucket precedence makes the buckets exclusive and summing to one. The cost example ((10+10) x 5 = 100, plus 10 against the reference) supports 'about a hundred'. The reference-defined-relevance caveat is stated."
    },
    "techniques/question-blind-relevance.md": {
      "disposition": "keep",
      "reason": "The Ragas paper's figures are reproduced correctly: Table 1 answer relevance 0.78 for Ragas against 0.52 for GPT Score, WikiEval built from 50 Wikipedia pages, and annotators agreeing 'in around 90% of the cases' for answer relevance. It is properly scoped as an authors' own ranking result."
    },
    "applications/python--decompose-then-verify.md": {
      "disposition": "reverify",
      "reason": "Spot-checked at the pinned commit: faithfulness `_compute_score` divides by returned verdicts and returns NaN when empty (`_faithfulness.py:182-194`); factual correctness precision is `tp / (tp + fp + 1e-8)` (`_factual_correctness.py:290`). Rewrite (`collections/`) and quoted-spans citations were not reopened. The second-tree experiment rests on a private tree that was not re-read. verified_on unchanged."
    },
    "applications/python--the-decomposer-is-inside-the-instrument.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit. The Babbage exemplar keyed low/low drops 'French' and 'food critic' (`_factual_correctness.py:48-61`), and atomicity and coverage both default to 'low' (`:194-195`). On an exemplar-key mismatch the examples list is emptied and a warning is logged (`:208-218`). Faithfulness divides by `len(answers.statements)`. Rewrite paths were not reopened, so verified_on is unchanged."
    },
    "applications/python--bidirectional-claim-matching.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: `tp`, `fp` and `fn` are assembled as described (`_factual_correctness.py:282-287`). Precision mode substitutes an empty bool array for the reverse task, the score returns as `np.round(score, 2)`, and mode and beta are declared literals. Recomputed: tp=10, fp=0, fn=1 gives recall 0.909 and F1 0.952, against 0.50 and 0.67 within each claim's own set. Rewrite paths were not reopened, so verified_on is unchanged."
    },
    "applications/python--per-source-attribution.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit. `_compute_score` (`_noise_sensitivity.py:87-111`) gives precedence to relevant passages via `irrelevant_faithful &= ~relevant_faithful`. The per-passage loop issues two calls per passage plus one against the reference (`:154-173`). Recomputed the worked example: 0.25 / 0.25 / 0.75 / 0.25 residual. The docs page and rewrite were not reopened, so verified_on is unchanged."
    },
    "applications/python--question-blind-relevance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced the misquotation 'based only on the answer' with the paper's wording ('to generate n potential questions' from the answer, prompt 'Generate a question for the given answer.'). The code claims at the pinned commit and the paper figures (0.78 against 0.52, 50 pages) were re-checked this run. Rewrite paths and the docs page were not reopened, so verified_on is unchanged."
    }
  }
}
```
