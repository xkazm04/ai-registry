---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: multi-angle-card-stand-in
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a repeated object such as a tree or rock needs a stand-in beyond its last reduced mesh, choosing how many angles to capture for a card, a far card reads flat or swims as the camera moves]
---

# Multi-angle card stand-in

## The concern

Past some distance even a heavily reduced mesh costs more than its few pixels are worth. The usual
last tier for a repeated object is a card: a flat quad that shows a picture of the object, captured in
advance. A card captured from one angle is a cut-out. It reads correctly from that angle and turns to
cardboard as soon as the camera circles. The technique is to capture the object from many directions
into a grid of frames, and to render the card by blending the frames nearest the current view. The
card then holds its outline, its shading and its apparent depth from any direction the player can
look.

## Procedure

1. **Choose the capture layout from how the object is seen.**
   - A full sphere suits objects the player sees from above and from below.
   - An upper hemisphere suits objects that stand on the ground, which nobody sees from underneath. It
     spends no frames on views below the ground.
   - A few fixed side cards with one top view suit objects seen almost only from the side. One
     engine's baker offers all three layouts, and gives the fixed cards more resolution per view.
2. **Trade frame count against resolution per frame.** The frames share one texture, so more angles
   mean fewer texels for each. One engine's documentation reports a production setting of a 12-by-12
   grid for distant foliage, with a 16-by-16 grid as the high option. Choose the count from the
   farthest switch distance. A card that never covers more than a few dozen pixels does not need a
   large grid.
3. **Capture more than colour.** Colour alone lights wrongly under the scene's own light. Capture the
   normal so the card relights, and capture depth so it can offset its pixels and so neighbouring frames
   blend without ghosting. Add masks for any material channel the near tier uses, such as roughness or
   subsurface for leaves. Translucent materials need their own capture route.
4. **Supersample the capture.** Render each frame at twice its final size or more, then reduce it. A
   frame captured at its final size aliases at its edges, and the card shimmers once it is minified.
5. **Centre the pivot on the object's mass.** An off-centre pivot makes frames from opposite sides
   disagree about where the object stands, which shows as ghosted trunks.
6. **Pack the frames with margins.** The grid is an atlas, and its margins against mip bleed are an
   atlas concern. Size them by the filter and the mip depth in use, not by eye.
7. **Accept the card at its switch distance.** Place the card and the tier it replaces side by side at
   the switch distance, from several angles, under the scene's light. Compare outline, value, hue, and
   the shading at the outline. A card that matches only in the capture's own neutral light has not been
   checked ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).

## Decision rules

- **When the view direction is bounded, a single-angle card is enough.** Examples are a seated
  audience in a fixed arena, a backdrop behind a fixed camera, and a sprite in a side view. Spend the
  texels on one good frame instead of many poor ones.
- **When the camera circles the object, never use a single-angle card.** The flatness shows within a
  few degrees of rotation.
- **When the card must cast a shadow, give the shadow its own representation.** A card's shadow taken
  from the light's direction shows the frame for that direction, and for long low sun it often shows
  the flat edge.
- **When the platform falls back to a single frame sample, check the card on that platform.** One
  engine's mobile route does this, and blending across angles no longer hides the seams.
- **Judge the card against the tier it replaces, not against nothing.** "It looks fine from far away"
  is a verdict without a reference
  ([grade-against-what-ships-not-on-a-curve](../../../../_laws.md#grade-against-what-ships-not-on-a-curve)).

## When not to use it

For objects that move or deform, such as characters, animals or swaying trees with large motion, a
static capture freezes them. Use a reduced animated mesh, or a capture that includes the animation. For
a cluster of different objects, a card per object still costs one draw each, and a merged proxy is the
better last tier. For objects the player approaches to within the card's distance during ordinary
play, the card is not a stand-in. It is the asset, and it has to be authored as one.
