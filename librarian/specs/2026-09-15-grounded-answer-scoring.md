# XL spec — `grounded-answer-scoring`

- **Run:** `intake-ragas`
- **Source:** `repo:vibrantlabsai/ragas` @ `298b68274234c060deacab3cf5fb52aa3a20e885` (last commit 2026-02-24). Vendor repository, an LLM-evaluation library. Shallow clone at `C:/t/intake-ragas`, read-only, deleted at the run's Phase 9.
- **Status:** EXECUTED (2026-09-15, one forge worker; the director reviewed the diff). The worker's overrides, all accepted:
  - `verified_against` is `python@3.12` only on the three applications whose claims the worker executed. The gate refuses a commit as a version.
  - The spec said "0.0 in rewritten metrics" for zero claims, which is wrong for faithfulness (NaN in both versions). The 0.0 cases are factual correctness and the rewritten answer relevancy.
  - T3 gained a defect the spec missed: recall takes true positives from answer claims and false negatives from reference claims, so it divides across two claim sets. The director verified this at `_factual_correctness.py:282-292`.
  - T4 gained a third bucket: incorrect claims no passage supports (invention). The two documented modes plus that bucket reproduce the documented formula.
  - T5: the evasion flag zeroes the score only when every sample flags it.
  - `count-carries-predicate` is not a law in this bundle; `estimation-announces-itself` is cited instead.
  - Open question 1: `judged-context-usefulness` became a golden-path paragraph, not a technique.
  - Open question 2: T4 kept its own technique.
  - Proposed law, not written: "a denominator counts what was asked, not what was answered". It is banked as a lead in the source note.
- **Why XL and not four techniques:** the Phase 2d design record carries four decisions from the tree's metrics system whose `corpus:` line reads NONE. Three of them share one `HOME IF NEW`: decompose-then-verify grounding, bidirectional claim matching against a reference, and per-context attribution of unsupported claims. That fires the mechanical XL trigger. The fourth, scoring relevance with the judge blind to the question, completes the same pipeline. The nearest subjects each model a different instrument: `judge-contract-design` models an anchored rubric scored holistically, `judge-calibration-and-drift` models agreement with humans, and civic `groundedness-scoring-triage` models a verifier over claim–source pairs a structured pipeline already bound. None models how free prose is cut into verifiable claims, and none models the error the cutting adds. `research-map` returned **no prior art at all** for "faithfulness", and a concept grep for entailment or decomposition found nothing in any scoring subject (positive control: `score-source-ensembling` matched "entailment").

## Placement (verified against the authority)

`knowledge/llm-observability/taxonomy.json` — `layout: "nested"`, and it is the AUTHORITY.

- Category `quality-scoring` is flat and holds **6 subjects**: `cross-provider-benchmark-operations`, `judge-calibration-and-drift`, `judge-contract-design`, `production-trace-scoring`, `quality-regression-gating`, `generator-uncertainty-scoring`. Add `grounded-answer-scoring` as the **7th**, under the cap of 10, with no subcategories, so the both-kinds rule is not engaged. **Append to the category's `subjects` list; do not reorder it.**
- Resulting path: `knowledge/llm-observability/quality-scoring/grounded-answer-scoring/`. From a technique, `_laws.md` is `../../../_laws.md`, the same depth as `judge-contract-design/techniques/*`, which you should check by opening one. A sibling golden path is `../judge-contract-design/judge-contract-design.md`.
- **Not** `software-engineering/llm-agent/evaluation-and-cost/eval-harness`. That subject owns running scenarios repeatably, and its golden path defers what gets scored to the scoring side. It already holds 21 techniques.
- **Not** `software-engineering/llm-agent/prompt-and-context/retrieval`. Its `retrieval-evaluation` technique owns labeled retrieval metrics (recall@k, reciprocal rank, graded gain) over a curated query set. Cross-bundle links are forbidden, so where you mention it, state the discriminator in prose and do not link.

## The boundary this subject must state, and must NOT absorb

- **`judge-contract-design`** owns the contract object: dimensions, weights, anchors, floors, mechanical kinds, and nonce fencing. This subject owns **a scoring procedure that replaces one holistic dimension with a pipeline of small verdicts**. State the discriminator in the golden path's opening: *a contract asks how to score an answer against anchors; this subject asks how to break the answer into things that can each be checked against evidence, and what the breaking costs.* Do not restate anchors, floors or fencing. Cite `nonce-fenced-candidate-isolation` where the decomposer reads candidate text.
- **`judge-contract-design/reference-guided-grading`** withholds the **candidate** from the judge while a reference is derived. T5 below withholds the **question** from the judge while a question is derived. The two are mirror images and neither subject says so. Write the mirror in T5 and name the other technique. Do not edit `reference-guided-grading`.
- **`judge-calibration-and-drift`** owns agreement with humans, trust, drift and the repeatability floor. This subject's verdicts inherit all of it and restate none of it. The one new obligation is T2's: the **decomposer** is a second model in the instrument, so it needs its own calibration row. Say that in one paragraph and cite `golden-set-agreement-measurement`.
- **`generator-uncertainty-scoring`** owns judge-free scores from the generator's own distribution. Its golden path already says truth needs a judge or a reference. This subject is where that judge reads evidence claim by claim. One sentence, with a link.
- **`production-trace-scoring`** owns sampling, settle windows and the unscored queue. Out of scope.
- **Retrieval evaluation** (other bundle): owns ranking metrics over labeled relevance. **Open question for the drafter:** a rank-weighted average precision computed over *judge-produced* per-passage usefulness verdicts is the tree's answer when no labeled set exists (`src/ragas/metrics/_context_precision.py:113-132`; the reference-free variant only swaps what a passage must be useful *toward*, `:174-183`). Decide whether that is a technique here (`judged-context-usefulness`) or a paragraph in the golden path saying who owns the metric and what changes when a judge produces the labels. Argue the choice in your report.

