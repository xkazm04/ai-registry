---
layer: golden-path
type: golden-path
subject: generated-video-motion-extraction
status: forged
use_when: [using a generated video clip as the source of a character's animation, choosing between video capture and a text-to-motion model for an action, composing a clip so that motion can be recovered from it, reading attack timing from generated motion]
techniques:
  - motion-source-route-by-action-class
  - two-view-reference-composition
  - panel-sync-gate
  - effect-free-motion-source
  - own-rig-synthetic-keypoint-training
  - twist-from-extra-points-and-joint-limits
  - contact-window-travels-with-the-clip
---

# Generated video motion extraction

A video generator can now render a plausible person swinging a sword, and a markerless
solver can turn a plausible person into joint rotations. Put the two together and a team
can produce an attack animation from a sentence. This subject is that route, and its first
principle is the one that separates it from every other use of a video generator: **the
clip is a motion source, not footage.** Nobody will ever watch it. Its only job is to carry
a body's motion, accurately enough that a solver can take it back out, onto a skeleton
that will then be driven under player input.

That makes a clip made for extraction a **measurement instrument**, and every instinct a
video model has learned from cinema works against it. A moving camera mixes the actor's
motion with the camera's. Dramatic framing crops the feet, which are where root motion
comes from. Effects, trails and dust put bright moving pixels exactly where the tracker
is looking. A low angle foreshortens the limb the action is about. Each choice makes a
better shot and a worse measurement. A team that composes a motion-source clip the way
it would compose a trailer gets a beautiful clip and a broken solve, and does not learn
which, because the solve still completes.

This subject owns five things: the choice of route (a single view, two views triangulated,
or a text-to-motion model that skips video entirely); the composition of the clip so that
motion is recoverable from it; the gates a clip passes before any solver sees it; the
extraction itself, including the parts of a pose that two views cannot see; and what the
extracted clip carries forward, chiefly the measured timing of its contact moment.

## Where this subject stops

Whether the extracted motion is good enough to ship belongs to motion quality gating. That
subject judges craft, responsiveness and integrity of motion that already exists, and it
does not care where the motion came from. This subject ends when a clip has become joint
rotations that are faithful to the clip. A faithful extraction of a lifeless clip is a
success here and a failure there, and the two verdicts must stay apart. The one piece of
that neighbour's seam this subject takes over is the gate *before* the solve: whether a
generated clip is trackable at all (two distinct feet in every frame, the whole body in
frame, a still camera). That gate is a property of the motion source, so it lives here.

Binding the character's mesh to a skeleton, and remapping bones between a source skeleton
and an engine's, belongs to mesh finishing for engine readiness. The extraction targets a
skeleton; it does not build or bind one. Where this subject says "the character's own
rig", it means a rig that finishing has already produced, rendered as a reference.

What a contact window *means* to gameplay belongs to real-time combat semantics: whether a
hit lands once per swing, how a parry window is sized, whether the window is fair. This
subject measures when the contact happened in the motion and hands that number over. It
never decides what the game does with it.

Generating video for people to watch is generic generative-media craft. The rules for a
good shot and the rules for a good motion source disagree on almost every point, so the
seam is easy to state: if a viewer will see the frames, this subject does not apply.

Animating a talking face or an avatar is a different problem with the opposite default. In
a talking-avatar product, neural generation of the frames is often the shipped output, and
the question is whether the generated face is good enough to show. Here the generated
frames are never shown to anyone. They are thrown away the moment the motion is out of
them, and any frame-level beauty the model adds is waste or noise. A reader can pick by
asking one question: will a person see these generated pixels? If yes, this is not the
subject.

## The route is chosen per action, not per project

There are three routes, and each is right for some action classes and wrong for others.
A single view through a solver with a built-in human body model is cheap and works when
the action happens mostly in a plane facing the camera. Two views triangulated recover
depth directly, which a single view can only guess, and they matter most for actions whose
read depends on distance along the camera axis: a strike toward the viewer, a thrust, a
lunge. A text-to-motion model, trained on captured human motion, produces cyclic
locomotion with real foot contacts and needs no clip at all, but it knows only human
skeletons and only the actions in its training data.

The naive reading picks one route for the whole project, usually the one that worked on
the first demo clip. The craft is to pick per action class, and to know the measurement
that says a route has run out on a given clip. A single view that has run out does not
fail loudly. It produces a smooth, confident pose with the depth wrong.

## A clip for extraction is composed, not prompted

The cheapest correspondence is one the composition hands you for free. Two views rendered
as two panels of one generated clip, with level cameras at the same height, put a body
point on the same image row in both panels. That row agreement stands in for camera
calibration, and its residual is a free per-frame check of whether the model kept the two
panels consistent. Conditioning the first frame on renders of the target character's own
rig, from the same two cameras, pins proportions and rest pose from frame zero, so the
solver is fitting the character it will animate rather than whichever human the model
imagined.

The same discipline governs content. The engine adds fire, trails, sparks and impact
bursts at runtime, under control of the gameplay that triggers them. Baking them into the
motion source buys nothing and costs the frames where the contact happens, which are the
frames the extraction most needs. Ask for the plain thing, positively: a bare blade, clear
air, a plain studio, a still camera, the whole body in frame. Then check the output for
what was not asked for, because a prompt that names what it forbids tends to plant it.

## Gate the clip before the solver sees it

A solver that receives a bad clip does not refuse it. It returns a pose for every frame.
So the gates sit in front of the solver and they reject, they do not repair.

For a single view, the gate is trackability: two distinct feet in every frame, a stable
limb count, the whole body in frame against a plain background, and a still camera. Fused
feet disqualify a clip because foot contact is what root motion is derived from. Blurred
hands do not, because a body solve does not use fingers.

For two views, there is a gate a single view never needs: the panels must show the same
instant. A video model rendering two panels does not reliably keep them in step. Measured
on one locally run model, one seed of two drifted four frames between panels: the front
panel had struck while the side panel's blade was still raised. Triangulating that pair
fuses two different instants into one pose, and every downstream number inherits the lie.
The check is one correlation between the panels' row series, and the rule is to re-roll a
clip that fails it, not to shift it into agreement.

## Two views see joint centres, not bone roll

Triangulating joint centres gives each bone's direction, and direction is not orientation.
Rotation about a bone's own long axis, its twist, is invisible from the bone's two
endpoints. A solver left to choose twist freely will choose differently from frame to
frame, and the symptom on a skinned mesh is a forearm or thigh that wrings itself like a
candy wrapper. Twist is recovered from points that sit off the bone's axis (a weapon tip,
a marker on the elbow or knee of the rig render, the direction of the foot), clamped to
the rig's joint limits, and resolved where ambiguity remains by taking the solution nearest
the previous frame. A straight limb carries no twist information at all, and the honest
treatment of those frames is interpolation from frames that do.

