---
source: introducing-tin
kind: vendor release announcement (hybrid - its "why it is fast" half is a first-party design account)
url: https://planetscale.com/blog/introducing-tin
title: "Introducing TIN: full-text search for Postgres"
author: Eric Ridge, Patrick Reynolds (PlanetScale), 2026-09-16, errata 2026-09-20
words: 3534
extracted: 12
accepted: 1
declined: 0
already_covered: 2
untriaged: 6
leads: 3
dispatched: 0
applied: 2
shipped: 3
run_id: intake-tin-0923
siblings: 0
---

# An index is only as fast as what the query makes it visit

A vendor's post announcing a text-index extension for its hosted Postgres, with a
benchmark against three other in-database text indexes and a design section on why
it is fast. **Class: vendor release announcement**, with the design half read as a
first-party account (the authors built it). Expected yield, said before the table:
one currency signal, zero or one landing, the rest catches and leads, because the
corpus has an app-side indexing technique and no engine-internals subject. It held.
Zero siblings were live at claim; one (`intake-agora`, agent-operations) joined
mid-run and held no subject this run touched.

**The landing did not come from the source's prose or from its numbers alone.** The
source's benchmark put the in-core inverted index at 0.4 ranked queries a second with
a p99 near five minutes over 150 million documents, and out of memory on disjunctions.
Nothing in the corpus said why a text index could be that slow; the technique said an
index's cost "grows roughly with the result set". The seam hunt then found politicas,
whose measured rule (R9: index, 52-68x faster) was derived from one query shape -
`count(*)` of rare single terms - and is about to be applied to transcript and statute
corpora that will be searched ranked and with common words. So the finding was
measured there, in the project's own engine, before it was written: 0 of 3 fetches
spent, one paired experiment instead.

## Declared focus (from the scorecard)

"Before building the arms, check that the floor is readable from the same instrument
as the target." **Met by construction:** the floor was result equality between the
arms (identical counts and identical top-10 score lists), read by the same harness
that timed them. It held on 24 of 24 queries, on two runs. The row therefore could
reach `better` or `not-better`, not `unmeasurable`, and that was knowable before the
first run.

## The experiment (Phase 7.5, `experiment`, ab-paired)

Pre-registered: target = index-vs-scan speedup per query shape; prediction = ranking
collapses the speedup relative to counting; falsifier = ranked OR speedup within 2x of
single-term count. **The 20k smoke falsified the prediction as written**: for a given
query the contract split nothing (18.6x counting vs 17.9x ranking), and match
fraction alone drove the collapse. The corpus was also wrong for the question (random
token bags gave every AND and phrase zero matches) and was replaced with the
project's own replication method. At 200k both effects showed: match fraction sets
the curve, ranking halves it at each step once matches number in the thousands, and a
phrase costs its words' conjunction.

| matched | count(*) speedup | top-10 speedup |
| --- | ---: | ---: |
| 0% | 150-234x | 190-208x |
| 0.7-3% | 13-25x | 4-11x |
| 6-13% | 6-8x | 2-4x |
| 23-100% | 0.8-2.5x | 0.7-1.6x |

## Triage

