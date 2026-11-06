---
layer: application
type: application
subject: video-assembly
technique: generated-shot-sourcing
status: forged
stack: process
verified_on: 2026-09-08
---

# A worked sourcing ledger — the video-model landscape, revised September 2026

The generated-shot-sourcing technique says: brief models on a conditioning
ladder, budget against clip caps, decide baked-in audio per clip, and price
by usable second. This application is the dated, sourced snapshot of the
generative video landscape that such briefs are written against. It will go
stale; that is what the dates are for — it mirrors the vendor-fact-ledger form
used for the image landscape. Sheeted 2026-08-20 and revised 2026-09-08; rows
carrying no revision note are as of the original sheet.

## The frontier, and what each is for

| Model | Vendor | Sourcing role | Notes (2026-08, revised 2026-09 where marked) |
|---|---|---|---|
| Seedance 2.5 | ByteDance | keyframe-anchored shots; **single-pass long clips** | supersedes 2.0 (2026-09); renders a full **30 s in one generation, no stitching and no extension pass** — the first frontier model to put a whole short sequence inside one request. Multimodal reference intake at scale (relays say 30 images / 10 video / 10 audio, others say 50 total — unreconciled), 3D whitebox/greenscreen blockouts as camera reference, per-second timestamp control, `.mov` out. 2.0's dual-anchor conditioning remains the rung-3 reference implementation; Fast tier ~$0.09/s. **Resolution and pricing for 2.5 are NOT vendor-published** — relays split between native 4K/10-bit and native 1080p; treat both as unconfirmed |
| Veo 3.1 | Google | realistic hero shots | true 4K, native 48 kHz synchronized audio; ~$0.03/s entry, up to ~$0.75/s on top tiers |
| Kling 3.0 / Omni | Kuaishou | multi-shot sequences | up to 6 connected shots per request on a shared audio timeline; lip-sync in 5 languages; ~$0.10/s direct, ~$0.029/s (720p) via aggregators |
| HappyHorse-1.0 | Alibaba | arena challenger | released 2026-04; top-2 on Artificial Analysis with Seedance 2.0 |
| Wan 2.6 / 2.7 | Alibaba (open) | budget / self-host lane | ~$0.05/s native 1080p — cheapest usable class; open family |
| Hailuo MiniMax-H3 | MiniMax | reference-conditioned shots | 2026-07; $0.13/s at 2K; reference *video* billed per second of input, reference images 5 free then $0.04 each — conditioning is now metered |
| Runway Gen-4.5 | Runway | granular motion direction | motion brush, camera moves, reference-driven character consistency — the pro-control pick |
| Luma Ray 3.2, Grok Imagine 1.5 | Luma / xAI | secondary options | competitive, not category leaders |
| Sora 2 | OpenAI | **do not adopt** | deprecated 2026-04-26; API shutdown 2026-09-24 |

## Capability facts the technique's rules consume

