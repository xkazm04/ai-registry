---
domain: game-production
subject: shader-budget-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# shader-budget-authoring

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/shader-budget-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:896702f82d87fc13",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Several textures using the same filtering and addressing state can share one sampler while still requiring separate texture resources and fetches.",
    "Three single-channel compressed maps need not occupy three RGB textures, so packing cannot universally save two-thirds of storage.",
    "Coarse vertex displacement and fine texture-space relief can represent different detail bands without applying the same depth twice."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/surface-and-imagery/shader-budget-authoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://learn.microsoft.com/vi-vn/Windows/Win32/direct3d11/overviews-direct3d-11-resources-limits",
      "scope": "Official search evidence distinguishes 128 common-shader input resource slots from 16 sampler slots in the documented API. These are scoped interface limits, not universal hardware or performance budgets."
    },
    {
      "url": "https://docs.unity.cn/6000.1/Documentation/Manual/SL-SamplerStates.html",
      "scope": "Official manual search evidence describes separate texture/sampler declarations and sharing. No shader compilation or performance measurement was run."
    }
  ],
  "documents": {
    "shader-budget-authoring.md": {
      "disposition": "reverify",
      "reason": "Reverify universal sixteen-sampler silicon ceiling, sampler count as frame-time budget, forced shading paths and forbidden displacement/parallax pairing. Packing and sampler techniques are repaired. A per-pass resource limit does not add across unrelated draws, and a baseline ratio need not survive renderer changes."
    },
    "techniques/channel-packing.md": {
      "disposition": "clarify",
      "reason": "Repaired texture/resource/sampler distinction, actual compressed storage, per-channel encoding, differing UV/resolution needs, precision and versioned-layout compatibility. Packing has measurable tradeoffs rather than guaranteed free savings."
    },
    "techniques/feature-cost-with-a-cheaper-swap.md": {
      "disposition": "reverify",
      "reason": "Cheaper alternatives depend on hardware, geometry, screen coverage and feature implementation. A high-step parallax shader can cost more than geometry displacement; absolute measured times remain useful. Suppressing aggregate budget failure because one feature warned can hide the total requirement."
    },
    "techniques/forbidden-feature-combinations.md": {
      "disposition": "reverify",
      "reason": "Displacement and parallax can represent different spatial scales and compose intentionally. Analytic contracts can establish incompatibility without a runtime incident, while an unmeasured pair is not automatically forbidden. Interactions can involve three or more features and need bounded estimates rather than universal refusal."
    },
    "techniques/hardware-tier-lighting-presets.md": {
      "disposition": "reverify",
      "reason": "Global presets and per-material quality variants can coexist. Path-traced shipping and per-scene overrides can be legitimate when supported and measured. Hardware generation adjectives remain ambiguous, and top-tier authoring is not universally optimal for a constrained target."
    },
    "techniques/sampler-hard-and-soft-caps.md": {
      "disposition": "clarify",
      "reason": "Repaired platform/pass-specific hard limits, sampler sharing, compiled binding counts, separate reservations and measured performance budgets. Unpacked estimates generally overstate rather than understate packed fetch/resource counts; bindless is not unlimited resources."
    },
    "techniques/surface-to-shading-model-map.md": {
      "disposition": "reverify",
      "reason": "Surface words imply hypotheses, not forced implementations. Skin or foliage may use cheaper approximations, a glossy dielectric is not necessarily metallic, and cracked detail need not displace geometry. Versioned facts do not validate arbitrary physical-property defaults or keyword matches."
    },
    "applications/node--feature-cost-with-a-cheaper-swap.md": {
      "disposition": "reverify",
      "reason": "Historical constant deltas are unprofiled estimates, not established direction or magnitude. The displayed WPO/refraction substitutions are suppressed by instructions >= 120 despite prose describing every heavy feature. Three textures need not mean three sampler states. Consumer not rerun; machine-specific root remains reconciliation work."
    },
    "applications/process--hardware-tier-lighting-presets.md": {
      "disposition": "reverify",
      "reason": "Historical four presets do not correspond one-to-one to hardware tiers and carry no measured frame budget. Full hit-lighting and thin-wall recommendations need current version/mode evidence; no current renderer profile or consumer behavior was verified."
    },
    "applications/process--surface-to-shading-model-map.md": {
      "disposition": "reverify",
      "reason": "Shared SurfaceType vocabulary does not single-source the keyword rules, estimator and prompt mappings. Stone need not imply parallax, and character/body words need not mean exposed skin. Forced transparent/refraction paths and production-ready version claims need platform-specific source verification; consumer not rerun."
    }
  }
}
```
