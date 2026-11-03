---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: provenance-badge-opposite-corner
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [an overlay can show rehearsal, simulated or test data, deciding where a status or provenance label sits on an overlay, recording or clipping a stream that mixes real and simulated content]
---

# Provenance badge in the opposite corner

An overlay that can show something other than a live, real result — a rehearsal draw, a
simulated chat crowd, a test fire, a demo ballot — carries a badge that says so, drawn
inside the overlay itself, in the corner diagonally opposite the overlay's anchor.

## Why inside the overlay

Provenance that lives anywhere else is lost by the first consumer that does not copy it. A
separate "TEST" source in the scene is hidden when the streamer toggles a group, left out
when the overlay is copied to another scene, absent from the vertical canvas, and cropped
out of a clip. A label in the tool's own window never reaches the stream at all. The only
place a provenance label reliably travels is inside the pixels it qualifies. A simulated
result shown without its label is a claim more certain than its evidence, and a viewer who
later learns it was a rehearsal will doubt every real result that follows.

## Why the opposite corner

The anchor is where the overlay hugs the canvas edge, and the scaled envelope grows away
from it. The diagonally opposite corner is therefore the part of the overlay furthest from
the frame edge (least likely to be under player chrome or cropped), the part that moves
with the content as it scales, and — because neighbouring overlays are placed by edge — the
part least likely to sit under a sibling hugging the same edge. A badge in the anchor
corner sits exactly where the frame edge, the safe-area margin and the neighbour all
compete. For a top-left anchored plate the badge goes bottom-right; for a bottom-centre bar
it goes top-centre; for a centred overlay pick a fixed corner and keep it.

## Procedure

1. **Derive the badge from state.** The badge text comes from the same record that says
   where the data came from — the session mode, the source of the result — never from a
   flag the operator sets separately. A badge that can disagree with the mode will.
2. **Use a closed vocabulary.** A handful of fixed labels ("rehearsal", "simulated",
   "test") that the whole product uses, so a viewer learns them once.
3. **Place it by the anchor.** Compute the badge corner from the overlay's anchor, against
   the fitted envelope, so it stays beside the content it qualifies and is never placed
   outside the viewport. Placing it against the viewport instead is simpler and works when
   the source is tight around the overlay; in a full-canvas source it sends the badge to a
   far canvas corner, away from the content, where every other overlay's badge competes
   for the same four corners.
4. **Keep it out of reach of the content.** When the overlay's look is authored as data —
   a design package, a theme, a streamer's custom layers — the badge is chrome the overlay
   owns, outside the replaceable layer list, so no design can omit, restyle or cover it.
   It clears together with the content when the feed drops, so a stale badge never
   qualifies an empty frame or survives into the next, real result.
5. **Make it legible, not loud.** The badge is small and plain, with its own background so
   it reads over anything; it qualifies the content without competing with it.
6. **Never offer an off switch on air paths.** A real result shows no badge because it is
   real, not because someone hid it. Simulated content always shows it.

## Decision rules

- **When an overlay can render data from more than one provenance**, it carries the badge
  slot whether or not today's data needs it.
- **When the badge collides with content** at some scale, enlarge the envelope to reserve
  the corner; never move the badge outside the overlay.
- **When content is live and real**, the badge is absent, and its absence is derived, not
  configured.
- **When the picture is cut for a vertical player**, check the badge, and any disclosure
  line, against that player's bands, not against the frame edge. Vertical players draw
  their caption block and account line over the bottom of the frame and an action rail
  down one side. A disclosure footer in the bottom strip of a vertical clip sits inside
  the canvas and under the player. Put it in the upper part of the frame, clear of the top
  band, or inside the content block it qualifies.

## When not to use it

An overlay that can only ever show live, real data — a clock, a static logo — needs no
badge. The badge also does not replace honest narration: a host or streamer showing a
rehearsal on air still says so.
