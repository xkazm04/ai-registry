---
layer: application
type: application
subject: canvas-graph
technique: edge-management
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19.3
---

# kp's PlantUML renderer: the layout engine's routes are the edge geometry

kp's diagram renderer (`app/_components/puml/`) lays out PlantUML source
with elkjs and draws the result as SVG. Its edges follow the
generated-diagram rule in the edge-management technique. The engine that
placed the nodes also routed the edges, so the edges are drawn along those
routes, and the renderer computes no edge geometry of its own.

## Routing is part of layout here

`ROOT_OPTIONS` (`layout.ts:87-99`) asks ELK for `ORTHOGONAL` edge routing
and gives it edge-node and edge-edge spacing. Each edge label is measured
with the same font the renderer draws it in and handed to the engine as a
sized label (`:167-169`), so ELK reserves the label's space between layers
and places the label itself. The renderer reads each edge's first section as
start point, bend points and end point (`:206-212`). It reads the label box
from the engine as well (`:213-223`) and does not pick its own point along
the path. Arrowheads are SVG markers with `orient="auto"` (`PlantUml.tsx`,
the `<defs>` block under the root `<svg>`), so they point along the final
routed segment.

## What a straight line would have cost, measured

For an editor, the technique calls obstacle-avoiding routing a last resort.
Routes flip as nodes move, and that reads as flicker. A generated diagram has
no drag, and its engine routes as part of placement. Run on 2026-09-26 over
the 15 committed diagrams in `docs/diagrams/`, through the tree's own
`parsePuml` and `layoutDiagram` (harness outside the tree, product code
unchanged), counting edges that pass through a leaf node that is neither of
their endpoints:

| Arm | Edges crossing a foreign node |
| --- | --- |
| Straight segment between the engine's two endpoints | 16 of 189 |
| The engine's routed polyline, as drawn | 0 of 189 |

The 16 fall in the two system-architecture diagrams (7 of 28 and 9 of 31
edges). Those are the only two dense enough for a straight segment to pass
through a node between layers. Every smaller diagram came out clean under
both arms. So recomputing a path from node geometry gives up exactly the
work the layered engine did, and does so on the biggest diagrams. The
endpoints used were the engine's own ports, already on the node boundaries.
A centre-facing anchor would not have done better, because the crossings are
mid-edge.

## One origin for nodes and edges

Edges are placed in the lowest common ancestor of their endpoints
(`layout.ts:143-174`). Their coordinates therefore come back relative to that
container, and `walk()` adds the same accumulated origin to edge points that
it adds to boxes (`:202-225`). `layout.test.ts:112-121` asserts that every
edge point is absolute, which is the edge half of the shared-geometry rule.
A bend point left relative to its container "would draw the arrow in the
wrong half of the canvas".
