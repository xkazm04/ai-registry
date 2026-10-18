---
layer: golden-path
type: golden-path
subject: talking-avatar
status: forged
use_when: [giving a companion or presenter a face that moves with its voice, choosing between a layered rig, a neural talking-head model and a hybrid of the two, animating one generated still image in real time, an avatar that moves well on sample images fails on the product's own art]
techniques:
  - motion-route-selection
  - single-image-layer-decomposition
  - rig-parameter-contract
  - viseme-drive
  - procedural-presence-motion
  - neural-motion-retargeting
  - paced-realtime-measurement
  - per-sentence-face-sidecar
  - face-signal-across-surfaces
---

# Talking avatar

A talking avatar is a face — or something that reads as one — that moves with a
voice while a person watches it. The product question sounds like a rendering
question ("how good can it look?") and is really three questions with different
owners: **what produces the motion**, **what draws the frame**, and **what the
motion is synchronised to**. Teams that answer them as one question buy one
system that does all three, discover it was trained on somebody else's faces,
and spend the rest of the project working around it. Teams that keep them apart
can swap the weakest of the three without touching the others, which is the
only property that matters once the first version disappoints.

This subject owns the animation of one still image into a speaking, breathing
presence: the choice of route, the decomposition of the image into drivable
parts, the parameter seam between motion and drawing, the speech and idle drive,
the use of learned motion, and the measurement that says whether any of it keeps
up with the voice. It does not own *what the presence is telling the user* — the
state set, the turn events that drive it and the legibility floor belong to
conversation orchestration's
[layered avatar state machine](../conversation-orchestration/techniques/layered-avatar-state-machine.md),
which this subject renders into. It does not own the audio or its timing — the
[speech-timing timeline](../../runtime-and-io/voice-io/techniques/speech-timing-timeline.md)
is a voice concern, produced next to the synthesizer, and this subject consumes it. And it does not own the design of the still itself, which is an
art-direction concern that ends when a drivable image is handed over.

## Three routes, and what each is actually buying

**A layered rig** splits the image once, offline, into parts and draws them
every frame through deformation the product writes: a head that turns by
warping, lids that close, a mouth that opens. Motion comes from parameters, and
parameters come from anywhere — a procedural generator, a timeline, a network.
It costs a few textured draws per frame and runs on hardware that has no
business running a neural network. Its ceiling is the motion it is given.

**A neural talking-head model** takes the image and the audio and generates the
frames. It buys natural, unscripted motion — the nod that lands on a stressed
syllable, the cheek that follows the jaw — for the price of a resident model, a
large accelerator, a cold start, a licence audit, and a prior trained on human
faces. That prior is the clause nobody reads: on a stylised or non-human form
the model either refuses to find a face, finds one and crashes on the next stage
that expects human landmarks, or keeps the look perfectly and drops the speech,
because its idea of "a mouth" is anatomical.

**A hybrid** uses a network for motion and the rig for drawing: a model predicts
head pose, lids and brows from the audio, the prediction is decoded into the
rig's parameters, and the rig draws. It keeps the rig's playback cost and art
fidelity and borrows the network's motion vocabulary. Its cost moves upstream:
the motion model still runs somewhere, on an accelerator more often than not,
and whether it keeps up is decided by the voice's unit of output — whole
sentences rendered ahead of playback, or audio streamed as it is made.

None of these wins in general. Motion-route-selection holds the decision rules;
the principle under them is that **the route is chosen on the product's own art,
on the product's own target hardware, under paced audio** — never on a model's
sample image and never on throughput alone.

## Playback-light is not pipeline-light

The commonest misreading of a hybrid is to quote its playback cost as its cost.
Drawing a rig frame is nearly free; producing the motion the rig plays may need
the same accelerator the neural route needed. Both numbers belong in the
verdict, side by side. What the motion side rules out depends on the voice, not
the model. A synthesizer that renders each sentence whole before it plays — and
renders the next while this one plays — hands the motion model finished audio
with a sentence of playback time to spare, so a model that analyses seconds of
audio at a time still keeps up, sentence by sentence, as long as it computes
faster than the sentence before it plays. Only a voice streamed as it is
synthesised turns the model's analysis window into a latency floor. Either way
there are two motion sources: learned motion where it is ready in time,
procedural motion everywhere else (idle, listening, thinking, the first moments
of a line, and whenever the learned source is absent or late), blended through
one parameter seam so the viewer never sees the handover.

## The parameter seam is the product's real interface

Between whatever produces motion and whatever draws it sits a small, closed,
versioned vector per frame: head yaw, pitch and roll in stated units and signs;
lid closure per eye; gaze; brow; mouth opening and a weighted mouth shape. That
vector is the one vocabulary every motion source writes and every renderer
reads, and it gets exactly one definition
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
It is what lets a procedural generator, a learned model and a hand-authored
gesture be A/B-tested on the same renderer and the same line, which is the only
fair comparison of motion there is. Rig-parameter-contract owns its shape, and
the rule that a group a source does not produce is *absent*, not zero — a
missing brow channel filled with zero is a frozen brow presented as a decision
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).

