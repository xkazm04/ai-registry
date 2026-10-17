---
layer: technique
type: technique
subject: standalone-headset-frame-budgets
technique: stereo-draw-call-budget
status: draft
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input, a-budget-shapes-the-output]
shared_with: []
use_when: [counting draw calls for a two-eye render, draw calls doubled when stereo rendering was enabled, deciding what to batch for a multi-view render, a draw-call cap does not say whether a draw counts once or once per eye]
---

# Stereo draw call budget

The named concern: a headset renders two views, and a draw-call cap that does not say how it
counts them is two different caps. One reader counts a draw once; another counts it per eye
and finds the scene at twice its limit. The answer depends on the stereo path, and the cap is
only checkable once it names the path and the side of the frame it counts.

## When counting draw calls for a two-eye render, count submissions once per frame on a multi-view path and once per view on a multi-pass path, and count GPU work per view on both, because multi-view shares submission and not shading

On a multi-view or single-pass instanced path, the CPU issues each draw once, culling is
shared, and the GPU runs vertex and pixel work for each view from that one submission. On a
multi-pass path, each view is a separate pass, and every draw is submitted per eye. So:

- **The submission budget**, which binds the render thread, counts a draw **once** on a
  multi-view path and **once per eye** on a multi-pass path.
- **The GPU budget** counts vertices and pixels **per eye** on every path.

The cap is written with its path, its side and its unit, for example "submissions per frame,
multi-view" and "triangles per eye". A cap with none of those is incomplete, not generous.
Triangle totals come from [asset-class poly budgeting](../../../../asset-production/geometry/asset-class-poly-budgeting/asset-class-poly-budgeting.md);
this technique only says they are rendered once per view.

## When draw calls doubled when stereo rendering was enabled, check which path is actually running before cutting content, because a silent fall back to multi-pass doubles submission with no change to the scene

An engine may fall back to multi-pass for a material, a shader or a whole build when
something in it is not multi-view safe. Confirm on the device which path ran, and count the
draws the profiler saw, before trusting a desk count. A capture that does not show the stereo
path did not prove which budget it met.

## When deciding what to batch for a multi-view render, batch to cut submissions and state changes, because multi-view already halved the per-eye repeat and batching is what is left

Instancing repeated meshes, merging static geometry that shares a material, and sharing
texture atlases cut submissions on both paths. How to regroup draws without a visible change
in order belongs to the render submission economy subject. A draw-call figure from a desk
capture is a work count under
[host-independent work counts](../../../../engine-integration/perf-regression-gating/techniques/host-independent-work-counts.md),
valid as a count and silent about the device's frame time.

## Decision rules

- **When a mono layer is drawn for distant content, count it separately**; content crossing
  the split is drawn in both and counts twice.
- **When shadows are rendered, count their passes in the submission budget**; multi-view
  shares them, a multi-pass path may not.
- **When a cap is inherited from a consumer's plan with no path named, ask the path** before
  reading it either way.

## When not to use it

For a single-view preview of a headset scene on a flat display, the per-eye rule is moot.
It binds wherever two views are rendered.
