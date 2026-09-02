---
layer: application
type: application
subject: terrain-synthesis-acceptance
technique: terrain-to-room-graph-handoff
stack: process
status: forged
verified_on: 2026-09-02
---

# A written handoff between a terrain generator and a level planner

This is a methodology realization: no runtime, no repository. It describes the artifacts,
the roles and the cadence that make the terrain-to-graph interface explicit on a team where
ground and layout are produced by different tools, different people, or — increasingly —
different automated passes that nobody supervises in the same sitting.

The failure it exists to prevent is not exotic. Two pipelines each produce a correct result
and the composition is broken: the level planner emits a plan referencing coordinates that
the terrain pass, re-run with a bumped seed, has since turned into a ravine. No individual
step is wrong and there is no owner of the contradiction, which is why the fix is procedural
rather than algorithmic.

## Artifact 1 — the ground card

One short document per generated map, produced by whoever ran the terrain pass, before the
planner is invited to consume anything. It is deliberately a page, not a report; a page gets
written.

```
GROUND CARD — <map name> — <generation stamp>

BASIS
  sample spacing        : <n> <unit>
  vertical range        : <n> <unit>  (exaggeration applied: <n>, folded in: yes/no)
  quantization step     : <n> <unit>
  authored grid         : <w> x <h> samples
  runtime grid          : <w> x <h> samples at <n> <unit>   ("same" if not decimated)

TRAVERSABILITY   (one block per locomotion class)
  class               : <walker | mount | wheeled | climber>
  envelope            : <floor> .. <ceiling>, measured at <spacing>
  in-envelope         : <pct> of bounded area
  components          : <count>;  largest <area>;  entry component <id>
  reachable from entry: <pct> of bounded area

BOUNDARY
  play boundary declared : yes / no      entry region : <id> / not yet chosen

DRAINAGE
  status : coherent | findings | not applicable (<reason>)
  depressions resolved : <count>, deepest fill <n> <unit>
  declared closed basins : <list> / none

MASKS
  layers examined : <n>    samples examined per layer : <list>
  findings : <count by layer>    unevaluated rules : <list>

PLAYABLE FRACTION
  map class : <declared>    target : <ratio>    achieved : <ratio>
  shortfall attributed to : slope <pct> / boundary <pct> / disconnection <pct>

ACCEPTED BY : <name>    ON : <date>    AGAINST SEED/VERSION : <id>
```

Three fields carry more weight than their size suggests. **"Runtime grid"** is where a
decimated collision representation gets declared instead of discovered; when it differs from
the authored grid, every traversability figure below it is computed twice and both are shown.
**"Reachable from entry"** is the number stakeholders should be quoted, and putting it
directly under the raw in-envelope percentage makes the gap between them impossible to miss —
on a first generation the two frequently differ by a factor of two or more, and the surprise
is productive. **"Unevaluated rules"** exists so an absent check cannot present as a clean
one; a card with an empty findings list and three unevaluated rules is a card that has not
been accepted yet.

A card with any field blank is not a card. The reviewer's only permitted response to an
incomplete card is to return it, which sounds bureaucratic until the first time a blank
vertical-range field would have shipped a world at twice its intended relief.

## Artifact 2 — the regeneration request

When the planner cannot fit its plan onto the published components, it does not adjust the
plan onto unsuitable ground and it does not silently re-roll. It writes one of these:

```
REGENERATION REQUEST — <map name>

NEEDED   : a connected traversable region of at least <area> for class <walker>,
           adjacent to the entry component, with a width of at least <n> at its narrowest
BECAUSE  : the closing encounter's arena footprint plus its adjacent safe room
HAVE     : largest non-entry component is <area>, narrowest crossing <n>
SHORTFALL: <n> area, <n> width
TRIED    : <the placements attempted and why each was rejected>
```

The value of the form is entirely in the last two lines. A request that says "terrain is
unsuitable" starts an argument; one that names an area, a width and an adjacency starts a
parameter change. It is also the artifact that survives: six months later it is the record of
why this map's amplitude is lower than its neighbours'.

## Artifact 3 — the single-sourced envelope register

One table, owned by whoever owns movement, listing each locomotion class with its traversable
ceiling, its relief floor, and the spacing those numbers assume. The terrain check reads it.
The planner reads it. Nobody copies a number out of it into a second document.

The procedural discipline that makes this real is small and unpleasant to skip: **a change to
the register is announced, and every ground card generated before the change is stamped
stale.** Without that, the register becomes a third copy rather than the single source, and
the drift it was created to prevent reappears with an extra hop.

## The cadence

Ground card first, plan second, never in parallel. The planner is not invited to consume a
map whose card has an unaccepted field. When terrain is regenerated for any reason — a new
seed, a parameter change, a fix to a drainage finding — the card is regenerated and every plan
built on the previous card is marked invalid rather than migrated. Migrating a plan across a
regeneration is the single most common way a room ends up on a cliff, and it is always done
with good intentions because the two maps look almost identical.

Two verdicts are reported at the end and they are never merged: *ground accepted* and *plan
accepted*. A build report showing one tick for "level generated" has collapsed two independent
claims into one, and the collapsed version is always the optimistic one.

## What this process does not do

It does not judge the terrain's quality, its readability or its beauty, and it does not judge
the plan's pacing. It establishes that two systems agree about the ground beneath a layout,
which is the precondition for either judgment being worth making. A team that adopts the cards
and nothing else has eliminated one class of composition failure and improved no map.
