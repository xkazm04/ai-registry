---
layer: technique
type: technique
subject: talking-avatar
technique: single-image-layer-decomposition
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [splitting one portrait into parts a rig can move, a head turn reveals a ghost copy or a pale band, the art is glow or particles on black rather than paint]
---

# Single-image layer decomposition

## The concern

A rig moves parts, and one still has no parts — it has pixels, some of which
belong to things that will move and some of which hide things that will be
revealed. Decomposition is the offline step that turns the still into ordered
layers, each with coverage, a depth, and whatever lay behind it filled in. Every
artefact a viewer will ever see on a head turn was decided here, so the step is
run as a reproducible command with its inputs and outputs named, never as a
one-off by hand ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
the next portrait, or the next revision of this one, must come out the same way.

## The procedure

1. **Segment by what moves, not by anatomy.** The useful cut is: background;
   body; head; parts that move against the head (lids, irises, mouth halves,
   brows); things that move on their own (hair, floating ornaments, halos).
   A semantic segmenter gives anatomical classes; the rig needs *deformation*
   classes, and the two disagree at the edges that matter.
2. **Assign every pixel to exactly one layer, and resolve the border regions in
   favour of the mover.** Anything beside the head above the mouth line belongs
   to the head or the background, never to the body: a body layer that keeps a
   copy of the cheek shows it as a ghost the moment the head turns away.
3. **Lift front to back and fill behind.** Take each part off a working copy,
   then fill the hole so whatever lies behind continues. Small holes take an
   inpainter well. **Face-sized holes do not** — the inpainter returns a pale
   average that shows as a band on every turn; fill those by pushing the
   surrounding colour inward (a multi-scale normalised blur) and darken it a
   little, because the revealed region is in the part's shadow.
4. **Clip every generated layer to a matte of the subject.** Layer models leave
   faint alpha across the whole canvas; a union of their layers can claim most
   of the frame as "character" and wreck the background fill.
5. **Record the rig geometry with the layers.** Head centre and radius, chin and
   crown, eye contours and iris, the mouth's parting line and its open distance,
   each layer's depth. The renderer reads these; nobody should re-derive them.
6. **Warp all head layers through one shared field.** Rotation as a projection
   onto a sphere plus a per-layer depth offset (parallax) means neighbouring
   layers can only separate by their depth difference, so hairlines and contours
   do not tear. Moving layers independently tears them on the first turn.

## The light-on-black variant

Art made of light — glow, fibres, particles, crystal lit from within — does not
occlude like paint; overlapping glow *adds*. Decompose it as light:

- **Luminous parts are additive deltas**: the lifted part minus the filled copy
  beneath it, clamped at zero, with no coverage of their own. Blended
  premultiplied (colour carries the light, alpha carries occlusion), glow sums
  like light while solid parts still hide what is behind them.
- **Solid parts carry soft coverage** as usual.
- **A light blob that must close** (an eye-light blinking) is windowed radially
  at prep time and faded beyond the closing radius in the shader; a squashed
  rectangular delta collapses into a long visible streak.
- **A thin ring behind a moving head is erased and redrawn analytically** — the
  pixels it hid behind the head do not exist in the portrait, and no fill
  recovers a geometric line.
- **A sparse body that must occlude** (a mass of strands) takes its silhouette
  from the original light with its holes filled, never from the fill's noise,
  which swallows neighbouring erased parts into the body.

## Decision rules

- **When the style matches what a layer-decomposition model was trained on**
  (illustrated, anime-adjacent), use it; otherwise a matte plus landmarks plus
  fill gives a better rig on painted and photographic faces, and a hand-authored
  region spec refined from luminance gives the best rig on light-on-black art.
- **When the decomposition would need generated pixels for a part that moves
  continuously** (a mouth interior), draw that part procedurally instead — it is
  continuous for every in-between shape and cannot drift off the source.
- **When a layer looks wrong only in motion**, judge it in motion: review stills
  of every control at its extremes, not the neutral frame.

## When not to use this

When the route is a neural model that generates whole frames, there is nothing
to decompose; the model's own paste-back mask is the only layering. And when the
presence is a still frame with a reactive overlay, decomposition is cost without
a consumer.
