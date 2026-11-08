---
layer: application
type: application
subject: video-assembly
technique: motion-plate-library
status: forged
stack: process
verified_on: 2026-11-08
---

# A built plate with two subjects and a wipe placed by geometry: a field application, closed

**Status: operator closed, no current use.** This is a dated record that the built
previz source worked once in a harder case than earlier local runs had tried. It is
not a live route. Nobody compared it against another arm, so it has no verdict
against an alternative. The operator's call on 2026-11-08 was to keep the technique
on record and close the work, because no current project needs it. Reopen it only
when a shot needs an event held to a stated frame while action passes near the lens.

## What was built

The method is the technique's fourth plate source, a built previz. A public prompt
pack gave the scene and camera keys as numbers. They were converted to a 3D suite's
axes and rendered on the CPU as three 243-frame passes (depth, grey, occluder mask)
at 864x480 and 24 fps. A scripted check ran first and passed: the keys were distinct,
the frame count was exact, and no camera key came inside a solid object. The camera's
closest approaches were 0.42 m to a wall and 0.48 m to the near subject.

Two original vehicles cross in opposite lanes. The camera dips so the near one fills
the frame at frame 120, which gives a full-frame wipe in the middle of one continuous
move. The binding pass was a single reference-to-video call with a depth-control
patch. It took five single-view reference pictures: one shot picture, plus two views
of each vehicle cut from approved sheets. It ran at two seeds with the same prompt,
plate and pictures.

## What was measured before any GPU time

The source's own warning was that a near-lens pass leaves too many featureless dark
frames, and the binding model then cuts or invents a new scene after the wipe. The
built plate let that be counted instead of guessed. Frames where the occluder mask
covers more than 95% of the picture were counted from the mask pass: **5 frames
(118-122)**, against the source's 12-frame limit. So the source's fix, moving the
frame-120 key further from the road, was not applied. Only a built plate allows this
check. A sampled plate gives frames to inspect after the fact, but no occluder mask
to count before rendering anything.

## What the render showed

- **Length held.** Both 243-frame takes finished with no out-of-memory stop. This is
  twice the longest depth-controlled clip run on this machine before.
- **The event landed on its frame.** In both takes the dark frames run 117-122 and
  are centred on frame 120, the frame the geometry placed them on.
- **The camera followed the plate.** Frames 0, 60, 180 and 242 sit on the depth
  edges (road, wall line, horizon) to within a few pixels by eye. Frame 120 is the
  wipe.
- **Identity held on both sides of the occlusion.** Neither vehicle swapped lanes.
  After the wipe the road, the wall and the far vehicle are the same, and both
  vehicles keep their colours and sheet details.
- **The shot picture overrode the plate at frame 0.** The picture places the near
  vehicle by the camera at frame 0, while the plate still has it behind the camera.
  Both takes followed the picture. Where a reference picture and the control plate
  disagree about position, the picture won here.
- **Cost:** 10.2 GPU minutes for both takes, against an estimate of 35, plus a 108 s
  CPU plate.

## What this adds to earlier local runs

An earlier depth-controlled run used one static object under an orbiting camera,
with no reference picture. It held geometry across three restyles, but nothing in
the frame moved except the camera. An earlier replica wrote a full-frame blackout
in words alone, and that blackout held, but nothing placed it at a stated frame and
no plate was used. This run adds three things: **two subjects moving in opposite
directions** under one control plate, **an occlusion placed by geometry** at a
stated frame, and **identity judged on both sides** of that occlusion.

## What this does not establish

The readings are an agent's reads of extracted frames, not an operator's viewing.
Nobody watched the takes in motion or listened to them, so whether the pass-by sound
lands on frame 120 is unknown. Several variables changed at once, so a failure would
not have pointed at one cause, and the success does not isolate one either. The
camera-on-edges check is by eye: the depth scheme leaves most of the frame near
white, and the edges were drawn with a threshold. The 5-frame wipe sits below the
12-frame limit, so this run never tested that limit. A run with a featureless stretch
longer than 12 frames, cut or held, is what would test it.
