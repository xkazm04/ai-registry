---
layer: application
type: application
subject: retrieval
technique: relevance-floors
stack: node
verified_on: 2026-09-07
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The fallback that scores by query length (Node)

`memory-lancedb-pro` at `1a683cf5` runs a hybrid memory retriever whose lexical
lane is a LanceDB full-text index with a substring-scan fallback for the case
where the index is absent or throws. The fallback answers the same question
through different machinery and writes its answer into the same score field —
and two protections calibrated for the real index then fire on every one of its
hits. The version witness is the CI pin, `node-version: 22` throughout
`.github/workflows/ci.yml`.

## The two thresholds the real lane earns

The lexical score enters ranking twice, and 0.75 is the bar both times:

- **A fusion floor.** `fuseResults` (`src/retriever.ts:1353-1363`) computes
  `max(0.7·vector + 0.3·bm25, bm25 >= 0.75 ? bm25 * 0.92 : 0)`. A BM25 score at
  or above 0.75 sets a floor under the fused score that the weighted blend
  cannot pull down.
- **A rerank preservation floor.** `getRerankPreservationFloor`
  (`src/retriever.ts:1564-1576`) returns `score * 1.0` for `bm25 >= 0.75`,
  against `score * 0.5` for a weak lexical hit — so a strong exact match is
  held at full value against a cross-encoder that scored it low.

Both are correct and the reasoning is stated at `:1567-1568`: a reranker is
unreliable on symbolic queries — config keys, ids, environment variables,
tokens — and on mixed-language queries, which is exactly the traffic a memory
store sees. The real index earns this: BM25 is sigmoid-normalized as
`1/(1+exp(-raw/5))` (`src/store.ts:2021-2022`), so clearing 0.75 requires a raw
BM25 of about 5.49.

## What the fallback writes into the same field

`lexicalFallbackSearch` (`src/store.ts:2055-2122`) is used whenever the FTS
index is missing or throws (`:1983-1984`, `:2048`, `:2051`). It scores through
`scoreLexicalHit` (`:396-410`):

```
min(0.95, 0.72 + queryLength * 0.02) * weight
```

That number is monotone in the length of the **query** and carries no
information about the match. Any substring hit with a query of two or more
characters scores at least 0.76 — above both gates. On an FTS-less deployment,
"strong exact lexical hit" therefore means "the query string appears somewhere
in the text", and every such row receives the strongest guarantee the ranking
chain can issue: the fusion floor, and full protection from the reranker.

The lane is not silent about being degraded — the retriever tracks which lanes
ran and labels the slice. But the label travels to the consumer, and both
thresholds run upstream of the consumer and never read it. That is the gap the
technique's amendment is written from: labeling a substitute path is necessary
and is not sufficient when the substitute's *numbers* are consumed by threshold
logic.

## What calibrated the constants

One captured field incident and nothing else.
`test/retriever-rerank-regression.mjs:20-31` hardcodes `vectorSearch → 0.5438692121765099`
and `bm25Search → 0.7833663291840794` for query `TESTMEM-20260306-092541` — a
symbolic token, a 2026-03-06 date, full float precision, i.e. values lifted from
a live trace. The scenarios at `:85-91` are the two failure modes it fixed (the
reranker returning relevance 0; the reranker omitting the candidate), and
`:434-487` pins the `0.85 * 0.92 = 0.782` arithmetic. There is no recall@k
harness, no threshold sweep, and no fixture anywhere that removes the FTS index
and asserts what the floors then admit.

## Arm B: the fallback that emits no score at all

`personas` faces the same choice in its memory recall and resolves it the other
way. Its semantic term is blended multiplicatively —
`blended_value(value, similarity, w) = value * (1 + w * similarity)`
(`src-tauri/db/src/memory_recall.rs`) — and the module states the property as
load-bearing: a memory that is un-embedded, off-topic, or below the distance
floor is treated as similarity 0 and therefore scores *exactly* its value
score, ranking precisely as the value-only path would rank it. Under a non-ml
build the caller has no embedder, passes no similarity map at all, and "the
value-only fallback is byte-for-byte unchanged."

The paired reading: both trees have an optional lane and a fallback. One writes
a manufactured number into the primary lane's field, where two thresholds read
it as measured; the other makes the absence the multiplicative identity of the
blend, so the degraded lane cannot move the order in either direction. The
second is the stronger shape and it is what the amendment now prescribes —
"emit no score" alone would have been ambiguous about what the combining step
does with a missing value, and an additive blend answers that question badly by
contributing zero, which is indistinguishable from a measured zero.

Nothing shipped to `personas`: the seam is already correct, and the technique
text was revised from its arm rather than the reverse.

## What this realization cannot do

The claim that every fallback hit clears 0.75 is read from the scoring formula
and its call sites, not from a run: this application did not stand up an
FTS-less deployment and measure the resulting slice. The formula admits no
query of length 2 or more scoring below 0.76, so the conclusion is arithmetic
rather than observation — but the *consequence* for real recall quality, which
depends on how often a substring hit is genuinely irrelevant in this corpus, is
unmeasured and would need the recall@k harness the tree does not have.
