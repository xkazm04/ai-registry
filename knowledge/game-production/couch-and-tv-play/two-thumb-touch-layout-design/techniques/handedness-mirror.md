---
layer: technique
type: technique
subject: two-thumb-touch-layout-design
technique: handedness-mirror
status: forged
laws: []
shared_with: []
use_when: [adding a left-handed mode, a control scheme assumes the left thumb steers, a layout setting multiplies the behaviour test matrix]
---

# Handedness mirror

The named concern: left-handed play is a presentation flag that swaps the two control
columns for every layout. It is not a fourth layout, it does not change what any control
means, and it composes with each of the others.

## Why a flag and not a layout

A left-handed player wants the continuous control under the dominant thumb. The layouts
already differ in which thumb pays for what; handedness only changes which hand is which. If
mirroring is implemented as a separate layout, every future layout needs a mirrored twin, the
twins drift apart, and a bug fixed in one is found again in the other. If it is implemented
as a flag over the column order, there is one behaviour and two presentations.

## Procedure

1. **Treat the mirror as a boolean next to the layout choice**, stored and announced with
   it, so the receiving side and any telemetry know both.
2. **Mirror by swapping the two columns' order and their relative width**, using the layout
   engine's own ordering, not by repositioning each control by hand. The steering pad and the
   action column exchange sides; their internal arrangement is unchanged.
3. **Do not mirror axes or semantics.** A steering pad on the right edge still steers left
   for a leftward drag. Fire is still fire, and a stack of controls inside the action
   column keeps its top-to-bottom order.
4. **Mirror the labels and hints that mention a side.** A hint that says "right thumb" in a
   mirrored layout is wrong in the one place the player reads.
5. **Apply a change of the flag as a layout change**: clear every held value and slot, then
   re-render ([neutralising technique](./neutralise-on-sheet-open-or-layout-change.md)). A
   thumb that was holding on the old side is not holding the new one.
6. **Test each layout in both orientations of the flag**, by the ownership test, not by a
   screenshot of the arrangement.

## Decision rules

- **When a new layout is added, it is mirrorable by default.** If its design depends on a
  fixed side, say why in its definition; a layout that cannot mirror excludes a hand.
- **When the safe area differs on the two sides**, as with a camera cut-out on one edge of
  a landscape phone, the mirror must respect each side's inset instead of assuming
  symmetry. The columns keep their reach; they do not retreat under the notch.
- **When the owner asks for a "left-handed layout", ask what moves.** Usually it is the
  steering control, which is the flag; occasionally it is something else, and that is a
  layout request.
- **When mirror and layout are both selectable, store them separately.** A player who
  switches layout should not lose their handedness.
- **When the game has two seats, the mirror is a per-player setting.** One player's
  preference is not the lobby's.

## Evidence status

The structural claim, that mirroring changes order and not behaviour and that held inputs
are cleared on a change, can be checked on an emulated client. Whether the mirrored
arrangement is comfortable for a left-handed hand, whether the thumb that now steers
reaches the same distance, is not established by any simulation, and a report that only
mirrored the columns has not tested a left-handed player at all.

## When not to use this

- **Single-thumb or tilt-only control schemes**, where there is no pair of columns to swap.
- **Controllers whose layout is a physical object**, where the shell is not swappable and
  the software has no say.
- **As a substitute for a layout designed around a different split.** If left-handed
  players ask for the steering pad to be on the left while weapons stay on the left too, they
  want something the mirror cannot produce, and a flag will not either.