## Proposed techniques

Five. Each carries `use_when` and a decision-rules section. **Strip every product, library and vendor name**: the source is a named library, and its metric names are its own vocabulary. "Faithfulness", "context precision" and "noise sensitivity" are that library's labels. Use them only if they are generic field terms, and say what each measures in plain words.

### T1 — `decompose-then-verify`

**The decision rule:** when an answer's support by evidence is the property being scored, score each claim separately and never the answer as a whole. Cut the answer into standalone claims, render one binary supported/unsupported verdict per claim against the evidence, and report supported over total.

Must contain:
- The forces: a holistic "is this grounded?" verdict hides *which* claim failed, gives no partial credit, and lets one fluent true paragraph carry one invented sentence.
- **Standalone** means pronouns and references are resolved at decomposition time. A claim that says "it was released in that year" cannot be verified alone, so the decomposer, not the verifier, owes the resolution. Tree anchor: `src/ragas/metrics/_faithfulness.py:37` (the decomposition instruction) and `:182-194` (the score).
- The verdict carries a reason, and the per-claim verdict list is the audit artifact. The score is a summary of it.
- **An answer with zero extractable claims is unscored, not faithful and not unfaithful.** The tree encodes that one case three ways: NaN in the legacy path (`_faithfulness.py:190-191`), `None` with a reason in the metric decorator, and `0.0` in rewritten metrics. It also answers "no quoted spans to check" with `0.0` in one version and `1.0` in another (`src/ragas/metrics/quoted_spans.py:119` vs `src/ragas/metrics/collections/quoted_spans/metric.py:98-102`). Cite `nullable-never-zero`, after checking the anchor exists.
- A deterministic special case is worth one paragraph: text the answer presents as a verbatim quotation can be checked by normalized substring match against the sources with no judge at all. State the normalization boundary the tree got wrong: a quote-character class that includes the apostrophe cannot pair quotes in ordinary English (`collections/quoted_spans/util.py:8-10`).

### T2 — `the-decomposer-is-inside-the-instrument`

The subject's keeper. **The decision rule:** a claim-level score measures the decomposition as well as the answer. Error introduced by cutting the answer into claims is charged to the model that wrote the answer unless the pipeline measures the cutter separately.

Must contain:
- **The primary:** a 2024 study of claim decomposition showed that a claim-level factuality score is sensitive to the decomposition method, because "such metrics attribute overall textual support to the model that generated the text even though error can also come from the metric's decomposition step". It proposed scoring decomposition quality on its own (arXiv:2403.11903). Cite it in the technique's sources.
- **The omission leak, from the tree:** a decomposition set to low coverage rewrites "was a French mathematician, philosopher, and food critic" as "was a mathematician and philosopher" (`src/ragas/metrics/_factual_correctness.py:48-58`, the default setting at `:194-195`). The two dropped attributes are the ones that are false. A claim the decomposer drops can never be marked unsupported, so a precision score over the surviving claims can read perfect for an answer that is partly false. Coverage is therefore a correctness setting, not a verbosity setting.
- **The denominator integrity rule, from the tree:** the score's denominator is the number of verdicts the verifier returned, not the number of claims the decomposer issued (`_faithfulness.py:184-189`). A verifier that silently returns fewer verdicts than it was given raises the score. Count verdicts against claims issued, and treat a mismatch as a failed verdict rather than a smaller one.
- **Granularity moves the denominator:** one compound claim and four atomic claims give different fractions for the same answer. Pin granularity as part of the scoring contract, and never compare scores made at two granularities. In the tree, the granularity knob is carried by *which few-shot examples are selected*, not by instruction text (`_factual_correctness.py:202-218`). Say that an exemplar set is a contract component.
- The calibration obligation, one paragraph: decomposition gets its own labeled check (did the claims cover the answer; is each claim standalone), separate from verdict agreement.

### T3 — `bidirectional-claim-matching`

