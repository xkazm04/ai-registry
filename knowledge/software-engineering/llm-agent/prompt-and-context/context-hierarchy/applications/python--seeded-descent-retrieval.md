---
layer: application
type: application
subject: context-hierarchy
technique: seeded-descent-retrieval
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# Seeded descent over a three-tier context tree (OpenViking, Python)

How one production tree realises the descent, and where its own code and its own
documents disagree with each other. Citations are against `volcengine/OpenViking` at
commit `85b4923d06efc521f48298d5a7a076408cdd7d38` (2026-09-02, main); every line below
was re-opened at that commit before it was cited. The tree calls its tiers L0
(abstract, `.abstract.md`), L1 (overview, `.overview.md`) and L2 (the original file),
and addresses nodes by a `viking://` URI.

## The seed is a global search over the two summary tiers

`openviking/retrieve/hierarchical_retriever.py` is the whole descent. In the full
("THINKING") mode, `retrieve()` runs one vector search over the tenant with
`level=[0, 1]` — abstracts and overviews only — at `:221-229`, taking
`max(limit, GLOBAL_SEARCH_TOPK)` candidates (`GLOBAL_SEARCH_TOPK = 10`, `:58`). Those
directory hits are reranked against their abstracts when a rerank client is configured
(`:277-283`), deduplicated by URI, and become `starting_points` (`:285-292`). The
explicit roots for the query's context type are appended with score `0.0` (`:294-297`)
so a query that seeded nothing still descends from somewhere. The seed set is
therefore exactly what the technique asks for: a collapsed search over the summary
tiers, then a walk.

The query-only surface is the `QUICK` branch at `:175-217`: one `search_in_tenant`
call with whatever `level` the caller passed, a threshold pass, a dedup by URI keeping
the higher score, and a sort — no rerank, no queue, no child search. `mode` defaults
to `QUICK` whenever no rerank client is configured (`:127`), so an installation without
a reranker never descends at all. The typed sub-query planner that fronts the full
surface lives outside this file (`docs/en/concepts/07-retrieval.md:40-72` describes it:
zero to five typed queries, zero meaning chitchat and no retrieval).

## The walk: a max-heap, a visited set, parallel rounds, two stop conditions

`_recursive_search` (`:421-588`) is the queue. Starting points are pushed as
`(-score, uri)` (`:481-482`); each round pops up to `MAX_PARALLEL_CHILD_SEARCHES = 4`
unvisited nodes (`:59`, `:497-506`), searches their children concurrently with
`limit=max(limit * 2, 20)` (`:484-493`, the overfetch), reranks the children's
abstracts in THINKING mode (`:524-527`), and admits those above the threshold into
`collected_by_uri`, keeping the higher score on collision (`:529-547`). Interior
children — `level != 2` — are pushed back (`:554-556`); leaves are terminal.

Convergence is checked once per round (`:558-581`), with two stop conditions the
technique names: the top-`limit` URI set unchanged for `MAX_CONVERGENCE_ROUNDS = 3`
rounds (`:567-571`), or the collected pool size unchanged for three rounds
(`:572-576`). The result does not say which one fired, nor whether the queue simply
drained — a deviation from the technique's "say why the descent stopped".

## Score propagation is a knob whose default disables it

`final_score = alpha * score + (1 - alpha) * current_score if current_score else score`
(`:531-533`), with `alpha = self.score_propagation_alpha` (`:478`) read from
`RetrievalConfig.score_propagation_alpha` — `default=1.0`, documented as "1 uses only
the child score" (`openviking_cli/utils/config/retrieval_config.py:19-27`). The tree
ships propagation off. This is the confirmed reading behind the technique's rule; the
corpus still has no measurement of what any other value does.

## The dominance ratio is declared and never applied

`DIRECTORY_DOMINANCE_RATIO = 1.2  # Directory score must exceed max child score`
(`:57`) is the only occurrence of that name in the retriever, and a repo-wide search at
this commit finds no second use outside an evaluation dataset that quotes the class
attributes. Directories and leaves are collected into one pool and sorted by score;
nothing compares a directory's score against its best child's. The subject proposal
read the constant as behaviour; the code says it is an intention. Recorded here as a
deviation in the mild sense — the technique's rule is "declare it, default it off,
apply it only after measuring", and this tree has done the first two.

## Level addressing, and the ACL-forced second leaf search

`retrieve()` accepts `level: Optional[List[int]]` (`:110`, `:120`). In the full mode
the seed search is pinned to `[0, 1]` regardless (`:227`), the global directory hits
enter the result pool only when the caller asked for their level (`:299-307`, "Add
directory hits to the result pool only when explicitly requested"), and the walk
filters what it *collects* by level (`:542`) while still pushing every interior node
(`:555`). That is the technique's "traverse regardless, return what was asked".

The second leaf search is at `:235-257`: when the store's ACL is enabled for the
request and level 2 is eligible, a separate `level=[2]` search runs under the caller's
scope, is reranked, and is fed into the walk as `initial_candidates` (`:300`,
`:459-476`). The subject proposal's anchor for level addressing was "changelog
v0.3.18"; that entry (`docs/en/about/02-changelog.md:251-270`) does not mention a
level filter — the anchor did not hold, and the code above is the citation instead.

## The result carries its level, and the fallback is logged, not reported

`_convert_to_matched_contexts` (`:590-658`) stamps each hit with its `level`, rebuilds
the user-facing URI with the tier's sidecar suffix (`:660-672`), and strips summary
front matter from previews so bookkeeping never reaches the consumer (`:632-638`).
Rerank failure falls back to vector scores with a warning (`:398-419`) and the
`QueryResult` has no field saying so; `rerank_used` is recorded to the stats collector
(`:339-345`) but not to the caller. Under `failure-not-empty-success` that is a
deviation: the degraded mode exists and is honest internally, and the consumer cannot
branch on it.

## Reconciliation ledger

- **Confirmed**: global seed over tiers 0-1, explicit roots as zero-score seeds, heap
  descent with visited set, overfetch factor, per-round convergence on top-k or pool
  size, leaves terminal, level filter on collection not traversal, ACL-forced leaf
  search, propagation default off.
- **Deviation**: dominance ratio declared but unused; stop reason and rerank fallback
  not surfaced to the caller.
- **Upward lesson taken into the technique**: the pool-size stagnation stop (`:572-576`)
  — a descent whose top-k never fills to `limit` would otherwise never satisfy the
  "unchanged for three rounds" test, because `:567` requires `len >= limit`; the second
  stop is what terminates a sparse tree. The technique's step 5 carries both.
- **Anchor that did not hold**: changelog v0.3.18 for `level`.
