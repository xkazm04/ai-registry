---
source: batch
kind: batch
url: "youtube:IrAHINf0M6E"
title: "Weekly news currency, /shift batch of 1 video from 1 channel"
author: "1 channel: Matt Wolfe"
words: 4857
extracted: 15
accepted: 0
declined: 0
leads: 4
already_covered: 1
untriaged: 3
currency: 7
dispatched: 0
applied: 0
shipped: 0
run_id: weekly-news-currency-1108
siblings: 2
fetches: 10
---

# Weekly news currency, mined under /shift, 2026-11-07

Plan `plan-20261107-120659`, cluster `weekly-news-currency`, board run
`2026-11-07-intake-shift-plan-20261107-120659-weekly-news-c-1808`. One news survey, read from its
complete caption transcript (4,857 words, 00:00:00 to 00:24:26). The plan said the transcript stops at 7:14.
It does not. Phase 7.7: gate=skipped. The sponsor segment (00:05:07 to 00:06:03) is excluded.

**Expected yield, stated first:** currency, leads and catches, with no upper-layer landing. That held.
**Voices:** one. W = Matt Wolfe. This is the same channel as the 2026-11-06 `weekly-model-currency`
batch, not another channel as the plan says, so nothing here converges with that batch.

**Admission:** no row reached Phase 5 scoring. Every upper-layer-shaped row (4 as a technique, 11, 13)
fails V2 first, with no trial and no primary, so it is untriaged or a lead and never declined. The
+3 accept bar in force for this shift (raised after fp=1, 1, 1, 2 and 4 across runs) governed nothing,
because nothing was scored. `auto=0/0/0 fp=0`. Currency rows ran under the corroboration table.

## What landed

One dated currency entry, checked by the lander from raw vendor page text. `verified_on` did not move.

| Row | File | Change |
|---|---|---|
| 1 | `generative-provider-routing/applications/process--vendor-fact-ledger.md` | GPT Image 2.6 Sunburst and Flare under "Later entries", with its own access date |

Nothing changed in gravitone or in any other project.

## Triage

All rows are voice W.

| # | Claim | Anchor | Outcome | Return condition or reason |
|---|---|---|---|---|
| 1 | GPT Image 2.6 (Sunburst, Flare) in ChatGPT and the API | 00:00:00 | **currency, landed** | See "What the promotion read found" |
| 2 | Animated GIF and SVG output from the image model | 00:00:25 | lead | A project asks for animated output, and a vendor page documents GIF parameters or GIF through the route the stills go by |
| 3 | One image in 20.4 s | 00:01:42 | untriaged | A single consumer-app timing, not a benchmark |
| 4 | P-H3-Image as a local keyframe source for H3 chains | 00:02:07 | lead, held-row candidate after setup | Operator calls below. As a technique, V2: no trial |
| 5 | Gemini Omni 1.2 Flash: 15 s clips, 30% cheaper than 1.1, about $0.07/s at 720p | 00:06:03 | currency, no repo file | Rests on the host. No document carries an Omni price, and gravitone's route is H3, LTX and Veo. The host's "$15" for 15 s is an arithmetic slip; at $0.07/s it is about $1.05 |
| 6 | Pika H3 Flex | 00:09:24 | lead, `reconsider?` against 2026-11-06 tiled-sampler row 4 | Unchanged: the 11-06 repo read (an H3 LoRA with a six-step contract) outranks the host's "open video model, 220 GB". Return if four-step quality falls short |
| 7 | Kimi K3.1 Pro weights published | 00:17:32 | catch | Landed 2026-11-06 (E1), 1,561 GB against the 64 GB limit |
| 8 | ChatGPT and Codex share one usage allowance | 00:17:05 | currency, no repo file; corrected | The vendor says ChatGPT **Work** and Codex share. See below |
| 9 | A cyber model gated to security professionals | 00:17:05 | currency, no reset | |
| 10 | Voice and video calls with a consumer assistant | 00:11:57 | currency, no reset | 2026-11-06 K9 holds the standing |
| 11 | An agent checks a number's owner before it calls, then discloses automation and recording | 00:14:06 | untriaged | V2: one demo, no primary. No fleet project places calls |
| 12 | Read-only bank link in an assistant | 00:18:26 | currency, no repo file | |
| 13 | Video editor that learns taste from edit decisions | 00:19:17 | lead | Early access. The tool is readable, and the gravitone music-clip verdict loop is the possible use |
| 14 | Agent commerce is near zero (hundreds of agent orders against millions a day) | 00:20:09 | currency, no repo file | Earnings-call figures, relayed |
| 15 | Sponsor, discover tab, orbital TPU, election and IPO talk | 00:05:07, 00:19:43, 00:21:51, 00:22:17 | untriaged | |

