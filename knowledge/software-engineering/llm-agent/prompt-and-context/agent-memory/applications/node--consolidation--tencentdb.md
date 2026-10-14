---
layer: application
type: application
subject: agent-memory
technique: consolidation
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22.16
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Replace by delete, fail toward store, and a merge that raises authority (TencentDB Agent Memory)

Source tree: `github:TencentCloud/TencentDB-Agent-Memory@37b16296` (2026-10-14). The core
judges each batch of newly extracted memories against recalled candidates in one model call
that returns store, skip, update or merge per memory. The stack version is the floor the core
package declares (`"node": ">=22.16.0"`). Nothing was executed; every claim is a traced path.

## Supersede, don't replace: replaced, with a log that is later cleaned

An update or merge deletes its targets from the search store and writes the result as a new
row (`MemoryCore/src/core/record/l1-writer.ts:10 "On update/merge, old records are deleted from VectorStore in real-time;"`).
An append-only log keeps the old lines, but only until a periodic cleaner reconciles it
against the search store
(`MemoryCore/src/core/record/l1-writer.ts:11 "JSONL is append-only and cleaned up periodically by memory-cleaner."`).
Recall cannot see lineage at any point, and audit can see it only until the cleaner runs. The
order also matters: the targets are deleted at line 281 and the replacement is upserted after
`MemoryCore/src/core/record/l1-writer.ts:312 "=== Vector Store dual-write ==="`, inside its own
catch. A failed upsert leaves neither the old row nor the new one in recall.

## The distiller's targets are trusted, and fenced only by the session

Target ids from the model are accepted as strings without checking that they were among the
candidates shown
(`MemoryCore/src/core/record/l1-dedup.ts:386 "target_ids: Array.isArray(d.target_ids) ? d.target_ids.map(String) : [],"`).
The technique asks that a supersede target be validated as a live item of the right kind and
scope. Here the delete filter does part of that: it is scoped to the tenant and the session,
so a hallucinated id outside the session deletes nothing. Inside the session, any id the model
names is deleted.

## Degraded, but silent

Every failure on this path stores everything: no recall capability
(`MemoryCore/src/core/record/l1-dedup.ts:104 "skipping conflict detection for"`), a failed
or unparseable judgment
(`MemoryCore/src/core/record/l1-dedup.ts:192 "Batch conflict detection failed, defaulting all to store:"`).
That is the right direction, since a duplicate is recoverable and a lost fact is not. But the
only trace is a warning in a log. The technique's prefilter rule is that the degraded answer
is clearly marked as degraded; here a degraded write is indistinguishable from a judged one in
the store.

## A merge raises priority

The conflict prompt tells the judge that a merged memory is more complete and more certain,
so its priority should usually go up
(`MemoryCore/src/core/prompts/l1-dedup.ts:69 "通常应**酌情提升** priority"`). Priority orders
recall and, at the persona tier, decides what survives a 2,000-character cap. A fact that is
restated often is merged often and climbs, whether or not anyone independent said it. The
technique's reinforcement rule names this: what strengthens is independent authorship, not
episode count. A second memory tree read the same week ratchets importance the same way
through its merge path, recorded there as a feature.

## What would measure it

`unmeasurable` without a run. Two instruments would settle the two halves: a fault injected
between the delete and the upsert, counting facts absent from recall afterwards; and this
judge as an arm on the fleet's memory ladder, whose write-time verdict arm (0.78) is the
nearest shape, with a probe class that counts merges per fact against its priority.
