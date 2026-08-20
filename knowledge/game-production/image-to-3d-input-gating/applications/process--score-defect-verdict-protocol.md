---
layer: application
type: application
subject: image-to-3d-input-gating
technique: score-defect-verdict-protocol
stack: process
status: forged
---

# The five-criterion input rubric as a one-line reply protocol

How the PoF pipeline (`C:\Users\kazda\kiro\pof`) realizes the protocol: a single vision
call, a fixed one-line reply, a pure parser, and a shared scorecard shape.

## The prompt

`src/lib/visual-gen/input-gate.ts:25-40`, `buildInputGatePrompt(subject)`. It states the
stage explicitly — "This image is a 2D concept of a '<subject>' about to be fed to an
image-to-3D mesh generator" — then enumerates five criteria:

1. exactly one subject, no scene clutter or companions;
2. plain uniform background (white/neutral) with nothing that could bleed into the mesh;
3. near-canonical pose — roughly A-pose, limbs uncrossed, minimal self-occlusion;
4. subject fully in frame, not cropped;
5. clean readable silhouette without motion blur or extreme stylization.

Then the line that makes it a gate rather than a critique: *"Violations cause fused limbs,
floaters and fragmented geometry downstream."* The judge is told the mechanism, not just the
rule — the same phrasing pattern the sibling `footage-gate.ts:23-45` uses when it tells the
judge that fused feet are disqualifying *because foot contact drives root motion*.

The response contract closes it:

```
Reply on ONE line EXACTLY as:
SCORE=<0-10 integer>; DEFECTS=<comma-separated problems or 'none'>; VERDICT=<one short sentence>.
```

The same three-field protocol is shared by `footage-gate.ts` and the local vision critic
script `scripts/visual-gen/pof_vlm_critique.py` — one reply shape across three gates, so one
parser serves all of them.

## Parse and threshold

`parseGateReply` (`input-gate.ts:67`) is pure and tolerant of a chatty or fenced reply: it
regex-extracts the `SCORE=` marker and returns `{ ok: false, error: 'no SCORE marker in the
vision reply' }` when it is absent — an unparseable reply is a gate error, never a score.
`'none' | 'n/a' | '-'` normalize to an empty defect array rather than to a one-item list
containing the word "none".

`scoreInputGate` applies `DEFAULT_GATE = { passAt: 7, failBelow: 5 }`: at or above 7 pass,
below 5 fail, and 5–6 lands as `warn`. The band exists in the code, which is the point of
citing it — the thresholds are one exported constant, overridable per call via
`deps.thresholds`, not scattered across call sites.

## Two things this deployment does not do, which the technique still requires

**The defect vocabulary is open.** `DEFECTS=` is free-form comma-separated text and the parser
splits on commas without validating against a closed list. That makes cross-batch counting
unreliable for exactly the reason the technique states: two phrasings of one problem become
two rows. The standard is a closed vocabulary; this is a deviation, and the fix is a small
enumerated list in the prompt plus validation in the parser, not a looser standard.

**The middle band proceeds.** `inputGateRefusal` (`input-gate.ts:141`) refuses only on
`verdict !== 'fail'`, so a 5 or 6 generates. The technique's rule is *prepare and re-gate*.
Keeping `warn` visible in the report is honest; letting it spend is not.

## The basis mismatch, kept visible

`scoreInputGate` returns `score: score * 10` into the shared `Scorecard` shape, so a rubric
scored 0–10 is reported 0–100 (`summarizeInputGate` renders `input gate PASS (score 70/100)`)
while the threshold constant reads `passAt: 7`. Both numbers are correct on their own basis
and neither is stated with it at the point a human reads them. Re-base the thresholds
alongside the score, or report both on one scale.

## Critic selection was measured, not assumed

`docs/research/vlm-critique-experiment.md:1-54` records the choice: Qwen3-VL-4B-Instruct at
8.9 GB VRAM, 11 s load, **3.1 s inference**, returning `SCORE=7; DEFECTS=warped legs,
inconsistent stitching, texture mismatch; VERDICT=...` — a named, specific defect where a
CLIP cosine of 0.97 discriminated nothing. Gemma 4 12B was rejected not on capability but on
coexistence: it needs transformers ≥ 5, which breaks the TripoSR generator's checkpoint
loading (renamed ViT encoder keys), and both 4-bit and 8-bit quantized paths crashed in a
LayerNorm. The operative finding for a gate is that the critic must share a runtime with the
thing it gates, or it will eventually break it.
