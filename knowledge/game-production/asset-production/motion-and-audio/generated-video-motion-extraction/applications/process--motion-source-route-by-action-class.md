---
layer: application
type: application
subject: generated-video-motion-extraction
technique: motion-source-route-by-action-class
stack: process
status: forged
verified_on: 2026-10-25
applied: experiment
ab_verdict: better
proof: ab-paired
---

# PoF's monocular capture route, read against the route rule

The tree is the PoF game project at `f9a5d8ea` (2026-10-24), read on 2026-10-25. The
witness is its pipeline document, `docs/animation-capture-pipeline.md`, the scripts in
`shots/` it names, the footage gate in `src/lib/visual-gen/`, and its text-to-motion spec.
The document states the engine side as UE 5.8 (`docs/animation-capture-pipeline.md:23 "UE 5.8, VerticalSlice arena"`).
This is a `process` application, so that version is recorded here and not in a
`verified_against` field, which the format rejects for `process`.

PoF runs two of the three routes. The video route is a single view: a generated clip, then
markerless body capture, then an IK retarget onto the engine mannequin, then a rendered
filmstrip and a grade (`docs/animation-capture-pipeline.md:3 "MetaHuman markerless body capture"`).
The text-to-motion route generates skeletal motion directly and was proven on a slash, a
run, a roll and an idle (`docs/research/ardy-text-to-motion-spec.md:142 "run 8.3 m @ 5.1 m/s peak w/ flight phases"`).
It has no two-view route. Nothing in the tree writes down which action class goes to which
route, and the reasons it gives for each route are reasons about the route, not the action.

## What the single-view route already gets right

- **The clip is composed as a measurement, not a shot.** The generation prompt asks for a
  full-body figure, a plain background, even light and a still camera
  (`shots/veo_gen.mjs:7 "static camera, the entire body visible from head to feet"`), and
  the document says why in this subject's own terms: the solver
  "explicitly does worse with moving cameras" (`docs/animation-capture-pipeline.md:34 "MetaHuman's solver explicitly does worse with moving cameras"`).
  The later generator swap was chosen on the same ground
  (`docs/animation-capture-pipeline.md:97 "one coherent full-body human, static camera, clean limbs"`).
- **The prompt is positive.** It describes the plain scene and lists nothing to avoid, which
  is what the effect rule and the bundle's prompt law both ask for.
- **A trackability gate exists, with the right disqualifiers.** The footage gate fails a clip
  whose feet fuse and tolerates blob hands
  (`src/lib/visual-gen/footage-gate.ts:32 "feet that fuse or merge into one mass are DISQUALIFYING"`),
  and checks for a still camera (`src/lib/visual-gen/footage-gate.ts:36 "the camera is static or near-static"`).
- **A completed solve is not trusted.** The document requires a numeric check of bone rotation
  before any render (`docs/animation-capture-pipeline.md:75 "Verify motion numerically before trusting any render"`),
  and the bone gate implements it (`shots/anim_bone_gate.py:9 "Gate: PASS if at least one upper-body bone rotates >= 35 deg"`).
  It also says candidate generators are to be judged by solve success, not by how good their
  footage looks (`docs/animation-capture-pipeline.md:115 "validate candidates by running their clips through MetaHuman Animator"`).
- **Locomotion already leans to text-to-motion.** The spec gives the video route's measured
  ceiling as the reason (`docs/research/ardy-text-to-motion-spec.md:272 "measured a hard quality ceiling (fused feet)"`).
  That is the route rule's first answer, reached from a different direction.

## What it lacks, against the technique

- **No depth for the action it was proven on.** The proven clip is an overhead two-handed
  strike (`shots/veo_gen.mjs:7 "single warrior performing one clean, powerful overhead two-handed sword strike"`),
  and the prompt does not fix the camera's direction. An overhead strike's main plane runs
  front to back through the body. Seen from the front, most of its motion is along the camera
  axis, which is the case the rule sends to two views. The solver is a 2D keypoint detector
  feeding a human body-model fit (`docs/animation-capture-pipeline.md:41 "(2D keypoints)"`),
  so the depth of that strike comes from the body prior. The cheap fix is one phrase in the
  prompt: a side view for actions in the body's front-to-back plane. The full fix is a second
  view.
