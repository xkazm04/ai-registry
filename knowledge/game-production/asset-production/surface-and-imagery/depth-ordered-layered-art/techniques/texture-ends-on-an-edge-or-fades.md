---
layer: technique
type: technique
subject: depth-ordered-layered-art
technique: texture-ends-on-an-edge-or-fades
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a layered picture carries seams, ribs, grooves, ticks or rule lines, a texture stops in the middle of a face at close zoom, closing a layered-art run and deciding what a clean check proves]
---

# Texture ends on an edge or fades

## The concern

A correct draw order says nothing about texture. A seam that stops short of the corner it
should reach, a row of ticks floating on a bare plate, a rib that ends two units before its
seam: each reads as broken at the zoom a viewer uses, although every layer is in the right
order. The order check cannot see it, because it works on recorded shapes and never on the
marks drawn on them. The standard the author of one such toolkit recorded from its owner is
the right level of taste to design to: they would rather a texture faded out than stopped
short.

The technique is a predicate on every open stroke, checked on the drawn markup, with a fix
for each way it fails. It applies to any authored layer or tile, vector or raster, where a
texture is a mark that has to end somewhere.

## The predicate

Every open stroke of a texture (a seam, rib, groove, tick, rule or pointer) must end
**within one drawing unit of another stroke, a dot or an outline, or under a fill painted after
it**. Two refinements.

- **A short mark** (up to about seven units, a tick) needs only **one** end rooted, within two
  units. Both ends floating fails.
- **A stroke meant to stop is marked free.** Rule lines that stand for printed text, a
  needle's tail, a pointer's tip. The mark is for nothing else: it is a statement that the
  stop is a choice, and the check lists the free ends it excused so a person can read them.

The unit is the drawing's own coordinate unit, stated with the tolerance, because the number
changes meaning if the drawing is rescaled. Outlines, creases and bevels that the drawing
system itself generates are not checked, and neither are strokes drawn with a fade ramp, which
end by design.

## Fix table

| What is seen | The fix |
|---|---|
| A seam or weld inset from the corners of a box | Run the seam round the visible corners and end it on the silhouette. |
| A panel or stiffener line on one face, inset at both ends | Run it edge to edge, from the face's bottom to its top or from end to end. |
| Ribs that stop short of their seams | End each rib on the seam at the same parameter as the seam. |
| Ticks floating on a bare plate or hanging below an edge | Put them on a ruler strip and root them on its edge. |
| Vent or grille lines | Make each a closed slot, a thin rounded outline, not an open line. |
| A line that runs under a part and stops just past it | Draw it before the part, full length, and let the part hide the end. |
| Rule lines on a label plate | Mark them free; they stand for text. |
| A braid or texture down a pipe that stops in two hard edges | Generate the texture from the pipe's own chunking so it ends on the joints. |

## Procedure

1. Run the check on every theme the picture ships in, and in every pose it rests in. A
   stroke that lands under a fill in one theme can float in another where the fill is a
   different tone, and a pose change moves ends.
2. Print each floating end in drawing units with the start of its path so it can be found in
   the build, and render a copy of the picture with each end ringed.
3. Fix every line until the check prints zero. Re-run both this check and the order check; a
   fix that moves a part can change the order.
4. Prefer a fade to an end where nothing is there to root on. A texture on a curved surface
   that must end ramps its opacity to zero over a stated length, and the check passes ramped
   ends by construction.

## Decision rules

- **When a stroke floats, move the stroke to something before marking it free.** Free is for a
  stop that is physically right, not for one the author could not find a root for.
- **When a stroke runs under a part, draw it first and full length.** Do not shorten it to
  stop at the part's edge; a shortened end is a float.
- **When a texture covers a curved surface, shade and texture it smoothly rather than in
  steps.** A staircase of flat tone blocks reads as broken in the same way.
- **When a rule needs a free mark in more than a handful of places, look at the list.** The
  free list is a set of decisions, and a long one usually hides a few that were not decisions.

## A zero from one instrument speaks for its own domain

The order check and this check have disjoint blind spots, and that is why they are two. The
order check sees recorded geometry and never markup: it cannot see a seam, a staircase or a
texture that stops. This check sees markup and never geometry: it cannot see a part drawn
over something nearer. Each prints what it cannot see. A zero from either is necessary and not
sufficient, a zero audit is not a pass of the picture
([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)),
and a report of a clean run names the domain it covers and the domain it does not
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)). The run closes
with a person looking at close-ups in each theme. Neither instrument stands in for that look,
and the look is what the instruments make cheap, because they remove every defect a person
would otherwise have to hunt for.

This section carries the blind-spot rule that the original plan listed as a technique of its
own. It restated the two laws cited here with no procedure beyond them, so it is folded in.

## When not to use it

- **Where there is no open stroke.** A picture made only of filled shapes has nothing for the
  predicate to read.
- **Where a stroke is a deliberate edge of a cut-away or a clip.** Draw the edge along the
  cut (see the technique on splitting wrapping parts) and the stroke has a root.
- **As a replacement for authoring the texture to end on an edge.** A check that finds
  forty floating ends is a sign the construction helpers do not know about corners and
  seams; fix the helpers first.
