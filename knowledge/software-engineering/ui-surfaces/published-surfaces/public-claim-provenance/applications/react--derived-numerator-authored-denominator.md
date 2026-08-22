---
layer: application
type: application
subject: public-claim-provenance
technique: derived-numerator-authored-denominator
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Derived numerator, authored denominator — a public roadmap, as built here

The marketing site's roadmap section is the closest thing in this tree to a
worked example of the technique, including the module docstring that states
the doctrine out loud. It also contains the counter-example, two sections up
the same page.

## The declaration states both provenances in one block

`src/components/sections/roadmap/areas.ts:24-37` is the technique's sorting
question answered in prose, at the top of the file that holds both halves:

> Card *counts* are DERIVED from the real catalog/registry modules at build
> time (see `roadmap-area-counts.ts`, evaluated server-side) and passed into
> `buildAreas` as plain, serializable numbers — so this module never imports
> the heavy catalogs and they never reach the client bundle, while the numbers
> still can't drift from the shipped product. The *targets* those counts fill
> toward are aspirational roadmap goals with no data source, so they stay
> hand-authored here and are flagged inline.

The commitment half follows immediately, as one table with its own docstring
carrying the overflow invariant as a rule (`areas.ts:55-70`):

```ts
// "These are roadmap goals with NO data source, so they are hand-authored
//  (unlike the numerators, which are derived). Keep every target >= its live
//  count so a bar never overflows (value <= 1)."
const TEMPLATE_TARGETS = { DevOps: 40, Productivity: 35, /* … */ total: 210 } as const;
```

Both halves are visible on one screen, which is what the technique's step 3
asks for. The invariant is stated but **not asserted** — nothing fails the
build if `templates` grows past `TEMPLATE_TARGETS.DevOps`; the comment is the
whole mechanism.

## The fact half reads the shipped catalog, not a list beside it

`src/components/sections/roadmap/roadmap-area-counts.ts:6-15` names itself the
"build-time truth source" and imports the real modules the product ships from
(`templates`, `connectors`, `LANGUAGES`), reducing each to a scalar:
`templateTotal: templates.length` (`:41`), `connectors: connectors.length`
(`:44`), `localeTotal: LANGUAGES.length` (`:45`), plus per-category and
per-region counts through `countCategory` (`:17`) and `localeCount` (`:26`).
The export is a record of numbers — `AreaCounts` (`areas.ts:40-53`) has no
field that can hold a collection — which is the export constraint doing the
work the docstring describes.

Note the honest split inside `LOCALE_REGIONS` (`roadmap-area-counts.ts:19-25`):
the region→locale *grouping* is editorial and hand-written, and its comment
says so ("the per-region COUNT is derived"). Membership is a judgment; the
count over it is not.

## The split runs inside one bar

`areas.ts:118-126` is the finer seam the technique's per-value rule describes,
in three commented lines:

```ts
// Per-region `detail` counts are derived; the `value` (translation
// completeness) is hand-authored — the non-en bundles are known-incomplete,
// so there is no clean data source for coverage %.
{ label: t.bars.europe, value: 0.88, detail: localeDetail(counts.localesByRegion.europe), … }
```

The reason is real and falsifiable elsewhere in the tree:
`src/stores/i18nStore.ts:34-41` documents that the non-English bundles are
"incomplete and partly corrupt (double-encoded)" and gates the language
switcher behind an environment flag until they are repaired. That is a named
invisibility mechanism with an exit, not a shrug — exactly the label shape
`no-data-source-labelled-inline` asks for.

The same pattern recurs at `areas.ts:187-189`, where the connector count is
derived into the detail string and the `0.85` fill beside it is annotated as
the fulfillment target with no data source.

## A second, fully derived instance

`src/data/roadmap-phases.ts:39-44` derives an entire public progress claim from
one array:

```ts
export const completedCount = phaseCardData.filter((p) => p.completed).length;
export const totalPhases    = phaseCardData.length;
export const remainingCount = totalPhases - completedCount;
export const progressPercent = Math.round((completedCount / totalPhases) * 100);
```

`RoadmapProgress.tsx:23-26` states why that matters — "flipping a `completed`
flag now updates the public progress copy in lockstep with the phase grid" —
and the component then reads the same four values into the headline count
(`:27-29`), the percentage (`:49`), `aria-valuenow` and `aria-label` (`:54`,
`:57`), the CSS custom property driving the fill and the dot (`:59`, `:66`,
`:93`), and the pluralised prose branches (`:30-39`). One flag, six
renderings, no second door.

## Where the same page contradicts itself

Two deviations, both instances of the technique's own warnings:

1. **Prose counts escape the derivation.** The phase scopes live in the same
   module as the derived exports above, and two of them are typed counts:
   "Support for 15+ languages worldwide" (`roadmap-phases.ts:27`) and "40+
   service integrations built in" (`:30`). `LANGUAGES` holds fourteen entries
   (`i18nStore.ts:16-44`), so the sentence claims more than the catalog four
   lines of derivation away in the same file. Nobody sorted them because they
   did not look like values.
2. **The hero renders three provenances in one row.**
   `src/components/sections/HeroClient.tsx:37-42` builds `heroStats` from
   `connectorCount` — derived at build in the server component,
   `Hero.tsx:13` passes `connectors.length` into the client one, the technique's
   boundary in its smallest form — sitting between `liveStats.totalAgents` and
   `` `${liveStats.totalTemplates}+` ``, both of which come from
   `useLiveStats` and are marketing minimums (`api/stats/route.ts:91-101`),
   not counts. `totalTemplates` displays "120+" while the shipped catalog
   `templates` holds 57 entries — the number the roadmap section, on the same
   site, derives correctly. Identical typography, three provenances, nothing
   on screen separating them.

The fix for (2) is not a caveat: `connectorCount` already shows the shape.
Routing `totalTemplates` through `roadmap-area-counts.ts`'s existing
`templateTotal` would make the hero agree with the roadmap by construction and
delete a duplicate that currently disagrees by a factor of two.
