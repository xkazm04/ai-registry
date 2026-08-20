---
layer: application
type: application
subject: grant-taxonomy-design
technique: deterministic-first-classification
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: deterministic-first classification in a grant research engine

How the grant-writing-nonprofits app (a Next.js/TypeScript grant platform for
nonprofits) realizes the deterministic-first stack — vocabulary, rulebook,
suppressors, and fallbacks — in `src/features/grant-research/`.

## The vocabulary spine (`taxonomy.ts`)

`taxonomy.ts:8` stamps `TAXONOMY_VERSION = "2026-07-23"` onto every
categorized row. Four orthogonal dimensions are plain `TaxonomyTerm[]`
(code + label) lists: `SECTORS` (:17-31), `BENEFICIARIES` (:33-41),
`FUNDER_TYPES` (:43-51), `MECHANISMS` (:53-60). Codes are append-only —
the file's header comment states the convention, and dated inline comments
mark each addition wave ("Added 2026-07-05 (sweep Phase 1) — the uncat
audits proved grants had no home here"). The one rename lives in
`SECTOR_MIGRATIONS` (:76-78): `research-sbir → research`, justified by a
corroborating comment (misnomer confirmed across 9 of 10 portal sectors,
~2,000 rows). `keepSectors` (:107) migrates **before** filtering so
historical tags normalize instead of dropping; `keepKnown` (:93-103) drops
unknown codes, de-duplicated, order-preserved — the honest-null filter every
layer's output passes through. The explorer UI derives all display labels
from these same lists (`grant-explorer/labels.ts:17-30`), and the facets
users browse — Sector / Funder / Support type / Serves — are exactly the
dimensions (`grant-explorer/search.ts:47-63`): the browse surface is the
taxonomy.

## The rulebook (`categorize.ts`)

`SECTOR_KEYWORDS` (:21-57) is the stem-based positive rulebook — leading
`\b`, no trailing `\b`, so "educat" catches educational/educator. The
pipeline in `categorize()` (:272-297) runs exactly the doctrinal order:

1. haystack = entity-decoded title + summary + eligibility (:277; decoder
   at :219-229 — the sweep found `&ndash;`/`&amp;amp;` leaking into titles
   and silently breaking matches);
2. positive match → `keepSectors`;
3. three sense suppressors (:280-282): `suppressEcoHealth` (:239-244,
   innocence check `HUMAN_HEALTH`, guilt check `ECO_HEALTH` — earned by a
   66% mis-tag rate on one regional source's health slice),
   `suppressSustainableEnv` (:251-256, bare "sustainab" with no
   `REAL_ENVIRONMENT` noun), `suppressEconomicResearch` (:263-270,
   "economic" + a research tag but no `REAL_ECONDEV` phrase);
4. `withAgencyFallback` (:206-214) — conservative blend: fills only an
   empty result, or enriches a solo weak "research" tag with the agency's
   real domain; genuine text sectors are left untouched;
5. EU programme-code map (:167-190) merged first for the source whose
   identifiers are authoritative;
6. mechanism defaults to `project-grant` when unstated (:291) — a
   documented universal default, the only dimension allowed one.

Deleted stems are as instructive as live ones: "academ" was removed (comment
at :31-32) after 16% of the education slice proved to be research-award
mis-tags, and `rural (development|communit)` was removed (:42-48) as
beneficiary-geography prose (~19% of the agriculture slice, cross-validated
twice) — both gaps deliberately covered by the agency fallback plus honest
nulls, never by re-broadening the stem. Every removal carries the
measurement, the date, and the analysis reference inline.

## Confirmations and upward lessons

The repo confirms the full technique: privileged deterministic layer,
measured suppressors, conservative fallbacks, migrate-then-validate,
version-stamped rows. Its upward lessons folded into the technique docs:
entity-decoding the haystack before matching; the "funder is not in the
haystack" trap (a top agriculture funder had to be spelled out in the agency
map at :144-145 because only its acronym was matched while the corpus spelled
it out); negative-lookahead stem narrowing (`health(?!ier|iest)` at :28,
which kept comparative eco-prose out of health); and the weak-bucket
treatment of a structurally over-firing generic "research" stem (:56,
ordered last, enrichable by the fallback at :210-212).
