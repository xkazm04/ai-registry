---
source: https://www.youtube.com/watch?v=kCLnj-XhweM
kind: youtube
url: https://www.youtube.com/watch?v=kCLnj-XhweM
title: "GPT-6 + Blender is Insane for AI Real Estate Videos"
author: "Mira AI"
words: 1793
extracted: 8
accepted: 0
declined: 0
leads: 3
already_covered: 4
untriaged: 0
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: intake-kcl
siblings: 0
---

Class: first-party build-walkthrough (tutorial), n=1, demo half proudest of the layout lock. Expected yield: low; one render-bound mechanism plus catches. 0 web fetches. The operator asked for an Opus subagent in place of the video's GPT-6 agent; the Opus worker drove Blender 5.2.2 headless.

## Candidates
| # | Claim | Anchor | Read | Outcome |
|---|---|---|---|---|
| 1 | Plain-white blockout built from a floor plan, rendered as a gray camera walkthrough, locks layout and camera for a video model that repaints it | 02:07-02:32, 05:05 | partial: the corpus's moving-reference rule says a clip controls camera/blocking "never identity, style, or setting"; a texture-stripped clip is the case where setting IS the controlled thing | **lead** - render proof below; operator picked arm A on look, so not landed |
| 2 | Openings into space the blockout does not model are where the video model invents (the doorway beside the staircase) | 06:46-07:12 | real gap | **lead** - did not reproduce in 5 s clips (0 of 4 runs invented a room); return when a chained or longer clip is run |
| 3 | Name the recurring failure explicitly in the prompt | 06:46 | likely catch | already covered (default-attractor-rejection: a banned outcome needs its reason) |
| 4 | Chain clips by last frame; split 40 s to the generation cap | 04:40, 07:12 | likely catch | already covered (generated-shot-sourcing: adjacency chaining, clip caps, drift ceiling) |
| 5 | Give every reference a specific job | 06:46 | likely catch | already covered (moving-reference negative scope; reference-shows-only-invariants) |
| 6 | Real photos as style reference for an existing property | 04:14 | likely catch | already covered |
| 7 | Three looks from one locked model | 04:14 | thin | folded into 1 |
| 8 | Vendor stack: GPT-6 Astra in Blender via Higgsfield plugin, Nano Banana 2.1, Seedance 2.5 | 00:24 | n/a | **currency** - vendor-reported, no primary fetched; not landed. Return: a vendor page or second source |

## Render proof (Phase 6b, local, operator-triaged)
Arms, one variable (depth-render control video from the blockout), same style image (Flux2), model (MiniMax H3 first-frame image-to-video, 768x448), length (5 s) and seeds (101, 202). LTX has no installed control route; LTX is `unmeasurable` for this claim, instrument named: an LTX-2.x depth or canny IC-LoRA.

| Run | mean edge IoU vs gray frames (f31-f121) |
|---|---|
| frozen style image (control) | 0.129 |
| A s101 / s202 | 0.144 / 0.147 |
| B s101 / s202 | 0.335 / 0.327 |

Discrimination ratio 22.4 (floor 1.5). Blockout fidelity: 8/8 walls, 3/3 doors, 2/2 windows, min camera clearance 0.525 m. Arm A held its layout by hardly moving the camera, so the ratio measures "follows the planned path" at least as much as "keeps the architecture". Seed difference 0.003 (A), 0.008 (B).

**Operator verdict (2026-10-25): arm A looks slightly better.** Verdict: `not-better` for landing the layout-lock technique. Nothing is landed in the upper layers. The measured structure effect is kept here as a dated finding. Also: the operator accepted Flux2 as the image route for this kind of intake.

## Leads (return conditions)
- Layout-lock reference: return when a chained or >5 s clip arm is run where arm A cannot get a walkthrough by text alone (A's static camera makes the pair unfair at 5 s).
- Unmodelled-opening invention: same return condition.
- LTX control route: when an LTX-2.x depth/canny IC-LoRA is installed.

Cleanup: scratch folder, ComfyUI output `intake-kcl/` and staged `intake-kcl-*` inputs deleted by run id after the operator's verdict.
