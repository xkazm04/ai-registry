---
source: batch
kind: batch
url: "youtube:qwGJM6G_8Wg, youtube:olIve0D8pJQ"
urls:
  - https://www.youtube.com/watch?v=qwGJM6G_8Wg
  - https://github.com/AgriciDaniel/gatekeeper
  - https://www.youtube.com/watch?v=olIve0D8pJQ
title: "Decision-model micro-calls, /shift batch of 2 videos from 2 channels"
author: "2 channels, both repeat voices: the skill-router repository's author (see [[2026-10-14-agricidaniel-claude-seo]]); The AI Automators (see [[2026-10-05-decision-model-fixed-line-calibration]], [[2026-11-08-agent-friction-to-fix-loop]])"
words: 3836
extracted: 28
accepted: 0
declined: 0
leads: 5
already_covered: 17
untriaged: 6
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-decision-model-micro-calls
siblings: 2
fetches: 7
rescan_when: the router repository enforces forbid rules or protective judgments on its fail path, or publishes a held-out routing measurement; or 8 weeks elapse (2027-01-05)
---

# Decision-model micro-calls, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `decision-model-micro-calls`, board run
`shift-decision-model-micro-calls`. The question: which small fuzzy decisions in an agent
(routing, reranking, citation checks, skill selection) should go to a decision-only model
rather than a generating one, and **what proves the call is right?** Phase 7.7: gate=skipped.
No GPU, no download, no render.

- **Q** = `youtube:qwGJM6G_8Wg` (831 words) plus its linked repository. A hybrid: a short
  promotional demo of the author's own skill router, and the repository, which carries the
  mechanism. The miner read the repository through a fetch summary (3 fetches). **The lander
  read `gatekeeper/engine.py`, `gatekeeper/bands.py`, `gatekeeper/hooks.py` and
  `gates/agent-selection.yaml` verbatim at commit `bcc1c20c`** (4 raw-file fetches, read only),
  so rows Q1, Q2 and O1 rest on code read in a tree, not on a summary.
- **O** = `youtube:olIve0D8pJQ` (3,005 words). A first-party practitioner account in demo form:
  a reranker, a citation checker and a three-way model router moved onto a closed-label
  decision model inside one RAG app. The second half is future tense.

**Expected yield, stated first:** this is the seventh pass over this decision model (09-18,
three on 09-20, 09-29, 10-05, 11-06). Catches on the model half and at most one boundary
amendment on the host half. That held: 0 accepted, 17 covered.

**Voices.** Two channels, two voices, both repeats. They overlap on one row only (O1, what a
router sees when the message continues a turn), and there they **disagree**, which is the
cluster's only convergence evidence. Skill selection rests on Q alone. O's reranking steer
(O5) shares one line of descent with the 09-20 reranking row 1 (the same vendor how-to), so
it is not a second voice there.

**What proves the call is right: neither source answers.** Q's "70 → 80 → 90 % on 60
prompts" was tuned and rescored on the same 60 prompts by its author. It is in-sample, it does
not appear in the repository, whose own bench calls itself "the mechanics, not real-world
accuracy", and it is not evidence (`stated-distribution-over-closed-labels` rule 6). O reports
token counts and latency, no accuracy, agreement or misroute rate for any of its three jobs.

**Admission:** the +3 bar governed the scored rows, and nothing reached it. The best row is O1
at 2/0/1 after the promotion read. `auto=0/0/0 fp=0`: no miner accepted anything.

## What landed

Nothing in `knowledge/`. This note, its ledger lines, five leads and one currency line. No
project was touched.

## The instrument gap (this registry's own skill selection)

The registry picks skills from descriptions (`docs/skill-selection.md`, `catalog.json`). There
is **no labelled prompt → skill set** and no code seam where a router would sit, so nothing
about Q's method is measurable here yet. The instrument it would take: a labelled set of real
prompts with the skill a reviewer says each needed, split into a fit half and a report half,
scored at matched coverage (`compare-gates-at-matched-coverage`,
`stated-distribution-over-closed-labels` rule 6). Until that set exists, "what proves the skill
pick is right" has the answer **nothing yet**. `model-routing` is not the home for this:
it routes calls to model tiers, and Q routes requests to skills.

