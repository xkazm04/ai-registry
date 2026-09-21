---
layer: application
type: application
subject: copy-quality-gates
technique: length-and-render-budgets
stack: process
status: forged
verified_on: 2026-09-14
---

# Expansion measured, budgets absent: the 17% average and the 29% short strings under it (personas-web)

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14). The UI
catalog is `src/i18n/*.ts`: 1,663 English strings at that commit, 13 target
locales. Lengths are code points. They come from a read-only walk of every string
leaf, arrays included, compared key by key. The working tree that day also held a
sibling session's uncommitted block of 40 keys in `en`, `de`, `es` and `fr`, so both
readings are given where they differ.

## Expansion per locale

| locale | all strings, working tree | all strings, `35d557b` | non-identical only | sources of 10 characters or fewer |
|---|---|---|---|---|
| de | +16.7% | +16.9% | +19.5% | +29.3% |
| fr | +19.2% | +19.0% | +21.9% | +27.3% |
| es | +14.4% | +14.0% | +16.0% | +27.9% |
| ru | — | +12.0% | +13.6% | +28.5% |
| cs | — | +6.7% | +7.6% | +17.9% |

The same count gives `ar` −8.0%, `ja` −40.1%, `ko` −40.9% and `zh` −55.2%. Those are
the technique's warning in numbers. Full-width glyphs are wider per character, so a
negative character delta says nothing about fit.

## Where the expansion sits

Non-identical strings, banded by English length (`35d557b`). For each band: expansion,
then the share of strings more than 130% of the English length:

| band | de | fr | es | cs | ru |
|---|---|---|---|---|---|
| 1–10 | +29.3%, 39.7% | +27.3%, 41.7% | +27.9%, 39.2% | +17.9%, 32.7% | +28.5%, 41.0% |
| 11–20 | +15.9%, 23.7% | +24.7%, 38.5% | +19.4%, 29.0% | +8.6%, 18.4% | +14.2%, 25.8% |
| 21–70 | +16.0%, 23.8% | +18.4%, 28.2% | +12.9%, 20.2% | +5.6%, 12.6% | +10.0%, 18.2% |
| 71+ | +22.1%, 28.0% | +21.9%, 24.0% | +12.6%, 6.7% | +5.4%, 2.7% | +11.3%, 4.0% |

The short band runs 1.5 to 3.2 times the 21–70 band. The median short-string ratio is
only 1.2 in `de`, `fr` and `es`, so the published 200–300% lives in the tail:
- **48** German short strings exceed twice their source, **36** French and **36**
  Spanish.
- German: `leaderboardPage.trend.up` *Up* → *Steigend* (×4.0), `footer.terms` *Terms*
  → *Nutzungsbedingungen* (×3.8), `dashboard.errorBoundary.retry` → *Erneut
  versuchen* (×3.2), `leaderboardPage.metrics.speed` → *Geschwindigkeit* (×3.0).
- French: `leaderboardPage.trend.up` → *En hausse* (×4.5), `footer.legal` → *Mentions
  légales* (×3.2), `nav.changelog` → *Journal des modifications* (×2.78),
  `common.save` → *Enregistrer* (×2.75).

A single ratio factor sized to the +17% average would pass those labels. One of the
longest German short strings, `reviewsPage.focus.skip` = *Ăśberspringen*, is
double-encoded text rather than a translation. Corruption inflates a length
measurement too, and it was left out of the examples.

## No budget of any kind

- **The copy contract has no length field.** `docs/i18n/copy-contract.json` declares
  variant, sources, exclusions, dash, quotes, ellipsis, case, terms, rules and baseline
  (`:11-30`). None of them is a length or a surface.
- **The style guide has no length rule.** `docs/i18n/style-en.md` has none for length,
  characters or budgets.
- **The guide translation template bounds only the short side.** At `35d557b` it
  accepted a field "shorter than the English source" (`:219-221`) and set no bound on
  a longer one.

A length finding here would have nothing to cite.

## Clamps: 18 in the tree, 4 over catalog text

`line-clamp-2` or `-3` occurs 18 times under `src/` at `35d557b`. Tracing each clamp
to its text:
- **14 clamp English-only data:** dashboard mock data, connector summaries
  (`ConnectorCard.tsx:120`), `platform-layers/data.ts` (`Layer.tsx:96`),
  `healing-circuit/data.ts` (`StageDescription.tsx:38`), blog titles and the guide's
  topic lists.
- **4 clamp translated strings:**

| clamp | text | measured |
|---|---|---|
| `src/app/guide/guide-page/GuideCategoryGrid.tsx:112`, 2 lines | `t.guide.categoryDescriptions` (`src/app/guide/page.tsx:132`) | 11 strings: de +29.4% (max ×1.54, `companion`), fr +24.4% (max ×1.45), es +9.7%, cs +9.5% |
| `src/components/sections/feature-voting/components/FeatureVoteCard.tsx:79`, 2 lines | `t.featureVoting.features` | the block's 8 strings: fr +32.6%, es +30.8%, de +11.3% |
| `src/components/athena/sections/fleet-orchestration/variant-b/TaskCard.tsx:111`, 1 line, 2 from `md` | `t.athenaPage.fleet.tasks[].title` (`Field.tsx:57`) | `tasks[1].title`: en 27, de 37 characters |
| `src/components/mobile/MobileStatCard.tsx:50`, 2 lines at `text-[10px]` | `t.dashboard.successRate` and three siblings (`src/app/m/overview/page.tsx:92-110`) | `successRate`: en 12, fr 16, cs 15 |

A clamp is a rendered budget: a fixed box that clips. It is the one size decision the
tree already made, it was made against English, and its failure mode is the reverse of
the technique's. A rendered check produces an image nobody can dismiss. A clamp
produces an ellipsis nobody is shown.

None of this reaches users today. Language switching is off unless
`NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true` (`src/stores/i18nStore.ts:33-42`), so the
overflow is latent and arrives the day that switch flips.

## A truncating surface with one locale

`SITE_DESCRIPTION` (`src/lib/seo.ts:8-9`) is **191 characters**. It feeds
`src/app/layout.tsx:33`, `:70` and `:77`, and it is copied into
`src/app/homeJsonLd.ts:21`, where the copy carries a hyphen in place of the dash, so
the two have already drifted. Page metadata is English-only by recorded convention
(`docs/features/community/public-roadmap.md:71`).

This is the absolute-budget surface: a result snippet truncates. The source-side rule
applies with no targets at all, because the source is the only locale. The rule
cannot fire: without a declared cap there is no 85% to reach, and a finding would
enforce its author's guess.

## What the tree owes

1. **Declare a budget per surface.** Absolute for the meta description. Rendered, with
   each locale's shipped font stack, for the four catalog clamps. Banded ratio for the
   rest.
2. **Band the ratio by source length.** The measured short band is not the body band
   in any of the five Latin and Cyrillic locales above.
3. **Run the source-side check** on `SITE_DESCRIPTION` and on the English strings
   under the four clamps before any target is measured against them.
