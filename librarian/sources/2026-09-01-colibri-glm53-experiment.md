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
