---
source: awesome-gpt-6-astra-games
kind: repository
url: https://github.com/MartinDelophy/awesome-gpt-6-astra
title: "Awesome GPT-6 Astra - a curated list of browser games built with one model, plus the showcase site that renders it"
author: MartinDelophy (with jackroc, stackloomdev and community submitters)
commit: 9c11be861df1b811132abea145ae08ae69d2a6d1
words: 2301 landing page / 4364 in-tree markdown of substance (38119 including twelve README translations) / ~900 lines of catalog and preview server code with 27 tests
extracted: 12
accepted: 3
declined: 0
leads: 2
already_covered: 5
untriaged: 3
applied: 2
shipped: 1
dispatched: 0
run_id: intake-gpt6-astra
siblings: 1
rescan_when: the catalog gains its first RPG or narrative entry (the one empty genre), or the website's parser grows a schema beyond heading vocabulary (a `schema` or `catalog.json` file appearing in the upstream repository); or 8 weeks elapse (2026-11-03)
---

# Awesome GPT-6 Astra

Mined as a repository from a clone at the commit above. The ledger had no prior
row. The board had one live sibling at claim, mining a **different** repository
with the same title (`Anil-matcha/awesome-gpt-6-astra`, distinct HEAD, distinct
author) and holding `model-routing`, `agent-instruction-files` and
`agent-runtime-assembly`; none of this run's homes overlapped, and one candidate
whose home was `agent-instruction-files` was deferred under V5 rather than
written beside them.

## Class and expected yield

**Reference index** by the ratio test - 52 outbound links over 2,301 words of
landing page, 33 of them to GitHub - but the references are *playable games*,
not documents, so the wave lane has nothing to read: a reference here is a demo
URL and a creator statement, and the strongest thing it can yield is a dated
fact about what one model built. The repository's own knowledge sits in two
places the class table does not predict: the **curation policy** (CONTRIBUTING,
the entry schema, the attribution grading) and the **showcase website** under
`website/`, a small first-party system with a design record of its own.
Expected yield stated before the table: **low** - one or two boundary
amendments from the website, catches for the curation policy, one lead for the
game bundle.

**Declared focus (round 41) applied.** The scorecard's closing paragraph asked
to rank sources by target density and to settle currency rows in the method;
this source's real home turned out to be a ten-technique subject
(`client-fetch-cache`) and a seven-technique one (`public-verdict-badge`), and
the currency row it produced was settled by opening the affected tree, not by
a dispatch.

## Tree sweep

Order followed: `website/README.md`, `website/AGENTS.md`, `website/design-qa.md`
(operating documents); `website/server/catalog.js`, `server/previews.js`,
`shared/catalog-client.js` (the instrument); `website/tests/*.test.js` (27 tests;
the failure taxonomy); `CONTRIBUTING.md`, the issue templates and the README
last. Twelve README translations were counted and not read. No measurement
directory exists.

## Design record (website - one system)