## Source Q: a skill router in front of an agent

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| Q1 | A code-decidable prohibition, and a protective judgment, inherit the advisory gate's fail mode | README "Fails open"; `engine.py:99`, `:103-104`, `:272-280`; `hooks.py:55-58`; `agent-selection.yaml:19`, `:110-140` | Lead, 1/0/1 | Below. Confirmed in the tree; a boundary in `advisory-guard-fail-mode`, below +3 |
| Q2 | A group's summed probability is banded with the leaf's bars, unrescaled | [00:01:54]; `engine.py:154-172` against `:186-187` | Lead, 1/0/1 | Below. Confirmed in the tree; a boundary on the cardinality wall in `stated-distribution-over-closed-labels` |
| Q3 | Decide the cheap cases in code before any model call | [00:00:52]; `engine.py:245-257`; `agent-selection.yaml:76-85` | Already covered | `llm-residual-classification` (rulebook, suppressors, model on the residual); `model-routing` stance 3 |
| Q4 | Shadow, then advise, then enforce | [00:01:54], [00:02:41]; `hooks.py:10-14` | Already covered | `shadow-by-default-rules` in another bundle. In software-engineering only `node--advisory-guard-fail-mode` touches it; the port is untriaged |
| Q5 | The threshold is the caller's, per band | [00:01:46]; `bands.py:6` "Every threshold here comes from the rulebook" | Already covered | `stated-distribution-over-closed-labels` rules 1-2 |
| Q6 | Log every route with its reason | [00:03:08] | Already covered | `model-routing` § The decision record |
| Q7 | 70 → 90 % on 60 prompts after two rule edits | description; [00:03:08] | Already covered (negative) | `stated-distribution-over-closed-labels` rule 6. In-sample, self-labelled, n=60; not evidence |
| Q8 | Starter thresholds borrowed from the vendor's docs | README; `agent-selection.yaml:109`, `:119` | Already covered | rule 6; the 09-20 reranking note's unfitted threshold |
| Q9 | Route to a markdown skill without installing it | [00:02:13] | Untriaged | Thin: "a route target is a path". V4 |
| Q10 | 0.4 s and a fraction of a cent per decision | [00:03:08]; README | Already covered | Inside the 09-18 recorded range. Nothing to reset |
| Q11 | A fail-open rate as a health signal | README `doctor` | Already covered | `advisory-guard-fail-mode` § Instrument failure is loud. Corroborates |
| Q12 | Same gate, new rulebook (inbox triage) | [00:03:30] | Untriaged | Thin: a generic closed-label classifier |

