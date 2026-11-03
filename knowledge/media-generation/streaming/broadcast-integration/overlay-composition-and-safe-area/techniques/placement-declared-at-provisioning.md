---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: placement-declared-at-provisioning
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [writing the code that adds an overlay to the streamer's scene, choosing default positions for a set of overlay kinds, diagnosing overlays that pile up in one spot]
---

# Placement declared at provisioning

When a tool adds an overlay to a scene, the request that creates it carries where it goes.
Not a later "arrange" step, not the broadcasting software's default, not an instruction to
the streamer to drag it into place: the anchor, the offset and the scale are fields of the
provisioning call, filled for every overlay kind, every time.

## Why the default is a trap

A broadcasting application places a new source wherever its author found convenient for a
person who is about to move it — the canvas origin, the centre, the native size of the
page. The default is correct for that person and wrong for a tool, because a tool adds many
sources and moves none of them. Every overlay that takes the default takes the same
default, so the second overlay covers the first and the fifth buries all four. Each request
succeeded; each page rendered; the picture is a pile. The failure is invisible to any check
that looks at one overlay at a time.

## Procedure

1. **Give every overlay kind a home.** A small table, owned by the product, from kind to
   placement: anchor (one of nine points — corners, edge midpoints, centre), offset from
   that anchor in canvas-relative units, and a default scale. The ballot bar reads across
   the top edge; the result plate sits in a lower corner; the status badge in an upper
   corner. Centre is reserved for the moment that deserves the whole room's eyes, and at
   most one kind may claim it.
2. **Make the table refuse collisions.** Two kinds that share an anchor must have offsets
   or sizes that cannot overlap at their maximum envelopes, or the table is invalid. Check
   this by computing the boxes, not by eye.
3. **Send the placement with the create.** The call that creates the source sets its
   transform in the same step — or in the immediately following step that the provisioning
   routine owns and checks — so there is no instant in which the source exists unplaced. Control protocols
   commonly cannot carry a transform on the create call. In that case create the source
   disabled, set its transform, then enable it, so the first frame it paints is a placed
   frame.
4. **Record what was requested.** Keep the requested placement beside the ownership record
   so a later reconciliation can tell "the streamer moved it" from "the tool never placed
   it".
5. **Respect a move.** Once the streamer has moved or resized an overlay, re-provisioning
   the same overlay keeps the streamer's placement. The declared home is a first frame,
   not a constraint the tool reasserts.

### When the tool owns the whole picture

A tool can draw its entire broadcast as one full-canvas page instead of adding several
sources to the streamer's scene. The placement table then becomes the page's layout
table: one rectangle per named region, per layout. The collision check becomes a unit
test that enumerates every layout and flag combination. It asserts that no two visible
regions intersect and that each sits inside the safe area. That is cheaper than a rendered
capture and runs on every commit, so it guards changes before the picture exists. It
still needs the rendered check for what a table cannot see: text overflowing its box,
and a player covering a region. Bound the test by the target player's safe area, not by
the canvas edge. A region test bounded by the canvas passes a lower-third line that the
player covers.

## One owner of position

Position can be set by the scene transform (where the source sits on the canvas) or by the
page itself (where its content sits inside a full-canvas source). Pick one owner per
overlay kind and write it down. A full-canvas source whose page anchors itself is a valid
design — the page then owns position and the scene transform stays at identity. A
tight source moved by the scene is also valid — the page then centres or fills its viewport
and never pins itself. The broken design is both: the page pins to the bottom-right of its
viewport and the scene also moves the source to the bottom-right, and the content ends up
past the edge or in a corner nobody chose. The two values do not average; they compound.

Whichever owner is chosen, the anchor and scale arrive through a typed channel — fields in
the provisioning call, or parameters in the source address the page reads — never through
free-form styling the streamer must edit to move one overlay.

## Decision rules

- **When adding a new overlay kind**, add its row to the placement table and check the
  table for collisions before the kind ships.
- **When a provisioning path does not pass a placement**, treat it as a defect even if the
  overlay looks fine alone; it will not look fine beside its siblings.
- **When the streamer has moved an overlay**, the tool never moves it back on its own.
- **When the canvas shape changes** (landscape to vertical, or a second canvas is added),
  the table needs a row per canvas shape, not a scaled copy of the landscape row.

## When not to use it

A tool that adds exactly one overlay, ever, and hands it to the streamer to place can lean
on a sensible default and a clear instruction. The technique pays from the second overlay
kind onward, and it pays most when overlays appear during the show rather than at setup,
because nobody is at the mouse then.
