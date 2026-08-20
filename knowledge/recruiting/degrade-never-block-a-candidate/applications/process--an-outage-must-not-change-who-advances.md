---
layer: application
type: application
subject: degrade-never-block-a-candidate
technique: an-outage-must-not-change-who-advances
stack: process
status: forged
---

# Keeping degradation away from the advance decision — the Python pipeline

The pipeline is where degradation could most easily become a selection criterion: it
is the layer that turns a candidate into a verdict the TS side branches on. Three
mechanisms keep the outage out of that decision.

## 1. The fallback verdict is the middle state, never an outcome

`pipeline/jobfit/automation.py:85` defines the canonical verdict vocabulary once —
`RECOMMENDATIONS = ("advance", "hold", "reject")` — and, immediately below,
`RECOMMENDATION_FALLBACK = "hold"` for an unknown, empty or malformed verdict, with
the reasoning stated:

> Never silently `advance` (could auto-progress a candidate) or `reject` (the fairness
> gate forbids a silent auto-reject) — `hold` routes to the human Decisions gate.

So a degraded or malformed run cannot move anyone in either direction; it moves them
to a person. `SCREEN_ROUTES = ("advance", "hold")` (`automation.py:98`) narrows the
*actionable* set below the *expressible* set, so `reject` is not something the
automation layer can execute at all. The verdict semantics and the hold's fairness
properties belong to the `automated-screening-fairness-gates` subject; what this
application shows is that the degraded path lands inside that safe set by
construction rather than by branch.

`RECOMMENDATION_CHOICES` is derived from the same tuple and rendered into the prompts,
so the model can never be shown a stale vocabulary — the degraded and authoritative
runs are answering the same question.

## 2. Degraded grounding is a declared flag, not a lower score

`docs/architecture/llm-provider-layer.md:65` records the rule this subject cares most
about:

> The registry rejects (or visibly degrades) a config that routes a use case to a
> provider missing a required capability — e.g. `cv_analysis` on OpenAI runs without
> salary grounding and the envelope flags `grounding: "unavailable"` so the UI can
> show lower confidence.

Two properties of the standard are met at once. The missing capability is **declared
ahead of the run**, from the capability matrix at `llm-provider-layer.md:57-63`, rather
than discovered at read time. And the degradation is expressed as an **envelope flag**
that makes the surface show lower confidence — not as an adjustment to the score
itself, so a candidate assessed without salary grounding is not silently ranked
beneath peers assessed with it.

The key-resolution order at `llm-provider-layer.md:83-84` closes the loop: workspace
BYOM key → platform key → provider unavailable → **existing deterministic fallback**.
One route, shared by outage and by absent credential.

## 3. Even the demonstration path refuses to skip the human gate

`app/api/sim/screen-draft/route.ts:7` is a deterministic, no-LLM screening
recommendation used by the simulation. It could trivially have auto-advanced — it is a
demo. Instead it "sets the `screening_review` approval so a real card appears in the
Decisions queue for the driver to click 'Advance' on (the genuine human-decision
gate)". The hardcoded draft at `route.ts:23-28` carries `recommendation: "advance"`
and `confidence: 72`, and still none of it advances anybody. A path that models the
system without a model in it still cannot change who advances.

## Deviations from the standard

- **No degraded-window accounting.** The technique's core procedure — define the
  window, enumerate the candidates produced inside it, compare advance rates against
  candidates outside it, recompute before anyone reviews — is not implemented. The
  `source` / `grounding` tags make the affected set *findable* in principle
  (`llm_usage` at `llm-provider-layer.md:78` carries a `source` column), but no job
  sweeps a window and nothing compares outcome distributions across it.
- **Mixed grades can share one ranked view.** Nothing prevents a recruiter's list from
  interleaving deterministic-source and LLM-source readings; the tag exists per record
  but the surface does not separate or mark them at the list level. Both standards
  stay.
