---
source: https://www.youtube.com/watch?v=JA4BJTvgM20
kind: youtube
url: https://www.youtube.com/watch?v=JA4BJTvgM20
title: "MiniMax H3: 16GB VRAM, 15 s 1080p (ComfyUI Tiled Sampler)"
author: "Deno"
words: 1213
extracted: 7
accepted: 0
declined: 3
leads: 4
already_covered: 0
untriaged: 0
dispatched: 0
applied: 0
shipped: 0
run_id: intake-JA4BJTvgM20
siblings: 0
---

# MiniMax H3 Tiled Sampler tutorial (Deno), 2026-11-06

Tutorial by the author of the node pack, published the day of this run. Korean original; the English captions mangle
proper nouns ("Dino", "DynamiCrafter", "Dinomics" are all Deno and DenoMix), so names were taken from the description
and from the author's repository. Swept: `comfyui-deno-custom-nodes` @ `754f2352` (tiled sampler, tiling, changelog,
README), `Pika-Labs/Pika-H3-Flex` @ `06bd434c` (hardware, prompt guide, licence), the Hugging Face cards of both, and the
author's workflow JSON. Nothing from either repository was installed or run.

The question the operator brought: can H3 cycles get faster, or give more control over content, on a chained
one-take music video with pose control?

## Candidates

| # | Candidate | Outcome | Evidence and reason |
| --- | --- | --- | --- |
| 1 | Tiled sampler for the final high-resolution step | Declined for this box | Its README: solves memory on 16 GB, "about 520 seconds" for its one final step, and "Regional conditioning and ControlNet are rejected". A 64 GB box with pose control gains nothing. Return if a final pass above 1080p stops fitting. |
| 2 | Two-stage render: 960x544 draft, latent upscale x2, one final step | Lead | Plausibly the largest source-side speed gain. Needs ComfyUI 0.44 for `MiniMaxH3LatentUpscaleWithModel` (the box runs 0.42.1), and the 3D upscaler model. Pose control must stay on the first pass only; untested with a seeded chain. Return when ComfyUI is upgraded. |
| 3 | Ref2VA instead of FL2VA for character and room | Lead, strongest | Reference tokens "ride through every sampling step" (ComfyUI node text). Local trial below: it restored the real room from a reference at 0.71x the time. One 124-frame sample, one seed: not a corpus claim yet. |
| 4 | Pika H3 Flex LoRA, six steps | Lead | The six-step contract needs its own sigma knots, "Simply choosing six steps in a generic sampler does not reproduce that contract", and Pika's card says an end-to-end ComfyUI render "has not been verified". The installed Ref2VA turbo already runs four steps. Return if four-step quality falls short. |
| 5 | DenoMix merged checkpoint | Declined | A 21 GB merge with community fine-tunes; adds an unknown look to a film whose problem is look drift. |
| 6 | Remove the refiner and drop to one final step for speed | Declined | The source says this trades quality for speed on request of its 16 GB audience; no measurement offered. |
| 7 | Install the node pack from GitHub past the Registry's review, "ask Claude to handle the update" | Lead, caution | The author reports repeated unexplained Registry rejections and calls them false positives. Its changelog does record removing behaviours a scanner would flag. A read of the source is not a clearance; nothing here needs the pack, so it was not installed. |

## Local trial (the box, no spend, models already on disk)

124 frames at the seam of a real chain, seeded by the previous take's last frames, pose control at 1.0, seed 7705.

| Arm | Graph | Size | Steps | Wall | Result on reading the frames |
| --- | --- | --- | --- | --- | --- |
| A | FL2VA, 8-step turbo (current) | 960x544 | 8 | 307 s | Invents a window, a picture, a bin and a new monitor image |
| B | Ref2VA, 4-step turbo, character sheet + empty room as refs | 960x544 | 4 | 219 s | Room restored from the reference: shelf, lamp, monitor pattern, kettle, drawers. A bright object appears at the ceiling |
| D | FL2VA, 8-step turbo | 640x352 | 8 | 116 s | Colour goes teal; useful for motion only |

`MiniMaxH3AddGuide` and the Fun ControlNet both ran on Ref2VA, which neither source documents. None of the arms changed a
body-proportion fault that came from our own skeleton.

## Found outside the source

The largest lever was not in the source. The same H3 graph ran 275 s or 740 s per step depending on the machine's state:
display-off Modern Standby (Kernel-Power 506/507) throttles the GPU. Twelve takes wholly in standby had a median of 6184 s;
one mostly awake took 2869 s. Before tuning a model on a box that sleeps, read the step time against the power events.

## Licence flag

The MiniMax H3 Community License defines its territory as worldwide excluding "the European Union, the United Kingdom, the
Republic of Korea and the United States of America". Read at the source on Hugging Face on this date. Raised to the operator
as a question for them; this note gives no legal reading of it.

## Not landed

No bundle changed. The source originates; one trial on one seam does not authorize a technique. Items 2 and 3 return when a
full-length chained take has been measured, which the operator's next cycle will do.