## What the promotion read found

The miner read the OpenAI guide through a summarising reader. The lander re-read the raw markdown of
the guide and the model pages, the Comfy tutorial, the Hugging Face API for both P-H3-Image repos and
the H3 file, the Codex pricing page, and gravitone's HEAD.

- **The guide still leads with 2.5.** The overview and every code sample name `gpt-image-2.5-sunburst`
  or `-flare`. 2.6 is one section: "The existing examples below use GPT Image 2.5."
- **2.6 is documented for the Image API only.** Both 2.6 model pages list `v1/images/generations` and
  `v1/images/edits`. The 2.5 page says "Select it directly in the Image API or as the model of the
  Responses API image generation tool". The 2.6 pages say nothing like it. The miner did not have this.
  Whether Codex `image_gen`, the operator's stills route, renders with 2.6 is therefore not established
  from documentation. Codex CLI 0.166.0's config names no image model.
- **2.6 costs the same per token as 2.5:** $5 text in, $8 image in, $30 image out per 1M. The miner
  found no price. The model pages carry it.
- **Gravitone names only 2.5.** At gravitone HEAD `6331ec94`, `packages/kernel/src/router/tables.ts:107,122`,
  `packages/kernel/src/pricing/table.ts:149,158`, `lib/imaging/pricing.ts:198,214`,
  `lib/imaging/studio/selectors.ts:30`, `lib/imaging/providers/leonardoFlare.ts:54` and
  `pipeline/music-clip/keyframes.mts:7` name `openai/gpt-image-2.5-sunburst` or `-flare`. No tracked
  file names 2.6. The miner missed one thing: these rows are **Leonardo** routes (`leonardo-studio` over
  CDP and `leonardo-flare` over the Leonardo API key), not OpenAI's API. So moving to 2.6 waits on
  Leonardo listing it, not on an OpenAI price. Nothing changed there.
- **Shared allowance, row 8.** The Codex pricing page opens: "ChatGPT Work and Codex share usage.
  ChatGPT Work usage inside ChatGPT uses the same pricing, credits, and usage limits as Codex." That is
  ChatGPT Work, not every ChatGPT chat as the host said. The same page settles the part that matters
  here: "Image generation counts toward the same general usage limits as local messages and cloud
  chats. Image generations use included limits 3-5x faster on average than similar turns without
  image generation". Once those limits are spent it draws credits. With an API key, API pricing applies
  instead. So every Codex `image_gen` replica spends plan allowance at 3 to 5 times a plain turn.
- **P-H3-Image, row 4.** The tutorial holds: "reuses the MiniMax H3 diffusion model", "ComfyUI 0.44.0
  or later. Both templates use the PH3ImageConditioning node added in 0.44.0", "about 21 GB of VRAM",
  8 steps and no CFG. Editing takes a source image plus up to eight references. Corrections:
  - The four Pruna files are **16.95 GB**, not about 15: text encoder int8 5.12, prompt upsampler W4A8
    6.72, VAE int8 3.15 and LoRA 1.96 (`PrunaAI/p-h3-image-comfy` tree API).
  - The on-disk `minimax_h3_fl2va_pruned_int8_convrot.safetensors` is 20,970,379,616 bytes, the same
    size as the file in `Comfy-Org/MiniMax-H3`, and its SHA-256 equals that file's LFS oid. The
    miner's caveat, that only the filename matched, is closed: it is the file the tutorial expects.
  - The box runs ComfyUI **0.42.1** (`comfyui_version.py`). No `PH3ImageConditioning` node and no
    Pruna file is present. Free disk is 191 GB.
  - The full `PrunaAI/P-H3-Image` repo is 99.8 GB. The ComfyUI route needs only the four files above.
  - Licence: the MiniMax H3 Community License, which the operator has acknowledged for H3. Products
    must display "Powered by MiniMax H3". Commercial use goes through a Comfy licence request.

