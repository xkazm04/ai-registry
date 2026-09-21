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

## Architecture review - 2026-09-10 (after the compression revert)

Read all ten documents at 44c89965 and checked the subject's one hard external
claim against primary documentation. That claim is wrong, and it is the sentence
the subject's central distinction is built on.

**"It is silicon, not policy" is false, and the subject contradicts it two
documents later.** The golden path says of the sixteen-sampler ceiling: "it has not
moved in a decade because it is silicon, not policy". `sampler-hard-and-soft-caps.md`
repeats it: "sixteen on mainstream graphics hardware, unchanged for years because
it is a hardware property rather than an engine setting." I read Microsoft's
Direct3D 11 resource-limits page. Sixteen is
`D3D11_COMMONSHADER_SAMPLER_SLOT_COUNT`, a constant defined in `d3d11.h` and listed
among the API's resource limits - a binding-model limit, not a hardware one. The
same page gives `D3D11_REQ_SAMPLER_OBJECT_COUNT_PER_DEVICE` as 4096, so the device
holds far more sampler objects than a stage may bind; sixteen is what the slot model
exposes. And it did move: Direct3D 12's shader-visible sampler descriptor heap
allows 2048, a 128x increase, shipped in 2015. The ceiling is a property of the
binding model the renderer targets, which for Unreal's SM5 path is the D3D11-era
one - which is exactly why shared samplers exist as a workaround, and why the
technique's own when-not-to-use bullet already says "bindless resource models remove
the register scarcity". That bullet and "silicon, not policy" cannot both stand.

The correction does not weaken the subject; it strengthens the hard-versus-soft
distinction by putting the hard cap where it belongs (this renderer, this feature
level, this binding model) instead of in physics, and it makes the versioned-facts
section - which already argues every number here belongs to a renderer version -
apply to the one number the prose exempted. I read the specification pages; I ran no
renderer, compiled no shader and opened no engine.

**The worked lighting-preset table has no floor tier, and nothing records it.** The
technique's step 2 prescribes four presets as "a hardware-traced preset for the top
tier, a software-traced preset at each of two detail settings for the middle, and a
baked or screen-space fallback for the floor", and devotes an entire section to why
the floor tier deserves the most attention. The process application's four presets
are two hardware-traced AAA entries plus the two software ones. There is no baked or
screen-space fallback and no floor tier at all. The application records a different
deviation (no stated frame budget per preset) and passes over this one, which is
larger and is precisely the failure the technique predicts: minimum-spec is never
actually run. Its `wide-hardware` tier label is also outside the tier vocabulary the
technique defines and is undefined anywhere.

**The instruction threshold is crossed by one ordinary feature.** In the estimator
application, `instructionScore` is instructions divided by the metal baseline of 60,
warned at 2.5x - so the warning fires at 150 instructions, while `parallax` alone
costs 250 and `STYLE_RULES` attaches parallax automatically to any brief containing
"stone", "rock", "brick", "concrete" or "marble". Every stone surface is therefore at
5.2x or worse before an author chooses anything. The suppression rule at line 171
keeps the output readable (the specific finding wins), so this is not a reporting
bug, but a threshold labelled "meaningfully more expensive than baseline" that any
single heavy feature clears is measuring feature presence, not expense. Worth stating
what the 2.5x is meant to separate.

Minor but consistent: the subject insists that every number carries its basis, and
then quotes the subsurface premium as "roughly a third to two-thirds more expensive
per pixel" (technique) and "roughly 30-60% more expensive than DefaultLit per-pixel"
(application) with no renderer, resolution or lighting configuration attached. The
two agree with each other, which is the more important property, but the figure is an
instance of the thing the golden path warns about two sections earlier.

What I checked and found sound: the hard-versus-soft framing itself, once its
attribution is fixed, and the observation that the remedies differ by kind (removal
or packing past a correctness boundary; substitution and an owner past an economics
one); the headroom-label inversion argument, with 0.48/0.8 = 60% consumed correctly
stated in both halves; the whole of channel packing - the linear-not-colour rule, the
correlated-block-compression caveat, the alpha-precision note and the two costs are
accurate for standard PBR practice; the forbidden-combinations split between
contention (an error, refuse to return a number) and superlinear interaction (a
warning with a measured multiplier), and its discovery rule that a pair surfaces as a
compile failure or a profiled cliff, never as a linear increase.

