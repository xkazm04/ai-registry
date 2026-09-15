---
source: repo
kind: app-aggregator (tutorial monorepo) - full re-run on intake 2.10.0
url: https://github.com/Shubhamsaboo/awesome-llm-apps
title: "Awesome LLM Apps - 100+ AI Agents, Agent Skills and RAG Apps"
author: Shubhamsaboo (plus community PRs)
commit: 459356969d4deda9f6068d8d9fe79ebb7a21f6a7
prior_mine: 2026-08-25 at 11a4bc3 (intake 0.8.0), 61 commits / 73 files behind
words: 2,525 landing / 175,630 in-tree md; 544 .py files, ~84,600 lines
extracted: 44
accepted: 4
declined: 0
leads: 10
already_covered: 8
untriaged: 22
dispatched: 0
applied: 4
shipped: 1
run_id: intake-awesome-llm-apps-0915
siblings: 2
operator_scope: "full re-run on v2.10 (operator chose it over a delta re-scan and over stopping)"
rescan_when: "the agent_skills lane ships a measured result for first-reader against human readers (evals/first-reader/ledger.md gains a round with real readers), or the MCP Apps showcase moves its sandbox proxy off the host origin, or 10 weeks elapse (2026-11-24)"
---

# awesome-llm-apps, full re-run 2026-09-15 - the fixes are the source

A source originates a finding; it never authorizes one.

**Class:** app/tutorial aggregator, already mined once. The class rule held and sharpened:
the apps resolve to catches, and this time the yield did not come from the operational
periphery either. It came from **fixes that are still wrong** and **defaults the apps
undo**. Four landings, all amendments to boundaries the corpus had drawn one case too
narrowly, and every one located by a commit or a line where the tutorial author was
visibly trying to do the right thing. Expected yield stated before triage: catches,
leads, at most two boundary amendments. Actual: four, because four cluster readers
beat one director's sample.

**Siblings:** 2 live at claim (react-19-3 at phase 4, ragas at phase 0), 4 by Phase 5
(adds aecoach, cline-desktop). None held retrieval, agent-cli-transport or
embedded-preview.

**Declared focus from the previous row** (motionbricks): (1) clone what implements a
review: the source was already a repository, cloned at a short path, checkout verified
(1,884 tracked, clean status); (2) ask what a producer reads: partially applies; the
env row is exactly "what the child can read"; (3) run the fleet's own research ledgers
in the seam hunt before scoring currency: no currency row this run; the seam hunt ran
across all 13 fleet trees and located three of the four apply seams.

## Sweep

- **Director:** `agent_skills/` in full where new since 08-25: `first-reader`
  (SKILL.md, the development ledger with six rounds, `feed.py` pacing/token mechanism,
  `signals.py`), `thinking-out-loud`, `advisor-orchestrator-worker`, the eval ladder
  (`evals/README.md`, `run_trigger_evals.py`, `skill_scanner.py` patterns, the
  `skill-evals.yml` workflow), `self-improving-agent-skills` (README, optimizer loop).
  About 14k words.
- **Four read-only cluster workers**, returning proposals only: advanced_ai_agents
  (~15k words), generative_ui + mcp + voice (~9k source lines), advanced_llm_apps + rag
  (~3k lines read, 24 RAG apps grep-swept), crash courses + starters + always-on
  (~1,900 lines read, 110 crash-course files swept).
- The upstream compare 11a4bc3...4593569 steered every worker to the changed entries
  first. The clone is depth 1, so every "before" of a fix is inference from the commit
  message and the current code, labelled as such.
- **Design read:** routing count 0. An aggregator is not a system; no app carries
  load-bearing decisions the corpus lacks, and no three candidates share a
  home-if-new. No handoff, no design record, directions n/a.

## Triage (upper-layer rows scored; currency none; leads under the corroboration table)

