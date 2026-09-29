---
subject: recruiter-anchored-model-evaluation
domain: recruiting
date: 2026-09-10
source: intake-career-ops-recruiting-20260910
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# Recruiter-anchored model evaluation

Added a source-tree application of evidence-grounded correctness from the
[career-ops intake](../../sources/2026-09-10-career-ops-recruiting.md).
Deterministic checks are wired into document export, with partial language and
claim-recognition coverage. The 88-check self-test passed; generation and rendering
were not exercised. No technique changed and no hiring-validity claim was admitted.

## 2026-09-29 - the bench applications read against a tree that grew a routing layer

First touch by `/deepen`, dispatched by the Curator lane on the finding "never swept by the librarian". Registry HEAD at dispatch 58adea0f; landed from a detached worktree of origin/main a446a49e.

**Depth rung:** L2 for the applications (kp resolved against `origin/main` b2c19295b with `git show`, not the working tree, which carries sibling WIP in `capabilities.py` and `llm-quality.ts`; career-ops read at upstream `main` 5118d3555 through the API). L1 for the technique additions: one counter/primary lane on the web (four arXiv abstracts fetched verbatim: Verga et al. 2404.18796, Szymanski et al. 2410.20266, Rao and Callison-Burch 2603.00077 and 2609.29769; Panickssery et al. 2404.13076 by search result only). No training-data-only lane was run as a separate agent, so no claim here earned technique placement by convergence; each technique addition rests on a kp observation plus a cited abstract, and is stated as a condition, not an absolute.

**Corrected in the applications (three had `verified_on: 2026-08-20`):**
- Every kp line citation was off by one to nine lines; all re-resolved. The capability comment moved from :16 to :27-35 and its wording changed (the Gemini row now declares `file_input`; base `complete_document` refuses with `missing_capability`). The rubric text, the fallback filter and the grounding sentence are unchanged.
- **The judge-independence sentence no longer holds.** The bench docstring says the Claude CLI judge is "a different engine than the OpenRouter/API targets, so a target's own family doesn't grade itself"; the committed grid (2026-08-12, n=4, `judge: fable-5`) routes `claude-sonnet-5` and `claude-opus-5` through provider `claude_cli`, the judge's own engine, and the board flags nothing.
- `validRate` in `runner.summarize` was scoped to the model's own rows on 2026-08-22 (b5c9ec702); `bake_quality._cell` gained `costPerTaskUsd` on LLM rows only on 2026-09-23 (4e0f7777d). The two aggregators still differ on latency and cost scope.

**Found by reading the tree, not in the corpus:**
- Two techniques (`separate-quality-from-reliability`, `task-definition-matches-the-real-deliverable`) had no application; both now have one, from kp's routing code (`recommendForUseCase`, `RELIABILITY_FLOOR`, `NOISE_BAND`, `QUALITY_WEIGHTS`) and the judge's per-use-case definitions.
- **The reliability floor is 0.9 at four scenarios per cell**, so `llmRate` (0, .25, .5, .75, 1) admits only a perfect cell; it is looser than the technique's bar at n>=10.
- **The noise band (0.15 / 0.3) is a declared constant**, not derived from judge-repeat variance; no measurement of the judge's own spread exists in kp.
- **The composite is 0.4 correctness / 0.35 adherence / 0.25 relevance** and the board reads only the composite; the dimensions live in the baked file.
- **Ten integers over five anchors**, and the judge returns a verdict sentence, not the band's action.
- **Domain rules only in the graded judge**: `campaign_pack` (contracts.py:217) requires one variant, not eight, and nothing checks for invented pay; `jd_ingest` (contracts.py:138) accepts `responsibilities` as satisfying its list, against the judge definition.
- career-ops: default sources now resolve from the data root after a field failure that read no sources (#4208); the export callers print a `warn` header without `coverage.message`.

**Technique and golden-path changes (conditions added, none refuted):** never-judge-a-fallback (structural validity is a fourth contaminated statistic; a fallback after a failed call is not always free; one row partition per run); separate-quality-from-reliability (state a rate floor as a count at the sample size; a routing pick may compose the dimensions under stated rules); decision-anchored-score-bands (validate against a practitioner-labelled sample, with the cited agreement figures; anchor every number or shrink the scale; check the judge's engine against the actual targets; panel of disjoint families as the tested alternative). Golden path gained one failure mode, one qualification of "never average", and two run-level checks.

**Verified, left alone:** the evidence-grounded-correctness and unverifiable-is-not-fabricated technique bodies; the "median not mean" and the fallback-exclusion rules stand. The career-ops `verified_against: node@18` is the declared minimum; `check-currency` reports it as drift against fleet node 24. The self-test was executed on 24.14.0 on 2026-09-10 but was not re-run here, so the field is not moved.

**Not evaluated:** the 88-check self-test at upstream `main`; whether the same-family judge lifts the two Claude columns (no cross-family judge run exists); the judge's repeat variance; practitioner agreement (no labelled set). Return condition for the last three: a bench re-bake, or kp adding a second judge.

## Impact
Filled from the regenerated map below.
