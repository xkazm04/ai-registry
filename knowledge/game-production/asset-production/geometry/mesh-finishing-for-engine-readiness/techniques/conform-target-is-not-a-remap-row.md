---
layer: technique
type: technique
subject: mesh-finishing-for-engine-readiness
technique: conform-target-is-not-a-remap-row
status: forged
laws: [declaring-an-input-is-not-consuming-it, compiling-is-not-wiring, structural-proof-is-never-sufficient]
shared_with: []
use_when: [choosing a target skeleton for a generated character, a preset list mixes auto-rigged and template-conformed targets, a target skeleton's bone mapping table is empty, deciding whether a generated mesh is the shipped topology or a shape reference]
---

# A conform target is not a row in the remap table

Two different operations are both described as "choosing a target skeleton", and a preset
list that holds them in one table cannot state what either of them owes.

A **remap target** is reached by binding the generated mesh and mapping a source
skeleton's bone names onto the target's. It owes a mapping table, and that table owes
totality over the target's declared chains — the concern of
[rig-preset-and-bone-remap-binding](./rig-preset-and-bone-remap-binding.md), which names
this path and excludes the other one in a single line.

A **conform target** is reached the opposite way round. An already-rigged template is
deformed until it matches the generated mesh's proportions, and the shipped asset is the
template: its topology, its texture coordinates, its skeleton and its skin weights. The
generated mesh is never the delivered geometry at all. It is a **shape reference**, and
its detail reaches the asset as a bake, not as vertices.

## The empty field means opposite things on the two rows

A conform target has no bone mapping table, and that is not an omission — there is no
source skeleton to map *from*. The template's joints and skin weights are generated to
fit the reference, so the mapping step has no operands.

Which produces the defect this technique exists to prevent. Put both kinds of target in
one preset list with one `mapping` field and an empty table now means two irreconcilable
things:

- on a remap row, **not authored yet** — a hard failure, a limb that will not move,
  something to report as an unmapped set and route to a manual path;
- on a conform row, **not applicable, by construction** — the correct and final state.

No totality check can tell them apart, because the discriminator is not in the data. And
the field will be read by something eventually: a renderer that hides an empty mapping
section, a test that derives its fixtures by flattening every preset's rows, a report that
counts mapped bones. Each of those treats the conform row as a remap row with nothing in
it, and the one target that can never have a mapping is the one that displays no mapping
problem.

State the kind on the row. It is one enumerated field, it is knowable when the preset is
authored, and every check downstream branches on it instead of guessing from an absence.

## A conform target owes a different verification, not none

The temptation after separating the two is to treat the conform row as the easy one —
nothing to map, nothing to verify. It has a verification, and it is sharper than the
mapping check because it is easy to lose silently.

The conform path's whole promise is **inheritance**: because the template's joint
hierarchy is preserved, the conformed character stays compatible with animation libraries
and retargeting assets authored against that template. That promise holds only while the
joints are genuinely inherited. Where the tool offers to *estimate* joint positions from
the source mesh instead — a setting that exists because it fits an unusual body better —
the hierarchy survives and the joint **orientations** do not, and orientation is what a
retarget reads. The asset then conforms beautifully, binds cleanly, plays its own test
clip, and fails against the library it was chosen for.

So the conform row's check is orientation conformance to the template, not totality of a
mapping. Record which mode produced the rig, because the two modes are indistinguishable
in the output's bone list.

## What else the asset inherits, and what that costs

Everything the template carries arrives with it, including the parts nobody chose:

- **The texture layout is the template's.** It was authored for the template's material
  split — commonly head and body as separate regions — so it can be a multi-tile layout
  where a single-tile baker expects one square. Separate the regions and move them into
  one space *before* the bake, or the bake writes into coordinates the downstream engine
  will not sample.
- **The conform fits a surface, so everything on the surface becomes surface.** Clothing,
  accessories and hair on the reference are read as body shape and deform the template
  into their silhouette. Strip the reference to the body before conforming, and bring the
  garments back afterwards as their own meshes weighted from the conformed body.
- **The skin weights are the template's, and they are better than a solve.** This is the
  reason to prefer the path at all, and it extends past the body: a garment aligned to the
  conformed body takes its weights by transfer from that body rather than from bone
  proximity, because the template's weights were authored against the exact skeleton that
  will drive them.

## Procedure

1. **Decide which kind of target the asset class wants**, and record it on the preset row
   as an enumerated field. A class needing facial performance from an existing animation
   library wants a conform target; a class needing a cheap skeleton for clips authored
   in-house is a remap target.
2. **Branch every check on that field.** A remap row is checked for mapping totality over
   its declared chains. A conform row is checked for the inheritance mode that produced
   its joints. Neither check may be run against the other kind and reported as a pass.
3. **Refuse to derive the target's shape from the preset's own summary fields.** A
   declared bone count, a finger flag and a face flag describe the *named* skeleton. What
   a builder actually emits is a separate fact, and the two diverge quietly whenever the
   builder constructs an armature from the preset's chain endpoints rather than from the
   skeleton itself.
4. **On the conform path, prepare the reference before conforming** — body only, assembled
   and proportioned, with colour differences between separately generated parts corrected
   while they are still shader-side.
5. **Conform, then unpack the inherited texture layout**, then bake the reference's detail
   onto the template's coordinates.
6. **Weight the added meshes by transfer from the conformed body**, not by an automatic
   solve, and give anything rigid a single-bone binding.
7. **Play real animation from the library the target was chosen for.** Not a clip authored
   beside the asset — the library whose compatibility was the reason to conform.

## Decision rules

- **The kind of target is a declared field, never an inference from an empty mapping.**
  An absence is the one thing both kinds produce.
- **A conform target inverts the bench's order and that is legitimate.** The finishing
  order exists because the shipped mesh is derived from the generated one; on this path
  nothing is reduced, the coordinates were authored before the run, and the binding
  arrives first because it arrived with the template.
- **The generated mesh's quality bar changes with the path.** As a shape reference it is
  judged on proportion and silhouette, and its topology, texture coordinates and shell
  count stop mattering — the acceptance criteria that would condemn it as a shipped asset
  are measuring something the path never uses.
- **Inheritance is a claim about compatibility and it decays.** A template updated
  upstream makes an inherited rig's guarantees a statement about the version it was
  conformed from. Record that version with the asset.
- **When the target has no template for the asset's shape, this path is not available.**
  Conform interpolates a template; it does not invent one.

## When not to use this

- **When the asset does not deform.** Props take no skeleton and no template.
- **When no rigged template exists for the asset class.** The whole path is the template's
  existence; without one there is nothing to deform and the remap path is the only path.
- **When the generated mesh IS the deliverable** — because its exact topology, its authored
  silhouette or its shell structure is what was bought. Conforming replaces it with the
  template's geometry, which is the point of the path and a loss if that geometry was the
  product.
- **As a repair for a mesh that failed structural acceptance.** A reference is judged on
  proportion, so a defective mesh can be a perfectly good reference — but that is a reason
  to re-route it, not a reason to call the defect fixed. Nothing about conforming removes
  a floater from the mesh it ignored.
