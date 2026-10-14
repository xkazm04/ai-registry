---
layer: application
type: application
subject: agent-memory
technique: decay-and-forgetting
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22.16
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A skill library with a retirement method and no retirement (TencentDB Agent Memory)

Source tree: `github:TencentCloud/TencentDB-Agent-Memory@37b16296` (2026-10-14). Its core
extracts reusable procedures ("skills") from agent conversations into a versioned library
that agents load on demand. The stack version is the floor the core package declares
(`"node": ">=22.16.0"`). Nothing was executed; every claim is a traced path.

## Three implementations, one contract test, no caller

The skill store interface declares a soft retirement
(`MemoryCore/src/core/skill/skill-store.interface.ts:120 "archiveHead(skillId: string, teamId?: string): Promise<{ archived: boolean }>;"`),
and all three backends implement it
(`MemoryCore/src/core/store/sqlite/skill-store.ts:375 "async archiveHead(skillId: string, teamId?: string): Promise<{ archived: boolean }> {"`,
`MemoryCore/src/core/store/mongodb/skill-store.ts:237 "async archiveHead(skillId: string, teamId?: string): Promise<{ archived: boolean }> {"`,
`MemoryCore/src/core/store/tcvdb/skill-store.ts:335 "async archiveHead(skillId: string, teamId?: string): Promise<{ archived: boolean }> {"`).
Its only call in the tree is the shared contract suite
(`MemoryCore/src/core/skill/__contract__/skill-store.contract.ts:172 "const res = await store.archiveHead("`).
The suite is green on a governor nothing invokes, which is this technique's "no callers,
green tests" shape for the third time in this corpus.

## The two exits that do exist

- **The extractor cannot retire.** Its tool roster omits delete on purpose
  (`MemoryCore/src/core/skill/skill-tools.ts:12 "不暴露 delete / files_remove"`), while the
  reviewer's own prompt tells it otherwise
  (`MemoryCore/src/core/skill/prompts/skill-review-prompt.ts:117 "You can always patch or delete later."`).
  A procedure superseded by a better one is patched, or a second skill is created beside it.
- **The only removal is manual and total.** The core's header still describes a soft delete
  (`MemoryCore/src/core/skill/skill-core.ts:14 "delete        head status=archived"`); the
  code below it was changed to a physical one
  (`MemoryCore/src/core/skill/skill-core.ts:378 "物理真删除（2026-07 变更，原为软删）"`), which
  removes every version. A wrong skill can be destroyed but never superseded with its lineage
  kept.

Version churn is governed well: an unchanged rewrite returns the head without writing
(`MemoryCore/src/core/skill/skill-versioning.ts:228 "return head; // 幂等"`), and old non-head
versions are pruned. What is ungoverned is the head itself. Every skill the library ever
learned stays live and loadable until a person deletes it outright.

## Why this tier matters most

The same product's proxy selects one skill per turn from this library and loads it into the
agent's context, and the legacy path injects the whole catalog into the system prompt. That is
the always-on lane this technique warns about: the tier with the most standing is the one
with no supersedence. A superseded procedure keeps competing for selection with the procedure
that replaced it.

## What would measure it

`unmeasurable` here, and the instrument is named: replay a history in which a procedure is
taught and later corrected, then count skill heads still loadable for the old procedure and
how often per-turn selection picks one. The fleet's memory ladder already has the procedural
probes for this; the tree would need an adapter that drives its skill extraction.
