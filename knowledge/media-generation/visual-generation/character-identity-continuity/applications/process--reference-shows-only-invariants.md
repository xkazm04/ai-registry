---
layer: application
type: application
subject: character-identity-continuity
technique: reference-shows-only-invariants
stack: process
status: forged
verified_on: 2026-08-27
use_when: [extending the trailer-consistency probe to cover the subject's state, auditing a frame-annotation schema for what it cannot describe, deciding whether an existing consistency result says anything about expression]
---

# What the trailer-consistency rig does not measure

Read on 2026-08-27 against `pipeline/vlm-probe/` in the trailer-consistency
spike — the same tree the other two applications in this subject were written
from. Nothing was generated or re-run here; this records what the rig holds
and what its numbers therefore cannot be asked.

## The hero still already follows the rule

`consistency.py` mints the reference from one prompt:

> Neutral three-quarter portrait, plain mid-grey studio background, flat even
> light, sharp focus, the full head and shoulders in frame, looking slightly
> off camera.

Neutral expression, canonical three-quarter angle, flat even light, plain
field — the construction the technique argues for, arrived at independently
and before any of this was written down. Worth recording as convergence rather
than as a citation.

The one clause to notice is **"looking slightly off camera"**. It is a good
choice and it is a *state* choice: the eyeline of every downstream shot
inherits from it. It was not recorded anywhere as a decision, which is exactly
the failure mode the technique names — a constant in the batch that nobody
knows is in the batch.

`face_reference()` (MTCNN box expanded 1.9× onto a neutral grey field)
confirms the crop's limit in code: it removes the hero's background and body
pose and cannot touch the expression, the gaze, the head angle or the light on
the face, all of which are inside the crop.

## Why the spike's numbers say nothing about state

`CHARACTER` is reused byte-for-byte and `SHOTS_SPEC` / `ZOOM_SPEC` vary the
camera and the action. No shot clause in either list names an expression;
head orientation appears only as a consequence of a camera description
("profile to three-quarter") and, once, as an action ("she turns her head
toward the light"). **The lanes never asked the character to feel anything
different**, so a state freeze could not have shown up in them, and the 0.371
worst-pair result at a 25% entry point is a claim about identity under camera
change only.

Both instruments in the tree are structurally blind to it as well:

| instrument | what it reads | what a frozen expression does to it |
|---|---|---|
| `identity.py` IDENTITY — FaceNet/VGGFace2 on an MTCNN crop | who the face belongs to, by design invariant to expression and pose | nothing; scores its best |
| `identity.py` LOOK — DINOv2 on a DETR person box | costume, palette, framing, grade | nothing; the frames differ on camera anyway |

The vision-annotation rig in the same directory is the third blind spot and
the most surprising one. `schema.py` carries roughly two dozen fields —
`shot_size`, `camera_angle`, `lens_impression`, `lighting_key`,
`lighting_direction`, `contrast`, `palette`, foreground/midground/background,
`genre_register` — and **no field for what the subject's face is doing**. The
only place a state could land is the free-text `subjects` list ("the people or
creatures in frame and what each is doing"), which is not enumerated, not
scored against truth, and not compared across a lane. A rig built out of
`cinematic-language`'s vocabulary describes the frame and never the performer.

## The lane that would answer it, and what it costs

The coupling probe the technique asks for fits this harness with no new
model and no new download:

1. One lane, hero and camera held fixed at the settled 25% entry point, three
   shots briefed for three expressions and one briefed with a contradicting
   eyeline.
2. Score identity with `identity.py` unchanged — the expectation is that it
   does not move, and that is the point being demonstrated.
3. Add an enumerated `subject_expression` and `subject_gaze` to `schema.py`
   and run `probe.py` over the lane's frames. `frames/truth/<stem>.json`
   already exists as the known-answer pattern, and here the truth is free:
   the brief stated the expression, so the correct answer is written before
   the frame is generated.

Three outcomes, three plans, per the technique. The cost is one lane of GPU
minutes plus two schema fields; the schema change also pays for itself outside
this subject, since the same absence makes every frame annotation in the tree
silent about performance.

## What is owed

The lane above has not been run. Until it is, the honest statement of this
tree's position is: the reference is state-scrubbed by construction, its one
unrecorded state choice is the eyeline, and nothing here has measured how much
of that the generator carries into a shot.