| # | Row | Home | Read | G/R/C | Decision |
|---|---|---|---|---|---|
| 1 | A distance-to-similarity conversion inherits the index's unit | retrieval/relevance-floors | real gap | 2/0/1 | **accept** (amendment) |
| 2 | A child over untrusted content gets a built environment | agent-cli-transport/subscription-auth-selection | real gap | 3/0/2 | **accept** (amendment, inverts the named strip) |
| 3 | Frames with no origin move the controls, they do not waive them | embedded-preview/origin-validation | real gap | 2/0/2 | **accept** (amendment, inverts "never wildcard" for opaque guests) |
| 4 | The embedding role is a fifth input the stamp cannot see | retrieval/embedding-lifecycle | real gap | 2/0/1 | **accept** (amendment, refutes the four-input enumeration) |
| 5 | Reader simulation as a pre-publish stage for long-form prose | copy-quality-gates or content-production | real gap | 2/2/2 | untriaged -> lead |
| 6 | Echo what was absorbed before acting on a ramble | llm-agent (none) | partial | 2/2/2 | untriaged -> lead |
| 7 | Delegated scope narrowing must intersect every field; revocation cascades | secret-custody (contested) | real gap | 2/2/2 | untriaged -> lead |
| 8 | Re-anchor model-reported timestamps to the quoted evidence | none | real gap, narrow | 2/1/2 | untriaged -> lead |
| 9 | Never let a model re-classify a decision the UI captured as typed | hitl-approval | partial | 1/1/1 | untriaged -> lead |
| 10 | A proxy allowlist the client writes is not an allowlist | mcp-tools | partial | 1/1/1 | untriaged |
| 11 | Nested agent runs leak callbacks through implicit context | agent-chaining? | partial | 1/1/2 | untriaged |
| 12 | Stores that hand out copies: write through the event channel, re-fetch after | session-continuation? | thin | 1/1/1 | untriaged |
| 13 | A concurrent input screen is advisory, not a gate | hitl-approval | partial, unverified | 2/2/1 | untriaged -> lead |

Row 1 carries +1 convergence: two cluster readers reached the double square without
seeing each other, and the director confirmed it in the tree. Row 2 carries +1
convergence: the source's stdio client default allowlist (verified in the installed
package by the worker) and pumper's `process_env.rs`, independent. Row 3's RISK went
1 -> 0 on a promotion read of `McpAppPreview.tsx:199` and `public/sandbox.html:58-87`,
plus one fetch of the MCP Apps specification. Row 4's GAIN takes +1 for refuting an
enumeration ("a stored vector is a derivation of four inputs").

`auto=4/9/0; fp=0`. All four accepted rows survived Phase 6 on the owning file.

## Landed

1. **relevance-floors: "A floor stated in converted units inherits the conversion."**
   The squared-vs-root precondition, the unit-length precondition, and the reason
   tests miss it: the two formulas agree at identical, cos-0.5 and orthogonal pairs,
   so only a pair near the floor separates them. Occasion:
   `beifong/tools/embedding_search.py:15-23`, a fix commit that squares a squared FAISS
   distance (floor 0.85 admits cos 0.726). Application `rust--relevance-floors`.
2. **subscription-auth-selection: "When the child reads untrusted content, the strip
   inverts into an allowlist."** A named denylist is right for billing and wrong for
   exfiltration. Occasion: three tutorial apps spread `os.environ` into tool-server
   launches that default to a safe list. Application `python--subscription-auth-selection`.
3. **origin-validation: "When the guest has no origin."** Identity-checked inbound,
   no same-origin for markup the host did not author, relay on a separate origin with
   host-chosen flags, wildcard sends carry only what the guest already had, verbs gated.
   Discriminator: authorship, not the mechanism. Application `next--origin-validation`.
4. **embedding-lifecycle: "The role is a fifth input, and the stamp cannot see its
   query half."** Occasion: `gemini_agentic_rag` embeds queries as documents; 4 of 9
   RAG apps get the role wrong. Discriminator: whether the two sides of the distance
   play different parts. Application `next--embedding-lifecycle`.

