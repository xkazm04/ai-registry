---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: pack-existing-vs-smart-unwrap
status: forged
laws: [refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [consolidating several textured parts into one asset, choosing a UV layout mode, an unwrap destroyed usable seams]
---

# Pack existing versus fresh projection

Once the mesh has been reduced, the unwrap has two genuinely different modes and choosing
between them is not a matter of taste. **A fresh angle-based projection** invents seams
from scratch. **A re-pack** keeps the islands the source parts already had and only
rearranges them into one shared atlas. The wrong choice is not a worse layout — it is
destroyed information.

## The rule

**If the source carries usable authored coordinates, re-pack. If it does not, project.**

The reason is asymmetric value. Authored seams encode a decision about where a cut is
least visible: down the inside of an arm, along a costume line, behind an ear. An angle
threshold knows none of that; it knows curvature. So a projection over an authored layout
trades human or upstream-tool judgment for a geometric heuristic, permanently, and there
is no way to get it back short of re-authoring. A re-pack over a mesh with no coordinates,
by contrast, produces nothing at all — a failure that is loud and immediately visible.
One direction destroys silently, the other refuses. Bias towards the one that refuses.

## Why consolidation is the common case

The situation that forces the decision is joining several separately produced, separately
textured parts into a single asset. Each part arrives with its own layout occupying the
whole of the same normalised coordinate square. Joining them stacks those layouts on top
of one another: every island overlaps every other island, and the asset samples one
texture region for many surfaces. The mesh is correct, the shading is nonsense.

Re-packing is the fix. The islands are already good — they simply need to stop sharing
space. The packer scales and repositions them into a single atlas, preserving every seam
decision the parts arrived with. Re-projecting would also fix the overlap, and would throw
away every one of those decisions to do it.

## Procedure

1. **Detect authored coordinates on the input**, per part, before choosing a mode. This is
   a measurement of the incoming data; do not infer it from the file type or the producer.
2. **Default to projection only when nothing usable was found.** Make projection the
   fallback, not the default — an explicit default of "project" quietly overwrites
   authored work whenever a caller forgets to pass a mode.
3. **When a re-pack is requested and there is nothing to pack, fall back to projection and
   report the fallback with its reason.** The report states the mode that was *actually*
   used, which is not necessarily the mode that was *requested*. A caller who asked for a
   pack and silently received a projection will not find out until the texture looks wrong.
4. **Give the packer a margin proportional to the map size.** Islands packed flush bleed
   into each other under mip-mapping; the margin must survive down the mip chain, which
   makes it a function of the resolution the atlas will actually ship at.
5. **Keep parts that are textured independently out of the shared atlas.** Consolidation
   is not always right — a part with its own material and its own texture budget loses
   texel density when it is folded into a shared square.

## Decision rules

- **Authored layout present → re-pack.** The authored seams are better information than an
  angle limit will find.
- **No authored layout → project**, at the class-appropriate angle threshold.
- **Mixed input, some parts with layouts and some without** → project the bare parts
  individually first, then re-pack everything together. Do not re-project the parts that
  arrived with layouts in order to make the batch uniform.
- **The requested mode and the applied mode are separate reported fields.** They agree most
  of the time and the value of reporting them separately is entirely in the times they do
  not.
- **A re-pack does not fix a bad layout, it preserves one.** If the source's islands are
  themselves stretched or badly cut, packing them tidies the atlas and keeps the defect.
  That is a case for re-authoring the source, not for a projection.

## When not to use this

- **Before reduction.** Both modes belong after the topology is final; a layout packed
  against geometry that is about to be rebuilt is discarded work.
- **When each part will keep its own material.** The whole point of a shared atlas is one
  draw call and one texture set; an asset that is not consolidating materials gains
  nothing and loses density.
- **When a downstream tool requires a specific layout convention.** Some ingestion paths
  expect coordinates in a particular arrangement or a particular tile of the coordinate
  space; conform to that convention rather than optimising the packing against it, and
  convert back explicitly on the way out.
