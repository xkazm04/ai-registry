---
layer: technique
type: technique
subject: cinematic-language
technique: movement-motivation
status: forged
laws: [causality-over-sequence, typed-input-owns-its-channel]
shared_with: []
use_when:
  - deciding whether and how the camera moves in a shot
  - generated clips drift aimlessly or sit inert
  - a beat needs dread, intimacy, urgency, or release expressed through motion
  - a camera move must be written so a model executes it
  - the generator takes a camera path or action script alongside the prompt
---

# Movement motivation

## The concern

Camera movement is the narrator's voice, and the first question is not
"which move" but "why move at all". The craft doctrine: **motivated**
movement follows action or a character's attention and stays invisible;
**unmotivated** movement is the author speaking — the camera noticing
what the character will not, prowling on its own, foreshadowing. Used
sparingly, unmotivated movement is dread or omniscience; used loosely it
is noise. Stillness is also a voice: the locked-off frame is composure,
patience, or confrontation. An undirected model chooses drift, which is
neither.

## Procedure — the grammar, with the phrasing that executes

1. **Approach and retreat.** The push-in is cinema's "something is
   dawning" figure — growing intensity, realization, lean-in: "the
   camera slowly pushes in on her face." The pull-back is release,
   abandonment, context reveal: "camera slowly pulls back, revealing the
   empty hall around him."
2. **Travel.** Tracking alongside or behind is companionship and
   momentum: "tracking shot following behind him as he strides down the
   corridor." The orbit seals a moment off from the world — significance,
   engulfment: "camera slowly orbits the couple." Lateral tracks read as
   detached observation.
3. **Rotation in place.** A pan is a turning glance (survey, follow,
   connect); a whip pan is shock or comedy. A tilt reveals scale: "camera
   tilts up from the boots to the gunslinger's face."
4. **Vertical travel.** Rising up and away is transcendence, epilogue,
   leaving-the-story; descending is entering the world, fate closing in:
   "crane shot rising up and away from the crowd."
5. **The zoom family.** A zoom magnifies attention without moving the
   body — optical, surveillant, documentary; a crash zoom is sudden
   alarm. The dolly-zoom holds the subject constant while the world
   warps — vertigo, rupture; describe the perceptual result: "he stays
   the same size while the corridor stretches and warps behind him."
   Loud figures; one per film, not per scene.
6. **Carriage texture.** Handheld is human imperfection — panic,
   immediacy, documentary truth: "handheld camera, shaky, urgent."
   Stabilized glide is a ghost-observer — dreamlike, or predatory when it
   prowls where a person would not: "smooth gliding camera drifting
   forward at a slow, inhumanly steady pace." Locked-off is a decision,
   and models need it named: "static locked-off shot, no camera
   movement."
7. **Always attach a speed adverb.** Models have no default camera
   speed: "slow", "gradual", "sudden" — every move carries one.

## Decision rules

- One move per shot. Compound choreography ("pan while orbiting while
  craning") degrades execution and meaning alike.
- Movement must answer "what changed": a move transforms the current
  idea, a cut asserts a new one. If nothing in the beat changes, hold
  still.
- Choose carriage by honesty budget: handheld where rawness should
  override polish, glide where control or menace should be felt, locked
  where the audience must scan the frame themselves.
- Explicit refusal is a directive that works: "one continuous shot,
  locked horizon, no cuts" suppresses drift and invented edits.

## When the camera is an input, the prose stops describing it

Everything above assumes the prompt is the only place the camera is decided.
A growing class of generators breaks that assumption: they take a **camera
path as a separate typed input** — a per-segment action script, a pose
trajectory, a navigation stream from a viewer — and render the prompt against
it. On those systems the rules above invert, and the discriminator is not the
model's name or its modality but a single question:

> **Does anything other than the prose set the camera?** If yes, the prose
> goes silent on camera motion. If no, motion is unset unless the prose sets
> it, and everything above applies.

The reason is not that motion language stops working. It is that two
authorities over one channel fight, and the fight is not resolved in the
author's favour: the trajectory is numeric and exact, the sentence is
suggestive, and a prompt asking for a slow push while the script yaws left
asks for a shot that does not exist. The observable symptom is not a refusal
but a compromise — a drifting, unmotivated move that matches neither input,
which reads exactly like the aimless drift an undirected model produces and
gets misdiagnosed as too little direction. The fix is the opposite of the
usual one: remove the camera language, and let the channel that actually
holds the camera hold it alone.

The silence is narrow, and drawing it too wide costs real control. A camera
controller owns **motion**; it does not usually own where the shot starts or
what the frame contains. So the prose keeps what the controller cannot set:

- **Viewpoint and framing at the first frame** — first- or third-person,
  viewing height, angle, the subject's orientation and where it sits in the
  frame. The controller moves the camera from wherever it begins; the prose is
  what says where that is.
- **Everything the move was supposed to mean.** The meanings in the grammar
  above do not evaporate because a script is driving — a push-in still reads
  as dawning realization. They move upstream, to whoever writes the action
  script, and that person needs the same grammar. A pipeline that hands
  trajectory authoring to an interface with no vocabulary of meaning has not
  removed the cinematographer's job, only the words for it.
- **What is off-screen.** When the camera will travel to material the first
  frame does not show, the prompt is the only place that material can be
  established. A brief for a driven camera reasonably describes what lies to
  the left and right of frame precisely because the script is going to turn
  and look at it — the opposite of the discipline for a text-driven shot,
  where describing what the camera will never see is wasted budget.

Two systems from one lab, released together, take opposite sides of this and
say so: the text-driven multi-shot writer requires a camera clause in every
shot paragraph, while the navigable one ships a denylist of camera verbs —
push, pull, orbit, track, follow, pan, tilt, zoom, spin, handheld — and
permits movement language only when a caller explicitly overrides its own
control input. Neither is a house style. They are the same rule read from the
two sides of one question.

## Failure modes

- **Aimless drift** — no movement instruction, so the model wanders; the
  footage feels unauthored.
- **The compound move** — three simultaneous choreographies, none
  legible, execution unstable.
- **Unmotivated everywhere** — constant authorial prowling; the
  narrator's voice becomes wallpaper and the one beat that needed dread
  has spent it.
- **Speed left unset** — the right move at the wrong tempo; a push-in
  that should take the whole shot arriving in one second.
