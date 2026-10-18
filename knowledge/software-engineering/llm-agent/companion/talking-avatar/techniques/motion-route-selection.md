---
layer: technique
type: technique
subject: talking-avatar
technique: motion-route-selection
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [deciding how an avatar will be animated before building it, a talking-head model that worked on its sample fails on the product's art, comparing animation routes for a verdict a person will make]
---

# Motion route selection

## The concern

There are three ways to make one still image talk — a layered rig driven by
parameters, a neural model that generates the frames, and a hybrid in which a
network produces motion and the rig draws it — and each is excellent somewhere.
The decision goes wrong in a predictable way: it is made early, on the evidence
that is cheapest to obtain, which is the route's own demo. A neural model's
sample face is the face it was trained to animate; a rig's demo character was
cut by hand for that rig. Neither says anything about the product's art.

## The procedure

1. **Fix the inputs before any route is built.** One still (the product's real
   art, not a stand-in), a handful of real lines in the product's real voice
   (one short, one question, one long), one output size, one frame rate. Every
   route renders the same inputs. A route evaluated on different lines is not
   in the comparison.
2. **Audit licences first, per component.** A talking-head release is a stack —
   motion model, renderer, face detector, landmark mesh, audio encoder, upscaler
   — and each piece carries its own terms. The research-only detector bundled
   inside a permissively licensed model is the usual find. A non-commercial
   component is a finding to route around, not a blocker for the experiment.
3. **Run the cheapest drivability check on the real art.** For neural routes:
   does the box detector fire, does the landmark mesh fire (they are separate
   stages and fail separately), does the mouth move at all on a speech line?
   For the rig: can the image be split into parts with something to close and
   something that speaks? A form with no human face can fail every neural
   detector and still be fully drivable by a rig — the check decides the route
   as much as the art.
4. **Measure every surviving route paced** (see paced-realtime-measurement):
   lag against the audio clock, frame rate at the 5th percentile, first-frame
   time, peak memory per process, and what the route needs resident.
5. **Bench blind.** Render the common lines through each route, give the clips
   letters, play the same line side by side in sync, and let the person who
   owns the decision rank them before the names and numbers are revealed. Then
   put the ranking next to the cost table.
6. **Write the verdict with both halves of the cost.** For a hybrid, playback
   cost and motion-generation cost are reported separately, with the motion
   model's window latency named as what decides whether it can be live.

## Decision rules

- **When the art is a human face in a style the models were trained on, and an
  accelerator is guaranteed,** a neural route is a real candidate for live use —
  prefer one that re-renders only the face crop and pastes it back, so the rest
  of a full-resolution frame stays pixel-exact.
- **When the art is stylised or non-human,** expect neural routes to either
  reject it or keep the look and drop the speech; the rig is the main route, and
  learned motion enters, if at all, through the parameter seam.
- **When the target hardware has no accelerator to spare,** the frames must come
  from a rig; learned motion is admissible only if it can be produced ahead of
  playback or on the same machine without contending with everything else.
- **When the best motion source is offline-only,** it does not disqualify the
  route — it assigns it: learned motion for pre-synthesised speech, procedural
  motion for idle, listening and live fallback, one seam for both.
- **When the person ranking says two routes look comparable,** the cheaper one
  to run wins; resource cost is a quality the viewer pays for, not a footnote.
- **When a route produces no usable clip after two serious attempts on the real
  art,** stop it and record why; that record is a result
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
  and a route that silently drops out of the comparison invites someone to
  repeat the attempt.

## When not to use this

When the presence is a still frame plus a reactive layer — a glow that follows
the voice level — there is no route to select; the layered state machine is
enough. And when the product will only ever show pre-rendered clips, the
realtime half of the bench is moot; select on quality and offline cost alone.
