---
layer: golden-path
type: golden-path
subject: distance-tiered-stand-ins
status: forged
use_when: [an open or long-sightline scene shows hundreds of repeated objects and nothing occludes them, setting where each level of detail of an asset class takes over, deciding whether a far object becomes a reduced mesh a captured card or a merged proxy, grass or rocks end at a visible line or pop as the camera moves]
techniques:
  - tier-chain-from-play-distances
  - visible-count-per-distance-band
  - multi-angle-card-stand-in
  - merged-cluster-proxy
  - ground-detail-falloff
  - haze-set-before-the-tiers
---

# Distance-tiered stand-ins

An enclosed level is budgeted by what a room can hold, because walls stop the eye and the renderer
discards what they hide. An open level has no walls. From a ridge the player sees the whole valley,
and every tree, rock and fence post in it is on screen at once. There, the budget is not what a room
holds. It is the number of instances visible from the play view, multiplied by what each one costs at
the distance it stands. This subject is the craft of making that product affordable without the player
seeing how: a chain of stand-ins per asset class. A full mesh near the camera, reduced meshes further
out, a card captured from many angles or a merged proxy beyond them, and nothing at all past the last
distance anyone can see.

The naive reading is that a class has one budget. A tree is allowed so many triangles, the tree passes,
and a forest of passing trees is assumed to fit. It does not, because one budget per class prices the
nearest tree and the farthest tree identically, and in an open scene the far trees outnumber the near
ones by orders of magnitude. The second naive reading is that levels of detail are the engine's
business: generate a few reductions on import and let the defaults pick. Every major engine's own
documentation says otherwise. The defaults divide the screen evenly between tiers, which one vendor's
guide calls unsuitable for many scenes. They switch on projected size, so the same setting lands at a
different distance on every target. And their last tier is either a culled gap or whatever the author
supplied. The tiers are authored assets with authored switch points, and that makes them this pipeline's
work.

## The budget is a chain, and the chain is per class

A class budget extended across distance is a short table. Each tier carries the stand-in that draws it,
its share of the near tier's triangles, the distance at which it takes over, whether it casts a dynamic
shadow, and what collision it presents (tier-chain-from-play-distances). Three things make the table
defensible.

The switch points are decided where the player is. They come from the play geometry, such as spawn
rings, the road's offset from the tree line, or the ridge's view, and not from a round fraction of the
screen. Then they are converted to the engine's unit. Every engine selects a tier by projected size: a
bounds diameter over the view, a screen-height percentage, or a screen-space error in pixels. That is
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis) in its
plainest form. A threshold written as a fraction of the screen moves when the field of view or the
resolution moves. One engine's guide says so directly: a wider field of view or a lower resolution
switches sooner. A headset's eye and a desktop's ninety-degree view put the same fraction at roughly
twice the distance apart. So the record holds both the play distance and the converted threshold per
target.

Every switch has a band, not a line. A threshold the camera can hover on flickers. A margin used as
hysteresis, or a cross-fade across a stated width, is part of the tier, and a fade has a cost of its
own. Engines blend through transparency or dither, and dither works best between two tiers.

Shadow and collision are separate decisions. One engine binds complex collision to a single chosen
level for the mesh's whole life: it does not change when the drawn tier does. A far tier that still
casts a full shadow has saved less than its triangle share suggests.

## The visible count is the budget when nothing occludes

The quantity to measure is the count of instances visible from the play view, per distance band
(visible-count-per-distance-band). Multiply each band's count by the cost of the tier that draws it, and
the sum is the frame's geometry bill for that class. Two consequences follow. The near tier needs a cap
by count as well as by distance, which is why one engine's terrain system exposes a maximum number of
trees drawn as full meshes beside the distance at which billboards begin. And an instrument that counts
the near tier for every visible instance is measuring the chain-less ceiling. That is a legitimate
estimate when it is labelled as one, but it cannot show what the chain saved. A gate built on it will
never credit a tier.

## What stands in, and when

Two kinds of stand-in exist past the reduced meshes, and choosing between them is the subject's central
decision.

