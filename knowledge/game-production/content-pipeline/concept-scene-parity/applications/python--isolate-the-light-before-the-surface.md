---
layer: application
type: application
subject: concept-scene-parity
technique: isolate-the-light-before-the-surface
stack: python
status: forged
verified_on: 2026-10-26
verified_against: python@3.11
applied: code
ab_verdict: better
proof: ab-paired
---

# Four light isolations recorded in replayable look steps

Source tree: bp (public, github.com/xkazm04/bp), `master` at `6bc4f02`, read from an exported
copy of that commit on 2026-10-26. The VR scene runs on Unreal Engine 5.8.4 on the forward path.
Its look is set by replayable Python steps that run in the editor's embedded Python 3.11. Each
step's header records what was measured at the scoring pose and why each value moved. That
habit is what makes this application citable: the isolations are in the tree, next to the values
they decided.

## The back wall: three terms, and none of them the wall

apps/vr/tools/mcp-steps/py/fq_look.py:6 "the median of"
apps/vr/tools/mcp-steps/py/fq_look.py:7 "the back wall left of the agent, 0-255; the concept's is 18): 111 with FP's look. Of that, the table's rising veil"

The header goes on to split the 111. About 35 came from the veil, about 16 from fog lit by the
baked light, and about 30 from the movable lights' scattering. The wall's albedo contributed
almost nothing. The step removed the veil, stopped the baked light scattering, and kept scattering
on named lights only:

apps/vr/tools/mcp-steps/py/fq_look.py:11 "# - the veil goes (Glow 0): real fog now carries the light in the air;"

## The glowing sheet: bright with its own emission at zero

apps/vr/tools/mcp-steps/py/fac_look.py:8 "40, 14 with that light off) and lifted the back wall. Under the paper's far edge it lights the air behind the table,"

The sheet's material had been suspected for two rounds. One air light under the sheet, aimed up,
fogged a teal veil over it.

## The left of the room: one fill light scattering everywhere

apps/vr/tools/mcp-steps/py/fab_look.py:13 "from 57 to 108. The frame's fill scattered over the whole room (it alone lifted the left 19 and the walls 17, fab/d4),"
apps/vr/tools/mcp-steps/py/fab_look.py:12 "at 0.16 every lit light scattered and the wall behind the agent went"

## The pale panel: a sheen, not a texture

apps/vr/tools/mcp-steps/py/faf_look.py:7 "luma 117 at the"
apps/vr/tools/mcp-steps/py/faf_look.py:9 "albedo 0.3 alone read 98, both 35)"

## Verdict

- Target: the measured region's brightness moving toward the concept's.
- Floor that must hold: the frame budget and the other regions.

Each isolation was a paired reading at one camera, with the contributor on and off. Each fix moved
its region toward the concept: wall 111 to about 26 against the concept's 18, panel 117 to 35
against 20, sheet mid-tone from 86 to 48 against 38. The judges' darkness complaint moved from
"a warm mid-grey with a lit wall" to "warmer and brighter than the concept's near-black" (a blind
panel of three, 2026-10-25). The element still sits at 2 of 3.

## What this realization cannot show

- **No isolation tool.** Each isolation was done by hand, in a play session.
- **Toggles leaked between captures (deviation).** At least one round lost captures because console
  toggles set in one play session (fog and bloom off) persisted into the next. A script that
  measures each contributor with an on-and-off pair, and restores the scene, would make this
  repeatable and remove that leak.
- **The darkness oscillated before it settled.** One round lowered everything, and the judges
  then called the studio "almost empty". The next round restored small warm pools against
  near-black walls, which is the technique's subtraction by source.
