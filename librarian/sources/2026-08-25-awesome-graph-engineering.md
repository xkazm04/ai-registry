---
source: repo
url: https://github.com/DEEP-JLU/Awesome-Graph-Engineering
title: "Awesome Graph Engineering - Graph Engineering in the Era of LLM Agents"
author: DEEP-JLU
kind: paper-aggregator (awesome-list, ~284 papers)
mined_on: 2026-08-25
skill_version: 0.7.0
extracted: 7
picked: 3
accepted: 3
already_covered: 2
declined: 1
leads: 3
untriaged: 0
dispatched: 0
---

# Awesome-Graph-Engineering, 2026-08-25 - three papers read out of 284, on purpose

Run 12, third source of the hardening series, and the first **paper
aggregator**. The operator's framing set the method: "find balance between
consuming the most relevant ones" with open scepticism that papers move
practice. The class rule that emerged and is now in the skill: triage at
CLUSTER level against the corpus's subjects, read at most ~3 papers, and
prize measurements, failure taxonomies and negative results - the framework
papers are the class's marketing.

Despite the graph branding, the list is a taxonomy of LLM-agent systems
engineering, and its sections map near 1:1 onto `llm-agent`. The cluster
map (recorded so the next list is a one-table triage):

| List section | Corpus home | Disposition |
| --- | --- | --- |
| Skill Composition | agent-memory/procedure-promotion, the skills lane | READ (Demystifying Agent Skills) |
| Agent Coordination + Task Organization (~80 papers) | fleet-orchestration, agent-chaining, heterogeneous-model-panels | READ (MAST); frameworks skipped as a class |
| Memory Management | agent-memory | READ (Zep, + Mem0 as counter-lane) |
| Context Engineering | retrieval, prompt-assembly/context-budgeting | catch (lineage already in the corpus; Lost-in-the-Middle = run 10's declined #13) |
| State Management (transactional tool use, event-sourced agents) | fleet-orchestration/durable-fleet-state - nothing owns compensation | LEAD |
| Ontology Engineering | the registry's own taxonomy; open thread #9 (lexical matching) | LEAD (papers thin; the cluster's existence is the signal) |
| Pre/Post-Training, Tool Integration, Runtime Orchestration frameworks | various | skip - no measured residue a consumer here can act on |

## Accepted

| Paper | What survived | Landed |
| --- | --- | --- |
| Demystifying Agent Skills: Why They Work - Until They Don't (arXiv 2608.14036; 8,135 trials, two harnesses, three benchmarks) | Skills work by procedural anchoring (65.7%) not knowledge injection (4.5%); promoted-and-compressed beats raw workflow replay by +6.06 (CI +0.76..+11.36), setup failures 5.3% -> 0.2%; **actual-use selection precision collapses 29.6% -> 3.3% as pools grow 5 -> 100 while success stays flat** - a growing library fails silently; confusable neighbours hurt more than size | Two sections amended into `agent-memory/procedure-promotion` ("What the artifact contains: actions, not facts"; "Selection is the scaling failure"). The raw-replay half is the second independent 2026 measurement of the shapes-study's raw-replay harm - convergence noted in the text. |
| Why Do Multi-Agent LLM Systems Fail? (MAST, NeurIPS 2025 D&B; 1,600+ traces, 7 frameworks, kappa 0.88) | 14 modes, 3 classes: specification 41.77%, inter-agent misalignment 36.94%, verification 21.30%; largest single modes are member-level defects (step repetition 17.1%, reasoning-action mismatch 14.0%); measured interventions: role-spec rewrite +9.4, objective-level verification +15.6 - briefs and gates, not topology | New technique `fleet-orchestration/coordination-failure-triage`. Converges with run 10/11's task-envelope + brief-carries-the-session from an independent direction (the interventions ARE those techniques, measured). |
| Zep: A Temporal Knowledge Graph Architecture for Agent Memory (arXiv 2501.13956) + Mem0 (2504.19413) as counter-lane | DMR 94.8 vs 93.4 (marginal); LongMemEval up to +18.5%; latency -90% vs full-context (a cheap baseline); Mem0's own graph variant beats its non-graph base by ~2% | **Catch, and the corpus already says it better**: `consolidation` carries supersede-don't-replace, states-close-events-accumulate, and explicitly names the limitation of windowed supersedence. What landed: one store-shape paragraph in the agent-memory golden path - two independent sightings (shapes-study hybrid-ties-flat; the vendor's own +2% ablation) that graph topology buys marginal recall; the value is in the transitions. |

## Already covered

- Zep's temporal machinery (above) - the run's best catch; the corpus's
  consolidation passage predates and outreasons it.
- Context Engineering lineage (dense retrieval, self-critiquing RAG, prompt
  compression) - the retrieval and context-budgeting bloodstream.

## Declined

- The task-graph / workflow-search framework space (the AFlow / GPTSwarm /
  ADAS / EvoFlow / supernet family) as a class: optimisation over agent
  topologies with no residue a consumer here can act on today. Recorded as a
  class decline so the next list's sixty variants do not get sixty rows.

## Leads

- **Transactional tool use / compensation** (the SagaLLM / Atomix / Cordon /
  compensation cluster; event-sourced agents; agent version control).
  Nothing in the corpus owns "an agent's side-effecting actions as
  transactions with compensation on failure". Return: a connected project
  needs rollback across tool calls (the companion's approval-gated ops are
  adjacent), or a second aggregator shows the cluster matured.
- **Ontology engineering for agent systems.** Papers thin (preprint-grade),
  but the cluster is the field's name for open thread #9 (lexical matching
  misses renamed concepts; taxonomy as the authority). Return: when thread
  #9 is worked, check this cluster for prior art first.
- **"Multi-agent teams hold experts back" (arXiv 2602.01011)** - unread;
  title-level fit with heterogeneous-model-panels' "when the voting
  baseline should win". Return: next deepen pass over fleet-orchestration,
  or a second sighting of the result.

## Class notes (first observation, now a SKILL row)

- Cluster triage held: 284 papers -> 7 rows -> 3 reads, and every read
  landed or produced the run's best catch.
- The scholar-link tell: entries whose [Paper] links go to a search-engine
  query rather than a stable id mark the thin tail; arXiv-id density per
  section is a cheap relevance prior.
- ar5iv served one full text and 307-redirected on a fresh id; the
  `/html/<id>v1` path on the primary host was the working fallback.
- 7 fetches total under the new per-paper budget (2 + 2 + 2 + 1 list read).
