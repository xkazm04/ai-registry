---
source: web:jevai.org/docs
kind: second-hand practitioner listicle (community hub) -> vendor release announcement -> vendor repository
url: https://www.jevai.org/docs
title: A community hub for a typed-decision model, the vendor's own pages, and the vendor's open adapter
author: community hub (unnamed); vendor docs and blog; vendor adapter repo; one community use-case list
words: 1359 hub pages (332 + 377 + 650) / 3 vendor pages fetched / 7529 adapter tree (README, changelog, source) / 10016 community list
extracted: 11
accepted: 1
declined: 0
leads: 4
already_covered: 4
untriaged: 2
dispatched: 0
applied: 2
shipped: 1
run_id: intake-jevai-0918
siblings: 1
rescan_when: the vendor publishes a calibration measurement against human or ground-truth labels, or a model card or paper; or an API key is available to this fleet; or 8 weeks elapse (2026-11-13)
---

# A model that answers only in types, read from three tiers

One sibling was live at claim (`intake-1vw39`, a video, holding no subject in this
bundle). The primary checkout sat behind `main`, so every registry write was made in the
`main` worktree.

## What arrived, tier by tier

The URL the operator gave is a **community hub**, not the vendor. Its three pages total
1,359 words and they **contradict each other on the request shape**: the docs page
describes `state` + `questions` with a fixed model id, the API page describes
`POST /v1/decisions` with a `mode` field (`compaction`, `router`, `classifier`), and the
vendor's own documentation names a third route. Tiered, not counted: the vendor pages
win, and the hub's `mode` API is recorded as unverified.

Three fetches, all spent on the vendor (concept page, launch post, confidence page).
Then two clones: the vendor's **open adapter** (`adffc2ea`, 2026-09-18), which emulates
the typed request against general chat models, and a community use-case list
(`3a7f9d2e`). The adapter is where the yield was: the hosted model's documentation
describes confidence only as "a statistic computed from the probability distribution";
the adapter publishes the arithmetic.

**Expected yield for the class, said before triage:** a vendor announcement is reliable
for its numbers and its prose is the strip test's problem; a vendor repository is
reliable for its types. Expect one mechanism from the types, currency, and leads.

## The model and its architecture - what is and is not disclosed

Disclosed: text-only input (strings, JSON, arrays); three answer primitives - a choice
over 2-255 named options, an ordered score over 2-10 levels indexed from 0 returned as a
probability-weighted mean, and a yes-probability with no confidence field; many questions
over one shared state in one request; all answers produced in one parallel pass rather
than token by token; a training method the vendor calls reinforcement learning for
calibrated decisions; 70-500 ms end to end; input priced per token with output free.

Not disclosed: parameter count, base model, the mechanism that constrains outputs, the
sampler, any calibration metric, any model card or paper. The vendor's "0% hallucination"
is a statement about type validity (an answer outside the schema is unrepresentable), not
about correctness, and its own docs say so: typed output "guarantees the field shape, not
factual correctness".

**The measurement weakness.** The launch benchmark's reference is "the average of the
smartest models as reference probabilities". That measures agreement with general models,
not accuracy, and it is the circularity `probability-calibration-is-not-agreement` and
`score-source-ensembling` already name. One witness in the adapter's tests cuts the same
way: the recorded live response from the hosted model returns probabilities of exactly
1.0 and 0.0 on all three answers, and 55 output tokens on a model described as producing
no output.

## Design record

Two systems: the hosted decision model (M) and the open adapter (A).

1. **decision:** answers are drawn from caller-declared closed spaces only - choice, ordered score, yes-probability. **forces:** downstream code branches on the answer; prose needs parsing and can be off-schema. **buys:** an off-schema answer is unrepresentable. **rejects:** free text plus a validator. **stage:** request schema. **system:** M. **corpus:** modelled - `hitl-approval/truncated-verdict-space`, `fail-loud-classification-default`. Catch.
2. **decision:** confidence is a statistic of the distribution's shape, with a different statistic per answer shape, and none for the binary. **forces:** a raw peak probability is not comparable across label counts; ordinal mass near the mode is cheap and far from it is not. **buys:** one threshold scale across questions of different cardinality. **rejects:** returning `p_max`. **where:** `src/system_one_adapter/_utils/confidence_metrics.py:24 "(max(normalized_probs) - uniform_probability) / (1.0 - uniform_probability)"`; `src/system_one_adapter/_utils/confidence_metrics.py:14 "1.0 - distance_from_mode / uniform_mean_absolute_deviation"`. **stage:** response. **system:** A (the only place it is published). **corpus:** NONE - `generator-uncertainty-scoring` owns token-probability and multi-sample sources and has no technique for a stated distribution. HOME IF NEW: that subject.
3. **decision:** the threshold and the action live in caller code; the model never grants a capability. **forces:** a model-generated value must not widen an authorization boundary. **stage:** consumer policy. **system:** M (docs), community list. **corpus:** modelled - `hitl-approval/cosmetic-vs-enforced-threshold-invariant`, `oracle-before-gate`, recruiting `confidence-always-returned-with-a-review-threshold`. Catch.
4. **decision:** many questions share one state in one request. **forces:** the state dominates input cost; per-question calls re-pay it. **stage:** request. **system:** M. **corpus:** partial - prompt-cache subjects model the shared prefix; nothing models independence between co-asked questions. Untriaged.
5. **decision:** the adapter keeps the sum error and the original distribution instead of silently repairing a stated distribution. **where:** `src/system_one_adapter/_utils/probability_normalization.py:9 "PROBABILITY_TOLERANCE = 1e-6"`. **system:** A. **corpus:** NONE, same home as 2 - folded into the same technique as a decision rule.
6. **decision:** label sets are capped at 255 and larger sets are ranked in two stages. **system:** M. **corpus:** NONE; folded into the technique as a failure mode.

