---
layer: application
type: application
subject: character-identity-continuity
technique: reference-admitted-late
stack: process
status: forged
verified_on: 2026-08-27
use_when: [wiring a timestep-gated character reference into a diffusion graph, choosing a reference entry point for a shot generator, reproducing the crop-versus-timing ablation]
---

# Gating the reference on a local diffusion graph

From the same trailer-consistency spike (`pipeline/vlm-probe/consistency.py`,
`motion.py`). Six still lanes and two motion lanes, one character, one
location, three camera setups, fixed seed 770425 throughout.

## The graph

Flux 2 dev (fp8) through a local ComfyUI. The reference channel is
`ReferenceLatent`, which was already installed — the spike brief had budgeted
a ~20 GB reference-model download for this and it was not needed for stills at
all. Chaining `ReferenceLatent` nodes is how more than one reference is
supplied.

The gate is two `ConditioningSetTimestepRange` nodes joined by
`ConditioningCombine` (`flux_workflow(..., late=)`):

- text-only conditioning over `[0.0, late]`
- the reference-carrying chain over `[late, 1.0]`

Order matters elsewhere in the same graph: the `ReferenceLatent` chain sits
between the text encode and `FluxGuidance`. Putting guidance first drops the
references silently.

## The measured window

Scored by `identity.py` against a floor of 0.364 and a different-actor ceiling
of 0.625. "Worst pair" is the worst scoreable identity distance among the
three shots of the lane.

| lane | worst pair | camera obeyed |
|---|---|---|
| baseline, focal length only | 0.486 | — (one setup, three crops) |
| baseline, real camera moves | 0.764 | yes — **past the ceiling** |
| reference, full hero, always on | 0.168 | **no — slideshow** |
| reference, face crop, always on | 0.232 | **no — slideshow** |
| reference, face crop, joins at 45% | 0.577 | yes |
| **reference, face crop, joins at 25%** | **0.371** | **yes** |

25% is the operating point: three genuinely different setups at the real-film
floor. Two points do not make a curve and the window below 25% is unmapped —
stated here so the next run does not read 25% as a discovered optimum.

## The ablation that assigns the credit

Two things changed between the slideshow and the result — a face-only
reference crop (`face_reference()`, MTCNN box expanded 1.9× onto a neutral
grey field) and the late join. Run separately:

- **Face crop alone, reference always on: still a slideshow.** 0.232, camera
  overridden — the briefed profile medium came back frontal and the briefed
  low-angle close came back eye-level.
- **The timestep gate is what returns camera control.** The crop only stops
  the background being copied.

Without this ablation the credit would have gone to the crop, and the next
project would have cropped harder.

## The collapse, and how it was caught

The full-strength lane scored 0.168 — better than real film on every pair —
and was worthless. Two of its three shots came back as the hero still itself,
difference axis 0.0002, camera direction ignored. The identity axis called it
the best lane of the run. The contact sheet caught it; the difference axis
then confirmed it numerically.

## In motion

MiniMax H3 Ref2VA (`minimax_h3_ref2va_pruned_fp8_scaled`, 20.96 GB — the one
genuinely absent asset in the whole spike) with the ref2v 4-step turbo LoRA,
832×480, 73 frames, 4 steps. `MiniMaxH3ReferenceToVideo` takes references as
`ref_images.ref_image_N` and the prompt must name them with `<Picture N>` tags
(1-indexed) or the reference is free to be ignored.

Identity across three hard cuts: **0.1887**, tighter than one continuous take
of real film. Against last-frame chaining through `MiniMaxH3ImageToVideo` at
**0.6262**, which is the different-actor ceiling — chaining drifts to a
different person by the third clip, confirming what generated-shot-sourcing
already states about adjacency anchoring over a chain.

The relocation is visible and measured: the first frames of all three
reference-conditioned clips sit **0.02 – 0.04** apart on the difference axis.
Every clip opens on the hero. The node exposes no timestep control equivalent
to the still graph's, so the gate is untested in motion and head-trimming is
the current mitigation.

## Ops that cost hours

- Clip lengths must be ≡ 5 (mod 17); `motion.py` warns and names the nearest
  valid value rather than failing deep inside the graph.
- Flux and H3 cannot co-reside; the engine is recycled between stages.
- VRAM is what binds for video and the host-memory guard could not see it —
  clip 2 died with 20.23 GiB still held from clip 1 while RAM and commit looked
  healthy. A fresh engine per clip costs 30 s against a 20-minute generation.
- Clips get slower through a lane on identical work (1243 s, 1642 s, then past
  2400 s, where one timed out and its job vanished from history). Budget the
  per-clip timeout generously; a client that gives up early discards work the
  GPU has already done.