- **Clip caps — moved, and the constraint moved with them (2026-09).** The
  2026-08 reading was ~10 s standard, ~15 s for "narrative" modes, and 6
  stitched shots as the multi-shot ceiling. A frontier model now renders **30 s
  in a single pass with no stitch**, which does not retire the technique's rule
  — a scene longer than the cap is still multi-request by construction — but it
  does retire the *number*, and with it the assumption that the cap is what a
  brief collides with first. At 30 s the cap accepts a ten-beat brief and
  divides it; the binding constraint becomes the beat floor, and the model owns
  the cut points (technique: "when the cap stops binding, the beat floor
  starts"). Beyond 30 s, long-video and multi-round extension modes are claimed
  to ~180 s in beta — unverified, and extension is not single-pass.
- **Native audio is now standard**, not a differentiator: every frontier
  model ships dialogue, effects, and ambience synchronized in the clip.
  This is the fact behind the technique's baked-in-audio rule — every
  sourced clip arrives as a mini-mix the assembly must keep, demote, or
  strip.
- **Resolution stopped being the axis.** Everything serious does 1080p or
  native 4K; the differentiating axes are conditioning depth (keyframes,
  references, motion direction), multi-shot coherence, audio quality, and
  price. As of 2026-09 **single-pass duration joins that list** — it is the
  axis on which the frontier separated this cycle, and the one that changes
  what a brief has to compute.
- **Reference intake is now multimodal and metered by kind**, not a single
  conditioning image: images, video *and* audio references in one request, with
  3D blockout renders accepted as camera direction. This is the ladder's rung 4
  arriving as a product surface rather than a discipline — and it closes the
  gap the cinematic-language boundary names, where a typed camera path takes
  the numbers exactly and the prose must go silent on that dimension.
- **Identity drift remains real** and head-and-tail anchoring is the
  working mitigation — Seedance's dual-anchor mode evaluates both keyframes
  and interpolates the motion path, which is why it tops the arena for
  consistency-sensitive work.
- **Cost classes:** the market runs ~$0.03–$0.75 per rendered second.
  Multiply by observed takes-to-accept before comparing — a $0.05/s model
  at five takes is a $0.25/s model (law: cost-per-usable-output).
- **Two published spend records (read 2026-11-06, third-party class).** One
  practitioner's public project pages on one host show a 263 s music video at
  4,849 credits, about 18.4 per finished second, and a 477 s short film at
  11,520 credits, about 24.2 per finished second. The creator states just under
  $450 for the second, "wins and failed gens"; at the roughly $0.04 a credit his
  other figure implies (about 750 credits, about $30), that is the page's total,
  so its credit field looks failure-inclusive there. That reading is an
  inference, and the pages do not define their fields. The generation counts do
  not cover the whole film: the short film reads 34, all one motion model, though
  its stills were generated too. Neither page gives an acceptance rate.
- **A hosted connector is not a spend control (read 2026-11-06, vendor page
  modified 2026-10-24).** One host's agent connector always deducts credits at
  standard rates, including on a plan with unlimited web access, and that page
  names no spending limit or cost preview. A budget stated to the agent is then
  prose, so the gate has to sit outside the prompt.
- **A moving reference on one local node, read from its code (2026-11-06).**
  ComfyUI `MiniMaxH3ReferenceToVideo` takes up to 9 images, 3 videos, 3 video
  soundtracks and 3 audio files, and its description says to name them in the
  prompt as `<Picture i>`, `<Video k>` and `<Audio j>`, numbered per type. Its
  "2-15 s" is a tooltip: the code requires 5 frames, cuts a clip from its head to
  the generated length, then down to 17k+5 frames. So a 10 s orbit on a 5 s shot
  keeps half a turn, and a 120-frame orbit on a 124-frame shot keeps 107 frames.
  The text encoder sees the clip at 2 fps. The diffusion model receives every frame
  as latent tokens that are re-injected on each step: at 864x480 and 124 frames, a
  same-size clip adds as many video tokens as the shot itself (14,985), where one
  image at `ref_image_size` `match` adds about 405. `match` scales an image to the
  generation's pixel area, so a four-panel sheet gets about 0.1 MP per view and a
  single-view image about 0.41 MP. The local control patch gives reference rows a
  zero control row, so a reference and a depth pass can share a call in the code.
  The token counts are arithmetic. No timing was measured, and this machine has run
  neither the video input nor that pairing. The 2.0 series of a hosted model
  documents the same counts (0-9 images, 0-3 videos, 0-3 audio files); the 2.5 caps
  stay contested above.
- **Real faces in reference clips (read 2026-11-06, vendor doc, 2.0 series).** The
  2.0 series does "not support direct uploads of reference images or videos
  containing real human faces", and it routes portrait work through its own
  solutions, including a pre-built digital character library. One host's
  motion-transfer tool, which does not name its model, sells the opposite route:
  "Shoot on your phone". So the vendor's rule does not settle what a filmed clip
  may do on a host, and neither page says how the two relate. Check on the route
  you use.
- **A hosted motion-transfer tool (read 2026-11-06, vendor page).** It takes reference
  videos of 4-30 s and up to 30 reference images, in two modes. "Motion Transfer keeps
  the motion, camera and timing while rebuilding the scene"; "Object Swap" changes a
  selected element and preserves the rest. Its page offers no mode that keeps
  the camera without the motion, or the reverse. Its output length and price were not read.
- **A third published spend record (read 2026-11-06, third-party class).** The same
  practitioner's page for a 58.75 s scene, created 2026-09-20, shows 8 generations and
  915 credits, about 15.6 per finished second, with the same caveats as the two records
  above. He said "like 900" on camera. Whether a failed test is included is unknown.
- **A hosted connector that drives a local motion editor (read 2026-11-06, vendor page,
  skill files not read).** Nine of the 18 skills its page lists name After Effects, most
  promising editable motion, and the page says to install the editor "on the same
  computer". Its revision prompt tells the agent to "Inspect the relevant composition,
  layers, and expressions, then update the animation". That is the vendor's wording, and
  no run of it was seen. One practitioner reports the desktop agent surface was needed and
  a chat surface would not run it.
- **A spend record for an agent-written project (read 2026-11-06, one practitioner's
  report, September 2026).** A 30-second UI animation written by an agent into a project
  file took about 48 to 50 minutes unattended and "11% of the day" on a $100-a-month plan,
  plus about 20 minutes of hand-placed sound. About 20 minutes of hand fixes are reported
  separately, his screens were designed beforehand, and a second agent took 35 minutes on a
  first attempt. No revision or re-render was timed, and nothing was measured here.

## Pipeline facts (retiring a forge-era claim)

The forge-era assumption that no reliable generated-video render pipeline
exists no longer holds for short-form work: model APIs are directly
scriptable (Runway, Kling, Luma all expose generation APIs), aggregators
(fal.ai ~600 models, Replicate) put the whole table behind one key, and
JSON-timeline render services (e.g. Shotstack: POST a structured timeline
of clips/transitions/audio, receive a rendered file) close the assembly
step programmatically. The dominant production workflow is **multi-model,
routed per scene** — e.g. Seedance for on-brief commercial scenes, Veo for
realistic hero shots, Kling for stylized multi-shot sequences. Long-form
narrative still wants human direction; social clips, product demos, and
explainers are production-viable unattended.

## Sources (rows above accessed 2026-08-20; the 2026-09 revision accessed 2026-09-08)

- https://www.teamday.ai/blog/best-ai-video-models-2026
- https://www.atlascloud.ai/blog/guides/best-ai-video-generation-models-2026
- https://tech-insider.org/best-ai-video-generator-2026/
- https://pinggy.io/blog/best_video_generation_ai_models/
- https://www.buildmvpfast.com/api-costs/ai-video
- https://invideo.io/blog/ai-video-model-pricing/
- https://www.atlascloud.ai/blog/guides/cheapest-ai-video-generation-api-2026
- https://dreamina.capcut.com/ai-video/how-to-use-start-and-end-frame-generators
- https://mstudio.ai/insights/best-ai-video-generator-2026
- https://www.wireflow.ai/blog/best-ai-video-editing-api-tools-in-2026
- https://flux-1.ai/programmatic-video-generation-platform/
- https://www.cined.com/bytedance-seedance-2-5-api-goes-live-30-second-single-shot-clips-50-reference-inputs-and-3d-camera-blockouts/
- https://www.mindstudio.ai/blog/seedance-2-5-features-30-second-video-4k
- https://morphic.com/resources/models/seedance-2-5
- https://wavespeed.ai/blog/ai-api-pricing/seedance-2-5-api-watch/
- https://higgsfield.ai/@joeysnoisygroup/projects/ctrl-hold-mv (accessed 2026-11-06)
- https://higgsfield.ai/@joeysnoisygroup/projects/swing-and-a-miss (accessed 2026-11-06)
- https://higgsfield.ai/creator-hub/help-center/mcp-cli/what-is-higgsfield-mcp (accessed 2026-11-06)
- https://docs.byteplus.com/en/docs/ModelArk/2291680 (accessed 2026-11-06)
- https://higgsfield.ai/genjutsu (accessed 2026-11-06)
- https://higgsfield.ai/@joeysnoisygroup/projects/mira-and-the-dragon (accessed 2026-11-06)
- https://higgsfield.ai/mcp (accessed 2026-11-06)
- https://www.youtube.com/watch?v=r2UTG2ZyZTU (accessed 2026-11-06)

**Tiering note on the 2026-09 revision.** Every source above is a relay; no
vendor model card states 2.5's resolution, price or per-request limits, and the
relays contradict each other on reference count (30+10+10 vs 50) and on output
resolution (native 4K vs native 1080p). The conflict is recorded rather than
resolved by majority — relays are downstream of one announcement and agreeing
with each other is not corroboration. What survives the disagreement, because
it is attributed to the vendor's own claim and is what the API's headline
capability is sold on, is the **30-second single-pass render**. The contested
numbers are carried as contested and should be re-checked against the platform
API docs before any brief prices against them.
