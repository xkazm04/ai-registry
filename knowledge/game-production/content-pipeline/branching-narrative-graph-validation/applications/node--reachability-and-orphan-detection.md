---
layer: application
type: application
subject: branching-narrative-graph-validation
technique: reachability-and-orphan-detection
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# A thirty-line reachability checker behind three narrative pipelines

A catalog-pipeline application that grades authored dialogue trees, quest objective graphs
and behaviour state machines through one shared checker. Citations resolved against commit
`9aa31407` of the consuming tree; the checker is `src/lib/catalog/acceptance/graphCheckers.ts`,
thirty lines long, and it is the entire graph-validation surface of the product.

## What the checker does

`graphValid(field, label)` at `graphCheckers.ts:10-29` is a closure returning a `Checker`
that reads a `{ nodes, edges }` payload out of a produced artifact and grades it at tier
`L0`. It runs four passes in order:

- **Empty guard** (line 15): no nodes returns `pending` with the reason `field "<f>" has no
  nodes — produce a node/edge graph`. This is the instrument-before-result rule realized in
  one line, and it is the difference between an honest "not measured" and a vacuous pass
  over an empty payload.
- **Dangling edges** (lines 16-18): every `from` and `to` must be in the node id set, or
  `fail` with the offending edge named — `edge ${bad.from}→${bad.to} references a missing
  node`. This is the exact defect the graph's own generator elsewhere in the tree calls out
  by name (below).
- **Forward reachability** (lines 19-26): an adjacency map is built from the edges, then an
  explicit stack-based depth-first walk marks everything reachable, and any unmarked node
  is a `fail` listing the unreachable ids. Direct realization of the forward walk.
- **Terminal existence** (line 27): if no node carries `terminal: true`, `pending` with
  `mark at least one node terminal`.

The pass result at line 28 carries its counts — `${nodes.length} nodes · ${edges.length}
edges · reachable` — which is what lets a reader tell a real pass from a walk that had
nothing to walk.

Three pipelines bind it. `src/lib/catalog/pipelines/dialog-trees.ts:194` grades the Branch
Graph step with `graphValid('graph', 'Dialog branches reachable + have terminals')` over an
eleven-node conversation with three declared terminals (`dismissed`, `hostile`,
`ember_pact_unlocked`, at lines 125-140). `src/lib/catalog/pipelines/quests.ts:103` grades an
Objective Graph with two success terminals and a failure terminal. A behaviour state machine
uses the same checker for a third, non-narrative graph.

## What it confirms

**Terminals are declared, not inferred.** `terminal: true` is an author-set boolean on the
node (`dialog-trees.ts:129, 134, 139`), and the checker never guesses from out-degree. That
is the technique's central rule, arrived at independently.

**The behavioural rung is kept separate and named.** `dialog-trees.ts:592` defers branch
integrity to a runtime gate — `entityRuntimeDeferred('PoF.DialogTrees.BranchIntegrity',
'All branches reachable + skill-check gates resolve in PIE')` — rather than letting the
static pass stand in for play. The structural checker grades `L0` and says so.

**The dangling-pointer incident is on the record.** The one genuinely dynamic generator in
the tree, `src/lib/quest-generator.ts`, carries the lesson in a comment at lines 404-406:
the "Tell me more" option "MUST resolve to a node that exists, or every generated quest
ships a dangling dialogue pointer that dead-ends/crashes any walker." Its fix (lines
413-421) is to author a real information node that offers the same accept and decline
branches, which is the unconditional-exit defence reached from the other direction.

## Where it falls short of the standard

Four deviations, recorded because the standard does not move.

**The entry set is `nodes[0]`.** Line 21 takes the start of the walk from array order. It is
not a declaration, nothing validates it, and a `produce()` that reorders its node literal —
an edit that looks purely cosmetic — silently re-roots the reachability walk and can turn a
green graph red or, worse, red green. The standard requires a declared entry set, and it
requires more than one entry wherever a conversation can be re-entered.

**There is no backward walk.** Neither co-reachability nor ending attainability is computed.
A node that is forward-reachable but from which no terminal can be reached passes this
checker cleanly, and that is the worst category in the family: the player can be put
somewhere the story cannot end.

**An undeclared terminal is invisible.** Line 27 asks only whether *some* node is terminal.
A node with no outgoing edges and no `terminal: true` — the accidental dead end left behind
by a re-parenting — is neither reported nor distinguishable from a deliberate one. The set
difference the technique specifies is not computed in either direction.

**Guards are prose.** Conditions live in edge `label` strings such as `'condition:
Intelligence ≥ 14'` (`dialog-trees.ts:157-158`) rather than in a machine-readable
expression. Nothing can evaluate them, so the guarded dead end — the class that produces
actual shipped softlocks — is undetectable by construction, and the conservative
edge-reachability pass has nothing to read.

The related gap outside this technique is worth naming for whoever picks it up: the
implicit-terminal convention in the generator, where a `[Leave]` option sets `nextNodeId:
null` (`quest-generator.ts:393, 401`), declares an ending by absence of a pointer — exactly
the inference the technique rules out, in the one place in the tree where graphs are
produced at runtime rather than hand-authored.

## The shape of the remaining work

Every deviation above is cheap. A declared `entries` array and a second reversed walk are
perhaps fifteen lines added to a thirty-line file; the undeclared-terminal set difference is
three. What is not cheap is guard evaluation, because it requires the condition to stop
being a label — and that is a change to the produced payload's schema across three
pipelines, not a change to the checker.
