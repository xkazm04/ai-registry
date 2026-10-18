---
layer: technique
type: technique
subject: animatable-character-design
technique: functional-animation-slots
status: forged
laws: [edit-do-not-regenerate]
shared_with: []
use_when: [writing the constraint section of a brief for a character still that will be animated, a non-human direction keeps coming back with a human face, a chosen still needs hand-painting before it can be rigged]
---

# Functional animation slots

An animation pipeline has needs, and the brief has to carry them into the
generation, because a still that ignores them costs hand-painting or a
regeneration later. The craft is in the wording. Pipelines are usually
specified by people who think in faces, so the needs arrive phrased as
anatomy — lips closed, eyes open, hair clear of the face, shoulders visible.
Every one of those words names a human part, and a constraint list written in
human parts **smuggles the human default back into a brief that just banned
it.** The model reads "lips" and draws lips.

State the needs as functions. A function admits any part that can do the job.

## The slots

Each slot is a function, why the pipeline needs it, and the anatomy phrasing
it replaces.

- **One frontal focal region that reads as a gaze, and can close or dim.**
  Attention is what makes a presence feel present, and blinking is the
  cheapest sign of life. The region may be a pair of eyes, a single lens, a
  lantern, a slit of light, a facet. It must face the viewer — a profile
  gaze cannot be driven toward the user. Replaces "two open eyes".
- **One speaking element, shown at rest.** Something that will change on
  speech — a mouth, a seam, an aperture, a pulsing core, a fold that opens.
  At rest means closed, dim or neutral in the still: the pipeline can open
  something that is closed, but a still caught mid-word or mid-smile has no
  rest pose, and painting one by hand is the most common post-generation
  repair. Replaces "lips closed, neutral expression".
- **Separable parts with clear gaps, and nothing in front of the focal
  region.** A layer split or rig moves parts independently; where one part
  overlaps another, the hidden area has to be invented before either can
  move, and invented area is where artefacts live. A thin, simple element
  that must sit behind a moving part — a ring, a halo, an arc — is the
  exception worth allowing, because its geometry is simple enough for the
  runtime to erase it and redraw it whole. Keep strands, hands,
  folds, particles and ornaments clear of the focal region and the speaking
  element, and leave visible ground between parts that will move apart.
  Replaces "hair away from the face, no hands near the face".
- **A calm, upright, centred pose with room to sway.** Idle motion — breath,
  drift, bob — needs margin inside the frame, and a dynamic pose locks in a
  moment the idle loop then has to leave. Replaces "shoulders square to
  camera".
- **A clean near-black ground.** Nothing in the background, no floor, no
  horizon, no vignette with structure in it. The ground is matted out or
  composited over, and anything in it either survives as noise or has to be
  removed.
- **An aspect and resolution floor.** State the pipeline's aspect and the
  minimum resolution of the focal region in pixels across, not just the
  canvas size: a beautiful full-body still with a focal region forty pixels
  wide cannot be driven at the size the product shows it.

## The animation note

Every candidate prompt carries a short note beside it, written by whoever
wrote the prompt, in three to five lines:

- **On speech:** what moves, and how far.
- **On blink:** what closes or dims.
- **On breath or idle:** what drifts or pulses.
- **Risk:** what is most likely to break — an occlusion, a part that will not
  separate, a speaking element too small, a gaze that a detector will not
  find.

The note is not documentation. It is a forcing function: a writer who has to
say what moves on speech has to imagine the being speaking, and a candidate
with no honest answer to "what moves" is caught before it renders. It is
also the first input to the trial, which tests the note's claims rather than
inventing its own.

## The rest frame is an edit, briefed with the prompt

Beside the animation note, each candidate carries a one-line **rest-state
edit**: the instruction an image-edit model will be given, once a still is
chosen, to produce the same image with the gaze closed or dimmed and the
speaking element fully at rest — and nothing else changed, same framing,
same scale, same ground. Writing it alongside the prompt checks that the
focal region and the speaking element are things an edit can address by
name; a candidate whose rest frame cannot be described in one sentence has
no clean rest frame.

## Repair, do not re-roll

Per [edit-do-not-regenerate](../../../_laws.md#edit-do-not-regenerate), once
a still has been chosen by the owner, a slot it misses — and the rest frame
itself — is answered with the smallest edit — an inpaint that closes the speaking element, a mask that
clears an occlusion, a ground cleaned by matting — never with a fresh
generation. A regenerated still is a different being, and the owner's
approval was of the one that is gone. The slots exist so that this repair
list is short.

## Decision rules

- When a slot is written as a body part, rewrite it as a function before the
  brief ships; read the constraint list aloud and listen for anatomy nouns.
- When the pipeline's needs are not yet known, write the slots anyway, from
  the most demanding plausible route; a still that satisfies a mesh-based
  driver also satisfies a layer rig, and not the reverse.
- When a candidate's animation note says "nothing obvious moves on speech",
  drop it or re-brief it; a presence that cannot be seen to speak is a
  portrait.
- When a slot and an aesthetic choice collide — a veil across the gaze, a
  crown of particles through the face — the slot wins, or the trial is told
  in advance that this candidate is expected to need a repair.

## When not to use it

A still that will only ever be shown static — an icon, a poster, a splash —
has no second customer, and these slots constrain it for nothing. And a
being that will be built as a three-dimensional model and animated from that
model needs a turnaround and a topology brief, not a single still with slots.
