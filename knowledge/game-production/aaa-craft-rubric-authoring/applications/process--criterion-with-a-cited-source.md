---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: criterion-with-a-cited-source
stack: process
status: forged
---

# A ten-lens craft rubric corpus with a named source per criterion

An AI-assisted ARPG production tool (`pof`) grades every generated deliverable through a
corpus of markdown craft lenses under `src/lib/craft/lenses/` — ten of them, one per
craft: `game-systems-code`, `narrative`, `dialogue`, `voiceover`, `audio`, `vfx`,
`2d-art`, `3d-art`, `animation`, `production-process`. Each is a plain markdown document
with YAML frontmatter (`lensId`, `lensVersion`, `ceiling`, `appliesTo`) and a fixed four-
block body: benchmark anchors, criteria, scoring guidance, disqualifiers, ceiling
statement. This is the technique's entry shape realized at scale.

## The entry shape

`src/lib/craft/lenses/game-systems-code.md:1` carries nine criteria. Each is a level-3
heading of the form `### <slug> — <bar in one clause>`, then a paragraph stating what a
gaugeable artifact must contain, then a single `Source:` line naming a talk or textbook
with author, venue and year. Examples, abbreviated:

- `itemization-affix-budgets` — per-rarity affix-count budgets, per-affix value ranges,
  and pool exclusion rules; sourced to a named GDC 2015 postmortem on an itemization
  rebuild.
- `economy-faucet-sink-accounting` — every currency enumerates its faucets and sinks with
  rates and a stated intended net flow; sourced to a 2014 MIT Press virtual-economy
  textbook.
- `tuning-field-granularity` — many small individually addressable fields, each with an
  intent note; sourced to a GDC 2010 talk about changing one weapon's time-between-shots
  from 0.5 to 0.7 seconds.
- `progression-curve-derivation` — curves authored as formulas with stated growth class,
  anchor points and breakpoints, so a reviewer can recompute any row; sourced to a 2021
  game-balance textbook.
- `ue5-code-conventions` and `data-driven-tunables` — sourced to the engine vendor's own
  published coding standard and data-driven-gameplay documentation.

Every one of these is the four-part shape the technique prescribes: positive bar, named
source, what in the stored artifact answers it, and the failure form ("a monolithic
`damage: 37` blob with no decomposition or rationale fails").

## Specifications beat talks, and the corpus shows why

`src/lib/craft/lenses/audio.md:36` is the strongest entry in the corpus because its
source is a published platform loudness specification rather than a talk: the criterion
carries the target figure (−24 LKFS ±2 LU), the true-peak ceiling (−1 dBTP), and the
requirement that the stored file's metadata carry a *measured* integrated loudness plus a
*declared* target that match within tolerance — with any deviation from the platform norm
justified in the spec rather than silent. The neighbouring criteria in the same file are
sourced to named GDC talks on adaptive scoring and on mixing so gameplay is legible by
ear alone; they are good criteria, but they are arguable in a way the loudness one is
not.

`src/lib/craft/lenses/production-process.md:1` shows the fourth source class — documented
methodology. Its nine stage-gate criteria cite a named 2002 production method (twice:
once for the concept/macro-design gate, once for the vertical-slice quality-bar proof), a
1999 magazine article describing a studio's standing cross-discipline review forum, a
2014 book on a film studio's dailies culture, and a GDC 2015 talk on structured playtest
research. Process criteria without a named method drift into whatever the current lead
prefers; naming them is what makes "the pipeline has no bar-setting gate" a citable
finding rather than an opinion.

## One source for the bar the judge scores and the bar the prompt asks for

`src/lib/judge/dimensions.ts:1` states the rule in its own header: the module "is
imported by BOTH the strict judge rubric (WS2) and the quality prompt packs (WS1) so the
bar the judge scores and the bar the prompt asks for can never drift apart."

Two exports carry it. `STYLE_ANCHORS` at `src/lib/judge/dimensions.ts:44` holds one
reference-anchor sentence per deliverable class — the same sentence the generator is told
to aim at and the judge compares against. `DIMENSIONS` at `:55` holds the per-class
criterion list, each entry a `key` plus a `bar` field documented as "What
'professional-grade' means for this dimension — the bar, stated positively": for
`text-config`, coherence with siblings, numeric specificity with "zero filler or
generic-fantasy boilerplate", a senior design voice, load-bearing completeness,
plausibility; for `2d-art`, silhouette at icon scale, value hierarchy, material
rendering, edge quality, style cohesion, cleanliness.

## Where the corpus falls short of the standard

Two deviations, neither of which lowers the bar in the golden path:

- **Two criterion systems coexist.** The markdown lenses carry sourced criteria; the
  typed `DIMENSIONS` bars carry no sources at all. The typed bars are the ones fused with
  the prompt packs, and the sourced ones are the ones with provenance — the technique
  wants both properties in one place.
- **Criterion count runs at the top of the band.** Nine per lens is within range; the
  visual lenses combined with their sub-rubrics push a single medium past a dozen bars
  spread across documents, which is where examiners start averaging rather than
  answering.
