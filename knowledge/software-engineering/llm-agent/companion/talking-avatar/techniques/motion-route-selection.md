---
layer: technique
type: technique
subject: talking-avatar
technique: motion-route-selection
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [deciding how an avatar will be animated before building it, a talking-head model that worked on its sample fails on the product's art, comparing animation routes for a verdict a person will make, deciding on which machines learned motion is on by default]
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
   inside a permissively licensed model is the usual find. Read three things
   apart for each component: the code licence, the weights licence, and the
   terms of the data it was trained or pretrained on. A permissive label on the
   weights does not clear a pretraining set published for non-commercial use;
   that is a provenance risk carried by everything that runs the component —
   including a student distilled through it, if the student keeps it at
   inference. Note which components the product's own path actually loads, as
   against the experiment's tooling. A non-commercial component is a finding to
   route around, not a blocker for the experiment; keep such a model
   user-installed rather than bundled, and prefer swapping it for a permissively
   trained equivalent where one exists.
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
   cost and motion-generation cost are reported separately, with the voice's unit
   of output named beside the motion model's window: against whole sentences
   rendered ahead of playback, per-sentence compute decides whether it keeps up;
   only against streamed audio is the window a latency floor.

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
- **When the best motion source needs a window of audio before it emits,** check
  what the voice hands it before calling it offline. If sentences are rendered
  whole before they play, compute motion per finished sentence while the previous
  one plays; the route is live as long as compute per sentence stays under the
  playback time it hides behind. If audio is streamed, the window is a floor and
  learned motion is confined to speech rendered ahead. Either way procedural
  motion owns idle, listening, the start of a line and every fallback, through
  one seam.
- **When deciding on which machines learned motion is on by default,** let each
  machine decide for itself at start-up, by the coverage it can deliver, not by a
  hardware list. Learned motion that covers only part of the speech reads as
  "sometimes alive, sometimes not", which is worse than consistent procedural
  motion; so the rule is a threshold on a probe that predicts coverage. With a
  fixed-window model, time one warm window (see paced-realtime-measurement) and
  turn learned motion on when it fits a budget that the replay showed separates
  high coverage from partial coverage, allowing for the probe running while the
  voice is idle. If the model has a step count, probe at the cheapest count and
  predict the others (the audio encoder is fixed, the denoising loop scales with
  steps), then pick the most steps that fit — a short ladder of counts is enough.
  Leave the voice's own threads free when sizing the model's thread pool, report
  the outcome as a capability with its numbers (on, steps, window time — or off
  and why), re-probe on every start so a throttled machine falls back by itself,
  and let an explicit setting override it either way.
- **When choosing a faster motion source,** distil the motion model the product
  already trusts before switching models: a student of the incumbent keeps its
  channels, its retarget and its verdict (see neural-motion-retargeting). A
  different model is the fallback when the incumbent's weights or training data
  fail the licence check, and a model that covers only one channel well (eyes,
  say) is held for that channel alone. Licences are read per component — code,
  weights and training data apart, the audio encoder and any face model it needs
  included — and a non-commercial or unlicensed component excludes the candidate
  from bundling. A student inherits the terms of every network it keeps at
  inference, so train it on a permissively licensed encoder's features when the
  teacher's encoder carries a data risk.
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