## Applied (Phase 7.5)

| Technique | Project | Mode | Verdict | Proof |
|---|---|---|---|---|
| relevance-floors | personas | experiment | better | ab-paired: standalone crate on the lockfile pins; ordering-only assertions pass real AND squared index, known-pair pin fails squared; floor 1.30 admits cos >= 0.155 as documented |
| subscription-auth-selection | a private runtime | code | better | ab-paired: 86 vars / 2 of 2 planted secrets seen -> 22 vars / 0 of 2, child starts in both; gate green; committed |
| origin-validation | personas | simulation | not-better | print frame is host-authored and escaped, and needs same-origin for print(); the source's two hosts are the cases where policy B is right |
| embedding-lifecycle | systedo-case | simulation | unmeasurable | pattern RAG sends no role; kp's symmetric fit score is the control; instrument named |

Every seam was chosen to falsify. Row 1 could have shown personas' floor comment wrong
the same way the tutorial was; it held, and returned the missing pin instead. Row 3
returned the authorship discriminator that is now in the amendment.

## Already covered (each owner opened)

- Self-graded skill optimizer that keeps a mutation when the score rises on its own
  generated scenarios: `eval-harness/selection-over-noise` + `candidate-write-access`.
- Barge-in leaves scheduled audio playing: `voice-io/tts-pipeline` ("interruption
  cancels the whole utterance: audible playback halts").
- A per-call price cap in an unbounded payment loop: `cost-metering/budget-enforcement`.
- A per-user key copied into process-global environment: `tenant-scoped-agent-runtime`
  application (task-local scope, never mutate the environment).
- The same absolute threshold copied across three embedders, no retrieval eval in
  24 RAG apps: `relevance-floors` ("calibrated, not felt").
- A mock-LLM tripwire undone by a CI secret: `test-harness/recorded-interaction-fixtures`.
- A payment gate that reads a missing amount as 0: `mcp-tools/egress-argument-gating`
  plus `unknown-is-not-a-value`.
- Hash-chained audit trail: the 08-25 decline stands (single-owner governance).

## Leads

- **Reader simulation before publishing long-form prose** (`agent_skills/first-reader`).
  A served feed releases a draft one passage at a time to fresh reader agents, behind a
  token and a reading-speed floor, logging a felt needle, quit points, next-day recall,
  and a portable-sentence share; the orchestrator never reads the draft until the reads
  finish. Its ledger reports two opposite planted fixtures separated on every instrument,
  a rerun quitting at the same passage, and a cold run reconstructing a hidden
  construction. The corpus's copy gate is span-level and its generated-prose rules
  explicitly exclude long-form editorial prose, and it cites model judges agreeing with
  humans on slop at about chance. So the gap is real, and the source's evidence that
  simulated readers track human ones is n=1 author. Return: a paired run of the reader
  instrument against human readers on the same drafts, or a fleet surface that publishes
  long-form prose under the English copy standard.
- **Echo before acting on unstructured input** (`thinking-out-loud`). "Questions verify
  what the model doubts; the echo verifies what it believes"; inferences quarantined from
  the user's words; reversals surfaced. Converges with aviation read-back and with
  recruiting's stated/inferred/default provenance, but nothing in llm-agent owns it.
  Return: a fleet agent surface that takes dictated or long free-form briefs.
- **Delegation scope narrowing** (`multi_agent_trust_layer.py:102-165,317`). The empty-set
  sentinel was fixed; sibling fields still widen and parent revocation does not cascade.
  Home contested (issuance-policy-ladder holds "empty means nothing"). Return: a fleet
  project that issues child grants from parent grants.
- **Timestamps re-anchored to quoted evidence** (`earnings_call_analyst_agent/agent.py:216-277`).
  Return: a fleet pipeline that asks a model for offsets into a transcript or document.
- **Model re-classifies a typed UI decision** (`ai_codebase_migration_agent/app.py:387-434,896-913`).
  Return: a second sighting, or a fleet approval flow that routes free text to a classifier.
- **Buyer-side payment quote validation** (`starter_ai_agents/ai_x402_paying_agent`):
  amount-only cap, wildcard network, unchecked recipient, redirects followed, no run
  ceiling, and a README that says it "can never overspend". Return: a fleet agent that spends.
- **Concurrent input guardrails are advisory** (openai-agents crash course, unverified; the
  library was not installed). Return: one fetch of the SDK's guardrail execution docs.
- **Memory write: who spoke vs who the fact is about** (career coach fix stores only the
  candidate's message; six memory apps take four different policies). Memory lane: a
  mechanism becomes an arm first. Return: the memory-year scenario carries assistant turns
  that assert things about the user; run a speaker-attributed ingest arm against flat ingest.
- **Skill supply-chain scanner** (`evals/tools/skill_scanner.py`: pipe-to-shell,
  obfuscated exec, credential paths, undeclared network, unpinned installs, install lures
  in prose). The supply-chain subject treats a plugin as an archive, not as instructions an
  agent executes. Return: the registry or a fleet project installs third-party skills.
- **MCP Apps (08-25 lead), updated:** a second sighting, two hosts in this tree, but both
  sit on one vendor middleware and both are tutorials, so the return condition
  ("independent, in production use") has not fired. The trust-boundary half landed as
  row 3; the lead now covers only the product pattern.

The 08-25 leads on tabular serialization and a measured RAG failure taxonomy are unchanged;
the second is reinforced (0 of 24 RAG apps measure retrieval).

## Untriaged (extracted, never verified; not declines)

Zero-item fan-out strands the join and "completed" with an empty report
(`ai_codebase_migration_agent/app.py:616-654`); a ban test that catches only bare `exec`
(`test_app_security.py:7-35`); input never reaching the model (`ai_3dpygame_r1.py:148-164`);
deny evaluated after allow, prefix path containment (`ai_agent_governance.py:108-270`);
proxy allowlist written by the client (`mastra-agent/route.ts:28-214`); every requested tool
call charged to the budget, tools removed at exhaustion (`openai_remote_mcp_bridge.py:157-225`);
nested agent callbacks leaking through context variables (`ai-deep-research-agent/agent/tools.py:83-176`);
side effects hung on tool-render callbacks (3 apps); schema shape as binder dispatch key
(`definitions.ts:19-144`); keyword escalation with a fixed negation list (`policies.py:128-139`);
IVF centroids trained on uniform random vectors (`faiss_indexing_processor.py:27-59`);
same-name upload skipped by a filename ingest key (`corrective_rag.py:199-236`);
density-biased routing by average top-k (`rag_database_routing.py:160-186`);
authority framing on a similarity-gated answer reuse (`query_router.py:86-125`);
memory keyed on a typed identifier (6 apps); session state written to a copy
(`9_2_loop_agent/agent.py:46-219`); a character allowlist that admits `9**9**9`
(`calculator_agent/tools.py:20-30`); shared-key tool timing and output-price-only cost
(`6_3`, `6_2`); charged-but-not-delivered retried as a failure (x402 `:109-146`);
advisor-orchestrator bash hygiene (per-pid wait, briefs via file); the lexical
positive/near-miss trigger tier (08-25 adopted the pairwise half only); the
Pub/Sub push path with no message-id dedup (`scheduler_api.py:100-122`).

## Instrument notes

- One fetch spent of three (MCP Apps specification); zero on rows 1, 2, 4
  (training-data convergence plus code opened).
- research-map's first call over 20 terms was capped by the pipe at 230 lines and the
  later terms were re-run instead of read as empty.
- Four cluster workers for an aggregator of this size: the four landings came from three
  different workers and the director's periphery pass produced only leads. A single-reader
  run over this tree would have repeated the 08-25 sample.
