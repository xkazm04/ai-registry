---
layer: application
type: application
subject: distance-tiered-stand-ins
technique: visible-count-per-distance-band
stack: cpp
status: forged
verified_on: 2026-11-11
---

# A visible near-tier triangle sum, labelled as an estimate

Source tree: mage-arena (public, github.com/xkazm04/mage-arena), `master` at `579737e`, read on
2026-11-11 from a checkout whose cited files were clean. Two captures, a greybox budget capture and a
stress run, share one function that sums triangles over everything in the view. No C++ standard is
pinned in the tree, so this document carries no version witness.

## What it counts, stated where it is declared

The function's own header says what the technique asks an instrument to say. It counts the near tier
for every visible static mesh, instance and skinned mesh whose bounds touch the view volume. It tests
no occlusion, and it calls itself an estimate:

apps/vr/Game/Source/MageArenaVR/Greybox/VisibleLod0.h:13 "whose bounds touch the view"
apps/vr/Game/Source/MageArenaVR/Greybox/VisibleLod0.h:14 "No occlusion and no GPU culling: an estimate, not a counter"

Instances are tested one by one against the view volume by their world bounds, not their origins. That
is the bounds rule in the technique's binning step:

apps/vr/Game/Source/MageArenaVR/Greybox/VisibleLod0.cpp:88 "const FBoxSphereBounds WorldBounds = Mesh->GetBounds().TransformBy(InstanceTransform);"
apps/vr/Game/Source/MageArenaVR/Greybox/VisibleLod0.cpp:89 "if (Frustum.IntersectBox(WorldBounds.Origin, WorldBounds.BoxExtent))"

## The near-tier ceiling, pinned on purpose

A test forces a creature to draw its second reduction and asserts that the figure does not move. That
pins the instrument as the chain-less ceiling the technique describes:

apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:94 "A drawn LOD does not change the figure: it is the LOD0 estimate whatever the screen size picks."
apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:96 "a forced LOD still counts LOD0"

That is the honest half. The ceiling is stable across threshold tuning, and it is labelled.

## A card crowd that the count prices at two triangles each

The arena's spectators are a set of single-angle cards drawn as one instanced component. They are the
technique's bounded-view case, because the audience is seen from a seated position that never circles
it:

apps/vr/Game/Source/MageArenaVR/Greybox/ArenaStands.h:43 "all drawn by ONE instanced component of one quad (the engine's 1 m plane), so the whole crowd is one draw per pass."

Because each card has only one tier, the near-tier sum is also its drawn cost. For the crowd, the
ceiling and the bill coincide.

## Confirmed, deviations

**Confirmed:**
- The visible count over bounds is the measured quantity.
- The instrument's scope is stated where it is declared.
- The ceiling is pinned against tier changes, so it stays a stable reference.

**Deviations:**
- *No drawn-tier bill.* The creature chain in the same tree halves and then quarters the triangles past
  its rings, and this instrument cannot show that saving. The capture needs a second sum that reads the
  tier each component actually drew, or applies the recorded chain to each instance's measured
  distance. The difference between the two sums is what justifies the chain.
- *No bands.* The sum is one number per view. Binning by the chain's switch distances would show which
  band carries the bill.
- *No proof of input.* The function returns triangles only. A capture whose world had not loaded
  returns zero, the same as an empty view. Returning the number of instances walked beside the
  triangles closes that gap. This is the bundle's law that an instrument proves it had input.
