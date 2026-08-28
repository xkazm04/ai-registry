---
source: batch
kind: harvest-batch (6 sources, one domain, parallel miners)
domain: llm-observability
mined_on: 2026-08-28
queue_rows: [OBS-001, OBS-002, OBS-005, OBS-008, OBS-010, OBS-011]
harvest_skill: 0.1.0
miners: 6 (parallel, proposals only; single-writer landing)
fetches: 11 of 24 budgeted
extracted: 58
accepted: 7
already_covered: 19
declined: 0
leads: 6
untriaged: 14
---

# llm-observability harvest batch 1 - the first /harvest pass

Six queue rows mined in parallel against the bundle's live gaps (quality-scoring
subjects at 5 attention points and never swept; telemetry subjects owed second
stacks). Operator triaged five content clusters in; body-level prior-art
verification then downgraded most of one cluster to catches - see the lesson at
the end, it is the run's most valuable output after the landings.

## Landings (content)

| landing | where | from |
| --- | --- | --- |
| `reference-guided-grading` (new technique) | judge-contract-design | OBS-008; measured 70%->30%->15% misgrade reduction, default -> step-by-step -> reference-first |
| `error-analysis-first-taxonomy` (new technique) | production-trace-scoring | OBS-011; saturation stopping rule, random slice per review batch, principal-expert critiques recycled as judge few-shots |
| panel-of-judges section | judge-selection-by-spread | OBS-010 + its cited measurement (diverse small-judge panel beats one frontier judge at ~1/7 cost, less same-family bias) |
| difficulty-conditioned agreement bullet + verbosity-inflation fixture clause | golden-set-agreement-measurement | OBS-008 (agreement climbs ~70%->~100% as candidate gap widens; repetitive-list attack fools weak judges >90%, strong ~9%) |
| declared two-axis identity paragraph | provider-family-matching | OBS-002 (family + host as two declared attributes; declared pair precedes substring inference) |
| lists-resolve-names-not-shapes bullet + cost-name currency clause | attribute-precedence-lists | OBS-002 (nested detail sub-keys, zero-indexed flattened arrays; per-category cost attributes now standardized in one convention) |

## Per-source

**OBS-001 - OTel GenAI semantic conventions** (spec, pre-release). Currency:
the conventions split into a dedicated repo, everything still Development
status, zero releases, active breaking churn (cache token renames, top_k
split, provider attr transition complete - old names absent from the new repo,
so precedence lists must span two repos' registries). This CONFIRMS
attribute-precedence-lists' premise; no reset needed, clock keeps running.
Return condition: first tagged release / schema URL landing. Leads: canonical
role/parts message JSON schema as interchange format; agent/workflow/memory
span taxonomy + evaluation-result event (return when the corpus grows
agent-level telemetry subjects). Untriaged with anchors: token subset
invariants as ingest checks; normative billed-over-consumed rule (operator
left the token-model cluster unpicked - no judgment recorded).

**OBS-002 - OpenInference trace spec** (vendor spec). Accepted: two-axis
identity, shape-vs-name mapping, cost-attribute stability currency (above).
Catches: no gen_ai crosswalk exists at source - the operating premise of
two-doors-one-pipeline confirmed; lossy 10-role taxonomy -> refuse-to-derive
holds. Lead: spec/configuration.md sender-side redaction switches (return:
fetch it next pass; changes what a pipeline can validate). Caveat recorded by
the miner: the gen_ai side of each contrast was from prior knowledge, not
re-fetched - corroborated here against OBS-001's same-run clone instead.

**OBS-005 - genai-prices** (reference data repo). Zero content accepted; five
strong catches, which for this class is the expected good run:
dated append-only price history = no-retroactive-repricing in the wild;
prices_checked + pricing_urls + declared aggregator lineage =
price-provenance-and-staleness; bundle + hourly refresh = embedded-seed-fallback
+ hot-swap-price-book; flat variant fields + tier thresholds =
price-row-variant-encoding; a funded team's "will not be 100% accurate"
disclaimer corroborates the staleness posture. Lead: candidate upstream
cross-check feed for a private price book - gate on license, provider
coverage, prices_checked recency on the top-10 models. Untriaged: boolean
match-expression trees as model->row resolver; time-of-day price constraints
(claimed in README, encoding not inspected).

**OBS-008 - founding LLM-as-judge measurement paper**. Accepted: the
reference-guided mechanism and the two golden-set amendments. Catches:
swap-order-with-tie already in bias-counterbalancing's structural layer;
position/verbosity bias magnitudes are evidence for existing prose;
holistic-agrees-fine confirms weighted-anchored's framing (replaced for
stability, not validity). Self-enhancement bias explicitly NOT established by
the paper's own admission - recorded so nobody cites it as proof. Not
extracted: 2023 model rankings (dead currency), benchmark artifacts (fail the
strip test).

