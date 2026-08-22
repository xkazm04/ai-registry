---
layer: application
type: application
subject: docs-content-model
technique: catalog-referential-invariants
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Catalog referential invariants — a Next.js guide surface, as built here

The marketing site's user guide is a typed catalog in exactly the three layers
the technique describes: `GUIDE_CATEGORIES` (`src/data/guide/categories.ts`,
11 categories), `GUIDE_TOPICS` (`src/data/guide/topics.ts`, 116 topic records),
and one body module per category under `src/data/guide/content/` (11 modules
plus an `index.ts` barrel). Both enforcement tiers exist. One of them is not
wired to anything.

## Tier one: the load-time throw, and what it can reach

`src/lib/guide-utils.ts:72-84` is a bare block at module scope:

```ts
// Build-time invariant: every GUIDE_TOPICS entry must reference a known category.
// Runs once at module load; throws fast in dev/build instead of silently shipping orphans.
{
  const categoryIds = new Set(GUIDE_CATEGORIES.map((c) => c.id));
  const orphans = GUIDE_TOPICS.filter((t) => !categoryIds.has(t.categoryId));
  if (orphans.length > 0) { … throw new Error(`[guide-utils] GUIDE_TOPICS references unknown categoryId(s): ${list}. …`) }
}
```

It covers the foreign key and nothing else, which is the technique's point
about the tier being *forced* rather than chosen. The bodies are behind
`contentModules` (`src/app/guide/[category]/[topic]/page.tsx:56-62`), a map
built by `Object.fromEntries(GUIDE_CATEGORIES.map(…))` whose values are
`() => import(\`@/data/guide/content/${c.id}\`)` — one lazily loaded chunk per
category. A load-time bijection assertion would have to await all eleven, and
the split exists precisely so nobody does that. `src/lib/guide-body-index.ts:3`
states the same boundary from the other side: it is "the ONLY module that
pulls in GUIDE_CONTENT (~136KB of Markdown)", and the search surface reaches
it only through a lazy import (`guide-search.ts:147`).

That `contentModules` map is also the technique's *make-the-assertion-
unnecessary* shape, and its comment says so (`:51-55`): derived from
`GUIDE_CATEGORIES` "so a new category cannot be added without also wiring its
content module."

## Tier two: the standalone check, and the failure text

`scripts/check-guide-content.mjs` is the bijection pass. Its header (`:1-16`)
is the clearest statement of the failure mode anywhere in the tree — "a topic
listed in `GUIDE_TOPICS` but missing from its category's content module
silently 404s — while `generateMetadata` still ships full SEO tags, the
sidebar advertises a dead link, and search indexes the orphan" — and the error
it emits (`:86-90`) carries that consequence rather than the absence:

```
Topic "<id>" listed in GUIDE_TOPICS (category "<cat>") has no entry in
content/<cat>.ts — page would 404 while metadata, sidebar, and search advertise it
```

The orphan direction is present too (`:93-99`), naming the unreachable key and
where it was registered. Both directions, one duplicate-id check (`:75-79`),
one foreign-key check (`:80-83`), and category-has-a-module (`:60-65`) — all
four assertions from the technique, plus the category layer.

The instrument is asserted, in the weak form: `parseCategories` throws on zero
categories (`:31`) and `parseTopics` throws on zero topics (`:42`), so a regex
that stops matching cannot report a clean corpus. Success spells its own
population — `"Guide content invariant OK — 11 categories, 116 topics, all
linked."` (`:107-109`).

## Deviation: the gate that runs nowhere

`check:guide-content` is declared in `package.json:28` and appears in
**neither** `.github/workflows/ci.yml` (which runs typecheck, lint, unit, two
i18n checks and `build`) nor the pre-commit hook `scripts/install-git-hooks.mjs`
installs (i18n coverage and encoding only). Its own header says "Designed to
run zero-dep in CI."

Nothing else closes the gap. The topic route declares no `generateStaticParams`
and the page carries the note *"Dynamic rendering (102 pages exceed SSG memory
budget)"* (`page.tsx:64`), so `next build` never resolves a single body module;
the load-time throw covers only the foreign key; and the visible symptom of a
missing body is a production 404 on a page the sidebar, the sitemap and search
all still list. The strongest invariant in the surface is the one nothing
executes — the standard stays: tier two belongs in the same job as `build`.

## Deviation: the check reads a proxy, not the registries

`parseCategories`, `parseTopics` and `parseContentKeys` (`:29-55`) regex over
the TypeScript source text rather than importing the modules — a deliberate
"zero-dep" trade, and a proxy nonetheless. `parseTopics` requires `id:` and
`categoryId:` on *consecutive lines*
(`/id:\s*["']([a-z0-9-]+)["'],\s*\n\s*categoryId:\s*["']([a-z0-9-]+)["']/g`),
so any reformatting that separates them drops topics from the walk silently.
The `length === 0` floors catch a total parse failure and not a partial one:
115 of 116 topics parsed reports "all linked" for a corpus it did not read.
The sibling coverage script shows the alternative in the same tree — it
imports through `pathToFileURL` (`scripts/check-guide-coverage.mjs:24`) rather
than pattern-matching source.

## Confirmed, incidentally: even a docblock's number rots

`src/data/guide/topics-nav.ts:10` states "`GUIDE_TOPICS` is ~57 KB of source."
Measured on this tree, `topics.ts` is 75,413 bytes — the figure is low by
roughly a third. The projection it justifies is more valuable than the comment
claims, which is the harmless direction, but it is the same defect the guide's
own layout comment was written to fix one file over.
