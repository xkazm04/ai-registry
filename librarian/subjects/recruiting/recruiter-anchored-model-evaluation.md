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
Map built from origin/main after the knowledge commit (ebd5d325): one project joins this subject, kp (6 contexts, `pair state: unknown`, never judged), so 0 stale verdicts and nothing for `/conform --stale`; no other project joins it. kp's map committed locally as a99531095, not pushed (kp main carries unpushed sibling commits). The run rewrote the other eleven projects' maps as well; they were already modified by earlier uncommitted regenerations and were left as they are, not committed and not reverted.

Four `applied.md` rows owed and written: one experiment (`unmeasurable`) and three `unapplied` with return conditions. The independence finding is the one to act on first: a cross-family re-judge of the committed grid is a spend decision, so it is left to the operator.

## 2026-09-29 (second pass) - what the recorded runs show that the first read did not

Dispatched by the Curator lane on "never swept by the librarian", with registry HEAD 7e649601 at dispatch. That HEAD was 65 commits behind origin/main and did not contain the first pass above (ebd5d325, c680fb9c); the work was done before this was seen, then ported onto a detached worktree of origin/main 62f671f4 and cut down to what the first pass had not covered. The overlap was large: the floor-at-n=4 simulation (1 pick of 11 flips, `automation`), the 8-of-11 Claude picks and the judge-independence finding were reproduced independently by both passes, which is the only convergence claim made here and it is about kp facts, not technique placement.

**Depth rung:** L3 for the kp claims (the local bench record files, 37 sets, 816 rows, counted, nothing published; the shipped `recommendForUseCase` run over the baked file); L2 for two arXiv abstracts read verbatim through the arXiv API (2603.28005, 2609.27787), and the two already cited by the first pass. Lanes: kp tree, a blind training-data-only lane, an external counter-evidence lane. The blind lane converged with the tree on two points (compression direction follows the prompt and is often lenient; excluding fallbacks from cost and latency hides real spend), and its other points were left out for lack of a source (halo effects, prompt injection, judge drift are real practice but not read here).

**Landed (knowledge cb3f2b37):**
- **Contamination direction.** The golden path and technique said fallback contamination flatters unreliable models. All 13 judged fallback rows in the record history scored below the same operation's real answers (2-6 against 7-8): thin stubs punish. The rule is now the sign of template score minus model score.
- **Fallback rows are slow and paid.** The four fallback rows of the committed bake took 15.7-180 s and three were priced; the premise "instant and free" is a property of the record, not a given. Effect on the aggregates at a 1.7% fallback rate: under 5%.
- **A hybrid passes the mark.** `_generate` compares the coerced result with the template; `weight_proposal` backfills per candidate and per rationale and returns `"llm"` with no comparison, in a bench where about 85% of rationales came back empty. Recorded payloads were off, so whether hybrids sit in the graded rows is unread.
- **Ceiling clustering.** 88% of 236 judged answers on 8 or 9, no 10, one below 5. "Spread shows the tails are reachable" is not established by this bake; only a planted known-bad artifact separates a good matrix from a lenient judge.
- **Same-vendor split.** Claude targets 8.57 (n=118), others 7.99 (n=118) under a Claude judge; confounded, a size to test.
- **Unverifiable is not fabricated, conditioned.** The neutrality rule follows the excerpt's truncation. Where the checker holds the whole record a specific checkable assertion the record lacks is a defect; the source-tree gate and the bench judge are both right about different evidence.
- **"Markedly more stable" removed.** A prompt-controlled comparison (arXiv 2603.28005) found a holistic judge matching or beating decompose-then-verify on two of three benchmarks; no stability study for hiring text is known. Enumeration stays for auditability.
- Smaller conditions: deliver versus degrade for the reliability bar; the composite's validity factor counts one failure twice; the tie band is tighter than the noise kp's own document states; the ceiling must bind every arm; `CAP_WEB_RESEARCH` is the mirror of the empty-prompt defect; a use case with no fixed input is listed as unmeasured.

**Verified, left alone:** median across scenarios, the five-band decision anchors, the structural-verdict-to-judge hand-off, the fallback exclusion from quality. Every kp citation in the applications was re-resolved at kp 7e6accbc9 (the first pass read b2c19295b) and the first pass's numbers were not compared line by line against this pass's.

**Not evaluated:** a second-vendor judge over the same texts (spend); repeat-judge variance; the planted-probe run; whether `weight_proposal` rows in the record contain hybrids; the career-ops self-test. Return condition for the first three: a bench re-bake or a second judge in kp.

**Applied:** three rows in `applied.md`: never-judge-a-fallback (simulation, not-better), unverifiable-is-not-fabricated (simulation, not-better), decision-anchored-score-bands (simulation, unmeasurable, instrument: a planted known-bad run).

## Impact (second pass)
Map built after the knowledge commit: kp only joins this subject (6 contexts, all `unknown`, never judged), so 0 stale verdicts and nothing for `/conform --stale`. kp's map committed locally as f63450548, unpushed (kp main is 36 ahead of origin with sibling commits). The map run also rewrote the other eleven projects' maps as before; they were left as they are.

## Saturation ledger (second pass)
Rung L3 on kp facts, L2 on the literature. Two passes in one day; the second yielded conditions on three techniques and the golden path, no new technique, one removed sentence. Dry streak 0. Clocks: the arXiv-cited claims carry a 2027-03-29 refresh (2026 preprints, single studies); the kp facts move with the next re-bake or a second judge. Event: kp adding a second judge, a planted-probe run, or per-field provenance in `weight_proposal`.