## Leads

- **P-H3-Image as gravitone's keyframe source.** `pipeline/music-clip/keyframes.mts` makes every keyframe
  with the paid `gpt-image-2.5-sunburst` through Leonardo (2048x1136, LOW). `clips-h3.py` feeds those
  frames to H3 FL2VA. A $0 local image model built on the same transformer is a candidate for that
  stage. It needs **two operator calls**: (1) a ComfyUI upgrade from 0.42.1 to 0.44 or later, which also
  unblocks the 11-06 tiled-sampler lead #2 (`MiniMaxH3LatentUpscaleWithModel`), so the two leads share
  one blocker; and (2) a night download of about 17 GB. **No held row is banked**, because the model is
  not on disk. Once both are done, the row would run: (A) keyframes gravitone already made with the
  current route, at no new spend, and (B) P-H3-Image int8 from the same prompts at the same size. Each
  pair goes through the same FL2VA graph at 124 frames with the same seed, and the operator watches the
  two clips side by side. About 45 GPU minutes (unmeasured). The use is gravitone `keyframes.mts`. The
  host judged one sample "nowhere near" the hosted model, and that is all the source shows.
- **GIF output** (row 2), **Pika H3 Flex** (row 6) and **taste-learning editor** (row 13): return
  conditions are in the table.

## Held rows

None. Not banked, and what each lacks:

- **P-H3-Image against the Leonardo keyframes.** The ComfyUI upgrade and the Pruna files, both operator
  calls.
- **GIF route.** No use in the fleet, and no documented GIF parameters.
- **Pika H3 Flex.** The LoRA is not on disk, and an end-to-end ComfyUI render is unverified by its vendor.

## Proposals

- **Operator, ComfyUI 0.44.** One upgrade unblocks two leads (this row 4 and the 11-06 tiled-sampler
  #2). It is a ComfyUI change, so it was not made in a shift.
- **Operator, stills route.** The standing choice says stills go through Codex `image_gen` with GPT Image
  2.6. The vendor documents 2.6 for the Image API only, so which model `image_gen` uses is unconfirmed.
  A replica's provenance should name what the tool reports rather than assume 2.6.
- **Gravitone (proposal only).** When Leonardo lists 2.6, the router and both pricing tables move together,
  with the 2.5 rows kept for keyframes already made. Not changed.
- **/shift spend.** Count each Codex `image_gen` replica at 3 to 5 plain turns against the plan allowance
  when sizing a batch of replicas.

## Fetches and what was not verified

Lander reads (all raw markdown or API): the OpenAI image guide, the two 2.6 model pages and the 2.5 Sunburst
page, the Codex pricing page, the Comfy P-H3-Image tutorial, the Hugging Face API for `PrunaAI/P-H3-Image`,
`PrunaAI/p-h3-image-comfy` and the H3 file in `Comfy-Org/MiniMax-H3`. That is 10, over the budget of 3,
because the dispatch named both checks. The miner spent 3 content fetches and 3 searches. Local reads were
gravitone HEAD (git only), ComfyUI's version file, and a model folder listing. Nothing was downloaded or
generated, and ComfyUI was not run.

SHA-256 of the on-disk FL2VA int8 file: `e889202c41dafb67b10d67b97f0d8541508036a6090af23425a5c2615d03c47a`,
equal to the LFS oid at `Comfy-Org/MiniMax-H3`.

Not verified: Omni 1.2 at any primary; whether Codex `image_gen` uses 2.6, and whether it exposes GIF;
rows 11, 13 and 14 at any primary; Leonardo's model list.
