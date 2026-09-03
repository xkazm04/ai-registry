---
layer: application
type: application
subject: procedural-level-planning
technique: gate-and-key-solvability-proof
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# A gated graph whose linter walks every edge as if it were open

Read against the Path of Fire tooling repo (`C:\Users\kazda\kiro\pof`) at commit
`9aa31407`. The tree has three separate places where a gate is *declared* and no place
where one is *resolved*, which makes it a clean specimen of the failure this technique
exists to prevent: the data model is ready for the proof and the proof was never written,
so every consumer silently treats a locked world as an open one.

## The gate exists in the type and nowhere else

`src/types/level-design.ts:36-44` defines `RoomConnection` with `bidirectional: boolean`
and — the interesting field — `condition: string` (`:43`), documented as
*"Condition for unlock (e.g. \"defeat boss\", \"collect key\")"*. It is free text. No
parser, no vocabulary, no key entity to satisfy it.

The consequence is visible one file over. `src/lib/level-design/pacing-linter.ts`
builds its traversal graph in `buildAdjacency()` (`:104-115`), which reads `fromId`,
`toId` and `bidirectional` and nothing else; `grep -n condition` over that file returns
zero hits. `lintUnreachable()` (`:263-...`) then runs a multi-seed BFS over that adjacency
and reports rooms it cannot reach as `critical` findings. A level whose only route to the
objective passes through a connection carrying `condition: "collect key"` — with the key
placed behind that same connection — is walked as if the door were open, reaches every
room, and lints clean. This is exactly the false pass the closure is for: the graph the
linter proves things about is not the graph the player walks.

The zone scale repeats it with a boolean instead of a string.
`src/components/modules/core-engine/sub_world/_shared/data.ts:97-106` declares
`ZoneEdge` with both `locked: boolean` (`:101`) and `criticalPath: boolean` (`:102`), and
`ZONE_EDGES` (`:108`) is roughly two dozen hand-written rows setting them. The one
traversal that consumes those edges, `computeCumulativePath()` (`:527`), opens with
`ZONE_EDGES.filter(e => mode === 'critical' ? e.criticalPath : true)` — it filters on
`criticalPath` and never mentions `locked`. Cumulative playtime along "all reachable
paths" is therefore computed across locked doors.

The generator closes the loop by writing the field as decoration:
`src/lib/world/zone-graph-generator.ts:109` emits `status: i === 0 ? 'active' : 'locked'`
for every zone it produces — a display colour, assigned by index, with no key, no
prerequisite and no ordering behind it. `lintZone()` in `src/lib/world/zone-analysis.ts`
(`:71`) never reads `status`.

## The closure machinery is already in the repo, pointed at other graphs

The repo does not lack the algorithm; it lacks the wiring.
`src/lib/catalog/acceptance/graphCheckers.ts:10` exports `graphValid(field, label)`,
whose body is a competent structural reachability check: it rejects a dangling edge naming
a missing node (`fail`, with the offending edge in the reason string), runs a DFS from
`nodes[0]`, reports every unreached node by id, and returns `pending` — not `pass` — when
the graph is empty or has no terminal node. That `pending` is
[unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) implemented
correctly, in the right place, one level of abstraction away from where this subject needs
it. It is applied to dialog trees and codex cross-references
(`src/lib/catalog/pipelines/dialog-trees.ts:194`, `codex.ts:229`) and to no room or zone
graph anywhere in the tree.

There is one genuine unwinnability detector, and it is in the wrong domain:
`src/lib/state-machine-validator.ts` carries a `'soft-lock-deadend'` warning kind (`:5`),
detected at `:108-125` by asking whether a state can be entered but not returned from. The
concept the technique needs — *a place you can get into and not out of* — is understood by
this codebase; it is implemented for animation state machines.

## What the tree taught the standard

Two things went upward from this reconcile.

The first is that **a gate declared as free text is worse than no gate at all**. A boolean
`locked` is at least machine-readable and can be caught by a check that greps for
unconsulted fields; `condition: string` looks authored, reads well in a design tool, and is
structurally invisible. The rule the standard now carries — that soft gates enter the
closure with the thing that satisfies them as their key — is the same requirement seen from
the type system: a gate whose satisfier cannot be named as data cannot be ordered, and a
gate that cannot be ordered cannot be proven.

The second is that **construction-time correctness rots even in a tree with no keys at
all**. `src/lib/level-design/procgen-preview.ts:76` flood-fills passable cells into
connected regions and reports `regions` as a first-class preview statistic (`:44-45`), so
the tooling knows perfectly well when a generated grid is in several disconnected pieces.
`planSpawns()` in
`src/components/modules/content/level-design/ProceduralLevelWizard/spawnPlacement.ts:143`
then places the player at `(1,1)`, the boss at the far corner and the loot at the centre
(`ANCHORS`, `:121`), each snapped by `nearestFloorCell()` (`:83`) to the closest walkable
cell — and never asks whether the boss cell is in the same region as the player cell. The
placement is locally valid, the preview already holds the number that would falsify it, and
nothing joins them. That is the mutation case the technique names: a pass that was correct
about its own concern invalidates a reachability property nobody re-checked.

## Where it falls short

Everything above is deviation, and the standard does not move to meet it. There is no
`Key`, `Lock` or `Gate` type; no `requires` or `unlockedBy` field on any room or zone edge;
no reachability-with-inventory closure; no key-level ordering; no cycle detection over
gates; and no unwinnable verdict for a level or a world. `src/lib/level-design/procgen-spec.ts:31`
declares `ProcgenConstraints` including `secretRooms` and `safeZones` (`:35-36`) that no
generator consumes — and, to the tree's credit, `specFieldsIgnoredBy()` (`:110`) exists
precisely to report such discards, which is the honest half of this codebase working as
designed.

The smallest change that would make this subject real here is not a new subsystem. It is to
give `RoomConnection.condition` a typed shape, teach `buildAdjacency()` to take a held-key
set, and run `graphValid`'s closure to a fixed point over the gated graph — reporting the
residual closed gates as one finding rather than guessing which is guilty.
