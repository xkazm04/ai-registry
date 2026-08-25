---
layer: application
type: application
subject: generative-provider-routing
technique: capability-to-vendor-plan
status: forged
stack: process
verified_on: 2026-08-24
refresh_by: 2026-11-24
---

# The local tier enters the video plan — open-weights vendors, August 2026

The capability-to-vendor-plan technique says the vendor split is an
environment decision held in one table. As of 2026-08 that table gains a row
it did not have a year ago: **local open weights** is now a real vendor tier
for text-to-video and image-to-video, not just for stills. This application
records the eligibility facts that decide whether the local row may serve a
given deployment — and the trap that makes "open weights" and "routable
vendor" different claims.

## License is a plan-eligibility fact, not a footnote

The event that forced this row: **MiniMax H3** (Hailuo 3.0, 33B, native
32 kHz audio, 4–15 s clips) shipped open weights on 2026-08-03 and became
the first open-weight model to place top-3 in the hosted video arenas
(#2 T2V-with-audio, ~1242 Elo). Every "best local video model" headline
traces to it. But its Community License **excludes the US, EU, UK and South
Korea from the applicable territory for local deployment — including use of
the outputs** — and requires written authorization above $20M revenue, H3
attribution in UI, and forbids distillation. A routing plan that lists H3
as a local vendor for a US/EU deployment has confused *downloadable* with
*licensed*. The plan's local row therefore carries a license column, checked
per deployment territory, before any capability fact is consulted.

Second trap, same headline: the arena score belongs to the hosted pipeline
(2K via H3-Regenerate-2K). The open weights emit 768p base output; the stage
that earned the ranking is not in the release. A plan that routes "quality"
to the local H3 row on the strength of the hosted benchmark has priced the
wrong artifact.

## The local video plan that survives the license check (2026-08)

| Vendor row | License | 24 GB-class fit | Facts (dated) |
|---|---|---|---|
| Wan 2.2 / 2.5 (Alibaba) | Apache-2.0 | yes — TI2V-5B ~10 GB fp16; 14B via fp8/offload | T2V+I2V one checkpoint, 720p24; community-cited leader for photoreal humans; ~9 min per 5 s clip on RTX 4090 (14B class) |
| LTX-2.x (Lightricks) | permissive (LTX license) | yes — fastest of the class, ~3× faster than H3 in community tests | speed/production leader; quality trails Wan on humans |
| HunyuanVideo 1.5 (Tencent) | community license | yes, quantized | ~280 Elo behind H3 hosted; superseded feel by 2026-08 |
| MiniMax H3 (open weights) | **blocked: US/EU/UK/KR excl.** | marginal — pruned INT8 19.5 GB + NVFP4 encoder 14.6 GB, needs ~62 GB host RAM, 21.9 GB peak VRAM, ~300 s per 5 s 768p clip on a 4090 | best raw open-weights quality where licensed; 768p local ceiling |

Hosted APIs (Veo 3.x, Kling 3.0, Sora, H3's own API at ~$0.08–0.13/s) still
hold the quality ceiling: 2K, stronger physics, no quantization loss. The
routing consequence mirrors the image-side ledger: **draft locally, finish
hosted** — the local row serves the exploratory and volume stages where
per-render price dominates, the hosted row serves the promoted winner.

## Proof on the reference machine (RTX 4090 24 GB, 64 GB RAM)

Measured on 2026-08-24, ComfyUI 0.21.1, torch 2.6.0+cu124, Wan 2.2 TI2V-5B
fp16 + umt5-xxl fp8, native workflow, 1280×704, 49 frames (~2 s @ 24 fps),
20 steps uni_pc: **76 s cold end-to-end** (51 s sampling at 2.5 s/step;
text encoder 6.4 GB + DiT 9.5 GB loaded fully, no offload; ~10 GB GPU
memory resident after the run). n=1 — a smoke proof that the local row
exists on this hardware class, not a throughput benchmark.

## Sources (accessed 2026-08-24)

- https://www.minimax.io/blog/minimax-h3 (2026-07-31)
- https://huggingface.co/MiniMaxAI/MiniMax-H3
- https://comfyui-wiki.com/en/news/2026-08-03-minimax-h3-open-weights-comfyui (2026-08-03)
- https://www.techtimes.com/articles/322904/20260804/minimax-h3-open-weights-exclude-us-eu-uk-korea-local-deployment.htm (2026-08-04)
- https://www.atlascloud.ai/blog/tips/minimax-h3-commercial-use-license
- https://www.pedroalonso.net/blog/minimax-h3-local-rtx-4090/ (2026-08-09) — 4090 run: flags, peak VRAM, timings
- https://www.virse.ai/blog/minimax-h3-reddit-review (2026-08-07) — community speed/quality consensus
- https://www.aimagicx.com/blog/open-source-ai-video-models-comparison-2026 — Wan vs LTX vs Hunyuan
- https://curiousrefuge.com/blog/minimaxh3-review — quality dissent vs Seedance
