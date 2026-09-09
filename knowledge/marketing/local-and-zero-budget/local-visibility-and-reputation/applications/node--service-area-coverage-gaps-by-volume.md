---
layer: application
type: application
subject: local-visibility-and-reputation
technique: service-area-coverage-gaps-by-volume
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Service-area coverage gaps by volume - pure rollups in a Czech-market marketing workspace

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08, Node
24.x per `package.json` engines, CI pinned to 24.14.0) realizes the technique as a
small pure module, `src/lib/local/compute.ts`, consumed by an insights aggregator, a
colour ramp and a diagnosis prompt. The structural fact the tree proves: **the weak
rule is a separate figure, not a discount on the coverage ratio**, and the recommendation
reads *resolved* targets rather than a trade's sample matrix.

## The three figures, and the weak rule as its own count

`localSummary` (`src/lib/local/compute.ts:37-51`) computes exactly the technique's
trio. `withPage` is the count of targets with `hasPage`; `coverage` is `withPage /
total` guarded to 0 on an empty roster; `gapVolume` sums `monthlyVolume` over targets
without a page; and `coveredButWeak` at `:42` is

```ts
targets.filter((t) => t.hasPage && t.rank !== null && t.rank > 10).length
```

Three things the standard asks for are visible in that one line. The weak count is
computed *beside* coverage, not subtracted from it, so a 90%-with-twelve-weak business
is distinguishable from a 90%-with-none one. The `rank !== null` guard excludes
unobserved positions from the weak count rather than treating null as "worse than
ten" - not measured is not zero. And the boundary is `> 10`, the first-page convention
the technique labels; the code's own doc comment on the interface (`:31-33`) calls it
"ranking outside the top 10", which is the honest name for it.

`gaps` (`:55-57`) is the ordered queue: targets without a page, `monthlyVolume`
descending. Nothing else - no score, no blend of volume with difficulty - because
ordering is the one use the technique allows an ordinal volume.

## The bands are monotone and live in one place

`src/lib/local/tones.ts:12-17` maps a rank to a tone: `<= 3` positive, `<= 10` warning,
otherwise negative, with the comment "MONOTONE in severity so the color never
contradicts the data ... A higher (worse) rank must never look softer than a better
one." The file header explains why the ramp was extracted: six surfaces (ladder,
locations, pack, local module, reviews, inbox) had each copied it and drifted. That is
the technique's "one boundary, labelled, everywhere" realized as a single pure function
with a test, and the `<= 3` band is the one documented boundary (the pack) while
`<= 10` is the labelled convention.

## The recommendation reads resolved targets - an upward lesson

`src/lib/insights/aggregate.ts:381-393` builds the coverage recommendation from
`gaps(input.targets)[0]`, with the comment "from the project's RESOLVED targets, not
the hardcoded HVAC sample the leadgen branch used". The incident it records - a
locksmith's diagnosis naming a heating business's sample gap - became the technique's
step 1: the matrix is built from the business's own services and localities, never
from a trade's demo. The recommendation carries the pair's exact label, its volume
formatted per locale, and the volume as its sort weight.

Two neighbours on the same lines complete the picture. `:395-407` emits the weakest
tracked position only when `weakest.current > 3` - the pack boundary, not the first
page - as a *warning*, while the coverage gap is an *opportunity*; the two use
different thresholds because they answer different questions. And each local
recommendation is wrapped in `from(live.<seam>, ...)` (`:377-380`), so a project live
on reviews but not on the ladder gets a tagged rank recommendation next to an untagged
reviews one: provenance per signal, never per page.

## The diagnosis prompt: one gap, volume-first, from a closed set

`src/lib/ai/tools/local-diagnosis.ts:26-37` instructs the model to pick ONE coverage
gap, name it EXACTLY as labelled in the data (the `worstGap` field must be one of the
allowed names), weigh monthly volume ("a gap with higher monthly volume and no coverage
is usually ahead of a marginal one"), and recommend ONE action from a closed set of
three: deploy a local page plus listing, push a weak position into the top three, or
answer negative reviews. The deterministic fallback at `:237-251` picks the
highest-volume gap and appends a negative-review nudge only when `rec.negative > 0`,
and lists a pack-rate risk only when `packRate < 0.5` - a labelled convention in the
technique, here a literal constant.

## Where the tree falls short

The standard stays above the tree in two places. Volume enters `gaps` as a bare number
with no "not measured" state; a target with no lookup carries `monthlyVolume: 0` and
sorts last as if measured at zero, where the technique wants it labelled unmeasured.
And the recommendation's action for a gap is "deploy a local microsite" without the
doorway gate - which is correct for this subject's boundary (the page belongs to
`local-page-doorway-prevention`) but means nothing in this seam asks whether the
area passes the material test before the page is recommended.
