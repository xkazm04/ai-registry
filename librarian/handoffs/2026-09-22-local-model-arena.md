---
status: arena-v-executed
origin: 2026-09-22-mimo-v2-6 (intake run intake-mimo-v26)
governs: llm-observability/quality-scoring/cross-provider-benchmark-operations, media-generation/visual-generation/generative-provider-routing (extraction-model-bake-off)
owner_decision: 2026-09-22 go; Arena V run the same day (pof da4df5eb). Arena C and G not run
---

# Local model arena - test plan

The question was whether an open-weight release can compete in our local stack.
It can, but only in two slots, and only with one model from the release.
This plan makes candidates compete on **our own cases, graded by our own gates**.
It does not use vendor leaderboards. Its method is `cross-provider-benchmark-operations`
plus the new `self-hosted-residency-is-part-of-the-target`.

## 0. Eligibility screen (done in-run, 2026-09-22)

Machine: one 24 GB accelerator + 64 GB host memory = 88 GB ceiling.

| Candidate | Total / active | Resident at 4-bit | Verdict |
| --- | --- | --- | --- |
| MiMo-V2.6-Pro | 1.02T / 42B | ~560 GB | screened out |
| MiMo-V2.6-Flash | 309B / 15B | ~170 GB (~100 GB at 2-3 bit) | screened out. A mixture-of-experts model is priced by *total* parameters |
| MiMo-V2.6-Distill-Qwen-9B | 9B dense, image+text in, text out | ~10 GB at Q8_0 + ~0.9 GB vision projector | **admitted** |
| qwen3.8:27b (incumbent) | 27.3B, Q4_K_M | 24 GB at a 32k window, **10% on host**; 27 GB at 64k, **30% on host** | admitted, window pinned per arena |
| gemma4:12b | 12B | 10 GB at 32k, 100% accelerator | admitted |

Nothing in the release **generates** images, video or audio. The whole family is
any-modality in, text out. So MiMo does not compete in the media-generation
*output* slot at all. See section 4.

The published scores for the 9B model (SWE-Verified avg@3 61.1, SWE-Pro 44.6) are
self-reported, and the card calls the model "a starting point for open research
in agentic RL". They are a lead, not evidence. The arenas exist to replace them
with our own numbers.

## Arena V result (2026-09-22)

- **Serving.** Ollama 0.34.2 loaded the 9B distill natively (architecture `qwen35`, vision projector attached) from a Modelfile with two FROM lines. The Hugging Face pull through Ollama failed on a blocked CDN redirect, so the files were fetched with curl at a pinned commit. The llama.cpp fallback (b11108) was downloaded and not needed. Controls passed: a text answer, a hair colour, and "entirely black image".
- **Placement.** Every arm was 100% on the GPU at the gate's 8k window (27B: 22.3 GB, 9B: 14.0 GB, 12B: 9.8 GB), so latency is comparable here.
- **Truth.** 60 of pof's generated images, labelled by eye against the gate's five criteria: 6 pass, 54 fail, 10 ambiguous excluded. The pass class is thin.

| Arm | AUROC | Bad through at the shipped line (<5) | at <8 | at <9 | Good refused at <9 | p50 per image |
| --- | --- | --- | --- | --- | --- | --- |
| qwen3.8:27b (incumbent) | 0.998 | 16/54 | 3/54 | 1/54 | 0/6 | 3.55 s |
| gemma4:12b | 0.991 | 20/54 | 11/54 | 9/54 | 0/6 | 2.84 s |
| MiMo-9B Q8_0 | 0.966 | 8/54 | 4/54 | 3/54 | 1/6 | 0.92 s |

**Verdict.** The cheapest *sufficient* grader is still the incumbent, once its refusal line is refitted. The 9B is faster and smaller, but no line makes it as safe. Its reasons name the defect while its score ignores it. The real defect the arena found is the shipped line: it was fitted on the hosted grader chain and is now served by the local eye first. The threshold change is proposed, not shipped, until the pass set reaches at least 20 images.

## 1. Instruments and preconditions

- **Serving.** Probe first: `ollama pull hf.co/ggml-org/MiMo-V2.6-Distill-Qwen-9B-GGUF:Q8_0`,
  then one image call. The model is a hybrid SSM + attention architecture, and
  its quantizations name llama.cpp b10964 as the minimum build. If the installed
  Ollama (0.34.2) cannot load it, fall back to a llama.cpp CUDA release
  (`llama-server -hf ggml-org/MiMo-V2.6-Distill-Qwen-9B-GGUF --mmproj ...`), which
  exposes an OpenAI-compatible `/v1`. Record which runtime served each arm.
  A runtime is part of the target.
- **Known positive and known negative before any arm.** A text call that must
  return a fixed token, and an image call on an image whose answer is unambiguous.
  If the image call does not see the image, the vision projector was not loaded,
  and every vision score after that is a text-only score.
- **Residency readback per arm.** Read `GET /api/ps` `size_vram / size` (or the
  llama-server load log) after warm-up. Write it into the result row. Unload
  everything between arms (`keep_alive: 0`), and **stop ComfyUI during text arms**,
  or keep it loaded during *every* arm. Say which.
- **Warm twice.** Cold loads measured 16-51 s here. Discard the first call, and
  run each arm at least twice warm (memory: local-seeded-judge-arm).
- **Pinning.** temperature 0, fixed seed, and the window declared per arena.
  Record a determinism stamp per row. Pinned temp 0 + seed has split one case
  reproducibly on this box before, so repeats are measured, not assumed.

