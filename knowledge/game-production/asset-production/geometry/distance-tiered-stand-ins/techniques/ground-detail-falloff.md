---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: ground-detail-falloff
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [grass or pebbles end in a visible ring around the player, ground detail pops in groups as the camera moves, setting quality tiers for scattered ground detail, a scatter density overruns the frame on a wide view]
---

# Ground detail falloff

## The concern

Grass, small stones, flowers and debris are the extreme case of a repeated object. They are tiny,
numbered in the tens of thousands, and individually worth nothing at distance. They get no tier chain;
past a short distance they simply stop. How they stop is the whole craft. A hard radius draws a ring
of green carpet that follows the player across bare ground. Detail culled a cluster at a time makes
whole patches vanish together. One engine's documentation warns of exactly this: groups of meshes
disappear abruptly as a whole cluster leaves the range. The technique is to thin the detail across a
band, fade each instance by its own distance, and let the ground beneath carry the read where the
detail stops.

## Procedure

1. **Declare two distances, not one.** One is where fading starts. The other is where the last
   instance is gone. Engines expose this pair directly: a start and an end cull distance, with a
   per-instance fade amount running from one at the start to zero at the end, which the material reads.
   State both in world units, with the play view they were tuned from
   ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
2. **Fade the instance, not the cluster.** Use the per-instance amount to shrink, sink or dissolve each
   blade. A cluster-level cut is acceptable only when it falls beyond the end distance, where nothing
   visible is left to pop.
3. **Paint the ground to match.** Where detail ends, the terrain's own surface must already show the
   colour and value the detail gave it, so the field still reads as grass at distance. Tune the ground
   colour with the detail turned off, from the far view.
4. **Separate density from distance.** Density is instances per unit of area. Distance is how far they
   reach. A quality tier lowers density through a lever that engines expose for scalability. Lowering
   density thins the near field evenly, while shortening distance moves the ring closer. These are
   different looks, so choose which one each tier gives up.
5. **Exempt what gameplay reads.** Cover that hides a crouching player, a trail marker, a plant that
   can be harvested, and grass that conceals a pickup all stay at full density and full reach on every
   tier. One engine's density lever can be switched off per type for this reason. A quality setting
   must not change what the player can see.
6. **Turn off costly per-instance effects at distance.** Wind sway and vertex animation cost the most
   per instance and show the least at distance. Disable them past a stated distance, inside the fade
   band, before the instance itself fades.

## Decision rules

- **When a ring follows the player, the band is too narrow or the ground too different.** Widen the
  fade, then fix the ground colour. Do not push the end distance out, because that only moves the ring.
- **When patches pop together, the cut is per cluster inside the visible range.** Move it past the end
  distance, or fade per instance.
- **When density is the lever, measure the frame on the widest view.** Scattered detail scales with the
  visible ground area, and a ridge-top view can hold several times the instances of the valley floor.
- **When a distance must hold on every target, it is gameplay.** Move that detail out of the scatter
  system and treat it as placed objects with a tier chain of their own.

## When not to use it

On a fixed or top-down camera that never sees more than a short distance, ground detail never reaches
a falloff distance, and a flat density is enough. Where ground detail is painted into the terrain
texture and never scattered as instances, there is nothing to fade. That surface's distance behaviour
is a tiling and texture concern.
