---
layer: application
type: application
subject: render-mount-pipeline
technique: edge-sorted-incremental-mount
stack: java
status: forged
verified_on: 2026-09-14
verified_against: java@17
---

# IncrementalMountExtension and the gap worker

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`,
read from a local clone. The cursor algorithm is Java in
`litho-rendercore-incremental-mount/src/main/java/com/facebook/rendercore/incrementalmount/IncrementalMountExtension.java`;
the version witness is the root `build.gradle:129-130`
(`sourceCompatibilityVersion = JavaVersion.VERSION_17`). The premount scheduler
beside it, `IncrementalMountGapWorker.kt`, is Kotlin 1.9.22 and is cited in the
same module.

## Leaf granularity

`docs/deep-dive/incremental-mount.md:10-11`: "unlike Android's RecyclerView,
Incremental Mount operates on a view-by-view resolution, rather than entire list
items … when an individual view has exited the viewport, it will be unmounted
from the view hierarchy, even if its container is partially visible within the
viewport."

## Two sorted indices, two cursors

The input exposes `getOutputsOrderedByTopBounds()` and
`getOutputsOrderedByBottomBounds()` (`IncrementalMountExtension.java:494-496`).
`setupPreviousMountableOutputData` seeds `mPreviousTopsIndex` and
`mPreviousBottomsIndex` by binary search against the visible rect's bottom and
top (`:630-645`; searches at `:653-671` and `:673-691`).

`performIncrementalMount` (`:473-628`) walks only crossings. Top edge
(`:502-546`): advance the bottoms cursor while `localVisibleRect.top >=
bounds.bottom`, releasing (`:505-523`); walk it back while `top < bounds.bottom`,
acquiring only if `localVisibleRect.bottom >= bounds.top` — the "still in the
view port" check against the opposite edge (`:525-545`). Bottom edge
(`:550-592`) is the mirror, with the same opposite-edge check at `:560`.

## Reinitialise on the cross axis

`onVisibleBoundsChanged` (`:228-283`):

```java
// Horizontally scrolling or no visible rect. Can't incrementally mount.
if (state.mPreviousLocalVisibleRect.isEmpty()
    || localVisibleRect.isEmpty()
    || localVisibleRect.left != state.mPreviousLocalVisibleRect.left
    || localVisibleRect.right != state.mPreviousLocalVisibleRect.right) {
  initIncrementalMount(extensionState, localVisibleRect);
```

at `:268-273`; `initIncrementalMount` (`:415-440`) visits every output and reseeds.

## Nested hosts hear every step

`onMountItem` records units whose render unit hosts nested trees
(`:315-319`, keyed off `RenderUnit.doesMountRenderTreeHosts()` at
`RenderUnit.kt:181-191`). After each step, `:600-609` notifies each of them via
`recursivelyNotifyVisibleBoundsChanged`, skipping ids in
`mComponentIdsMountedInThisFrame`, which is cleared at `:611`.

## Exclusion

`ExcludeFromIncrementalMountBinder.java:25-30` is a no-op binder used only as a
marker: "If this is true then the Component will not be involved in Incremental
Mount." The window treats excluded outputs as always mountable (`:457`) and never
releases them (`:513`, `:581`).

## Idle premount and the release it suspends

`IncrementalMountGapWorker.kt`: on each frame callback it records the frame time
and posts itself (`:46-62`); `run()` premounts until
`latestFrameTimeNs + frameIntervalNs - deadlineBufferNs` (`:64-67`); the loop
checks `isTimeUp` between units (`:69-109`, `:179`). The frame interval is derived
from `display.refreshRate` with a 30 Hz floor and a 60 Hz fallback, computed once
because it "is very expensive (> 1ms)" (`:162-177`). The extension's
`premountNext` acquires one unit past the tops cursor, then past the bottoms
cursor (`IncrementalMountExtension.java:194-220`); `hasItemToMount` stays true
until `mPreviousTopsIndex` reaches the count and `mPreviousBottomsIndex` reaches
zero (`:183-192`) — premount walks to the whole tree.

The suspended release is the `!state.usesGapWorker` clause at `:461`, `:514` and
`:582`. With the gap worker on, the window acquires and never releases.

## Where the tree falls short

**The trade is not written at the switch.** `IncrementalMountExtensionConfigs.java:32`
(`useGapWorker = false`) carries no comment that turning it on stops unmounting;
the reader learns it from three conditions in two methods. **The buffer is a bare
constant.** `gapWorkerDeadlineBufferMs = 4L` (`:34`) has no derivation beside it;
the interval next to it is derived from the display, the margin inside it is not.
