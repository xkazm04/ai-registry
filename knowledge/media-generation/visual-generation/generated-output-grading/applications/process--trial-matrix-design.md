---
layer: application
type: application
subject: generated-output-grading
technique: trial-matrix-design
status: forged
stack: process
verified_on: 2026-08-24
---

# A worked trial matrix — cinematic-realism prompt practices on a local video model, August 2026

The trial-matrix-design technique says: when choosing a house practice from
candidates, build a controlled test set instead of judging showcase
renders. This application IS such a matrix, run end-to-end on a local
open-weights video model (MiniMax H3, pruned fp8, ComfyUI 0.33, RTX 4090),
and records both the matrix design and its measured verdicts. n=1 per cell
— a screening pass that ranks practices for deeper testing, not a
benchmark.

## Matrix design (the reusable part)

- **One core scene, verbatim in every cell** (an elderly fisherman mending
  a net in a harbor at dawn — human skin, water, fine net detail: a
  realism stress test), **one fixed seed, one fixed audio line, one
  sampler config**. The prompt practice is the only variable.
- **Ten cells**: a plain-language control; an anti-pattern control (junk
  quality tokens + numeric lens jargon — practices the literature already
  refutes, kept in the matrix to catch the instrument lying); seven
  single-practice cells (coarse shot grammar, gaffer-speak lighting, one
  film-stock register, physical camera-motion verbs, official timeline
  format, in-prompt negation list, positively-phrased imperfection cues);
  and one stacked-everything cell.
- Judgment: three frames per clip (early/mid/late) inspected against the
  control, per unconditional-fail-criteria first, style second.

## Verdicts (2026-08-24, MiniMax H3 local, one seed)

| Practice | Verdict | What the frames showed |
|---|---|---|
| Plain-language control | strong floor | modern DiT + LLM-encoder realism is already high with no craft vocabulary |
| Junk tokens + numeric optics | **inert** | "f/1.8 anamorphic shallow DOF" → background tack-sharp; matches published camera-parameter evals |
| Coarse shot grammar | **keeper** | "static wide from the dock… medium close-up on hands" executed literally |
| Motivated lighting (gaffer-speak) | **keeper, biggest lift** | named source/direction/fill produced visible sun, mist, rim light, lit cabin |
| Single film-stock register | modest | warmer, softer print feel; real but subtle |
| Physical motion verbs + explicit refusals | keeper | "pushes in slowly with small amplitude… no cuts" → gentle continuous push-in |
| Timeline blocks `[0s-2s]/[2s-5s]` | **keeper** | a true hard cut inside one generation, both shots as specified |
| In-prompt negation list | neutral | nothing summoned, nothing improved — LLM-encoder models tolerate prose prohibitions (their vendors' own corpora use them); CLIP/T5-class measurements still say negation backfires there |
| Imperfection cues, positively phrased | keeper | weathered skin, unkempt hair, documentary register vs the clean default |
| Everything stacked | **degraded** | most stylized frame, least realistic: muddy grade, smudged gulls — competing registers fight |

## The two rules the matrix earned

1. **Practices compose selectively, not additively.** For the register
   this matrix tested (documentary realism), the strongest composition was
   shot grammar + one lighting statement + imperfection cues (+ timeline
   blocks when the beat needs a cut) — not the pile. The stacked cell is
   the adjective-pile failure mode reproduced at the practice level. The
   verdict ranks practices *within one register*; which register a scene
   should be in — genre, lighting mood, lens feel — is upstream craft
   knowledge, not a single house recipe, and lives with the
   cinematic-language subject.
2. **Unspecified on-screen text is a standing hazard**: a boat hull
   rendered letter-shaped noise unprompted (per plate-elements-text-split,
   glyphs belong to the drawn layer or must be spelled out verbatim).

## Sources (accessed 2026-08-24)

- https://arxiv.org/pdf/2509.10759 — camera parameters ignored, measured
- https://arxiv.org/html/2505.15145 — CineTechBench, per-technique execution
- https://arxiv.org/html/2504.11739v1 — RAPO: excessive detail measurably hurts; match training-caption style
- https://openaccess.thecvf.com/content/CVPR2025/papers/Alhamoud_Vision-Language_Models_Do_Not_Understand_Negation_CVPR_2025_paper.pdf — negation affirmation-bias
- https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md — official structure, camera vocabulary, shot/timestamp format
- https://www.atlascloud.ai/blog/tips/minimax-h3-prompt-guide (2026-07-31) — official-corpus reverse-engineering, six-block format
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 (2025-10-16)
- https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide
- Local probe: 10 cells, MiniMax H3 pruned fp8 + turbo-8-step LoRA, 1344×768×124f, seed fixed, RTX 4090 — outputs `trial_01..10` (learning-use rig)
