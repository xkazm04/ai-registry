---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: terrain-to-room-graph-handoff
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a level planner must place rooms on generated ground, deciding which system owns walkability, a generated plan puts a room on a cliff, defining the payload terrain publishes to downstream planning]
---

# Terrain to room graph handoff

A level planner reasons over a graph: rooms, connections, sizes, roles. Ground is a field of
elevations and masks. The two meet at exactly one interface, and the discipline of this
technique is to make that interface small, explicit, unidirectional, and single-sourced —
because the alternative, which is the default, is two systems each assuming the other checked
something.

The naive reading is that terrain is a backdrop the planner drapes a layout over. Under that
reading the planner places rooms wherever its graph rules want them, the ground is generated
or sculpted afterwards to fit, and everything works until the ground is generated *first* or
generated *independently* — at which point rooms land on cliffs, corridors cross ravines, and
nobody owns the contradiction because each system did its own job correctly.

## The payload

Terrain publishes one description and the planner consumes it. Its contents are small and
each item is load-bearing:

- **The basis** — sample spacing, vertical range, unit. Everything else in the payload is
  meaningless without it, per
  [a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis),
  and the planner's own distances are in the same unit or in a stated conversion.
- **The traversable mask**, at a stated spacing, together with the **locomotion class and
  slope envelope it was computed under**. Not "walkable ground" as a bare fact — walkable *by
  what*.
- **The connected components** of that mask, each with its area, its extent, and its adjacency
  to the others, including where two components are separated by ground the class cannot
  cross.
- **The declared play boundary** and, where it exists, the entry region.
- **Constraint surfaces the planner will need**: water bodies, the drainage network's channels,
  and any mask that forbids construction. A planner that has to re-derive "there is a river
  here" from elevation will derive a different river.

Anything not in the payload is not available to the planner, and a planner that reaches around
the interface into the raw field has recreated the second authority the interface exists to
prevent.

## The rule of ownership

**The ground owns walkability. The graph owns structure.** Stated as consequences:

Terrain does not decide how many rooms there are, where the ending fight goes, which
connections are gated, what the pacing is, how difficulty ramps, or which room is a landmark.
Those are the planner's, and a terrain pass that begins nominating arenas has taken a decision
it cannot justify from a gradient field — a wide flat region is not a boss arena, it is a wide
flat region, and which of the six wide flat regions becomes the arena is a design decision made
against pacing rules that live entirely on the other side of the interface.

The planner does not re-derive walkability with a threshold of its own. This is the specific
failure [one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity) names: two
systems answering "can the player stand here" with two models, agreeing on most of the map and
disagreeing exactly on the marginal ground where it matters, with the disagreement invisible
until a room is unreachable. The envelope is read from one place by both.

The planner also does not assume a region is reachable because it lies inside the map. That is
what the connected components are for; a component the entry region cannot reach is not
available for placement, however inviting its slopes.

And **the ground wins on disagreement**. The plan is a request over the terrain; the traversable
mask is a measurement of it.

## Procedure

1. **Accept the terrain before publishing the payload.** Basis declared, slope envelope measured,
   masks cross-checked, playable fraction reported. A payload published from unaccepted ground
   propagates every unproven claim into the plan.
2. **Publish the payload as data, with its basis attached**, not as a picture or as a set of
   parameters the planner is expected to reconstruct.
3. **Constrain placement to the components.** Every room's footprint lies inside one component;
   every connection between rooms in the same component follows ground the class can cross.
4. **Reject rather than adjust when the plan does not fit.** A room the ground cannot host is a
   finding with a reason, not something to nudge fifty metres and hope.
5. **Route unmet needs back as a regeneration request with a stated constraint** — "a connected
   traversable region of at least this area adjacent to the entry component" — rather than
   placing the room anyway. The request is the correct artifact: it names what the ground must
   provide, it can be satisfied by a new seed or a new parameter, and it leaves a record of why
   the terrain changed.
6. **Carry both verdicts separately in the result.** A plan that satisfies every graph rule over
   ground that failed acceptance is not a playable space, and a report that shows one green tick
   for "level generated" has merged two independent claims.

## Decision rules

- **When the traversable mask is absent, do not plan.** Report unplanned and stop, per
  [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass). Treating an absent mask
  as "all ground is walkable" is the exact substitution that puts rooms on cliffs, and it is
  seductive because it always produces a plan.
- **When the planner needs a component larger than any that exists, say which constraint failed
  and by how much.** "Needs eight hundred square units contiguous; largest available is three
  hundred" tells someone which parameter to move; "placement failed" does not.
- **When the thing being placed is a point rather than a footprint, snap it to the nearest valid
  ground and report why it moved; when it is a footprint whose position carries design meaning,
  reject instead.** A spawn marker, a pickup or a camera anchor is equivalent anywhere in a small
  neighbourhood, and snapping it is strictly better than refusing the plan — but the snap is only
  honest if the marker records that it moved *and which reason moved it*: ground the class cannot
  occupy is a different fact from ground another marker already took, and collapsing the two into
  "adjusted" destroys the only signal that would have told a designer the layout is wrong rather
  than crowded. An arena, a gate or a boss room does not snap: its position is the decision.
- **When two components must be connected for the plan to work, make the connection an explicit
  terrain change,** generated and re-accepted, rather than an edge in the graph. An edge asserts
  that the player can get from one to the other; only the ground can make that true.
- **When the map hosts multiple locomotion classes, publish one mask per class** and let the
  planner state which class each connection assumes. A single merged mask makes a route look
  available to everyone that only a climber can take.
- **When terrain is regenerated, invalidate the plan built on the previous ground.** A plan is a
  statement about a specific field; carrying it across a regeneration produces a layout that is
  correct about terrain that no longer exists.
- **When the planner is the earlier system** — a graph exists and ground must be synthesized to
  host it — the interface reverses but the ownership does not. The graph becomes a constraint on
  generation, the generated ground is still accepted on its own terms, and the plan is still
  re-checked against the delivered mask afterwards.

## When not to use this

- **Fully abstract layouts** with no continuous ground beneath them — a graph of interiors joined
  by doors, a node map, a level assembled entirely from modular pieces whose floors are flat by
  construction. There is no field to hand over, and the interface would be ceremony.
- **Terrain that hosts no planned structure** — an open region with no rooms, no objective and no
  routed connections. Accept the ground on its own terms and stop; there is no consumer.
- **As a substitute for either side's own acceptance.** A clean handoff means the two systems
  agree about the ground. It says nothing about whether the terrain is good, and nothing about
  whether the plan paces well; both remain to be judged by their own instruments.
