
## 1.0.0 - 2026-08-30 - gravitone
- The forge-shaped runner (scene x style-recipe crossing) cannot A/B a PROMPT property — composition, lighting, lens, performance, reference handling. The consuming repo needed a second runner taking a pair spec (two full prompts + optional reference/window per arm, one seed per duo) and reading every image back with the same annotator. Overlay now names both runners; a cycle picks by what is under test: recipe -> forge, prompt -> pairs.
- Baselines for prompt cycles must come from the consuming repo's LIVE compiler (a tsx driver over its shotPrompt/compilePrompt), never a retyped copy — retyping is the drift the A/B would then measure.
- An 8-cycle variety window (4 duos each) produced two unanimous winners, four probables and one clean null in ~5 GPU-hours; the null (invariants-only reference under a 0.35 denoise window) was as informative as the wins — the windowing already sheds the reference's pose, so the technique's failure mode may be mechanism-specific. Small cycles, many dimensions beats one deep cycle when the operator asks for breadth.
- Chained detached passes (each cycle: pass 1 + fill pass) self-heal the 1-3 per-pass ComfyUI races this class of box produces; the breaker never tripped across 80 renders.

### Redesign proposal
- Phase 4/5 assume the forge's manifest shapes. The pair-spec runner + a `judge prepare/park` helper (blind maps, Gemini with model fallback, unblinding, pick-rate arithmetic) were rebuilt in the consuming repo this run; if a second repo needs them, they belong in the skill's references as a named contract (gen-spec.json / readbacks.json / judging-worksheet.json) rather than re-derived.
- Control-arm cycles (challenger = a deliberate violation of a standing law) are the cheapest evidence a window can buy, but the gate reads backwards: the human must REJECT the challenger to confirm the law. Say so in the cycle's claim, or the verdict row will lie to the next reflection.
