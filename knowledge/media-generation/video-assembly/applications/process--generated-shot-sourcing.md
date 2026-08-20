---
layer: application
type: application
subject: video-assembly
technique: generated-shot-sourcing
status: forged
stack: process
---

# A worked sourcing ledger — the video-model landscape, August 2026

The generated-shot-sourcing technique says: brief models on a conditioning
ladder, budget against clip caps, decide baked-in audio per clip, and price
by usable second. This application is the dated, sourced snapshot of the
generative video landscape as of 2026-08 that such briefs are written
against. It will go stale; that is what the dates are for — it mirrors the
vendor-fact-ledger form used for the image landscape.

## The frontier, and what each is for

| Model | Vendor | Sourcing role | Notes (2026-08) |
|---|---|---|---|
| Seedance 2.0 | ByteDance | keyframe-anchored shots | #1 on Artificial Analysis since 2026-02; native head-and-tail dual-anchor conditioning — the reference implementation of the ladder's rung 3; Fast tier ~$0.09/s |
| Veo 3.1 | Google | realistic hero shots | true 4K, native 48 kHz synchronized audio; ~$0.03/s entry, up to ~$0.75/s on top tiers |
| Kling 3.0 / Omni | Kuaishou | multi-shot sequences | up to 6 connected shots per request on a shared audio timeline; lip-sync in 5 languages; ~$0.10/s direct, ~$0.029/s (720p) via aggregators |
| HappyHorse-1.0 | Alibaba | arena challenger | released 2026-04; top-2 on Artificial Analysis with Seedance 2.0 |
| Wan 2.6 / 2.7 | Alibaba (open) | budget / self-host lane | ~$0.05/s native 1080p — cheapest usable class; open family |
| Hailuo MiniMax-H3 | MiniMax | reference-conditioned shots | 2026-07; $0.13/s at 2K; reference *video* billed per second of input, reference images 5 free then $0.04 each — conditioning is now metered |
| Runway Gen-4.5 | Runway | granular motion direction | motion brush, camera moves, reference-driven character consistency — the pro-control pick |
| Luma Ray 3.2, Grok Imagine 1.5 | Luma / xAI | secondary options | competitive, not category leaders |
| Sora 2 | OpenAI | **do not adopt** | deprecated 2026-04-26; API shutdown 2026-09-24 |

## Capability facts the technique's rules consume

- **Clip caps:** ~10 s standard per request across the frontier; "narrative"
  modes reach ~15 s; Kling's multi-shot mode stitches up to 6 shots. Scenes
  longer than that are multi-request by construction — seam placement is an
  editorial decision (technique: "clip caps are a structural constraint").
- **Native audio is now standard**, not a differentiator: every frontier
  model ships dialogue, effects, and ambience synchronized in the clip.
  This is the fact behind the technique's baked-in-audio rule — every
  sourced clip arrives as a mini-mix the assembly must keep, demote, or
  strip.
- **Resolution stopped being the axis.** Everything serious does 1080p or
  native 4K; the differentiating axes in 2026-08 are conditioning depth
  (keyframes, references, motion direction), multi-shot coherence, audio
  quality, and price.
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

## Sources (accessed 2026-08-20)

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