**The decision rule:** when a reference answer exists, check claims in both directions. Answer claims verified against the reference give precision; reference claims verified against the answer give recall. Combine them with a declared beta. One direction alone rewards a failure mode: precision alone rewards the short, safe answer, and recall alone rewards padding.

Must contain:
- Tree anchors: `_factual_correctness.py:269-296`. The mode knob skips the reverse decomposition when only precision is asked for.
- The beta is part of the reported number's predicate. Cite `count-carries-predicate` only if that law exists in *this* bundle's `_laws.md`; it may belong to a different bundle. Check first, and use this bundle's nearest law if not.
- The boundary with T1: T1 checks against **evidence the system retrieved**, T3 against **a reference someone wrote**. They measure different failures (unsupported vs incorrect), and a system can pass one and fail the other.

### T4 — `per-source-attribution`

**The decision rule:** to tell *wrong because the evidence misled it* from *wrong despite good evidence*, check each claim against each passage separately, not against the passages joined together.

Must contain:
- The mechanism, as the tree builds it (`src/ragas/metrics/_noise_sensitivity.py:87-111`, `:154-174`):
  - Build a claim-by-passage support matrix for the reference answer and for the system answer.
  - A passage is relevant if it supports any reference claim.
  - An incorrect system claim is attributed to a relevant passage or to an irrelevant one. The two attributions are made mutually exclusive.
- What it buys: the fix differs. Misled by an irrelevant passage is a retrieval or ranking fault. Misled by a relevant passage is a reading fault.
- **The doc-vs-code disagreement, kept as the boundary:** the tree's documentation states the score as incorrect claims over all claims (`docs/concepts/metrics/available_metrics/noise_sensitivity.md:9`). The code counts only incorrect claims that are also attributable to a passage (`_noise_sensitivity.py:111`). Those are two different metrics, and a reader copying the formula gets the other one. Say which question each answers.
- Cost: claims × passages verdicts. State when the matrix is worth it (diagnosis on a sample) and when it is not (every production trace).

### T5 — `question-blind-relevance`

**The decision rule:** to score whether an answer addresses the question, do not show the judge the question. Have a model write the questions this answer would be answering, then measure their similarity to the real question with a non-model instrument. Score an evasive answer zero through a separate explicit flag.

Must contain:
- The forces: a judge that sees the question can be talked into "relevant" by an answer that repeats the question's words. A reconstruction from the answer alone cannot be.
- Tree anchors: `src/ragas/metrics/_answer_relevance.py:114-129`. Several questions are generated and the mean cosine is taken. The noncommittal flag multiplies the score by zero. That multiplier is missing from the documented formula (`docs/concepts/metrics/available_metrics/answer_relevance.md:13-19`), so name it.
- **The mirror:** `reference-guided-grading` withholds the candidate so the judge's reference is not pulled toward it. This technique withholds the input so the judge's reading is not pulled toward it. One sentence: *what the judge is not shown is the bias being designed out.*
- The honest boundary: embedding similarity is not bounded to the scale the score claims (the tree's own docs say the range is not guaranteed, `answer_relevance.md:26`), and a correct answer to a differently phrased question scores low. This is a prioritizer, not a verdict.

## Source-tree applications (v2)

Write one application per technique against the source tree itself. It is an opened tree.
- `stack: python`, `verified_on: 2026-09-15`.
- `verified_against` names the tree at its commit (`298b6827`). The package version is derived from git tags, and the shallow clone carries none, so the first paragraph says the commit is the only witness.
- The body holds the decision, forces and buys from the spec above, plus what the realization **cannot** do. Every defect the spec names above belongs there, with file:line.
- The tree is public, so file:line anchors are allowed in applications. They are not allowed in the golden path or in techniques.

## Reconcile (read-only)

The connected tree `tracklight` (resolve through `loadFleet()` in `scripts/lib/projects.mjs`; never guess a path) scores a `faithfulness`-style dimension holistically on anchored levels. See `crates/core/src/rubric.rs:199` and `crates/engine/src/judge.rs`. Read it and say in your report whether any technique above would change what it does. **Do not edit it.** The intake director owns the apply step.

## Primaries (your web budget, 3 fetches)

1. arXiv:2403.11903, "A Closer Look at Claim Decomposition" (already fetched by the director; the abstract quote above is verified).
2. arXiv:2305.14251, the atomic-fact factual-precision paper that introduced per-fact scoring. Use it for T1.
3. arXiv:2309.15217, the retrieval-augmented-generation evaluation paper by the source's authors. Use it only for what it *measured*, and read it for T5's reverse-question design.

## Open questions the drafter decides (not discovers)

1. `judged-context-usefulness`: a technique or a golden-path paragraph (see Boundary).
2. Whether T4's matrix belongs in this subject or is a diagnostic appendix to T1. Argue from the cost section.
3. Which laws in `knowledge/llm-observability/_laws.md` each technique may cite. Read the file; cite only anchors that exist.

**Override this spec where it is wrong, and say why.** Placement, a technique split, and a boundary are all yours to correct against what the neighbours actually say.