## Source O: three micro-decisions moved off a generating model

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| O1 | The router must see what the message continues | [00:06:24]-[00:06:49] | Untriaged, 2/0/1 | Below |
| O2 | Three-level "how much work" router, argmax | [00:06:24]-[00:07:15] | Already covered | `turn-classification` (inferred class, abstain toward expensive). The source states no abstention direction |
| O3 | Route per question inside one thread | [00:01:42]-[00:02:08] | Already covered | `cache-continuity`. The source prices the router call, never the cached-prefix re-write a tier flip causes |
| O4 | Rerank 60 candidates, drop below about 20 % | [00:11:55]-[00:12:48] | Already covered | `second-pass-rescoring` and `bun--second-pass-rescoring` (promote-only); `relevance-floors`; `compare-gates-at-matched-coverage` |
| O5 | Steer the reranker with an agent-written criterion apart from the query | [00:12:48]-[00:13:38] | Untriaged, 2/2/2, `reconsider?` against [[2026-09-20-jev-rag-reranking]] row 1 | One line of descent with that row (same vendor how-to [00:14:57]), so no convergence. Sharper return condition below |
| O6 | Four-way graded citation verdict | [00:01:17], [00:08:07]-[00:08:58] | Already covered (negative) | `decompose-then-verify` § binary per claim. The source's own "partially 57 %" cannot say which half is unsupported |
| O7 | Keep "contradicted" apart from "says nothing" in the stored verdict | [00:08:07]-[00:08:32] | Untriaged, 1/2/1 | `decompose-then-verify`; `per-source-attribution` |
| O8 | A decision-only verifier returns no reason, so the audit artifact is lost | [00:03:25] | Untriaged, 1/2/1 | `decompose-then-verify` step 2 and its licence paragraph. Originated by the miner's reading, not stated by the source |
| O9 | Grade every thread, not a sample | [00:15:23]-[00:15:48] | Already covered | `scorer-cost-class` |
| O10 | Confidence badge shown to the reader | [00:00:51]-[00:01:17] | Already covered | `stated-distribution-over-closed-labels`; `probability-calibration-is-not-agreement` |
| O11 | "Zero hallucination" means schema validity only | [00:09:49]-[00:10:14] | Already covered | Settled 09-18 from the vendor's docs. The source states it correctly |
| O12 | Input-only price, per-job token counts | [00:03:25]-[00:04:16] | Currency (dated fact, no reset) | Below |
| O13 | Classify each chunk at ingestion into filter columns | [00:13:38]-[00:14:31] | Lead | Below |
| O14 | Pairwise entity resolution by a yes/no call | [00:14:31]-[00:14:57] | Lead (re-sighted) | The 09-20 reranking row 11, same vendor cookbook ancestor. Return unchanged |
| O15 | Per-turn "is this context still relevant" | [00:14:57]-[00:15:23] | Already covered | `model-curated-context` in `prompt-assembly` (landed 2026-11-10) |
| O16 | Similarity is not relevance | [00:10:39]-[00:11:30] | Already covered | The `retrieval` golden path; the 09-20 note row 9 |

## O1: the router's state, the one row where the voices meet