- **No measurement that the single view has run out.** The bone gate proves motion moved
  (one upper-body bone past 35 degrees). It cannot see depth that is wrong, and with a
  body-model fit limb lengths are constant by construction, so limb-length variance would read
  clean too. The missing check is depth drift of a contact the image shows as planted, such as
  the feet during the strike's windup.
- **The trackability gate is not in the documented run order.** The gate exists as a route,
  but neither the stage table nor the run steps in the pipeline document call it. As
  documented, a clip goes from generation straight to capture.
- **The text-to-motion route still owes a loop gate.** The document records the raw walk from
  that route as a measured Tier-1 fail (`docs/animation-capture-pipeline.md:54 "the raw ARDY walk sits at 141.8 mm of RMS pose gap"`).
  The route rule sends locomotion there first, and the tree shows "first" does not mean
  "finished". The loop-closure gate is the motion quality gate's, and PoF already wires it.
- **The hit timing is authored, not measured.** The combo checker reads the hit time from an
  authored notify (`src/lib/animation/combo-links.ts:110 "const hitSec = hit?.time;"`), and the
  enemy adapter falls back to a constant active window when none is given
  (`src/lib/combat/catalog-enemy-adapter.ts:186 "(num(primaryAtk.activeMs) ?? 150)"`). Neither
  looks at the motion. For a clip from the video route, the contact window would be read from
  the extracted motion and travel with it.
- **The timing basis is rewritten before capture.** The clip is re-encoded at 30 frames per
  second (`docs/animation-capture-pipeline.md:37 "-pix_fmt yuv420p -r 30"`), and the capture
  script forces 30 when the extractor cannot read a rate
  (`shots/mha_capture.py:39 "Force 30."`). Neither records the generator's native rate. A
  contact window read after that step is in resampled frames, and its basis has to say so.

## What does not apply

The panel sync gate does not apply: the route has one view. The own-rig keypoint technique
does not apply to the clip this route was proven on, a human warrior solved through a human
body model. It would apply the first time the route is pointed at a
creature.

## The A/B: one view against two, on PoF's own warrior

Run 2026-10-25 on the fleet's local media machine. Frame 0 is PoF's rigged warrior A rendered
headless in a DCC from two level orthographic cameras at one height, front and side, joined as
two panels. A local image-to-video model animated an overhead strike from it, on two seeds.
No keypoint model was used: in this rig the front column gives X, the side column gives depth
Y, and the shared image row gives height Z. So the top of the silhouette (the blade during
windup and strike) triangulates directly, and the row mismatch between the panels is the
triangulation's own error.

- **Arm A, the route as it stands:** one view, from the front. The strike's depth along the
  camera axis is not observed at all; a body prior has to supply it.
- **Arm B, the technique's answer for this action class:** the second panel, triangulated.

| | Seed 4100 (panels in sync) | Seed 4101 (panels drift 4 frames) |
| --- | --- | --- |
| Frame-0 tip height (the rig has 1.80 m) | 1.792 m | 1.792 m |
| Tip depth, windup to impact | +0.10 to -0.90 m | -0.24 to -1.13 m (two instants fused) |
| Row residual, median / max | 5 / 34 px (18 / 126 mm) | 8 / 149 px (30 / 550 mm) |
| Where the residual peaks | steady ~20 px offset after impact, when the top point becomes the helmet | frames 31-36, where the front has struck and the side has not |

- **Target:** the camera-axis depth of the contact point. Arm A observed none. Arm B observed
  about 1.0 m of travel toward the front camera between windup and impact, which is most of
  this strike's motion.
- **Floor:** frame 0 reconstructs the real rig to 8 mm, so the rig geometry is right. The
  drifted seed's error lands exactly where the panel sync gate predicts it will. Verdict:
  `better`.

What this did not measure:

- **How wrong arm A's body prior would be on the same clip.** PoF's single-view solver runs in
  the engine on another machine and was not run here. This A/B measures observability, not the
  size of the prior's error.
- **The ground offset.** The silhouette bottom reads 5-7 cm below the rig's floor in three of
  four panel medians. It is not explained, and it is recorded rather than tuned away.
- **The helmet hand-off.** After impact the tracked "tip" is the helmet, and a steady 20 px
  disagreement there is a pose difference between the panels, not a timing one.

Numbers are two seeds on one model: measured examples, not thresholds.
