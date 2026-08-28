---
layer: application
type: application
subject: translation-pipeline-topology
technique: source-identical-value-audit
stack: process
verified_on: 2026-08-28
---

# Measuring the floor before the gate exists (marketing site, 13 target locales)

`personas-web` ships a typed message catalog — `src/i18n/en.ts` declares
`interface Translations` and the source values in one file, and thirteen sibling
modules each export `const <code>: Translations`. It has no untranslated-value
gate. That makes it the right tree to run the technique's bootstrap step on:
the measurement is uncontaminated by an allowlist someone already curated, so
the floor it reports is the natural one.

Read 2026-08-28. 1,506 string leaves in `en`, compared leaf-by-leaf against
each of the thirteen target locales.

## The checker is named for coverage and measures shape

`scripts/check-i18n-coverage.mjs` (`npm run check:i18n-coverage`) transpiles
each locale module, walks the English tree, and reports per key: wrong type,
wrong array length, missing key, and — the clause that matters —
`empty translation` when a string trims to zero length. It never compares a
target value against the baseline value.

So the repository's coverage instrument enforces precisely what
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
says coverage is *not*: keys present, values non-empty. Measured today it is
fully green — **0 missing keys across all 13 locales**.

The `empty translation` clause is the part worth transplanting as a warning.
An empty string is the one value a plain object catalog *could* have used to
mean "not translated yet"; forbidding it, on top of a structural type contract
that already forbids omitting the key, leaves copying the English text as the
only legal way to add a key ahead of its translation — which is exactly what
`docs/translation-handoff.md` instructed contributors to do while the dashboard
surfaces were being built out. The two gates together are airtight about shape
and silent about translatedness.

## The measurement, and the script boundary in the raw

Leaves byte-identical to `en`, out of 1,506:

| script | locales | identical | of total |
| --- | --- | --- | --- |
| non-Latin | `ar` 27, `bn` 27, `hi` 27, `ja` 29, `ko` 27, `ru` 28, `zh` 29 | 27–29 | 1.8–1.9% |
| Latin | `vi` 43, `es` 63, `cs` 64, `id` 81, `de` 103, `fr` 116 | 43–116 | 2.9–7.7% |

The two groups **separate perfectly** — the highest non-Latin count (29) sits
below the lowest Latin one (43) — on a catalog where every locale is fully
translated. A single global threshold over this table ranks `fr` as four times
worse covered than `ko`, which is backwards; the difference is entirely that
Czech, German, French, Indonesian and Spanish keep the source spelling of a
borrowed technical term while Arabic, Korean, Japanese and the rest
transliterate it.

Spot-checking the Latin residue confirms the class rather than a defect: `fr`
matches at `nav.menu`, `nav.guide`, `nav.blog`, `sections.faq`,
`common.total`, `dashboard.incidents`, `dashboard.messages`; `de` at
`nav.dashboard`, `nav.roadmap`, `common.status`, `dashboardUi.metricBudget`,
`leaderboardPage.metrics.tokens`; `cs` at `pricing.cloud`, `dashboardUi.agent`,
`healthPage.status.info`. Every one is the ordinary rendering in that language,
not a placeholder. Against that, the entire non-Latin residue above the shared
floor is **two keys each** — `ko` adds only `eventsPage.id` (`"ID"`) and
`roadmapSection.barAria` (`"{label}: {pct}%"`), `ar` only that same aria string
and `dashboard.home.upcomingRoutines.triggers.webhook`.

## The intersection is a clean allowlist seed, exactly as predicted

Keys identical in **all thirteen** locales: **25 — and all 25 are legitimate.**
No ruling was needed on any of them:

- **12 proper nouns** — the product name (×3 keys), `Gmail`, `Slack` (×2),
  `GitHub`, `Google Drive`, `Jira`, `Notion`, `Stripe`, `Figma`.
- **7 platform names** — `Windows`, `macOS`, `Linux` (each ×2 keys), `DevOps`.
- **3 initialisms** — `SLA` (×2), `stdout`.
- **3 pure-skeleton values** — `"P50 / P95 / P99"`, `"18 / 25"`, `"UTC+1"`.

That is the technique's step-2 claim landing on a tree that had never been
audited: intersect first, get classes 1–3 and nothing else, review it once at a
cost of twenty-five lines. The per-locale residue above it (200 keys identical
in at least one locale, versus 25 in all) is the part that needs termbase
rulings, and it is concentrated where the technique says it will be.

## One repository, both format answers

The same repo runs the *other* branch of the technique's opening question on a
different corpus. `src/data/guide/locales/<lang>/` is translated content whose
`_meta.json` records the source hash each topic was translated against, and
`scripts/i18n/check-guide-translations.mjs` flags drift by recomputing it — a
per-unit translation state that is **stored**, not inferred, with
`--strict` as a release gate. Translatedness and staleness there are read, not
guessed at, and the file cannot lie about which source revision it answers to.

The UI catalog has no equivalent because its format has nowhere to put one. The
contrast inside one tree is the cleanest argument the technique makes: the
comparison audit is a workaround for a format that cannot represent the fact,
and where the fact can be recorded it is recorded instead.

## What this tree owes next

- **No allowlist artifact exists yet.** The 25-key intersection above is the
  seed; the per-locale class-4 rulings are unwritten. Until both exist, the
  audit cannot become a gate — turning it on now would fire 200 findings with
  no reviewed floor to subtract, the failure mode the technique's step 4 names.
- **`docs/translation-handoff.md` is stale and reads as current.** It catalogs
  named dashboard surfaces as "still English placeholder in 13 non-en locales";
  the measurement above shows those surfaces translated. It was written mid-pass
  and never retired. It is worth recording that this document, not the catalog,
  was the misleading artifact — the doc asserted a coverage state the tree had
  already left behind, and only counting settled it.