O's router rubric judges the user's message "on its own terms" and lists "an acknowledgement"
in the cheapest class [00:06:49], so "yes, go ahead" after a deep turn routes cheap. Two trees
reached the opposite rule without seeing each other: Q's rulebook decides a bare continuation
in code before the model (`agent-selection.yaml:82-85`, "Pure acknowledgements carry no routing
signal"), and the corpus's `node--turn-classification` application shows its judge the previous
turn's tier and tells it a short acknowledgement continues the previous task.
`turn-classification` itself says nothing about the state its classifier sees (opened; no
sentence on continuation, acknowledgement or previous turn).

Score after the promotion read: GAIN 2 (a boundary, +1 convergence), RISK 0 (both trees and the
technique opened), COST 1. **2 is below +3, so it is untriaged, not landed**, and it is not
written into `node--turn-classification.md` either: that application records one tree's facts
and already carries the continuation rule; this sentence would be a video's claim inside a
tree's record. Proposed wording, for whoever promotes it: *the classifier sees what the turn
continues, not only the turn; give it the previous turn's class, or decide continuations in
code before any model is asked; a rubric that lists "acknowledgement" among the cheap classes
has written the misroute into its label set.* Two notes for that writer: Q's code rule
resolves a continuation to `allow`, which also drops the previous turn's route, so deciding in
code is not the same as carrying the class forward; and no misroute rate exists.
**Return:** a measured cheap-misroute rate on continuations at a real inferred-class router.
Instrument: a labelled replay of logged turns, short replies after a deep turn at least a fifth
of the set, two arms on one judge (last message only; last message plus previous tier), the
misroute rate on continuations and the saving at matched coverage. A resident local judge is
enough.

## Leads

- **Q1. A prohibition code can decide, or a protective judgment, keeps its own fail mode, not
  the advisory gate's.** Read at `bcc1c20c`: forbid rules are computed in code before the model
  (`engine.py:245-253`) but enforced only by pruning the model's options (`engine.py:99`) and by
  the tool hook, which returns before the forbid check on any `fail:` verdict
  (`hooks.py:57-58`, "Never denies when the gate failed open"), at `fail: closed` too. Pruning to
  fewer than two options raises inside the guarded call (`engine.py:103-104`), so a forbid
  broad enough is itself a fail-open. The shipped rulebook also puts an irreversible-action
  check ("send, publish, deploy, buy, delete") as a model judgment in the same gate as routing,
  with one `fail: open` for both (`agent-selection.yaml:19`, `:110-140`). The corpus's
  `advisory-guard-fail-mode` assigns the class per interceptor; this tree shows one interceptor
  carrying an advisory and a protective check, and the protective one silently takes the
  advisory class. Proposed boundary: *the class belongs to the check, not the interceptor; a
  check code can decide is applied after or instead of the model, so it still holds when the
  model does not answer.* Scored 1/0/1, below +3. **Return:** a fleet seam whose prohibition is
  expressed only as a pruned choice list, or a second voice on mixed-class interceptors.
- **Q2. A rolled-up group confidence must be rescaled by the group's uniform share.** Read at
  `bcc1c20c`: the leaf is banded on the vendor's `confidence` field (`engine.py:186-187`), the
  group on the raw sum of leaf probabilities, against the same `act`/`confirm` bars
  (`engine.py:162`, `:169-170`). A group of `g` of `k` labels holds `g/k` under a uniform
  answer, so a large group clears the bar on size. The corpus's nominal formula
  `(p − 1/k)/(1 − 1/k)` with `1/k` replaced by `g/k` is the fix; the cardinality-wall failure
  mode names only the two-stage pick. Whether the vendor's leaf `confidence` is itself rescaled
  is a vendor-doc fact this run did not fetch (the README's 0.62 shown as 0.59 suggests it is).
  Scored 1/0/1. **Return:** a fleet seam that routes over grouped labels; probe raw against
  rescaled group bands at matched coverage.
- **O13. Ingest-time chunk tagging into filter columns.** Future tense, nothing shown.
  **Return:** a fleet ingest path that filters on a model-assigned chunk class. A supersession
  tag counts only with every read lane re-imposing it (`hybrid-lane-fusion`, 09-20).
- **O14. Pairwise entity adjudication.** Unchanged from 09-20 row 11; return as written there.
- **The verifier swap's agreement (O6-O8, O10).** Third time the corpus meets "a decision model
  replaced X and the confidence on screen was the evidence" (09-20, 10-05, here); the root is
  already landed in `stated-distribution-over-closed-labels`, so this is an instance, not a
  rule. **Return:** a seam that already runs a per-claim support check. Paired run on
  adjudicated claim-passage pairs including contradicted and insufficient cases: arm A the
  generating verifier with reasons, arm B a closed-label verdict; agreement at matched
  coverage, and the share of disagreements where A's reason exposes B's miss (the price of O8).

**O5's sharper return condition**, for the 09-20 row 1 it re-sights: one candidate pool scored
twice, under the query alone and under query plus criterion, on a labelled set. The criterion
must change the top-k order and raise precision on criterion-aligned items without lowering the
floor on query-only items. An unchanged order means the steer is decoration. Seam:
`bun--second-pass-rescoring`, whose relational-lane floor is the control.

## Currency

O12: about $0.04 per million input tokens, output free; router about 400 tokens, rerank of 60
chunks about 30k, citations about 11k. Relayed and unverified; internally consistent. No clock
resets, because the corpus states no price. Read it at the 2026-11-13 rescan of
[[2026-09-18-jevai-system-one]], which is where the vendor page gets its one fetch.

## Not extracted

O's community and course upsell ([00:10:14]-[00:10:39], [00:15:48]) and subscribe ask; the
"system one" marketing frame [00:02:33]-[00:03:25]; the trace-tool walkthrough [00:05:34]
(covered by the decision record). Q's mode names in the video (watching, advising, steering)
differ from the repository's (`shadow`, `advise`, `enforce`); the repository wins. Q's "166
checks passing" and the tests were not read.
