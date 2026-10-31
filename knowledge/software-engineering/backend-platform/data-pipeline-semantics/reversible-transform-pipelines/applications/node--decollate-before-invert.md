---
layer: application
type: application
subject: reversible-transform-pipelines
technique: decollate-before-invert
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A mesh split that re-centred its parts and kept no record of the group

The stack version comes from the tree's own `@types/node ^24.13.3` (package.json, pof at
commit `e8fb13de`). The seam is in xkazm04/pof, a public Next.js game-production studio.
Its mesh-split lane is a Node module that drives a headless Blender script.

## The collation nobody called a batch

An image-to-3D generator charges per job, not per object. So pof asks one job for a
small group of simple props (a well, a lamp post, two barrels) and separates them
afterwards. That is a batch in everything but name. The instances are stacked into
one delivery because the paid call is cheaper that way, and the generator applies one
forward transform to the whole stack: it normalises the group's longest extent to
about 1 m. The split is the decollation. Blender's loose-part separate produces one
object per prop, and each is exported as its own GLB.

Before this change the split wrote no journal. Each part was re-centred to the origin
and named `<prefix>_NN` by face-count rank. The group's extents were never recorded,
and neither was where each part had sat. Downstream, the world-scale grader treats each
file as an instance on its own. That breaks the two rules the technique gives for
decollation:

- **The inverse needs the batch's parameter, per instance.** All four parts share the
  group's one scale factor. A barrel cut from the group measures 0.22 m in group units.
  That is not a real size, and it is not the ~1 m box the grader recognises as
  generator-normalised either. So the "real-world size is unknown" warning, which fires
  for an unsplit delivery, went quiet for every part.
- **Position is not identity.** Face-count rank is a collation artifact. In the measured
  group the rank order was well, barrel B, barrel A, lamp post, while the reference
  image's order was well, lamp post, barrel A, barrel B. The two barrels have identical
  extents, so once both were re-centred nothing could tell them apart.

## What changed

The script now reads each part's bounding box before it re-centres it. It reports the
group's extents once, as `scripts/visual-gen/pof_mesh_split.py:152 "xyz(group_extents)"`,
and adds each part's extents and group-frame centre to its PART line, read at
`scripts/visual-gen/pof_mesh_split.py:211 "extents, origin = world_box(o)"`. The parser
picks the frame up at `src/lib/visual-gen/mesh-split.ts:176 "const groupExtents = parseXyz("`.
A pure helper, `src/lib/visual-gen/mesh-split.ts:227 "export function rescaleSplitGroup("`,
takes one known prop size and returns every part's size from the shared scale. It refuses
when the known part or any measurement is missing, so it never guesses a scale. A
four-field PART line from an older script still parses, with no frame invented.

## Proof

A paired A/B on one input. Four props were built in Blender at known sizes (1.2, 3.0,
0.9 and 0.9 m), normalised as a group to a 1 m longest extent, and passed through the
real split script, once as it was on `origin/master` (A) and once patched (B). pof's own
`world-scale.ts` graded both arms. The operator was given exactly one known size: the
well is 1.2 m. n = 4 parts.

| Measure (target) | A | B |
| --- | --- | --- |
| parts sized correctly within the grader's 10% tolerance | 1/4 | 4/4 |
| parts that keep the unit-box warning | 0/4 | 4/4 |
| parts matched to their prop in the reference image | 2/4 (by rank) | 4/4 (by origin) |

Floor: the exported geometry is identical across arms (every part's extents and centre
agree to 1e-6), and part names, face counts and coverage are unchanged. The visual-gen
and API suites (2,226 tests), lint and the type check stayed green.

The group was built from primitives, not from a generator delivery. Its sizes had to be
known for the size measure to mean anything. The split script and the grader are the
production code.

## What the realization cannot do

The asset viewer opens a bare GLB and has no record of which pipeline stage made it, so
the group frame does not reach it. A split part opened there still reads as a 0.22 m
object. Carrying the frame that far would take a sidecar beside each part, and that is
not built. The frame also says nothing about rotation. A generator that tilts the group
leaves every part's extents measured on tilted axes, and the shared scale does not
correct that.
