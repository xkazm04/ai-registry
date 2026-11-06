---
layer: application
type: application
subject: generative-provider-routing
technique: vendor-fact-ledger
status: forged
stack: process
verified_on: 2026-08-20
---

# A worked vendor fact ledger — the image-model landscape, August 2026

The vendor-fact-ledger technique says: record what you learn about each
provider once, dated, so nobody re-researches it. This application IS such a
ledger — a dated, sourced snapshot of the text-to-image landscape as of
2026-08, in the shape a routing plan consumes. It will go stale; that is
what the dates are for. Entries follow the technique's rule: capability
facts, cost class, and craft quirks, each attributable to a source.

## The dialect split (routing-relevant, per prompt-dialect-matching)

| Family | Encoder class | Dialect | Notes |
|---|---|---|---|
| FLUX.1/FLUX.2 (Black Forest Labs) | T5-XXL + CLIP-L | prose (512-token dev / 256 schnell) | attention-weighting syntax ignored; negatives non-functional on distilled dev/schnell |
| GPT Image 2 (OpenAI) | LLM-native | prose, long | arena Elo leader overall; strong instruction-following + text |
| Nano Banana Pro / Gemini 3 Pro Image (Google) | LLM-native | prose, long | ~94% text-render accuracy claim; up to 5 characters / 14 reference objects held across calls |
| Qwen-Image 2.0 (Alibaba, open) | LLM-class | prose | open-weights leader for CJK/Arabic typography; 7B arena-competitive, cheap |
| SDXL + derivatives | dual CLIP | tags, ~77-token window | weighting syntax works; negatives load-bearing |
| Illustrious-XL / NoobAI-XL | SDXL-class | Danbooru tags | anime production standard; exact booru vocabulary; heavy anatomy negatives; v-pred variants need matching sampler |
| Midjourney V8.x | proprietary | prose + parameters | `--sref`/`--oref` reference system (V8.1 default since 2026-06); `::` weights, `--no` negatives |
| Recraft V3 | proprietary | prose | only model emitting true SVG as of 2026-08 (no longer: see Later entries); brand-style lock from uploads |
| Ideogram 4 | proprietary | prose | long-form typography/logo specialist |
| Seedream 5 Pro (ByteDance) | LLM-class | prose | top-tier multi-region text rendering |

## Capability → preferred vendors (2026-08)

- **In-image typography**: Nano Banana Pro, GPT Image 2, Seedream 5 Pro,
  Qwen-Image (CJK), Ideogram 4 (logos/long text), Recraft V3 (any length,
  SVG). SDXL-family not viable. In a seven-region character-accuracy probe
  (single run, Latin only), GPT Image 2 / Nano Banana 2 / Seedream 5 Pro
  preserved every character; Ideogram V4 flipped one digit pair. Per-character
  proofreading remains mandatory; exact brand fonts still composite.
- **Photorealism**: FLUX.2 (open, 32B, 4MP) and GPT Image 2 / Nano Banana
  Pro (closed). Camera-physics prompting per medium-vocabulary-locking.
- **Painterly / concept art**: Midjourney V8.x remains the art-director
  default.
- **Flat vector / brand illustration**: Recraft V3 — the only true-SVG
  emitter in 2026-08; everything else rasterized "vector style". Ideogram
  Vector now sells it too (see Later entries).
- **Anime/manga**: Illustrious-XL / NoobAI-XL with booru tags — the one
  niche where tag dialect and negative prompts remain essential.
- **Batch style consistency**: explicit conditioning (Midjourney sref+oref,
  Recraft brand lock, Nano Banana multi-reference) layered over a restated
  style core — see visual-style-locking's boundary note.

## Cost classes and routing consequences

Single families now span self-host-free to premium API: FLUX.2 Pro (API) /
Flex / Dev (open weights) / Klein (consumer GPU; the license splits by size -
4B is Apache-2.0, 9B is the FLUX Non-Commercial License, re-checked
2026-09-17, so a commercial route may take only the smaller Klein);
Qwen-Image runs locally; SDXL derivatives are free local compute; GPT Image 2 and Nano
Banana Pro are premium per-image APIs. Routing consequence: prototype on
the free tier of a family, finish on its API tier with the same prompt
dialect — the cross-family port (prose↔tags) is the expensive hop, not the
cost-tier hop inside a family.

