---
source: github + hands-on experiment (gravitone / Wolf)
url: https://github.com/JustVugg/colibri
title: "Colibri MoE streaming engine — GLM-5.3-Flash vision as an oversized local eye"
author: JustVugg (engine); zai-org (GLM-5.3-Flash weights)
kind: systems-engine evaluation + local feasibility experiment (in progress)
mined_on: 2026-09-01
skill_version: dojo@1.0.0 (operator-directed exploration, not a dojo cycle)
status: acquisition running — findings below are docs + measured hardware; inference measurements land when the 62-shard conversion completes
---

# Colibri + GLM-5.3-Flash: can a 24 GB box run a 321B eye?

Operator question: does Colibri bring larger, higher-quality models for image
GENERATION or RECOGNITION that Wolf (RTX 4090 24 GB, 64 GB RAM, Kingston
KC3000 PCIe-4 NVMe, 255 GB free) otherwise could not run?

## Verdicts from the docs (dated 2026-09-01, v1.10.1)

- **Image generation: NO.** Colibri is a pure text/vision *inference* engine —
  no diffusion, no synthesis. It changes nothing about the generation lane.
- **Image recognition: YES, as a class change.** GLM-5.3-Flash (321B total /
  40B active MoE, 45 layers, vision tower) runs by multitiering: dense set
  (~9.7B params, BF16, ~18 GB) resident, 19k routed experts int4-streamed
  from NVMe with LRU + learned pinning + router lookahead (71.6% next-layer
  predictability). 25 GB RAM minimum — a 24 GB-VRAM box is NOT the limit;
  the DISK is.
- **The wall is arithmetic, and it favours fast NVMe:** one decode token
  touches 42 sparse layers × 8 experts × 14.2 MB ≈ 4.8 GB. The reference
  machine's ~200 MB/s disk floors at ~24 s/token (measured ~44 s cold /
  ~20 s warm). Wolf's KC3000 reads multi-GB/s, and 64 GB RAM holds a large
  warm expert cache — projected ~1–3 s/token, unverified until measured.
- **Consequence for the eye role:** at hundreds of output tokens per craft
  readback, this is a SLOW DEEP EYE — one considered judgment per gated
  decision (style synthesis, deep critique, tie-breaking) — never a bulk
  annotator. The bulk lane stays qwen3.8:27b (~20 s/frame).
- **Vision I/O:** file path in `coli chat`, drag into `coli web`, or OpenAI
  `image_url` with base64/local path; remote URLs refused by design.
  Preprocessing pinned bit-close to the official `Glm5NextImageProcessor`.
- **Engineering culture worth stealing:** token-exact validation against a
  transformers oracle; MLA cache absorbed to 33 KB/token by reordering the
  products (identity, not approximation); a converter that HALTS on any
  unrecognised tensor name because "a checkpoint that loads and is quietly
  missing a tensor" is the worse failure.

## The experiment (running)

- `c/tools/convert_glm53.py --outdir colibri-models/glm53_i4 --min-free-gb 40`
  — 62 shards, ~195 GB out, shard-streamed (peak disk = out + one 5 GB
  shard), resumable, stall-guarded. Reference machine took 25 h; Wolf's
  bandwidth will decide ours.
- Windows release binary v1.10.1 unpacked and ready (`coli serve/web/chat`).

## Test protocol (pre-registered, so the measurement cannot be steered later)

1. **Speed:** tok/s cold vs warm on one craft readback; s/frame end-to-end.
2. **Eye quality, 5 frames** from the gravitone corpus (2 lotr, 1 arcane,
   1 spiderverse, 1 matrix — chosen before results): the same craft-readback
   schema given to qwen3.8:27b and gemini-3.6-flash; score field agreement
   against the human-checked annotations, note hallucinated fields and
   schema violations.
3. **Judge quality, 2 gated pairs** replayed blind: does the big eye's pick
   match the human verdict where the small eyes disagreed?
4. Decision rule, stated now: the lane earns a place only if (2) beats
   qwen3.8:27b on field agreement AND (3) tracks the human at least as well
   as gemini — otherwise the finding is "size does not buy craft-reading
   here" and that negative result is the deliverable.

## Leads filed

- generative-provider-routing: local-plan row candidate — MoE expert
  streaming (Colibri-class) reprices "what this machine can run" from VRAM
  to NVMe bandwidth; a routing table whose local rows are VRAM-gated is
  stale for MoE checkpoints.

## Comparison: FreeToken (FlashML-org), same question, different tier

Operator follow-up 2026-09-01: how does FreeToken bring GLM, and does its
approach hold an advantage? (github.com/FlashML-org/FreeToken, Apache-2.0,
10.8k stars / 46 commits — a squashed public mirror by the ratio; paper at
arxiv 2608.16157.)

