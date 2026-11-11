---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: haze-set-before-the-tiers
status: forged
laws: [a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [fog or haze is proposed to hide pop-in or lower draw distance, tier distances were tuned and then the atmosphere changed, two look rounds differ in haze and are being compared]
---

# Set the haze before the tiers

## The concern

Distance fog fades objects toward one colour as they recede. One engine's documentation describes depth
fog in exactly these terms: it makes distant objects fade into a uniform colour. That serves the budget
in two ways. A switch between tiers is harder to see through haze, so the far tiers can be cruder and
start closer. And past the distance where the haze is opaque, nothing needs drawing at all. Haze also
gives an open scene its depth, as aerial perspective tints the far fog toward the sky. So the same
setting is a look decision and a budget lever, and the order in which the two are decided matters.

## The rule

**Haze is decided by the look, first, and the tiers are tuned under it.** Every tier distance tuned by
eye was tuned through some amount of haze. Change the haze and the switch points that were invisible
become visible, or switch points that were too cautious become wasteful. So fix the haze before tuning
the tier distances. Record the haze setting beside the chain it was tuned under. Treat any later
change to the haze as re-opening every tier distance tuned by eye.

The same order binds judgement. A frame judged for its look is judged on its light, its value range and
its skyline, and haze changes all three. Two look rounds that differ in haze do not differ only in the
change being tested. A verdict on one round does not carry to a round with different haze
([a-verdict-is-bound-to-its-content](../../../../_laws.md#a-verdict-is-bound-to-its-content)). When a round
must change haze, change only haze in that round, and judge it as a round about haze.

## Procedure

1. **Settle the atmosphere with the look.** Set density, colour, height falloff and the sky tint, from
   the concept or the reference, before any tier distance is tuned by eye.
2. **Record where the haze becomes opaque for each view.** Past that distance a stand-in can be
   crude, and past the opaque point a cull costs nothing visible. Use it as an input to the chain's last
   rows, with the haze setting named as its basis.
3. **Tune the tier switches under the settled haze.** Note in the chain's record which haze it was
   tuned under.
4. **On a haze change, re-check the switch points.** Walk the views where each switch happens.
   Distances derived from play geometry do not move. Thresholds that were relaxed because the haze hid
   them do.

## Decision rules

- **When haze is proposed only to hide pop-in, fix the chain first.** A missing far tier covered by fog
  returns as soon as the art direction clears the sky. Haze the look did not ask for is a defect with
  an atmosphere around it.
- **When the look asks for clear air, the chain must hold without help.** A clear sky at long range is
  the hardest case for stand-ins. Budget for it, and do not plan to add haze later.
- **When haze varies with weather or time of day, tune the tiers under the clearest state the player
  will see.** A chain tuned under the thickest fog breaks on the first clear morning.
- **When dense fog shows banding, fix the banding as a look problem.** Thinning the fog to remove the
  banding changes every tier tuned under it.

## When not to use it

Interiors and short-range scenes have no meaningful aerial haze, and their tier distances are not
tuned through it. Haze used as a gameplay mechanic is a design decision with its own owner. Examples
are fog that hides enemies, or a storm that shortens sight. The chain must then hold at the clear
setting and at the fogged one, and the gameplay owner decides which states exist.
