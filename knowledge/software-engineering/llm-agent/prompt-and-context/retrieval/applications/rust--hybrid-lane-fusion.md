---
layer: application
type: application
subject: retrieval
technique: hybrid-lane-fusion
stack: rust
verified_on: 2026-09-20
verified_against: rust@1.80.0
applied: code
ab_verdict: better
proof: ab-paired
---

# Hybrid lane fusion in the companion brain and the KB search path

The repo runs the technique twice, with two different fusion strategies
chosen for two different consumers — and both consume the same shared pure
primitives in `src-tauri/core/src/retrieval/mod.rs` (distance floor, model
filter, lane ranking, one FTS5 sanitization door).

## The companion recall bundle (`src-tauri/src/companion/brain/retrieval.rs`)

The module doc (`retrieval.rs:1-24`) is a compressed history of the standard
being learned the hard way. Three lanes feed each turn's recall:

- **Keyword (BM25 over an FTS index)** — runs in *every* build because it
  needs no embedder. The doc records what life was like without a
  query-dependent lane: the shipped build "returned the same N most-recent
  episodes and the same top-N facts on every single turn, with `doctrine`
  hard-coded empty" (`retrieval.rs:6-9`).
- **Vector (KNN)** — `ml`-gated, *layered on top of* the keyword lane, not
  replacing it. The union discipline is explicit at `retrieval.rs:360-364`:
  "Running both and unioning means the ml build is a strict superset of the
  non-ml build rather than an alternative to it" — the golden path's
  lane-addition rule, stated as a code comment. `union_keyword_ids`
  (`retrieval.rs:408-424`) appends keyword hits into the vector selection in
  rank order, deduped, capped, honoring exclusion sets.
- **Always-include tiers** (`retrieval.rs:77-89`) — top facts, active goals,
  top procedurals, open backlog. "Query-independent by design"; every cap is
  small and each constant carries a sentence of why.

**Budget, not quota** — the header section at `retrieval.rs:15-24` is titled
exactly that. Both paths target `RECALL_EPISODE_TARGET = 20` total episodes
(`:65`); the recency tail is sized from what the other lanes *actually
returned* (`with_recency_tail`, `:433-454`; the non-ml arm at `:357-359`),
after a real incident: the ml path once hard-coded a 5-turn tail assuming the
vector lane would add ~12, the vector lane contributed zero on an unembedded
corpus, and the "richer" build delivered *fewer* memories than the plain one.
`RECENCY_FLOOR = 6` (`:66-70`) is the standard's tier minimum: the last turns
of the live conversation always ride along, because losing the immediately
preceding turn to a well-matched older one would be the worse failure.

**Overfetch-then-split** — `VECTOR_OVERFETCH = 80` (`:55-60`): one KNN pull,
split by kind in app code via `rank_into_lanes` (`core/src/retrieval/mod.rs:146-165`),
"generous so kind-imbalanced corpora don't starve one tier". Doctrine gets a
dedicated kind-scoped scan (`retrieval.rs:198-210`) precisely because the
shared top-K starved it — a small, structurally distinct corpus losing every
seat to an episode-heavy one.

**Blind predicates re-imposed** — the vector lane filters on kind only, so
`load_episodes_by_ids` re-imposes the session filter in SQL
(`retrieval.rs:259-267`, `WHERE ... session_id = ?` at `:516-519`); the
comment names the leak it prevents: an episode from a *different*
conversation riding a similarity hit into this session's working memory.

**Fusion telemetry** — the `recall_distance` debug log (`retrieval.rs:247-256`)
emits per-lane counts, `dropped_far`, and the nearest distance: lane
provenance carrying its predicate.

## The KB search path (`src-tauri/src/commands/credentials/vector_kb.rs`)

`kb_search` (`vector_kb.rs:916-1136`) fuses differently — **reciprocal rank
fusion** (`rrf_rerank`, `:889-912`, the standard constant 60.0 with its
rationale inline) — because here the lanes are vector-canonical with BM25 as
a nudger, not co-equal. The ordering of stages is the transferable craft:

1. Overfetch ×3 from the vector index (`RERANK_OVERFETCH`, `:860-862`,
   clamped at `:979-981`).
2. **Floor before fusion** (`:984-995`): the shared
   `filter_by_distance_floor` runs on the vector pool *before* RRF "so BM25
   can't resurrect a semantically-unrelated chunk", and before truncation
   "so the caller learns how much noise was cut" — `floor_filtered` is
   returned in the response (`:998-1001`, `:1132-1135`).
3. BM25 ranks within the candidate pool only; every failure on the FTS side
   degrades to vector-only ordering with a warning, never a blocked search
   (`:1004-1061`).