**OBS-010 - practitioner synthesis on evaluating LLM evaluators**. Accepted:
panel-of-judges (externally corroborated by its cited measurement). Catches:
kappa-over-raw-agreement, human-ceiling, defect stratification, mechanical
checks skip the judge - all already in golden-set-agreement-measurement and
deterministic-dimension-kinds at full depth. The binary-verdict preference
CONVERGED with OBS-011 (two independent practitioners) - resolved as already
covered: the corpus anchors dimensions for authoring and binarizes at the
threshold for kappa, which is both practitioners' end state. Lead: finetuned
judges scoring worse than random under adversarial perturbation; few-shot
judge instability (return on a second source before the corpus takes a
position). Untriaged: one-dimension-per-call; guardrail graduation
(prompted judge for dev, finetuned classifier for production gating).

**OBS-011 - practitioner evals corpus (trace-driven)**. Accepted:
error-analysis-first-taxonomy carrying the saturation rule, the guaranteed
random review slice, and the critique-to-few-shot pipeline. Catches:
re-validate-on-cadence-and-change = scheduled-recalibration; perpetual
spot-checks = trust-bar-verdict's posture. Tension recorded, not ruled:
judge-by-capability-ceiling vs judge-selection-by-spread's empirical bake-off
- single mention, too thin to propose. Lead: the active-learning review loop
(clustered review, watcher updates taxonomy) - return: mine the video
walkthrough. Untriaged: three-level eval hierarchy (assertions/cadence/A-B) -
outside the admitted subjects; synthetic test-case generation.

## Evaluation debt

Five content landings queued for A/B evaluation, routed to the connected
project declaring this bundle. See harvest/evaluations.md. Debt at close: 5
pending - above the loop guard of 3, so a loop would stop here by rule;
attended single pass reports it instead.

**Settled 2026-08-28, same day:** operator connected the personas checkout;
five blind two-arm probes ran against real sites (the autonomy-eval judge,
unscored companion-turn traffic, the pinned judging tier, the spend ledger),
rubrics pre-registered, judges blinded. Verdicts: 4 impact-positive, 1
impact-null (reference-guided-grading, first null). The tie is itself
calibration: the pre-landing corpus was already strong enough to produce a
full-marks judging contract without the new technique. Ledger:
[[../harvest/evaluations.md]]; artifacts in the project's gitignored scratch.
Debt at close: 0.

## The lesson (for /harvest reflect)

The miners were briefed with INDEX-level prior art (slug + two use_when
lines) and proposed accordingly; body-level verification at landing then
downgraded most of an operator-approved cluster (judge metric layer) to
catches - kappa, ceiling, stratification were all already present at full
depth in golden-set-agreement-measurement's body. Two costs: operator triage
time spent on already-covered claims, and a near-miss of duplicate prose.
Corrective for the skill: the orchestrator reads the TARGET TECHNIQUE BODIES
between triage and landing (as done here), or miner briefs carry the full
body of the 2-3 nearest techniques, not the index line. Candidate for
harvest LESSONS.md and a version bump.
