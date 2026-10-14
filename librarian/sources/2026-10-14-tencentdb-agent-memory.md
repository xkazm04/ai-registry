---
source: https://github.com/TencentCloud/TencentDB-Agent-Memory
kind: repository
url: https://github.com/TencentCloud/TencentDB-Agent-Memory
title: "TencentDB Agent Memory - a team-level memory hub for AI agents (chat memory, skills, wiki, code graph)"
author: TencentCloud (first-party; a cloud vendor's open-source memory service, self-hostable over local SQLite or its hosted vector store)
commit: 37b162963ce6cf73d8ae1807e3f3614ad23511ae
commit_date: 2026-10-14
words: 2,632 landing / ~70,500 in-tree markdown (about half CN/EN duplicates; ~15,000 read) / ~40,000 lines of core TypeScript, 1,258 tracked files, 0 test files; 0 of 3 fetches
extracted: 16 (9 design + 7 claim)
accepted: 2
declined: 0
leads: 3
already_covered: 5
untriaged: 6
dispatched: 0
applied: 2
shipped: 1
run_id: intake-tdbmem-1014
siblings: 3
lane: memory (entered on judgement: the source's subject is agent memory)
rescan_when: "a release after 2.0.3-beta.1 widens the L1 dedup filter past the session (MemoryCore/src/core/record/l1-extractor.ts batchDedup filter), or gives archiveHead a production caller, or commits the PersonaMem harness behind the README's 48% to 76%; or 8 weeks elapse (2026-12-09)"
---

# TencentDB Agent Memory - intake 2026-10-14

**Class:** vendor repository with a self-hostable engine, TypeScript, mined from a clone at
`37b16296` in the **memory lane**. Four systems: a memory core (L0 conversation, L1 atomic
memories, L2 scenes, L3 persona; a skill library; a context offload), a proxy that sits between
coding agents and the model API, a knowledge service (wiki and code graph) and a panel. The
in-tree documents are mostly install and API references; the design lives in why-comments
dated against incidents, so the code was the docs tier. The git history is one squashed
commit, and the tree ships **no test files** although three vitest configs and four backend
contract suites exist. Expected yield for the class, said before triage: one or two landings
against a 30-technique memory subject, most rows catches.

**Siblings:** 3 live at Phase 1 (`intake-rtk-1014` holding tool-result-economy,
measurement-honesty, subprocess-lifecycle, agent-runtime-assembly; `intake-vox-1014` holding
voice-io, trust-base, subprocess-lifecycle; `dle-r1-1014` holding nothing yet). This run held
agent-memory and prompt-assembly; neither was contended.

**Declared focus** (scorecard, icm row): the promotion read on partial rows. Applied: all four
partial rows got their promoting question executed with a file read; two promoted and landed,
one promoted to a real gap and still scored below the threshold, one stayed contested.

**Sweep:** the memory core's write path (`record/l1-dedup.ts`, `l1-writer.ts`,
`l1-extractor.ts`, `prompts/l1-dedup.ts`), its read path (`hooks/auto-recall.ts`,
`tools/l1-candidate-recall.ts`, `store/isolation.ts`), the persona trigger and generator, the
README benchmark and ROADMAP, by the director; three read-only scouts over the proxy, the
offload subsystem, and the skill library plus knowledge service, each returning a design record
with quoted anchors. Every anchor landed in an application was re-checked by
`check-anchors.mjs` against the clone (27 of 27 held).

## Design record

**D1 - Write-time dedup recalls candidates from the current session; search reads all of them.**
- decision: the L1 conflict pass's candidate pool is filtered by team, user, agent *and*
  session; memory search uses the same helper with a cross-session filter.
- forces: extraction runs per session and the isolation context makes the session mandatory on
  every write, so the session came along into the pool filter.
- buys: a small, cheap pool, and a delete guard that matches the pool.
- rejects: comparing against the owner's whole store. Not argued anywhere; inherited.
- where: `MemoryCore/src/core/tools/l1-candidate-recall.ts:4 "Used by memory_search (cross-session filter) and l1_dedup (session-scoped"`,
  `MemoryCore/src/core/record/l1-dedup.ts:44 "production extraction is session-scoped"`
- stage: L1 reconciliation, between extraction and write.
- corpus: agent-memory/scope-before-similarity models the too-wide direction only. Partial.

**D2 - Update and merge delete the targets, then write a new row; every failure stores all.**
- decision: replacement by delete plus insert, append-only JSONL as a log later cleaned, and
  store-everything on any judgment failure.
- forces: recall accuracy wants the old row gone at once; a lost fact is worse than a duplicate.
- buys: no stale duplicates in recall when the judge works; no loss when it fails.
- rejects: supersede links.
- where: `MemoryCore/src/core/record/l1-writer.ts:10 "On update/merge, old records are deleted from VectorStore in real-time;"`
- stage: L1 write.
- corpus: agent-memory/consolidation (supersede, don't replace; validate targets; degraded is
  marked). Catch.

**D3 - Stable memory at the system prompt's end, per-turn memory in the user turn; the proxy
removed per-turn recall entirely.**
- decision: the core's hook splits persona, scene navigation and tools guide (cacheable) from
  per-turn L1 recall (user prefix, with a "for reference only" disclaimer and an activity
  date); the proxy freezes its injected blocks per session and replaces per-turn recall with
  read-only tools.
- forces: per-turn text before the user message breaks the provider's prefix cache.
- buys: a byte-stable prefix within a session.
- rejects (proxy): per-turn L1 injection, stated as breaking the KV/prompt cache.
- where: `MemoryCore/src/core/hooks/auto-recall.ts:262 "persona, scene navigation, memory tools guide"`,
  `MemoryProxy/src/injection/index.ts:410 "L0/L1 不再每轮自动召回注入到 user prompt"`
- stage: injection.
- corpus: prompt-assembly (layered composition, cache breakpoints) and agent-memory/recall-injection.
  Not opened this run; untriaged. The two subsystems of one product disagree, which is the
  interesting half.

**D4 - A decision service may only bring an L3 persona rewrite forward, never block one.**
- decision: a deterministic five-condition trigger decides; when it says no, a model judge
  labels the changed scenes (conflict > boundary change > new rule = rewrite now; reinforcement
  or none = defer); any error, invalid label or oversize state defers without advancing the
  checkpoint, so the scenes are judged again next round.
- forces: a threshold alone rewrites too often or misses a contradiction; a remote judge on the
  critical path must not stop the always-on tier from being revised.
- buys: the judge's worst case is the baseline schedule.
- where: `MemoryCore/src/utils/pipeline-factory.ts:1134 "Existing trigger policy has priority and bypasses JEV."`
- stage: L3 scheduling, after L2.
- corpus: NONE (nearest agent-memory/memory-governance; nothing in the subject says when the
  always-on summary is rewritten).

**D5 - Skills version append-only; nothing retires one.**
- where: `MemoryCore/src/core/skill/__contract__/skill-store.contract.ts:172 "const res = await store.archiveHead("`
  is the only call of `archiveHead`;
  `MemoryCore/src/core/skill/skill-tools.ts:12 "不暴露 delete / files_remove"` omits delete from the reviewer.
- corpus: agent-memory/decay-and-forgetting ("no callers, green tests"). Catch, third instance.

**D6 - The skill reviewer reads the transcript under past-tense role tags, an end marker and a
restated task, with a reply closed to tool calls or a nothing-sentinel.**
- forces: a recorded incident: plain role names made the reviewer continue the main
  conversation (1,235 tokens, zero tool calls).
- where: `MemoryCore/src/core/skill/skill-extractor.ts:475 "1235 tokens 的主对话续写，零 tool call"`,
  `MemoryCore/src/core/skill/skill-extractor.ts:478 "<<past-${m.role}>>"`,
  `MemoryCore/src/core/skill/skill-extractor.ts:479 "Above is the past conversation to review."`
- stage: transcript formatting before extraction.
- corpus: prompt-assembly/foreign-harness-history-folding enumerates three carriers for two
  reader purposes (continuation, awareness). Review is not among them. Partial (a seam).

**D7 - The proxy delivers a selected skill by answering one turn with a synthesized tool call
to the client's own shell.**
- forces: injecting the catalog bloats the prefix; splicing skill text needs proxy state.
- buys: the skill text lives in the client's history, byte-stable afterwards, and the proxy
  holds no state (rebuilt from tool-call id prefixes).
- rejects: the catalog. Skipped when the upstream checks reasoning signatures, because a
  synthesized assistant turn has none.
- where: `MemoryProxy/src/skill/selection/delivery/client-tool.ts:5 "proxy 不回补、不持有状态"`, read by the
  director at lines 1-11.
- corpus: agent-runtime-assembly/substituted-result-attribution covers the mirror case (a result
  substituted for a call that did not run); here a call is attributed to a model that did not
  make it. Contested home, and a sibling holds the subject.

**D8 - Context offload: a tool result is replaced by a pointer to a raw copy written before the
summarizer runs; a degraded summary scores 0, below the replacement floor.**
- corpus: prompt-assembly/elision-to-a-refetch-pointer, summary-evidence-gate, history-compaction.
  Catch (use_when and the failure sections read, not every rule).

**D9 - Wiki re-ingest keys on the source hash and merges additively; a changed source's
superseded statements stay on the page.**
- where: `MemoryKnowledge/src/engines/wiki/ingest-v2/merge.ts:115 "If old and new conflict, keep both and explicitly note the disagreement."`
- corpus: retrieval/chunking-and-indexing covers chunk re-ingest, not compiled pages. Partial.

**Routing count.** Per system, NONE entries: memory core 1 (D4), offload 0, skills 0 (D6 is
partial), proxy 1 at most (D7), knowledge 0. Across systems, no three entries share a home if
new. **No system reaches three; no forge handoff, no XL.** Stayed in intake.

## Triage

Expected yield said before the table: one or two landings, most rows catches. Rule per row:
upper-layer rows scored under Phase 5; leads under the corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| D1 | K | amendment | M | A pool finer than the read is a crossing too | agent-memory/scope-before-similarity | corrects-claim | partial -> real gap | 2/0/2 | **accept** |
| D6 | K | amendment | S | A transcript read for review is a fourth reader | prompt-assembly/foreign-harness-history-folding | new-technique | partial -> real gap | 2/0/1 | **accept** |
| D4 | K | technique | M | A judge may only advance the always-on rewrite | agent-memory (none) | new-technique | real gap | 3/1/2 | **lead** (memory lane: a mechanism is an arm first) |
| D7 | K | technique | M | Deliver context by a synthesized tool call | agent-runtime-assembly/substituted-result-attribution | new-technique | partial (contested) | 2/1/2 | untriaged (+1) |
| C7 | K | amendment | S | Bulk import needs a stricter capture bar than live | agent-memory/episodic-capture | fills gap | partial -> real gap | 1/0/1 | untriaged (+1) |
| D2 | X | application | M | Replace by delete; fail toward store; merge raises priority | agent-memory/consolidation | none | catch | - | covered + application |
| D5 | X | application | M | Retirement method with no caller | agent-memory/decay-and-forgetting | none | catch | - | covered + application |
| D8 | K | - | - | Offload pointer, degraded-summary quarantine | prompt-assembly (3 techniques) | none | catch | - | covered |
| C2 | K | - | - | One score threshold, three backend meanings | retrieval/relevance-floors | none | catch | - | covered |
| C3 | K | - | - | Token estimate margin rests on unrecorded error | prompt-assembly/context-budgeting | none | catch | - | covered |
| C1 | - | lead | S | PersonaMem 48% to 76% | baseline-ladder | none | thin | - | **lead** |
| C6 | - | lead | S | L0 rewrites the same query every tool-loop step | agent-memory/episodic-capture | none | thin | - | **lead** |
| D3 | K | - | - | Core injects per turn; proxy forbids it | prompt-assembly, recall-injection | none | likely catch | - | untriaged |
| D9 | K | - | - | Compiled wiki pages never retract | retrieval/chunking-and-indexing | fills gap | partial | - | untriaged |
| C4 | K | - | - | Unknown errors retry forever, including 401 | resilience/retry-backoff | none | likely catch | - | untriaged |
| C5 | K | - | - | Classify a harness's side requests before writing memory | agent-memory/episodic-capture | none | partial | - | untriaged |

`auto=2/2/0` (accepted D1, D6; rejected by score D7, C7; no escalation), `fp=0` (both accepted
rows survived Phase 6). D4 is not counted as a score reject: it cleared the score and was routed
to a lead by the memory lane's arm-first rule.

## Accepted

**D1 - `scope-before-similarity` gained "Finer than the read is a crossing too".** The
technique's rule partitions by ownership scope and never said *no finer*. Verified: the pool
filter (`MemoryCore/src/core/record/l1-extractor.ts:323 "filter: { teamId, userId, agentId, sessionId, taskId }"`), the helper's two-filter header, and the mandatory session in the
isolation type. The amendment states the mirror failure, that it is served-stale before
answered-stale, that a field may legitimately guard this path's delete without being a scope
field (the tree does exactly that, soundly), and that the key is exact: no field the read path
ignores. Two decision rules and a use_when clause. Measured (below).

**D6 - `foreign-harness-history-folding` gained "A reader that reviews is a fourth case".** The
technique's enumeration of carriers served continuation and awareness; review was missing, and
the source shows what native role markers do to a reviewer. The falsifying seam changed the
landing before it was written: a fleet implementation that encodes the transcript as a JSON
value and ends on the data had zero failed parses in 14 real passes, so the end marker and
restatement are scoped to turn-shaped renderings rather than stated as universal. Two decision
rules and a use_when clause. Convergence: two independent implementations reached the same
rule (data framing plus a closed reply with an explicit empty answer).

## Applied (Phase 7.5)

| technique | project | mode | verdict | seam, and why it could falsify |
|---|---|---|---|---|
| scope-before-similarity | personas | experiment | better | The fleet memory ladder's own scenario. Chosen to falsify: if state changes were usually restated within a session, a session pool would lose little and the amendment would be a curiosity. A=project+day pool reaches 0/73 changes, B=read scope 73/73; floor (in-session reach) held by construction; 51/73 old values last stated >30 days earlier; 92/92 reversal and expired probes rest on an unreached change. The ladder ingests the year as one conversation, so it was blind to the defect. Shipped as `checks/partition_reach.py` + a FINDINGS note, personas `d6e06a6231` (master, not pushed). |
| foreign-harness-history-folding | personas | simulation (recorded outcomes) | not-better | The sleep consolidation leg, chosen because it omits one of the three parts (ends on the data, no restatement). The live ledger, read-only: 14 consolidation passes, 12 acted, 2 used the empty answer, 0 failed, on inputs of 3,062 to 84,042 characters; a parse failure is recorded as `failed` (confirmed in code). Adding the end marker would change nothing measurable here. The condition went into the amendment. |

## Leads

- **D4, the always-on rewrite gate.** Return: when a memory-ladder arm implements a rewrite
  trigger for the always-on tier with a judge that can only advance it, measured against the
  same arm without the judge (stale answers from the always-on tier, rewrite count).
- **C1, PersonaMem 48% to 76%.** No harness, model, judge or protocol in the tree, and the only
  comparison is against no memory, the ladder's floor rung. Return: when the harness is
  published, re-run it as an arm; never cite the number.
- **C6, duplicate L0 writes.** Scout inference: the proxy's L0 write walks back to the last human
  query on every request, so each tool-loop step re-records it (one client was patched for this;
  the others were not). Return: replay one tool loop through the proxy and count L0 rows.

## Already covered

D2 (consolidation; the merge priority raise is the second sighting this week of importance
ratcheted through merges, recorded by the other source as a feature; a third promotes it to an
amendment of the reinforcement rule), D5 (decay-and-forgetting, third "no callers" instance),
D8 (elision pointer, summary gate, history compaction), C2 (relevance-floors: thresholds name
the path they were calibrated on; the small-store BM25 bypass is in the untriaged row below),
C3 (context-budgeting: a stated estimator with known error; here the error is stated in comments
and the benchmark that would know it cannot run: wrong import path, untracked corpus).

## Untriaged (nobody verified these; they carry no judgment)

| row | anchor | why not taken |
|---|---|---|
| D7 synthesized tool-call delivery | `MemoryProxy/src/skill/selection/delivery/client-tool.ts:5 "proxy 不回补、不持有状态"` | scored 2/1/2; contested with substituted-result-attribution; sibling holds the subject |
| C7 bulk import strict, live lenient | `MemoryCore/src/core/skill/prompts/skill-review-prompt-strict.ts:12 "v2 会抽出成百上千低价值 skill 淹没高价值"` | promoted to a real gap (no channel boundary in episodic-capture), scored 1/0/1 |
| D3 core vs proxy per-turn recall | `MemoryCore/src/core/hooks/auto-recall.ts:262 "persona, scene navigation, memory tools guide"`, `MemoryProxy/src/injection/index.ts:410 "L0/L1 不再每轮自动召回注入到 user prompt"` | cache layering not opened this run |
| D9 compiled pages never retract | `MemoryKnowledge/src/engines/wiki/ingest-v2/merge.ts:115 "If old and new conflict, keep both"` | no home opened; the ladder's compiled-truth arm is the nearest measured shape |
| C4 unknown error transient forever | `MemoryCore/src/core/skill/conversation-add/extract-worker.ts:698 "兜底：识别不出的按 transient 处理"` | retry-backoff not opened |
| C5 side requests never write memory | `MemoryProxy/src/common/cc-request-classifier.ts:45 "if (markerIdx === n - 2) return"` | vendor-specific marker position; principle unmapped |

Also seen, no row: the small-store BM25 floor bypass (`MemoryCore/src/core/hooks/auto-recall.ts:575 "if (ftsResults.length <= maxResults) {"`) keys on result
count, not store size; the offload's mild tier claims to spare the current task and the loop
never checks it (scout); the proxy's skill judge sends up to 6,000 characters of dialogue to an
external service by default (scout).

## Directions

None proposed: the fleet map lists no absent project for agent-memory or prompt-assembly
(`directions=0/0`). Gate skipped (unattended).

## Corrections and catches about the source class

A memory vendor's repository with no tests and a squashed history still carried its incidents,
in why-comments with trace ids and dates. The proxy and the core disagree about per-turn recall,
which is a finding about a product, not about either file. The benchmark number came without a
harness; the instruments that ship (a lock benchmark, a token-estimate benchmark) record no
results, and one of them cannot run.