A generic keypoint detector was trained on humans. On a character whose proportions are
not human (long arms, digitigrade legs, a tail, armour that hides the joint) it puts joints
where a human's would be, confidently. The remedy is a detector trained on renders of the
character's own rig, posed within its limits and degraded the way generated video degrades
a picture. That remedy comes from one practitioner's account and has not been reproduced
here; it is stated as a standard argued from the failure it prevents, not as a measured
result.

## The contact moment is measured, then carried

An attack's active frames are where it can hurt. In an authored pipeline someone places an
event on the clip by eye. When the motion came from a clip, the contact moment is already
in the motion: the frames where the contact point moves toward its target at high speed.
Measured on the synced seed above, that window was three frames at the clip's native rate,
about 125 ms. On the desynced seed the same reading came out three times wider, because it
averaged two strikes that happened at different times in the two panels. So the window is
read only after the sync gate passes, it is stated in the clip's native frames with its
frame rate and its definition, and it travels with the clip as data. Gameplay may then
widen or narrow it for fairness. That is a deliberate authored choice made downstream, and
it is recorded as one.

## What the naive pipeline gets wrong

- **It prompts for a good shot**, and the camera move, the dramatic angle and the impact
  effect each degrade the measurement.
- **It trusts a completed solve.** A solver returns a pose for every frame it is given,
  including frames it could not see.
- **It treats two panels as two cameras.** They are two renderings by one model, and they
  agree only when measured to agree.
- **It shifts a desynced clip into line** instead of re-rolling it, and certifies one
  instant pair while the rest of the clip stays wrong.
- **It lets the solver pick twist**, and ships wrung forearms that no pose gate looking at
  joint centres can see.
- **It uses one route for every action**, so walks come out wooden and strikes toward the
  camera come out flat.
- **It re-authors the hit window by hand** on a clip whose motion already says when the hit
  happened, and the two disagree silently.