All three applications remain `reverify`. They cite a PoF checkout by file and line
at `verified_on` 2026-08-20 and 2026-08-30 with no commit pinned; no module was
executed, no material compiled, no frame profiled.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/shader-budget-authoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:814526a142dd175e",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at 44c89965. The sampler-ceiling claim checked against Microsoft's Direct3D 11 resource-limits documentation and against D3D12 descriptor-heap limits. The estimator's threshold arithmetic (2.5x a 60-instruction metal base versus a 250-instruction parallax delta) and the headroom label (0.48/0.8) re-derived. The preset table cross-checked against the technique's own prescription. Explicitly NOT evaluated: any PoF checkout, any renderer, any compiled material, any profile, any engine version's actual reserved sampler count.",
  "counterexamples": [
    "Sixteen samplers is D3D11_COMMONSHADER_SAMPLER_SLOT_COUNT, an API constant in d3d11.h, while the same document allows 4096 sampler objects per device - so the limit is the binding model, not the silicon.",
    "Direct3D 12's shader-visible sampler descriptor heap allows 2048, so the ceiling demonstrably moved; the technique's own bindless when-not-to-use bullet concedes this while the prose says it cannot happen.",
    "The worked preset table has no floor-tier preset at all, which is the exact outcome the technique's floor-tier section predicts and warns about.",
    "A 2.5x-of-a-60-instruction-baseline threshold fires at 150 instructions while a single parallax feature costs 250, and the keyword table attaches parallax to every stone, rock, brick, concrete and marble brief - so the threshold separates 'has a heavy feature' rather than 'is meaningfully above baseline'.",
    "Two of the subject's own quoted figures - the subsurface premium at a third to two-thirds - carry no renderer, resolution or lighting basis, in a subject whose headline rule is that a number without its basis is not information.",
    "A material under the soft cap in an unlit context can still be unlightable in a scene where the renderer's own bindings differ from the representative surface the reservation was counted against; the reservation is a per-configuration measurement the documents treat as a single number."
  ],
  "sources": [
    {
      "url": "https://learn.microsoft.com/en-us/windows/win32/direct3d11/overviews-direct3d-11-resources-limits",
      "result": "Establishes that the sixteen-sampler figure is D3D11_COMMONSHADER_SAMPLER_SLOT_COUNT, a constant defined in d3d11.h among Direct3D 11's resource limits, and that D3D11_REQ_SAMPLER_OBJECT_COUNT_PER_DEVICE is 4096 - an API binding-slot limit, not a hardware property. It did NOT establish what any specific GPU implements, what Unreal reserves for its own bindings, or what any material compiles to; nothing was run."
    },
    {
      "url": "https://microsoft.github.io/DirectX-Specs/d3d/ResourceBinding.html",
      "result": "Corroborates that D3D12's shader-visible sampler descriptor heap permits up to 2048 samplers, so the sixteen-slot ceiling is specific to the older binding model and has been superseded in a shipping API. Read at search-summary level against the spec; no D3D12 application was written or run."
    }
  ],
  "documents": {
    "shader-budget-authoring.md": {
      "disposition": "clarify",
      "reason": "'It is silicon, not policy' is refuted by Microsoft's own resource-limits documentation and contradicted by this subject's bindless caveat. Attribute the hard cap to the renderer's binding model at a version - which is what the document's own versioned-facts section already demands of every other number here."
    },
    "techniques/sampler-hard-and-soft-caps.md": {
      "disposition": "clarify",
      "reason": "Repeats 'a hardware property rather than an engine setting' while its when-not-to-use section concedes that bindless models remove the scarcity. Same correction as the golden path; the two-thresholds structure, the reserve-do-not-round rule and the refuse-do-not-trim rule are all sound and stay."
    },
    "techniques/channel-packing.md": {
      "disposition": "keep",
      "reason": "Every technical claim checks out against standard PBR practice - single-channel data wastes samplers, packed maps are linear and only base colour and emissive carry a transfer curve, correlated block compression bleeds uncorrelated channels, alpha is stored separately in several formats. The two stated costs are the right two."
    },
    "techniques/surface-to-shading-model-map.md": {
      "disposition": "keep",
      "reason": "The forced-versus-default distinction is the load-bearing idea and is stated precisely; binding each adjective rule to the feature it implies rather than only to a scalar is the non-obvious half. Its subsurface premium wants a basis, which is a sentence, not a finding against the rule."
    },
    "techniques/feature-cost-with-a-cheaper-swap.md": {
      "disposition": "keep",
      "reason": "The three-column table shape, the name-what-the-substitute-gives-up rule, the order-by-look-retained rule and the profile-outranks-the-model rule are internally consistent and match the application field for field. Nothing here failed a check."
    },
    "techniques/forbidden-feature-combinations.md": {
      "disposition": "keep",
      "reason": "The contention-versus-superlinear split, the refusal to return a total, and the discovery rule (a pair surfaces as a compile failure or a profiled cliff, never as a linear increase) are correct and the pair-list-growth heuristic is a good check on the cost model itself."
    },
    "techniques/hardware-tier-lighting-presets.md": {
      "disposition": "keep",
      "reason": "The tiers-by-hardware-not-adjective rule, the trade-not-a-ladder rule, the non-shipping reference mode, and the floor-tier section are all sound. The gap is in the application, which does not implement the floor preset this technique prescribes."
    },
    "applications/node--feature-cost-with-a-cheaper-swap.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-30, no commit pinned, module not executed. Its two recorded deviations (caps as literals rather than versioned engine facts; no stated headroom share) are correct and stay; the 2.5x threshold's relationship to a 250-instruction parallax delta should be added beside them."
    },
    "applications/process--hardware-tier-lighting-presets.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-20, checkout not made. It records the missing frame budget but not the larger deviation: four presets with no baked or screen-space floor tier, and a `wide-hardware` tier label outside the technique's vocabulary."
    },
    "applications/process--surface-to-shading-model-map.md": {
      "disposition": "reverify",
      "reason": "Same unverified checkout. Its identification of the unmatched-keyword gap is the right finding and matches the technique's decision rule; the engine-facts derivation it praises is also the fix the estimator application needs."
    }
  }
}
```
