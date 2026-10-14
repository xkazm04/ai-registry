---
layer: application
type: application
subject: agent-memory
technique: scope-before-similarity
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22.16
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A dedup pool one session wide over a search that reads them all (TencentDB Agent Memory)

Source tree: `github:TencentCloud/TencentDB-Agent-Memory@37b16296` (2026-10-14), a team memory
service for coding agents: a TypeScript core that extracts atomic memories (L1) from
conversations, rolls them into scenes (L2) and a persona (L3), and a proxy that injects them.
The stack version is the floor its core package declares (`"node": ">=22.16.0"` in
`MemoryCore/package.json`). The experiment below ran; nothing in the source tree was executed.

## The two filters, stated in one comment

Write-time conflict detection and search share one candidate helper, and its header names
both callers' isolation in the same sentence
(`MemoryCore/src/core/tools/l1-candidate-recall.ts:4 "Used by memory_search (cross-session filter) and l1_dedup (session-scoped"`).
The dedup side says where its scope came from
(`MemoryCore/src/core/record/l1-dedup.ts:44 "production extraction is session-scoped"`), and
the extractor passes the session as part of the pool filter
(`MemoryCore/src/core/record/l1-extractor.ts:323 "filter: { teamId, userId, agentId, sessionId, taskId }"`).
The isolation type explains why the field is mandatory on every write
(`MemoryCore/src/core/store/isolation.ts:23 "never replace sessionId/sessionKey because L1 extraction is session-based."`).

So a value restated in a later session is compared only with that session's records. The
old row is never a candidate, never updated or merged, and both reach the reader through
search. This is the technique's mirror failure: the pool is partitioned by a field the read
path ignores.

## What is sound about it

The dedup's own delete is filtered by the same session
(`MemoryCore/src/core/record/l1-writer.ts:281 "const deleteFilter = teamId || userId || agentId || sessionId"`).
That guard is right: the model's target list came from a session-scoped pool, so a
hallucinated id outside the session cannot delete anything. The defect is using the guard's
key as the pool's key. And recall prints each memory's activity time
(`MemoryCore/src/core/hooks/auto-recall.ts:410 "- [type|scene] content (活动时间: ...)"`), so a
reader handed both values is given what it needs to choose the newer one. The miss is
served-stale first; whether it is answered-stale depends on that reader.

## The experiment

No model call. The scenario is the simulated year a fleet memory ladder replays (176 facts,
3,571 events, 73 state changes: 70 supersessions, 3 expiries). For each change, the check
asks whether any earlier statement of the old value shares the partition key of the
statement that changes it. Arm A partitions like this tree (project and day, a working
session); arm B partitions by the read scope. Same scenario, same changes, one variable.

| candidate pool partitioned by | changes reached |
| --- | --- |
| project + day (arm A, this tree's shape) | 0/73 |
| project + week | 3/73 |
| the read scope (arm B) | 73/73 |
| one conversation for the year (the ladder as it runs) | 73/73 |

Target: changes the reconciliation can see, 0 to 73. Floor: changes reached inside one
session, which B contains by construction, so nothing reachable under A is lost. 51 of the 73
old values were last stated more than thirty days before they changed. Two controls hold:
every change has an earlier statement of its old fact, and the read-scope arm reaches all of
them. The same numbers came out of two layers, the saved scenario files and a world
regenerated from its seed.

The structural fact is in the ladder, not in this tree: every arm there ingests the year as a
single conversation, so this design would have been priced with arm B's reach. The check now
ships beside the ladder's other instruments with that sentence in its findings.

## What this cannot say

Reach is not accuracy. Every reversal and expired probe in the scenario (92) rests on a change
arm A never reaches, but a reader shown both dated values may still answer them right. Settling
that needs this tree's design as a ladder arm with a session boundary in the scenario.
