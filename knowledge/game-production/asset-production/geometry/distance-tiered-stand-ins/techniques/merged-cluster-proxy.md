---
layer: technique
type: technique
subject: distance-tiered-stand-ins
technique: merged-cluster-proxy
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [a distant village or ruin of many distinct objects costs one draw per object however far each is reduced, a far area is unloaded and must still be visible, choosing between a card per object and one proxy per group]
---

# Merged cluster proxy

## The concern

A tier chain reduces each object independently. Far enough away, a group of distinct objects still
costs one draw, one material and one bounds test per member, whatever triangle count each member is
reduced to. A distant village of forty buildings is forty draws of almost nothing. The technique
replaces the whole group, past a distance, with one proxy: the members merged into one mesh,
simplified, and given one material baked from theirs. In an open world that streams in areas, the same
proxy keeps an unloaded area visible from far away. Engine documentation names both purposes: fewer
draws at distance, and something to show where the detailed content is not loaded.

## Procedure

1. **Group by what is seen together.** Group the members that sit inside one region of the world and
   leave the view together. Grouping by asset type merges a tower in one valley with a tower in the
   next, and the proxy then never fits in one view.
2. **Choose the proxy kind.**
   - Merge only, when the members are already light and the cost is the draw count.
   - Merge and simplify, when the merged mesh is still heavy. Simplify with the same care as a reduced
     tier, and look at the result from its switch distance.
   - Instances at their own last tier, when the members are many copies of one object, such as a stand
     of trees. One engine's layer type for exactly that case draws the copies' far tier as instances,
     and calls it the natural home for card stand-ins.
3. **Bake one material.** Merging many materials into one atlas is what turns many draws into one.
   Watch materials whose colour depends on world or object position. Merging such materials as if they
   were equivalent changes how they look, and one vendor's documentation names this as an artifact
   source.
4. **Fade the members out only behind a fully shown proxy.** The proxy appears first, and the members
   hide once it is complete. The reverse order leaves a frame with neither. One engine's visibility
   system builds this ordering in: a child hides only after its parent proxy has fully faded in.
5. **Check the openings.** Simplification and merge distance close small gaps. Doors, windows and
   arches that the silhouette relies on can fill in. Mark the closed openings, and look at them from
   the switch distance.
6. **Rebuild when a member changes.** A proxy baked before a member moved shows the old village. Tie
   the proxy's build to its members' content, so that a change in any member rebuilds the proxy.

## Decision rules

- **When the cost at distance is the draw count, merge.** When it is triangles, reduce. When it is
  both, merge and simplify.
- **When the group is many copies of one object, keep the copies as instances of their card.** Merging
  copies into one unique mesh throws away the instancing that already made them cheap.
- **When a member can move, break or be removed during play, keep it out of the proxy.** A static
  proxy cannot show a burnt barn. One engine generates proxies only from members marked static, and
  that restriction is the rule, not a limitation to work around.
- **When the proxy is the only thing visible of an unloaded area, it is the area's far view.** Accept
  it as a look from the far approach, not only as a cost saving.

## When not to use it

A small scene with few distinct objects has nothing to merge. A group the player is always near never
reaches the proxy's distance. Where the renderer already batches distinct static meshes cheaply, the
draw-count saving shrinks, and the proxy is kept only for unloaded areas.
