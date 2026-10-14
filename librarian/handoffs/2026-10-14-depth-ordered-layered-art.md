---
spec: forge
status: EXECUTED
subject: depth-ordered-layered-art
bundle: game-production
category: asset-production/surface-and-imagery
source: https://github.com/wheresryan22/anatomy
source_commit: e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f
run_id: anatomy-1014
date: 2026-10-14
---

# Forge spec: depth-ordered-layered-art

**Why this is XL, argued.** Four design decisions from one tree (a toolkit that draws
dense isometric figures as stacked vector layers, with its own geometry audit and a
second line-end check) share one home the corpus lacks: how a layered, painter's-order
picture is proven correct instead of tuned until one screenshot looks right. The
mechanical trigger fired: three `design` candidates with `corpus: NONE` carry the same
home-if-new. Content searches (not the slug map) over `knowledge/` for the vocabulary
this subject needs, run in the unfiltered tree on 2026-10-14: `isometric` 1 document
(a still-frame text-split technique, unrelated), `painter` 15 documents (all the
palette sense, in sprite and atlas work), `depth-sort` 0, `z-order` 1 (a canvas graph
render budget), `separating plane` 0, `ray-cast` 1 (mesh finishing). The nearest
neighbours are `sprite-and-atlas-production` (owns the pixel grid, palette and atlas
packing of a finished sprite, not the order sprites are drawn in) and
`generated-mesh-acceptance` (owns structural acceptance of a mesh, including the
three-state `unmeasured-is-not-pass` contract, but not coverage of the record a check
runs on). A single author's two-week-old toolkit is thin evidence for a subject, so
this spec names the primaries that must corroborate it and marks which technique rests
on code only.

## Placement (verified against the authority, not a count)

`knowledge/game-production/taxonomy.json`: category `asset-production`, subcategory
`surface-and-imagery`, layout `nested`, holding 4 subjects (`shader-budget-authoring`,
`sprite-and-atlas-production`, `tiling-texture-acceptance`, `imported-material-conformance`)
before this entry and 5 after. `MAX_CHILD_DIRS` is 10 (`scripts/lib/taxonomy.mjs`), so
the category stays open. The director appends `depth-ordered-layered-art` to that
subcategory's `subjects` before dispatch. Subject folder:
`knowledge/game-production/asset-production/surface-and-imagery/depth-ordered-layered-art/`.
Read an existing sibling subject's relative links to the laws file and copy their depth.
Purity profile `game`: no engine, DCC, vector-format-vendor, browser or generative
product names, no source-repo names. Say "the audit", "the line check", "the layer
stack", "a painter's-order key". The source repo's vocabulary (kit file names, figure
names such as the engine or the cabinet) belongs only in applications.

## The subject, in one paragraph

A picture made of stacked opaque layers (isometric props, sprites that wrap each other,
vector figures, a character walking through an arch) is correct only when, wherever two
layers overlap on screen, the one nearer the camera is drawn later. In a small scene a
person keeps a sort key per layer and nudges it; past a few dozen overlapping parts the
nudges fight each other and every fix to one view breaks another. The subject is how to
get the order from geometry, how to know the check is looking at the thing drawn, how to
cover every pose a viewer can reach, and how to prove the parts of the picture no order
check can see.

## Proposed techniques (slugs are final; the decision rule each must carry)

1. `measured-draw-order` - Past a few dozen overlapping layers, stop hand-setting sort
   keys. Give every layer its true shape, measure which surface is nearer wherever two
   overlap (a depth probe over the overlap, not the centre-to-centre distance), and
   raise each key just enough to satisfy every measured pair. A pair that each shows
   the nearer surface somewhere (an interlock) has no key that fixes it: the fix is a
   cut of the geometry (split the layer, give the contact a tangent or a flush face),
   never a bias. Evidence in the tree: hand-set keys left 190 pairs drawn the wrong way
   assembled and 133 apart; measured keys took both to zero, and the audit separates
   "rule dropped" from "genuine cycle". Corroborate with the painter's-algorithm
   literature on cyclic overlap and the polygon-splitting answer to it (primaries:
   Newell, Newell and Sancha 1972; Fuchs, Kedem and Naylor 1980) and the vector-graphics
   specification's own statement that paint order is document order. Training-data
   convergence is strong for the cycle rule; the "raise keys just enough" solver is the
   source's engineering and is stated as one workable realisation.
2. `split-wrapping-parts-at-the-wrap` - A part that wraps another (a spring round a
   rod, a frame round a carriage, an arch round a walker, a pipe that passes in front of
   one neighbour and behind the next) is two layers: a back half drawn before the inner
   part and a front half after it. A long run that crosses another run is cut into
   chunks at the crossing, each its own layer at its own depth, because one line can
   pass in front of one part and behind the next. A moving layer that can pass in front
   of and behind the same neighbour is handled by splitting the neighbour or bounding
   the motion so the order never changes. Include the stepped-surface rule (taller steps
   further back) and the vertical-through-horizontal rule (two segments around the
   horizontal part). Home check: this is the technique a reader with an isometric game
   needs first; write the decision rule as "when does a draw-order bug need a split
   rather than a key".
3. `order-across-every-reachable-pose` - Keys must hold in every state a viewer can
   reach, not at rest and apart alone. Replay the real motion (the spring, with its
   stagger) and measure order in frames of it; include reversals at every stagger
   boundary and the prefix states (the first k out, the k-th part-way, the rest home).
   Measured in the source: a line hid behind a column it was in front of for 40% of
   every explode though both rest poses were right; the bad reversal windows were about
   15 ms wide and probes at 0.15, 0.3 and 0.5 s missed all of them, while probes at the
   stagger boundaries found them. The decision rule: probe at the structure of the
   motion (its boundaries), never at round numbers. Include "whoever is outside leaves
   first" and "parts threaded through each other share one spring" as the authoring
   rules that remove the need for most fixes.
