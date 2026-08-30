---
layer: application
type: application
subject: civic-knowledge-graphs
technique: destructive-rebuild-guard
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: the `--reset` guard on a shared civic graph store

How a TypeScript/Node civic-graph project (Czech parliamentary accountability
app *politicas*, PGlite store) realizes the destructive-rebuild guard — plus
the shared-writer plumbing around it, because the guard's refusal message only
works if the non-destructive path it recommends is actually safe.

## The guard: `guardKgReset` in `lib/analysis/kg.ts:419-551`

The deterministic recompute script (`da:kg-compute`) rebuilds 3 node kinds and
3 edge relations; the live store holds 10 kinds and 17+ relations accreted by
case-loop passes. Its `--reset` flag calls `clearKg()`, which deletes *every*
`kg_node`/`kg_edge` (archiving to history tables — a record, not a restore).
On today's store that wipes ~154,000 nodes / ~178,000 edges and writes ~1,000
back — and `docs/data-analysis/frontier.md` F5 prescribed exactly that command
as routine maintenance until 2026-08-13. Textbook incident shape: the flag was
correct when the writer's output was the whole graph.

`guardKgReset(input)` (kg.ts:477) computes the verdict **from the store, never
a hardcoded list**: inputs are `store.kgKindCounts()` and
`store.countKgEdgesByRel()` (what the store holds) against the run's
`rebuiltNodeIds/Kinds/EdgeRels` (what it emits). A kind a future pass
introduces is protected the day it lands. Three findings, kept separate
(kg.ts:465-471):

- `droppedNodeKinds` / `droppedEdgeRels` — in the store, absent from this
  run's output, each with row counts, sorted by count desc.
- `orphanedNodeIds` — a rebuilt kind but an id not re-emitted (a departed MP,
  an emptied committee), computed per-id via
  `storedNodeIdsOfRebuiltKinds.filter(id => !rebuiltIds.has(id))` (kg.ts:494).
- Scope stated, not implied (kg.ts:473-476): edges judged by rel only, because
  the run regenerates its own rels wholesale and a per-edge comparison "would
  cost a 20 000-row read to protect nothing".

Refusal message (kg.ts:546-549) does the teaching: totals, named kinds/rels
with counts, sample orphan ids, and the safe alternative — "Recomputing does
NOT need a wipe — the upsert replaces each claim in place and read-merges the
props." Override is an explicit `--supersede` flag; the override path still
prints the full accounting and marks the verdict "OVERRIDDEN" (kg.ts:528-537).

## The plumbing that makes "no wipe needed" true

Both helpers live beside the guard because the guard's advice depends on them:

- `mergeComputedNodeProps` (kg.ts:412-417) — the read-merge contract
  `{...existing, ...computed}`, named once because the storage layer's upsert
  does `props = excluded.props` (wholesale replace,
  `lib/db/pglite/repositories/kg.ts`), and the inline retype of the merge rule
  was wrong in five sibling scripts. The docblock discloses the honest limit
  (kg.ts:404-410): a conditionally-computed prop survives stale when its
  condition lapses — tracked as F24, not papered over.
- `nextPass` (kg.ts:387-389) — default pass numbering as a `reduce`, not
  `Math.max(...rows.map(...))`: the spread pushes one argument per row and the
  ~153,700-row store overflows the call stack, so every writer using the
  spread form died on its own documented default invocation and worked only
  with explicit `--pass=N`. Fixed in one script 2026-08-04; six siblings
  carried the same line until it became this helper on 2026-08-13 — the
  one-definition law enforced the hard way.

## Transplant notes

Port the *inputs contract*, not the code: two cheap aggregate store queries
(kind→count, rel→count) plus the id list of rebuilt kinds are all the guard
needs, so it stays O(store summary), not O(store). Keep the verdict a pure
function returning `{allowed, dropped…, orphaned…, message}` — politicas
unit-tests it on fixture stores without a database, which is what let the
refusal message's arithmetic be pinned exactly.
