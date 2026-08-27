---
layer: application
type: application
subject: character-identity-continuity
technique: identity-ruler-calibration
stack: process
status: forged
verified_on: 2026-08-27
use_when: [standing up an identity ruler for a shot pipeline, reproducing the inversion check on a new embedding, deciding a minimum subject size for identity scoring]
---

# Calibrating the ruler on a trailer pipeline

The run this records is the trailer-consistency spike in the imaging pipeline
of a single-GPU studio tool (`pipeline/vlm-probe/`, files `identity.py`,
`consistency.py`, `motion.py`). The instrument is a separate program from the
generator on purpose, so that a disappointing number cannot quietly become a
different measurement.

## The material

Anchors were cut from the *Duel of the Fates* sequence of *Star Wars: Episode
I*, already present as extracted frames from the corpus lane. It was chosen
for one property: two principals — Qui-Gon Jinn and Obi-Wan Kenobi — wear the
same robes in the same corridor under the same red key, which supplies a hard
ceiling that a protagonist-versus-alien pair never would. Every frame used
holds exactly one unambiguous face.

    within      qui-gon @022 / @023   two moments of one continuous take
    floor       qui-gon @005 / @024   medium-close to close-up, warm to red key
    ceiling     qui-gon @023 / obi-wan @028   same robes, same corridor, same light

## The inversion, measured

The first instrument was `facebook/dinov2-base` over a `facebook/detr-resnet-50`
person box — chosen because self-supervised embeddings are the documented right
answer for *style* separation. On the identity rungs it came back inverted:

| pair | DINOv2 distance |
|---|---|
| same actor, across a cut, framing + lighting change | 0.50 – 0.59 |
| **two different actors, same robes, same light** | **0.28** |

Two different actors scored closer together than one actor across a cut. A
head-crop variant did not repair it (0.29 versus 0.51 – 0.55): the sign error
is the embedding's objective, not the crop.

Replacing it with MTCNN detection plus `InceptionResnetV1` (`facenet-pytorch`,
VGGFace2 weights) put the rungs in the expected order:

| rung | identity distance |
|---|---|
| within one continuous take | **0.188** |
| same actor across a real cut | 0.281 – **0.364** |
| different actor, same robes | **0.625** – 0.733 |

Separation floor to ceiling **+0.26**. `identity.py` prints this scale on every
invocation and refuses to report a lane distance without it; `scale_from()`
computes the rungs and `verdict()` reads every generated pair against them.

## Both axes

DINOv2 was kept, not discarded — as the **difference** axis (`look_vec()`),
where its sensitivity to framing and content is the property wanted. It earned
that place immediately: the first reference-conditioned still lane scored an
apparently excellent identity 0.168 while its difference axis read **0.0002**
between two shots briefed as different setups. They were the same image. The
identity axis alone called that the best result of the run.

## The refusal floor

`MIN_FACE_PX = 80` in `identity.py`, with `face_vec()` returning `None` below
it. The threshold is a declared floor rather than a tuned one, and the
measured gap is why:

| frames | detected face |
|---|---|
| wide shots | 12×15, 15×19, 21×28 px |
| every medium and close | 125 – 440 px |

Before the floor existed, every "reads as a different person" verdict in the
first motion scoring came from a face in the first row. That reversed a
conclusion already drawn in this session — a 0.947 within-clip distance read as
identity collapse turned out to be a 12 px face — which is the concrete reason
the floor is in the standard rather than in a comment.

## Crop selection

Both axes crop by detector on the same rule for reference material and
generated output: most-confident person box for the difference axis
(`person_box()`), MTCNN's largest face for identity. Hand-drawn boxes were
used only to *audit* the automatic ones during setup, never to produce a
reported number.

## What this application does not carry

The naive human check — three shots shown cold — stayed a human step and
overrode the metric twice in this run. It is not automatable here and is not
pretended to be.