1. **decision:** read the upstream README at request time and parse it into
   the catalog; no build step, no curated array, no rebuild on a new entry.
   **forces:** the site's fork cannot connect its Git integration to the host
   (documented: "insufficient access"), so a code deploy is a manual CLI act
   and content freshness must not depend on it. **buys:** new entries appear
   within one refresh interval with zero maintenance. **rejects:** a build-time
   snapshot (kept only as the cold-start fallback). **where:**
   `website/AGENTS.md` ("new works must appear without manual content updates
   or a rebuild"), `server/catalog.js` `createCatalogService`. **stage:** the
   read path. **corpus:** `client-fetch-cache/swr-design` models the read
   policy fully - catch.
2. **decision:** an unrecognisable document never wipes the last good catalog;
   an explicitly empty one does. **forces:** the upstream is a human-edited
   Markdown file whose format can change without notice. **buys:** a format
   change degrades to `stale`, not to an empty site. **rejects:** treating any
   parse result as truth. **where:** `server/catalog.js` last lines of
   `parseCatalogMarkdown` and the `hasCatalogueStructure` flag; test "failed
   fetch or unrecognizable README keeps last successful catalogue". **stage:**
   the parse step, before the cache. **corpus:** `swr-design` names transport
   failure only; `public-verdict-badge/outcome-branched-cache` carries the
   discriminated `found/absent/error` outcome for a different surface.
   **Partial** - promoted to an amendment (row 2).
3. **decision:** a three-word status ladder, `stale` / `fallback` /
   `unavailable`, with `lastSuccessfulAt` carried from the previous value so a
   cold-start snapshot keeps its own success stamp. **forces:** serverless
   instances start cold constantly. **buys:** a reader can tell "true minutes
   ago" from "true at build time". **where:** `createCatalogService` catch
   branch; test "cold-start failure uses the shipped snapshot with its original
   successful timestamp". **stage:** failure handling. **corpus:** `swr-design`
   has the two-fact rule but not the third word - folded into row 2.
4. **decision:** the CDN receives only the origin cache's *remaining* TTL, and
   a stale response is `no-store`. **forces:** the host's edge cache is driven
   by a vendor directive, and a fixed `s-maxage` on a hit would start a second
   five-minute interval. **buys:** both tiers expire together; worst-case
   public staleness equals one interval, not two. **rejects:** a constant
   directive. **where:** `handleCatalog`, comment "A cached origin result must
   never start a second five-minute freshness interval"; test "CDN only
   receives the remaining origin TTL and cached reads keep checkedAt
   unchanged". **stage:** response construction. **corpus:**
   `outcome-branched-cache` § "Layers, and who obeys you" states that an
   emitted lifetime is an unretractable promise and stops there. **Partial** -
   promoted to an amendment (row 1).
5. **decision:** preview images resolve down a five-rung ladder (author image,
   verified local screenshot, page Open Graph, repository card, placeholder);
   a hit is cached 24 h, a miss 15 min; local screenshots improve display and
   never decide inclusion. **corpus:** `outcome-branched-cache` owns
   outcome-branched lifetimes and "only a genuine miss is negative-cached" -
   catch.
6. **decision:** entry identity is `hash(name, author)`, not the URL; dedupe
   is by canonical URL plus name. **corpus:** law `identity-survives-reuse`;
   `candidate-identity-and-staleness/content-addressed-document-identity` -
   catch, cross-bundle.

**Routing count:** one system; `corpus: NONE` per system = 0 (two partials,
four catches). No `HOME IF NEW` cluster. **Stay in intake; no handoff.**

## Triage table

Rows 1-2 are upper-layer rows and ran under the Phase 5 score. Row 3 is a
currency row and was admitted under the corroboration table (the run opened
the affected tree). Leads were admitted under the table. Vetoes: V5 on row 9.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | S | A served-from-cache response advises with its remaining lifetime | public-verdict-badge/outcome-branched-cache | corrects-claim (boundary) | partial -> real gap | 2/0/1 | **accept** (GAIN 1 boundary +1 convergence: RFC 9111 `Age`; RISK 0: tree, test and history read) |
| 2 | K | amendment | S | What counts as a failed revalidation: unrecognisable is failure, explicit empty writes through, fallback keeps its own stamp | client-fetch-cache/swr-design | corrects-claim (boundary) | partial -> real gap | 2/0/1 | **accept** (convergence: outcome-branched-cache's discriminated outcome and a fleet project's lint rule reached it independently; V2 satisfied by code read in a connected tree) |
| 3 | K | currency | S | Three public-verdict-badge applications cite a feature removed 2026-08-29 | public-verdict-badge (3 applications) | dates-application | real | n/a (table) | **accept** - verified_on moved to today with the removal stated; the exemplar also carried the row-1 gap (15-min report cache under a fixed 600 s directive) |
| 4 | K | application | M | Source-tree application for swr-design | client-fetch-cache | fills-stack-gap | real | n/a (v2 rule) | **accept** - `node--swr-design.md`, proof `ab-paired` in the tree's own harness |
| 5 | K | catch | - | Request-driven refresh, no visitor no fetch | swr-design revalidation triggers | none | likely catch | - | already covered |
| 6 | K | catch | - | Preview ladder with asymmetric hit/miss lifetimes | outcome-branched-cache | none | likely catch | - | already covered (confirmed by reading the technique) |
| 7 | K | catch | - | Attribution graded per entry: creator-confirmed / submitter-reported / awaits confirmation | recruiting/evidence-provenance-weighting/provenance-trust-ladder | none | likely catch | - | already covered, cross-bundle; convergence recorded, not linked |
| 8 | K | catch | - | "Catalog updated" records maintenance, not a re-play-test of every game | docs-sync/earned-verification-state | none | likely catch | - | already covered (use_when: "deciding what a freshness stamp on a document is allowed to mean") |
| 9 | K | amendment | S | Never ship the mock's example data; render only real upstream entries | demo-data-plane / agent-instruction-files | none | partial | V5 | **untriaged** - a live sibling holds `agent-instruction-files`; anchor `website/AGENTS.md` line "never ship the mockup's example projects" |
| 10 | P | practice | M | A design-QA record with `final result:`, evidence, fidelity surfaces, interaction verification | - | none | partial | not scored | **untriaged** - judgment lane; anchor `website/design-qa.md`; return when a second tree carries the same record shape |
| 11 | K | catch | - | Identity by content hash, dedupe by canonical URL plus name | law identity-survives-reuse | none | likely catch | - | already covered |
| 12 | K | amendment | S | A screenshot in the PR description is not read by the gallery; evidence must live where the machine reads | docs-sync/rendered-surface-coupling | none | partial | not read | **untriaged** - anchor CONTRIBUTING § "Display"; promoting question: does rendered-surface-coupling cover evidence *attached* beside the surface rather than rendered from it? |

**Admission cell:** `auto=2/0/0`, table-admitted 2 (currency, application),
`fp=0` - both scored rows survived Phase 6 and were applied.

## Corroboration

One fetch of three spent: RFC 9111 (HTTP Caching), §4 "a cache MUST generate an
Age header field ... equal to the stored response's current_age" and §4.2
`response_is_fresh = (freshness_lifetime > current_age)`. The source
re-implements the standard's `Age` arithmetic by shrinking `s-maxage`, because
the edge tier it targets is driven by a vendor directive; the amendment says
both forms. Row 2's corroboration was corpus-internal plus a connected tree: a
fleet project's lint config bans `catch { return null }` in loaders with a
recorded incident (an empty page pinned for a process lifetime), which is the
same rule at a different seam.

## Applied

| technique | project | mode | verdict | note |
| --- | --- | --- | --- | --- |
| swr-design (failed-revalidation boundary) | tracklight | **code** | **better** | Seam chosen to falsify: `journal.ts recover()` documents "Never rejects" as a deliberate choice. An unlistable journal directory returned `[]` and the caller returned `0`, byte-identical to a clean start. Paired: a new test fails before (0 diagnostics), passes after (1 for an unlistable dir, 0 for ENOENT). Suite 43/43. Shipped `4199407` on main. What survived the falsifier: ENOENT stays a genuine empty - the boundary is "could not look" vs "looked and found nothing", which is the amendment's own sentence. |
| outcome-branched-cache (layered lifetime) | ascent (history) | **simulation** (structural) | **unmeasurable** | No live fleet seam serves a lifetime-bearing origin cache through a CDN directive: goat computes its cached route per request, gravitone's hits are content-addressed. The corpus's exemplar in ascent history did carry the gap (15-min report cache, fixed 600 s directive, no `Age`), quantified at worst-case 25 min against a declared 10; the feature was removed before it could be fixed. Instrument that would measure it: any fleet route that memoizes a lifetime-bearing value and emits `s-maxage`; return when one appears. |

## Leads

- **What one model builds unassisted, by genre.** Sixteen browser games and one
  sandbox: arcade, puzzle, strategy and racing are populated, **RPG and
  narrative are empty** ("Waiting for the first game"), and every entry is a
  browser build. Attribution is creator-confirmed for five, submitter-reported
  for the rest. Return condition: when `game-production` gains a subject on
  model-assisted prototyping, or when a second curated index of model-built
  games exists to compare the genre distribution against.
- **The curator's boundary as a finding.** Inclusion requires a playable link
  plus a *creator statement* of the model's role, and the list explicitly does
  not rank by "how much AI"; concept art and trailers are excluded. That is a
  provenance policy for generated work stated by someone who had to enforce
  it. Return condition: when a second index states an inclusion policy for
  model-built artifacts, compare the two boundaries.

## Directions

`directions=0/0`. The design record has one system and its forces (an
un-owned upstream document, an edge cache the origin cannot invalidate) are not
admitted by any fleet project's `scope.does`; the fleet map's candidates for
`client-fetch-cache` are all `unknown`-state contexts, none absent. Gate skipped
(unattended).

## Cleanup

Scratch `<scratchpad>/intake-gpt6-astra/` deleted by name at Phase 9,
including the clone and the `node_modules` the paired proof installed.
