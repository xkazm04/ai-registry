---
layer: application
type: application
subject: canvas-graph
technique: graph-layout
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19.3
---

# kp's PlantUML renderer: a generated diagram whose layout input is sizes, order and a ceiling

kp draws its architecture and pipeline diagrams from PlantUML source with its
own renderer. Everything lives in `app/_components/puml/`: a parser, a
measure step, and `layout.ts`, which hands the parsed graph to elkjs (0.12,
layered, top-down, orthogonal) and asks it only for coordinates. The SVG is
drawn by `PlantUml.tsx`. Nobody can drag a node and nothing is persisted, so
this is the renderer stage of the subject. Three decisions that the graph-layout
technique used to treat as incidental are layout input here, and the tree
settles each of them on purpose.

## The engine is only as right as the sizes it is given

A layered engine places boxes of the width and height you hand it, so text
has to be measured before layout. `measure.ts` measures with a shared canvas
2d context and `measureText` (`:15-21`). `constants.ts` exists for one
reason, stated in its header (`:1-5`): measure, layout and render must share
one font string and one line height, or "labels would silently overflow their
boxes with no error". `FONT_FAMILY` (`:15`) is a system stack, while the rest
of the app loads a webfont through `next/font`. That sidesteps the
font-readiness race. A face that has not loaded yet measures as its fallback,
and a layout run in a mount effect would size every box for the wrong face,
with nothing to trigger a re-layout when the real one arrives.

The no-DOM branch is the second-engine case. With no `document`, `measure()`
falls back to `text.length * 6.7` (`measure.ts:19`), a per-character guess
that `measure.test.ts:14-30` pins as deterministic and font-blind. The
layout tests (`layout.test.ts:72-123`) run under the repo's bare node runner,
so they exercise the pipeline on the fallback metric and never on the one
production uses. They assert only structural properties: children inside
their container, absolute edge points, the ceiling. That is the correct
scope for a harness on a different metric. A test that asserted a coordinate
would pin a layout that no browser ever draws.

`simDiagrams.ts:9-14` shows how far "same graph" reaches. The seven
localized phase diagrams keep every node id and edge constant across
locales, "so the parser sees an identical graph in every locale and only the
drawn words change". The topology is identical. The layout is not, because
the drawn words are measured widths, and widths are layout input.

## Order is input: an experiment over the tree's own diagrams

The technique used to say "same graph in, same layout out". For a layered
engine, "same graph" includes the order in which nodes and edges are
declared. Run on 2026-09-26 over the 15 committed diagrams in
`docs/diagrams/`, through the tree's own `parsePuml` and `layoutDiagram`
(harness outside the tree, product code unchanged):

| Arm | Diagrams where any box moved | Boxes moved (nodes and containers) |
| --- | --- | --- |
| Same input, laid out twice | 0 / 15 | 0 of 198 |
| Edge list reversed, same declarations | 7 / 15 (of the 11 with two or more edges) | 93 of 198 |
| Declarations reversed (recursively), same edges | 14 / 15 | 164 of 198 |

Across runs the engine is fully deterministic. Across orderings it is not:
reversing declarations re-placed every node in most diagrams. Here that is
harmless, because every source is hand-written or a fixed template string, so
declaration order is authored intent and stays stable between renders. A
diagram emitted from a set, a map's iteration order or an unordered query
would inherit that instability, with no change to the graph at all.

## A synchronous engine gets a ceiling, checked before the call

`layoutDiagram` loads `elkjs/lib/elk.bundled.js` with a dynamic import
(`layout.ts:140`), so ELK never runs during SSR. The bundled build runs on the
main thread. The file says what that costs (`:116-122`): layered layout is
super-linear, so above `MAX_DIAGRAM_NODES = 150` or `MAX_DIAGRAM_EDGES =
300` the renderer refuses and shows a "too large" message instead of
freezing the tab. `isDiagramTooLarge` (`:135-137`) is a pure tree walk that
runs *during render* (`PlantUml.tsx:454`), before layout is attempted. A
guard placed after the call would come too late. The node count walks into
containers, and `layout.test.ts:40-70` pins it with a 150-leaf diagram nested
two packages deep that has only one root. A worker is the other resolution,
and the tree's diagrams do not need one yet. The ceiling makes that a stated
bound rather than an assumption.

## The async result is keyed to the input that produced it

Parsing is derived during render. Only the ELK call is an effect
(`PlantUml.tsx:461-479`), and its result is stored together with the parsed
diagram object it was computed from (`key: diagram`, `:466`). The render
reads the layout only when `result.key === diagram` (`:481-482`), and the
effect's cleanup sets `cancelled` (`:477`). Together they close both ways a
superseded layout could reach the screen. A slow layout for the old source
cannot land after the new one, and the first render after a source change
cannot show the previous picture while the new layout is still in flight.
The comment states the design choice: key the result rather than clear it
with a setState in the effect body (`:444-447`).

## Coordinates are parent-relative, and the walk is tested for it

ELK returns child coordinates relative to their parent. `walk()`
(`layout.ts:202-251`) accumulates each container's origin into node boxes,
container boxes and edge points. Edges are placed in the lowest common
ancestor of their endpoints (`:143-174`), which keeps a container's internal
edges from inflating unrelated containers under `INCLUDE_CHILDREN`. So the
same accumulation has to apply to edges at every depth. The routed polyline
is drawn exactly as ELK returns it. The edge-management application for this
tree measures what drawing a straight segment instead would cost.