## One image is a promise about pixels that do not exist

The single-image constraint is what makes this subject hard. A turned head shows
pixels the portrait never contained; an opened mouth shows an interior nobody
drew; a closed eye shows a lid that was never painted. Every route invents those
pixels, and the craft is in inventing them where the viewer will not look. The
rig's version of this is decomposition: lift each moving part off the image,
fill what lay behind it, and assign every pixel to exactly one part so nothing
stale stays behind when a part moves. Two failures dominate and both are
avoidable: a static layer that still holds a copy of a moving part (a ghost cheek
beside a turning head), and a large hole filled with the inpainter's pale average
(a band that appears on every turn). Light-on-black art — glow, particles,
fibres — decomposes differently from painted skin, as light that adds rather than
paint that covers, and single-image-layer-decomposition holds both.

Generated variants of the moving parts — a model asked for the same face with an
open mouth, eight times — are the tempting shortcut and a poor one. An image
model's prior restores the resting mouth, redraws the lips per frame, and gives
discrete pictures that can only be cross-faded, never blended. A parametric part
built from the image's own pixels is continuous for every in-between shape and
cannot drift off-identity, because it never leaves the source.

## Speech is timing first, shape second, loudness third

A mouth that moves to loudness alone flaps; a mouth that hits the right shapes
at the wrong moment reads as dubbed. The order of authority is: **timing** from
the synthesizer's own per-sound timeline, **shape** from a mapping of those
sounds to a small set of visible mouth shapes with the closures protected, and
**emphasis** from the loudness envelope, scaling how far each syllable opens.
The closures are the part the eye checks — lips that meet on a /p/, teeth on an
/f/ — and a pipeline that merges short segments for smoothness erases exactly
those. A non-human speaking element (a seam of light, an aperture, a core) takes
the same three inputs: it brightens, hinges or swells on the opening and dips on
the closures, and it reads as speech for the same reason a mouth does.
Viseme-drive holds the mapping, the protection and the renderer's lead.

## Stillness is part of the performance

A presence that never stops moving is restless; one that parks between gestures
is a photograph. Idle motion — breath, a slow drift, blinks at believable rates
and moments, saccades — carries the impression of attention, and its amplitude is
a design decision tied to the character: a calm presence moves less, and a busy
form (one whose art already shimmers) needs less head motion on top. Procedural
presence motion owns this, together with the gestures that come from the text
rather than the audio — the tilt at the end of a question — which no audio-only
model produces.

## The face is optional, and the voice must not notice

A face is an addition to a voice that already works, and it ships as one. The
heavy half — a motion model, its numeric stack, its accelerator — runs beside
the voice process, in an environment of its own, and is asked per sentence for
what it can do. When it is missing, slow or broken, the voice plays the same
samples it always did and the face falls back to loudness-driven speech and
procedural motion; no face artifact is ever worth holding a sentence for longer
than a short, bounded wait. Per-sentence-face-sidecar holds the shape of that
process boundary.

## One face, wherever she appears

