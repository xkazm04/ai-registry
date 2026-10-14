---
layer: application
type: application
subject: depth-ordered-layered-art
technique: order-across-every-reachable-pose
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19.2
---

# React: an exploding slab stack whose stagger ran the wrong way round

The tree is the public marketing site's six-layer isometric slab diagram (personas-web, the
`vision-grid/layer-stack` folder), read at commit 97dc67c76e629b72e3bfbda291c40dc9877f1a11. The
version witness is its package manifest (`"react": "^19.2.8"`, anchored below, with the animation library at `^14.1.0`). Each
slab is a flat rhombus; the stack opens when the section scrolls into view and closes again when
it leaves, so the explode runs on every visit.

## The seam: a fixed draw order over a moving stagger

Draw order is fixed per slab (`zIndex: 20 - i`: the upper slab is in front) and is right at both
ends: pressed together and fully open. Between them each slab travels down from its pressed
position on its own start time (`delay: 0.15 + i * 0.07`), so the stagger decides who passes
whom. The stagger started the upper slab first. Slab 1 therefore began descending while slab 2,
which sits below it and is drawn behind it, was still pressed 10 px under, and slab 1 travelled
straight through slab 2 while staying in front of it. Neither rest pose shows the defect, which
is what the technique says about rest-pose checks.

## The check: replay the real motion and ask the ordering question per frame

The motion moved into one module shared by the component and a test (the procedure's first
step): slab count, gap, press, duration, step and the easing curve. The test steps the same curve
at a 4 ms grid plus either side of every start time and asks, per frame, whether any lower slab
sits above the slab drawn in front of it.

| Arm | Frames examined | Frames with an inversion |
| --- | --- | --- |
| Upper slab leaves first (as shipped) | 368 | 103 |
| Lower slab leaves first | 368 | 0 |

The counter-arm is part of the test, so the probe is shown to be able to fail, and the examined
frame count is asserted above 100 (an instrument that examined nothing proves nothing).

## Why the fix is the authoring rule and not a z-index

"Whoever is outside leaves first" removes the defect for any frame, including a closing motion
cut short, because the lower slab is always at least as far along as the one above it, so the gap
between them never falls below its pressed value of 10 px. A per-frame z-index swap would also
have hidden the crossing but left two opaque slabs visibly passing through each other.

## What was not covered

The close here is an instant reset (`controls.set("collapsed")`), not an animation, so reversal
states do not exist in this tree and step 3 and 4 of the procedure had nothing to place. A
reversing stack would owe both.

## Anchors

Root-relative, at the pinned commit.

- package.json:59 "react": "^19.2.8"
- package.json:55 "framer-motion": "^14.1.0"
- src/components/sections/vision-grid/layer-stack/LayerPlates.tsx:42 "delay: 0.15 + i * 0.07"
- src/components/sections/vision-grid/layer-stack/LayerPlates.tsx:77 "zIndex: 20 - i"
- src/components/sections/vision-grid/index.tsx:48 "controls.set("collapsed")"
- src/components/sections/vision-grid/index.tsx:56 "controls.start("exploded")"
