---
layer: application
type: application
subject: adaptive-fidelity-tiers
technique: per-tier-budget-tables
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# React application — per-tier budget tables

Six components consume the tier through one hook, `useQualityTier()`
(`src/contexts/QualityContext.tsx:169-171`), and each declares its own
budget beside its own implementation. Read together they cover every shape
the technique describes, including the two it warns about.

## The tables

```
FloatingParticles.tsx:11   PARTICLE_COUNTS  { high: 30, medium: 15, low: 0 }
ParallaxAccents.tsx:7      ACCENT_COUNTS    { high:  8, medium:  4, low: 0 }
CinematicBreather.tsx:62   PARTICLE_COUNTS  { high: 25, medium: 15, low: 8 }
```

Three module-level constants, typed `Record<QualityTier, number>` against
the vocabulary exported from the context — so a fourth tier makes all three
tables fail to type-check at once, which is the mechanical sweep the
technique asks for. Every row is a **count**, never an on/off flag, and the
reduced rows sit at roughly half of full, in line with the ratio the
project's own gating contract publishes (`src/lib/animations.ts:12-16`:
"high → full fidelity, medium → ~60 % of full, low → ~30 % of full, or
static fallback").

`CinematicBreather.tsx:62` is the interesting row: its floor is **8, not
0**. The ambient field inside that section is the section's only visual
life, so the floor is a reduction rather than an absence — the same table
shape as the other two, used to express the opposite decision. The two
tables ending in zero are decorative overlays whose removal leaves a
complete design behind, and the difference is a per-effect judgement made
in the effect, exactly as the technique requires.

## Allocate at the top row, draw a prefix

`FloatingParticles.tsx` is the construction that makes a tier change free.
`MAX_PARTICLES = PARTICLE_COUNTS.high` (`:35`) derives the allocation from
the table's top row, `ALL_PARTICLES` is built once at module scope
(`:36-45`), and the render path takes a prefix:
`ALL_PARTICLES.slice(0, PARTICLE_COUNTS[tier])` (`:51`). A downgrade frees
nothing, an upgrade allocates nothing, and the per-frame saving is real
because the draw loop (`:56`) is shorter. There is no remount, no
reconstruction, and no work at the transition itself.

## A row that governs a one-time cost

`HeroAmbientIllustration.tsx:22` gates on `tier === "low"` for a reason
that is not per-frame at all, and its header comment (`:6-18`) states it:
the low tier "drops it entirely rather than paying for a 325 KB texture
plus the two effects that force it onto its own compositor layer —
`mix-blend-lighten` (blends against everything painted beneath it) and the
radial `maskImage`". Download weight, decode, and a forced compositor layer
are the costs; the frame-time measurement is being used as a fair proxy for
whether the device can afford them. This is the strongest case in the tree
for the meaning living beside the effect: that *this* mask plus *that*
blend mode force a separate layer is knowledge no central registry would
have held.

## Discrete extra passes

`TopoBackground.tsx` shows the sub-part boolean the technique permits.
Layer 3 is wrapped in `{tier === "high" && (` (`:72`) under the comment
"Bottom-right + accent clusters (high tier only)", and the component's own
header (`:10-13`) enumerates all three layers with the high-tier
qualification on the third — so the degradation story is legible from the
top of the file. `AmbientOrbs.tsx` has the same shape: the second orb is
behind `tier === "high"` (`:23`), and `:11-12` carries the comment "Low
tier drops the blur-heavy radial gradients entirely" above the early
return.

**Deviation:** both of these express a real three-step ladder — two orbs,
one orb, none; three topographic layers, two, none — as inline conditionals
rather than as a table. The ladders are correct and they are not
enumerable: answering "what does the floor tier look like" requires reading
the render bodies rather than five constants. Note also that
`TopoBackground.tsx:22` is the reduced-motion return and the tier gate is
`:23`; they read as one guard and are two decisions.

## The table read at mount, which is the defect the technique names

`CinematicBreather.tsx:96` reads `PARTICLE_COUNTS[tier]` at render, which
looks right. The array is then built inside `onResize` behind
`if (particlesRef.current.length === 0)` (`:101-111`), so it is constructed
once, at first sizing, and never again. `particleCount` is in the callback's
dependency list (`:112`), so the callback's identity changes on a tier
change and the guard immediately discards the consequence.

The effect is that this component's tier row is dead after the first
layout: a device downgraded from high to low keeps drawing 25 particles
where the table says 8. It is precisely the failure the technique
predicts — it presents as "the adaptive system does nothing", and it
survives review because the component visibly consults the tier three lines
from the top. The fix is a size reconciliation rather than a remount: grow
or truncate `particlesRef.current` toward `particleCount` when it changes,
which also preserves the prefix property `FloatingParticles.tsx` gets for
free.

## The obligation is written down

`src/lib/animations.ts:3-30` carries an "Animation Gating Contract" that
grades the obligation by cost class rather than demanding a table from
everything: clock-driven canvas components *MUST* call `useQualityTier()`
and scale complexity by tier; compositing-heavy CSS and SVG layers
*SHOULD*; lightweight composited transitions are *exempt*. Every one of the
six consumers falls in the first two classes, and no cheap fade in the tree
subscribes to the tier — which is why the tier is not itself a cost here.
