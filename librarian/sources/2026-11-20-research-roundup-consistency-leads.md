---
source: youtube
kind: video
url: "youtube:-oA6oLxWpJg"
urls:
  - https://www.youtube.com/watch?v=-oA6oLxWpJg
  - https://huggingface.co/tencent/Hy-Nomas
  - https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI
  - https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas
  - https://github.com/itsmetamike/reshoot-4d
  - https://arxiv.org/abs/2611.02737
  - https://github.com/adobe-research/MoviEdit-Bench
title: "Research roundup read for consistency across cuts, /shift batch of 1 video from 1 channel"
author: "1 channel: Matt Wolfe (eighth note from this channel; second-hand survey with short free-tier demos by the presenter)"
words: 6076
extracted: 14
accepted: 0
declined: 0
leads: 4
already_covered: 4
untriaged: 3
currency: 3
dispatched: 0
applied: 0
shipped: 0
held: 0
run_id: shift-1120-rrcl
siblings: 2
fetches: 14
rescan_when: any lead's return condition below holds (Hy-Nomas - a night download of about 28 GB is cleared and a no-render load check passes on Lynx; Reshoot 4D - a gravitone multi-cut scene needs a second angle of a kept take, a Linux or WSL2 aarch64 install of Capture is shown, and the operator accepts the Capture path's non-commercial terms and does the SMPL-X registration; MoviEdit - weights or inference code are released); or 8 weeks elapse (2027-01-15)
---

# Research roundup read for consistency across cuts, mined under /shift, 2026-11-20

Plan `plan-20261120-104354`, cluster `research-roundup-consistency-leads`, board run
`shift-1120-rrcl`. The question: which research releases in a month's roundup could change how we
keep a world, a camera or a voice consistent, and which earn a fetch. One miner read the transcript in
full and fetched the primaries; the lander re-fetched them and read further. No GPU, no download, no
render, no ComfyUI change. Phase 7.7: gate=skipped.

- **W** = `youtube:-oA6oLxWpJg`, Matt Wolfe, "Insane AI Breakthroughs Nobody Is Talking About" (6,076
  words, 29:25). Twelve research items and products, with short free-tier tries by the presenter.

**Class and expected yield, stated first:** a second-hand survey. It is reliable only for *that* the
world moved; for the review items the fetch is the extraction. Expected: currency, two or three leads
with return conditions, catches, no upper-layer accept. That held: 0 accepted, 4 leads, 3 currency
lines, 4 catches, 3 untriaged.

**Voices.** One channel, so no convergence on any row.

**Admission.** The **+3 bar** governed the two rows that carry a Phase 5 score (2 and 4). It comes
from `/intake` Phase 5 Step 3 (its v2.21 paragraph) and Step 4 as they stand, read against
`SCORECARD.md`: the last nonzero entry is 2026-11-19's fp=1 (`layout-decision-placement`), so there is
no run of three fp=0 rows, and no rejected row is recorded as re-derived by a later run. The step-down
has not fired, and a step is a method edit, never a lander's setting. Neither scored row would clear
+2 either. Leads and currency lines ran under the corroboration table. `auto=0/2/0 fp=0`: the miner
accepted nothing, so no accept died here.

**Replication.** None. The finished work shown is a paid cloud AR app's demo reel (Simulon) and
research demo reels. No prompts are shown, and nothing would be remade on our stack with a named use
(operator rule 2026-11-08: no GPU for proofs nothing would use).

## What landed

This note and its ledger lines. No corpus file changed, no project was touched, no row was banked.

## What the promotion read found

No row was an accept, so the read went to the facts the leads and their return conditions rest on:
the Hy-Nomas model card, its file listing with sizes, its LICENSE and the text-encoder config; the
community ComfyUI port's card, LICENSE, NOTICE and node-pack README; `nvidia/PixelUMM`'s licence tag;
Reshoot 4D's README, `docs/INSTALL.md` and `docs/MODELS_AND_LICENSES.md`; MoviEdit's arXiv record,
project page and benchmark repository; Lynx's ComfyUI model folders and Python packages (read only);
the transcript at the anchors; and pof's impact map at local `master` and at `origin/master`.

