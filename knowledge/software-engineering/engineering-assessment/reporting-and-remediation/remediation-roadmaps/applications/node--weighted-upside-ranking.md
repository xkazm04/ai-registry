---
layer: application
type: application
subject: remediation-roadmaps
technique: weighted-upside-ranking
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# Weighted upside ranking in a scoring engine (Ascent)

Ascent scans a repository, scores nine dimensions (`D1`..`D9`), and emits a
roadmap. The ranking lives in `src/lib/scoring/recommendations.ts` and the
projection math in `src/lib/scoring/projections.ts` (`projectedGain`); both run server-side in the
Next.js app and are pure enough to be unit-tested without a DOM.

## The catalog is closed, and the ranking selects from it

`CATALOG` in `recommendations.ts` defines `CATALOG: Record<DimensionId, RecTemplate>`
— exactly one entry per dimension, each with `title`, `impact`, `effort`,
`rationale`, and `explore`. The file's header comment states the design
directly: *"A deterministic catalog of 'next step' recommendations per
dimension"*, used by the keyless demo provider and as the fallback when the
model returns an empty roadmap. This is the catalog-over-generation choice
argued in the technique, and it buys exactly what the technique claims:
wording reviewed once, and identical inputs producing identical output.

## The ranking key

`buildFallbackRoadmap` is the whole ordering, in four lines:

```ts
.map((s) => ({ s, upside: (w[s.id] ?? 0) * (100 - scoreFor(s)) * effortFactor(CATALOG[s.id].effort) }))
.sort((a, b) => b.upside - a.upside)
.slice(0, 3)
```

`w` comes from `weightsFor(archetype)` — the **lens selection** rule. The
header comment names its purpose: steps are ranked *"under the repo's
archetype lens, so a solo repo is steered toward tooling/tests/docs rather
than org-scale CI it doesn't need yet."* All three factors are now in the key: weight, headroom (`100 - score`), and
effort as a multiplier.

**Deviation closed (2026-08-20, `d76dde0b5`, found open in the earlier read of this
file).** The key was `weight x headroom` alone, effort carried to display and
never ordering, so a `high`-effort item could outrank a `low`-effort one of
comparable upside. `effortFactor` now reads `IMPACT_RANK` (`impact.ts:9`, the
single ordinal authority) and discounts 10% per ordinal: low x1.0, medium x0.9,
high x0.8. The header comment states the choice the technique should carry: it
is a discount, not a division, because dividing by effort over-rewards trivia
and would push a dominant high-effort gap off a three-item list; at 10% per step
only items within about a fifth of each other reorder, and the accepted cost is
that a near-tie now ranks by cost, a judgment rather than a measurement. A gap
that leads by more still leads. An absent or drifted effort reads as `medium`,
neither rewarded nor punished.

## Rank on the number the reader is shown

The `blended` parameter and its doc comment (`recommendations.ts:120-130`)
are the upward lesson, recorded as a fixed incident (`G3-09`): ranking used
the pre-blend `signalScore`, so *"a dimension the blend lifted could
otherwise be surfaced as the #1 gap with a rationale citing a number never
shown next to it."* The fix threads the post-blend dimension scores in and
resolves through `scoreFor`, with a documented fallback to `signalScore` for
callers (the mock provider) whose signal score *is* the displayed score. The
rationale string then quotes that same number: `` `${name} scored ${scoreFor(s)}/100.` ``

## Drift degrades to a missing row

The filter in `buildFallbackRoadmap` runs before mapping:

```ts
if (CATALOG[s.id] && DIMENSION_BY_ID[s.id]) return true;
console.warn(`[recommendations] skipped unknown dimension id "${s.id}" (no catalog entry).`);
```

with the comment *"Drift becomes a missing row, never a TypeError."* A
persisted signal from an older schema, or a future detector, costs one row
and a warning instead of a crashed report. The same defensiveness runs through
`projectedGain` (`projections.ts`, moved out of `engine.ts` in a later refactor): unknown dimension id carries zero
weight, unknown archetype falls back to the org lens, absent target dimension
projects a zero-point gain.

## Determinism

The sort is a bare numeric comparator with no final identity tie-break, so two
dimensions with equal upside order by whatever the input array order happens
to be. Since the input is derived deterministically from the scan, output is
stable in practice — but the technique's rule (end the comparator in a chain
that cannot tie, on stable ids) is not structurally guaranteed here, and a
change to how signals are assembled could reshuffle equal-upside rows without
any score moving.

## The band linkage

Every emitted item carries `levelUnlock`,
derived through the shared `nextLevel` helper rather than by string
arithmetic — the comment records why: slicing and incrementing the id gives a
top-band repo *"a self-referential 'L5->L5'"* and a drifted id
*"...->LNaN"*. That is the same canonical-ordering rule the cheapest-path
technique states, applied to the per-item label.