**The one-line difference: FreeToken's expert tier stops at HOST RAM;
Colibri's extends to NVMe.** FreeToken's MoE backends (`offload` / `cpu` /
`hybrid`) keep routed experts resident in host RAM with a GPU LRU of expert
slots — misses stream over PCIe or are computed on the CPU where the data
already is, with the split calibrated per machine by `ft bench bw`. Nothing
pages from disk, so **the checkpoint must fit in RAM**, and the "290B+
locally" headline assumes a 256-512 GB workstation. On Wolf (64 GB RAM) its
real ceiling is the ~30-120B-at-4-bit class; GLM-5.2 NVFP4 (~370 GB) and
DeepSeek-V4-Flash (~142 GB) do not fit. Colibri's disk tier is precisely
what reaches 321B on this box.

**For the eye question FreeToken is out on both counts, by its own docs:**
GLM-5.3-Flash is not in its supported table (GLM-5.2 / GLM-4.7 NVFP4 only),
and — the closing line of docs/models.md — **"Multimodal checkpoints are
served text-only."** No vision path at all.

**Where FreeToken IS ahead, worth stealing or bookmarking:**
- `hybrid` fetch-vs-compute-at-the-data overlap, bandwidth-calibrated per
  machine — the general idea (compute a miss where its bytes already are,
  instead of always moving them) applies to any tiered engine, including a
  disk tier.
- No conversion step: loads HF safetensors directly (fast-format optional).
  Colibri's GLM-5.3 path costs a ~25 h one-time convert.
- Elastic runtime VRAM reallocation between expert cache and KV, no restart.
- Anthropic/OpenAI-compatible serving with semantic-anchor KV checkpoints
  aimed at agentic edits (tool calls re-using prefix state) — built for
  coding agents, irrelevant to one-shot vision readbacks.
- On models that FIT in RAM it should decode an order of magnitude faster
  than disk streaming (PCIe ~25 GB/s vs NVMe ~2-5 GB/s effective).

**Verdict for this fleet:** Colibri remains the only route to the GLM-5.3
vision experiment; keep the acquisition. FreeToken is the better tool for a
DIFFERENT niche — fast local TEXT MoE serving in the 30-120B class on
24 GB-VRAM/64 GB-RAM boxes (e.g. gpt-oss-120b-class local reasoning behind
an OpenAI-compatible endpoint, a candidate local rung for a text fallback
ladder). Filed as a lead, no action taken.

## Measured on Wolf (2026-09-02, protocol step 1 + the vision wall)

- **Acquisition beat the reference 2.6x:** 62 shards, 194.7 GB, **9.6 h**
  (their 25 h) — download dominated (~8 min/shard dl, ~1 min convert).
- **Text decode: the NVMe projection held.** Cold first answer 44 s total;
  warm decode **~2.3 s/token** (100 tokens / 232 s) vs the reference's
  20-44 s/token. The disk-bandwidth arithmetic in the docs is honest and
  transfers.
- **Vision on the CPU-only release build: impractical.** One 1280px craft
  readback burned 93 CPU-minutes without completing (server-side timeout at
  ~90 min). Cause is compute, not disk: ~1.5k vision-prefill tokens x 40B
  active params on 6 CPU cores, with the RTX 4090 idle — the prebuilt
  Windows binary carries no CUDA/Vulkan backend. A 672px retry is the last
  cheap probe; the real gate for the eye role is a **CUDA-backend source
  build** (docs/cuda.md, BUILD-cuda-glibc241.md), unattempted this round.
- Protocol steps 2-4 (field agreement vs qwen/gemini, judge replay) are
  therefore POSTPONED behind the CUDA build, not abandoned — the decision
  rule stands unchanged.

## The one completed vision readback (2026-09-02, 672px, clean engine)

- **It works, and slowly: 1372 s (~23 min)** for 376 prompt tokens (image
  included) + 217 out — both prefill and decode near ~2.3 s/token on CPU;
  the batched-prefill benefit does not show on this path, so vision cost
  scales with resolution. 1280px frames did not complete inside 90 min.
- **Quality preview (n=1, NOT the scored protocol):** on arcane-fights-005,
  where qwen3.8:27b and gemini-3.6-flash both read "graphic posterization,
  duotone, crushed blacks", GLM-5.3-Flash wrote "painterly mixed-media with
  watercolor and ink-wash textures... warm desaturated sepia-and-cream base
  punctuated by a single intensely saturated neon pink accent (the glowing
  orb)... black handled not as flat fill but as a dominant opaque silhouette"
  — it volunteered PALETTE ROLES and black-as-shape, the exact vocabulary the
  colour-roles and what-stays-dark rules are written in. The bigger eye reads
  craft the smaller eyes flatten.
- **Ops lessons:** the serve engine is single-slot — killing a client leaves
  the request cooking and later calls 429; killing the engine leaves the
  Python launcher squatting the port answering 500s ("dispatcher stopped").
  Tear down launcher AND engine together, then restart.
- **Round verdict:** feasibility PROVEN, quality signal PROMISING, throughput
  BLOCKED on the missing GPU backend. Next action is the CUDA source build;
  the scored 5-frame protocol and judge replay run after it, unchanged.