Expected yield for the class said above. `G/R/C` per Phase 5; the rule each admitted
row ran under is named.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | Index cost follows what the query visits: result contract x query shape | se/ui-surfaces/data-display/search `full-text-indexing` | corrects-claim | real gap | 2/1/2 -> 2/0/2 | **accept** after a promotion read (see below); Phase 5 score |
| 2 | K | correction | M | Exhaustive-set and exact-count contracts beside "ranking is the product" | search golden path | none | likely catch | - | **already covered**: the golden path's Filter intent is exactly this (every matching row, counts matter, ranking wrong); the engine consequence folds into #1 |
| 3 | K | technique | M | Key an embedded index's postings on the host store's own row locator | none (search owns app-side; nothing owns engine internals) | new-technique | partial | 2/2/2 | lead (L1) |
| 4 | K | technique | M | Two-level page/offset bitmaps where per-page fan-out is bounded | none | new-technique | thin | 2/2/2 | untriaged |
| 5 | K | technique | M | Intersect index page bitmaps with the host's visibility bitmap for index-only counts | none | new-technique | partial | 2/2/2 | untriaged |
| 6 | K | technique | S | Disjoint page sets make a disjunction's count a sum of per-term counts | none | new-technique | thin | 2/2/1 | untriaged |
| 7 | K | technique | M | Segment merge by ownership transfer when ids need no renumbering | index-free-random-access (neighbour only) | new-technique | thin | 2/2/2 | untriaged |
| 8 | K | technique | M | A read benchmark without a paced writer cannot see writer starvation | none in software-engineering (llm-observability benchmark ops is the nearest, other bundle) | new-technique | partial | 2/3/2 | lead (L2) |
| 9 | K | technique | S | Report bytes read per query beside throughput (the neighbour's cost) | as #8 | new-technique | partial | 2/3/1 | untriaged |
| 10 | K | technique | S | Disclose per-arm resource handicaps in the result | llm-observability `handicap-disclosure-in-the-result-row` | none | likely catch | - | **already covered** (other bundle; the discriminator is the same, no link) |
| 11 | K | technique | S | No query log: sample real substrings and read each three ways | se/llm-agent/.../retrieval `retrieval-evaluation` (not opened) | none | partial | 1/2/1 | untriaged |
| 12 | K | currency | S | A GA in-database text index with ranked top-k and index-only counts exists (2026-09-16) | no application cites any in-database text index | resets-clock | - | - | lead (L3); corroboration table (currency alone), no clock to reset |

**Row 1 and the promotion read.** Before the experiment the row scored GAIN 2 (it
inverts "an index's query cost grows roughly with the result set" for three named
shapes) and RISK 1 (the source's numbers plus training-data convergence - an index
without score-bounded pruning must visit every match to rank - but not re-checked in
a tree): `G-R = 1`, below the +2 threshold. Its only blocker was the unre-checked
premise, so one measurement was spent instead of one file read; the promotion read
names a file read, and this is a stretch of it, recorded as such. The director
measured it in the project's engine, the floor held, RISK fell to 0, and the row
cleared. The landing appends: every standing sentence in the technique stays true.

**Admission** `auto=1/8/0`, `fp=0`. Rows 2 and 10 were catches; row 12 ran under the
corroboration table, not the score.

## Landed

- **Amendment** - `knowledge/software-engineering/ui-surfaces/data-display/search/techniques/full-text-indexing.md`,
  new section "The index is only as fast as what the query makes it visit" + a
  `use_when` entry; one clause in the golden path's technique list. Registry
  `3952ec2f`, generated artifacts `9d09302f`.
- **Application** - `.../search/applications/node--full-text-indexing.md` against
  politicas `74eb3c0`: `applied: experiment`, `ab_verdict: better`, `proof: ab-paired`,
  7 of 7 anchors held under `check-anchors`.

## Shipped (not pushed)

- politicas `75aa6d3` - `scripts/db-bench/fts-contracts.ts` + guide case #3b + rule
  R11a (R9's speedup holds for rare terms; measure the real query mix before a big
  ingest).
- politicas `74eb3c0` - **a fleet finding the seam hunt produced, not the source.**
  The registry's consult-check hook in politicas crashed on every commit and reported
  green: lefthook substitutes `$` and `${` in a `run:` line itself, so
  `${AI_REGISTRY_DIR:-../ai-registry}` reached node as `:-../ai-registry/...`, and the
  inner `|| true` hid the MODULE_NOT_FOUND. The 2026-09-21 wrap that stopped it
  blocking had left the check dead for three days. Moved to a lefthook script file
  (whose content lefthook does not expand; measured with the variable unset and set).
  Paired: A `MODULE_NOT_FOUND` + green, B `consult-check: nothing staged.`; floor
  (registry absent still passes) held.
- registry `7d152858` - the installer that printed the broken line now prints the
  script form; a test forbids a `run:` line in that guidance (fails against the old
  snippet). politicas `011244b` - its applied rows.

## Leads

- **L1 - host-locator postings.** An index embedded in a host store keys its postings
  on the host's physical row locator instead of a private sequential id: no
  translation per match, no renumbering at merge, heap-order fetch for free - at the
  price of indexing row *versions* and needing a liveness bitmap cleared by the host's
  reclaimer. The corpus's one app-side instance (an external-content index keyed on
  the host rowid) is the same decision at small scale. Return condition: a fleet
  project builds or tunes an index inside a host store, or a second source states it.
- **L2 - writer starvation is invisible to a read-only benchmark.** One engine held
  3.5 reads/s with and without a writer because continuous readers starved the writer
  (735 of a paced 600,000 updates in ten minutes). An unchanged read number under
  writes can be the failure, not robustness; report the writer's achieved rate beside
  it. Return condition: a performance-benchmark subject exists in software-engineering,
  or a fleet project benchmarks a mixed read/write store.
- **L3 - currency.** A GA text index with ranked top-k and index-only counts exists for
  hosted Postgres (2026-09-16). No corpus application cites an in-database text index,
  so no clock moved. politicas runs Postgres as WebAssembly, where the extension is not
  available; R11a names the engine question instead. Return condition: a fleet project
  runs server Postgres with a text-search seam.

## Untriaged (nobody verified these)

Rows 4, 5, 6, 7, 9, 11 above, with their anchors in the source's "Why TIN is fast" and
"Full results" sections. None carries a judgment. Rows 4-7 are engine internals with
no fleet consumer; 9 and 11 lack a home in this bundle.

## Fleet notes (seam hunt)

- politicas's typecheck does not include `scripts/db-bench/`: a clean `tsc` said
  nothing about the new harness (`--listFiles` shows 0 files there).
- On its first real run the fixed hook routed a hook script to
  `public-procurement-analysis` by path token - a plausible false match for
  consult-check's corpus router to look at, not verified here.
- The marketplace artifact is stale from `contest 1.4.1` (`aa8e8a0a`), not from this
  run; left to that skill's owner.
