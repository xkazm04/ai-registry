---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: posed-see-through-render
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding whether a rigged generated character can be looked at from every angle without showing its inside, a generated mesh assembled from many loose shells is about to be animated, a structural card says the mesh is fine and the engine shows holes, choosing between a backing body and a regeneration]
---

# Posed see-through render

A **rendered visibility test** for a rigged generated mesh. It asks one question the
structural card cannot ask: *can a viewer see into the inside of a shell from any reasonable
camera, in any reasonable pose?* The golden path already says that occlusion between shells
needs rendering, because adjacency operators only find welded interior. This technique
answers the mirror-image question: an inside that is exposed, not one that is hidden.

The defect is common in generated characters for a structural reason. The generator emits
armour plates, cloth strips and hair as separate open sheets that touch at rest and part
under deformation. A real character has a body under its armour. A generated one usually
has nothing there, so a gap opens straight onto the inside of the plate behind it, or onto
the sky.

## The predicate

Shade every face unlit, **front faces one colour and back faces another**. Render on a
transparent film. From outside a closed surface no back face can ever be seen, so every
back-face pixel is a view into the inside of a shell. That pixel comes from a gap between
sheets, an open boundary, or a face whose winding points inward. The count is the
back-face share of the silhouette.

Two things this predicate does well:

- **It matches what the engine does.** Real-time materials are single-sided by default, so a
  back face is culled and the pixel shows whatever lies behind it. That is a literal hole in
  the shipped character. The rendered share is a direct estimate of how much of the
  silhouette the player sees through.
- **It needs no model.** It is a material and a pixel count, and it runs headless in the
  same tool that rigged the mesh.

Background pixels enclosed by the silhouette are a second, **ambiguous** count: an arm
resting on a hip also encloses background. Report them separately, never added to the
back-face share.

## Rest first, then poses, and the poses need a floor

1. **Render the rest pose from six cameras** (four sides and two raised three-quarter views).
   This alone catches inverted winding, which no amount of posing improves. Measured on four
   finished generated heroes from one pipeline, two showed 32-42% of the silhouette as back
   faces at rest, in large patches. Their structural cards did not stop them. A winding-
   consistency flag answers whether neighbours agree, not whether the surface faces out.
2. **Then sweep poses, and score each view against a closed copy of the same mesh in the same
   pose.** Build the copy by voxel-remeshing the rest mesh, which is closed by construction,
   and transferring the rig weights onto it. Deformation folds even a closed surface once a
   joint passes its range: in the measurement above the closed copy read 0% at rest and up
   to 16% at extreme poses. So a raw posed count measures the poses as much as the mesh.
   The finding is the **excess** over the closed copy, read only in views where the closed
   copy itself stays clean.
3. **Pose within joint limits.** A sweep that rotates every joint ±75° on every axis spends
   most of its frames in poses no animation will reach, and the folds there drown the signal.
   Declare the poses the character's actions reach, as the rig check does for tearing, and
   sweep those.

Measured with that floor, the sweep separates meshes the rest render cannot. One hero went
from 0.95% at rest to a 2.9% median and a 10.4% maximum across fold-free posed views: its
hip plates part when the thigh lifts. A long-robed hero stayed flat (0.95% to 0.93%, max
1.5%). Same pipeline, same budget, same structural card, opposite answers.

## Procedure

1. **Prove the instrument on two controls before trusting it on a character.** The closed copy
   must read zero at rest. The same copy with a face patch deleted must fire in the views
   that face the patch and stay silent in the views that do not. An instrument that cannot
   tell these two apart has no standing to grade a hero.
2. **Run the rest pose.** If the back-face share is in the tens of percent, stop. The defect is
   orientation, and its remedy is recomputing or flipping normals before anything else.
3. **Run the declared poses against the closed copy.** Record the excess per pose and camera,
   the worst views, and how many fold-free views exceed the rest maximum.
4. **Keep the frames.** The worst three views as a contact sheet are the report. The number
   says how much; the sheet says where, and that decides the remedy.
5. **Route on it.** Treat this as a **readiness for deformation**, not a health score, for the
   same reason face-rig readiness is kept apart. A prop that never bends has no posed
   see-through to measure, and should not be shown one.

## Decision rules

- **When gaps open only in posed views, prefer a backing body over a regeneration.** A
  closed, dark, rigged underlayer behind the shells turns a hole into a shadow and keeps the
  generated surface detail. Regenerating draws from the same distribution of separate sheets.
- **When the closed copy is itself acceptable for the asset's camera distance, ship the closed
  copy.** It removes the defect class outright and costs surface detail. That trade is right
  at a distant game camera and wrong for a hero close-up.
- **When the back-face share is high at rest, fix orientation first.** No backing body helps a
  face the engine will cull.
- **When the rig check reports clean, do not read that as see-through clean.** Rigid plates that
  move perfectly with their bones still part from each other. The rig check catches tearing
  and wrong bindings; it was never asked about gaps between correctly bound shells.

## When not to use this

- **As a quality score.** A mesh with no see-through can still be the wrong character. This is a
  readiness claim and nothing more.
- **On an unrigged asset.** Run the rest pose if you like, but a pose sweep without a rig is
  measuring nothing.
- **With poses nobody will animate.** A sweep beyond joint limits reports deformation folds as
  holes, and the closed-copy floor is there to stop exactly that misreading.
- **As a substitute for looking.** Small specks of back face along sharp creases are normal
  rendering noise at low resolution. The sheet is what lets a person tell a crease from a gap.
