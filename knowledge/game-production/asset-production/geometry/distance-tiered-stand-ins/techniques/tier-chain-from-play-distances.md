---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: tier-chain-from-play-distances
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity, a-budget-shapes-the-output]
shared_with: []
use_when: [setting where each level of detail of an asset class takes over, an asset class has generated reductions with default switch points, the same scene switches detail at different distances on two targets]
---

# A tier chain from play distances

## The concern

An asset class that will be seen across a long distance needs more than one representation, and each
representation needs a point at which it takes over. Engines will generate reductions and assign switch
points on their own. Left that way, the chain is decided by a default that knows nothing about where the
player stands. One engine's guide describes its automatic setting as dividing the screen evenly between
the tiers. With two tiers the full mesh holds until the object fills half the screen. The same guide
says this does not suit many scenes. The technique is to author the chain as a record per class, with
switch points derived from the play geometry and then converted into the unit the engine switches on.

## The record

One row per tier, in one place, read by both the import step and the gate:

| field | what it holds |
| --- | --- |
| stand-in | full mesh, reduced mesh, captured card, merged proxy, or culled |
| share | its triangle count as a share of the near tier, for reduced meshes |
| play distance | the distance from the play view at which it takes over, in world units |
| engine threshold | that distance converted, per target view, with the target named |
| band | the hysteresis margin or fade width at the switch |
| shadow | casts, casts a cheaper form, or does not cast past this tier |
| collision | which representation collision uses, stated even when it never changes |

The play distance is the authority and the threshold is derived from it
([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)). Someone who later tunes
the threshold by eye has changed a derived value, and the next conversion overwrites the change.

## Procedure

1. **Read the distances off the play geometry.** Use the rings where enemies spawn, the offset of the
   road from the tree line, the ridge the player crosses, or the distribution a play trace records. A
   tier boundary sits just past a distance where the player spends time, never on it. If the boundary
   sat on that distance, the switch would happen in the player's most frequent view.
2. **Convert per target.** Engines switch on projected size: a bounds diameter over the view, a
   screen-height percentage, or a screen-space error in pixels. For each target view, compute the
   threshold from the object's bounds and the projection. One engine scales its thresholds per platform
   for exactly this reason. Another states that field of view and resolution already move its switch
   points, so a wider view or a lower resolution switches sooner. A headset eye and a desktop view can
   place the same fraction about twice as far apart.
3. **Set the shares from the silhouette, not from a ratio table.** Halving is a starting point. A
   reduced tier is an instruction to the reducer
   ([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)), and a lean mesh asked
   for half its triangles loses its outline before it loses its cost. Look at each tier from its own
   switch distance.
4. **Give every switch a band.** Use a margin as hysteresis for an instant switch, or a cross-fade
   across a stated width. Instant switching with a margin is the cheapest. Fading through transparency
   costs blending and sorting, and dithering leaves a pattern and works best between two tiers.
5. **Decide shadow and collision per tier.** Collision often cannot follow the drawn tier at all. One
   engine binds complex collision to one chosen level for the mesh's whole life. Say which level, and
   make sure gameplay at distance does not depend on detail the collision level lacks.
6. **End the chain on purpose.** The last row is either a stand-in that holds to the horizon or a
   culled distance. A culled distance is a promise that nobody looks that far. Check the promise from
   the highest place the player can stand.

## Decision rules

- **When a threshold is stated only as a screen fraction, it has no basis.** Write the play distance
  and the target view beside it, or the next person cannot tell whether it is right.
- **When the same build ships to two views, store a threshold per view.** One threshold tuned on the
  developer's monitor is a threshold for the monitor.
- **When objects of one class differ greatly in size, choose the threshold unit with care.** A
  projected-size threshold already makes a small instance switch sooner than a large one at the same
  distance. A distance-pair system matches each object to the nearest size listed, without
  interpolation, and keeps the most aggressive distance when pairs overlap. Know which the engine does
  before writing pairs.
- **When an object is decisive for play, such as a cover wall or an objective, keep it out of the
  aggressive tiers.** Shave triangles from scenery, not from information.
- **When a generated reduction comes back, accept it like any delivered mesh.** It needs the same
  structural checks and its own look from its switch distance.

## When not to use it

In a level where walls always bound the view, the reachable distances are short, and one or two
tiers chosen by eye cost less than the record. On a renderer whose virtualized geometry path draws
dense static meshes without discrete tiers, the reduced-mesh rows collapse for eligible meshes. The
chain still applies to everything that path excludes, such as deforming, translucent and
vertex-animated meshes, and to the card and cull rows. On a fixed camera with a fixed view, the play
distance of each object is a constant, and the chain becomes a per-placement choice.
