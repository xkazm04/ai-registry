---
layer: application
type: application
subject: i18n
technique: catalog-architecture
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# The section-locale pipeline — how this repo's React side realizes the catalog standard

The single source catalog is `src/i18n/locales/en.json` — 19,112 leaf keys
across ~60 top-level sections, plain JSON, human-edited. Thirteen sibling
locale files (`zh`, `ar`, `hi`, `ru`, `id`, `es`, `fr`, `bn`, `ja`, `vi`,
`de`, `ko`, `cs`) are derived translations of it, held at 0 missing / 0
extra / 0 untranslated by the gates described in
[`node--completeness-gates.md`](./node--completeness-gates.md).

> Re-checked 2026-10-31 at personas@22260d77: `en.json` now holds 27,648 leaf
> keys across 68 top-level sections, and since 2026-10-25 the app ships English
> only (`SHIPPED_UI_LOCALES`, `src/i18n/locales.manifest.ts:70`). The thirteen
> locale files are kept but no longer translated or gated, and have drifted to
> 103 missing / 37 extra each (see the sibling's re-check). The single-source
> catalog and the derivation below held.

## Derived artifacts and their regeneration

Everything else is codegen, wired into `predev`/`prebuild` via
`scripts/run-codegen.mjs`:

- `scripts/i18n/gen-types.mjs` → `src/i18n/generated/types.ts` — the typed
  key tree behind `t.section.key` autocomplete; renames and deletions break
  consumers at compile time.
- `scripts/i18n/split-locales.mjs` → `src/i18n/section-locales/<lang>/<section>.json`
  (one lazy chunk per non-English locale × section) plus
  `src/i18n/generated/enSectionStrings.ts`, which stores each English
  section as a **string parsed on first access**
  (`englishSections.ts:15-20`) so cold start no longer parses the full
  500KB+ English bundle.

  > Re-checked 2026-10-31 at personas@22260d77: English is now split like any
  > other locale. Only ~13 core sections (plus a partial first-paint subset,
  > `FIRST_PAINT_PARTIAL_SECTIONS`) stay eager as strings parsed on first
  > access (`englishSections.ts:61-71`); every other English section is its
  > own lazy chunk under `section-locales/en/`. The splitter also emits
  > `src/i18n/generated/sectionLoaders.ts`, an explicit
  > `import.meta.glob([...])` list of the shipped locales' chunks only.

The technique's "skippable codegen is a hole exactly the width of the
shortcut" clause is a scar here, not a hypothetical: `npx vite build`
bypasses all codegen tasks, and until 2026-08-16 the project docs claimed
the splitter still ran inside the bundler's `buildStart` — a workflow that
silently shipped stale translations. The corrected instruction is "run the
codegen driver first, or use `npm run build` which does it for you."

Note the generated-type boundary the technique draws: `types.ts` is
generated *from* `en.json`, so it constrains consumers against the catalog
but cannot constrain the catalog against backend vocabularies — the
`ai-compose` KPI token gap documented in
`docs/concepts/golden-paths/translation-completeness.md` sat behind fully
green types.

## Resolution: Proxy sections + per-section deep merge

`src/i18n/useTranslation.ts` implements the resolution layer:

- Section chunks are discovered by `import.meta.glob('./section-locales/*/*.json',
  { eager: false })` (`:27-29`) — each locale × section is its own async
  chunk, loaded through a once-retrying loader (`:94-113`). Re-checked
  2026-10-31 at personas@22260d77: the wildcard glob is gone; discovery reads
  the generated `sectionLoaders` (`useTranslation.ts:22`, header `:26-47`:
  the wildcard "bundled all 14 locales and put their 952 files into every
  Vitest import-graph walk"). The once-retrying loader is `loadSection`
  (`:108-155`).
- The `t` value is a per-language `Proxy` (`getBundle`, `:440-482`) whose
  `get` resolves a top-level section via `getResolvedSection` (`:411-436`):
  English section if the locale chunk isn't cached yet, otherwise
  `deepMergeSection(english, localized)` (`:346-363`) — locale value wins,
  English fills every gap at every depth, arrays replace wholesale, and the
  merged object is cached per `(lang, section)` for stable identity.
- Loads broadcast through `useSyncExternalStore` listeners (`:104-108`,
  `:262-274`), so components re-render when a section lands. (Re-anchored
  2026-10-31: `:484-499` and `:565`; the broadcast at `:141-150` now fires only
  when a read actually saw a fallback for that section, not on every landing.)

## The pure-read decision and its static gate

This codebase chose the technique's *pure-read* regime, and documents why
in place: the Proxy getter deliberately does **not** start section loads —
doing so "made every distinct top-level section accessed during a render
fan out into a fresh preloadSections call + listeners.forEach broadcast …
a render storm under language switch" (`useTranslation.ts:456-463`).
Loading happens only in `useTranslation`'s effect (for the active route's
sections) and `useLanguagePrefetch` (hover intent, `:302-333`).

That promotes `src/i18n/routeSections.ts` to a correctness dependency, and
its header says exactly that: "a section listed nowhere here is NEVER
fetched in a non-English locale … an undeclared section renders English
forever, in every locale, with no signal" (`:1-15`). The compensating
static gate the technique requires exists twice over:
`scripts/i18n/check-route-sections.mjs` and
`src/i18n/__tests__/routeSectionCoverage.test.ts` assert every section
referenced from source appears in the map (or is registered dead). The
`debt` entry in `BASE_SECTIONS` (`routeSections.ts:66-76`) is the cautionary
tale: before 2026-08-09 that section loaded on no route at all and rendered
English everywhere. (Since 2026-10-25 `debt` sits in
`FIRST_PAINT_PARTIAL_SECTIONS`, `routeSections.ts:92-99`; its comment keeps the
reason.)

## The named door for module-scope capture

The technique's "module-scope capture" trap has an enumerable door here:
`src/i18n/en.ts`, a back-compat shim whose `en` export is a Proxy
lazy-parsing English sections (`:75-92`). The ~48 modules that bind English
values at module init (store slices, constant tables) all import this one
shim, which makes the sites that cannot language-switch greppable — and its
header steers new code to `useTranslation()` / `getActiveTranslations()`
instead. Non-React modules get live resolution through
`getActiveTranslations()` (`useTranslation.ts:534-538`), which reads the
active language from the store at call time.

Re-checked 2026-10-31 at personas@22260d77: the shim now throws in DEV when
a non-core section is read before its chunk lands (`en.ts:55-73`), naming
`EN_TS_SYNC_SECTIONS` or a migration to `useTranslation()` as the fix — the
door is now loud as well as greppable. About 80 non-test files import it,
up from ~48.
