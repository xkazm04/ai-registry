---
layer: application
type: application
subject: render-submission-economy
technique: cull-before-submission
stack: react
status: forged
verified_on: 2026-10-10
verified_against: react@19.2.7
applied: code
ab_verdict: better
proof: ab-paired
---

# A story wheel whose chords were bounded by their ends

Source tree: `pof` at `0320375e` on `master`, read 2026-10-10; paths are relative to its root. The
witness for the stack is `package.json` (React 19.2.7 under Next 16.3.3, TypeScript 6). The renderer
is the Orrery: a Canvas 2D view of a story graph, drawn as a containment wheel or, for a document
with an ordering axis, as a lane dial, baked into an offscreen bitmap and blitted while the camera
moves. The change is `d4a6b603`. Every figure below is a count from a replay over the three staged
storygraph documents on the desktop host; no frame time was measured.

## A culler that was already disciplined

This tree is the harder test of the technique because most of it was already right. The wheel culls
before any work and culls whole subtrees with one test,
`src/components/story/orrery/render/drawHier.ts:8 "The descent culls subtrees, not nodes."`, the
sector test bounds an arc by its corners plus every axis crossing inside the sweep, and the bake
counts what it painted, `src/components/story/orrery/render/ctx.ts:16 "Ring segments actually painted after culling."`.
Sectors, rim units, influence arcs and dial items were all tested before their paths were built.

## The class whose bound was wrong

Traversal chords are quadratic curves pulled toward the hub,
`src/components/story/orrery/render/geometry.ts:200 "const rc = Math.min(r1, r2) * 0.85 * Math.pow(1 - d / Math.PI, 1.6);"`.
Before the change the wheel skipped a chord when both of its ends lay off the same side of the cull
rect. A chord that dives inward can cross the rect with both ends outside it, so the bound was the
object's nominal extent, not the farthest point its stroke reaches, which is step 2 of the technique.
The lane dial had the other defect: it culled every item class but submitted every chord and
arrowhead at every zoom.

## Why it looked right at rest

The bake carries a wide margin,
`src/components/story/orrery/render/camera.ts:153 "The world region to draw, with an overscan margin so a pan can blit from a bitmap wider than the"`,
half the stage again (`src/components/story/orrery/render/engine.ts:56 "const OVERSCAN = 1.5;"`). That
margin absorbed nearly every curve the end test dropped: of 3,109 visible chords missing from the bake,
2 were on the stage at rest. The rest sat in the overscan band. That band is what the user sees during a
pan, until the re-bake 130 ms after the gesture stops
(`src/components/story/orrery/render/engine.ts:50 "export const SETTLE_MS = 130;"`). So the defect was
a pop at the edge that showed only while the camera moved, as the technique predicts. A screenshot
at rest could not have found it.

## The change

One predicate bounds the curve exactly, using both ends plus the turning point on each axis, padded
by the chord's own stroke:
`src/components/story/orrery/render/geometry.ts:147 "A chord dives toward the centre, so its two ends are not its bound: the curve can cross the rect"`.
The wheel computes the control point first and tests before appending to the bucketed path,
`src/components/story/orrery/render/drawRim.ts:52 "if (!chordTouchesRect(p1.x, p1.y, c.cx, c.cy, p2.x, p2.y, pad, rect)) continue;"`,
and the dial does the same, padding by its arrowhead,
`src/components/story/orrery/render/drawFlat.ts:165 "The arrowhead is the widest thing a chord draws, so it is the stroke pad the cull allows."`.

## The paired replay

Instrument: a replica of the shipped chord enumeration (same edge list, anchors and cap) checked
against the drawer's own chord count. The two matched on 589 of 589 cameras, which are fit plus zoom
2, 4, 8 and 16 at 49 centres each. Ground truth is 513 samples along each curve, padded by that chord's
stroke, against the baked rect including overscan; the wheel also skips samples under the opaque hub.

| | before | after |
| --- | --- | --- |
| wheel, visible chords missing from the bake (10,739-node document, 196 zoomed cameras) | 3,082 of 70,096 | 0 |
| wheel, the same on the two smaller documents | 27 | 0 |
| wheel, missing on the stage at rest | 2 | 0 |
| dial, chords submitted over 196 zoomed cameras (3,664 ink) | 12,936 | 3,788 |
| dial, chords submitted per camera at zoom 16 | 66 | 3.2 |

The floor held: 0 visible chords were lost in either view. The orrery suites ran 97 passed and 9
skipped, the same as before; the 9 need fixtures this checkout does not carry. `tsc --noEmit` was clean.
A third arm used the box of the control polygon, which is the easy conservative bound. It also reached
0 misses but submitted 33% more than ink at zoom 16 (1,649 against 1,238). The exact box submitted 2%
more. A mutation that drops the turning point fails two of the three new tests.

## What it cannot say

These are counts on a stub context, so no frame time on any device is behind them. The wheel's chord
opacity is read off the culled count,
`src/components/story/orrery/render/drawRim.ts:65 "const alpha = drawn > 600 ? 0.28 : 0.42;"`, so any
change to what the cull keeps can flip the tint of every chord on a camera whose count crosses 600.
That is a cull result deciding something other than what is drawn. It changes a style, not a rule of
play, and it was not measured here.
