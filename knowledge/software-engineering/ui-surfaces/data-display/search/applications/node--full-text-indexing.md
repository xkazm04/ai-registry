---
layer: application
type: application
subject: search
technique: full-text-indexing
stack: node
verified_on: 2026-09-24
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node — a measured index-or-scan rule that measured one query shape

`politicas` is a civic-data app on an in-process Postgres (compiled to WebAssembly,
run under Node 24; the witness is the `node:sqlite` import and the `node 24` note in
its own benchmark header). It had already done what most trees never do: it
benchmarked index against scan before choosing, wrote the result down as a numbered
case, and derived rules from it. Citations are against politicas at `74eb3c0`
(2026-09-24), the commit after the one that landed the second case described below.

## What the tree decided, and from what

The first full-text case timed one query shape:
`scripts/db-bench/fts.ts:73 "select count(*)::int c from docs where to_tsvector('simple', title) @@ plainto_tsquery"`
over six whole-word terms (`scripts/db-bench/fts.ts:23 "const TERMS = ["`), each
matching 69 of 200,000 documents. From that it wrote a general rule,
`docs/db-architecture-guide.md:255 "R9 — For text search over more than a few-thousand rows, index — don't LIKE-scan."`,
quoted at 52–68× and carried into the plan for the corpora it has not ingested yet —
parliamentary transcripts and a full statute corpus, which will be searched with
common words, phrases and ranking. The rule was right about the shape it measured and
silent about every other one, which is the situation this technique's section on
what a query makes the index visit describes.

## A and B

`scripts/db-bench/fts-contracts.ts` holds corpus, column and engine fixed and varies
only the query. Arm A seq-scans a stored text-vector column with index-assisted plans
disabled (`scripts/db-bench/fts-contracts.ts:86 "set enable_bitmapscan = off; set enable_indexscan = off;"`);
arm B is the same column under an inverted index. Two contracts — `count(*)` and a
ranked top-10 (`scripts/db-bench/fts-contracts.ts:68 "const TOP10 = `select id, ts_rank_cd"`)
— over 24 queries: six single terms across the document-frequency range, and six
two-to-three-word runs sampled from real sentences, each read as AND, OR and phrase.
The corpus is the tree's 141 committed bill summaries replicated to 200,000, the same
replication the first case used, so match fractions are those of real text.

- **Target:** the index's speedup over the scan, per query shape.
- **Floor:** both arms return identical counts and identical top-10 score lists. It
  is read from the same instrument as the target, so the row could not end
  `unmeasurable` for want of a second one. **Held on 24 of 24 queries, on two runs.**

| fraction of documents matched | count(*) speedup | top-10 speedup |
| --- | ---: | ---: |
| 0% (the first case's regime) | 150–234× | 190–208× |
| 0.7–3% | 13–25× | 4–11× |
| 6–13% | 6–8× | 2–4× |
| 23–100% | 0.8–2.5× | 0.7–1.6× |

A phrase of two common words matching 1.4% of documents ran at 0.9–1.4×, because the
two words co-occurred in 51%; ranked top-10 over an OR that matched every document
took 680–740 ms at 200,000 and grows with the corpus.

The seam was chosen to falsify. The prediction written before the run was that
ranking would collapse the speedup *relative to counting*; the first smoke run said
the contract split nothing for a given query and that match fraction alone drove the
collapse, and the full run then showed both — match fraction sets the curve, and
ranking halves it again at each step once matches number in the thousands. The
finding held, in a corrected form, and the correction is what the technique now says.

## What shipped

The case and a bounded rule landed in the tree:
`docs/db-architecture-guide.md:121 "### Case #3b: full-text speedup by query shape"`
and `docs/db-architecture-guide.md:264 "R11a - R9's speedup holds for rare terms only; measure the query mix before a big"`.
The rule does not move the tree off its engine. It moves the question — ranked search
over common words at transcript scale — out of the default and in front of the ingest,
where the harness can answer it with the real queries in an afternoon.

## What this realization cannot do

- **It measures one engine class.** Both arms are an index without score-bounded
  pruning and without index-only counts. The alternative the technique names — an
  index that stops early or counts from its own structure — was not benchmarked, so
  the tree knows where its default stops working, not what replaces it.
- **Absolute times are not portable.** The engine is single-threaded WebAssembly; a
  native server with parallel workers moves every millisecond, though not the shape of
  the curve, which is a property of how much each query visits.
- **The corpus is repetitive.** 141 texts with a 571-word vocabulary, replicated. Match
  fractions are real; the long tail of a real transcript corpus is not, and the rare
  end of the curve will be longer there.
- **Nothing type-checks the harness.** The benchmark directory sits outside the
  project's compiled program, so a clean typecheck says nothing about it; the lint
  pass and the run itself are its only gates.
