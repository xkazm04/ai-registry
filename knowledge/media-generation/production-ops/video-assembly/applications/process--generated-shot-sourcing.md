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
