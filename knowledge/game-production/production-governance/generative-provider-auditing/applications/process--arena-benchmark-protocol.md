---
layer: application
type: application
subject: generative-provider-auditing
technique: arena-benchmark-protocol
stack: process
status: forged
verified_on: 2026-08-20
---

# Two arenas in PoF: the mesh A/B and the critic selection

PoF runs model comparisons as executable harnesses under `scripts/visual-gen/`, with the
verdicts written back into the pin module. Two runs show the protocol from opposite ends:
one where quality decided, one where a systems constraint decided.

## Arena 1 — `pof_tripo_smartlowpoly_arena.ts`

The question: is Tripo's `smart_low_poly` flag ("Smart Mesh", marketed as P1/P2) better
than the audited baseline?

**Establishing what actually varies.** `src/lib/visual-gen/tripo-models.ts:18-22` records
the check against the primary API reference: `model_version` accepts only
`v3.1-20260211` or `v3.0-20250812`, so `smart_low_poly` is "a FLAG on the SAME
`model_version` already pinned here", not a separate model. The arena header
(`scripts/visual-gen/pof_tripo_smartlowpoly_arena.ts:3-7`) therefore describes itself as a
"same-model, same-format A/B" — the finding is labelled as a settings comparison, which is
what it is.

**Fixed set, identical budgets, per class.** Three budgeted classes — weapon (15,000
faces), prop (10,000), modular-part (8,000) — chosen because they "have no production
caller yet", so the run cost money and disturbed nothing. Same model, same texture
settings, `smart_low_poly: true` vs `false`.

**Signals, not the composite verdict.** The header (`:19-26`) is explicit that the arena
"deliberately does NOT trust `scoreMesh`'s pass/fail verdict as the arena's grade" —
nothing in the corpus has ever scored a `pass`, and raw deliveries are graded against
thresholds authored for finished meshes. It reports the underlying signals instead,
identically for both arms: `gradeFaceBudget` (does the delivery honour its requested
budget), `classifyComponents` (raw component/floater shape), and a Qwen-VL score of the
provider's own preview render against the reference image.

**A correction written at the wrong claim.** The same header carries a marked
re-measurement (`:11-17`): the originally recorded reason — that the gate "fails raw
output near 100% of the time on face count alone" — was re-derived over all 52 `.glb`
under `generated/` and found wrong in its mechanism. The gate actually fails 10 of 52
(19.2%), all ten on `floaters`, and face count cannot fail a mesh at all — `scoreMesh`
files it as a WARN, so 1,492,072 faces against a 12,000-face ceiling grades warn/85. The
verdict survived; the explanation was replaced in place and marked, rather than quietly
rewritten.

**The result, recorded at the decision point.** `SMART_LOW_POLY_VERDICT`
(`tripo-models.ts:63-72`) sits beside the pin with per-class numbers: the flag overshot
its own requested `face_limit` in all three classes (1.26x–1.35x, while the baseline
honoured its budget every time at 0.82x–0.96x), produced 1,900–2,400 raw components
against the baseline's 83–137, and scored equal-or-worse on the vision judge. The record
carries `benchmarked: '2026-08-18'`, `verdict: 'rejected'`, and `harness:` naming the
script — so the rejection is re-runnable. The comment above it states the purpose exactly:
kept next to the pin "so a future session sees the completed verdict at the decision point
instead of assuming this is still an open gap and re-benchmarking it."

**The harness pins nothing.** `:30-32`: "Nothing here writes production data or pins
anything — it only prints a comparison table. Pinning a result is a separate,
human-reviewed edit to `tripo-models.ts`." It also declares its own spend up front — 2
Tripo tasks per class, `smart_low_poly` costing +10 credits over the base task, plus one
vision call per delivered render — and offers `--dry` and `--class <name>` modes.

## Arena 2 — `docs/research/vlm-critique-experiment.md`

The question: which vision-language model can be the aesthetic critic for the zero-budget
3D pipeline. Two arms, identical task (critique the same TripoSR chair render plus its
input reference), identical hardware (24 GB RTX 4090), one model-agnostic driver
(`scripts/visual-gen/pof_vlm_critique.py`).

The 4B arm won on **coexistence**, not on quality. The 12B candidate *fit* the card
quantized (8.3 GB at 4-bit) — memory was never the blocker. It lost on three compounding
systems constraints (`:24-33`): it required transformers ≥ 5, and transformers 5 breaks
TripoSR generation because the ViT image-encoder keys were renamed, so the checkpoint will
not load; both 4-bit and 8-bit quantized inference crashed in a LayerNorm; and the fp16
path OOMs at ~24 GB. The 4B runs on both transformers 4.57 and 5, so "it coexists with the
generator. No env split needed" (`:35-37`).

The document also prices the entanglement (`:39-44`): wiring in a VLM pulled `torchvision`,
which bumped torch 2.10 → 2.11, and the 12B forced transformers 5, which broke the
generator until the shared venv was restored to `transformers==4.57.3`. The stated lesson —
keep the critic compatible with the generator's runtime, or isolate it so it can never
break the generator — is the coexistence rule in its concrete form. Licence was checked for
both arms as a membership precondition (both Apache-2.0, "commercial-safe"), and the loser
was parked with a stated reopening condition rather than deleted: "revisit when
bitsandbytes/transformers patch the new arch."
