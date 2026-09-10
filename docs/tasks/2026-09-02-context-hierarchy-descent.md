# Task: give `research-map` a descent over per-node abstracts

**Raised by:** intake run `intake-openviking-0902`, 2026-09-02, as the `task` apply row for the
`context-hierarchy` subject (`knowledge/software-engineering/llm-agent/prompt-and-context/context-hierarchy/`).
**Branch:** `intake-openviking-0902` (this file and the fixture are its first step).
**Status:** first step taken; not scheduled.

## The seam

`scripts/research-map.mjs` ranks a **flat** set of subject slugs and technique slugs against
the query's terms, with `--deep` reading each technique's `use_when`. It has no notion of the
tree it is ranking over: `taxonomy.json` is a containment hierarchy (bundle → category →
subcategory → subject → technique), every golden path opens with a paragraph that is a
node overview, and every technique carries a `use_when` that is a node abstract. The map
never reads the category or subcategory level at all, so a query whose concept lives one
level above any slug — "progressive disclosure", "derived artifact freshness" — returns
confident noise from another bundle.

That is the shape the new subject models: tiered summaries per node, descent from seeded
starting nodes, a dominance rule for returning the node instead of its children.

## The measurable

Top-3 hit rate over `scripts/fixtures/research-map-labeled-queries.json` — fourteen concept
queries an intake run actually issued, each with the subject a reader with the corpus open
says it should have surfaced, and the flat map's rank at baseline.

| arm | rows | top-3 hits | misses |
| --- | --- | --- | --- |
| A — flat slug map, `--deep`, 2026-09-02 | 14 | 8 | 6 |
| B — seeded descent over node abstracts | 14 | to be measured | |

Three of the six misses are the subject that did not exist at baseline and are expected to
become hits only through a node abstract (no slug will ever carry "progressive disclosure");
the other three are subjects that exist and were out-ranked by slug-word collisions in
other bundles. B must move the second group without regressing the eight hits, or the
descent is not earning its cost.

## The plan

Files touched, in order, with size:

1. `scripts/lib/node-abstracts.mjs` (new, ~80 lines) — build, from the working tree, one
   abstract per taxonomy node: for a subject, the golden path's first paragraph and the
   union of its techniques' `use_when`; for a subcategory or category, the concatenation
   of its children's subject abstracts, stably sampled at 32 children (the subject's
   `stable-sampling-for-wide-nodes` rule). Cached to the run's scratch directory, keyed
   by the index hash the catalog already carries, so a stale cache is detected not
   assumed.
2. `scripts/research-map.mjs` (~60 lines changed) — a `--descend` flag: seed with the
   existing flat ranking's top bundle/category nodes, then descend a priority queue of
   nodes scoring children by abstract term overlap, returning a node instead of its
   children only when the node's score exceeds the best child's by a dominance ratio
   (start at 1.2, the source tree's default, and say so in the output), stopping when
   the top-4 is unchanged for three rounds. Print the descent path per hit so a reader
   can see why a subject surfaced.
3. `scripts/research-map.test.mjs` (new, ~40 lines) — runs both arms over the fixture
   and prints the table above; fails if any baseline hit regresses.

Gate that sees it: `node scripts/research-map.test.mjs` on the fixture; `check-skills` is
unaffected. Size: about 180 lines across three files, one session.

## Condition under which the technique would not hold here

The subject's own boundary: descent pays only where the tree is an *interface* the reader
surveys. The registry's tree is exactly that (every skill walks taxonomy → subject → technique),
so the condition is met. It would not hold if the fixture's misses were all slug-word collisions
fixable by a stop-word list on the flat map — the cheaper fix, and the B arm's control. Run
that control first: if a stop-word list alone turns the three existing-subject misses into hits,
the descent is unearned for this tree and the row is `not-better`.

## First step taken

The fixture, with its baseline measured and recorded. Nothing in `research-map.mjs` changed.