- **Contradicted: "Apache-2.0, so commercial."** Tencent's card says Apache-2.0 and adds "Third-party
  models and components remain subject to their respective licenses." The video decoder that every
  configuration uses is a fine-tune of `nvidia/PixelUMM`, whose card declares the NVIDIA One-Way
  Noncommercial License. The port's NOTICE states it outright: the PixelUMM weights "and derivatives of
  them, including Tencent's fine-tuned decoder ... may be used for research or evaluation purposes
  only." So the pipeline as released is evaluation-only for gravitone until the decoder is replaced.
  The video's "you can even use it commercially" [00:05:36]-[00:06:02] is wrong for the decoder.
- **Corrected: the size.** The repository totals 196 GB. Its `PE/` directory (55.6 GB, a Qwen3.5-class
  model with 64 layers at 5,120 hidden) is Nomas-PE, "a separate online service ... required by the
  demo"; offline inference reads prepared prompt files and does not need it. The single-GPU set is the
  INT8 DiT (9.06 GB) and the FP8 PixelUMM (9.13 GB, which in the port also holds the DCAE-V encoder),
  plus the text encoder: the port's `qwen_2.5_vl_7b_fp8_scaled` (9.4 GB, "~4% off" the reference) or
  bf16 (about 16 GB). That is **about 28 GB through the port**, 35 GB with the bf16 encoder. The
  miner's 30 GB estimate holds in total; its per-file guesses (8 and 7 GB) were low. None of it is on
  disk: `models/text_encoders` holds only the LTX Gemma and the H3 Qwen3-VL-32B files.
- **Narrowed: the history budget is a default, not the one-machine limit.** Upstream's single-4090
  config keeps "up to 18 historical latent frames" on the GPU, as the miner read. The port exposes
  `history_frames`: "18 (Tencent's single-GPU preset) or 0 for the whole history (the 8-GPU preset)",
  with the history in system RAM, growing "~5.9 GB per 5 s segment at 1280x704, ~2.3 GB at 832x480".
  Six 5 s segments at 832x480 with full history are about 14 GB beside about 28 GB of weights, which
  plausibly fits 64 GB of unified memory (estimated, not measured). So the test of the memory claim can
  run both budgets on this box, and the arms should differ in exactly that setting.
- **New: the port's runtime on Lynx.** Node code GPL-3.0, tested on ComfyUI 0.42 and an RTX 4090
  ("Nothing to `pip install`: the nodes use what ComfyUI ships (comfy-kitchen, Triton)"). Lynx runs
  ComfyUI 0.42.1 with `comfy_kitchen` 0.2.39 and **no `triton` package** in its ARM64 Python. The
  port's int8 GEMMs are Triton kernels; it also offers `matmul: exact` (bf16 on dequantized weights).
  Whether `exact` and the FP8 decoder run without Triton is the load check. Port timings on a 4090:
  34 s for 10 s of video at 832x480, 85 s at 1280x704.
- **Held, with the presenter's own try.** The demo's consistency is the vendor's; the presenter's own
  free-tier world was "a little wonky ... not the most impressive result" [00:06:53]-[00:07:20].
- **Contradicted: Reshoot 4D's footprint and terms.** The miner read the AGPL code licence and "one RTX
  3090". `docs/INSTALL.md`: four separate Python environments (torch 2.8 cu128, one 2.10), a CUDA 12.8
  build toolchain and a TensorRT extra, Linux only, "about 148.0 GiB before ComfyUI ... Reserve at least
  200 GiB free". `docs/MODELS_AND_LICENSES.md`: "**The current Capture path includes research and
  non-commercial restrictions**" - GVHMR (education, research, non-profit only), SMPL-X (non-commercial
  research terms, registration and an interactive download), and the Turbo view-generation LoRA (CC
  BY-NC-SA 4.0). The final pass needs LTX 2.3 22B and its IC-LoRAs; Lynx holds LTX-2.5 only.
- **Held: "no fixed world".** The README's Limitations, verbatim: "Each reshoot regenerates what the
  source camera never saw, so off-camera objects can differ from one angle to the next. In Example 4
  the view through the window changes between moves." The transcript says the same [00:09:30]-[00:09:55].