4. **Filter-then-cut** (`:1063-1073` and `select_search_results`,
   `:1149-1212`): when a source filter selects a subset, the `top_k` cut
   happens *after* filtering, otherwise the caller gets "however many of the
   global top_k happen to live under that path" — usually a handful, often
   zero.

## Where it stops short of the standard (kept as standard; noted)

- **The sanitization door has three forks.** The unified
  `build_fts5_match_query` (`core/src/retrieval/mod.rs:247-270`, with
  stopwords, min-length, term cap, dedupe) coexists with the KB's own
  `build_fts5_query` (`vector_kb.rs:872-879` — whitespace split only, no
  stopword/length/count bounds) and a third in the execution search repo.
  The core module's own doc admits it: "Two private forks of this shape
  already existed... consolidating them is a separate, behavior-visible
  change."
- **No cross-lane convergence signal in the companion path.** `union_keyword_ids`
  dedupes an item surfaced by both lanes but discards the fact that two
  lanes agreed; RRF on the KB path gets this for free, the union on the
  companion path does not.
- **No fused-order eval.** Neither fusion strategy is measured against a
  labeled set or its own single-lane ablations (see the
  retrieval-evaluation deviation in the forge report).

## The lane union re-admitted what the store had retired (2026-09-20)

The version this section is verified against is witnessed by the workspace
manifest itself - its own `rust-version = "1.80.0"`, `edition = "2021"` and
`version = "1.1.0"` keys, read from the tree rather than assumed - and the
compile evidence below was produced against that manifest.

The union discipline quoted above - "the ml build is a strict superset of the
non-ml build" (`retrieval.rs:363`) - is stated as a *recall* guarantee, and it
is one. It is also, unqualified, the mechanism by which this tree undid its own
forgetting for as long as the vector build has existed.

Retirement here is always a demotion, never a delete: supersedence
(`semantic.rs:227`, `"UPDATE companion_node SET importance = 0, updated_at = ?1
WHERE id = ?2"`), the decay floor and cap enforcement all set the same column.
The keyword lane gates on it in SQL - `keyword.rs:285`, `"AND
companion_node.importance > 0"` - and the tree says in four places that this
settles the matter: `consolidation.rs:110` ("retrieval naturally filters
importance > 0"), `consolidation.rs:726` ("importance 0 is retrieval-ineligible
while the SQL"), and a test case at `consolidation.rs:1472` named `"aged out
means retrieval-ineligible"`.

The vector lane never applied it. The embedding table carries no such column
and the vector scan joins nothing (`embeddings.rs:369`, `"WHERE embedding MATCH
?1 ORDER BY distance LIMIT ?2"`), so the kind lookup that turns hits into lanes
resolved a kind for every row including the retired ones, and the lane ranker
ranked them. Union the two lanes and the superset includes the store's own
retirements, arriving by the one lane that never asked.

**The structural fact sits twelve lines from the defect, and it is what makes
this worth recording.** The same function already re-imposes a blind predicate
for episodes, with a comment naming the rule - `retrieval.rs:417`, `"Re-impose
the session filter here"` - and explaining that without it a semantically
similar episode from a different conversation would bleed into this session's
working memory. The author ran this technique's enumeration, found the
isolation predicate, and did not find the retirement one. Nobody was careless:
an isolation predicate is an argument the caller passes, so its absence is
visible at the call site, while a retirement predicate is a column a different
subsystem sets on a different clock, and nothing in the retrieval call mentions
it. The owning subsystem had meanwhile written down that it was already
enforced.

The test name is the second half of the same fact. `"aged out means
retrieval-ineligible"` asserts that the column is zero - the write half. It
passes identically on a build where no read path consults the column, which is
what this one was; per
[gate-sees-target](../../../../_laws.md#gate-sees-target), a guarantee about
retrieval is earned only by a retrieval.

**Proof.** One variable, a seeded store, both kind-lookup arms replayed against
it. Retired rows admitted to the vector lanes: **2 to 0**. Live rows admitted:
**4 and 4**, unchanged - the floor. Control: the keyword lane over the same
store admits 0 retired and 2 live in both arms, which is the known positive and
the asymmetry in one number. The retired row the old arm admitted was the
strongest topical match in the store, which is the shape of the damage: the lane
surfaces it *because* it is on point, and only the column it did not read says
the claim was withdrawn.

The fix is one predicate at the kind lookup rather than one per lane, because
the lane ranker skips any id whose kind did not resolve - so it covers the
episode, fact and procedural lanes and every lane added after them, which is
what the union demanded in the first place.

**What this realization cannot do.** The predicate is binary: a row is live or
retired, and nothing downstream can see that a retired row *would* have been the
best match. A store that wanted to adjudicate rather than exclude - to serve the
superseded value labelled with its successor - would need the retired row to
reach the reader carrying its status, which this shape deliberately forbids. The
trade belongs to the memory subject rather than to this one, and this tree has
chosen exclusion.
