---
layer: technique
type: technique
subject: canvas-graph
technique: graph-layout
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [deciding whether auto-layout may move a node, user-placed nodes shift after a reload, choosing between layered and force-directed, one arrival re-seats the whole picture, a generated layout renders differently on the server and the client, a diagram re-lays itself when only the source order changed, labels overflow the boxes a layout engine placed]
---

# Graph layout

Layout answers two different questions that must never share one code path:
*where should nodes go when nobody has placed them* (an algorithm's job), and
*where did the user put them* (a datastore's job). The subject-level rule —
auto-layout is a suggestion, never a dictator — becomes concrete here as a
provenance bit, a persistence contract, and a placement policy.

## Provenance: user-authored beats generated

Every stored position carries (explicitly, or implicitly by which store it
lives in) whether it was **user-authored** or **generated**. The rules fall
out of the bit:

- An auto-layout pass may move generated positions freely; it touches
  user-authored positions only on an explicit "re-layout" command — and even
  then, that command is one undoable transaction, because it is about to
  destroy spatial memory the user built.
- Better still, user-authored positions participate in the algorithm as
  **fixed anchors**: they exert forces (or occupy slots) but never move, so
  the generated layout arranges itself *around* the user's arrangement
  instead of ignoring it. When collisions must be resolved between an
  anchored node and a free one, the free one takes the whole correction;
  between two anchors, nothing moves — the user's explicit layout wins even
  over overlap. **Anchoring is native only to force layouts**, where a
  fixed node is simply a body that does not move. A layered engine
  recomputes every coordinate. Its interactive modes read existing positions
  as *ordering hints* for layers and crossing minimization, then place the
  nodes afresh, so a user-placed node cannot be pinned there. With a layered
  engine the rule becomes scoping: run it over unplaced nodes only (a new
  component, a staging region), or run it once as a proposal and let the
  placement policy below handle every later arrival. Never re-run it over a
  graph that holds user-authored positions.
- The moment the user drags a node, its position flips to user-authored and
  stays there.
- "Reset layout" is the deliberate, confirmed doorway back to all-generated —
  offered, not sprung.

A canvas that re-runs auto-layout on load "to tidy up" and thereby moves
user-placed nodes teaches users their arrangement is disposable; they stop
arranging, and the product loses the entire spatial-memory payoff the canvas
was chosen for.

## Choosing the algorithm

Pick by the graph's true shape, not by demo aesthetics:

- **Layered / tree ("tidy") layouts** for graphs with dominant direction —
  pipelines, hierarchies, dependency flows. They produce stable, readable,
  *deterministic* results: the same graph, *in the same order*, gives the
  same layout (see "Order is input" below). Determinism
  matters more than beauty, because a layout that shuffles on every run
  destroys spatial memory even for generated positions.
- **Force-directed layouts** for genuinely undirected, cluster-shaped graphs.
  They reveal clustering that layered layouts hide, at a price: they are
  iterative, and they can shuffle dramatically under small input changes.
  Repeatability between runs is a question of the random source, and
  engines differ. Some default to a fixed-seed generator and a deterministic
  initial placement, so repeated runs already agree. Others seed from the
  clock. Check which one yours does, and pin the seed where it is not fixed.
  No seed buys stability under a *changed* input, which is what users
  actually notice. Run forces to convergence *off the interaction path*, and
  treat the result as a one-time proposal to store — never as a live
  simulation the user's arrangement fights against.
- **Hybrids** (layered within clusters, coarse placement across them) when
  the graph has both a flow and communities.

In every case the algorithm's output enters the model through the same door
as a user drag — positions written to the store, provenance marked generated
— so that undo, persistence, and rendering see one kind of change. And a
generated layout is a stored derivation of the graph, so its recomputation
trigger is named
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
on explicit request, or on arrival of unplaced nodes — never "whenever the
graph re-renders".

## What the layout function reads decides what an arrival costs

Determinism says identical input produces identical output. It says nothing
about what counts as input, and that is the decision an incremental graph
lives or dies by. Most generated layouts are written against the collection:
a slot index and a total — the i-th of n positions in a spiral, a column, a
ring. Both of those are properties of the *set*, not of the node, and the
consequence is immediate and usually discovered in production: **anything
that changes the set re-places every member of it.** One repository finishing
a scan, one row arriving on a live feed, and the whole picture re-seats
itself under the user's eyes mid-animation. Nothing is wrong with any single
placement; the parameterization is the defect.

There are two honest resolutions, and a canvas usually wants both:

- **Derive the slot from node identity**, not from ordinal position — a
  stable hash into the available space. Arrivals and departures then move
  nobody, at the cost of a less even distribution and the need to resolve
  collisions.
- **Give arrivals their own placement rule, parameterized on nothing the
  existing nodes share.** A newcomer lands in a region reserved for
  newcomers — an outer ring, a staging lane, a margin — placed by its own
  identity alone, so landing it cannot shift a single existing position. This
  also reads correctly: the arrival looks like an arrival.

The second is a *deferral*, not a cure, and it must be named as one wherever
it is used: the re-flow still happens at the next authoritative reload, all
at once. That trade is usually right — one re-seat at a natural boundary
beats a re-seat per arrival — but a comment claiming arrivals never disturb
the layout, over code that only postpones it, is the kind of half-truth the
next maintainer builds on.

The same reasoning settles a question that looks like a rendering one:
**filtering is a render state, never a layout input.** If the generated
layout reads the filtered collection, every filter keystroke re-places every
surviving node, and the user's spatial map is destroyed by the act of
searching it. Non-matching nodes therefore *dim, and stay where they are*;
the matches light up against a faded field, the shape of the graph is
preserved, and the user can see where in the picture the answer lives — which
is the whole reason they are looking at a picture. The same holds for any
subset-drawing decision, including a cap on how many nodes are drawn: what is
drawn may change, where a node sits may not.

## Determinism has two axes

Layout determinism is usually stated as *across runs*: the same graph in,
the same layout out, so spatial memory survives a reload. Where the same
layout is computed in more than one runtime — rendered once on a server and
again in a browser, shared between a native client and a web one, or
recomputed by a test harness — there is a second axis, and it fails for a
reason no amount of seeding addresses.

Transcendental functions are not required to be bit-identical between
implementations. Two engines computing the same sine of the same angle may
differ in the last unit in the last place, which is invisible in geometry and
catastrophic in *string comparison*: a renderer that serializes a coordinate
at full precision emits two different attribute values for one position, and
the markup no longer matches itself. What was a layout concern surfaces as a
hydration failure in a component that has no idea it is doing geometry.

**Quantize placed coordinates before they are rendered**, to a precision far
finer than anything the surface can show and far coarser than the noise:
rounding to a fixed number of decimals makes the two engines agree by
construction. Choose the quantum against the drawn size — a fraction of a
pixel at the largest rendering — and state that reasoning where the rounding
happens, because a bare rounding call looks like sloppiness and invites removal.

## What an engine-driven layout reads besides the graph

Once layout is handed to an engine — a layered library laying out a
diagram, most often behind a read-only renderer — the output is a function
of more than the topology. Three of its inputs are easy to leave out of the
definition of "same graph in", and each one fails without an error.

**Sizes.** The engine places boxes of whatever width and height it is given,
and it does not measure text itself. So node and label sizes are measured
before layout, with the face that will render them. Measure, lay out and
draw must share one font string and one line height, or labels overflow
boxes that were sized correctly for a different font. A web font that has
not loaded yet measures as its fallback. If a layout runs in a mount
effect, it sizes every box for the wrong face, and nothing triggers a
re-layout when the real face arrives. So either wait for the face to load
(and re-lay out when it does), or measure with a face that is always
present. A runtime with no text metrics at all — a server pass, a test
harness — falls back to estimates, and **a layout computed on estimates is a
different layout**, not an approximation of the browser's. Tests on that
path may assert structure: containment, absolute coordinates, counts. A
test that asserts a coordinate pins a picture no user will ever see.
Localized labels are measured input too. Keeping the topology identical
across locales does not keep the layout identical.

**Order.** Layered engines break ties in the order nodes and edges were
declared, and some deliberately keep that order where it costs no extra
crossings. Reordering alone, with the graph unchanged, re-places most of the
picture. Run-to-run determinism and order sensitivity are separate
properties, and one engine can be fully repeatable across runs while
re-placing most boxes when only the declaration order changes. Where
the source is hand-authored, order is intent and stays put. Where a diagram
is *emitted* — from a set, a map's iteration order, or a query without an
explicit order — sort the input canonically, by durable identity, before it
reaches the engine. The generated-layout rule above covers what the layout
function reads, and this is the same rule applied to the order in which it
reads it.

**Where it runs, and for how long.** Engine layout is super-linear in nodes
and edges. A library that runs synchronously on the main thread by default
(worker execution is opt-in) will freeze the tab on a large enough graph.
There are two honest resolutions: move it to a worker, or declare a size
ceiling and check it *before* the call, as a cheap walk during render that
leads to an explicit "too large to lay out" state. A guard placed after the
call comes too late. The count must walk nested groups, because a graph with
one root can still hold every node the ceiling exists to refuse.

**The result is async, so it is keyed.** Engine layout returns later than
the render that asked for it. Store the result together with the input that
produced it, and render it only while that input is still current. Cancel
the in-flight request on change as well. The key makes a superseded layout
impossible to *show*. Cancellation alone only makes a late layout less
likely to *land*.

## Placement policy for new nodes

A node created without a position must land:

- **near its topological neighbors** if it has any (beside the node it was
  spawned from, downstream of the node it connects to);
- **inside the visible viewport** otherwise — the user must see what they
  just made without hunting for it;
- **not on top of an existing node** — probe outward (spiral or ring) from
  the candidate point until clear space is found.

The origin is the worst possible default: every unplaced node stacks at the
same point, and the stack is usually offscreen. The placement policy is the
canvas's cursor — the small piece of intelligence that makes creation feel
located instead of lost.

## Persistence: layout is a document

Positions persist keyed by **durable node identity**
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) — never
array order, never display label. The persisted artifact is a small document
with a lifecycle, inheriting the full discipline of
[persistence-and-migration](../../../../client-architecture/client-state/techniques/persistence-and-migration.md):

- **Versioned.** Node default sizes change, anchor conventions change,
  coordinate origins change; a version field is what lets a reader know
  which convention a stored layout speaks.
- **Migrated or explicitly degraded.** A layout from an old version either
  migrates cleanly or falls back to generated layout *with the fallback
  visible* — silently mis-scaled restoration (every node 40 units off
  because the default size changed) is worse than an honest re-layout.
- **Reconciled against the live graph on load.** Stored positions for nodes
  that no longer exist are dropped; live nodes with no stored position go
  through the placement policy. A layout store is an index over the graph,
  and an index is reconciled, not trusted.
- **Written per completed gesture**, not per pointer event — the drag's
  commit point is the persistence point.

The viewport (pan, zoom) may persist too — restoring the user's last framing
is a courtesy — but it is a preference, not part of the layout document, and
losing it must cost nothing.

## Shared geometry: one function for nodes and edges

Wherever layout computes node placement, edge anchoring must read the *same*
geometry — the same size constants, the same port offsets, the same bounds
function. The moment layout owns one copy of "how big is a node" and edge
rendering owns another, the two drift on the first size change and every
edge floats slightly off its node. This is the layout-side half of the rule
stated in edge-management; it belongs to both because the drift is created
here and observed there.
