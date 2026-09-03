---
layer: application
type: application
subject: shader-budget-authoring
technique: feature-cost-with-a-cheaper-swap
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: a pure material-budget estimator whose every cost names a cheaper swap

PoF (`C:\Users\kazda\kiro\pof`) implements the cost half of this subject as one pure,
dependency-free module: `src/lib/material-cost-estimator.ts`. Its header (lines 1–15)
states the purpose in the form the technique argues for — the post-process side already
had `src/lib/gpu-estimator.ts` and a GPU breakdown panel, while materials, "the more
common runtime-perf offender", were authored "with zero guardrails". The stated goal is
that **"material authors hit a wall before the engine does."**

The same header pre-empts the accuracy argument: the heuristics are "rough estimates by
design", because *"directionally correct" beats "deceptively precise" for a guardrail*.
That sentence is why the module is usable — nobody has to defend the numbers to ship it.

## Both caps, as named constants

```ts
/** UE5 hard sampler ceiling — exceed and the material fails to compile. */
export const SAMPLER_HARD_LIMIT = 16;
/** UE5 soft sampler ceiling — at/above this you're permutation-bombing the platform. */
export const SAMPLER_WARN_LIMIT = 13;
/** Above this instruction multiplier the material is meaningfully more expensive than baseline. */
export const INSTRUCTION_WARN_THRESHOLD = 2.5;
```

(lines 49–55). The two sampler numbers are three apart, and the soft-cap warning at
lines 142–149 says what those three slots are for: *"close to the 16-sampler cap on
platforms with shared MSAA/UI samplers"* — the renderer's own bindings, reserved.

## Baselines per surface, deltas per feature, a swap on every heavy one

`SURFACE_BASE` (lines 58–69) gives each of eight surface types a sampler count, an
instruction count, and a `mapNotes` string that names the maps the count assumes —
`metal: { samplers: 3, instructions: 60, mapNotes: 'Albedo + Normal + ORM' }`. The
three-sampler metal baseline is only three *because* occlusion, roughness and metallic
are packed; the note is what makes the count auditable.

`FEATURE_COST` (lines 84–91) is the technique's shape verbatim — the interface declares
the substitute as a first-class field:

```ts
/** Cheaper alternative the warning suggests when a heavier feature lights up. */
cheaperSwap?: string;
```

and every heavy feature carries one:

- `parallax` — 1 sampler, 250 instructions — *"Use BumpOffset (single tap) for ~4×
  cheaper depth illusion"*
- `subsurface` — 1 sampler, 120 instructions — *"PreintegratedSkin shading model is
  ~40% cheaper than full Subsurface"*
- `tessellation` — 1 sampler, 180 instructions — *"Nanite displaced surfaces drop the
  runtime shader cost vs domain-shader tessellation"*
- `refraction` — 1 sampler, 90 instructions — *"ThinTranslucent shading model avoids a
  refraction pass on flat glass"*
- `worldPositionOffset` — **0 samplers**, 60 instructions — the swap is a sampler swap:
  *"drive WPO from vertex color + time for cheaper wind"*

`emissive` (20 instructions) has no `cheaperSwap`, and the emit condition explains why:

```ts
if (c.cheaperSwap && c.instructions >= 120) { … }
```

(line 124) — advice is only offered where the saving is worth an author's attention.

## The report is a structured finding, not a sentence

`MaterialBudgetWarning` (lines 25–31) separates `kind`, `severity`, `message` and
`suggestion`, with the comment that `suggestion` is *"free-form follow-up the UI can
render as a chip / inline suggestion"*. The finding and the fix are two fields, so the
authoring surface can put the fix next to the bar rather than inside a paragraph. The
report also carries `samplerBreakdown` and `instructionBreakdown` — per-feature
attribution, so the author sees *which* feature to trade, not only that they are over.

`instructionScore` is a ratio, not an absolute: `instructions / SURFACE_BASE.metal.instructions`
(line 170), warned at 2.5× with the message *"Estimated 2.5× a metal base shader"*. The
reference travels inside the number.

## One finding per concern

Line 171 guards the aggregate warning on `!warnings.some((w) => w.kind === 'instruction-cost')`
— if a specific feature already raised the cost, the generic "this material is heavy"
line is suppressed. The specific finding wins.

## Deviations kept as deviations

Two, and the standard does not move for either:

1. **The caps and deltas are literals in this module**, while the prompt side of the
   same feature derives its guidance from versioned engine facts
   (`src/lib/engine-facts.ts`, via `src/lib/prompts/material-configurator.ts:19-21` —
   *"never a hard-coded 5.7+"*). The estimator should read its ceiling from the same
   versioned source; a renderer upgrade that moves the sampler cap currently updates the
   advice and leaves the gate behind.
2. **No headroom is stated for the material budget.** The VFX pipeline in the same repo
   states its as *"0.48 ms peak of a 0.8 ms per-class budget — 60% CONSUMED, 40%
   headroom"* (`src/lib/catalog/pipelines/vfx.ts:17-19`), and a comment at line 153
   records that the label *"used to say '60% headroom' and was inverted"*. The material
   estimator has the cap but not the share, so nobody can say how many such surfaces fit
   in one view.
