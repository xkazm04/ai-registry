---
layer: application
type: application
subject: concept-scene-parity
technique: cap-attribution-before-the-next-round
stack: process
status: forged
verified_on: 2026-10-26
applied: task
ab_verdict: unmeasurable
---

# Where a VR light table's plateau sat, element by element

bp (public, github.com/xkazm04/bp) ran a fidelity sprint on its VR light table from 2026-10-24 to
2026-10-26: about twenty build rounds against a fifteen-element concept scorecard, read at
`6bc4f02`. The briefed panels' trail reached 33 to 38 of 45 and stayed there for six rounds. A
blind panel of three judges then put the best frame at 34 (2026-10-25). Most elements sat at 2,
"reads as the concept's element". This document records, for every element left at 2, the cap
that held it and the evidence. It is the record the technique asks for before anyone funds round
eleven.

## The four stages, as they divided the plateau

| Element (blind marks, product 1) | Cap | Why it stalls at 2 |
| --- | --- | --- |
| Pin tags (2, 2, 2) | composition, against the device | The concept paints tags as small unreadable marks. Readable tags must clear the text floor, so they are larger, and all three judges called them oversized. A device ceiling, not a defect. |
| Wing labels (2, 2, 2) | composition, against the device | Flat labels at the far edge fell below the floor. Lifted and tilted toward the eye, they read, and the judges then saw them as "float above the back edge". |
| Scan line (3, 2, 2) | composition, against the device | The concept's hairline is thinner than a pixel at the scoring capture. The build clamps the line to a minimum width with a glow. Judges in different rounds called it "barely visible", and then "too thick". |
| Wrist panel (2, 2, 2) | composition, against anatomy | Docked on the forearm it is small and oblique at every placement tried (more than ten). |
| Haze (2, 2, 2) | engine | On this forward path, local fog volumes draw nothing, and volumetric fog barely scatters area lights. Air came from chosen point lights and translucent planes, which gave bloom and a little air. |
| Real hands (2, 2, 2) | engine | The skin profile shades as default lit on the forward path (no screen-space diffusion), so the skin reads "smooth, like a mannequin's". |
| Dark studio (2, 2, 2) | engine and light, oscillating | Light isolation brought the wall from 111 to about 26 against 18. Globally darker read "empty", and warmer pools read "too warm". The cap is the balance, not one term. |
| Lamp character (3, 2, 2) | asset | The hood was rebuilt as a recessed lens. Two of three judges still read the head as an orb, where the concept has a cone shade. |
| Lit table (2, 2, 2) | asset | The rim glows unevenly toward the back. A baked atlas defect (sub-texel bevel islands baking black) was found and fixed in the same sprint. |
| Rooms (2, 2, 2) and furniture (2, 2, 2) | data and layout | The rooms are drawn from the product's real plan. They read as glass, but "open and overlapping, not compact subdivided plans". The concept shows ten times the density any real product supplies. |

The elements at 3 on product 1 were the paper, the lifted room, the decision card and the city.
Most of them have one dominant surface that a single round could reach.

## Anchors for the device-bound caps

The floor that sizes the tags and labels:

apps/vr/Source/bp/BpType.h:30 "constexpr double FloorPx = 6.0;"
apps/vr/Source/bp/BpTable.h:191 "static constexpr float TagClearUCm = 8.3f;  // FM: with PinScale, the tag's width (6.6 cm) and a gap"

The forward path's air and skin:

apps/vr/tools/mcp-steps/py/fe_atmos.py:11 "Local Fog Volumes were tried first and draw nothing on this path (a 20/m red test sphere in front of the eye left"
apps/vr/tools/mcp-steps/py/import_hands.py:9 "subsurface (no screen-space diffusion; r4)"

The rim, where the textures carry what the area lights ignore, and the bake defect:

scripts/art/light-table-frame/build_frame.bpy:18 "UE's rect lights ignore Substrate anisotropy, so the textures carry the brushing"
scripts/art/light-table-frame/build_frame.bpy:20 "smart projection cut them into islands narrower than a texel that baked black (the rim's dark dashes)."

## What the plateau teaches the next round

- **Device-bound caps (tags, labels, scan line, wrist).** These are four elements whose 3 would
  need the concept's cheat: illegibility, or a sub-pixel hairline. They are the cheat column's
  device ceiling and are written down as such. Funding them again buys oscillation, not score.
- **Engine-bound caps (haze, skin).** These move only with a different path: a deferred or hybrid
  renderer for those elements, or a hand-authored cheat that the device actually shows. Each is a
  path decision, not a tuning round.
- **Asset-bound caps (the lamp's head, the rim).** These are the ones another round can still buy,
  and they are where the remaining points are.
- **The total.** With every device-bound and engine-bound element held at 2, the reachable total
  sits near the high thirties. The bar of 40 needs those six elements at 3. The feasibility rule
  says no, for this device and path, and the owner's question is answered with that list.

## Verdict: unmeasurable

The attribution is a plan, not yet a measured round. Return condition: the next look round funds
only the asset-bound caps, is scored by a blind panel with the starting frame as a control, and
the asset-bound elements move while the device-bound ones stay where this table predicts.