## Deprecations

- Imagen 4: shutdown announced for 2026-08 — do not adopt.
- Midjourney `--cref`: superseded by `--oref` in V7+.

## Later entries (each with its own access date)

The snapshot above stays an August snapshot. These four were read at the vendor
on 2026-11-06, and nothing else was re-checked, so `verified_on` does not move.

| Model | Route | Licence | Quirks that bear on routing |
|---|---|---|---|
| Ideogram Vector (`ideogram-vector-1`) | hosted API, text to SVG and image to SVG | page does not say; its open-source links point at Ideogram 4 | $0.13 / 0.16 / 0.20 per SVG, $0.32 at high with references; $0.10 per vectorized image; "editable" is the vendor's word; no release date on the page |
| FLUX 3 Image Klein (5.5B) | open weights, sign-in to download (`gated: auto`), repo created 2026-10-13 | FLUX Kommunity License v1.0: non-commercial, plus commercial output for Qualifying Users under US$5M gross annualized revenue, affiliates included; "not blanket permission for commercial fine-tuning or distribution" | distilled 16 steps with no guidance, base 50 steps at CFG 3.5. The split is by the user's revenue, not by model size, so the FLUX.2 Klein sentence above does not carry over |
| Qwen-Image 2.1 and 2.1 Turbo (7B) | open weights, repos created 2026-09-14 and 2026-10-09 | Qwen Research License on both: "research or evaluation purposes only", a separate licence for any commercial use | Turbo is 8 steps, CFG 1, schedule saved in the checkpoint, so `num_inference_steps` alone does not override it. "Open" in the 2.0 row above does not mean a commercial route here |
| Krea 3 | hosted API, `POST /generate/image/krea/krea-3`; no weights mentioned at the vendor | not stated | base $0.03 at 1K, $0.06 at 2K, plus references and thinking mode. `regional_edit` is "a local edit that keeps the rest of the image exact", with bounding-box `regions`. "Reusing a seed does not guarantee identical results, because the prompt expansion step can vary between runs", so a fixed seed is no repeat control on this route |

## Sources (accessed 2026-08-20)

- https://www.buildmvpfast.com/articles/best-llms-2026-guide/image-generation-ai
- https://wiki.shakker.ai/en/flux-image-generation
- https://tripleminds.co/blogs/technology/flux-vs-sdxl-vs-pony/
- https://note.com/reocoffee/n/n8efb5707dfa2 (anime model landscape)
- https://blog.google/innovation-and-ai/products/nano-banana-pro/
- https://wavespeed.ai/blog/posts/google-nano-banana-pro-complete-guide-2026/
- https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
- https://replicate.com/recraft-ai/recraft-v3-svg
- https://www.thundercompute.com/blog/best-open-source-image-generation-models
- https://www.atlascloud.ai/blog/guides/qwen-image-2-0-vs-flux-2-why-this-7b-model-is-beating-the-giants-in-ai-arena
- https://masonry.so/blog/best-ai-image-model-for-text-rendering
- https://fal.ai/ideogram-4
- https://huggingface.co/black-forest-labs/FLUX.1-dev/discussions/43
- https://civitai.com/articles/10087/ (CFG on distilled models)
- https://huggingface.co/black-forest-labs/FLUX.2-klein-9B (accessed 2026-09-17) - "the
  FLUX.2 [klein] 4B models under an Apache 2.0 license and ... the 9B models under a
  non-commercial license"; only this entry was re-checked, so `verified_on` stays at the
  date the rest of the ledger was resolved
- Accessed 2026-11-06, for Later entries only:
  https://ideogram.ai/models/vector;
  https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy;
  https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo and its LICENSE;
  https://krea.ai/docs/developers/krea-3/overview