A captured card replaces one repeated object (multi-angle-card-stand-in). The object is rendered from
many directions into a grid of frames. Each frame stores colour, normal and depth, and the card blends
the frames nearest the view. Its capture layout follows how the player can look. A full sphere suits
objects seen from above and below. An upper hemisphere spends nothing on views from under the ground.
A few fixed cards suit objects seen only from the side. More frames mean less resolution per frame, so
the count is a trade, not a quality knob. A single-angle card is enough only where the view direction
is bounded, such as a seated audience seen from a fixed arena. Elsewhere it shows its flatness the moment
the camera circles.

A merged proxy replaces a cluster of different objects (merged-cluster-proxy). Past a distance, a
village of distinct buildings still costs one draw per building however far each is reduced. A single
simplified mesh with one baked material stands in for the whole group. It hides its members only after
it is fully shown, so the swap never leaves a hole. It suits static objects, and its merge distance can
seal doors and windows that the near view relies on.

The rule that picks between them is what repeats. Many copies of one object call for a card per copy.
A cluster of different objects calls for one proxy per cluster. A cluster of many copies may want both:
cards for the copies, merged into the cluster's proxy.

## Ground detail falls off, it does not end

Grass, pebbles and flowers are the extreme case: tiny, countless, and individually worthless at
distance. They thin across a band, with each instance faded by its distance between a start and an end,
instead of stopping at a radius where a green carpet meets bare ground (ground-detail-falloff). Culling
a whole cluster at once makes groups vanish together, which one engine's documentation warns about in
those words. A density lever lets a quality tier plant fewer, but detail the game reads, such as cover,
a trail marker or a harvestable plant, is exempt from that lever. The ground beneath must carry the
colour the detail gave it, so that where detail stops the field still reads as grass.

## Haze is a look first and a budget lever second

Fog fades distant objects toward one colour. That hides switches and lowers what the far tiers must
carry, so it is tempting to reach for it as an optimisation (haze-set-before-the-tiers). It is a look
decision before it is a budget lever. Tier distances tuned under one haze are wrong under another. A
look round that changes haze also changes the light and the skyline that every judge of the frame is
reading. Fix haze first, tune the tiers under it, and treat any later haze change as re-opening both.
Haze added only to hide a tier the chain is missing is a defect wearing an atmosphere.

## Failure modes of the naive reading

- **One number per class.** The near tree and the thousandth tree priced the same, and the forest
  overruns while every tree passes.
- **Thresholds written as screen fractions and nothing else.** Tuned on a desktop, they switch at half
  the intended distance in a headset, or at twice it, and nobody can say which number was meant.
- **Even division by default.** The engine splits the screen equally between tiers, and a far tier
  takes over close enough to see.
- **A hard line.** No hysteresis and no fade: a tier flickers at its boundary, or grass ends in a
  circle that follows the player.
- **A flat card where the camera circles.** One angle, seen from the side, reads as cardboard.
- **A gate that counts the near tier everywhere.** The chain saves real cost and the instrument never
  shows it, so the next budget round removes the chain as ineffective.
- **Haze as the fix.** The far tier is missing, fog covers it, and the next look round removes the fog.

## Boundaries

This subject owns what stands in for an object at distance and the budget that decides it: which tiers
an asset class has, what each tier is, where it takes over, and what the frame's geometry bill is when
nothing occludes. Neighbours own the rest. The near tier's own ceiling, and the unit it is counted in,
belong to the class poly budgeting subject; this subject extends that budget across distance and never
restates it. What the render thread is handed each frame, including culling objects outside the view
before submission, belongs to the render submission subject. The rule for picking is that this subject
decides which stand-in exists and when it takes over, and submission decides how it is submitted.
Whether an impostor reads correctly in the judged look, at the distances a play trace records, belongs
to the concept scene parity subject. The atlas margins that keep a captured card's frames from bleeding
into each other at reduced mip levels belong to sprite and atlas production. How a tiling surface holds
up as it recedes belongs to tiling texture acceptance. Accepting generated ground belongs to terrain
synthesis acceptance, which disowns density and streaming. This subject takes density only as falloff
with distance, and streaming stays out of both.

[a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output) applies here too. A reduced
tier commissioned at a share of the near tier is an instruction to the reducer, and a reduction asked
for half the triangles of a mesh that is already lean returns a broken silhouette, not a cheaper one.
[unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) applies to every tier. A card
nobody looked at from its switch distance has not passed because the mesh it came from did.
