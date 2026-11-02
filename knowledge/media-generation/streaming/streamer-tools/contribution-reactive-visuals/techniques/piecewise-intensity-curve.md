---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: piecewise-intensity-curve
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding how much giving lights a reactive visual and when it reaches full blaze, a reactive visual that pins on one big gift or never lights, separating the curve from the visual's look]
---

# Piecewise intensity curve

The mapping from "how much the room has given, lately" to "how strongly the visual reacts"
is the most consequential number in a reactive visual, and it is usually not designed: the
amount is multiplied by a constant and clamped. This technique replaces that with a short
list of control points, each with a reason, validated at the moment the curve is saved.

## What the curve maps

The curve's input is the visual's **cooled running total** — every accepted contribution in
the visual's one unit, weighted, summed, and decayed to the present. Its output is an
intensity between zero and one. It does not map a single contribution's lift: a curve that
tries to account for what already happened ("the second gift in a minute counts less")
mixes state into the mapping and cannot be tested. Applying the curve to the total also
gives bursts the right feel for free — on a concave curve, a gift wave compresses near the
top as it should, and cools back down through the same shape it rose on.

## The control points

Three to five points with straight segments between them, clamped beyond the first and
last:

1. **The lighting point.** The total at which the visual first visibly responds. Below it
   the visual sits at its resting look. A curve whose second point is out of reach on a
   quiet night "never lights", and the streamer should see that before going live.
2. **The steep stretch.** Ordinary giving — one subscription, a handful of small cheers —
   should move the visual noticeably and distinguishably. Most of a night's contributions
   land here, so it gets most of the range.
3. **The shallow stretch.** More is bigger, by less. A total ten times larger earns a
   clearly stronger visual, never ten times the reaction; this is where the curve is
   concave, for the reason vote weight is: a response proportional to spend makes the
   visual an auction.
4. **Full blaze.** The top point. Past it the visual is at its designed maximum.

Decide on purpose what happens to the total past full blaze. Keeping it accumulated means a
large wave holds the visual at full blaze for a while and then cools through the curve
naturally; clipping it means the visual starts to cool the moment the wave ends. Keeping it
is usually right — a wave the room worked for should linger — but it is a choice, and the
consequence lines must show it as minutes at full blaze.

## Properties checked when the curve is saved

A curve is configuration, so it is validated once at the boundary where it is saved, and
an engine cannot be built from an invalid one.

- **At least one point.** One point is a constant intensity, which is legitimate.
- **Totals strictly increasing and distinct.** Equal totals make a vertical segment and an
  undefined interpolation.
- **Intensities non-decreasing.** More is never less. A dip — usually one point dragged
  without its neighbour — makes a larger wave look smaller, and the viewers who gave notice.
- **Intensities finite and within zero to one,** and the interpolated value clamped.
- **Deterministic.** The same total always gives the same intensity. Variety belongs in
  the animation, never in how much the room's giving counted.

A preset curve also carries measurements — how it behaves over representative nights — and
one shipped without them is a claim nobody checked.

## The curve is economics, the binding is art

Intensity drives the picture through a separate linear binding per visual property: opacity
from a resting value to full, scale from a little under to a little over its size, a
position shift that keeps the centre still while it swells. Two rules follow.

- **The rest state is visible.** Map zero intensity to a dim, present look, not to nothing.
  An invisible resting visual is indistinguishable on stream from a broken source, and gives
  the streamer nothing to place in their scene.
- **Change one without the other.** An artist restyling the glow must not alter how much
  giving it takes to reach full blaze, and a streamer retuning the curve must not alter the
  art. Keep the curve on the visual's settings and the bindings in its design.

## Decision rules

- **When a streamer asks for "more reaction"**, lower the lighting point and steepen the
  early stretch; raising full blaze makes ordinary giving relatively smaller.
- **When a preset pins for most of a busy night**, move the full-blaze point out; when it
  never lights on a quiet night, move the lighting point in. Offer one point move, not a
  redesign.
- **When a visual must show an exact figure**, such as a goal bar's count, do not bend it
  through a curve: a count is drawn exactly, and an intensity is not a count.

## When not to use it

A one-shot alert that plays one animation per event has no intensity to map; a tier table
(small, medium, large) is a three-point curve and the same properties apply, but a single
fixed alert needs none of this.
