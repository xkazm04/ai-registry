---
layer: application
type: application
subject: distance-tiered-stand-ins
technique: tier-chain-from-play-distances
stack: cpp
status: forged
verified_on: 2026-11-11
---

# A creature cast's LOD chain, set from the spawn rings and converted per view

Source tree: mage-arena (public, github.com/xkazm04/mage-arena), `master` at `579737e`, read on
2026-11-11 from a checkout whose cited files were clean. The VR app is an Unreal Engine project for
a seated standalone headset, with a desktop core used for captures. The arena is closed, not an open
vista, so this realizes the chain on a creature class at short range. The open-terrain case still has
no tree in the fleet. No C++ standard is pinned in the tree, so this document carries no version
witness.

## The chain is a record with play distances, shares and a shadow policy

The creature budget is one struct whose defaults are the policy. Its two generated tiers carry a
distance in metres and a triangle share:

apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:163 "double Lod1DistanceM = 12.0;"
apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:164 "double Lod1TriangleShare = 0.5;"
apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:165 "double Lod2DistanceM = 20.0;"
apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:166 "double Lod2TriangleShare = 0.25;"

The shadow row sits in the same record, as a distance past which no dynamic shadow is cast, with zero
meaning "at any distance":

apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:159 "double ShadowMaxDistanceM = 0.0;"

## The distances come from the play geometry, and a test pins them there

The switch points are not screen fractions picked by eye. A test reads them against the arena's spawn
rings and requires each boundary to sit past a ring rather than on it. That is the technique's first
procedural step, enforced:

apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:175 "constexpr double NearRingM = 8.0;"
apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:176 "constexpr double FarRingM = 15.0;"
apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:177 "LOD1 takes over past the near ring"
apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:178 "LOD2 takes over past the far ring"

A creature at the near ring keeps its full mesh and its shadow:

apps/vr/Game/Source/MageArenaVR/Tests/CreatureBudgetTests.cpp:184 "a near-ring creature casts its shadow"

## The conversion to the engine's unit is a named function, per view

The engine switches on screen size, the bounds sphere's diameter over the view. The tree converts its
metres into that unit in one function, with the headset's projection as the default:

apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:183 "The engine's screen size (ComputeBoundsScreenSize: the bounds sphere's diameter over the view) at DistanceM."
apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.cpp:314 "return 2.0 * ScreenMultiple * SphereRadiusCm / FMath::Max(1.0, DistanceM * 100.0);"

The header states the per-view consequence that the technique's conversion step exists for:

apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.h:180 "so a desktop LOD switch lands at about twice the Quest distance."

The generated tiers take their threshold from that function and their reduction from the share:

apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.cpp:494 "Info.ScreenSize = FPerPlatformFloat(static_cast<float>(ScreenSizeAt(Radius, Distances[Index])));"
apps/vr/Game/Source/MageArenaVR/Greybox/CreatureImport.cpp:496 "Info.ReductionSettings.NumOfTrianglesPercentage = static_cast<float>(Shares[Index]);"

## Confirmed, deviations, and what an open scene would add

**Confirmed:**
- The play distance is the authority, and the threshold is derived from it.
- The shares and the shadow policy live in the same record.
- A test holds each boundary just past a distance where play happens.

**Deviation:** the threshold is written into the engine's per-platform slot with the headset value
only. The header knows the desktop view switches at about twice the distance, but the record stores
one converted value, so the desktop capture sees the tiers late. The technique asks for a threshold
per target view. The per-platform slot this code already fills is where the second value belongs.

**Not covered:**
- No hysteresis band or fade width is declared. The engine's default instant switch applies.
- No collision row exists. Creatures are skinned, and collision is not derived from the drawn tier
  here, so the row would only state that.
- No last row: the chain ends at its second reduction, with no card and no cull distance. In a closed
  arena that is a fair promise.

**First place to apply the vista case:** the source lead's return clause. A wired project opens an
open-terrain or long-sightline scene, and repeated scenery there needs the card and cull rows this
chain does not have.
