---
kind: harvest-evaluations
created: 2026-08-28
updated: 2026-08-28 (5 settled; 6 pending from pass 2)
---

# A/B impact evaluations

One row per evaluation of a content landing, append-only. Protocol:
[`.claude/skills/harvest/references/evaluation.md`](../../.claude/skills/harvest/references/evaluation.md).
Slugs only for projects; probe artifacts stay in the routed project's
gitignored scratch.

| date | landing (subject/technique) | source | project | probe | verdict | note |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-28 | judge-contract-design/reference-guided-grading | [[2026-08-28-llm-obs-harvest-batch-1]] | personas | correctness-judging procedure + prompt contract for the autonomy-eval agent-judge | impact-null (1 of 2) | settled 2026-08-28: blind 10-10 tie on a 5-check rubric; the pre-landing corpus (bias counterbalancing, nonce fencing, mechanical routing) already carried both arms to full marks. First null; a second null marks the technique unproven-in-project. artifacts: personas tmp scratch (abeval), blinded, rubrics pre-registered |
| 2026-08-28 | production-trace-scoring/error-analysis-first-taxonomy | [[2026-08-28-llm-obs-harvest-batch-1]] | personas | stand up quality scoring for unscored live companion-turn traffic | impact-positive | settled 2026-08-28: blind 10-8; decisive checks were failure-modes-first with a stopping criterion and the unknown-unknowns random slice - exactly the landed content. artifacts: personas tmp scratch (abeval), blinded, rubrics pre-registered |
| 2026-08-28 | judge-calibration-and-drift/judge-selection-by-spread (panel section) | [[2026-08-28-llm-obs-harvest-batch-1]] | personas | selection procedure for the lab/eval judging tier | impact-positive | settled 2026-08-28: blind 10-9; the single decisive check was candidate breadth - the landed panel row appeared in the bake-off, correctly caveated (an all-one-family panel buys variance, not family diversity). Margin = exactly the landed delta. artifacts: personas tmp scratch (abeval), blinded, rubrics pre-registered |
| 2026-08-28 | judge-calibration-and-drift/golden-set-agreement-measurement (difficulty + fixtures) | [[2026-08-28-llm-obs-harvest-batch-1]] | personas | calibration set + agreement measurement before judge scores join the verdict | impact-positive | settled 2026-08-28: blind 10-8; per the judge sheet the gap sat on the difficulty-conditioned reading and gameability-probe checks. artifacts: personas tmp scratch (abeval), blinded, rubrics pre-registered |
| 2026-08-28 | multi-provider-event-normalization (two-axis identity; shapes/cost clauses) | [[2026-08-28-llm-obs-harvest-batch-1]] | personas | provider identity + usage normalization for the spend ledger across heterogeneous routes | impact-positive (with caveats) | settled 2026-08-28: blind 9-6; decisive: declared-identity-precedes-inference (landed) and sender-cost-as-claim. Caveats: the sender-cost rule pre-existed in BOTH packs (arm B omitted it - application variance, not purely the landing), and the landed shapes clause did NOT transfer (both arms scored 1 on shape divergence). artifacts: personas tmp scratch (abeval), blinded, rubrics pre-registered |
| 2026-08-28 | game-economy-tuning (cost-curve-object-audit + intransitive-equilibrium-solving) | [[2026-08-28-game-production-harvest-batch-1]] | pof | - | pending | one probe may cover both - same subject |
| 2026-08-28 | difficulty-design-and-adaptation (reward-cadence-first-diagnosis + curve corollaries) | [[2026-08-28-game-production-harvest-batch-1]] | pof | - | pending | |
| 2026-08-28 | content-drift-and-revision/typed-operator-inheritance | [[2026-08-28-game-production-harvest-batch-1]] | pof | - | pending | |
| 2026-08-28 | procedural-level-planning + generative-artifact-gating + design-canon (constraint-generator fixes) | [[2026-08-28-game-production-harvest-batch-1]] | pof | - | pending | one probe on a generation-gate design site |
| 2026-08-28 | trailer-structure (concealment-and-its-tells + amendments) | [[2026-08-28-media-generation-harvest-batch-1]] | systedo-case | - | pending | gravitone is the alternate route |
| 2026-08-28 | sound-effect-generation/picture-as-timing-brief (+ defect entries) | [[2026-08-28-media-generation-harvest-batch-1]] | systedo-case | - | pending | |
