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
| Recraft V3 | proprietary | prose | only model emitting true SVG; brand-style lock from uploads |
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
  emitter; everything else rasterizes "vector style".
- **Anime/manga**: Illustrious-XL / NoobAI-XL with booru tags — the one
  niche where tag dialect and negative prompts remain essential.
- **Batch style consistency**: explicit conditioning (Midjourney sref+oref,
  Recraft brand lock, Nano Banana multi-reference) layered over a restated
  style core — see visual-style-locking's boundary note.

## Cost classes and routing consequences

Single families now span self-host-free to premium API: FLUX.2 Pro (API) /
Flex / Dev (open weights) / Klein (Apache-2.0, consumer GPU); Qwen-Image
runs locally; SDXL derivatives are free local compute; GPT Image 2 and Nano
Banana Pro are premium per-image APIs. Routing consequence: prototype on
the free tier of a family, finish on its API tier with the same prompt
dialect — the cross-family port (prose↔tags) is the expensive hop, not the
cost-tier hop inside a family.

## Deprecations

- Imagen 4: shutdown announced for 2026-08 — do not adopt.
- Midjourney `--cref`: superseded by `--oref` in V7+.

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