## 2. Arena V - the local vision grader (image understanding)

**Seam.** pof `src/lib/vision/providers/ollama.ts:37`. The resident grader is
`OLLAMA_VISION_MODEL ?? 'qwen3.8:27b'`, called at `num_ctx: 8192`, temperature 0,
behind the visual-generation input gate.

**Why it is the falsifying seam.** The incumbent was chosen for measured
100% enum stability. A 9B model that matches it at a third of the memory would
change a routing default. One that fails shows the vendor's visual numbers do not
transfer to our gate.

- **Cases.** The existing 18 labelled images are too few: at n=18, "not
  significantly worse" is true of almost anything. Grow the set to at least 60
  from our own ComfyUI outputs whose briefs state the graded property
  (extraction-model-bake-off step 2: truth you own, fields unambiguous in the
  image). Freeze and version the set.
- **Arms.** qwen3.8:27b @8k (incumbent) / gemma4:12b @8k / MiMo-9B Q8_0 @8k.
  Optional fourth arm: MiMo-9B Q4_K_M, as a separate target, to price the format.
- **Target metrics.** Seconds per image (warm, median and p90), and resident GB.
- **Floor.** Gate accuracy against the labels (AUROC of score vs label, **with the
  threshold refitted per arm**, because a threshold is fitted to its grader and
  swapping models at an unchanged `passAt` has already failed 10 correct inputs
  once). Correct-accept rate at the refitted threshold must not drop below the
  incumbent's by more than 1 case in 60.
- **Also gated.** Structural faults (invalid JSON, out-of-vocabulary enum) are
  disqualifying. Enum stability over 3 warm repeats per image.
- **Verdict primitive.** `cheapest-sufficient-configuration`: the cheapest arm by
  resident GB whose paired test against the best is not significantly worse,
  reported with n and alpha.

## 3. Arena C - the local coding tier

**Slot.** Not the primary agent. That slot belongs to hosted engines, and the
screen already rules out the only model in the release that could contest it
locally. The local slot is **bounded mechanical edits**: one-file fixes, test
repair, lint and type fixes, commit messages. These are the calls that are cheap
to route away from a metered engine.

- **Cases, from our own history (contamination-resistant).** Mine the fleet's
  git logs for commits that change at most 30 lines of source in one file, where
  a test fails at the parent and passes at the commit. Stratify across TypeScript
  (pof, kp, personas-web), Rust (tracklight, personas) and Python. Take 40
  cases, then freeze. Public benchmarks are in every model's training data, and
  our repositories mostly are not. That is the whole reason to build this set
  instead of rerunning SWE-bench.
- **Harness.** For each case: revert the hunk, then give the model the file, the
  failing test's output and the test file. Ask for a unified diff, apply it, and
  run *only that test* plus the project's typecheck. That is single-shot tier 1.
  Tier 2, run only if an arm clears tier 1: the same cases in a minimal agent
  loop with read/edit/run-test tools and a 10-step cap. This tests the "agentic"
  claim on the card. Route both tiers through tracklight's matrix
  (`LIGHTTRACK_OPENAI_BASE` pointed at the local server), so the cost, latency
  and determinism rows come out of an existing instrument.
- **Arms.** qwen3.8:27b @32k *and* @16k as two targets (the 32k one spills 10% to
  host), gemma4:12b @32k, MiMo-9B Q8_0 @32k.
- **Target metrics.** Warm seconds per case, and resident GB.
- **Floor.** Pass rate: tests green **and** typecheck green. A patch that passes
  the test by deleting an assertion is a fail. Check this with a diff predicate
  on test files.
- **Also reported.** Failure clusters by language and by fault
  (no diff / malformed diff / wrong file / compiles but fails).

## 4. Arena G - generation output (not a MiMo arena)

Competing image or video *generators* is a different arena. It runs under
intake's render-proof (Phase 6b): same brief, seed, anchors and length, arms from
the consuming project's shot taxonomy, a positive control per scenario, a
discrimination ratio of at least 1.5x seed noise, and a **blind operator
triage**, because every automated grader here is calibrated for *consistent*,
not *better*. The one way a text model enters this arena is as the **prompt
compiler** that turns a brief into generation instructions. That is render-bound,
so its verdict is also the operator's blind pick, never a score. Admit it only
if Arena C or V shows the 9B model is worth keeping resident.

## 5. Cost and order

| Step | Cost |
| --- | --- |
| Download 9B Q8_0 + projector (+ Q4_K_M optional) | ~11 GB (+~6 GB) |
| Arena V (60 images x 3 repeats x 3-4 arms, warm) | ~1-2 h unattended |
| Arena C tier 1 (40 cases x 4 arms x 2 repeats) | ~2-3 h unattended; case mining ~1 h director time |
| Arena C tier 2 | only if tier 1 admits an arm |
| Arena G | operator triage time; only on a positive V or C result |

Run V first. It has a live seam, an existing truth set to extend, and a gate
that can see the difference. Its result decides whether the download stays on
disk.

## 6. Return conditions

- Flash becomes locally eligible only on at least ~128 GB of combined memory at a
  2-3 bit format, or on a second accelerator. Re-screen when the machine changes.
- A hosted Flash or Pro endpoint may be added as a **ceiling column**, disclosed
  as not local (handicap-disclosure-in-the-result-row). It never enters the
  local routing recommendation.
