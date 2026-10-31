---
layer: application
type: application
subject: asset-class-poly-budgeting
technique: budget-shapes-output-not-just-caps
stack: python
status: draft
verified_on: 2026-10-31
verified_against: python@3.13
applied: code
ab_verdict: better
proof: before-after
---

# A scripted studio kit at a tenth of its budget, then finished

Source tree: `bp` (public, github.com/xkazm04/bp) on `master` at `d8b1fea`. The paths are from
its root. The props are built by headless Blender 5.2.2 scripts, witnessed by the Blender path
the project's build notes record (`blender-5.2.2-windows-arm64`). The stack is that build's embedded Python
(3.13.13, read by running it on 2026-10-25). The budgets come from the
project plan and are written into each asset's manifest.

## Before

At `9259783^` the shelves manifest recorded 1,092 triangles against a 24,000 budget. Its five
siblings sat at 6 to 15 percent of theirs. The scripts contained no bevel, no weighted normal,
and no smooth shading on lathed parts. Every structural gate passed. In the destination's own
light (a dark studio, a cool table under-light, one warm practical) the owner described the
result as early-2000s.

## After

A shared finish stack tags hard edges for an angle-limited micro bevel:

- `scripts/art/lib/finish.bpy:15 "HARD_DEG = 30.0"`
- `scripts/art/lib/finish.bpy:17 "SEGMENTS = 2"`

The same shelves now record:

- `apps/vr/ArtSource/studio-shelves/manifest.json:4 "budget_tris"`
- `apps/vr/ArtSource/studio-shelves/manifest.json:56 "17144"`

The kit spans 30 to 79 percent of its budgets, with secondary parts: boards proud of page
blocks, spiral ends on rolled drawings, a rolled mug lip.

## Verdict

The owner compared the two shelves (before and after) and called the finished one "ok", while
judging it low-impact because it sits in the background. So the verdict is `better` for the
asset and says nothing about the score gain. The pair was shown with labels shuffled, but the
owner answered in words, so the reveal is not blind. The finish stack changed bevels,
textures and UVs together, so triangle spend is not isolated from the material work.
