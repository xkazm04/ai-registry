---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: motion-source-route-by-action-class
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding how an action's animation will be sourced before generating anything, a video-derived clip looks right from the front and wrong from the side, a project has one motion route and is about to use it for every action]
---

# Motion source route by action class

Three routes turn a description of an action into joint rotations, and none of them is the
best route. A **single view** through a solver with a built-in human body model is the
cheapest and the most widely available. **Two views** of the same instant, triangulated,
recover depth by measurement instead of by prior. A **text-to-motion model** skips video
entirely and emits skeletal motion learned from captured human performances. The decision
is made per action class, because the property that sinks a route is a property of the
action, not of the project.

## What decides it

Four questions, asked in this order, settle almost every case.

1. **Is the action cyclic locomotion?** Walks, runs, strafes and their transitions are
   defined by foot contact and by a cycle that closes. A text-to-motion model trained on
   captured motion produces both from data. A video-derived cycle has to be looped after the
   fact, and its foot contacts recovered from noisy tracks; one practitioner reported
   video-derived walks as wooden. A text-to-motion cycle is not finished either: its raw
   loop still owes a closure check before it can ship, and that check belongs to the motion
   quality gate.
2. **Is the character human-proportioned?** Text-to-motion models and the body models
   inside single-view solvers both assume a human skeleton. For a creature, a giant with
   long arms, or a character whose armour hides its joints, both routes put the motion on
   the wrong body. Only a video route with a detector trained on the character's own rig
   fits that case.
3. **Does depth along the camera axis decide the read?** An overhead strike toward the
   viewer, a thrust, a lunge or a grab is mostly motion toward or away from the lens. A
   single view sees it foreshortened and the body prior fills in a depth it did not
   observe. These actions need a second view, or an explicit depth prior that the team
   chose and can name.
4. **Does the action have a contact moment that gameplay will read?** A weapon hit, a
   kick, a stomp. The timing of that moment is extracted from the motion, so the route must
   see the contact point clearly at the contact frame. Two views make occlusion of the
   contact point in one panel survivable.

## Decision rules

- **When the action is cyclic locomotion on a human skeleton, try text-to-motion first.**
  Fall back to video only for a gait the model has not learned.
- **When the action's main plane faces the camera, a single view is acceptable.** A sideways
  sweep seen from the front, a kick seen from the side: the motion is in the image plane and
  the depth the prior supplies is small and nearly constant.
- **When the action moves along the camera axis or has a contact moment, use two views or
  name a depth prior.** Moving the single camera to the side is the cheap version: it puts
  the action's main plane back in the image plane. Do it when only one plane matters.
- **When the character is not human-proportioned, take neither prior-based route.** Use
  video with own-rig keypoints, or author the motion.
- **When the route is unproven on this action class, run one clip end to end before
  generating a batch.** A route that has worked on a strike has not been shown to work on a
  roll.

## Knowing that a single view has run out

A single-view solve that has hit its limit does not fail. It returns a smooth, plausible
pose with the depth wrong, and every structural check on the result passes. So the team
needs a measurement on the solved clip that would move if the depth were wrong.

Limb-length variance across frames is the obvious candidate, and it only works on a raw
lift of 2D keypoints into 3D. A solver that fits a body model holds limb lengths constant by
construction, so on its output the variance is zero whether the depth is right or not. The
better measurement for a body-model solve is **depth-axis motion of a contact that the image
shows as fixed**: a foot that stays planted in the frame but slides toward or away from the
camera in the solve, or a root whose depth jitters while its image position is still. The
image cannot show that motion, so the solve invented it. When a planted contact drifts in
depth, the single view has run out on that clip, and the action belongs to the two-view
route.

Until such a measurement has been run on a clip, the clip's depth is unmeasured. Report it
as unmeasured, not as plausible.

## Procedure

1. List the actions the character needs and give each its class: locomotion cycle, contact
   action, reaction, idle, traversal.
2. Answer the four questions for each class and write down the route and the reason.
3. For each route, name the gate a clip passes before its solve (trackability for a single
   view, panel sync for two views) and the measurement that shows the route has run out.
4. Prove each route once per class end to end, onto the real target skeleton, before
   generating at volume.
5. Record the route on the extracted clip. A downstream reviewer who sees a flat strike
   needs to know whether it came from a single view.

## When not to use it

- **When the project already has captured or hand-authored motion for the action.**
  Generation is a way to get motion that does not exist. It is not an upgrade path for motion
  that does.
- **For faces, fingers and cloth.** Body routes do not solve them, and choosing among body
  routes says nothing about them.
- **As a quality verdict.** A route that suits an action class can still produce a clip that
  should not ship. Whether it ships is judged after extraction.