4. `the-record-must-cover-the-drawing` - A check fed by a record the author writes
   (shapes recorded as parts are built) can be silenced by the author, deliberately or
   by laziness: a builder recorded a 0.45-thick disc at the tip of each of five rods
   and a sliver for a sunk rod, the audit passed, and it said nothing about either rod.
   So the checker also measures coverage: the footprint of the recorded shapes against
   the box of what is drawn, failing under 60% (with a stated excuse list, looked at
   before it is granted). The rule generalises past drawing: whenever a gate's input is
   authored by the party being gated, gate the input's coverage of the output first.
   Boundary against `generated-mesh-acceptance`'s `unmeasured-is-not-pass`: that
   technique makes an absent measurement visible; this one is a measurement that exists
   and measures a stand-in. Say so, in both directions, in the new technique's text.
5. `texture-ends-on-an-edge-or-fades` - The line-end predicate. Every open stroke of a
   texture (seam, rib, groove, tick, rule, pointer) ends within one drawing unit of
   another stroke, a dot or an outline, or under a fill painted after it; a short mark
   (up to about seven units) needs one end rooted within two; a stroke meant to stop
   (printed-text rule lines, a needle's tail) is marked free and the mark is for nothing
   else. A texture that must end ramps out rather than stopping. Include the fix table
   (seam inset from corners wraps the corners; ticks hang from a ruler strip; vents are
   closed slots; a line that runs under a part is drawn before the part, full length).
   Note the owner's quote the source records: they would rather a texture faded out than
   stopped. Applies to any authored tile or layer, not only vectors.
6. `a-gate-states-its-blind-spot` - Two instruments with disjoint blind spots: the
   geometry audit sees recorded shapes and never markup, the line check sees markup and
   never geometry; each prints what it cannot see, "a zero audit is necessary, not
   sufficient", and the run closes with a human look at close-ups in both themes. The
   decision rule: a zero from one instrument is evidence only about its own domain, and
   the report names the domain. Keep this technique short and keyed to this subject; the
   general law (`unmeasured-is-not-a-pass`) is cited, not restated.

Applications (two, written against the source tree and its pinned commit, stack
`node`; the first paragraph of each says which witness fixes the version: the engines
field in the source's package manifest names Node 20.10 or later and the commit above is
the pin):

- `node--measured-order-and-stand-in-audit.md` - the source's own audit, run today
  (the director ran the Raptor build with `--audit`; the result is recorded in the
  source note and is yours to quote): what it settles, what it reports, what it cannot
  say.
- `node--line-end-check.md` - the line-end instrument: the predicate, the `free` marks,
  what it excludes (the kit's own outlines, creases, bevels; ends under a fade ramp).

Anchors for the worker (path:line "quote", root = the source clone at the pinned
commit; the clone is at the path the director gives you and is deleted after your
report, so quote from it now):

- `kit/audit.mjs:657` "export function orderKeys(items, overlaps"
- `kit/audit.mjs:666` "cycles.push(pair);"
- `kit/audit.mjs:1559` "export function coverage(items, P, { least = 0.6"
- `kit/audit.mjs:1569` "if (share < least) out.push"
- `references/craft.md:194` "Dense figures settle their keys from geometry."
- `references/craft.md:45` "Stand-in shapes."
- `references/motion.md:122` "Settle the static keys from the motion"
- `references/motion.md:132` "Check the paths a viewer can make"
- `references/verify.md:75` "must end within 1 viewBox px"
- `references/verify.md:137` "A zero audit is necessary, not sufficient"

Run `node scripts/check-anchors.mjs <document> --root <clone>` over each application
before reporting; quote substrings without double quotes inside them.

## Boundaries this subject must NOT absorb

- Pixel grid, palette and atlas packing of a finished sprite: `sprite-and-atlas-production`.
- Mesh acceptance and rig readiness: `generated-mesh-acceptance`.
- Real-time effect transitions and light-theme ink: not this subject (banked as leads
  in the source note; do not write them here even where the source mixes them).
- Colour tokens per theme: `medium-format-fidelity` (technical-writing) owns that.
- Draw order in a 3D engine's own renderer: the engine owns it.

## Open questions the drafter decides, not discovers

1. Whether technique 2 and 3 are better as one when drafted (they share the motion
   case). Keep two unless the text is under half a page each.
2. Whether `a-gate-states-its-blind-spot` earns its own file or becomes the closing
   section of 5. The law already exists; if the text only restates it, fold it and
   list five techniques.
3. How much of the interlock rule survives the strip test with no engine names. If the
   technique cannot be stated for a pure sprite stack, say so in its first paragraph.

## Web budget and reconcile

Four primaries, listed above plus the vector-graphics specification's rendering-order
section. Reconcile read-only against the pinned clone for the applications; the fleet
has no managed project that draws layered isometric art (the only game project in the
fleet is a 3D tool with no draw-order seam), so the subject lands `unapplied` with the
return condition "when a managed project draws a layered 2.5D scene".

Tell the director where you overrode this spec and why.

## Execution record (2026-10-14, run anatomy-1014)

Executed in-session by one forge worker. Five techniques (the sixth folded into
`texture-ends-on-an-edge-or-fades`: it only restated two laws), two applications
(`node--measured-draw-order`, `node--texture-ends-on-an-edge-or-fades`; the spec's
application names were corrected to the `<stack>--<technique>` shape). The director then
added one decision rule and one application section from a falsifier run on the source
tree (the audit settles the keys itself). Corroboration: SVG 2 painter's model and two
secondary pages read; the 1972 paper never fetched, the 1980 page returned 403.
