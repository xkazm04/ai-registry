---
status: EXECUTED (2026-10-25, intake-XnS0vrbDrrc-e4; slug kept, 7 techniques, none merged; worker corrected the brief: the text-to-motion route proved a slash/run/roll/idle, not a walk, and the raw walk fails the loop gate; process application carries no verified_against, UE 5.8 recorded in prose)
source: librarian/sources/2026-10-24-dark-souls-boss-ai.md
run_id: intake-XnS0vrbDrrc-e4
bundle: game-production
category: asset-production/motion-and-audio
subject: generated-video-motion-extraction
resolved_path: knowledge/game-production/asset-production/motion-and-audio/generated-video-motion-extraction/
category_count: 4 subjects now, 5 after (cap 10, V1 clear). taxonomy.json is the authority; append the slug to the `motion-and-audio` subjects list, do not reorder.
consumer: pof (read-only; `docs/animation-capture-pipeline.md`, `docs/research/ardy-text-to-motion-spec.md`, `shots/`)
---

# Spec: generated-video-motion-extraction

## Why this is XL, and why it is proposed rather than written

One source (a first-party build-walkthrough, n=1) described a whole route: generate a boss's
attack as video, extract its motion, and put it on the character's rig. Five candidates from
that source share this one home, and no subject owns it. `motion-quality-gating` judges motion
that already exists. The rigging subjects bind a mesh to a skeleton. The video subjects in
media-generation make clips for viewers to watch, not to measure. Three or more mechanisms
with one home fire the subject trigger. Evidence beyond the source:

- **Two local measurements on this machine** (LTX-2.5 22B distilled, 2026-10-24/25, recorded
  in the source note under "Local examples").
  - Two-view sync: one seed of two drifted 4 frames between panels.
  - A fire-effects pair: sync fell from 0.98/0.94 to 0.86/0.84 and tip-row jitter rose
    tenfold. The tracker followed embers, and the impact burst hid the blade and feet.
- **A managed project already runs the monocular version of this route**: PoF's
  `docs/animation-capture-pipeline.md` (text, then a generated clip, then markerless body
  capture, then retarget to the engine mannequin, then a grade). Its own notes are first-party
  evidence of what the single-view route needs: a static camera, full body in frame, a plain
  background, and anatomy coherence over style.

Because the source is n=1, every technique must be argued from first principles and the
neighbours, with the local measurements as the only numbers. Any number the source gave
without a protocol is not a number here.

## The subject's job (the golden path's opening must say this and name boundaries)

**Motion extraction from generated video.** A generated clip is used as a motion source, not
as footage. The subject owns:

- the choice of route (monocular capture, multi-view triangulation, or a text-to-motion model);
- how the clip is composed so that motion can be recovered from it;
- the gates a clip passes before any solver sees it;
- the extraction itself (keypoints, triangulation, twist and joint-limit resolution);
- what the extracted clip carries forward (the measured timing of its contact window).

The thesis to argue: **a clip made for extraction is a measurement instrument, and every
cinematic instinct (camera motion, effects, framing for drama) degrades it.**

It must NOT absorb:

- whether the resulting motion is good enough to ship (`motion-quality-gating`);
- binding the mesh to the skeleton or remapping bones (`mesh-finishing-for-engine-readiness`);
- what a hit window means to gameplay, dedup or parry (`systems-canon/realtime-combat-semantics`);
- generating clips for viewers (media-generation's video subjects);
- animating a talking face or avatar. The software-engineering bundle's `talking-avatar` owns
  that, and it holds the opposite default: neural generation is often the shipped output
  there, while here the clip is never shipped. State that discriminator in prose; no
  cross-bundle link.

Say in prose where each boundary sits.

## Proposed techniques (each must carry a decision rule)

1. **`motion-source-route-by-action-class`**: monocular capture, two-view triangulation or
   text-to-motion, chosen by action class and by what the downstream needs.
   - Rule: cyclic locomotion goes to text-to-motion first, because the source reported
     video-derived walks looked wooden and PoF's text-to-motion spec already proved a walk.
   - Rule: weapon actions with a contact moment, and anything where depth along the camera
     axis decides the read (an overhead strike toward the camera), need a second view or an
     explicit depth prior.
   - Rule: a single view is acceptable when the action's main plane faces the camera.
   - Open question: what single measurement tells a team the monocular route has hit its
     limit on a clip? Candidate: limb-length variance across frames after the solve.
2. **`two-view-reference-composition`**: compose the clip so that correspondence is cheap.
   - Use two panels in one generation (not two generations), so the model renders one instant
     twice.
   - Use level cameras at one height, ideally orthographic. A body point then sits on the
     same image row in both panels, and that row constraint stands in for calibration.
   - Condition the first frame on a render of **the target character's own rig** from both
     cameras, so proportions and the skeleton's rest pose are pinned from frame 0.
   - The local example measured this composition on LTX-2.5: front and side panels with the
     sword top on a shared row, read with no keypoint model.
3. **`panel-sync-gate`**: before any triangulation or timing read, measure the panels'
   temporal agreement on a row-aligned feature, and reject a clip whose best lag is not 0.
   - Measured: seed 4100 had r 0.982 at lag 0; seed 4101 had r 0.942 at lag 0 but 0.983 at
     lag 4.
   - The same drift also tripled the strike-window width on that clip.
   - Rule: re-roll, do not repair by shifting. A lag found on one feature is not proven
     constant over the clip; say what would justify a shift.
4. **`effect-free-motion-source`**: no fire, trails, sparks, dust or magic in a clip meant for
   extraction; the engine adds them.
   - Measured: the fire arm (numbers above) also changed the character's silhouette in one
     seed.
   - The repo's L17 says a prohibition in a generative prompt plants what it forbids. The local
     arm-A prompt said "No effects, no fire, no particles" and produced none on LTX-2.5.
     Reconcile honestly: either this is a boundary case of L17 for this model, or arm A got
     lucky. Say which, and what would decide it (a prompt-free arm).
5. **`own-rig-synthetic-keypoint-training`** (from the source; **not reproduced locally**, so
   mark the evidence plainly): train or fine-tune the keypoint head on renders of the target
   character's own rig. Sample poses within its joint limits, render from the clip's camera
   rig, and augment with blur and compression so it survives generated video.
   - Rule: the training set comes from the rig the motion will land on, never from generic
     human data, when the character is not human-proportioned.
   - Name the failure it prevents: generic detectors put joints where a human's would be on a
     non-human silhouette.
6. **`twist-from-extra-points-and-joint-limits`**: two-view triangulation of joint centres
   leaves bone roll (twist) undetermined.
   - Add off-axis points: a weapon tip, an elbow or knee marker on the rig render.
   - Clamp to the rig's joint limits, and resolve the remaining ambiguity with the solution
     nearest the previous frame.
   - Rule: never let a solver pick twist freely, because candy-wrapper deformation is the
     symptom.
7. **`contact-window-travels-with-the-clip`**: the extracted clip carries its measured
   contact window. Derive it from the motion: the frames where the contact point moves
   toward its target at at least half of peak speed. Read it **only after the sync gate
   passes**.
   - Measured on the synced seed: frames 13-15 at 24 fps (~125 ms), against PoF's authored
     default of 150 ms.
   - Boundary: this subject emits the window; what gameplay does with it belongs to
     realtime-combat-semantics. A worker may merge this into 3 if it cannot stand alone; say so.

## Applications

At least one application against PoF's monocular pipeline. Stack `process` (or `python` if
it cites the `shots/` scripts), reading `docs/animation-capture-pipeline.md`:

- what the route already gets right (static camera, plain background, full body);
- which of the techniques above it lacks: no sync gate (single view, so not applicable),
  no depth for camera-axis actions, no effect rule written down, and an authored notify
  rather than a measured window.

`verified_against` names what the tree witnesses (the UE version the doc states). Anchors
must be real file:line references that resolve in `<fleet root>/kiro/pof`.

## Open questions the drafter decides (do not discover them mid-draft)

- The subject slug. `generated-video-motion-extraction` is proposed. Override it if a
  neighbour's naming argues otherwise, and say why.
- Whether techniques 3 and 7 merge.
- How far to state numbers from n=2 seeds: as measured examples, never as thresholds.

## Override invitation

This brief is not final. If placement, a boundary, a technique split or a slug is wrong,
override it and argue the override in the report. Both earlier workers that overrode a brief
were right.