A companion that shows its face on several surfaces shows one face. Exactly one
place produces the face signal, and it is the place that owns the audio clock —
the player whose position says which sound is sounding now. Every other surface
draws a mirror of that signal, sent at a capped rate with phase changes sent at
once, so two windows never disagree about whether she is speaking. The face
follows the player, not the voice pipeline's events: synthesis runs ahead of
playback, so a "done" can arrive while the last words are still sounding, and a
mouth that shuts on the event reads as a recording. The renderer and everything
that feeds it stay out of a surface's first paint, and a face at rest stops
asking for frames. Face-signal-across-surfaces holds these rules.

## Failure modes the standard exists to prevent

- **The sample-image verdict** — a route chosen because it looked good on the
  model's own sample face, then found unable to detect, drive or preserve the
  product's actual art.
- **The throughput claim** — "runs at 30 frames per second" measured unpaced,
  while the lag against the audio clock grows by a second every few seconds of
  speech.
- **The playback-only cost** — a hybrid sold as light because its renderer is,
  with the motion model's accelerator, memory and per-sentence compute left off
  the page.
- **The window read as a floor** — a hybrid ruled "offline only" because its
  model analyses seconds of audio, when the voice renders whole sentences ahead
  of playback and the window never waits on the clock.
- **The isolated-factor verdict** — learned motion declared viable without an
  accelerator because it computes faster than real time alone, when on that
  machine the voice shares the same cores and the share of speech that actually
  carries the motion is a few per cent.
- **The accidental accelerator** — a motion model that picks its own device and
  never falls back to the CPU, so "runs anywhere" quietly means "runs where there
  is an accelerator".
- **The ghost layer** — a static part holding a copy of a moving one, visible the
  first time the head turns.
- **The smoothed-away closure** — a mouth timeline merged for smoothness until the
  lips never meet.
- **Blinks taken literally** — a learned lid signal mapped one-to-one onto full
  blinks, producing sixty a minute.
- **The busy head** — learned head pose played unfiltered, bobbing at syllable rate.
- **The zero-filled channel** — a motion source's missing group written as zero,
  freezing a feature that another source would have animated.
- **The licence inside the model** — a permissively licensed talking-head model
  that ships a face detector licensed for research only.
- **The face that holds the voice** — a sentence that waits on the face's helper
  without a deadline, or audio that differs depending on whether the face is on.
- **The mouth that shuts early** — a face that stops speaking on the pipeline's
  "done" while the player is still sounding the line.
- **Two faces** — each surface computing its own face from its own copy of the
  events, so they disagree about phase and mouth.

## The techniques

- [motion-route-selection](./techniques/motion-route-selection.md) — choosing rig,
  neural or hybrid on the product's own art, hardware and pacing, with a common
  bench and a blinded verdict; a self-probe for the motion default, and distil
  before switching models.
- [single-image-layer-decomposition](./techniques/single-image-layer-decomposition.md) —
  splitting one still into drivable parts, filling what lay behind them, and the
  light-on-black variant.
- [rig-parameter-contract](./techniques/rig-parameter-contract.md) — the closed,
  versioned per-frame vector between motion sources and renderers.
- [viseme-drive](./techniques/viseme-drive.md) — sounds to mouth shapes, closure
  protection, loudness emphasis, the renderer's lead, and non-human speaking
  elements.
- [procedural-presence-motion](./techniques/procedural-presence-motion.md) — idle,
  blinks, saccades, text-driven gestures and the amplitude that suits a character.
- [neural-motion-retargeting](./techniques/neural-motion-retargeting.md) — turning a
  model's unnamed motion latent into rig parameters, filtering it into
  something a viewer believes, and making the model cheaper against its own
  seed-to-seed gap.
- [paced-realtime-measurement](./techniques/paced-realtime-measurement.md) — lag
  against the audio clock, per-stage profiles, warm processes, coverage with the
  voice on the same cores, and the honest cost of each route.
- [per-sentence-face-sidecar](./techniques/per-sentence-face-sidecar.md) — the
  face's heavy half as a helper process beside the voice: capability probe,
  deadlines, backoff, and a voice that is identical with and without it.
- [face-signal-across-surfaces](./techniques/face-signal-across-surfaces.md) —
  one producer on the audio clock, a capped mirror, speaking until the player
  has, absent channels as no say, out of the first paint, and settling at rest.