**Routing count.** NONE per system: M 1 (entry 6), A 2 (entries 2, 5). HOME IF NEW
shared: three entries (2, 5, 6) share one home - and that home **exists** and the three
are facets of one mechanism, so this is one technique inside an existing subject, not a
subject and not a forge job. No handoff.

## Triage

Upper-layer rows run under the Phase 5 score; currency and leads under the corroboration
table.

| # | Shape | Title | Prior art | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | design -> technique | Stated distribution over closed labels (entries 2+5+6) | generator-uncertainty-scoring | real gap | 2/0/2 | **accept** - tree read, training-data convergence on stated-confidence behaviour, and two in-run measurements |
| 2 | design | Closed answer space | hitl-approval | catch | - | already covered |
| 3 | design | Threshold in code, model grants nothing | hitl-approval, candidate-archetype-routing | catch | - | already covered |
| 4 | design | Many questions over one state | prompt-cache subjects | partial | 1/2/2 | untriaged - promoting question (does any subject model independence of co-asked questions?) answered no, but the source gives no measurement and no fleet seam co-asks |
| 5 | claim | Benchmark referenced to model consensus | probability-calibration-is-not-agreement | catch | - | already covered; cited in the technique as rule 6 |
| 6 | claim | Small fast model in front of a large one | model-routing | catch | - | already covered |
| 7 | currency | A hosted text-only typed-decision model exists at this price and latency | - | - | table | lead (no application to date) |
| 8 | lead | The hosted model's calibration on our own cases | - | - | table | lead - return: an API key; run both experiment scripts with the hosted model as arm C |
| 9 | lead | Context-compaction decisions as a typed call (hub's `compaction` mode) | - | thin | table | lead - hub-only claim, vendor pages do not mention it; return: a vendor page or repo that does |
| 10 | lead | Command-risk and skill-selection typed calls in an agent harness (community list) | hitl-approval | thin | table | lead - return: a fleet hook with a measured miss rate |
| 11 | claim | Two-stage ranking past the label cap | - | partial | 1/2/1 | untriaged; mentioned as a failure mode only |

`auto=1/2/0`, `fp=0`.

## Landed

- **Technique** `stated-distribution-over-closed-labels` in
  `llm-observability/quality-scoring/generator-uncertainty-scoring`. Found by the
  enumeration hunt: the subject's kinds table says the generator-uncertainty kind "has no
  prompt" and "no instruction channel for a candidate to hijack". A stated distribution is
  that kind and has both. The existing sentences stay true of the two sources they were
  written about; the technique states the exception.
- **Application** `python--stated-distribution-over-closed-labels` against the adapter
  tree, 4 of 4 anchors held under `check-anchors`.

## Applied - both seams in one project, the first chosen to falsify

- **Admission verdict, experiment, not-better.** Chosen because a caught outcome would
  have taught something: withheld neighbours and cross-project distractors were built to
  induce a wrong destructive verdict. None occurred in either arm (80/80, 0 destructive),
  and the distribution arm cost 2.35x the output. The finding it refuted is the use case
  itself at this seam: there is no headroom for a confidence to rank.
- **Fix-applied model grader, experiment, better.** AUROC 0.82 on borderline-ness against
  the harness's own strict-vs-lenient disagreement, floor 97.5% against a declared 95%.
  Filed as the project's next change rather than shipped: it moves the instrument every
  published ladder row was read through.
- **The seam hunt as a second source.** The strict grader reproduced its own recorded
  verdict on 100 of 120 identical pairs under the same model identifier, 19 of 20 flips one
  way. Recorded in the project; the stated probability does not flag it.

Ship: one project commit (experiment record, scripts, two ledger rows); no product code.

## Use-case assessment across the fleet

| Seam class | Where it exists | Verdict |
| --- | --- | --- |
| Binary or few-label model grader with documented borderline noise | the memory evaluation's fix grader | **inject the design** (p_yes + band); measured better |
| Closed-set verdict already at ceiling | the memory admission gate | **do not** - measured pure cost |
| Judge pipeline with canned or multi-sample scores | the observability service's judge | not tested; it already aggregates samples, which is the stronger source where affordable |
| Hosted model itself | anywhere | blocked: no key, text-only, no calibration evidence against ground truth. Lead 8 |

## Directions

None proposed. No fleet project's scope names a decision-model gateway, and the design's
forces (sub-second typed branching at high volume) are not faced by any seam read today.