- **Held, now from the primary: MoviEdit has no weights.** The project page links only
  `adobe-research/MoviEdit-Bench`, which "hosts the public release of **MoviEdit-Bench**": benchmark
  and evaluation code, licence NOASSERTION. arXiv 2611.02737, 2026-11-02.
- **Held: MotionBricks' pof trigger fired, and pof's entry is still stale.** pof
  `docs/research/impact-map.md:159` still reads "`status_impact: none` today. **Reconsider when:** the
  full release ships a HUMAN-character checkpoint", last changed in `841a022fc` (2026-09-22), and
  `origin/master` (66dc1d35c, 2026-11-16) carries the same line. The 2026-11-10 notes record the
  trigger as fired.

## The leads

### Lead A: a segment-memory world model for return-to-start consistency (row 1, with row 2)

**Claim (source's terms).** Each 5 s piece "looks back at everything it already made", and "that memory
is what keeps the world from changing on you ... for about a minute" [00:04:44]-[00:05:36]. The card:
"A persistent key/value (KV) cache carries context between segments."

**Why it matters here.** Consistency across cuts is the operator's main struggle, and chained-H3
continuity was dropped on 2026-11-19 without a new idea. A KV-cache world is a different mechanism from
a chain of clips. Held row `shift-currency-world-1` (2026-11-06) asks the same question of LTX and H3
and stopped because a reseed redraws the whole scene.

**Return condition, all four parts:**

1. **Download at night:** about 28 GB (port INT8 DiT, port FP8 decoder, fp8 Qwen2.5-VL-7B text
   encoder). Not the 196 GB repository: skip `PE/`, the FP32 DiTs, the FP32 decoder and the LoRAs.
2. **A load check with no render:** the port's nodes load on Lynx's ComfyUI 0.42.1 without Triton
   (`matmul: exact`), or Triton for Windows ARM64 is available; or upstream's single-GPU config runs
   under WSL2 (Linux, CUDA 13.0 toolkit, FlexAttention, CUTLASS FP8).
3. **Licence:** the operator accepts that the PixelUMM decoder is research and evaluation only, so the
   proof's outputs stay a local evaluation and never ship in a gravitone cut.
4. **A use:** a gravitone scene whose cuts return to a place the camera has left.

**Test design, when it returns (not banked: no weights, no runtime).** One world prompt and one camera
trajectory (`c2ws` plus intrinsics) that turns away and comes back over six 5 s segments, 832x480.
Arms: (a) LTX-2.5 one take, on disk; (b) Hy-Nomas, `history_frames` 18; (c) Hy-Nomas,
`history_frames` 0 (whole history); (d) arm c with one injected event segment. Countable read: the
named objects present and in place at the return frame against the first frame. The floor is the same
clip's first frame against a frame after an equal static hold, never a reseed. b against c is the
discriminator row 2 names. Time: not estimable before the load check.

### Lead B: reshoot one kept take from a second camera (rows 3 and 4)

**Claim (source's terms).** Give it a video; it builds a 4D capture, you key a virtual camera, it
re-renders, and LTX does a photoreal pass [00:08:12]-[00:10:22]. "You can't upload your own footage
yet" is true of the hosted demo only: the repository runs on your own video.

**Boundary (row 4, the useful part).** Reshoots of one take re-invent whatever the source frame never
saw, so two angles cut together only where the background was in the source view or is defocused. No
home states it: `camera-position-not-focal-length` covers identity under camera change and tells the
reader to inspect backgrounds, not what a reshoot does to them.

**Return condition, all four parts:**

1. **A use:** a gravitone multi-cut scene needs a second angle of a kept take.
2. **A platform:** Capture's environments install on Linux or WSL2 aarch64. Upstream is x86-64 Ubuntu
   with a CUDA 12.8 build and TensorRT; nothing targets ARM64.
3. **Disk and downloads:** about 150 GiB installed and 200 GiB reserved, at night, including LTX 2.3
   22B (we hold 2.5), CrossView-Warp and ReDirector on Wan2.1-Fun 1.3B.
4. **Terms and the operator:** the Capture path is non-commercial (GVHMR, SMPL-X, the Turbo LoRA), and
   SMPL-X needs the operator's registration and an interactive download. So it is evaluation-only and
   cannot run unattended until the operator has done that.

**Test design, when it returns.** One kept gravitone take reshot as an orbit and as a push. The verdict
asks whether the two cut together: background change outside the source frustum, and identity at the
new camera position against `character-identity-continuity`'s ruler. Upstream time: about 30 minutes a
shot on a 3090; unknown here.

### Lead C: one edit propagated across every shot of a scene (row 5)

**Return condition:** MoviEdit weights or inference code are released, not only the benchmark. Then
answer memory fit from the card. Neighbours: `review-iteration-loops`' `partial-regeneration-seams` and
`edit-plan-over-regeneration`.

## Owed outside this registry: pof's MotionBricks adjudication

pof's impact-map entry (line 159) must record that its reconsider trigger fired on 2026-11-10 (the
`MotionBricks-SOMA-RP-v1` human checkpoint and the smart primitives are public), and that
`status_impact` stays `none` only until the open runtime check: whether ONNX or TensorRT runs on
Windows ARM64 (upstream: "Tested on Windows and Linux (x86-64)"). **Not written by this run.**
`authority.md` lands pof from the remote tip through `/intake` `## Pushing a result`, and its bar asks
for a Phase 5 pass and a paired proof with its mode. This is an adjudication with no proof, pof's local
`master` is 2,408 commits behind `origin/master`, and this lander's dispatch forbids a direct commit or
push. It is owed to a pof session.

## Candidates

Rule column: "Phase 5, +3" for scored rows; "corroboration table" for leads and currency lines;
"catch" for rows the corpus or a prior note already holds.

| # | Candidate | Voices | Anchor | G/R/C | Read | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Test a segment-memory world model (Hy-Nomas) for return-to-start | W + vendor card | [00:04:44]-[00:05:36] | n/a | real gap | **Lead A** | corroboration table | `video-assembly`; held row `shift-currency-world-1` asks the same question of LTX and H3. Decoder non-commercial, about 28 GB, Triton absent on Lynx |
| 2 | Memory claims hold only on the configuration that keeps the history | W + card + port | card "Single-GPU Low-Memory Inference"; port `history_frames` | 1/0/1 (raw +1) | likely catch | Catch | Phase 5, +3 | `model-call-outcome-integrity` → `the-measurement-runs-the-served-configuration`. The port makes full history selectable on one box, so this shapes Lead A's arms b and c |
| 3 | Reshoot a performance from a new camera on local weights (Reshoot 4D) | W + README | [00:08:12]-[00:10:22] | n/a | real gap | **Lead B** | corroboration table | `character-identity-continuity` (`camera-position-not-focal-length`); the operator's camera route is depth-controlled previs (10-21). Linux-only, about 150 GiB, Capture non-commercial |
| 4 | Monocular reshoots do not share off-screen background | W + README (one source plus its vendor) | [00:09:30]-[00:09:55]; README "No fixed world" | 1/0/1 (raw +1) | partial | **Lead B** (boundary) | Phase 5, +3 | No home states it; `camera-position-not-focal-length` stops at "inspect the backgrounds". GAIN 1: a boundary of one tool with no convergence. Even at GAIN 2 it reads 2, under +3 |
| 5 | Propagate one edit across every shot of a scene (MoviEdit) | W + arXiv + bench repo | [00:10:22]-[00:11:13] | n/a | thin | **Lead C** | corroboration table | `review-iteration-loops`. Benchmark only; no weights |
| 6 | MotionBricks human checkpoint released | W | [00:23:06]-[00:24:50] | n/a | catch | Catch | catch | Fired and recorded 2026-11-10 in the 09-15 and 11-10 notes; pof's adjudication owed (above) |
| 7 | Text-free full-duplex voice, closed preview (Block's Dessa) | W | [00:11:13]-[00:14:39] | n/a | dated fact | Currency, note only | corroboration table | `voice-io` `duplex-agent-sessions`. ElevenLabs is the dialogue layer. Access terms not checked |
| 8 | Downloadable full-duplex base model (Haru 4B) | W | [00:14:39]-[00:16:45] | n/a | dated fact | Currency, note only | corroboration table | `duplex-agent-sessions`. Weights and licence not checked; a possible personas voice runtime, not asked for |
| 9 | Hosted realtime voice agent (Fish Audio Live 3) | W | [00:16:45]-[00:18:26] | n/a | dated fact | Currency, note only | corroboration table | 2026-11-11 note; Fish is for comparison rounds only (operator, 11-11). An agent runtime, not a dub engine. Pricing not checked |
| 10 | Budget slider for image-to-3D (Budget3D) | W | [00:20:34]-[00:23:06] | n/a | catch | Catch | catch | Operator route TRELLIS.2 for weapons and organic assets (10-20, 10-21); `image-to-3d-input-gating` `multi-view-master-reference` covers the flat back of the head the demo shows |
| 11 | A speech-native model invents a life | W | [00:12:30]-[00:13:48] | n/a | thin | Untriaged | not scored | "No text channel, no place for a character brief" rests on prose; near `duplex-agent-sessions` |
| 12 | World model as shot planning | W | [00:07:46] | n/a | catch | Catch | catch | 2026-11-06 E9, the same voice, no lift |
| 13 | Simulon AR character relighting | W | [00:00:51]-[00:04:17] | n/a | out of scope | Untriaged | not scored | Paid cloud app |
| 14 | Silent-speech glasses; Flash ALOHA; Phonebot | W | [00:18:53]-[00:28:43] | n/a | out of scope | Untriaged | not scored | Robots and a hardware pre-order |

Counts: accept 0 / lead 4 (rows 1, 3, 4, 5, as three leads) / currency 3 / catch 4 / untriaged 3.

## Instruments and plan: what was wrong

- **Plan and video, the licence.** Both read Tencent's Apache-2.0 as "commercial". The decoder is
  NVIDIA non-commercial; the third-party clause on the card says so, and only the port spells it out.
- **Plan, "fit in 64 GB".** The question has two parts the plan did not split: weights (about 28 GB) and
  history (about 2.3 GB per 5 s segment at 832x480 with full history). The runtime, not memory, is the
  likely blocker: no Triton in Lynx's ARM64 ComfyUI.
- **Plan, MotionBricks.** The plan budgeted a fetch to test pof's return condition. It had fired and
  was recorded on 2026-11-10; what is open is pof's own entry.
- **Miner, Reshoot 4D.** The miner read the README and missed the install and licence pages, which carry
  the non-commercial Capture path and the 200 GiB reserve. For a "one developer, open source" tool,
  read `docs/` before the return condition. `gh search repos` found it when two web searches did not.
- **Miner, Hy-Nomas port.** The miner flagged the port's NVIDIA file without reading it; reading it
  changed the licence finding.

## Proposals (not landed)

- **pof:** the impact-map adjudication above, by a pof session from the remote tip.
- **Corpus, when Lead B returns with a verdict:** a boundary line in
  `character-identity-continuity`'s `camera-position-not-focal-length` or `video-assembly`'s
  `generated-shot-sourcing`: a generated second angle re-invents the off-screen background, so cut it
  only where the source showed the background or it is defocused. Not before a measured pair.
- **Method:** Step 4's raise clause reads fp=2, 1 and 1 at +3 since 2026-11-08 (11-08
  `agent-friction-to-fix-loop`, 11-11 `document-understanding`, 11-19 `layout-decision-placement`).
  Whether that fires a further step is a method edit for the operator, not a lander's setting.

## Fetches: 14

Miner 3 fetches and 5 searches (HF API listing, the Hy-Nomas README, the Reshoot 4D README). Lander
11: the Hy-Nomas file listing with sizes, README, LICENSE and `PE/config.json`; the port's listing,
LICENSE, NOTICE and README; `nvidia/PixelUMM`'s card tag; the node pack's repository and README; the
Reshoot 4D README, INSTALL and MODELS_AND_LICENSES; MoviEdit's arXiv record, project page and
benchmark repository (counted as grouped reads). Local reads only on Lynx: ComfyUI's model folders and
Python packages, the HF cache listing, pof's impact map.

## Not verified

- Any Hy-Nomas output on this machine; that the port loads without Triton; full-history memory on 64 GB.
- Whether the video's "about a minute" is a limit; the card states no length cap, and its benchmark has
  a spatial-memory track whose comparisons were not read.
- Reshoot 4D on ARM64 or under WSL2; its time per shot here.
- Haru 4B's weights and licence; Dessa's access terms; Fish Live 3's pricing; Budget3D's numbers.
